
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
    narration: string;
}

export interface Trailer {
    id: string;
    url: string;
    thumbnailUrl: string;
    title: string;
    duration: string;
    generatedAt: string;
    config: TrailerConfig;
}

export interface Story {
    title: string;
    summary: string;
    keyScenes: KeyScene[];
    trailers?: Trailer[];
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
    { label: 'Hindi (India)', value: 'hi-IN' },
    { label: 'Bengali (India)', value: 'bn-IN' },
    { label: 'Gujarati (India)', value: 'gu-IN' },
    { label: 'Kannada (India)', value: 'kn-IN' },
    { label: 'Malayalam (India)', value: 'ml-IN' },
    { label: 'Marathi (India)', value: 'mr-IN' },
    { label: 'Tamil (India)', value: 'ta-IN' },
    { label: 'Telugu (India)', value: 'te-IN' },
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

// Placeholder for Character Library feature
export interface Character {
    id: string;
    name: string;
    physicalDescription: string;
    referenceImageUrls: string[];
}

export const characters: Character[] = [
    {
        id: 'char-1',
        name: 'Detective Kaito',
        physicalDescription: 'A tall, lean man in his late 30s, with short black hair, piercing blue eyes, and a noticeable scar above his left eyebrow. He often wears a classic trench coat over a simple suit.',
        referenceImageUrls: [],
    },
    {
        id: 'char-2',
        name: 'Nova',
        physicalDescription: 'A young woman with vibrant pink hair tied in a high ponytail. She has cybernetic enhancements around her right eye. She wears futuristic, practical clothing with glowing neon accents.',
        referenceImageUrls: [],
    }
];


export type TrailerConfig = {
  length: '15s' | '30s' | '60s';
  tone: 'Exciting' | 'Mysterious' | 'Dramatic' | 'Hopeful';
  voiceover: 'Full' | 'Highlights';
  includeMusic: boolean;
  musicGenre: 'Epic' | 'Suspenseful' | 'Upbeat' | 'None';
  includeTextOverlays: boolean;
};
