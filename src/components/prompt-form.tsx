
'use client';

import { useState, useTransition, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Wand2, Sparkles, Loader2, Plus, Mic, Download, Link, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { enhancePrompt } from '@/ai/flows/enhance-prompt';
import { generateScene } from '@/ai/flows/generate-scene';
import { generateVoiceover } from '@/ai/flows/generate-voiceover';
import type { Scene, VoiceOption, Character } from '@/lib/types';
import { voiceOptions, languageOptions, type LanguageOption, characters } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  visualPrompt: z.string().min(10, {
    message: 'Prompt must be at least 10 characters.',
  }),
  narration: z.string(),
});

type PromptFormProps = {
  scene: Scene;
  allScenes: Scene[];
  referenceSceneId: string | null;
  onSetReferenceSceneId: (id: string | null) => void;
  onSceneUpdate: (sceneId: string, updatedProps: Partial<Scene>) => void;
  onSceneAdd: (newSceneData: Omit<Scene, 'id' | 'title' | 'description'>, fromSceneId: string) => void;
};

export function PromptForm({ scene, allScenes, referenceSceneId, onSetReferenceSceneId, onSceneUpdate, onSceneAdd }: PromptFormProps) {
  const [isGeneratingVisual, startVisualGenerationTransition] = useTransition();
  const [isGeneratingVoiceover, startVoiceoverGenerationTransition] = useTransition();
  const [isEnhancing, startEnhancingTransition] = useTransition();
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>('Algenib');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>('en-US');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: scene.title,
      visualPrompt: scene.aiPromptUsed || scene.description,
      narration: scene.narrationText,
    },
  });
  
  useEffect(() => {
    form.reset({
      title: scene.title,
      visualPrompt: scene.aiPromptUsed || scene.description,
      narration: scene.narrationText,
    });
  }, [scene, form]);
  
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if(name === 'narration' && value.narration !== undefined) {
        onSceneUpdate(scene.id, { narrationText: value.narration });
      }
      if(name === 'title' && value.title) {
        onSceneUpdate(scene.id, { title: value.title });
      }
      if(name === 'visualPrompt' && value.visualPrompt) {
        onSceneUpdate(scene.id, { aiPromptUsed: value.visualPrompt });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onSceneUpdate, scene.id]);

  const handleEnhance = async (field: 'visualPrompt' | 'narration') => {
    const currentValue = form.getValues(field);
    if (!currentValue) {
        form.setError(field, { type: "manual", message: "Please enter text to enhance." });
        return;
    }
    
    startEnhancingTransition(async () => {
      try {
        const result = await enhancePrompt({ basicDescription: currentValue });
        form.setValue(field, result.enhancedDescription, { shouldValidate: true });
        toast({
          title: 'Prompt Enhanced',
          description: `Your ${field === 'narration' ? 'narration' : 'visual prompt'} has been enriched.`,
        });
      } catch (error) {
        console.error(`Error enhancing ${field}:`, error);
        toast({
          variant: 'destructive',
          title: 'Enhancement Failed',
          description: `Could not enhance the ${field}. Please try again.`,
        });
      }
    });
  };

  function onGenerateVisual(values: z.infer<typeof formSchema>) {
    startVisualGenerationTransition(async () => {
      try {
        const referenceScene = allScenes.find(s => s.id === referenceSceneId);
        const selectedCharacter = characters.find(c => c.id === selectedCharacterId);
        const result = await generateScene({ 
          prompt: values.visualPrompt,
          referenceImageUrl: referenceScene?.imageUrl,
          characterDescription: selectedCharacter?.physicalDescription,
        });
        onSceneUpdate(scene.id, {
          imageUrl: result.imageUrl,
          aiPromptUsed: values.visualPrompt,
        });
      } catch (error) {
        console.error('Error generating scene:', error);
        toast({
          variant: 'destructive',
          title: 'Generation Failed',
          description: 'Could not generate the scene. Please try again.',
        });
      }
    });
  }

  const handleGenerateVoiceover = () => {
      const narration = form.getValues('narration');
      if (!narration) {
          toast({
              variant: 'destructive',
              title: 'Narration is empty',
              description: 'Please add narration text to generate a voiceover.'
          });
          return;
      }
      startVoiceoverGenerationTransition(async () => {
        try {
            const result = await generateVoiceover({ text: narration, voice: selectedVoice, languageCode: selectedLanguage });
            onSceneUpdate(scene.id, { voiceoverUrl: result.audioUrl });
            toast({
                title: 'Voiceover Generated',
                description: 'The voiceover is ready for preview.'
            });
        } catch (error) {
            console.error('Error generating voiceover:', error);
            toast({
                variant: 'destructive',
                title: 'Voiceover Failed',
                description: 'Could not generate the voiceover. Please try again.'
            });
        }
      });
  }
  
  const handleAddNewScene = () => {
      onSceneAdd({
          narrationText: 'Add narration or dialogue...',
          aiPromptUsed: 'A new scene prompt...',
          imageUrl: ''
      }, scene.id);
  }
  
  const handleDownloadVoiceover = () => {
    if (!scene.voiceoverUrl) return;
    const link = document.createElement('a');
    link.href = scene.voiceoverUrl;
    link.download = `${scene.title.replace(/\s+/g, '_')}_voiceover.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const isLoading = isEnhancing || isGeneratingVisual || isGeneratingVoiceover;

  const currentSceneIndex = allScenes.findIndex(s => s.id === scene.id);
  const availableReferenceScenes = allScenes.slice(0, currentSceneIndex).filter(s => s.imageUrl);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onGenerateVisual)} className="space-y-4 flex flex-col h-full">
        
        <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Scene Title</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., The Escape" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />

        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">Scene Narration</CardTitle>
                <Button 
                    type="button" 
                    onClick={() => handleEnhance('narration')} 
                    variant="outline" 
                    size="sm"
                    disabled={isLoading}
                >
                    {isEnhancing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Enhance
                </Button>
            </CardHeader>
            <CardContent>
                <FormField
                    control={form.control}
                    name="narration"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="sr-only">Narration</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Your narration or dialogue for this scene..."
                            className="resize-y min-h-[120px] text-base"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle className="text-xl">Scene Voiceover</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {scene.voiceoverUrl && (
                    <div className="space-y-2">
                        <audio src={scene.voiceoverUrl} controls className="w-full" />
                        <Button type="button" variant="outline" size="sm" className="w-full" onClick={handleDownloadVoiceover}>
                            <Download className="mr-2 h-4 w-4" /> Download Voiceover
                        </Button>
                    </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                    <Select onValueChange={(v) => setSelectedLanguage(v as LanguageOption)} defaultValue={selectedLanguage}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                        <SelectContent>
                            {languageOptions.options.map(lang => (
                                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select onValueChange={(v) => setSelectedVoice(v as VoiceOption)} defaultValue={selectedVoice}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a voice" />
                        </SelectTrigger>
                        <SelectContent>
                            {voiceOptions.options.map(voice => (
                                <SelectItem key={voice} value={voice}>{voice}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <Button 
                    type="button" 
                    onClick={handleGenerateVoiceover}
                    className="w-full" 
                    disabled={isLoading}
                >
                    {isGeneratingVoiceover ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Mic className="mr-2 h-4 w-4" />
                    )}
                    {scene.voiceoverUrl ? 'Regenerate Voiceover' : 'Generate Voiceover'}
                </Button>
            </CardContent>
        </Card>

        <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl">Scene Visual</CardTitle>
                 <CardDescription>Use characters and previous scenes as a visual reference for consistency.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Character</Label>
                        <Select onValueChange={(v) => setSelectedCharacterId(v)} value={selectedCharacterId || undefined}>
                             <SelectTrigger>
                                <SelectValue placeholder="Select character..." />
                            </SelectTrigger>
                            <SelectContent>
                                {characters.map((char) => (
                                     <SelectItem key={char.id} value={char.id}>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4"/>
                                            {char.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Visual Reference</Label>
                        <Select onValueChange={(v) => onSetReferenceSceneId(v)} value={referenceSceneId || undefined}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a reference scene..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableReferenceScenes.map((refScene, index) => (
                                    <SelectItem key={refScene.id} value={refScene.id}>
                                        Scene {allScenes.findIndex(s => s.id === refScene.id) + 1}: {refScene.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                 <FormField
                    control={form.control}
                    name="visualPrompt"
                    render={({ field }) => (
                        <FormItem className="flex-1 flex flex-col">
                        <FormLabel>Visual Prompt</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="e.g., A panoramic view of a futuristic city at sunset..."
                            className="resize-y flex-1 text-base"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex flex-col gap-2">
                    <Button 
                        type="button" 
                        onClick={() => handleEnhance('visualPrompt')} 
                        variant="outline" 
                        className="w-full" 
                        disabled={isLoading}
                    >
                        {isEnhancing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        Enhance with AI
                    </Button>
                    <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isLoading}
                        size="lg"
                    >
                        {isGeneratingVisual ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        {scene.imageUrl ? 'Regenerate Visual' : 'Generate Visual'}
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Button type="button" variant="secondary" onClick={handleAddNewScene}>
            <Plus className="mr-2 h-4 w-4" /> Add New Scene After This
        </Button>
      </form>
    </Form>
  );
}

    
