'use server';
/**
 * @fileOverview Scene generation AI agent.
 *
 * - generateScene - A function that handles the scene generation process.
 * - GenerateSceneInput - The input type for the generateScene function.
 * - GenerateSceneOutput - The return type for the generateScene function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSceneInputSchema = z.object({
  prompt: z.string().describe('The prompt describing the scene to generate.'),
  referenceImageUrl: z.string().optional().describe('An optional reference image URL (as a data URI) to maintain visual consistency.'),
});
export type GenerateSceneInput = z.infer<typeof GenerateSceneInputSchema>;

const GenerateSceneOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      'The URL of the generated image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type GenerateSceneOutput = z.infer<typeof GenerateSceneOutputSchema>;

export async function generateScene(input: GenerateSceneInput): Promise<GenerateSceneOutput> {
  return generateSceneFlow(input);
}

const generateSceneFlow = ai.defineFlow(
  {
    name: 'generateSceneFlow',
    inputSchema: GenerateSceneInputSchema,
    outputSchema: GenerateSceneOutputSchema,
  },
  async ({ prompt, referenceImageUrl }) => {
    
    const generationPrompt: (string | { media: { url: string } })[] = [prompt];

    if (referenceImageUrl) {
        generationPrompt.unshift({
            media: { url: referenceImageUrl },
        });
        generationPrompt.push('\nEnsure the characters and style are consistent with the provided reference image.');
    }
    
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: generationPrompt.join(''),
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    return {imageUrl: media.url!};
  }
);
