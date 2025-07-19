
'use client';

import { useState } from 'react';
import type { Scene, Story } from '@/lib/types';
import { InitialInputPage } from '@/components/initial-input-page';
import { SummaryPage } from '@/components/summary-page';
import { EditorPage } from '@/components/editor-page';
import { Header } from '@/components/header';
import { ExportPage } from '@/components/export-page';


export type WorkflowStep = 'initial' | 'summary' | 'editor' | 'export';

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
                narrationText: ks.narration,
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
  
  const handleUpdateScenes = (updatedScenes: Scene[]) => {
    setScenes(updatedScenes);
  }
  
  const handleUpdateStory = (updatedStory: Story) => {
    setStory(updatedStory);
  }

  const renderStep = () => {
    switch (step) {
      case 'initial':
        return <InitialInputPage onSummaryGenerated={handleSummaryGenerated} />;
      case 'summary':
        return <SummaryPage story={story!} onProceed={handleProceedToEditor} onBack={() => goToStep('initial')} />;
      case 'editor':
        return <EditorPage initialScenes={scenes} onScenesUpdate={handleUpdateScenes} onBack={() => goToStep('summary')} />;
      case 'export':
        return <ExportPage story={story!} scenes={scenes} onStoryUpdate={handleUpdateStory} onBack={() => goToStep('editor')} />
      default:
        return <InitialInputPage onSummaryGenerated={handleSummaryGenerated} />;
    }
  };

  const showExport = step === 'editor' || step === 'export';
  const exportAction = step === 'editor' ? () => goToStep('export') : () => window.print();
  const exportText = step === 'editor' ? 'Finish & Export' : 'Export to PDF';

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <Header 
        showExport={showExport} 
        onExport={exportAction} 
        exportText={exportText}
      />
      <main className="flex-1 overflow-hidden">
        <div id="storyboard-print-area" className="h-full">
         {renderStep()}
        </div>
      </main>
    </div>
  );
}
