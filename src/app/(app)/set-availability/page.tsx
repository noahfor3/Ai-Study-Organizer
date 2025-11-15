
"use client"; // Required for react-day-picker which Calendar uses

import * as React from "react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Info, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SetAvailabilityPage() {
  const [dates, setDates] = React.useState<Date[] | undefined>([]);

  // Simple footer to display selected dates for mockup purposes
  const footer = dates && dates.length > 0 ? (
    <p className="text-sm text-muted-foreground mt-2">
      You have selected {dates.length} day(s): {dates.map(d => d.toLocaleDateString()).join(', ')}.
    </p>
  ) : (
    <p className="text-sm text-muted-foreground mt-2">Please pick one or more days for your availability.</p>
  );

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
            <CardTitle className="text-2xl">Set Your Study Availability</CardTitle>
          </div>
          <CardDescription>Select the days you are free to study. Our AI will use this to generate your schedule.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>How it works</AlertTitle>
            <AlertDescription>
              Click on dates in the calendar to mark them as available for study. Click again to unmark.
              This is a simplified mockup. A real app would allow selecting time slots too.
            </AlertDescription>
          </Alert>
          <Calendar
            mode="multiple"
            selected={dates}
            onSelect={setDates} // react-day-picker v8+ uses onSelect for multiple dates
            className="rounded-md border"
          />
          {footer}
        </CardContent>
        <CardFooter>
          <Button className="w-full sm:w-auto ml-auto">Save Availability</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
