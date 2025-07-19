import { z } from 'zod';

export interface Scene {
  id: string;
  title: string;
  description: string;
  narrationText: string;
  imageUrl: string;
  aiPromptUsed: string;
  voiceoverUrl?: string;
  dataAiHint?: string;
}

export interface KeyScene {
    title: string;
    description: string;
}

export interface Story {
    summary: string;
    keyScenes: KeyScene[];
}

export const voiceOptions = z.enum([
    'Algenib',
    'Antares',
    'Arcturus',
    'Canopus',
    'Capella',
    'Deneb',
    'Pollux',
    'Regulus',
    'Rigel',
    'Sirius',
    'Spica',
    'Vega',
]);
export type VoiceOption = z.infer<typeof voiceOptions>;

const languageOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const languageOptions = z.object({
  options: z.array(languageOptionSchema),
}).parse({
  options: [
    { label: 'English (US)', value: 'en-US' },
    { label: 'Spanish (Spain)', value: 'es-ES' },
    { label: 'French (France)', value: 'fr-FR' },
    { label: 'German', value: 'de-DE' },
    { label: 'Italian', value: 'it-IT' },
    { label: 'Japanese', value: 'ja-JP' },
    { label: 'Korean', value: 'ko-KR' },
    { label: 'Portuguese (BR)', value: 'pt-BR' },
  ],
});

export type LanguageOption = z.infer<typeof languageOptionSchema>['value'];
