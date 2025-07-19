
'use client';

import { useState } from 'react';
import type { Scene } from '@/lib/types';
import { PromptForm } from '@/components/prompt-form';
import { StoryboardCanvas } from '@/components/storyboard-canvas';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

type EditorPageProps = {
    initialScenes: Scene[];
    onBack: () => void;
}

export function EditorPage({ initialScenes, onBack }: EditorPageProps) {
  const [scenes, setScenes] = useState<Scene[]>(initialScenes);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(initialScenes[0]?.id || null);

  const addScene = (newSceneData: Omit<Scene, 'id' | 'title' | 'description'>, fromSceneId: string) => {
    const newScene: Scene = { 
        ...newSceneData, 
        id: crypto.randomUUID(),
        title: "New Scene",
        description: "Newly added scene description."
    };
    
    const fromIndex = scenes.findIndex(s => s.id === fromSceneId);
    const newScenes = [...scenes];
    newScenes.splice(fromIndex + 1, 0, newScene);
    
    setScenes(newScenes);
    setActiveSceneId(newScene.id);
  };
  
  const updateScene = (sceneId: string, updatedProps: Partial<Scene>) => {
     setScenes(prevScenes =>
      prevScenes.map(scene =>
        scene.id === sceneId ? { ...scene, ...updatedProps } : scene
      )
    );
  }

  const updateSceneNarration = (sceneId: string, newNarration: string) => {
    setScenes(prevScenes =>
      prevScenes.map(scene =>
        scene.id === sceneId ? { ...scene, narrationText: newNarration } : scene
      )
    );
  };

  const deleteScene = (sceneId: string) => {
    setScenes(prevScenes => prevScenes.filter(scene => scene.id !== sceneId));
    if (activeSceneId === sceneId) {
        setActiveSceneId(scenes[0]?.id || null);
    }
  };
  
  const reorderScenes = (reorderedScenes: Scene[]) => {
    setScenes(reorderedScenes);
  };

  const activeScene = scenes.find(s => s.id === activeSceneId);

  return (
    <div className="flex flex-col h-full">
        <div className="p-4 border-b">
            <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Summary & Key Scenes
            </Button>
        </div>
        <div className="flex-1 grid md:grid-cols-[400px_1fr] overflow-hidden">
            <aside className="no-print flex flex-col p-4 border-r overflow-y-auto bg-card">
                {activeScene ? (
                    <PromptForm 
                        key={activeScene.id}
                        scene={activeScene} 
                        onSceneUpdate={updateScene}
                        onSceneAdd={addScene}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>Select a scene to edit or add a new one.</p>
                    </div>
                )}
            </aside>

            <section className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-muted/30">
            <StoryboardCanvas
                scenes={scenes}
                onReorder={reorderScenes}
                onDelete={deleteScene}
                onUpdateNarration={updateSceneNarration}
                activeSceneId={activeSceneId}
                onSetActiveScene={setActiveSceneId}
            />
            </section>
        </div>
    </div>
  );
}
