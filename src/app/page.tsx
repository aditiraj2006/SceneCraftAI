
'use client';

import { useState } from 'react';
import type { Scene, Story } from '@/lib/types';
import { InitialInputPage } from '@/components/initial-input-page';
import { SummaryPage } from '@/components/summary-page';
import { EditorPage } from '@/components/editor-page';
import { Header } from '@/components/header';

export type WorkflowStep = 'initial' | 'summary' | 'editor';

export default function MultistepStoryboarder() {
  const [step, setStep] = useState<WorkflowStep>('initial');
  const [story, setStory] = useState<Story | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);

  const goToStep = (nextStep: WorkflowStep) => {
    setStep(nextStep);
  };
  
  const handleSummaryGenerated = (generatedStory: Story) => {
    setStory(generatedStory);
    const initialScenes = generatedStory.keyScenes.map((ks, index) => ({
      id: crypto.randomUUID(),
      title: ks.title,
      description: ks.description,
      narrationText: `Scene ${index + 1}: Start writing your narration here.`,
      imageUrl: '', // Will be generated in the editor
      aiPromptUsed: '',
    }));
    setScenes(initialScenes);
    goToStep('summary');
  };
  
  const handleProceedToEditor = (updatedStory: Story) => {
    setStory(updatedStory);
    // Ensure scenes are updated with any changes from the summary page
    const updatedScenes = updatedStory.keyScenes.map((ks, index) => {
        const existingScene = scenes.find(s => s.title === ks.title); // This is a bit brittle, might need IDs
        return existingScene || {
             id: crypto.randomUUID(),
             title: ks.title,
             description: ks.description,
             narrationText: `Scene ${index + 1}: Start writing your narration here.`,
             imageUrl: '',
             aiPromptUsed: '',
        }
    });
    const newScenes = updatedStory.keyScenes.filter(ks => !scenes.some(s => s.title === ks.title)).map((ks, index) => ({
        id: crypto.randomUUID(),
        title: ks.title,
        description: ks.description,
        narrationText: `Scene ${index + 1}: Start writing your narration here.`,
        imageUrl: '',
        aiPromptUsed: '',
    }));
    const finalScenes = [...updatedScenes, ...newScenes];
    
    // A simple re-ordering based on the new key scenes
    const reorderedScenes = updatedStory.keyScenes.map(ks => finalScenes.find(s => s.title === ks.title)!);
    setScenes(reorderedScenes.filter(Boolean)); // Filter out any undefineds
    goToStep('editor');
  };

  const renderStep = () => {
    switch (step) {
      case 'initial':
        return <InitialInputPage onSummaryGenerated={handleSummaryGenerated} />;
      case 'summary':
        return <SummaryPage story={story!} onProceed={handleProceedToEditor} onBack={() => goToStep('initial')} />;
      case 'editor':
        return <EditorPage initialScenes={scenes} onBack={() => goToStep('summary')} />;
      default:
        return <InitialInputPage onSummaryGenerated={handleSummaryGenerated} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <Header />
      <main className="flex-1 overflow-hidden">
        {renderStep()}
      </main>
    </div>
  );
}
