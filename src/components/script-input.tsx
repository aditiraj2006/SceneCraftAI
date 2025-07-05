import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';

interface ScriptInputProps {
  script: string;
  setScript: (script: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export function ScriptInput({ script, setScript, onGenerate, isLoading }: ScriptInputProps) {
  return (
    <Card className="w-full max-w-2xl shadow-2xl shadow-primary/10 animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Craft Your Scene</CardTitle>
        <CardDescription>
          Enter your film script or a story prompt below. Our AI will analyze it to create a visual storyboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="E.g., INT. COFFEE SHOP - DAY. JANE (30s) sits alone, staring at a photo..."
          className="min-h-[250px] text-base resize-none"
          value={script}
          onChange={(e) => setScript(e.target.value)}
        />
      </CardContent>
      <CardFooter>
        <Button size="lg" className="w-full" onClick={onGenerate} disabled={isLoading || !script.trim()}>
          {isLoading ? 'Generating...' : 'Generate Storyboard'}
          {!isLoading && <Wand2 className="ml-2 h-5 w-5" />}
        </Button>
      </CardFooter>
    </Card>
  );
}
