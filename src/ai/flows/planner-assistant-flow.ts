'use server';
/**
 * @fileOverview Genkit AI flow for the Planner Assistant.
 */

import { ai, callWithRetry } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

const PlannerAssistantInputSchema = z.object({
  query: z.string().describe("The user's question or command for the planner assistant."),
  profile: z.any().describe("The user's current profile details (XP, Level, Streaks)."),
  quests: z.array(z.any()).describe("A list of the user's scheduled quests."),
  calendarEvents: z.array(z.any()).optional().describe("A list of imported calendar events."),
});

const PlannerAssistantOutputSchema = z.object({
  response: z.string().describe("The assistant's markdown response containing advice, plans, or analysis."),
});

export type PlannerAssistantInput = z.infer<typeof PlannerAssistantInputSchema>;
export type PlannerAssistantOutput = z.infer<typeof PlannerAssistantOutputSchema>;

export async function askPlannerAssistant(input: PlannerAssistantInput): Promise<PlannerAssistantOutput> {
  try {
    return await plannerAssistantFlow(input);
  } catch (error: any) {
    console.error("Error in askPlannerAssistant flow:", error);
    let errorMsg = "Unable to connect with AI assistant.";
    if (error?.message?.includes("429") || error?.message?.toLowerCase().includes("quota")) {
      errorMsg = "Google AI Studio API Key quota limit exceeded (429 Too Many Requests). Please check your AI Studio plan/billing, daily limits, or try again later.";
    } else if (error?.message?.includes("403")) {
      errorMsg = "Google AI Studio API Key is invalid or restricted (403 Forbidden).";
    } else if (error?.message) {
      errorMsg = `Google AI Studio Error: ${error.message}`;
    }
    return {
      response: `⚠️ **Planner Assistant Error**\n\n${errorMsg}`
    };
  }
}

const plannerPrompt = ai.definePrompt({
  name: 'plannerAssistantPrompt',
  model: googleAI.model('gemini-2.5-flash'),
  input: { schema: PlannerAssistantInputSchema },
  output: { schema: PlannerAssistantOutputSchema },
  prompt: `You are LifeQuest AI, a premium gamified personal productivity assistant and planner. Your goal is to help the user achieve their goals and manage their calendar effectively.

You have access to the user's profile, streaks, current quests, and Google Calendar events.

User Profile:
- Name: {{profile.name}}
- Level: {{profile.level}}
- Streaks: Personal ({{profile.streaks.personal}} days), Work ({{profile.streaks.work}} days), Freelancing ({{profile.streaks.freelancing}} days), Mind & Body ({{profile.streaks.mindBody}} days)

Today's/Upcoming Quests:
{{#each quests}}
- "{{this.title}}" [Category: {{this.category}}, Energy: {{this.energyLevel}}, XP: {{this.xp}}, Completed: {{this.isCompleted}}, Date: {{this.date}}, Time: {{this.time}}]
{{/each}}

Imported Calendar Events:
{{#if calendarEvents}}
{{#each calendarEvents}}
- "{{this.summary}}" (Starts: {{this.start.dateTime}}{{this.start.date}})
{{/each}}
{{else}}
None
{{/if}}

User Query:
"{{{query}}}"

Task:
Formulate a highly personalized, motivating, and actionable response in Markdown format. 
Keep it concise but detailed. Focus on being encouraging and gamified. 
- If the user asks to "Review my load for today" or similar: Analyze the energy load of their quests (High vs Low energy), point out conflicts with calendar events, and suggest an optimal order of execution.
- If they ask to "Plan Freelance quests": Suggest specific freelance quests they could add based on active events or gaps in their calendar.
- If they ask about "How is my balance?": Evaluate their breakdown between Personal, Work, Freelancing, and Mind & Body, recommending adjustments to avoid burnout.
- For general queries, answer them within the context of their LifeQuest journey, using gamified terms (XP, levels, quest logs, side quests).

Respond in JSON with a single 'response' string field. Use markdown inside the response string.`
});

const plannerAssistantFlow = ai.defineFlow(
  {
    name: 'plannerAssistantFlow',
    inputSchema: PlannerAssistantInputSchema,
    outputSchema: PlannerAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await callWithRetry(() => plannerPrompt(input));
    return output!;
  }
);
