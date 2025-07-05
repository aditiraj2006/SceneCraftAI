'use server';

/**
 * @fileOverview Generates a trailer from a storyboard.
 *
 * - generateTrailer - A function that handles the trailer generation process.
 * - GenerateTrailerInput - The input type for the generateTrailer function.
 * - GenerateTrailerOutput - The return type for the generateTrailer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const GenerateTrailerInputSchema = z.object({
  storyboard: z.array(
    z.object({
      imageUrl: z
        .string()
        .describe(
          'The URL of the storyboard image panel. Should be a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // as data URI
        ),
      sceneDescription: z.string().describe('The description of the scene.'),
    })
  ).describe('The storyboard to generate a trailer from.'),
  trailerPrompt: z.string().describe('Prompt to guide trailer generation, e.g., past successful film trailers as inspiration for music choice and the arc of the trailer\'s story'),
});
export type GenerateTrailerInput = z.infer<typeof GenerateTrailerInputSchema>;

const GenerateTrailerOutputSchema = z.object({
  trailerVideo: z
    .string()
    .describe('The URL of the generated trailer video.'),
  voiceOver: z.string().describe('The voiceover audio for the trailer'),
});
export type GenerateTrailerOutput = z.infer<typeof GenerateTrailerOutputSchema>;

export async function generateTrailer(input: GenerateTrailerInput): Promise<GenerateTrailerOutput> {
  return generateTrailerFlow(input);
}

const trailerPrompt = ai.definePrompt({
  name: 'trailerPrompt',
  input: {
    schema: GenerateTrailerInputSchema,
  },
  output: {
    schema: z.object({
      script: z.string().describe('The script for the trailer.'),
    }),
  },
  prompt: `You are an expert trailer creator.  Based on the following storyboard and trailer prompt create a compelling script for the trailer.

Storyboard:
{{#each storyboard}}
Scene Description: {{{this.sceneDescription}}}
Image: {{media url=this.imageUrl}}
{{/each}}

Trailer Prompt: {{{trailerPrompt}}}

Your trailer script:
`,
});

const voiceOverPrompt = ai.definePrompt({
  name: 'voiceOverPrompt',
  input: {
    schema: z.object({
      script: z.string().describe('The script for the trailer.'),
    }),
  },
  output: {
    schema: z.object({
      voiceOverText: z.string().describe('The voice over for the trailer.'),
    }),
  },
  prompt: `You are an expert voice over creator.  Create compelling voice over for the trailer.

Trailer Script:
{{{script}}}

Your voice over script:
`,
});

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

    let bufs = [] as any[];
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

const generateTrailerFlow = ai.defineFlow(
  {
    name: 'generateTrailerFlow',
    inputSchema: GenerateTrailerInputSchema,
    outputSchema: GenerateTrailerOutputSchema,
  },
  async input => {
    const {output: trailerOutput} = await trailerPrompt(input);

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: trailerOutput!.script,
    });

    if (!media) {
      throw new Error('no media returned');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const voiceOver = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    // Dummy implementation for trailer video generation
    const trailerVideo = 'https://example.com/dummy-trailer.mp4';

    return {
      trailerVideo,
      voiceOver,
    };
  }
);
