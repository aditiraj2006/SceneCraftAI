'use client';

import Image from 'next/image';
import { GripVertical, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Scene } from '@/lib/types';

type SceneCardProps = {
  scene: Scene;
  index: number;
  onDelete: (id: string) => void;
  onUpdateNarration: (id: string, text: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnd: () => void;
  isDragging?: boolean;
};

export function SceneCard({
  scene,
  index,
  onDelete,
  onUpdateNarration,
  onDragStart,
  onDragEnter,
  onDragEnd,
  isDragging
}: SceneCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnter={(e) => onDragEnter(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className={`transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <Card className="overflow-hidden w-full transition-shadow hover:shadow-lg">
        <CardContent className="p-0 flex flex-col sm:flex-row">
          <div className="relative w-full sm:w-1/3 aspect-video sm:aspect-auto">
            <Image
              src={scene.imageUrl}
              alt={scene.aiPromptUsed}
              width={300}
              height={169}
              data-ai-hint={scene.dataAiHint}
              className="object-cover w-full h-full"
            />
             <div className="absolute top-2 left-2 p-1 bg-black/50 rounded-full text-white text-sm font-bold w-8 h-8 flex items-center justify-center">
              {index + 1}
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between gap-4">
            <Textarea
              value={scene.narrationText}
              onChange={(e) => onUpdateNarration(scene.id, e.target.value)}
              placeholder="Narration, dialogue, or notes..."
              className="w-full flex-1 text-base resize-none border-0 focus-visible:ring-1"
            />
            <div className="flex justify-between items-center">
                <div 
                    className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
                    title="Drag to reorder"
                >
                    <GripVertical />
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(scene.id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    aria-label="Delete scene"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
