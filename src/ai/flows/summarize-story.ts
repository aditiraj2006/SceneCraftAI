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

const summarizeStoryPrompt = ai.definePrompt({
  name: 'summarizeStoryPrompt',
  model: googleAI.model('gemini-2.5-flash'),
  input: {schema: SummarizeStoryInputSchema},
  output: {schema: SummarizeStoryOutputSchema},
  prompt: `You are a professional screenwriter and story analyst. Analyze the following story idea or script. Your task is to:
1. Generate a concise, catchy title for the story.
2.  Write a concise summary of the entire story.
3.  Identify and break down the story into 5-7 key scenes. For each key scene, provide a short, descriptive title, a one-sentence description, and a short (1-2 sentence) narration that could be used as a voiceover for that scene. These scenes should represent the major plot points (e.g., inciting incident, rising action, climax, resolution).

Story Idea:
{{{storyIdea}}}
`,
});

const summarizeStoryFlow = ai.defineFlow(
  {
    name: 'summarizeStoryFlow',
    inputSchema: SummarizeStoryInputSchema,
    outputSchema: SummarizeStoryOutputSchema,
  },
  async (input) => {
    const {output} = await summarizeStoryPrompt(input);
    return output!;
  }
);