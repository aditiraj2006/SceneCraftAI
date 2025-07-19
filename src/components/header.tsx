
'use client';

import { Film, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

type HeaderProps = {
  showExport?: boolean;
  onExport?: () => void;
  exportText?: string;
  isExportPage?: boolean;
}

export function Header({ showExport = true, onExport, exportText = 'Finish & Export', isExportPage = false }: HeaderProps) {

  const handleExportClick = () => {
    if (isExportPage) {
      window.print();
    } else if (onExport) {
      onExport();
    }
  }

  return (
    <header className="no-print flex items-center justify-between p-4 border-b bg-card shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Film className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold font-headline tracking-tight">
          SceneCraft AI
        </h1>
      </div>
      {showExport && (
        <Button onClick={handleExportClick} variant="default" className="bg-primary hover:bg-primary/90">
            <FileDown className="w-4 h-4 mr-2" />
            {exportText}
        </Button>
      )}
    </header>
  );
}
