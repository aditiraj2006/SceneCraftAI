export interface Scene {
  id: string;
  title: string;
  description: string;
  narrationText: string;
  imageUrl: string;
  aiPromptUsed: string;
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
