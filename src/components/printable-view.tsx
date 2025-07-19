
import type { Scene, Story } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';

type PrintableViewProps = {
  story: Story;
  scenes: Scene[];
};

export function PrintableView({ story, scenes }: PrintableViewProps) {

  return (
    <div className="print-only">
      {/* Cover Page */}
      <div className="h-screen flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-5xl font-bold">{story.title}</h1>
        <p className="mt-4 text-xl text-gray-600">A Storyboard</p>
        <p className="mt-8 max-w-2xl">{story.summary}</p>
      </div>

      {/* Scenes */}
      <div className={cn("grid grid-cols-2 gap-4 p-4")}>
        {scenes.map((scene, index) => (
          <div
            key={scene.id}
            className={cn(
              "flex flex-col border border-gray-300 rounded-lg overflow-hidden h-[calc(50vh-2cm)]",
              index % 4 === 0 ? "page-break-before" : ""
            )}
          >
            <div className="flex-1 bg-gray-100 flex items-center justify-center relative">
                {scene.imageUrl ? (
                  <img src={scene.imageUrl} alt={scene.title} className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <ImageIcon className="w-16 h-16" />
                    <span>No Image</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 p-2 bg-black/60 rounded-full text-white font-bold w-10 h-10 flex items-center justify-center text-lg">
                    {index + 1}
                </div>
              </div>
            <div className="p-4 bg-white flex flex-col">
              <h2 className="font-bold text-lg">{scene.title}</h2>
                <p className="text-gray-700 mt-2 text-sm">{scene.narrationText}</p>
                {scene.aiPromptUsed && (
                <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  <strong>Prompt:</strong> {scene.aiPromptUsed}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
