'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Video, Sparkles } from 'lucide-react';
import type { GenerateStoryboardOutput } from '@/ai/flows/generate-storyboard';
import type { AnalyzeScriptOutput } from '@/ai/flows/analyze-script';

interface StoryboardEditorProps {
  storyboard: GenerateStoryboardOutput;
  analysis: AnalyzeScriptOutput;
  onGenerateTrailer: (editedStoryboard: { imageUrl: string; sceneDescription: string }[]) => void;
  isLoading: boolean;
}

export function StoryboardEditor({ storyboard, analysis, onGenerateTrailer, isLoading }: StoryboardEditorProps) {
  const [editedDescriptions, setEditedDescriptions] = useState<string[]>(analysis.keyScenes);

  const handleDescriptionChange = (index: number, newDescription: string) => {
    const newDescriptions = [...editedDescriptions];
    newDescriptions[index] = newDescription;
    setEditedDescriptions(newDescriptions);
  };
  
  const handleTrailerGeneration = () => {
    const finalStoryboard = storyboard.storyboardFrames.map((frame, index) => ({
        imageUrl: frame,
        sceneDescription: editedDescriptions[index] || analysis.keyScenes[index],
    }));
    onGenerateTrailer(finalStoryboard);
  }

  return (
    <div className="w-full max-w-7xl space-y-6 animate-in fade-in-50 duration-500">
        <div className="text-center px-4">
            <h1 className="text-3xl md:text-4xl font-bold font-headline">Your Storyboard</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Review your scenes. Edit descriptions for context, then create your trailer with a single click.</p>
        </div>
        
        <Carousel className="w-full" opts={{ align: "start", loop: true }}>
            <CarouselContent className="-ml-2 md:-ml-4">
                {(storyboard.storyboardFrames.length > 0 ? storyboard.storyboardFrames : Array(5).fill('')).map((frame, index) => (
                    <CarouselItem key={index} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                            <Card className="h-full flex flex-col">
                                <CardHeader>
                                    <CardTitle>Scene {index + 1}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col gap-4 p-4 pt-0">
                                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-secondary">
                                    <Image
                                        src={frame || 'https://placehold.co/1280x720.png'}
                                        alt={`Storyboard frame ${index + 1}`}
                                        width={1280}
                                        height={720}
                                        className="rounded-lg object-cover w-full h-full"
                                        data-ai-hint="cinematic film still"
                                    />
                                    </div>
                                    <Textarea
                                        value={editedDescriptions[index] || ''}
                                        onChange={(e) => handleDescriptionChange(index, e.target.value)}
                                        className="mt-2 flex-1 resize-none text-sm"
                                        placeholder="Scene description..."
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="ml-12" />
            <CarouselNext className="mr-12" />
        </Carousel>
        <div className="text-center pt-4">
            <Button size="lg" onClick={handleTrailerGeneration} disabled={isLoading}>
                {isLoading ? 'Conjuring Magic...' : 'Generate Trailer'}
                {!isLoading ? <Video className="ml-2 h-5 w-5" /> : <Sparkles className="ml-2 h-5 w-5 animate-pulse" />}
            </Button>
        </div>
    </div>
  );
}
