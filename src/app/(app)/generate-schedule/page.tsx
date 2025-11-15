/* "use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Wand2, Zap, ArrowLeft, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function GenerateSchedulePage() {
  const [progress, setProgress] = React.useState(0);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isComplete, setIsComplete] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [generatedData, setGeneratedData] = React.useState<any>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setIsComplete(false);
    setProgress(0);
    setError(null);
    setGeneratedData(null);

    try {
      let interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 5 : prev));
      }, 400);

      const res = await fetch("/api/generate-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courses: ["CPSC 362", "CPSC 335", "MATH 338"],
          availability: ["Mon", "Wed", "Fri"],
        }),
      });

      clearInterval(interval);

      if (!res.ok) throw new Error("Failed to generate schedule");

      const data = await res.json();
      setGeneratedData(data);
      setProgress(100);
      setIsComplete(true);
    } catch (err: any) {
      setError(err.message || "Unknown error occurred.");
    } finally {
      setIsGenerating(false);
    }
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
            Let our AI craft the perfect study plan based on your courses and free time.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 py-10">
          {!isGenerating && !isComplete && !error && (
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

          {(isGenerating || isComplete || error) && (
            <div className="pt-4 space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {isGenerating && `Processing... ${progress}%`}
                {isComplete && "Schedule generation complete!"}
                {error && "An error occurred. Please try again."}
              </p>
            </div>
          )}

          {isComplete && generatedData && (
            <div className="mt-6 text-left bg-muted p-4 rounded-xl">
              <h3 className="font-semibold text-lg mb-2">Generated Schedule:</h3>
              <ul className="space-y-2">
                {generatedData.schedule.map((item: any, index: number) => (
                  <li key={index} className="border-b pb-1 text-sm">
                    📘 {item.course} — {item.day}, {item.start}–{item.end}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-6 text-left">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
  */





/*
"use client";

import { useState } from "react";

export default function GenerateSchedulePage() {
  const [classes, setClasses] = useState("");
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSchedule("");

    try {
      const res = await fetch("/api/generate-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classes }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSchedule(data.schedule);
    } catch (err: any) {
      console.error("Error generating schedule:", err);
      setSchedule("❌ Error generating schedule. Check your setup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-4">AI Study Schedule Generator</h1>

      <form onSubmit={handleGenerate} className="w-full max-w-md">
        <label className="block mb-2 font-medium">Enter your classes:</label>
        <textarea
          value={classes}
          onChange={(e) => setClasses(e.target.value)}
          className="w-full border rounded-lg p-2 text-black"
          placeholder="Example: CPSC 351, Math 338, English 101"
          rows={3}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white mt-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {loading ? "Generating..." : "Generate Schedule"}
        </button>
      </form>

      {schedule && (
        <div className="mt-6 w-full max-w-md bg-gray-100 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">📅 Generated Schedule</h2>
          <pre className="whitespace-pre-wrap text-black">{schedule}</pre>
        </div>
      )}
    </div>
  );
}

*/

/* mock version for testing without API calls
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Wand2, Zap, ArrowLeft, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function GenerateSchedulePage() {
  const [progress, setProgress] = React.useState(0);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isComplete, setIsComplete] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [generatedData, setGeneratedData] = React.useState<any>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setIsComplete(false);
    setProgress(0);
    setError(null);
    setGeneratedData(null);

    try {
      let interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 5 : prev));
      }, 400);

      const res = await fetch("/api/generate-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courses: ["CPSC 362", "CPSC 335", "MATH 338"],
          availability: ["Mon", "Wed", "Fri"],
        }),
      });

      clearInterval(interval);

      if (!res.ok) throw new Error("Failed to generate schedule");

      const data = await res.json();
      setGeneratedData(data);
      setProgress(100);
      setIsComplete(true);
    } catch (err: any) {
      setError(err.message || "Unknown error occurred.");
    } finally {
      setIsGenerating(false);
    }
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
            Let our AI craft the perfect study plan based on your courses and free time.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 py-10">
          {!isGenerating && !isComplete && !error && (
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

          {(isGenerating || isComplete || error) && (
            <div className="pt-4 space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {isGenerating && `Processing... ${progress}%`}
                {isComplete && "Schedule generation complete!"}
                {error && "An error occurred. Please try again."}
              </p>
            </div>
          )}

          {isComplete && generatedData && (
            <div className="mt-6 text-left bg-muted p-4 rounded-xl">
              <h3 className="font-semibold text-lg mb-2">Generated Schedule:</h3>
              <ul className="space-y-2">
                {generatedData.schedule.map((item: any, index: number) => (
                  <li key={index} className="border-b pb-1 text-sm">
                    📘 {item.course} — {item.day}, {item.start}–{item.end}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-6 text-left">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

*/



