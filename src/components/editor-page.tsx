
'use client';

import { useState, useEffect } from 'react';
import type { Scene, Story } from '@/lib/types';
import { PromptForm } from '@/components/prompt-form';
import { StoryboardCanvas } from '@/components/storyboard-canvas';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

type EditorPageProps = {
    initialScenes: Scene[];
    story: Story;
    onScenesUpdate: (scenes: Scene[]) => void;
    onBack: () => void;
}

export function EditorPage({ initialScenes, story, onScenesUpdate, onBack }: EditorPageProps) {
  const [scenes, setScenes] = useState<Scene[]>(initialScenes);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(initialScenes[0]?.id || null);
  const [referenceSceneId, setReferenceSceneId] = useState<string | null>(null);

  useEffect(() => {
    onScenesUpdate(scenes);
  }, [scenes, onScenesUpdate]);
  
   useEffect(() => {
    // When the active scene changes, clear the reference scene if it's the same or later
    if (activeSceneId && referenceSceneId) {
        const activeIndex = scenes.findIndex(s => s.id === activeSceneId);
        const referenceIndex = scenes.findIndex(s => s.id === referenceSceneId);
        if (referenceIndex >= activeIndex) {
            setReferenceSceneId(null);
        }
    }
  }, [activeSceneId, referenceSceneId, scenes]);


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

  const deleteScene = (sceneId: string) => {
    const fromIndex = scenes.findIndex(s => s.id === sceneId);
    const newScenes = scenes.filter(scene => scene.id !== sceneId);
    setScenes(newScenes);

    if (activeSceneId === sceneId) {
        // set active to the next scene, or the previous one, or null if empty
        const nextActiveIndex = Math.max(0, fromIndex -1);
        setActiveSceneId(newScenes[nextActiveIndex]?.id || null);
    }
  };
  
  const reorderScenes = (reorderedScenes: Scene[]) => {
    setScenes(reorderedScenes);
  };

  const activeScene = scenes.find(s => s.id === activeSceneId) || null;

  return (
    <div className="flex flex-col h-full no-print">
        <div className="p-4 border-b">
            <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Summary & Key Scenes
            </Button>
        </div>
        <div className="flex-1 grid md:grid-cols-[450px_1fr] overflow-hidden">
            <aside className="flex flex-col p-4 border-r overflow-y-auto bg-card">
                {activeScene ? (
                    <PromptForm 
                        key={activeScene.id}
                        scene={activeScene}
                        allScenes={scenes}
                        referenceSceneId={referenceSceneId}
                        onSetReferenceSceneId={setReferenceSceneId}
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
                    activeSceneId={activeSceneId}
                    onSetActiveScene={setActiveSceneId}
                />
            </section>
        </div>
    </div>
  );
}
