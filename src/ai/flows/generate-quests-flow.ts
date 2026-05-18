
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

const EnergyLevelSchema = z.enum(["Low", "Medium", "High"]);

const QuestSchema = z.object({
  id: z.string().describe("A unique identifier for the quest, e.g., 'q1', 'q2'."),
  title: z.string().describe("The title of the quest."),
  category: QuestCategorySchema.describe("The category of the quest."),
  xp: z.number().describe("The experience points awarded for completing the quest, between 20 and 150."),
  isCompleted: z.boolean().describe("The completion status of the quest, should always be false initially."),
  time: z.string().describe("A suggested time or duration for the quest, e.g., '10 AM' or '30 min'."),
  energyLevel: EnergyLevelSchema.describe("The energy cost of this quest (Low, Medium, or High)."),
  projectId: z.string().optional().describe("The ID of the project this quest belongs to, if any."),
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


const CalendarEventSchema = z.object({
  summary: z.string(),
  start: z.object({ dateTime: z.string().optional(), date: z.string().optional() }),
  end: z.object({ dateTime: z.string().optional(), date: z.string().optional() }),
  description: z.string().optional(),
});

const GenerateQuestsInputSchema = z.object({
  goals: z.string().describe("The user's high-level goals for the day."),
  location: z.string().default('Mountain View, CA').describe("The user's current location."),
  activeProjects: z.array(ProjectSchema).optional().describe("A list of the user's active projects from their Project Vault."),
  calendarEvents: z.array(CalendarEventSchema).optional().describe("A list of imported calendar events."),
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
    async ({ location }) => {
        return await getCurrentWeather(location);
    }
);

const prompt = ai.definePrompt({
  name: 'generateQuestsPrompt',
  model: googleAI.model('gemini-2.5-flash'),
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

For each quest:
1. Assign an 'energyLevel' (Low, Medium, High). For example, "Gym" is High, "Meditation" is Low, "Quick Email" is Low, "Deep Work" is High.
2. If the quest is derived from one of the 'activeProjects', set the 'projectId' to match that project's ID.

If the user's goals are vague or unstated, create a balanced set of starter quests across different categories, drawing inspiration from their active projects if available.

If 'calendarEvents' are provided, prioritize turning them into actionable quests. For example, a business meeting should be a 'Legacy' quest, a doctor's appointment a 'Mind' or 'Strength' quest, and a study group a 'Wisdom' quest.

IMPORTANT: To suggest weather-appropriate activities, you MUST call the 'getCurrentWeather' tool with the user's location, which is provided in the 'location' input field. Do not guess the weather.

User's Stated Goals:
{{{goals}}}

{{#if calendarEvents}}
Imported Calendar Events:
{{#each calendarEvents}}
- Event: "{{this.summary}}" ({{this.start.dateTime}}{{this.start.date}})
  Description: "{{this.description}}"
{{/each}}
{{/if}}

{{#if activeProjects}}
User's Active Projects (for additional context):
{{#each activeProjects}}
- Project ID: "{{this.id}}"
  Title: "{{this.title}}"
  Description: "{{this.description}}"
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