/* mock version for testing without API calls

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CalendarDays, Loader2, AlertTriangle } from 'lucide-react';
import { generateSchedule, GenerateScheduleInput, GenerateScheduleOutput } from '@/ai/flows/generate-schedule-flow';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function GenerateSchedulePage() {
  const [classes, setClasses] = React.useState('');
  const [schedule, setSchedule] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);

  const handleGenerate = async () => {
    if (classes.trim().length < 3) {
      setFormError("Please enter at least one valid class name.");
      return;
    }
    setFormError(null);
    setIsLoading(true);
    setError(null);
    setSchedule('');

    try {
      const input: GenerateScheduleInput = { classes };
      const result: GenerateScheduleOutput = await generateSchedule(input);
      setSchedule(result.schedule);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
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
            <CalendarDays className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">Generate Study Schedule</CardTitle>
          </div>
          <CardDescription>
            Enter your classes, and our pseudo-AI will create a custom weekly study schedule.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="classes">Classes</Label>
            <Textarea
              id="classes"
              placeholder="Example: CPSC 351, Math 338, English 101"
              rows={3}
              value={classes}
              onChange={(e) => {
                setClasses(e.target.value);
                if (e.target.value.trim().length >= 3) setFormError(null);
              }}
              className={formError ? "border-destructive" : ""}
            />
            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>
          <Button onClick={handleGenerate} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Schedule'
            )}
          </Button>
        </CardContent>
      </Card>

      {(error || schedule) && (
        <div className="w-full max-w-2xl mt-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {schedule && !error && (
            <Card className="p-4 mt-4 bg-gray-100">
              <CardHeader>
                <CardTitle>📅 Generated Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-black">{schedule}</pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
// --- Pseudo (mock) AI flow for generating study schedules ---

*/



"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2 } from "lucide-react";

type ClassEntry = {
  name: string;
  days: string;
  startTime: string;
  endTime: string;
};

export default function GenerateSchedulePage() {
  const [classes, setClasses] = useState<ClassEntry[]>([
    { name: "", days: "", startTime: "", endTime: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState("");
  const [error, setError] = useState("");

  const handleAddClass = () => {
    setClasses([...classes, { name: "", days: "", startTime: "", endTime: "" }]);
  };

  const handleRemoveClass = (index: number) => {
    setClasses(classes.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof ClassEntry, value: string) => {
    const updated = [...classes];
    updated[index][field] = value;
    setClasses(updated);
  };

  const handleGenerate = async () => {
    setError("");
    setSchedule("");
    setLoading(true);

    try {
      const res = await fetch("/api/generate-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classes }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate schedule");
      setSchedule(data.schedule);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <Card className="shadow-2xl border border-gray-200 rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-blue-700">
            🧠 AI Study Schedule Generator
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-gray-600 text-center">
            Enter your class schedule, and AI will generate a personalized,
            hour-by-hour study plan tailored to your actual courses.
          </p>

          <div className="space-y-4">
            {classes.map((cls, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-5 gap-3 border p-4 rounded-lg bg-gray-50 shadow-sm"
              >
                <Input
                  placeholder="Class Name (e.g., CPSC 351)"
                  value={cls.name}
                  onChange={(e) => handleChange(index, "name", e.target.value)}
                />
                <Input
                  placeholder="Days (e.g., Mon/Wed)"
                  value={cls.days}
                  onChange={(e) => handleChange(index, "days", e.target.value)}
                />
                <Input
                  placeholder="Start Time (e.g., 10:00 AM)"
                  value={cls.startTime}
                  onChange={(e) => handleChange(index, "startTime", e.target.value)}
                />
                <Input
                  placeholder="End Time (e.g., 11:15 AM)"
                  value={cls.endTime}
                  onChange={(e) => handleChange(index, "endTime", e.target.value)}
                />
                {classes.length > 1 && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveClass(index)}
                    className="mx-auto"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
              </div>
            ))}

            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleAddClass}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Class
              </Button>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={handleGenerate}
              disabled={loading || classes.some((cls) => !cls.name)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-xl shadow-md transition"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Schedule...
                </>
              ) : (
                "Generate My Study Plan"
              )}
            </Button>
          </div>

          {error && (
            <p className="text-center text-red-500 font-semibold">{error}</p>
          )}

          {schedule && (
            <Card className="mt-8 bg-gray-50 shadow-inner border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-blue-700">
                  📅 Your Personalized Study Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  readOnly
                  value={schedule}
                  className="w-full min-h-[400px] text-gray-800 font-medium bg-white p-4 rounded-xl border"
                />
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
