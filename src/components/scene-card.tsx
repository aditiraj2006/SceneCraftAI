
'use client';

import Image from 'next/image';
import { GripVertical, Trash2, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scene } from '@/lib/types';
import { cn } from '@/lib/utils';

type SceneCardProps = {
  scene: Scene;
  index: number;
  onDelete: (id: string) => void;
  onUpdateNarration: (id: string, text: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnd: () => void;
  isDragging?: boolean;
  isActive?: boolean;
};

export function SceneCard({
  scene,
  index,
  onDelete,
  onUpdateNarration,
  onDragStart,
  onDragEnter,
  onDragEnd,
  isDragging,
  isActive,
}: SceneCardProps) {

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from firing
    onDelete(scene.id);
  }
  
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnter={(e) => onDragEnter(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className={`transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <Card className={cn(
          "overflow-hidden w-full transition-all duration-300 hover:shadow-lg",
          isActive ? "ring-2 ring-primary shadow-lg" : "ring-0"
        )}>
        <CardContent className="p-0 flex flex-col sm:flex-row">
          <div className="relative w-full sm:w-1/3 aspect-video sm:aspect-auto bg-muted/50">
            {scene.imageUrl ? (
                <Image
                    src={scene.imageUrl}
                    alt={scene.aiPromptUsed}
                    width={300}
                    height={169}
                    data-ai-hint={scene.dataAiHint}
                    className="object-cover w-full h-full"
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-10 h-10 mb-2"/>
                    <p className="text-sm">No Visual Generated</p>
                </div>
            )}
             <div className="absolute top-2 left-2 p-1 bg-black/50 rounded-full text-white text-sm font-bold w-8 h-8 flex items-center justify-center">
              {index + 1}
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between gap-4">
            <h3 className="font-bold text-lg">{scene.title}</h3>
            <p className="text-sm text-muted-foreground flex-1">
              {scene.narrationText}
            </p>
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
                    onClick={handleDelete}
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
