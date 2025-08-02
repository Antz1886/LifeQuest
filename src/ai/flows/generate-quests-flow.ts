
'use server';
/**
 * @fileOverview An AI flow to generate a list of quests based on user goals and projects.
 *
 * - generateQuests - A function that handles the quest generation process.
 * - GenerateQuestsInput - The input type for the generateQuests function.
 * - GenerateQuestsOutput - The return type for the generateQuests function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';
import { QuestCategory, Project } from '@/lib/types';
import { getCurrentWeather } from '@/services/weather';

const QuestCategorySchema = z.enum(["Mind", "Strength", "Code", "Wisdom", "Legacy"]);

const QuestSchema = z.object({
  id: z.string().describe("A unique identifier for the quest, e.g., 'q1', 'q2'."),
  title: z.string().describe("The title of the quest."),
  category: QuestCategorySchema.describe("The category of the quest."),
  xp: z.number().describe("The experience points awarded for completing the quest, between 20 and 150."),
  isCompleted: z.boolean().describe("The completion status of the quest, should always be false initially."),
  time: z.string().describe("A suggested time or duration for the quest, e.g., '10 AM' or '30 min'."),
});

const ProjectTaskSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCompleted: z.boolean(),
});

const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  tasks: z.array(ProjectTaskSchema),
});


const GenerateQuestsInputSchema = z.object({
  goals: z.string().describe("The user's high-level goals for the day."),
  location: z.string().default('Mountain View, CA').describe("The user's current location."),
  activeProjects: z.array(ProjectSchema).optional().describe("A list of the user's active projects from their Project Vault."),
});
export type GenerateQuestsInput = z.infer<typeof GenerateQuestsInputSchema>;

const GenerateQuestsOutputSchema = z.object({
  quests: z.array(QuestSchema).describe("An array of 5 to 7 generated quests."),
});
export type GenerateQuestsOutput = z.infer<typeof GenerateQuestsOutputSchema>;


export async function generateQuests(input: GenerateQuestsInput): Promise<GenerateQuestsOutput> {
  return generateQuestsFlow(input);
}

const getWeatherTool = ai.defineTool(
    {
        name: 'getCurrentWeather',
        description: 'Get the current weather for a specified location to suggest weather-appropriate activities.',
        inputSchema: z.object({ location: z.string() }),
        outputSchema: z.string(),
    },
    async ({ location }) => getCurrentWeather(location)
);

const prompt = ai.definePrompt({
  name: 'generateQuestsPrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  input: { schema: GenerateQuestsInputSchema },
  output: { schema: GenerateQuestsOutputSchema },
  tools: [getWeatherTool],
  prompt: `You are a productivity assistant for a gamified life app. Your task is to transform a user's daily goals into a list of actionable "quests".

Quest Categories:
- Mind: Meditation, family time, relaxation.
- Strength: Gym, physical activities.
- Code: Programming, studying tech.
- Wisdom: Reading, learning new non-tech skills.
- Legacy: Career tasks, business development, networking.

Based on the user's goals and active projects below, create a list of 5-7 quests. Each quest should be specific, actionable, and aligned with one of the categories. Assign appropriate XP based on the quest's difficulty and duration. All quests should be generated with 'isCompleted' set to false.

If the user's goals are vague or unstated, create a balanced set of starter quests across different categories, drawing inspiration from their active projects if available.

IMPORTANT: Use the 'getCurrentWeather' tool to get the weather for the user's location, which is '{{{location}}}'. Suggest weather-appropriate activities based on the result. For example, if it's sunny, suggest an outdoor 'Strength' or 'Mind' quest. If it's rainy, suggest an indoor one.

User's Stated Goals:
{{{goals}}}

{{#if activeProjects}}
User's Active Projects (for additional context):
{{#each activeProjects}}
- Project: "{{this.title}}" - {{this.description}}
{{/each}}
{{/if}}
`,
  config: {
    safetySettings: [
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_ONLY_HIGH',
        },
        {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_ONLY_HIGH',
        }
    ]
  }
});

const generateQuestsFlow = ai.defineFlow(
  {
    name: 'generateQuestsFlow',
    inputSchema: GenerateQuestsInputSchema,
    outputSchema: GenerateQuestsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
