
'use client';

import { useTransition } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { summarizeStory } from '@/ai/flows/summarize-story';
import type { Story } from '@/lib/types';

const formSchema = z.object({
  storyIdea: z.string().min(20, {
    message: 'Please provide a story idea of at least 20 characters.',
  }),
});

type InitialInputPageProps = {
  onSummaryGenerated: (story: Story) => void;
};

export function InitialInputPage({ onSummaryGenerated }: InitialInputPageProps) {
  const [isGenerating, startGenerationTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storyIdea: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startGenerationTransition(async () => {
      try {
        const result = await summarizeStory({ storyIdea: values.storyIdea });
        onSummaryGenerated(result);
      } catch (error) {
        console.error('Error generating summary:', error);
        toast({
          variant: 'destructive',
          title: 'Generation Failed',
          description: 'Could not generate story summary. Please try again.',
        });
      }
    });
  };

  return (
    <div className="container mx-auto max-w-3xl h-full flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">SceneCraft AI: Storyboard Creator</h1>
        <p className="text-lg text-muted-foreground">
          Transform your ideas into visual stories. Start by entering your script or story concept below, and let our AI help you build the perfect storyboard.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mt-8 space-y-6">
          <FormField
            control={form.control}
            name="storyIdea"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Your Story Idea</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter your story idea or script here..."
                    className="min-h-[200px] text-base p-4 rounded-lg shadow-inner"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="lg" className="w-full" disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-5 w-5" />
            )}
            Generate Storyboard
          </Button>
        </form>
      </Form>
    </div>
  );
}
