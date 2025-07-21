
'use server';
/**
 * @fileOverview An AI flow to generate a user title and avatar based on their activity.
 *
 * - generateProfileCustomization - A function that handles the generation process.
 * - GenerateProfileCustomizationInput - The input type for the function.
 * - GenerateProfileCustomizationOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { QuestCategory, Quest, UserProfile } from '@/lib/types';

const QuestCategorySchema = z.enum(["Mind", "Strength", "Code", "Wisdom", "Legacy"]);

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
        gym: z.number(),
        meditation: z.number(),
        code: z.number(),
    })
});

const GenerateProfileCustomizationInputSchema = z.object({
  profile: UserProfileSchema.describe("The user's profile data."),
  completedQuests: z.array(QuestSchema).describe("A list of the user's recently completed quests."),
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
    input: { schema: GenerateProfileCustomizationInputSchema },
    output: { schema: z.object({ title: z.string() }) },
    prompt: `You are a creative assistant for a gamified productivity app. Your task is to generate a cool, inspiring title for a user based on their profile and recently completed quests.

User Profile:
- Name: {{{profile.name}}}
- Level: {{{profile.level}}}
- Streaks: Code ({{{profile.streaks.code}}} days), Gym ({{{profile.streaks.gym}}} days), Meditation ({{{profile.streaks.meditation}}} days)

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
    const titleResponse = await titleGenerationPrompt(input);
    const title = titleResponse.output?.title;
    if (!title) {
        throw new Error("Failed to generate a title.");
    }

    // 2. Generate the avatar
    const imageGenerationPrompt = `Generate a fantasy-style character avatar for a productivity app profile. The character should be a stylized, slightly abstract representation, not a photorealistic person.

The character's title is: "${title}".

Incorporate visual elements that reflect this title. For example:
- For "Code Samurai", maybe a character with a glowing keyboard and a warrior stance.
- For "Mindful Master", a serene character surrounded by calm energy.
- For "Cyber-Athlete", a dynamic figure with circuits and athletic gear.

The style should be modern, vibrant, and inspiring, with a dark, fantasy, epic theme. It's a profile picture. Focus on the bust/headshot. Centered. Epic lighting.`;
    
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: imageGenerationPrompt,
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    const avatarDataUri = media.url;
    if (!avatarDataUri) {
        throw new Error("Failed to generate avatar image.");
    }

    return {
      title: title,
      avatarDataUri: avatarDataUri,
    };
  }
);
