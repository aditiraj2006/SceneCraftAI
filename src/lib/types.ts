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
