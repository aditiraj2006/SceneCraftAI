'use server';
/**
 * @fileOverview Scene generation AI agent.
 *
 * - generateScene - A function that handles the scene generation process.
 * - GenerateSceneInput - The input type for the generateScene function.
 * - GenerateSceneOutput - The return type for the generateScene function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

const GenerateSceneInputSchema = z.object({
  prompt: z.string().describe('The prompt describing the scene to generate.'),
  referenceImageUrl: z.string().optional().describe('An optional reference image URL (as a data URI) to maintain visual consistency.'),
  characterDescription: z.string().optional().describe('An optional description of a character to include in the scene for consistency.'),
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
  async ({ prompt, referenceImageUrl, characterDescription }) => {
    
    let fullPrompt = prompt;

    if (characterDescription) {
        fullPrompt = `${characterDescription}. ${prompt}`;
    }
    
    const generationPrompt: (string | { media: { url: string } })[] = [fullPrompt];

    if (referenceImageUrl) {
        generationPrompt.unshift({
            media: { url: referenceImageUrl },
        });
        generationPrompt.push('\nEnsure the characters and style are consistent with the provided reference image.');
    }
    
    const placeholderSvgDataUri = (text = 'Image generation temporarily unavailable due to API quota.') =>
      `data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg xmlns='http://www.w3.org/2000/svg' width='1024' height='576' viewBox='0 0 1024 576'>
          <rect width='100%' height='100%' fill='#111827' />
          <text x='50%' y='50%' fill='#ef4444' font-family='Arial, Helvetica, sans-serif' font-size='24' text-anchor='middle' dy='.3em'>${text}</text>
        </svg>
      `)}`;
      
    try {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image', // The valid image string verified from current API tables
        prompt: generationPrompt as any,         // Removed .join('') to properly pass Part[] reference image multimodal array
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });
      
      if (!media?.url) {
        throw new Error('Image generation returned no media URL');
      }

      return { imageUrl: media.url };
    } catch (e: any) {
      console.error('Image generation failed during API call:', e);
      const msg = (e && (e.message || e.toString())) || '';
      if (msg.includes('quota') || msg.includes('429') || msg.includes('limit: 0')) {
        return { imageUrl: placeholderSvgDataUri() };
      }
      throw e;
    }
  }
);
