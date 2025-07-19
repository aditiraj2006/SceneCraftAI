
import type { Scene, Story } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';

type PrintableViewProps = {
  story: Story;
  scenes: Scene[];
  options: {
    imagesPerPage: '1' | '2' | '4';
    includeImages: boolean;
    includeNarration: boolean;
    includePrompts: boolean;
    includeNumbers: boolean;
  };
};

export function PrintableView({ story, scenes, options }: PrintableViewProps) {
  const layoutClass = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-2',
    '4': 'grid-cols-2',
  }[options.imagesPerPage];

  const pageBreakClass = options.imagesPerPage === '1' ? 'page-break-before' : '';
  const itemHeightClass = {
    '1': 'h-[calc(100vh-4cm)]',
    '2': 'h-[calc(100vh-4cm)]',
    '4': 'h-[calc(50vh-2cm)]',
  }[options.imagesPerPage];


  return (
    <div className="print-only">
      {/* Cover Page */}
      <div className="h-screen flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-5xl font-bold">{story.title}</h1>
        <p className="mt-4 text-xl text-gray-600">A Storyboard</p>
        <p className="mt-8 max-w-2xl">{story.summary}</p>
      </div>

      {/* Scenes */}
      <div className={cn("grid gap-4 p-4", layoutClass)}>
        {scenes.map((scene, index) => (
          <div
            key={scene.id}
            className={cn(
              "flex flex-col border border-gray-300 rounded-lg overflow-hidden",
              index > 0 && pageBreakClass,
              itemHeightClass
            )}
          >
            {options.includeImages && (
              <div className="flex-1 bg-gray-100 flex items-center justify-center relative">
                {scene.imageUrl ? (
                  <img src={scene.imageUrl} alt={scene.title} className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <ImageIcon className="w-16 h-16" />
                    <span>No Image</span>
                  </div>
                )}
                 {options.includeNumbers && (
                    <div className="absolute top-4 left-4 p-2 bg-black/60 rounded-full text-white font-bold w-10 h-10 flex items-center justify-center text-lg">
                      {index + 1}
                    </div>
                )}
              </div>
            )}
            <div className="p-4 bg-white flex flex-col">
              <h2 className="font-bold text-lg">{scene.title}</h2>
              {options.includeNarration && (
                <p className="text-gray-700 mt-2 text-sm">{scene.narrationText}</p>
              )}
              {options.includePrompts && scene.aiPromptUsed && (
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
