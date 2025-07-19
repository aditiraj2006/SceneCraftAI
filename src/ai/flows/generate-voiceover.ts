// src/ai/flows/generate-voiceover.ts
'use server';

/**
 * @fileOverview Generates voiceover audio from text using a specified voice.
 *
 * - generateVoiceover - A function that handles the text-to-speech process.
 * - GenerateVoiceoverInput - The input type for the generateVoiceover function.
 * - GenerateVoiceoverOutput - The return type for the generateVoiceover function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';
import wav from 'wav';
import { voiceOptions, type VoiceOption } from '@/lib/types';


const GenerateVoiceoverInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
  voice: voiceOptions.describe('The voice to use for the speech synthesis.'),
});
export type GenerateVoiceoverInput = z.infer<typeof GenerateVoiceoverInputSchema>;

const GenerateVoiceoverOutputSchema = z.object({
  audioUrl: z
    .string()
    .describe(
      "The generated audio as a data URI. Expected format: 'data:audio/wav;base64,<encoded_data>'"
    ),
});
export type GenerateVoiceoverOutput = z.infer<typeof GenerateVoiceoverOutputSchema>;


export async function generateVoiceover(input: GenerateVoiceoverInput): Promise<GenerateVoiceoverOutput> {
  return generateVoiceoverFlow(input);
}


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

    const bufs: Buffer[] = [];
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


const generateVoiceoverFlow = ai.defineFlow(
  {
    name: 'generateVoiceoverFlow',
    inputSchema: GenerateVoiceoverInputSchema,
    outputSchema: GenerateVoiceoverOutputSchema,
  },
  async ({ text, voice }) => {
     const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
      prompt: text,
    });

    if (!media?.url) {
      throw new Error('No media was returned from the TTS model.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    const wavBase64 = await toWav(audioBuffer);

    return {
      audioUrl: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);
