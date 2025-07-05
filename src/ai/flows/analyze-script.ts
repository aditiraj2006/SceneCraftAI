// src/ai/flows/analyze-script.ts
'use server';
/**
 * @fileOverview A script analysis AI agent.
 *
 * - analyzeScript - A function that handles the script analysis process.
 * - AnalyzeScriptInput - The input type for the analyzeScript function.
 * - AnalyzeScriptOutput - The return type for the analyzeScript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeScriptInputSchema = z.object({
  script: z.string().describe('The script or story prompt to analyze.'),
});
export type AnalyzeScriptInput = z.infer<typeof AnalyzeScriptInputSchema>;

const AnalyzeScriptOutputSchema = z.object({
  summary: z.string().describe('A summary of the script or story prompt.'),
  keyScenes: z.array(z.string()).describe('A list of key scenes identified in the script.'),
  visualElements: z.array(z.string()).describe('A list of visual elements identified in the script.'),
});
export type AnalyzeScriptOutput = z.infer<typeof AnalyzeScriptOutputSchema>;

export async function analyzeScript(input: AnalyzeScriptInput): Promise<AnalyzeScriptOutput> {
  return analyzeScriptFlow(input);
}

const analyzeScriptPrompt = ai.definePrompt({
  name: 'analyzeScriptPrompt',
  input: {schema: AnalyzeScriptInputSchema},
  output: {schema: AnalyzeScriptOutputSchema},
  prompt: `You are a script analyst for the film industry. Analyze the following script or story prompt and identify key scenes and visual elements.

Script/Prompt:
{{{script}}}

Provide a summary of the script, a list of key scenes, and a list of visual elements.

Summary:
Key Scenes:
Visual Elements:`,
});

const analyzeScriptFlow = ai.defineFlow(
  {
    name: 'analyzeScriptFlow',
    inputSchema: AnalyzeScriptInputSchema,
    outputSchema: AnalyzeScriptOutputSchema,
  },
  async input => {
    const {output} = await analyzeScriptPrompt(input);
    return output!;
  }
);
