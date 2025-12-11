"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ListChecks,
  BookOpen,
  PlusCircle,
  CalendarDays,
  Wand2,
  Calendar as CalendarIcon,
  UploadCloud,
  FileQuestion,
  ArrowRight,
  Layers,
  NotebookPen,
  Flame, //  add
  Map,   //  add
} from "lucide-react";
import supabase from '@/lib/supabaseBrowser'

const featureTiles = [
  { title: "Add New Course", description: "Input details for your courses and deadlines.", href: "/add-course", icon: PlusCircle, cta: "Add Course" },
  { title: "Set Availability", description: "Mark your free time for focused study sessions.", href: "/set-availability", icon: CalendarDays, cta: "Set Times" },
  { title: "Generate Schedule", description: "Let AI create an optimized study plan for you.", href: "/generate-schedule", icon: Wand2, cta: "Generate" },
  { title: "View Schedule", description: "See your upcoming study sessions and tasks.", href: "/schedule-view", icon: CalendarIcon, cta: "View Calendar" },
  { title: "Upload & Quiz", description: "Upload documents and generate quizzes.", href: "/upload-document", icon: UploadCloud, cta: "Upload Files" },
  { title: "Generate Flashcards", description: "Create flashcards from your study materials.", href: "/generate-flashcards", icon: Layers, cta: "Create Flashcards" },
  { title: "Generate Notes", description: "Summarize documents into study notes.", href: "/generate-notes", icon: NotebookPen, cta: "Create Notes" },
  { title: "Take a Quiz", description: "Test your knowledge with interactive quizzes.", href: "/quiz", icon: FileQuestion, cta: "Start Quiz" },
  {
    title: "Wildfires Near You",
    description: "Enter a ZIP code to view nearby NASA FIRMS detections on a map.",
    href: "/wildfires",
    icon: Flame,
    cta: "Open Map",
  },
  {
    title: "US-Wide Wildfires",
    description: "Explore recent detections across the U.S. and click markers for details.",
    href: "/wildfires-us",
    icon: Map,
    cta: "Explore US",
  },
];

const upcomingTasks = [
  "Complete Math Assignment 2 by Friday",
  "Read Chapter 5 of History textbook",
  "Prepare presentation for Biology",
];

const studySessions = [
  "Calculus I - Today, 2:00 PM - 4:00 PM",
  "World History - Tomorrow, 10:00 AM - 11:30 AM",
];

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function checkSession() {
      if (!supabase) {
        // If supabase client isn't available on the client, send user to login.
        router.replace('/')
        return
      }

      const { data: sessionData, error } = await supabase.auth.getSession()

      if (!mounted) return

      if (error) {
        // if there's an error getting session, redirect to login
        router.replace('/')
        return
      }

      if (!sessionData?.session) {
        router.replace('/')
        return
      }

      setLoading(false)
    }

    checkSession()

    return () => {
      mounted = false
    }
  }, [router])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="grid flex-1 items-start gap-6 md:gap-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to your Dashboard!</h1>
        <p className="text-muted-foreground">Here's an overview of your study activities.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ListChecks className="h-6 w-6 text-primary" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {upcomingTasks.map((task, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 mt-1 h-2 w-2 rounded-full bg-primary" />
                    {task}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming tasks.</p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-6 w-6 text-primary" />
              Study Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {studySessions.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {studySessions.map((session, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 mt-1 h-2 w-2 rounded-full bg-accent" />
                    {session}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No study sessions scheduled.</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-4 mt-8">Features</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featureTiles.map((tile) => (
            <Card key={tile.title} className="flex flex-col hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <tile.icon className="h-8 w-8 text-primary" />
                  <CardTitle className="text-xl">{tile.title}</CardTitle>
                </div>
                <CardDescription className="text-sm leading-relaxed min-h-[3em]">{tile.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow" /> {/* Spacer */}
              <CardContent className="pt-0">
                 <Button asChild className="w-full mt-auto">
                  <Link href={tile.href} className="flex items-center justify-center gap-2">
                    {tile.cta} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
