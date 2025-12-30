'use client';

import Image from 'next/image';
import { GripVertical, Trash2, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scene } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

interface SceneCardProps {
  scene: Scene;
  index: number;
  onGenerateImage: () => Promise<void>;
  onEnhancePrompt: () => Promise<void>;
  onUpdateScene: (updates: Partial<Scene>) => void;
  isGenerating: boolean;
  isEnhancing: boolean;
  onDelete?: (sceneId: string) => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnter?: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  isDragging?: boolean;
  isActive?: boolean;
}

export function SceneCard({
  scene,
  index,
  onGenerateImage,
  onEnhancePrompt,
  onUpdateScene,
  isGenerating,
  isEnhancing,
  onDelete,
  onDragStart,
  onDragEnter,
  onDragEnd,
  isDragging = false,
  isActive = false,
}: SceneCardProps) {

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(scene.id);
    }
  };
  
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, index)}
      onDragEnter={(e) => onDragEnter?.(e, index)}
      onDragEnd={(e) => onDragEnd?.(e)}
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
                    alt={scene.aiPromptUsed || 'Generated scene image'}
                    width={300}
                    height={169}
                    className="object-cover w-full h-full"
                    priority={index < 3}
                />
            ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-4">
                    <ImageIcon className="w-10 h-10 mb-2"/>
                    <p className="text-sm text-center">No Visual Generated</p>
                </div>
            )}
             <div className="absolute top-2 left-2 p-1 bg-black/50 rounded-full text-white text-sm font-bold w-8 h-8 flex items-center justify-center">
              {index + 1}
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg">{scene.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{scene.description}</p>
            </div>
            <p className="text-sm text-muted-foreground flex-1 line-clamp-3">
              {scene.narrationText}
            </p>
            <div className="flex gap-2">
              <Button
                  variant="outline"
                  size="sm"
                  onClick={onGenerateImage}
                  disabled={isGenerating}
                  className="text-xs"
              >
                {isGenerating ? 'Generating...' : 'Generate Image'}
              </Button>
              <Button
                  variant="outline"
                  size="sm"
                  onClick={onEnhancePrompt}
                  disabled={isEnhancing}
                  className="text-xs"
              >
                {isEnhancing ? 'Enhancing...' : 'Enhance'}
              </Button>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
                <div 
                    className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
                    title="Drag to reorder"
                >
                    <GripVertical className="h-4 w-4" />
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

export function SceneCardSkeleton() {
  return (
    <Card className="overflow-hidden w-full">
      <CardContent className="p-0 flex flex-col sm:flex-row">
        <div className="relative w-full sm:w-1/3 aspect-video sm:aspect-auto">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="p-4 flex-1 flex flex-col justify-between gap-4">
          <Skeleton className="h-6 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
