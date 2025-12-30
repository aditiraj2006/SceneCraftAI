// Add these to your existing types
export interface Scene {
  id: string;
  title: string;
  description: string;
  narrationText: string;
  imageUrl: string;
  aiPromptUsed: string;
  status?: 'pending' | 'generating' | 'complete' | 'error';
  error?: string;
}

export interface Story {
  title: string;
  summary: string;
  keyScenes: Array<{
    title: string;
    description: string;
    narration: string;
  }>;
}

export interface TrailerConfig {
  length: string;
  tone: string;
  includeMusic: boolean;
  musicGenre: string;
  includeTextOverlays: boolean;
}

// Add this new type for voice options
export const voiceOptions = [
  'en-US-Studio-O',
  'en-US-Studio-M',
  'en-GB-Studio-B',
  'en-GB-Studio-C',
  'en-AU-Studio-C',
  'en-AU-Studio-B'
] as const;

export type VoiceOption = typeof voiceOptions[number];