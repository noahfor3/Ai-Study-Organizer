'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, NotebookPen, Loader2, AlertTriangle } from 'lucide-react';
import { generateNotes, GenerateNotesInput, GenerateNotesOutput } from '@/ai/flows/generate-notes-flow';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function GenerateNotesPage() {
  const [documentContent, setDocumentContent] = React.useState('');
  const [generatedNotes, setGeneratedNotes] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);

  const handleGenerate = async () => {
    if (documentContent.trim().length < 50) {
        setFormError("Please enter at least 50 characters of text to generate notes.");
        return;
    }
    setFormError(null);
    setIsLoading(true);
    setError(null);
    setGeneratedNotes(null);

    try {
      const input: GenerateNotesInput = { documentContent };
      const result: GenerateNotesOutput = await generateNotes(input);
      if (result.notes) {
        setGeneratedNotes(result.notes);
      } else {
        setError("No notes were generated. Try adjusting your input text or try again.");
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred while generating notes.');
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
            <NotebookPen className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">Generate Study Notes</CardTitle>
          </div>
          <CardDescription>
            Paste your study material below, and our AI will create structured notes for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="documentContent">Document Content</Label>
            <Textarea
              id="documentContent"
              placeholder="Paste your notes, textbook excerpts, or any text you want to turn into study notes here..."
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
              Minimum 50 characters required. The more detailed the text, the better the notes.
            </p>
          </div>
          <Button onClick={handleGenerate} disabled={isLoading || documentContent.trim().length < 50} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Notes...
              </>
            ) : (
              'Generate Notes'
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="w-full max-w-2xl mt-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Generating Notes</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {generatedNotes && !error && (
        <Card className="w-full max-w-2xl mt-8 shadow-lg">
          <CardHeader>
            <CardTitle>Generated Notes</CardTitle>
            <CardDescription>Here are the notes based on your provided content.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/50 rounded-md border min-h-[200px] whitespace-pre-wrap text-sm">
              {generatedNotes}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
