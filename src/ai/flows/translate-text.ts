'use server';

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

const TranslateTextInputSchema = z.object({
  text: z.string().min(1).max(5000).describe('The text to translate'),
  targetLanguage: z.string().describe('Target language code (e.g., hi-IN, bn-IN)'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text'),
  sourceLanguage: z.string().describe('Detected source language'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async ({ text, targetLanguage }) => {
    const languageNames: Record<string, string> = {
      'en-US': 'English',
      'hi-IN': 'Hindi',
      'bn-IN': 'Bengali',
      'gu-IN': 'Gujarati',
      'kn-IN': 'Kannada',
      'ml-IN': 'Malayalam',
      'mr-IN': 'Marathi',
      'ta-IN': 'Tamil',
      'te-IN': 'Telugu',
      'es-ES': 'Spanish',
      'fr-FR': 'French',
      'de-DE': 'German',
      'it-IT': 'Italian',
      'ja-JP': 'Japanese',
      'ko-KR': 'Korean',
      'pt-BR': 'Portuguese',
    };

    const targetLangName = languageNames[targetLanguage] || targetLanguage;

    const prompt = `Translate the following text to ${targetLangName}. 
Maintain the tone, style, and narrative flow. Only return the translated text, nothing else.

Text to translate:
${text}`;

    const response = await ai.generate({
      model: googleAI.model('gemini-2.0-flash-exp'),
      prompt,
      config: {
        temperature: 0.3,
      },
    });

    return {
      translatedText: response.text.trim(),
      sourceLanguage: 'en-US',
    };
  }
);