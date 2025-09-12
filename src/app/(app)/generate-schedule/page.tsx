
"use client";

import * as React from "react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Wand2, Zap, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function GenerateSchedulePage() {
  const [progress, setProgress] = React.useState(0);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isComplete, setIsComplete] = React.useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setIsComplete(false);
    setProgress(0);
    
    // Simulate progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress <= 100) {
        setProgress(currentProgress);
      } else {
        clearInterval(interval);
        setIsGenerating(false);
        setIsComplete(true);
      }
    }, 300);
  };

  return (
    <div className="flex flex-col items-center py-8">
      <div className="w-full max-w-xl mb-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <Card className="w-full max-w-xl shadow-lg text-center">
        <CardHeader>
          <div className="flex items-center justify-center gap-3 mb-2">
            <Wand2 className="h-10 w-10 text-primary" />
            <CardTitle className="text-3xl">Generate Your Study Schedule</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Let our AI craft the perfect study plan based on your courses and availability.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 py-10">
          {!isGenerating && !isComplete && (
            <Zap className="h-24 w-24 text-primary mx-auto animate-pulse" />
          )}
          
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating} 
            size="lg" 
            className="w-full max-w-xs mx-auto text-lg py-6"
          >
            {isGenerating ? "Generating..." : isComplete ? "Generate Again" : "Start Generation"}
          </Button>

          {(isGenerating || isComplete) && (
            <div className="pt-4 space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {isGenerating && `Processing... ${progress}%`}
                {isComplete && "Schedule generation complete!"}
              </p>
            </div>
          )}

          {isComplete && (
             <Alert className="mt-6 text-left">
              <Wand2 className="h-4 w-4" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Your personalized study schedule has been generated. You can view it on the <a href="/schedule-view" className="font-medium text-primary hover:underline">Schedule View</a> page.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
