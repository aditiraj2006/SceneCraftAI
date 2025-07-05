'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { ScriptInput } from '@/components/script-input';
import { AnalysisView } from '@/components/analysis-view';
import { StoryboardEditor } from '@/components/storyboard-editor';
import { TrailerView } from '@/components/trailer-view';
import { useToast } from "@/hooks/use-toast";

import { analyzeScript, type AnalyzeScriptOutput } from '@/ai/flows/analyze-script';
import { generateStoryboard, type GenerateStoryboardOutput } from '@/ai/flows/generate-storyboard';
import { generateTrailer, type GenerateTrailerOutput } from '@/ai/flows/generate-trailer';

type Step = 'script' | 'analysis' | 'storyboard' | 'trailer';

export default function Home() {
  const [step, setStep] = useState<Step>('script');
  const [script, setScript] = useState<string>('A lone astronaut drifts in a small capsule, silence broken only by the crackle of the radio. Earth is a distant blue marble. Suddenly, a red light flashes on the console. An alien signal.');
  const [analysis, setAnalysis] = useState<AnalyzeScriptOutput | null>(null);
  const [storyboard, setStoryboard] = useState<GenerateStoryboardOutput | null>(null);
  const [trailer, setTrailer] = useState<GenerateTrailerOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleGenerateStoryboard = async () => {
    setIsLoading(true);
    try {
      // Step 1: Analyze script
      const analysisResult = await analyzeScript({ script });
      setAnalysis(analysisResult);
      setStep('analysis');

      // Step 2: Generate storyboard
      const storyboardResult = await generateStoryboard({
        scriptAnalysis: analysisResult.summary,
        frameDetails: analysisResult.keyScenes,
      });
      setStoryboard(storyboardResult);
      setStep('storyboard');
    } catch (error) {
      console.error(error);
      toast({
        title: "Error Generating Storyboard",
        description: "An unexpected error occurred while creating the storyboard. Please check the console and try again.",
        variant: "destructive"
      });
      setStep('script'); // Reset to start
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateTrailer = async (editedStoryboard: { imageUrl: string; sceneDescription: string }[]) => {
    setIsLoading(true);
    try {
      const trailerResult = await generateTrailer({
        storyboard: editedStoryboard,
        trailerPrompt: "Create a dramatic and suspenseful trailer, similar to trailers for science fiction films like 'Interstellar' or 'Gravity'."
      });
      setTrailer(trailerResult);
      setStep('trailer');
    } catch (error) {
        console.error(error);
        toast({
            title: "Error Generating Trailer",
            description: "An unexpected error occurred while creating the trailer. Please check the console and try again.",
            variant: "destructive"
        });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setStep('script');
    setScript('A lone astronaut drifts in a small capsule, silence broken only by the crackle of the radio. Earth is a distant blue marble. Suddenly, a red light flashes on the console. An alien signal.');
    setAnalysis(null);
    setStoryboard(null);
    setTrailer(null);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full h-full flex items-center justify-center">
          {step === 'script' && <ScriptInput script={script} setScript={setScript} onGenerate={handleGenerateStoryboard} isLoading={isLoading} />}
          {step === 'analysis' && analysis && <AnalysisView analysis={analysis} />}
          {step === 'storyboard' && storyboard && analysis && <StoryboardEditor storyboard={storyboard} analysis={analysis} onGenerateTrailer={handleGenerateTrailer} isLoading={isLoading} />}
          {step === 'trailer' && trailer && <TrailerView trailer={trailer} onRestart={handleRestart} />}
        </div>
      </main>
    </div>
  );
}
