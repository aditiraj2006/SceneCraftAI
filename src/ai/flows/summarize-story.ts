'use server';

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

const SummarizeStoryInputSchema = z.object({
  storyIdea: z.string().describe('The user\'s initial story idea or script.'),
});
export type SummarizeStoryInput = z.infer<typeof SummarizeStoryInputSchema>;

const SummarizeStoryOutputSchema = z.object({
  title: z.string().describe('A concise, catchy title for the story.'),
  summary: z.string().describe('A concise summary of the provided story idea.'),
  keyScenes: z.array(z.object({
    title: z.string().describe('A short, descriptive title for the key scene (e.g., "The Inciting Incident", "Confrontation").'),
    description: z.string().describe('A one-sentence description of what happens in this key scene.'),
    narration: z.string().describe('A short, 1-2 sentence narration for this scene.'),
  })).describe('An array of key scenes identified from the story.'),
});
export type SummarizeStoryOutput = z.infer<typeof SummarizeStoryOutputSchema>;

export async function summarizeStory(input: SummarizeStoryInput): Promise<SummarizeStoryOutput> {
  return summarizeStoryFlow(input);
}

const summarizeStoryFlow = ai.defineFlow(
  {
    name: 'summarizeStoryFlow',
    inputSchema: SummarizeStoryInputSchema,
    outputSchema: SummarizeStoryOutputSchema,
  },
  async (input) => {
    try {
      const resp = await ai.generate({
        model: googleAI.model('gemini-2.5-flash'),
        prompt: `You are a professional screenwriter and story analyst. Analyze the following story idea or script. Your task is to:
1. Generate a concise, catchy title for the story.
2. Write a concise summary of the entire story.
3. Identify and break down the story into 5-7 key scenes. For each key scene, provide a short, descriptive title, a one-sentence description, and a short (1-2 sentence) narration that could be used as a voiceover for that scene. These scenes should represent the major plot points (e.g., inciting incident, rising action, climax, resolution).

Respond in JSON format with the following structure:
{
  "title": "Story Title",
  "summary": "Story summary here",
  "keyScenes": [
    {
      "title": "Scene Title",
      "description": "Scene description",
      "narration": "Scene narration"
    }
  ]
}

Story Idea: ${input.storyIdea}`,
        output: { format: 'json', schema: SummarizeStoryOutputSchema },
      });

      const text = (resp as any).text;
      if (!text) {
        throw new Error('No response text received from AI');
      }

      const result = JSON.parse(text);
      
      if (!result.title || !result.summary || !result.keyScenes) {
        throw new Error('Invalid response format from AI');
      }

      return result;
      
    } catch (error: any) {
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        throw new Error('AI quota exceeded. Please check your Google Cloud billing and quota limits.');
      }
      if (error.message?.includes('billing')) {
        throw new Error('AI features require billing to be enabled on your Google Cloud account.');
      }
      if (error.message?.includes('API key')) {
        throw new Error('Invalid or missing API key. Please check your .env file.');
      }
      throw new Error(`Failed to generate story summary: ${error.message}`);
    }
  }
);