
'use client';

import { useState, useEffect } from 'react';
import type { Scene, Story } from '@/lib/types';
import { ArrowLeft, Edit, Download, Plus, Trash2, GitBranch, Share2, Copy, Image as ImageIcon, Speaker } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ExportPageProps = {
  story: Story;
  scenes: Scene[];
  onStoryUpdate: (story: Story) => void;
  onBack: () => void;
};

type PrintOptions = {
    imagesPerPage: '1' | '2' | '4';
    includeImages: boolean;
    includeNarration: boolean;
    includePrompts: boolean;
    includeNumbers: boolean;
}

const PrintableView = ({story, scenes, options}: {story: Story, scenes: Scene[], options: PrintOptions}) => {
    
    const sceneChunks: Scene[][] = [];
    if (options.imagesPerPage === '1') {
        scenes.forEach(scene => sceneChunks.push([scene]));
    } else {
        for (let i = 0; i < scenes.length; i += parseInt(options.imagesPerPage, 10)) {
            sceneChunks.push(scenes.slice(i, i + parseInt(options.imagesPerPage, 10)));
        }
    }

    return (
        <div className="print-only">
            {/* Title Page */}
            <div className="flex flex-col items-center justify-center h-screen">
                 <h1 className="text-5xl font-bold mb-4 text-center">{story.title}</h1>
                 <p className="text-xl mt-4 text-center max-w-3xl">{story.summary}</p>
            </div>
           
            {/* Scenes */}
            {sceneChunks.map((chunk, chunkIndex) => (
                 <div key={chunkIndex} className="page-break-before">
                    <div className={cn(
                        "grid gap-8 items-start h-full",
                        options.imagesPerPage === '1' && "grid-cols-1 grid-rows-1",
                        options.imagesPerPage === '2' && "grid-cols-1 grid-rows-2",
                        options.imagesPerPage === '4' && "grid-cols-2 grid-rows-2",
                    )}>
                        {chunk.map((scene) => {
                            const sceneNumber = scenes.findIndex(s => s.id === scene.id) + 1;
                            return (
                                <div key={scene.id} className="flex flex-col h-full border-2 rounded-lg p-4">
                                    <div className="flex-1 space-y-2">
                                        {options.includeNumbers && <h2 className="text-2xl font-bold">{sceneNumber}. {scene.title}</h2>}
                                        {!options.includeNumbers && <h2 className="text-2xl font-bold">{scene.title}</h2>}
                                        
                                        {options.includeNarration && (
                                            <div className="space-y-1">
                                                <h3 className="font-semibold">Narration:</h3>
                                                <p className="text-base">{scene.narrationText}</p>
                                            </div>
                                        )}
                                        {options.includePrompts && scene.aiPromptUsed && (
                                            <div className="space-y-1">
                                                <h3 className="font-semibold">Visual Prompt:</h3>
                                                <p className="text-sm italic text-gray-600">{scene.aiPromptUsed}</p>
                                            </div>
                                        )}
                                    </div>
                                    {options.includeImages && (
                                         <div className="mt-4 aspect-video bg-gray-100 border rounded-lg flex items-center justify-center">
                                           {scene.imageUrl ? (
                                                <img src={scene.imageUrl} alt={scene.title} className="w-full h-full object-contain rounded-md"/>
                                            ) : (
                                                <div className="text-gray-500 flex flex-col items-center">
                                                   <ImageIcon className="w-16 h-16" />
                                                   <span>No Visual</span>
                                                </div>
                                            )}
                                       </div>
                                    )}
                               </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}

function downloadDataUri(dataUri: string, filename: string) {
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function ExportPage({ story, scenes, onStoryUpdate, onBack }: ExportPageProps) {
    const { toast } = useToast();
    const [shareUrl, setShareUrl] = useState('');
    const [printOptions, setPrintOptions] = useState<PrintOptions>({
        imagesPerPage: '2',
        includeImages: true,
        includeNarration: true,
        includePrompts: false,
        includeNumbers: true,
    });

    useEffect(() => {
      if (typeof window !== 'undefined') {
        setShareUrl(window.location.href);
      }
    }, []);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onStoryUpdate({...story, title: e.target.value});
    }

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onStoryUpdate({...story, summary: e.target.value});
    }

    const handleCopyToClipboard = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            toast({
                title: "Link Copied!",
                description: "The shareable link has been copied to your clipboard.",
            });
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            toast({
                variant: "destructive",
                title: "Copy Failed",
                description: "Could not copy the link to your clipboard.",
            });
        });
    };
    
    const handleDownloadAllImages = () => {
        const imageScenes = scenes.filter(s => s.imageUrl);
        if (imageScenes.length === 0) {
            toast({ title: "No Images to Download", description: "Generate some scene visuals first."});
            return;
        }
        imageScenes.forEach((scene, index) => {
            const filename = `scene_${index + 1}_${scene.title.replace(/\s+/g, '_')}.png`;
            downloadDataUri(scene.imageUrl, filename);
        });
        toast({ title: "Image Download Started", description: `Downloading ${imageScenes.length} images.`});
    };

    const handleDownloadAllVoiceovers = () => {
        const voiceoverScenes = scenes.filter(s => s.voiceoverUrl);
         if (voiceoverScenes.length === 0) {
            toast({ title: "No Voiceovers to Download", description: "Generate some voiceovers first."});
            return;
        }
        voiceoverScenes.forEach((scene, index) => {
            const filename = `scene_${index + 1}_${scene.title.replace(/\s+/g, '_')}.wav`;
            downloadDataUri(scene.voiceoverUrl!, filename);
        });
        toast({ title: "Voiceover Download Started", description: `Downloading ${voiceoverScenes.length} voiceovers.`});
    };
    
    const showComingSoonToast = (featureName: string) => {
        toast({
            title: "Coming Soon!",
            description: `${featureName} is a planned feature and will be available in a future update.`,
        });
    };


  return (
    <>
    <div className="h-full overflow-y-auto p-4 md:p-8 space-y-8 bg-muted/30 no-print">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <Button variant="outline" onClick={onBack} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Scene Editor
            </Button>
            <h1 className="text-4xl font-bold tracking-tight">Review & Export Your Storyboard</h1>
            <p className="text-muted-foreground mt-2">
                Here's your complete storyboard. Review scenes, manage settings, and export your project in various formats.
            </p>
        </div>

        {/* Storyboard View */}
        <Card>
            <CardHeader>
                <CardTitle>Your Complete Storyboard</CardTitle>
                <CardDescription>A gallery of all your scenes. Click a scene to jump back to the editor.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {scenes.map((scene, index) => (
                        <Card key={scene.id} className="overflow-hidden group relative">
                            <div className="relative aspect-video bg-muted">
                                {scene.imageUrl ? (
                                    <img src={scene.imageUrl} alt={scene.title} className="w-full h-full object-cover"/>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                                        <ImageIcon className="w-8 h-8"/>
                                    </div>
                                )}
                                <div className="absolute top-2 left-2 p-1 bg-black/50 rounded-full text-white text-xs font-bold w-6 h-6 flex items-center justify-center">
                                    {index + 1}
                                </div>
                                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="secondary" size="sm" onClick={onBack}><Edit className="mr-2 h-4 w-4"/> Edit Scene</Button>
                                </div>
                            </div>
                            <div className="p-3">
                                <h4 className="font-semibold truncate">{scene.title}</h4>
                                <p className="text-xs text-muted-foreground truncate">{scene.narrationText}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Project Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Project Settings</CardTitle>
                    <CardDescription>Manage your project details and collaboration settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="projectTitle">Project Title</Label>
                        <Input id="projectTitle" value={story.title} onChange={handleTitleChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="projectSummary">Project Summary</Label>
                        <Textarea id="projectSummary" value={story.summary} onChange={handleDescriptionChange} placeholder="A brief overview of the project." />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                        <h4 className="font-medium">Collaboration</h4>
                        <div className="flex gap-2">
                            <Input placeholder="Invite by email..."/>
                            <Button onClick={() => showComingSoonToast('Email Invites')}>Send Invite</Button>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Switch id="public-sharing" onCheckedChange={(checked) => showComingSoonToast('Public Sharing')} />
                            <Label htmlFor="public-sharing">Enable Public Link Sharing</Label>
                        </div>
                    </div>
                    
                    <Separator />

                    <div className="space-y-2">
                        <h4 className="font-medium">Version History</h4>
                        <Button variant="outline" className="w-full" onClick={() => showComingSoonToast('Version History')}>
                            <GitBranch className="mr-2 h-4 w-4" /> View Version History
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
                <CardHeader>
                    <CardTitle>Export Options</CardTitle>
                    <CardDescription>Choose your desired format to share or save your work.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4 p-4 border rounded-lg">
                        <h4 className="font-medium">Export as PDF</h4>
                        <div className="space-y-2">
                            <Label>Layout Options</Label>
                             <Select 
                                value={printOptions.imagesPerPage} 
                                onValueChange={(v) => setPrintOptions(prev => ({...prev, imagesPerPage: v as '1'|'2'|'4'}))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select layout" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 Image per Page</SelectItem>
                                    <SelectItem value="2">2 Images per Page</SelectItem>
                                    <SelectItem value="4">Grid Layout (4 per page)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="include-images" checked={printOptions.includeImages} onCheckedChange={(checked) => setPrintOptions(prev => ({...prev, includeImages: !!checked}))}/>
                                <Label htmlFor="include-images">Scene Images</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="include-narration" checked={printOptions.includeNarration} onCheckedChange={(checked) => setPrintOptions(prev => ({...prev, includeNarration: !!checked}))} />
                                <Label htmlFor="include-narration">Narration Text</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="include-prompts" checked={printOptions.includePrompts} onCheckedChange={(checked) => setPrintOptions(prev => ({...prev, includePrompts: !!checked}))}/>
                                <Label htmlFor="include-prompts">Visual Prompts</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <Checkbox id="include-numbers" checked={printOptions.includeNumbers} onCheckedChange={(checked) => setPrintOptions(prev => ({...prev, includeNumbers: !!checked}))} />
                                <Label htmlFor="include-numbers">Scene Numbers</Label>
                            </div>
                        </div>
                        <Button className="w-full" onClick={() => window.print()}>
                            <Download className="mr-2 h-4 w-4" /> Generate PDF
                        </Button>
                    </div>

                    <div className="space-y-4 p-4 border rounded-lg">
                        <h4 className="font-medium">Batch Export</h4>
                        <Button variant="outline" className="w-full" onClick={handleDownloadAllImages}><ImageIcon className="mr-2 h-4 w-4" /> Download All Images</Button>
                        <Button variant="outline" className="w-full" onClick={handleDownloadAllVoiceovers}><Speaker className="mr-2 h-4 w-4" /> Download All Voiceovers</Button>
                    </div>
                    
                     <div className="space-y-4 p-4 border rounded-lg">
                        <h4 className="font-medium">Share</h4>
                         <div className="flex gap-2">
                            <Input value={shareUrl} readOnly placeholder="Generating share link..."/>
                            <Button variant="secondary" size="icon" onClick={() => handleCopyToClipboard(shareUrl)}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
    <PrintableView story={story} scenes={scenes} options={printOptions} />
    </>
  );
}

    