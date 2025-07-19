'use client';

import { useRef, useState } from 'react';
import type { Scene } from '@/lib/types';
import { SceneCard } from '@/components/scene-card';
import { Film } from 'lucide-react';

type StoryboardCanvasProps = {
  scenes: Scene[];
  onReorder: (scenes: Scene[]) => void;
  onDelete: (id: string) => void;
  onUpdateNarration: (id: string, text: string) => void;
};

export function StoryboardCanvas({ scenes, onReorder, ...props }: StoryboardCanvasProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const scenesRef = useRef(scenes);
  scenesRef.current = scenes;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    // Improves drag-and-drop experience on Firefox
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
      <div className="flex flex-col items-center justify-center h-full border-2 border-dashed rounded-lg">
        <Film className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold text-muted-foreground">Your Storyboard is Empty</h2>
        <p className="text-muted-foreground mt-2">Generate a scene to get started.</p>
      </div>
    );
  }

  return (
    <div id="storyboard-print-area" className="flex flex-col gap-4">
      {scenes.map((scene, index) => (
         <div key={scene.id}>
         {dragOverIndex === index && draggedIndex !== null && (
            <div className="h-2 bg-primary/50 rounded-full my-2 animate-pulse" />
          )}
        <SceneCard
          scene={scene}
          index={index}
          onDragStart={handleDragStart}
          onDragEnter={handleDragEnter}
          onDragEnd={handleDragEnd}
          isDragging={draggedIndex === index}
          {...props}
        />
        </div>
      ))}
    </div>
  );
}
