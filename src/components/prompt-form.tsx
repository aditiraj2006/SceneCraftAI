'use client';

import { useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Wand2, Image as ImageIcon, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { enhancePrompt } from '@/ai/flows/enhance-prompt';
import { generateScene } from '@/ai/flows/generate-scene';
import type { Scene } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: 'Prompt must be at least 10 characters.',
  }),
});

type PromptFormProps = {
  onSceneAdd: (scene: Omit<Scene, 'id'>) => void;
};

export function PromptForm({ onSceneAdd }: PromptFormProps) {
  const [isGenerating, startGenerationTransition] = useTransition();
  const [isEnhancing, startEnhancingTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  const handleEnhance = async () => {
    const currentPrompt = form.getValues('prompt');
    if (!currentPrompt) {
        form.setError("prompt", { type: "manual", message: "Please enter a prompt to enhance." });
        return;
    }
    
    startEnhancingTransition(async () => {
      try {
        const result = await enhancePrompt({ basicDescription: currentPrompt });
        form.setValue('prompt', result.enhancedDescription, { shouldValidate: true });
        toast({
          title: 'Prompt Enhanced',
          description: 'Your prompt has been enriched with cinematic details.',
        });
      } catch (error) {
        console.error('Error enhancing prompt:', error);
        toast({
          variant: 'destructive',
          title: 'Enhancement Failed',
          description: 'Could not enhance the prompt. Please try again.',
        });
      }
    });
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    startGenerationTransition(async () => {
      try {
        const result = await generateScene({ prompt: values.prompt });
        onSceneAdd({
          imageUrl: result.imageUrl,
          narrationText: 'Add narration or dialogue...',
          aiPromptUsed: values.prompt,
        });
        form.reset({ prompt: '' });
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

  return (
    <Card className="w-full border-0 md:border md:shadow-sm">
        <CardContent className="p-0 md:p-6">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Scene Prompt</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="e.g., A panoramic view of a futuristic city at sunset, with flying vehicles."
                        className="resize-y min-h-[120px]"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <div className="flex flex-col sm:flex-row gap-2">
                <Button type="button" onClick={handleEnhance} variant="outline" className="w-full" disabled={isEnhancing || isGenerating}>
                    {isEnhancing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Enhance with AI
                </Button>
                <Button type="submit" className="w-full" disabled={isGenerating || isEnhancing}>
                    {isGenerating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <ImageIcon className="mr-2 h-4 w-4" />
                    )}
                    Generate Scene
                </Button>
                </div>
            </form>
            </Form>
        </CardContent>
    </Card>

  );
}
