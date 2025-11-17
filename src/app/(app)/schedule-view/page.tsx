"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar as CalendarIcon,
  Edit3,
  Save,
  PlusCircle,
  ArrowLeft,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ClientFormattedDate from "@/components/client-formatted-date";
import {
  generateScheduleViewFlow,
  GenerateScheduleViewInput,
  GenerateScheduleViewOutput,
} from "@/ai/flows/generate-schedule-view-flow";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/** LocalStorage keys (must match GenerateSchedule page keys) */
const MANUAL_KEY = "ai-study-organizer:manual-schedule-v1";
const GENERATED_EVENTS_KEY = "ai-study-organizer:generated-schedule-events-v1";
const GENERATED_RAW_KEY = "ai-study-organizer:generated-schedule-raw-v1";

// Date formatting options (used with ClientFormattedDate)
const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

// Helper: simple unique id generator (works fine for UI)
const makeId = (prefix = "evt") =>
  `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 10000)
    .toString(36)
    .padStart(2, "0")}`;

// Type alias for clarity
type EventItem = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // "09:00-10:00"
  course: string;
  color: string; // tailwind class like "bg-blue-500"
};

// Group events by date for rendering
const groupEventsByDate = (events: EventItem[]) => {
  return events.reduce<Record<string, EventItem[]>>((acc, ev) => {
    const dateString = new Date(ev.date).toDateString();
    if (!acc[dateString]) acc[dateString] = [];
    acc[dateString].push(ev);
    return acc;
  }, {});
};

