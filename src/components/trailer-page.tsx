
'use client';

import { useState, useTransition } from 'react';
import type { Scene, Story, Trailer, TrailerConfig } from '@/lib/types';
import { ArrowLeft, Clapperboard, Download, Loader2, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateTrailer } from '@/ai/flows/generate-trailer';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type TrailerPageProps = {
  story: Story;
  scenes: Scene[];
  onBack: () => void;
};

// Placeholder data for generated trailers
const placeholderTrailers: Trailer[] = [
    // {
    //     id: 'trailer-1',
    //     url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    //     thumbnailUrl: 'https://placehold.co/1280x720.png',
    //     title: 'Trailer V1 - Exciting',
    //     duration: '0:32',
    //     generatedAt: '2023-10-27T10:00:00Z',
    //     config: { length: '30s', tone: 'Exciting', voiceover: 'Full', includeMusic: true, musicGenre: 'Epic', includeTextOverlays: true }
    // },
    // {
    //     id: 'trailer-2',
    //     url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    //     thumbnailUrl: 'https://placehold.co/1280x720.png',
    //     title: 'Trailer V2 - Mysterious',
    //     duration: '0:58',
    //     generatedAt: '2023-10-27T11:30:00Z',
    //     config: { length: '60s', tone: 'Mysterious', voiceover: 'Highlights', includeMusic: true, musicGenre: 'Suspenseful', includeTextOverlays: false }
    // }
];


