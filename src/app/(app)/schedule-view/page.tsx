"use client";

import * as React from "react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Edit3, Save, PlusCircle, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import ClientFormattedDate from "@/components/client-formatted-date";
import { generateScheduleViewFlow, GenerateScheduleViewInput, GenerateScheduleViewOutput } from '@/ai/flows/generate-schedule-view-flow';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Helper for consistent date formatting
const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

// Group events by date
const groupEventsByDate = (events: GenerateScheduleViewOutput['events']) => {
  return events.reduce((acc, event) => {
    const dateString = new Date(event.date).toDateString();
    if (!acc[dateString]) acc[dateString] = [];
    acc[dateString].push(event);
    return acc;
  }, {} as Record<string, GenerateScheduleViewOutput['events']>);
};

export default function ScheduleViewPage() {
  const [events, setEvents] = React.useState<GenerateScheduleViewOutput['events']>([]);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch AI-generated schedule on load
  React.useEffect(() => {
    const fetchSchedule = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const input: GenerateScheduleViewInput = { userId: 'dummy-user-123' }; // Replace with real user ID
        const result: GenerateScheduleViewOutput = await generateScheduleViewFlow(input);
        setEvents(result.events || []);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Failed to generate schedule.';
        setError(errMsg);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const groupedEvents = groupEventsByDate(events);
  const sortedDates = Object.keys(groupedEvents).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <div className="flex flex-col py-8">
      {/* Back Button */}
      <div className="w-full mb-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Loading or Error */}
      {isLoading && (
        <div className="text-center py-10 text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="animate-spin h-5 w-5" /> Generating your schedule...
        </div>
      )}
      {error && (
        <Alert variant="destructive" className="w-full max-w-2xl mx-auto mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Schedule Card */}
      {!isLoading && !error && (
        <Card className="w-full shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <CalendarIcon className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">Your Study Schedule</CardTitle>
              </div>
              <CardDescription>View and manage your upcoming study sessions.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                <Edit3 className="mr-2 h-4 w-4" /> {isEditing ? "Cancel Edit" : "Edit Schedule"}
              </Button>
              {isEditing && (
                <Button onClick={() => setIsEditing(false)}>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="mt-4">
            {sortedDates.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">
                No study sessions scheduled. <a href="/generate-schedule" className="text-primary hover:underline">Generate a schedule</a> to get started.
              </p>
            ) : (
              <div className="space-y-6">
                {sortedDates.map(dateString => (
                  <div key={dateString}>
                    <h3 className="text-lg font-semibold mb-3 border-b pb-2">
                      <ClientFormattedDate dateString={dateString} options={DATE_FORMAT_OPTIONS} />
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupedEvents[dateString].map(event => (
                        <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className={`h-2 ${event.color || 'bg-gray-400'}`}></div>
                          <CardHeader className="pt-3 pb-2">
                            <CardTitle className="text-base">{event.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="text-sm space-y-1 pb-3">
                            <div><Badge variant="secondary">{event.course}</Badge></div>
                            <p className="text-muted-foreground">{event.time}</p>
                            {isEditing && (
                              <div className="pt-2 flex gap-2">
                                <Button size="sm" variant="outline">Edit</Button>
                                <Button size="sm" variant="destructive">Delete</Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {isEditing && (
              <div className="mt-8 text-center">
                <Button variant="default" size="lg">
                  <PlusCircle className="mr-2 h-5 w-5" /> Add New Session
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/*
✅ What’s included

Calls generateScheduleViewFlow on page load to fetch AI-generated schedule.

Loading spinner while AI generates events.

Error handling if the AI fails.

Groups events by date, just like the original mock data.

Supports edit mode, with Add/Edit/Delete buttons.

Fully compatible with your AI Study Organizer vision.
*/