
'use client';

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

type ExportPageProps = {
  story: Story;
  scenes: Scene[];
  onStoryUpdate: (story: Story) => void;
  onBack: () => void;
};

export function ExportPage({ story, scenes, onStoryUpdate, onBack }: ExportPageProps) {
    
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onStoryUpdate({...story, title: e.target.value});
    }

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // This is a placeholder as story doesn't have a description field yet
    }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 space-y-8 bg-muted/30">
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
                        <Label htmlFor="projectDescription">Project Description</Label>
                        <Textarea id="projectDescription" placeholder="A brief overview of the project." />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4 opacity-50 cursor-not-allowed">
                        <h4 className="font-medium">Collaboration (Coming Soon)</h4>
                        <div className="flex gap-2">
                            <Input placeholder="Invite by email..." disabled/>
                            <Button disabled>Send Invite</Button>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Switch id="public-sharing" disabled />
                            <Label htmlFor="public-sharing">Enable Public Link Sharing</Label>
                        </div>
                    </div>
                    
                    <Separator />

                    <div className="space-y-2 opacity-50 cursor-not-allowed">
                        <h4 className="font-medium">Version History (Coming Soon)</h4>
                        <Button variant="outline" className="w-full" disabled>
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
                             <Select defaultValue="2">
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
                                <Checkbox id="include-images" defaultChecked/>
                                <Label htmlFor="include-images">Scene Images</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="include-narration" defaultChecked/>
                                <Label htmlFor="include-narration">Narration Text</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="include-prompts" />
                                <Label htmlFor="include-prompts">Visual Prompts</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <Checkbox id="include-numbers" defaultChecked/>
                                <Label htmlFor="include-numbers">Scene Numbers</Label>
                            </div>
                        </div>
                        <Button className="w-full" onClick={() => window.print()}>
                            <Download className="mr-2 h-4 w-4" /> Generate PDF
                        </Button>
                    </div>

                    <div className="space-y-4 p-4 border rounded-lg opacity-50 cursor-not-allowed">
                        <h4 className="font-medium">Batch Export (Coming Soon)</h4>
                        <Button variant="outline" className="w-full" disabled><ImageIcon className="mr-2 h-4 w-4" /> Download All Images (.zip)</Button>
                        <Button variant="outline" className="w-full" disabled><Speaker className="mr-2 h-4 w-4" /> Download All Voiceovers (.zip)</Button>
                    </div>
                    
                     <div className="space-y-4 p-4 border rounded-lg opacity-50 cursor-not-allowed">
                        <h4 className="font-medium">Share (Coming Soon)</h4>
                         <div className="flex gap-2">
                            <Input value="https://scenecraft.ai/share/..." readOnly disabled />
                            <Button variant="secondary" size="icon" disabled><Copy className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
