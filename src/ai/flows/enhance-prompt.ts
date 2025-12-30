'use server';

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

const EnhancePromptInputSchema = z.object({
  basicDescription: z.string().describe('A basic description of the scene to be enhanced.'),
});
export type EnhancePromptInput = z.infer<typeof EnhancePromptInputSchema>;

const EnhancePromptOutputSchema = z.object({
  enhancedDescription: z.string().describe('The enhanced description of the scene, enriched with cinematic descriptors.'),
});
export type EnhancePromptOutput = z.infer<typeof EnhancePromptOutputSchema>;

export async function enhancePrompt(input: EnhancePromptInput): Promise<EnhancePromptOutput> {
  return enhancePromptFlow(input);
}

const enhancePromptFlow = ai.defineFlow(
  {
    name: 'enhancePromptFlow',
    inputSchema: EnhancePromptInputSchema,
    outputSchema: EnhancePromptOutputSchema,
  },
  async (input) => {
    try {
      const resp = await ai.generate({
        model: googleAI.model('gemini-2.5-flash'),
        prompt: `You are a cinematic expert. Take the following basic scene description and enhance it with detailed cinematic descriptors, including lighting, camera angles, and mood, to create a more vivid and consistent image for storyboard generation.

Basic Scene Description: ${input.basicDescription}

Enhanced Description:`,
      });

      const text = (resp as any).text;
      if (!text) {
        throw new Error('No enhanced description generated');
      }

      return { enhancedDescription: text };
      
    } catch (error: any) {
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        throw new Error('AI quota exceeded. Please try again later or check billing.');
      }
      throw new Error(`Failed to enhance prompt: ${error.message}`);
    }
  }
);