// src/ai/flows/generate-storyboard.ts
'use server';
/**
 * @fileOverview Generates a storyboard from script analysis.
 *
 * - generateStoryboard - A function that handles the storyboard generation process.
 * - GenerateStoryboardInput - The input type for the generateStoryboard function.
 * - GenerateStoryboardOutput - The return type for the generateStoryboard function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStoryboardInputSchema = z.object({
  scriptAnalysis: z.string().describe('The script analysis result.'),
  frameDetails: z.array(z.string()).describe('Details of what should be in each frame.'),
});
export type GenerateStoryboardInput = z.infer<typeof GenerateStoryboardInputSchema>;

const GenerateStoryboardOutputSchema = z.object({
  storyboardFrames: z.array(z.string()).describe('Array of data URIs for storyboard frames.'),
});
export type GenerateStoryboardOutput = z.infer<typeof GenerateStoryboardOutputSchema>;

export async function generateStoryboard(input: GenerateStoryboardInput): Promise<GenerateStoryboardOutput> {
  return generateStoryboardFlow(input);
}

const storyboardFramePrompt = ai.definePrompt({
  name: 'storyboardFramePrompt',
  input: {schema: z.object({frameDetail: z.string()})},
  output: {schema: z.object({frameDataUri: z.string().describe("A photo representing the storyboard frame, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'.")})},
  prompt: `Generate a visual representation of the following scene description: {{{frameDetail}}}. The image should be in a cinematic style. Return the image as a data URI.
`,
});

const generateStoryboardFlow = ai.defineFlow(
  {
    name: 'generateStoryboardFlow',
    inputSchema: GenerateStoryboardInputSchema,
    outputSchema: GenerateStoryboardOutputSchema,
  },
  async input => {
    const storyboardFrames: string[] = [];

    for (const frameDetail of input.frameDetails) {
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: frameDetail,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });
      if (media?.url) {
        storyboardFrames.push(media.url);
      } else {
        console.warn('Failed to generate image for frame detail:', frameDetail);
        storyboardFrames.push(''); // Placeholder for missing image
      }
    }

    return {storyboardFrames};
  }
);
