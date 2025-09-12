
"use client"; 

import * as React from "react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Edit3, Save, PlusCircle, ArrowLeft } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import ClientFormattedDate from "@/components/client-formatted-date";

// Helper to create consistent dates for mock data
const BASE_YEAR = 2025; // Using a fixed future year
const BASE_MONTH = 6; // July (0-indexed for Date constructor)
const BASE_DAY = 21;  // Using a fixed day

const createMockDate = (dayOffset: number, hour: number, minute: number = 0): Date => {
  return new Date(BASE_YEAR, BASE_MONTH, BASE_DAY + dayOffset, hour, minute);
};

// Mock data for study sessions with fixed dates
const mockEvents = [
  { id: "1", title: "Math: Calculus Review", date: createMockDate(0, 10, 0), time: "10:00 AM - 11:30 AM", course: "Mathematics", color: "bg-blue-500" },
  { id: "2", title: "History: Chapter 5 Reading", date: createMockDate(0, 14, 0), time: "2:00 PM - 3:00 PM", course: "History", color: "bg-green-500" },
  { id: "3", title: "Physics: Problem Set 3", date: createMockDate(1, 9, 0), time: "9:00 AM - 10:30 AM", course: "Physics", color: "bg-yellow-500" },
  { id: "4", title: "Literature: Essay Prep", date: createMockDate(2, 13, 0), time: "1:00 PM - 2:30 PM", course: "Literature", color: "bg-purple-500" },
  { id: "5", title: "Math: Practice Problems", date: createMockDate(2, 16, 0), time: "4:00 PM - 5:00 PM", course: "Mathematics", color: "bg-blue-500" },
];

// Helper to group events by date
const groupEventsByDate = (events: typeof mockEvents) => {
  return events.reduce((acc, event) => {
    const dateString = event.date.toDateString(); // This will be consistent now
    if (!acc[dateString]) {
      acc[dateString] = [];
    }
    acc[dateString].push(event);
    return acc;
  }, {} as Record<string, typeof mockEvents>);
};

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

export default function ScheduleViewPage() {
  const [events, setEvents] = React.useState(mockEvents);
  const [isEditing, setIsEditing] = React.useState(false);

  const groupedEvents = groupEventsByDate(events);
  const sortedDates = Object.keys(groupedEvents).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <div className="flex flex-col py-8">
      <div className="w-full mb-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
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
            <p className="text-center text-muted-foreground py-10">No study sessions scheduled. <a href="/generate-schedule" className="text-primary hover:underline">Generate a schedule</a> to get started.</p>
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
                        <div className={`h-2 ${event.color}`}></div>
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
    </div>
  );
}
