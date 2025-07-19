// src/ai/flows/enhance-prompt.ts
'use server';

/**
 * @fileOverview Enhances a basic scene description with cinematic descriptors using an LLM.
 *
 * - enhancePrompt - A function that enhances the prompt with cinematic descriptors.
 * - EnhancePromptInput - The input type for the enhancePrompt function.
 * - EnhancePromptOutput - The return type for the enhancePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhancePromptInputSchema = z.object({
  basicDescription: z
    .string()
    .describe('A basic description of the scene to be enhanced.'),
});
export type EnhancePromptInput = z.infer<typeof EnhancePromptInputSchema>;

const EnhancePromptOutputSchema = z.object({
  enhancedDescription: z
    .string()
    .describe(
      'The enhanced description of the scene, enriched with cinematic descriptors.'
    ),
});
export type EnhancePromptOutput = z.infer<typeof EnhancePromptOutputSchema>;

export async function enhancePrompt(input: EnhancePromptInput): Promise<EnhancePromptOutput> {
  return enhancePromptFlow(input);
}

const enhancePromptPrompt = ai.definePrompt({
  name: 'enhancePromptPrompt',
  input: {schema: EnhancePromptInputSchema},
  output: {schema: EnhancePromptOutputSchema},
  prompt: `You are a cinematic expert. Take the following basic scene description and enhance it with detailed cinematic descriptors, including lighting, camera angles, and mood, to create a more vivid and consistent image for storyboard generation.\n\nBasic Scene Description: {{{basicDescription}}}\n\nEnhanced Description:`,
});

const enhancePromptFlow = ai.defineFlow(
  {
    name: 'enhancePromptFlow',
    inputSchema: EnhancePromptInputSchema,
    outputSchema: EnhancePromptOutputSchema,
  },
  async input => {
    const {output} = await enhancePromptPrompt(input);
    return output!;
  }
);
