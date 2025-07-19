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
    'Echo',
    'Fable',
    'Onyx',
    'Nova',
    'Shimmer',
    'alloy',
    'rocky',
]);
export type VoiceOption = z.infer<typeof voiceOptions>;
