// components/editor-page.tsx
'use client';

import { useState } from 'react';
import type { Scene, Story } from '@/lib/types';
import { SceneCard } from '@/components/scene-card';
import { generateScene } from '@/ai/flows/generate-scene';
import { enhancePrompt } from '@/ai/flows/enhance-prompt';

interface EditorPageProps {
  initialScenes: Scene[];
  story: Story;
  onScenesUpdate: (scenes: Scene[]) => void;
  onBack: () => void;
}

export function EditorPage({ initialScenes, story, onScenesUpdate, onBack }: EditorPageProps) {
  const [scenes, setScenes] = useState<Scene[]>(initialScenes);
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);
  const [enhancingIndex, setEnhancingIndex] = useState<number | null>(null);

  const handleGenerateImage = async (sceneIndex: number) => {
    setGeneratingIndex(sceneIndex);
    
    try {
      const scene = scenes[sceneIndex];
      
      // First, enhance the prompt if needed
      let enhancedPrompt = scene.aiPromptUsed || scene.description;
      
      if (!scene.aiPromptUsed) {
        const enhanced = await enhancePrompt({ 
          basicDescription: scene.description 
        });
        enhancedPrompt = enhanced.enhancedDescription;
      }

      // Generate the image
      const result = await generateScene({ 
        prompt: enhancedPrompt 
      });

      // Update the scene
      const updatedScenes = [...scenes];
      updatedScenes[sceneIndex] = {
        ...updatedScenes[sceneIndex],
        imageUrl: result.imageUrl,
        aiPromptUsed: enhancedPrompt,
        status: 'complete',
        error: ''
      };
      
      setScenes(updatedScenes);
      onScenesUpdate(updatedScenes);
      
    } catch (error: any) {
      const updatedScenes = [...scenes];
      updatedScenes[sceneIndex] = {
        ...updatedScenes[sceneIndex],
        status: 'error',
        error: error.message
      };
      setScenes(updatedScenes);
      alert(`Failed to generate image: ${error.message}`);
    } finally {
      setGeneratingIndex(null);
    }
  };

  const handleEnhancePrompt = async (sceneIndex: number) => {
    setEnhancingIndex(sceneIndex);
    
    try {
      const scene = scenes[sceneIndex];
      const enhanced = await enhancePrompt({ 
        basicDescription: scene.description 
      });
      
      const updatedScenes = [...scenes];
      updatedScenes[sceneIndex] = {
        ...updatedScenes[sceneIndex],
        aiPromptUsed: enhanced.enhancedDescription
      };
      
      setScenes(updatedScenes);
      
    } catch (error: any) {
      alert(`Failed to enhance prompt: ${error.message}`);
    } finally {
      setEnhancingIndex(null);
    }
  };

  const handleGenerateAllImages = async () => {
    for (let i = 0; i < scenes.length; i++) {
      if (!scenes[i].imageUrl) {
        await handleGenerateImage(i);
        // Small delay between generations to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  };

  const handleUpdateScene = (sceneIndex: number, updates: Partial<Scene>) => {
    const updatedScenes = [...scenes];
    updatedScenes[sceneIndex] = { ...updatedScenes[sceneIndex], ...updates };
    setScenes(updatedScenes);
    onScenesUpdate(updatedScenes);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Storyboard Editor</h1>
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            ← Back to Summary
          </button>
          <button
            onClick={handleGenerateAllImages}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={generatingIndex !== null}
          >
            {generatingIndex !== null ? 'Generating...' : 'Generate All Images'}
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {scenes.map((scene, index) => (
          <SceneCard
            key={scene.id}
            scene={scene}
            index={index}
            onGenerateImage={() => handleGenerateImage(index)}
            onEnhancePrompt={() => handleEnhancePrompt(index)}
            onUpdateScene={(updates) => handleUpdateScene(index, updates)}
            isGenerating={generatingIndex === index}
            isEnhancing={enhancingIndex === index}
          />
        ))}
      </div>

      {scenes.some(s => s.error) && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-bold text-red-700">Generation Errors:</h3>
          {scenes.filter(s => s.error).map((scene, index) => (
            <p key={index} className="text-red-600 text-sm mt-1">
              Scene "{scene.title}": {scene.error}
            </p>
          ))}
          <p className="text-sm mt-2">
            Note: Image generation requires billing to be enabled on Google Cloud.
          </p>
        </div>
      )}
    </div>
  );
}