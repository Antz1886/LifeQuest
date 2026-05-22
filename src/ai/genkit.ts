
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
});

/**
 * Helper utility to retry API calls on transient server errors (e.g. 503 Service Unavailable, 504 Gateway Timeout).
 */
export async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const errorStr = String(error?.message || error);
      const isTransient = errorStr.includes("503") || errorStr.includes("504") || errorStr.toLowerCase().includes("service unavailable") || errorStr.toLowerCase().includes("overloaded");
      if (isTransient && i < retries - 1) {
        console.warn(`[AI SDK] Transient error encountered (attempt ${i + 1}/${retries}): ${errorStr}. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      throw error;
    }
  }
  throw new Error("Failed after retries");
}
