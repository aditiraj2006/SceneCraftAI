import { Film } from 'lucide-react';

export function Header() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center border-b border-border/50 backdrop-blur-sm bg-background/50 sticky top-0 z-50">
      <a className="flex items-center justify-center" href="/">
        <Film className="h-6 w-6 text-primary" />
        <span className="ml-3 text-xl font-bold font-headline tracking-tight">SceneCraft AI</span>
      </a>
    </header>
  );
}
