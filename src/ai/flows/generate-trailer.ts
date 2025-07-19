
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

const generateTrailerFlow = ai.defineFlow(
  {
    name: 'generateTrailerFlow',
    inputSchema: GenerateTrailerInputSchema,
    outputSchema: GenerateTrailerOutputSchema,
  },
  async ({ scenes, config }) => {
    // This is a long-running operation. In a real app, this would
    // likely be handled by a background job queue.
    // The flow would return an operation ID, and the client would poll for status.

    const promptText = `
      Create a cinematic trailer video with a duration of ${config.length}.
      The overall tone should be ${config.tone}.
      Use the following scenes in sequence. 
      Generate appropriate transitions between scenes to match the tone.
      ${config.includeMusic ? `Incorporate ${config.musicGenre.toLowerCase()} background music.` : ''}
      ${config.includeTextOverlays ? 'Include text overlays for scene titles or key narration moments.' : ''}

      Scenes:
      ${scenes.map((s, i) => `Scene ${i+1}: ${s.description}`).join('\n')}
    `;

    const promptMedia = scenes.filter(s => s.imageUrl).map(s => ({
        media: { url: s.imageUrl }
    }));


    let { operation } = await ai.generate({
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

    if (!operation) {
      throw new Error('Expected the model to return an operation');
    }

    // In a real implementation, you would not block here.
    // You would return the operation and poll for its status from the client.
    while (!operation.done) {
      console.log('Checking operation status...');
      // This is a simplified polling mechanism for demonstration.
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
    
    // In a real app, you would likely not return the video as a data URI due to size.
    // Instead, you'd save it to cloud storage and return the public URL.
    // For this example, we'll assume the URL is directly usable or can be converted.
    
    // This is a placeholder. You would need to handle the video download/conversion.
    const fetchedVideoDataUri = videoPart.media.url;

    return { videoUrl: fetchedVideoDataUri };
  }
);
