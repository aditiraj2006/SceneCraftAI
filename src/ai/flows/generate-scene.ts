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
    
    const placeholderSvgDataUri = (text = 'No Image') =>
      `data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg xmlns='http://www.w3.org/2000/svg' width='1024' height='576' viewBox='0 0 1024 576'>
          <rect width='100%' height='100%' fill='#111827' />
          <text x='50%' y='50%' fill='#9CA3AF' font-family='Arial, Helvetica, sans-serif' font-size='28' text-anchor='middle' dy='.3em'>${text}</text>
        </svg>
      `)}`;

    try {
      const resp = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-image'),
        prompt: generationPrompt as any,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      const media = (resp as any).media ?? (resp as any).output?.media;
      let imageUrl: string | undefined;
      if (Array.isArray(media)) {
        imageUrl = media[0]?.url;
      } else if (media && typeof media === 'object') {
        imageUrl = media.url;
      }

      if (!imageUrl) {
        console.error('Image generation returned no media URL', { resp });
        return { imageUrl: placeholderSvgDataUri('No Image Returned') };
      }

      return { imageUrl };
    } catch (e: any) {
      console.error('Image generation failed:', e);

      const msg = (e && (e.message || e.toString())) || '';
      if (msg.includes('quota') || msg.includes('Quota') || msg.includes('429') || msg.includes('billing')) {
        return { imageUrl: placeholderSvgDataUri('Quota Exceeded') };
      }
      if (msg.includes('401') || msg.includes('403') || msg.includes('Not Found')) {
        return { imageUrl: placeholderSvgDataUri('Auth/Model Error') };
      }

      throw e;
    }
  }
);
