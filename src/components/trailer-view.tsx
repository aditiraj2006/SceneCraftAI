import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Repeat } from 'lucide-react';
import type { GenerateTrailerOutput } from '@/ai/flows/generate-trailer';

interface TrailerViewProps {
  trailer: GenerateTrailerOutput;
  onRestart: () => void;
}

export function TrailerView({ trailer, onRestart }: TrailerViewProps) {
  return (
    <div className="w-full max-w-3xl space-y-6 animate-in fade-in-50 duration-500">
      <Card className="shadow-2xl shadow-primary/10">
        <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold font-headline">Your Cinematic Trailer is Ready!</CardTitle>
            <CardDescription>Experience your story brought to life.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="aspect-video bg-black rounded-lg overflow-hidden border">
            <video
              src={trailer.trailerVideo}
              controls
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-lg">Voiceover Track</h3>
            <audio src={trailer.voiceOver} controls className="w-full">
              Your browser does not support the audio element.
            </audio>
          </div>
        </CardContent>
        <CardFooter className="flex-col sm:flex-row justify-center gap-4">
            <Button onClick={() => window.open(trailer.trailerVideo, '_blank')}>
              <Download className="mr-2 h-4 w-4" />
              Download Video
            </Button>
            <Button variant="outline" onClick={onRestart}>
              <Repeat className="mr-2 h-4 w-4" />
              Create Another
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
