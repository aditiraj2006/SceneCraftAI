import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { AnalyzeScriptOutput } from '@/ai/flows/analyze-script';

interface AnalysisViewProps {
  analysis: AnalyzeScriptOutput;
}

export function AnalysisView({ analysis }: AnalysisViewProps) {
  return (
    <div className="w-full max-w-4xl space-y-8 animate-in fade-in-50 duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold font-headline">Analyzing Your Script...</h1>
        <p className="text-muted-foreground">Our AI is breaking down your story. Here's what we've found:</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{analysis.summary}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Key Scenes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              {analysis.keyScenes.map((scene, i) => <li key={i}>{scene}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>
       <div className="text-center space-y-4 pt-8">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <h2 className="text-2xl font-semibold font-headline">Generating Storyboard</h2>
        <p className="text-muted-foreground">Please wait while our visual AI brings your scenes to life.</p>
      </div>
    </div>
  );
}
