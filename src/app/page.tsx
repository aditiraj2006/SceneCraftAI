'use client';

import { useState } from 'react';
import type { Scene, Story } from '@/lib/types';
import { InitialInputPage } from '@/components/initial-input-page';
import { SummaryPage } from '@/components/summary-page';
import { EditorPage } from '@/components/editor-page';
import { Header } from '@/components/header';
import { ExportPage } from '@/components/export-page';
import { TrailerPage } from '@/components/trailer-page';
import { PrintableView } from '@/components/printable-view';

export type WorkflowStep = 'initial' | 'summary' | 'editor' | 'export' | 'trailer';

export default function MultistepStoryboarder() {
  const [step, setStep] = useState<WorkflowStep>('initial');
  const [story, setStory] = useState<Story | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const goToStep = (nextStep: WorkflowStep) => {
    setStep(nextStep);
    setError('');
  };
  
  const handleSummaryGenerated = async (generatedStory: Story) => {
    setLoading(true);
    setError('');
    try {
      setStory(generatedStory);
      const initialScenes = generatedStory.keyScenes.map((ks) => ({
        id: crypto.randomUUID(),
        title: ks.title,
        description: ks.description,
        narrationText: ks.narration,
        imageUrl: '', 
        aiPromptUsed: '',
        status: 'pending' as const,
        error: ''
      }));
      setScenes(initialScenes);
      goToStep('summary');
    } catch (error: any) {
      setError(error.message || 'Failed to generate summary');
      console.error('Summary generation error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleProceedToEditor = (updatedStory: Story) => {
    setStory(updatedStory);
    const sceneMap = new Map(scenes.map(s => [s.title, s]));
    
    const finalScenes = updatedStory.keyScenes.map((ks) => {
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
             status: 'pending' as const,
             error: ''
        }
    });

    setScenes(finalScenes);
    goToStep('editor');
  };
  
  const handleUpdateScenes = (updatedScenes: Scene[]) => {
    setScenes(updatedScenes);
  };
  
  const handleUpdateStory = (updatedStory: Story) => {
    setStory(updatedStory);
  };

  const renderStep = () => {
    switch (step) {
      case 'initial':
        return (
          <>
            <InitialInputPage onSummaryGenerated={handleSummaryGenerated} />
            {error && (
              <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg">
                <p className="font-medium">Error: {error}</p>
                <p className="text-sm mt-1">Please check your API key and billing settings.</p>
              </div>
            )}
          </>
        );
      case 'summary':
        return <SummaryPage story={story!} onProceed={handleProceedToEditor} onBack={() => goToStep('initial')} />;
      case 'editor':
        return <EditorPage initialScenes={scenes} story={story!} onScenesUpdate={handleUpdateScenes} onBack={() => goToStep('summary')} />;
      case 'export':
        return <ExportPage story={story!} scenes={scenes} onStoryUpdate={handleUpdateStory} onBack={() => goToStep('editor')} onNavigateToTrailer={() => goToStep('trailer')} />;
      case 'trailer':
        return <TrailerPage story={story!} scenes={scenes} onBack={() => goToStep('export')} />;
      default:
        return <InitialInputPage onSummaryGenerated={handleSummaryGenerated} />;
    }
  };

  const showExport = step === 'editor' || step === 'export';
  const exportAction = step === 'editor' ? () => goToStep('export') : () => window.print();
  const exportText = step === 'editor' ? 'Finish & Export' : 'Generate PDF';
  const isExportPage = step === 'export';

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <Header 
        showExport={showExport} 
        onExport={exportAction} 
        exportText={exportText}
        isExportPage={isExportPage}
      />
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-center">Generating story summary...</p>
          </div>
        </div>
      )}
      <main className="flex-1 overflow-auto no-print">
        {renderStep()}
      </main>
      {isExportPage && story && <PrintableView story={story} scenes={scenes} />}
    </div>
  );
}