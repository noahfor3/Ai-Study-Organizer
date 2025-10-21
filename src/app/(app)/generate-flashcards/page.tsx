
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Layers, Loader2, AlertTriangle } from 'lucide-react';
import { generateFlashcards, GenerateFlashcardsInput, GenerateFlashcardsOutput } from '@/ai/flows/generate-flashcards-flow';
import FlashcardViewer from '@/components/flashcard-viewer';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Flashcard {
  front: string;
  back: string;
}

export default function GenerateFlashcardsPage() {
  const [documentContent, setDocumentContent] = React.useState('');
  const [flashcards, setFlashcards] = React.useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);

  const handleGenerate = async () => {
    if (documentContent.trim().length < 50) {
        setFormError("Please enter at least 50 characters of text to generate flashcards.");
        return;
    }
    setFormError(null);
    setIsLoading(true);
    setError(null);
    setFlashcards([]);

    try {
      const input: GenerateFlashcardsInput = { documentContent };
      const result: GenerateFlashcardsOutput = await generateFlashcards(input);
      if (result.flashcards && result.flashcards.length > 0) {
        setFlashcards(result.flashcards);
      } else {
        setError("No flashcards were generated. Try adjusting your input text or try again.");
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred while generating flashcards.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center py-8">
      <div className="w-full max-w-2xl mb-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Layers className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">Generate Flashcards</CardTitle>
          </div>
          <CardDescription>
            Paste your study material below, and our AI will create flashcards to help you learn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="documentContent">Document Content</Label>
            <Textarea
              id="documentContent"
              placeholder="Paste your notes, textbook excerpts, or any text you want to turn into flashcards here..."
              rows={10}
              value={documentContent}
              onChange={(e) => {
                setDocumentContent(e.target.value);
                if (e.target.value.trim().length >= 50) {
                    setFormError(null);
                }
              }}
              className={formError ? "border-destructive" : ""}
            />
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <p className="text-xs text-muted-foreground">
              Minimum 50 characters required. The more detailed the text, the better the flashcards.
            </p>
          </div>
          <Button onClick={handleGenerate} disabled={isLoading || documentContent.trim().length < 50} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Flashcards'
            )}
          </Button>
        </CardContent>
      </Card>

      {(error || (flashcards && flashcards.length > 0)) && (
        <div className="w-full max-w-2xl mt-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Generating Flashcards</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {flashcards.length > 0 && !error && <FlashcardViewer flashcards={flashcards} />}
        </div>
      )}
    </div>
  );
}
