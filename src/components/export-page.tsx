
'use client';

import { useState, useEffect } from 'react';
import type { Scene, Story } from '@/lib/types';
import { ArrowLeft, Edit, Download, Plus, Trash2, GitBranch, Share2, Copy, Image as ImageIcon, Speaker, Clapperboard } from 'lucide-react';
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
  onNavigateToTrailer: () => void;
};


function downloadDataUri(dataUri: string, filename: string) {
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function ExportPage({ story, scenes, onStoryUpdate, onBack, onNavigateToTrailer }: ExportPageProps) {
    const { toast } = useToast();
    const [shareUrl, setShareUrl] = useState('');

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
                        <Button className="w-full" onClick={() => window.print()}>
                            <Download className="mr-2 h-4 w-4" /> Generate PDF
                        </Button>
                    </div>

                    <div className="space-y-4 p-4 border rounded-lg">
                        <h4 className="font-medium">Export Assets</h4>
                        <Button variant="outline" className="w-full" onClick={handleDownloadAllImages}><ImageIcon className="mr-2 h-4 w-4" /> Download All Images</Button>
                        <Button variant="outline" className="w-full" onClick={handleDownloadAllVoiceovers}><Speaker className="mr-2 h-4 w-4" /> Download All Voiceovers</Button>
                        <Separator />
                        <Button variant="default" className="w-full bg-accent hover:bg-accent/90" onClick={onNavigateToTrailer}>
                            <Clapperboard className="mr-2 h-4 w-4" /> Generate Video Trailer
                        </Button>
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
  );
}
