
'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Story, KeyScene } from '@/lib/types';

type SummaryPageProps = {
  story: Story;
  onProceed: (story: Story) => void;
  onBack: () => void;
};

export function SummaryPage({ story, onProceed, onBack }: SummaryPageProps) {
  const [currentStory, setCurrentStory] = useState(story);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const updateSummary = (newSummary: string) => {
    setCurrentStory(prev => ({ ...prev, summary: newSummary }));
  };

  const updateKeyScene = (index: number, field: keyof KeyScene, value: string) => {
    const newKeyScenes = [...currentStory.keyScenes];
    newKeyScenes[index] = { ...newKeyScenes[index], [field]: value };
    setCurrentStory(prev => ({ ...prev, keyScenes: newKeyScenes }));
  };

  const addKeyScene = () => {
    const newKeyScenes = [...currentStory.keyScenes, { title: 'New Scene', description: 'A brief description.' }];
    setCurrentStory(prev => ({ ...prev, keyScenes: newKeyScenes }));
  };

  const deleteKeyScene = (index: number) => {
    const newKeyScenes = currentStory.keyScenes.filter((_, i) => i !== index);
    setCurrentStory(prev => ({ ...prev, keyScenes: newKeyScenes }));
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const items = Array.from(currentStory.keyScenes);
    const [reorderedItem] = items.splice(draggedIndex, 1);
    items.splice(index, 0, reorderedItem);
    
    setDraggedIndex(index);
    setCurrentStory(prev => ({ ...prev, keyScenes: items }));
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="container mx-auto max-w-5xl h-full flex flex-col p-4">
      <div className="flex-1 overflow-y-auto space-y-6 pb-20">
        <Card>
          <CardHeader>
            <CardTitle>Story Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={currentStory.summary}
              onChange={(e) => updateSummary(e.target.value)}
              className="min-h-[150px] text-base"
              placeholder="Edit the AI-generated summary or write your own."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Key Scenes</CardTitle>
              <Button variant="outline" onClick={addKeyScene}><Plus className="mr-2 h-4 w-4" /> Add Key Scene</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentStory.keyScenes.map((scene, index) => (
              <div 
                key={index} 
                className={`flex items-start gap-4 p-4 border rounded-lg bg-card transition-opacity ${draggedIndex === index ? 'opacity-50' : 'opacity-100'}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="cursor-grab text-muted-foreground pt-2 touch-none">
                  <GripVertical />
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    value={scene.title}
                    onChange={(e) => updateKeyScene(index, 'title', e.target.value)}
                    className="font-bold text-lg"
                  />
                  <Textarea
                    value={scene.description}
                    onChange={(e) => updateKeyScene(index, 'description', e.target.value)}
                    placeholder="One-sentence description of the scene."
                    rows={2}
                    className="resize-none"
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteKeyScene(index)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t">
        <div className="container mx-auto max-w-5xl flex justify-between items-center">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Input
          </Button>
          <Button size="lg" onClick={() => onProceed(currentStory)}>
            Next: Detail Scenes <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