// Modal component for editing/adding an event
function EditEventModal({
  initial,
  onSave,
  onCancel,
}: {
  initial: EventItem;
  onSave: (e: EventItem) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = React.useState(initial.title);
  const [date, setDate] = React.useState(initial.date);
  const [time, setTime] = React.useState(initial.time);
  const [course, setCourse] = React.useState(initial.course);
  const [color, setColor] = React.useState(initial.color);

  const colors = [
    "bg-blue-500",
    "bg-red-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-gray-500",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">Edit Study Session</h3>

        <div className="space-y-3">
          <label className="block text-sm">
            Title
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Calculus: Problem Set"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              Date
              <input
                type="date"
                className="mt-1 w-full rounded-md border p-2"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>

            <label className="block text-sm">
              Time
              <input
                className="mt-1 w-full rounded-md border p-2"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g., 09:00-10:00"
              />
            </label>
          </div>

          <label className="block text-sm">
            Course
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="e.g., CPSC 351"
            />
          </label>

          <div>
            <p className="mb-1 text-sm">Color</p>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded ${c} ring-offset-1`}
                  aria-label={`Choose ${c}`}
                >
                  {color === c && (
                    <svg
                      className="mx-auto h-4 w-4 stroke-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="3"
                    >
                      <path d="M5 12l4 4L19 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSave({
                id: initial.id,
                title: title.trim() || "Untitled Session",
                date,
                time: time.trim() || "09:00-10:00",
                course: course.trim() || "General",
                color,
              })
            }
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ScheduleViewPage() {
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [isEditingMode, setIsEditingMode] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editingEvent, setEditingEvent] = React.useState<EventItem | null>(null);
  const [isFallback, setIsFallback] = React.useState(false);

  // Load local saved events if present OR generated events/raw
  React.useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      setIsFallback(false);

      // 1) Manual saved events (user edits)
      try {
        if (typeof window !== "undefined") {
          const saved = localStorage.getItem(MANUAL_KEY);
          if (saved) {
            const parsed: EventItem[] = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setEvents(parsed);
              setLoading(false);
              return;
            }
          }

          // 2) Structured generated events from generator (preferred)
          const genStructured = localStorage.getItem(GENERATED_EVENTS_KEY);
          if (genStructured) {
            const parsed = JSON.parse(genStructured);
            if (Array.isArray(parsed) && parsed.length > 0) {
              // convert to EventItem shape if necessary
              const out: EventItem[] = parsed.map((ev: any, i: number) => ({
                id: ev.id || makeId(`gen${i}`),
                title: ev.title || "AI Session",
                date: ev.date || new Date().toISOString().split("T")[0],
                time: ev.time || "09:00-10:00",
                course: ev.course || "General",
                color: ev.color || "bg-gray-400",
              }));
              setEvents(out);
              setLoading(false);
              return;
            }
          }

          // 3) Raw generated schedule text (convert to single event so UI isn't empty)
          const genRaw = localStorage.getItem(GENERATED_RAW_KEY);
          if (genRaw) {
            const parsed = JSON.parse(genRaw);
            const text = (parsed && parsed.text) ? String(parsed.text) : "";
            if (text && text.trim().length > 0) {
              const snippet = text.trim().replace(/\s+/g, " ").slice(0, 280);
              const single: EventItem[] = [
                {
                  id: makeId("gen"),
                  title: `AI Schedule: ${snippet}${snippet.length >= 280 ? "…" : ""}`,
                  date: new Date().toISOString().split("T")[0],
                  time: "09:00-10:00",
                  course: "AI Generated",
                  color: "bg-blue-500",
                },
              ];
              setEvents(single);
              setLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Schedule load/parsing error:", err);
      }

      // 4) If none of the above found, fallback to calling AI flow (keeps compatibility)
      try {
        const input: GenerateScheduleViewInput = { userId: "dummy-user-123" };
        const result: GenerateScheduleViewOutput = await generateScheduleViewFlow(input);

        const out: EventItem[] = (result.events || []).map((ev) => ({
          id: ev.id,
          title: ev.title,
          date: ev.date,
          time: ev.time,
          course: ev.course,
          color: ev.color || "bg-gray-400",
        }));

        if (out.length === 0) {
          // use fallback single event
          setIsFallback(true);
          setEvents([
            {
              id: makeId("fallback"),
              title: "Fallback Study Session",
              date: new Date().toISOString().split("T")[0],
              time: "09:00-10:00",
              course: "Sample Course",
              color: "bg-gray-400",
            },
          ]);
        } else {
          setEvents(out);
        }
      } catch (err: unknown) {
        console.error("[Schedule View] AI generation error:", err);
        setError(err instanceof Error ? err.message : String(err) || "AI generation failed.");
        setIsFallback(true);
        setEvents([
          {
            id: makeId("fallback"),
            title: "Fallback Study Session",
            date: new Date().toISOString().split("T")[0],
            time: "09:00-10:00",
            course: "Sample Course",
            color: "bg-gray-400",
          },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Save any manual edits to localStorage so they persist
  React.useEffect(() => {
    try {
      localStorage.setItem(MANUAL_KEY, JSON.stringify(events));
    } catch {
      // ignore localStorage errors
    }
  }, [events]);

  const grouped = React.useMemo(() => groupEventsByDate(events), [events]);
  const sortedDates = React.useMemo(
    () => Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()),
    [grouped]
  );

  const handleDelete = (id: string) => {
    setEvents((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveEvent = (ev: EventItem) => {
    setEvents((prev) => {
      const exists = prev.some((p) => p.id === ev.id);
      if (exists) {
        return prev.map((p) => (p.id === ev.id ? ev : p));
      } else {
        // new event
        return [...prev, ev];
      }
    });
  };

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

      {/* Loading */}
      {loading && (
        <div className="text-center py-10 text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="animate-spin h-5 w-5" /> Generating your schedule...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <Alert variant="destructive" className="w-full max-w-2xl mx-auto mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Fallback notice */}
      {!loading && !error && isFallback && (
        <Alert variant="warning" className="w-full max-w-2xl mx-auto mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Notice</AlertTitle>
          <AlertDescription>
            AI failed to generate a full schedule — showing a fallback schedule so you can still edit and add sessions.
          </AlertDescription>
        </Alert>
      )}

      {/* Schedule Card */}
      {!loading && !error && (
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
              <Button variant="outline" onClick={() => setIsEditingMode((s) => !s)}>
                <Edit3 className="mr-2 h-4 w-4" /> {isEditingMode ? "Cancel Edit" : "Edit Schedule"}
              </Button>

              {isEditingMode && (
                <Button onClick={() => {
                  // "Save Changes" is local (already auto-saved).
                  alert("Changes saved locally in your browser.");
                }}>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="mt-4">
            {sortedDates.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">
                No study sessions scheduled.{" "}
                <a href="/generate-schedule" className="text-primary hover:underline">
                  Generate a schedule
                </a>{" "}
                to get started.
              </p>
            ) : (
              <div className="space-y-6">
                {sortedDates.map((dateString) => (
                  <div key={dateString}>
                    <h3 className="text-lg font-semibold mb-3 border-b pb-2">
                      <ClientFormattedDate dateString={dateString} options={DATE_FORMAT_OPTIONS} />
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {grouped[dateString].map((event) => (
                        <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className={`h-2 ${event.color}`}></div>

                          <CardHeader className="pt-3 pb-2">
                            <CardTitle className="text-base">{event.title}</CardTitle>
                          </CardHeader>

                          <CardContent className="text-sm space-y-1 pb-3">
                            <div>
                              <Badge variant="secondary">{event.course}</Badge>
                            </div>
                            <p className="text-muted-foreground">{event.time}</p>

                            {isEditingMode && (
                              <div className="pt-2 flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => setEditingEvent(event)}>
                                  Edit
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)}>
                                  Delete
                                </Button>
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

            {isEditingMode && (
              <div className="mt-8 text-center">
                <Button
                  variant="default"
                  size="lg"
                  onClick={() =>
                    setEditingEvent({
                      id: makeId("new"),
                      title: "",
                      date: new Date().toISOString().split("T")[0],
                      time: "09:00-10:00",
                      course: "",
                      color: "bg-blue-500",
                    })
                  }
                >
                  <PlusCircle className="mr-2 h-5 w-5" /> Add New Session
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Editor modal */}
      {editingEvent && (
        <EditEventModal
          initial={editingEvent}
          onCancel={() => setEditingEvent(null)}
          onSave={(ev) => {
            handleSaveEvent(ev);
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
}

/*
Notes:
- This page looks for:
  1) user manual edits (ai-study-organizer:manual-schedule-v1)
  2) structured generated events (ai-study-organizer:generated-schedule-events-v1)
  3) raw generated schedule text (ai-study-organizer:generated-schedule-raw-v1) -> converted to single UI event
- Manual edits are saved to localStorage automatically.
*/
