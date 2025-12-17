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
  Shield,
  TrendingUp,
} from "lucide-react";
import supabase from '@/lib/supabaseBrowser'

const featureTiles = [
  { title: "Add New Course", description: "Input details for your courses and deadlines.", href: "/add-course", icon: PlusCircle, cta: "Add Course" },
  { title: "Set Availability", description: "Mark your free time for focused study sessions.", href: "/set-availability", icon: CalendarDays, cta: "Set Times" },
  { title: "Generate Schedule", description: "Let AI create an optimized study plan for you.", href: "/generate-schedule", icon: Wand2, cta: "Generate" },
  { title: "View Schedule", description: "See your upcoming study sessions and tasks.", href: "/schedule-view", icon: CalendarIcon, cta: "View Calendar" },
  { title: "Upload & Quiz", description: "Upload documents and generate quizzes.", href: "/upload-document", icon: UploadCloud, cta: "Upload Files" },
  { title: "Fire Safety Flashcards", description: "Test your knowledge of fire safety and wildfire prevention.", href: "/generate-flashcards", icon: Layers, cta: "Study Flashcards" },
  { title: "Generate Notes", description: "Summarize documents into study notes.", href: "/generate-notes", icon: NotebookPen, cta: "Create Notes" },
  { title: "Wildfire Risk Assessment", description: "Test your wildfire safety knowledge and get personalized recommendations.", href: "/quiz", icon: FileQuestion, cta: "Take Assessment" },
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
  "Review wildfire safety protocols",
  "Study fire prevention techniques",
  "Complete wildfire risk assessment quiz",
];

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [safetyScore, setSafetyScore] = useState<number | null>(null)
  const [quizTaken, setQuizTaken] = useState(false)

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

    // Load saved quiz score from localStorage
    const savedScore = localStorage.getItem('wildfireQuizScore')
    const savedDate = localStorage.getItem('wildfireQuizDate')
    
    if (savedScore && savedDate) {
      setSafetyScore(parseInt(savedScore))
      setQuizTaken(true)
    }

    checkSession()

    return () => {
      mounted = false
    }
  }, [router])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  // Calculate safety metrics
  const calculateSafetyLevel = (score: number | null) => {
    if (score === null) return { level: 'Unknown', color: 'text-muted-foreground', percentage: 0 }
    const percentage = (score / 10) * 100
    if (percentage >= 80) return { level: 'Excellent', color: 'text-green-600', percentage }
    if (percentage >= 60) return { level: 'Good', color: 'text-blue-600', percentage }
    if (percentage >= 40) return { level: 'Fair', color: 'text-yellow-600', percentage }
    return { level: 'Needs Improvement', color: 'text-orange-600', percentage }
  }

  const safetyLevel = calculateSafetyLevel(safetyScore)

  // Generate personalized recommendations based on quiz score
  const getPersonalizedTasks = (score: number | null): string[] => {
    if (score === null) {
      return [
        "Take the wildfire risk assessment quiz",
        "Explore nearby wildfire activity on the map",
        "Learn about defensible space requirements",
      ]
    }

    const tasks: string[] = []
    
    if (score < 8) {
      tasks.push("Review defensible space guidelines for your home")
    }
    if (score < 6) {
      tasks.push("Create or update your wildfire evacuation plan")
    }
    if (score < 7) {
      tasks.push("Learn about Red Flag Warnings in your area")
    }
    
    // Always include these core tasks
    tasks.push("Check the wildfire map for nearby fire activity")
    tasks.push("Prepare or review your emergency go-bag contents")
    
    // Add score-based encouragement
    if (score >= 8) {
      tasks.unshift("Excellent work! Share wildfire safety tips with neighbors")
      tasks.push("Consider joining a local Firewise USA community")
    }

    return tasks.slice(0, 5) // Limit to 5 tasks
  }

  const personalizedTasks = getPersonalizedTasks(safetyScore)

  return (
    <div className="grid flex-1 items-start gap-6 md:gap-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          Welcome to Study Safe!
        </h1>
        <p className="text-muted-foreground">Your wildfire education and safety resource center.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ListChecks className="h-6 w-6 text-primary" />
              {quizTaken ? "Personalized Recommendations" : "Getting Started"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {personalizedTasks.map((task, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2 mt-1 h-2 w-2 rounded-full bg-primary" />
                  {task}
                </li>
              ))}
            </ul>
            {!quizTaken && (
              <Button asChild variant="outline" size="sm" className="w-full mt-4">
                <Link href="/quiz">
                  Take Assessment
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="h-6 w-6 text-primary" />
              Your Safety Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            {quizTaken && safetyScore !== null ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">{safetyScore}/10</p>
                    <p className={`text-sm font-medium ${safetyLevel.color}`}>{safetyLevel.level}</p>
                  </div>
                  <div className="relative h-16 w-16">
                    <svg className="h-16 w-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - safetyLevel.percentage / 100)}`}
                        className="text-primary transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-semibold">{Math.round(safetyLevel.percentage)}%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Based on quiz performance</span>
                  </div>
                  {safetyLevel.percentage < 80 && (
                    <Button asChild variant="outline" size="sm" className="w-full mt-2">
                      <Link href="/quiz">
                        Retake Assessment
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Take the wildfire risk assessment to get your personalized safety score.
                </p>
                <Button asChild className="w-full">
                  <Link href="/quiz" className="flex items-center justify-center gap-2">
                    <Shield className="h-4 w-4" />
                    Get Your Score
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-4 mt-8">Wildfire Education Tools</h2>
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
