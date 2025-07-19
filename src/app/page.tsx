
'use client';

import { useState } from 'react';
import type { Scene } from '@/lib/types';
import { Header } from '@/components/header';
import { PromptForm } from '@/components/prompt-form';
import { StoryboardCanvas } from '@/components/storyboard-canvas';

const initialScenes: Scene[] = [
  {
    id: '1',
    imageUrl: 'https://placehold.co/600x400.png',
    narrationText: 'A lone astronaut stands on a desolate Mars-like planet, gazing at two moons in the sky.',
    aiPromptUsed: 'cinematic, wide shot, astronaut on a red planet, two moons, atmospheric, detailed',
    dataAiHint: 'astronaut mars',
  },
  {
    id: '2',
    imageUrl: 'https://placehold.co/600x400.png',
    narrationText: "Close-up on the astronaut's helmet, reflecting a distant Earth.",
    aiPromptUsed: 'cinematic, close up, astronaut helmet reflection, earth from space, emotional, detailed',
    dataAiHint: 'astronaut helmet',
  },
];

export default function StoryboarderPage() {
  const [scenes, setScenes] = useState<Scene[]>(initialScenes);

  const addScene = (newScene: Omit<Scene, 'id'>) => {
    setScenes(prevScenes => [...prevScenes, { ...newScene, id: crypto.randomUUID() }]);
  };

  const updateSceneNarration = (sceneId: string, newNarration: string) => {
    setScenes(prevScenes =>
      prevScenes.map(scene =>
        scene.id === sceneId ? { ...scene, narrationText: newNarration } : scene
      )
    );
  };

  const deleteScene = (sceneId: string) => {
    setScenes(prevScenes => prevScenes.filter(scene => scene.id !== sceneId));
  };
  
  const reorderScenes = (reorderedScenes: Scene[]) => {
    setScenes(reorderedScenes);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <Header />
      <main className="flex-1 grid md:grid-cols-[400px_1fr] overflow-hidden">
        <aside className="no-print flex flex-col p-4 border-r overflow-y-auto bg-card">
            <h2 className="text-xl font-bold mb-4 font-headline">Craft Your Scene</h2>
            <PromptForm onSceneAdd={addScene} />
        </aside>

        <section className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-muted/30">
          <StoryboardCanvas
            scenes={scenes}
            onReorder={reorderScenes}
            onDelete={deleteScene}
            onUpdateNarration={updateSceneNarration}
          />
        </section>
      </main>
    </div>
  );
}
