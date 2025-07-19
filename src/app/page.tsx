
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
      narrationText: ks.narration,
      imageUrl: '', 
      aiPromptUsed: '',
    }));
    setScenes(initialScenes);
    goToStep('summary');
  };
  
  const handleProceedToEditor = (updatedStory: Story) => {
    setStory(updatedStory);
    const sceneMap = new Map(scenes.map(s => [s.title, s]));
    
    const finalScenes = updatedStory.keyScenes.map((ks, index) => {
        const existingScene = sceneMap.get(ks.title);
        if (existingScene) {
            return {
                ...existingScene,
                description: ks.description,
            }
        }
        return {
             id: crypto.randomUUID(),
             title: ks.title,
             description: ks.description,
             narrationText: ks.narration,
             imageUrl: '',
             aiPromptUsed: '',
        }
    });

    setScenes(finalScenes);
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
      <Header showExport={step === 'editor'} />
      <main className="flex-1 overflow-hidden">
        {renderStep()}
      </main>
    </div>
  );
}
