
'use server';

/**
 * @fileOverview Trailer generation AI agent.
 *
 * - generateTrailer - A function that handles the trailer generation process.
 * - GenerateTrailerInput - The input type for the generateTrailer function.
 * - GenerateTrailerOutput - The return type for the generateTrailer function.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';
import { Scene, TrailerConfig } from '@/lib/types';


const GenerateTrailerInputSchema = z.object({
  scenes: z.array(z.any()).describe('An array of scene objects, including image URLs and narration.'),
  config: z.any().describe('The configuration for the trailer generation.'),
});

export type GenerateTrailerInput = z.infer<typeof GenerateTrailerInputSchema>;

const GenerateTrailerOutputSchema = z.object({
  videoUrl: z.string().describe('The URL of the generated trailer video.'),
});
export type GenerateTrailerOutput = z.infer<typeof GenerateTrailerOutputSchema>;

export async function generateTrailer(input: GenerateTrailerInput): Promise<GenerateTrailerOutput> {
  return generateTrailerFlow(input);
}

// Helper function to fetch and convert an image to a data URI
async function imageUrlToDataUri(url: string): Promise<string> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`Failed to fetch image ${url}. Status: ${response.status}`);
            return url; // return original if fetch fails
        }
        const contentType = response.headers.get('content-type') || 'image/png';
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        return `data:${contentType};base64,${base64}`;
    } catch (error) {
        console.warn(`Error fetching image ${url}:`, error);
        return url; // return original on error
    }
}


const generateTrailerFlow = ai.defineFlow(
  {
    name: 'generateTrailerFlow',
    inputSchema: GenerateTrailerInputSchema,
    outputSchema: GenerateTrailerOutputSchema,
  },
  async ({ scenes, config }) => {
    
    const imageScenes = scenes.filter(s => s.imageUrl);

    if (imageScenes.length === 0) {
        throw new Error("Cannot generate a trailer without at least one scene with a visual.");
    }
    
    const promptText = `
      Create a cinematic trailer video with a duration of ${config.length} seconds.
      The overall tone should be ${config.tone}.
      Use the following scenes in sequence. 
      Generate appropriate transitions between scenes to match the tone.
      ${config.includeMusic ? `Incorporate ${config.musicGenre.toLowerCase()} background music.` : ''}
      ${config.includeTextOverlays ? 'Include text overlays for scene titles or key narration moments.' : ''}

      Scenes:
      ${imageScenes.map((s, i) => `Scene ${i+1}: ${s.description}`).join('\n')}
    `;

    const promptMedia = await Promise.all(
        imageScenes.map(async (s) => ({
            media: { url: await imageUrlToDataUri(s.imageUrl) }
        }))
    );
    
    let operation;
    try {
        const genAIGeneration = await ai.generate({
          model: googleAI.model('veo-2.0-generate-001'),
          prompt: [
            { text: promptText },
            ...promptMedia,
          ],
          config: {
            durationSeconds: parseInt(config.length, 10),
            aspectRatio: '16:9',
          },
        });
        operation = genAIGeneration.operation;

    } catch (e: any) {
        // Intercept billing-related errors early
        if (e.message && e.message.includes('billing')) {
            throw new Error("This feature requires a Google Cloud Platform account with billing enabled. Please check your account settings to use the Veo model.");
        }
        throw e; // re-throw other errors
    }


    if (!operation) {
      throw new Error('Expected the model to return an operation');
    }

    // This is a simplified polling mechanism for demonstration.
    while (!operation.done) {
      console.log('Checking operation status...');
      await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
      operation = await ai.checkOperation(operation);
    }
    
    if (operation.error) {
      console.error('Video generation failed:', operation.error);
      throw new Error(`Failed to generate video: ${operation.error.message}`);
    }

    const videoPart = operation.output?.message?.content.find(p => !!p.media && p.media.contentType === 'video/mp4');

    if (!videoPart || !videoPart.media?.url) {
      throw new Error('Failed to find the generated video in the operation result.');
    }
    
    // The media URL from Veo might expire, so we convert it to a data URI to make it persistent.
    const fetchedVideoDataUri = await imageUrlToDataUri(videoPart.media.url);

    return { videoUrl: fetchedVideoDataUri };
  }
);
