
'use server';
/**
 * @fileOverview An AI flow to generate a list of quests based on user goals.
 *
 * - generateQuests - A function that handles the quest generation process.
 * - GenerateQuestsInput - The input type for the generateQuests function.
 * - GenerateQuestsOutput - The return type for the generateQuests function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { QuestCategory } from '@/lib/types';

const QuestCategorySchema = z.enum(["Mind", "Strength", "Code", "Wisdom", "Legacy"]);

const QuestSchema = z.object({
  id: z.string().describe("A unique identifier for the quest, e.g., 'q1', 'q2'."),
  title: z.string().describe("The title of the quest."),
  category: QuestCategorySchema.describe("The category of the quest."),
  xp: z.number().describe("The experience points awarded for completing the quest, between 20 and 150."),
  isCompleted: z.boolean().describe("The completion status of the quest, should always be false initially."),
  time: z.string().describe("A suggested time or duration for the quest, e.g., '10 AM' or '30 min'."),
});

const GenerateQuestsInputSchema = z.object({
  goals: z.string().describe("The user's high-level goals for the day."),
});
export type GenerateQuestsInput = z.infer<typeof GenerateQuestsInputSchema>;

const GenerateQuestsOutputSchema = z.object({
  quests: z.array(QuestSchema).describe("An array of 5 to 7 generated quests."),
});
export type GenerateQuestsOutput = z.infer<typeof GenerateQuestsOutputSchema>;


export async function generateQuests(input: GenerateQuestsInput): Promise<GenerateQuestsOutput> {
  return generateQuestsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuestsPrompt',
  input: { schema: GenerateQuestsInputSchema },
  output: { schema: GenerateQuestsOutputSchema },
  prompt: `You are a productivity assistant for a gamified life app called LifeQuest. Your task is to transform a user's daily goals into a list of actionable "quests".

User's Profile:
- Name: Ansline
- Level: 12
- Persona: A high-performer balancing a demanding job in cybersecurity (NOC Manager), personal fitness, family, continuous learning (front-end development), and a side-business in women's health.

Quest Categories:
- Mind: Meditation, family time, relaxation.
- Strength: Gym, physical activities.
- Code: Programming, studying tech.
- Wisdom: Reading, learning new non-tech skills.
- Legacy: Career tasks, business development, networking.

Based on the user's goals below, create a list of 5-7 quests. Each quest should be specific, actionable, and aligned with one of the categories. Assign appropriate XP based on the quest's difficulty and duration. All quests should be generated with 'isCompleted' set to false.

User's Goals:
{{{goals}}}
`,
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