export function TrailerPage({ story, scenes, onBack }: TrailerPageProps) {
  const { toast } = useToast();
  const [isGenerating, startGenerationTransition] = useTransition();
  const [trailers, setTrailers] = useState<Trailer[]>(placeholderTrailers);
  const [activeTrailer, setActiveTrailer] = useState<Trailer | null>(null);

  const [trailerConfig, setTrailerConfig] = useState<TrailerConfig>({
    length: '15s',
    tone: 'Exciting',
    voiceover: 'Full',
    includeMusic: true,
    musicGenre: 'Epic',
    includeTextOverlays: true,
  });

  const handleConfigChange = (key: keyof TrailerConfig, value: any) => {
    setTrailerConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerateTrailer = () => {
    startGenerationTransition(async () => {
      try {
        toast({
          title: "Trailer Generation Started",
          description: "This process can take several minutes. We'll notify you when it's ready.",
        });

        // In a real app, this would return an operation ID to poll
        const result = await generateTrailer({ scenes, config: trailerConfig });
        
        const newTrailer: Trailer = {
            id: crypto.randomUUID(),
            url: result.videoUrl,
            thumbnailUrl: 'https://placehold.co/1280x720.png', // Placeholder thumbnail
            title: `Trailer V${trailers.length + 1} - ${trailerConfig.tone}`,
            duration: trailerConfig.length,
            generatedAt: new Date().toISOString(),
            config: trailerConfig,
        };
        
        setTrailers(prev => [...prev, newTrailer]);

        toast({
          title: "Trailer Generation Complete!",
          description: "Your new trailer is now available below.",
        });

      } catch (error: any) {
        console.error("Trailer generation failed", error);
        toast({
          variant: 'destructive',
          title: "Trailer Generation Failed",
          description: error.message || "An unexpected error occurred. Please check the console and try again.",
        });
      }
    });
  };

  const downloadTrailer = (url: string, title: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 space-y-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <Button variant="outline" onClick={onBack} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Export Page
            </Button>
            <h1 className="text-4xl font-bold tracking-tight">Generate Cinematic Trailer</h1>
            <p className="text-muted-foreground mt-2">
                Bring your storyboard to life by generating a short video trailer with AI.
            </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>Trailer Configuration</CardTitle>
                    <CardDescription>Set the parameters for your new trailer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Trailer Length</Label>
                        <Select value={trailerConfig.length} onValueChange={v => handleConfigChange('length', v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="15s">15 Seconds</SelectItem>
                                <SelectItem value="30s">30 Seconds</SelectItem>
                                <SelectItem value="60s">60 Seconds</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Overall Tone/Mood</Label>
                        <Select value={trailerConfig.tone} onValueChange={v => handleConfigChange('tone', v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Exciting">Exciting</SelectItem>
                                <SelectItem value="Mysterious">Mysterious</SelectItem>
                                <SelectItem value="Dramatic">Dramatic</SelectItem>
                                <SelectItem value="Hopeful">Hopeful</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Voiceover Type</Label>
                         <Select value={trailerConfig.voiceover} onValueChange={v => handleConfigChange('voiceover', v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Full">Narrated (full)</SelectItem>
                                <SelectItem value="Highlights">Highlights Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center space-x-2">
                        <Checkbox id="include-music" checked={trailerConfig.includeMusic} onCheckedChange={v => handleConfigChange('includeMusic', !!v)} />
                        <Label htmlFor="include-music">Include Background Music</Label>
                    </div>
                    {trailerConfig.includeMusic && (
                        <div className="space-y-2 pl-6">
                            <Label>Music Genre/Style</Label>
                            <Select value={trailerConfig.musicGenre} onValueChange={v => handleConfigChange('musicGenre', v)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Epic">Epic Orchestral</SelectItem>
                                    <SelectItem value="Suspenseful">Suspenseful</SelectItem>
                                    <SelectItem value="Upbeat">Upbeat</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    
                    <Separator />

                     <div className="flex items-center space-x-2">
                        <Checkbox id="include-overlays" checked={trailerConfig.includeTextOverlays} onCheckedChange={v => handleConfigChange('includeTextOverlays', !!v)} />
                        <Label htmlFor="include-overlays">Include Text Overlays</Label>
                    </div>
                    
                    <Button size="lg" className="w-full" onClick={handleGenerateTrailer} disabled={isGenerating}>
                        {isGenerating ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <Clapperboard className="mr-2 h-5 w-5" />
                        )}
                        Generate Trailer
                    </Button>
                </CardContent>
            </Card>

            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Trailer Preview & Management</CardTitle>
                        <CardDescription>Review, play, and manage your generated trailers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activeTrailer ? (
                            <div className="space-y-4">
                                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                     <video key={activeTrailer.id} controls autoPlay className="w-full h-full">
                                        <source src={activeTrailer.url} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold">{activeTrailer.title}</h3>
                                        <p className="text-sm text-muted-foreground">Generated on {new Date(activeTrailer.generatedAt).toLocaleDateString()}</p>
                                    </div>
                                    <Button onClick={() => setActiveTrailer(null)}>Back to List</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {isGenerating && (
                                     <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-center">
                                        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                                        <h3 className="text-lg font-semibold">Generating Trailer...</h3>
                                        <p className="text-muted-foreground">This may take a few minutes. Please don't close this page.</p>
                                    </div>
                                )}
                                {trailers.length > 0 ? (
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {trailers.map(trailer => (
                                            <Card key={trailer.id} className="group overflow-hidden">
                                                <CardContent className="p-0">
                                                    <div className="relative aspect-video bg-muted">
                                                        <Image src={trailer.thumbnailUrl} alt={trailer.title} layout="fill" objectFit="cover" />
                                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => setActiveTrailer(trailer)}>
                                                                <Play className="h-8 w-8" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="p-3">
                                                        <h4 className="font-semibold truncate">{trailer.title}</h4>
                                                        <div className="text-xs text-muted-foreground flex justify-between items-center mt-1">
                                                            <span>{trailer.duration}</span>
                                                            <div className="flex gap-1">
                                                                <Button size="icon" variant="ghost" className="w-6 h-6" onClick={() => downloadTrailer(trailer.url, trailer.title)}>
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                                 <Button size="icon" variant="ghost" className="w-6 h-6 hover:bg-destructive/10 hover:text-destructive" onClick={() => setTrailers(ts => ts.filter(t => t.id !== trailer.id))}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    !isGenerating && (
                                        <div className="text-center p-8 border-2 border-dashed rounded-lg">
                                            <h3 className="text-lg font-semibold">No Trailers Yet</h3>
                                            <p className="text-muted-foreground mt-1">Configure your settings and generate your first trailer.</p>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

        </div>
      </div>
    </div>
  );
}
