
'use server';
/**
 * @fileOverview An AI flow to generate a personalized meditation script and audio.
 *
 * - generateMeditation - A function that handles the meditation generation process.
 * - GenerateMeditationInput - The input type for the generateMeditation function.
 * - GenerateMeditationOutput - The return type for the generateMeditation function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';
import wav from 'wav';

const GenerateMeditationInputSchema = z.object({
  prompt: z.string().describe("The user's request for the meditation, e.g., 'a 5-minute meditation for focus'."),
});
export type GenerateMeditationInput = z.infer<typeof GenerateMeditationInputSchema>;

const GenerateMeditationOutputSchema = z.object({
  script: z.string().describe("The generated meditation script."),
  audioDataUri: z.string().describe("The generated audio as a base64-encoded data URI."),
});
export type GenerateMeditationOutput = z.infer<typeof GenerateMeditationOutputSchema>;

export async function generateMeditation(input: GenerateMeditationInput): Promise<GenerateMeditationOutput> {
  return generateMeditationFlow(input);
}

// Helper function to convert PCM audio buffer to WAV format
async function toWav(
    pcmData: Buffer,
    channels = 1,
    rate = 24000,
    sampleWidth = 2
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const writer = new wav.Writer({
        channels,
        sampleRate: rate,
        bitDepth: sampleWidth * 8,
      });
  
      let bufs: any[] = [];
      writer.on('error', reject);
      writer.on('data', function (d) {
        bufs.push(d);
      });
      writer.on('end', function () {
        resolve(Buffer.concat(bufs).toString('base64'));
      });
  
      writer.write(pcmData);
      writer.end();
    });
}

const scriptGenerationPrompt = ai.definePrompt({
    name: 'generateMeditationScriptPrompt',
    model: googleAI.model('gemini-1.5-flash-latest'),
    input: { schema: GenerateMeditationInputSchema },
    output: { schema: z.object({ script: z.string() }) },
    prompt: `You are a world-class meditation guide. A user has requested a specific type of meditation. Generate a soothing, supportive, and well-structured meditation script based on their request. The script should be formatted with paragraphs for easy reading.

User Request:
{{{prompt}}}

Begin the script now.`
});


const generateMeditationFlow = ai.defineFlow(
  {
    name: 'generateMeditationFlow',
    inputSchema: GenerateMeditationInputSchema,
    outputSchema: GenerateMeditationOutputSchema,
  },
  async (input) => {
    // 1. Generate the meditation script
    const scriptResponse = await scriptGenerationPrompt(input);
    const script = scriptResponse.output?.script;
    if (!script) {
        throw new Error("Failed to generate meditation script.");
    }
    
    // 2. Convert the script to audio
    const ttsResponse = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Algenib' },
            },
          },
        },
        prompt: script,
      });

    const audioMedia = ttsResponse.media;
    if (!audioMedia) {
      throw new Error('No audio media returned from text-to-speech.');
    }

    // 3. Convert the PCM audio to WAV format
    const audioBuffer = Buffer.from(
        audioMedia.url.substring(audioMedia.url.indexOf(',') + 1),
        'base64'
    );
    const wavBase64 = await toWav(audioBuffer);
    const audioDataUri = `data:audio/wav;base64,${wavBase64}`;

    return {
      script: script,
      audioDataUri: audioDataUri,
    };
  }
);
