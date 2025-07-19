
'use client';

import React, { useRef, useState } from 'react';
import type { Scene } from '@/lib/types';
import { SceneCard, SceneCardSkeleton } from '@/components/scene-card';
import { Film } from 'lucide-react';

type StoryboardCanvasProps = {
  scenes: Scene[];
  onReorder: (scenes: Scene[]) => void;
  onDelete: (id: string) => void;
  activeSceneId: string | null;
  onSetActiveScene: (id: string) => void;
};

export function StoryboardCanvas({ scenes, onReorder, activeSceneId, onSetActiveScene, onDelete }: StoryboardCanvasProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const scenesRef = useRef(scenes);
  scenesRef.current = scenes;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };
  
  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
        const items = Array.from(scenesRef.current);
        const [reorderedItem] = items.splice(draggedIndex, 1);
        items.splice(dragOverIndex, 0, reorderedItem);
        onReorder(items);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (scenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full border-2 border-dashed rounded-lg bg-card p-12 text-center">
        <div className="p-4 bg-primary/10 rounded-full mb-4">
            <Film className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">Your Storyboard is Empty</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          Once you have defined your key scenes, they will appear here. You can then generate visuals and add narration for each one.
        </p>
      </div>
    );
  }

  return (
    <div id="storyboard-print-area" className="flex flex-col gap-4">
      {scenes.map((scene, index) => (
         <div 
            key={scene.id} 
            onClick={() => onSetActiveScene(scene.id)}
            className="cursor-pointer"
        >
         {dragOverIndex === index && draggedIndex !== null && (
            <div className="h-2 bg-primary/50 rounded-full my-2 animate-pulse" />
          )}
        <React.Suspense fallback={<SceneCardSkeleton />}>
          <SceneCard
            scene={scene}
            index={index}
            onDelete={onDelete}
            onDragStart={handleDragStart}
            onDragEnter={handleDragEnter}
            onDragEnd={handleDragEnd}
            isDragging={draggedIndex === index}
            isActive={activeSceneId === scene.id}
          />
        </React.Suspense>
        </div>
      ))}
    </div>
  );
}
