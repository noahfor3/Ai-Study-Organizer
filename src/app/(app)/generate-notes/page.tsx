
/*'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ArrowLeft, NotebookPen, Loader2, AlertTriangle, Copy, Download, RefreshCw } from 'lucide-react';
import { generateNotes, GenerateNotesInput, GenerateNotesOutput } from '@/ai/flows/generate-notes-flow';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function GenerateNotesPage() {
  const [documentContent, setDocumentContent] = React.useState('');
  const [noteStyle, setNoteStyle] = React.useState<'comprehensive' | 'concise' | 'bullet-points' | 'outline'>('comprehensive');
  const [focusArea, setFocusArea] = React.useState('');
  const [generatedNotes, setGeneratedNotes] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [copySuccess, setCopySuccess] = React.useState(false);

  const handleGenerate = async () => {
    if (documentContent.trim().length < 50) {
        setFormError("Please enter at least 50 characters of text to generate notes.");
        return;
    }
    setFormError(null);
    setIsLoading(true);
    setError(null);
    setGeneratedNotes(null);
    setCopySuccess(false);

    try {
      const input: GenerateNotesInput = { 
        documentContent,
        noteStyle,
        focusArea: focusArea.trim() || undefined
      };
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

  const handleCopyNotes = async () => {
    if (generatedNotes) {
      try {
        await navigator.clipboard.writeText(generatedNotes);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy notes:', err);
      }
    }
  };

  const handleDownloadNotes = () => {
    if (generatedNotes) {
      const blob = new Blob([generatedNotes], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `study-notes-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="noteStyle">Note Style</Label>
              <Select value={noteStyle} onValueChange={(value: any) => setNoteStyle(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select note style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive (Detailed)</SelectItem>
                  <SelectItem value="concise">Concise (Brief)</SelectItem>
                  <SelectItem value="bullet-points">Bullet Points</SelectItem>
                  <SelectItem value="outline">Outline Format</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose how detailed you want your notes to be.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="focusArea">Focus Area (Optional)</Label>
              <Input
                id="focusArea"
                placeholder="e.g., key concepts, definitions, examples"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Specify what to emphasize in the notes.
              </p>
            </div>
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Notes</CardTitle>
                <CardDescription>Here are the AI-generated notes based on your content.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyNotes}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copySuccess ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadNotes}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/50 rounded-md border min-h-[200px] whitespace-pre-wrap text-sm prose prose-sm max-w-none">
              {generatedNotes}
            </div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            💡 Tip: You can copy these notes to your study materials or download them as a markdown file.
          </CardFooter>
        </Card>
      )}
    </div>
  );
}



*/
//Igonre above code/* Express application setup and configuration
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // fix here
import { Loader2, Plus, Trash2 } from "lucide-react";


export default function GenerateNotesPage() {
  const [classes, setClasses] = useState([{ name: "" }]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddClass = () => setClasses([...classes, { name: "" }]);
  const handleRemoveClass = (index: number) =>
    setClasses(classes.filter((_, i) => i !== index));
  const handleChange = (index: number, value: string) => {
    const updated = [...classes];
    updated[index].name = value;
    setClasses(updated);
  };

  const handleGenerate = async () => {
    setError("");
    setNotes("");
    setLoading(true);
    try {
      const res = await fetch("/api/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate notes");
      setNotes(data.notes);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">📝 AI Notes Generator</h1>

      {classes.map((cls, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <Input
            placeholder="Class Name"
            value={cls.name}
            onChange={(e) => handleChange(index, e.target.value)}
          />
          {classes.length > 1 && (
            <Button variant="destructive" onClick={() => handleRemoveClass(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}

      <Button onClick={handleAddClass} className="mb-4 flex items-center gap-2">
        <Plus className="h-4 w-4" /> Add Class
      </Button>

      <Button
        onClick={handleGenerate}
        disabled={loading || classes.some((c) => !c.name)}
        className="mb-4"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin h-4 w-4 mr-2" /> Generating Notes...
          </>
        ) : (
          "Generate Notes"
        )}
      </Button>

      {error && <p className="text-red-500">{error}</p>}

      {notes && (
        <Textarea
          readOnly
          value={notes}
          className="w-full min-h-[300px] mt-4"
        />
      )}
    </div>
  );
}
