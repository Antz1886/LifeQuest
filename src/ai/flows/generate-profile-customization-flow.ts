
'use server';
/**
 * @fileOverview An AI flow to generate a user title and avatar based on their activity.
 *
 * - generateProfileCustomization - A function that handles the generation process.
 * - GenerateProfileCustomizationInput - The input type for the function.
 * - GenerateProfileCustomizationOutput - The return type for the function.
 */

import { ai, callWithRetry } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';
import { QuestCategory, Quest, UserProfile } from '@/lib/types';

const QuestCategorySchema = z.enum(["Personal", "Work", "Freelancing", "Mind & Body"]);

const QuestSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: QuestCategorySchema,
  xp: z.number(),
  isCompleted: z.boolean(),
  time: z.string(),
});

const UserProfileSchema = z.object({
    name: z.string(),
    level: z.number(),
    xp: z.number(),
    xpToNextLevel: z.number(),
    streaks: z.object({
        personal: z.number(),
        work: z.number(),
        freelancing: z.number(),
        mindBody: z.number(),
    })
});

const GenerateProfileCustomizationInputSchema = z.object({
  profile: UserProfileSchema.describe("The user's profile data."),
  completedQuests: z.array(QuestSchema).describe("A list of the user's recently completed quests."),
  avatarPrompt: z.string().optional().describe("A user-provided prompt to guide avatar generation."),
});
export type GenerateProfileCustomizationInput = z.infer<typeof GenerateProfileCustomizationInputSchema>;

const GenerateProfileCustomizationOutputSchema = z.object({
  title: z.string().describe("A creative and inspiring title for the user based on their activity."),
  avatarDataUri: z.string().describe("A data URI for the generated avatar image in PNG format."),
});
export type GenerateProfileCustomizationOutput = z.infer<typeof GenerateProfileCustomizationOutputSchema>;

export async function generateProfileCustomization(input: GenerateProfileCustomizationInput): Promise<GenerateProfileCustomizationOutput> {
  return generateProfileCustomizationFlow(input);
}


const titleGenerationPrompt = ai.definePrompt({
    name: 'generateProfileTitlePrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: GenerateProfileCustomizationInputSchema },
    output: { schema: z.object({ title: z.string() }) },
    prompt: `You are a creative assistant for a gamified productivity app. Your task is to generate a cool, inspiring title for a user based on their profile and recently completed quests.

User Profile:
- Name: {{{profile.name}}}
- Level: {{{profile.level}}}
- Streaks: Personal ({{{profile.streaks.personal}}} days), Work ({{{profile.streaks.work}}} days), Freelancing ({{{profile.streaks.freelancing}}} days), Mind & Body ({{{profile.streaks.mindBody}}} days)

Recently Completed Quests:
{{#each completedQuests}}
- "{{this.title}}" (Category: {{this.category}})
{{/each}}

Analyze the user's quest categories and streaks. If they are focusing on one area, give them a specialized title (e.g., "Code Samurai", "Mindful Master", "Cyber-Athlete"). If their activity is balanced, give them a more general high-achiever title (e.g., "Legacy Architect", "Ascendant Hero", "Quest Master").

Generate a single, epic title for the user.`
});


const generateProfileCustomizationFlow = ai.defineFlow(
  {
    name: 'generateProfileCustomizationFlow',
    inputSchema: GenerateProfileCustomizationInputSchema,
    outputSchema: GenerateProfileCustomizationOutputSchema,
  },
  async (input) => {
    // 1. Generate the title
    const titleResponse = await callWithRetry(() => titleGenerationPrompt(input));
    const title = titleResponse.output?.title;
    if (!title) {
        throw new Error("Failed to generate a title.");
    }

    // 2. Generate the avatar
    let avatarDataUri = "";
    try {
      // Construct a simple, direct prompt for the image generation model.
      const simpleAvatarPrompt = `Fantasy-style character bust, profile picture for a productivity app. Title: "${title}". ${input.avatarPrompt || ''}. Modern, vibrant, inspiring, dark, epic theme. Centered. Epic lighting.`;

      const { media } = await callWithRetry(() => ai.generate({
        model: googleAI.model('imagen-3.0-generate-002'),
        prompt: simpleAvatarPrompt,
        config: {
          responseModalities: ['IMAGE'],
        },
      }));

      avatarDataUri = media?.url || "";
      if (!avatarDataUri) {
          throw new Error("No media URL returned.");
      }
    } catch (imageError) {
      console.warn("Imagen avatar generation failed, falling back to Dicebear SVG avatar:", imageError);
      // Fallback: Use Dicebear Shapes SVG avatar based on the generated title
      avatarDataUri = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(title)}`;
    }

    return {
      title: title,
      avatarDataUri: avatarDataUri,
    };
  }
);
