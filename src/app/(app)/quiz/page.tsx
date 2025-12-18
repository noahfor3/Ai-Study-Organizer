
"use client";

import * as React from "react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FileQuestion, CheckCircle, XCircle, RotateCcw, ArrowRight, Trophy, ArrowLeft } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  id: string;
  questionText: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
}

const mockQuizData: QuizQuestion[] = [
  {
    id: "q1",
    questionText: "How far should vegetation be cleared around your home to create an effective defensible space?",
    options: [
      { id: "o1a", text: "10 feet" },
      { id: "o1b", text: "30 feet" },
      { id: "o1c", text: "100 feet" },
      { id: "o1d", text: "200 feet" },
    ],
    correctOptionId: "o1c",
    explanation: "California law requires 100 feet of defensible space around homes and structures. This buffer zone helps slow or stop wildfire spread.",
    difficulty: "easy",
    category: "Defensible Space"
  },
  {
    id: "q2",
    questionText: "What does a Red Flag Warning indicate?",
    options: [
      { id: "o2a", text: "Heavy rainfall is expected" },
      { id: "o2b", text: "Critical fire weather conditions exist" },
      { id: "o2c", text: "A wildfire has been spotted nearby" },
      { id: "o2d", text: "Air quality is unhealthy" },
    ],
    correctOptionId: "o2b",
  },
  {
    id: "q3",
    questionText: "Which roofing material is MOST fire-resistant?",
    options: [
      { id: "o3a", text: "Wood shingles" },
      { id: "o3b", text: "Asphalt shingles" },
      { id: "o3c", text: "Metal or tile roofing" },
      { id: "o3d", text: "Composite shingles" },
    ],
    correctOptionId: "o3c",
  },
  {
    id: "q4",
    questionText: "During wildfire season, how often should you clean gutters and roof of debris?",
    options: [
      { id: "o4a", text: "Once a year" },
      { id: "o4b", text: "Every few months" },
      { id: "o4c", text: "Monthly" },
      { id: "o4d", text: "Only after storms" },
    ],
    correctOptionId: "o4c",
  },
  {
    id: "q5",
    questionText: "What is the recommended Air Quality Index (AQI) level to stay indoors?",
    options: [
      { id: "o5a", text: "AQI above 50" },
      { id: "o5b", text: "AQI above 100" },
      { id: "o5c", text: "AQI above 150" },
      { id: "o5d", text: "AQI above 200" },
    ],
    correctOptionId: "o5c",
  },
  {
    id: "q6",
    questionText: "Which direction do wildfires typically spread fastest?",
    options: [
      { id: "o6a", text: "Downhill" },
      { id: "o6b", text: "Uphill" },
      { id: "o6c", text: "Sideways" },
      { id: "o6d", text: "Direction doesn't matter" },
    ],
    correctOptionId: "o6b",
  },
  {
    id: "q7",
    questionText: "What should be included in a wildfire evacuation go-bag?",
    options: [
      { id: "o7a", text: "Important documents, medications, water, and N95 masks" },
      { id: "o7b", text: "Just clothing and food" },
      { id: "o7c", text: "Electronics and valuables only" },
      { id: "o7d", text: "Furniture and large items" },
    ],
    correctOptionId: "o7a",
  },
  {
    id: "q8",
    questionText: "What is an 'ember' in wildfire terminology?",
    options: [
      { id: "o8a", text: "A type of fire retardant" },
      { id: "o8b", text: "A burning piece of debris that can travel miles ahead of a fire" },
      { id: "o8c", text: "A firebreak zone" },
      { id: "o8d", text: "A firefighting tool" },
    ],
    correctOptionId: "o8b",
  },
  {
    id: "q9",
    questionText: "Which plants are considered fire-resistant for landscaping?",
    options: [
      { id: "o9a", text: "Dry grasses and shrubs" },
      { id: "o9b", text: "Pine trees and juniper" },
      { id: "o9c", text: "Succulents, lavender, and native hardwoods" },
      { id: "o9d", text: "Bamboo and eucalyptus" },
    ],
    correctOptionId: "o9c",
  },
  {
    id: "q10",
    questionText: "When should you evacuate during a wildfire?",
    options: [
      { id: "o10a", text: "Only when you see flames" },
      { id: "o10b", text: "When ordered by authorities or when you feel unsafe" },
      { id: "o10c", text: "After gathering all your belongings" },
      { id: "o10d", text: "Wait for firefighters to knock on your door" },
    ],
    correctOptionId: "o10b",
  },
];

export default function QuizPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [isAnswered, setIsAnswered] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [quizFinished, setQuizFinished] = React.useState(false);
  const [quizData, setQuizData] = React.useState<QuizQuestion[]>(mockQuizData);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch dynamic quiz questions on component mount
  React.useEffect(() => {
    async function fetchQuizQuestions() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/wildfire-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            count: 10, 
            includeExplanations: true 
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch quiz questions');
        }

        const data = await response.json();
        
        if (data.success && data.questions) {
          setQuizData(data.questions);
        } else {
          // Fall back to mock data if API fails
          setQuizData(mockQuizData);
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Using fallback questions');
        // Use mock data as fallback
        setQuizData(mockQuizData);
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuizQuestions();
  }, []);

  const currentQuestion = quizData[currentQuestionIndex];
  const progressPercentage = quizData.length > 0 ? ((currentQuestionIndex + 1) / quizData.length) * 100 : 0;

  const handleOptionChange = (value: string) => {
    if (!isAnswered) {
      setSelectedOption(value);
    }
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || !currentQuestion) return;
    setIsAnswered(true);
    if (selectedOption === currentQuestion.correctOptionId) {
      setScore(prevScore => prevScore + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      // Save score to localStorage for dashboard
      localStorage.setItem('wildfireQuizScore', score.toString());
      localStorage.setItem('wildfireQuizDate', new Date().toISOString());
    }
  };
  
  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
    setIsLoading(true);
    
    // Fetch new questions
    fetch('/api/wildfire-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: 10, includeExplanations: true }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.questions) {
          setQuizData(data.questions);
        }
      })
      .catch(err => console.error('Error restarting quiz:', err))
      .finally(() => setIsLoading(false));
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

      {isLoading ? (
        <Card className="w-full max-w-xl shadow-lg text-center">
          <CardHeader>
            <FileQuestion className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
            <CardTitle className="text-3xl">Generating Quiz...</CardTitle>
            <CardDescription className="text-lg">
              Creating personalized wildfire safety questions for you.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : quizFinished ? (
        <Card className="w-full max-w-xl shadow-lg text-center">
          <CardHeader>
            <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-3xl">Assessment Complete!</CardTitle>
            <CardDescription className="text-lg">
              {score >= 8 ? "Excellent wildfire knowledge!" : score >= 6 ? "Good awareness, but room to improve." : "Consider reviewing wildfire safety resources."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-2xl font-semibold">Your Score: {score} / {quizData.length}</p>
            <p className="text-muted-foreground">
              You answered {score} out of {quizData.length} questions correctly.
            </p>
            <div className="mt-6 p-4 border-l-4 border-primary bg-accent/50 rounded">
              <p className="font-semibold mb-2">Personalized Recommendations:</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                {score < 8 && <li>Review defensible space guidelines for your home</li>}
                {score < 6 && <li>Create or update your wildfire evacuation plan</li>}
                {score < 7 && <li>Learn about Red Flag Warnings in your area</li>}
                <li>Check the wildfire map for nearby fire activity</li>
                <li>Prepare or review your emergency go-bag contents</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={handleRestartQuiz} size="lg">
              <RotateCcw className="mr-2 h-5 w-5" />
              Take New Quiz
            </Button>
          </CardFooter>
        </Card>
      ) : !currentQuestion ? (
        <Card className="w-full max-w-xl shadow-lg text-center">
          <CardHeader>
            <FileQuestion className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-3xl">Quiz Loading...</CardTitle>
            <CardDescription className="text-lg">
              Preparing your questions. This might be because no document was uploaded or processed.
            </CardDescription>
          </CardHeader>
           <CardContent>
            <p className="text-muted-foreground">If this persists, try <a href="/upload-document" className="text-primary hover:underline">uploading a document</a> again.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <FileQuestion className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">Wildfire Risk Assessment</CardTitle>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Question {currentQuestionIndex + 1} of {quizData.length}
              </span>
            </div>
            <Progress value={progressPercentage} className="w-full h-2" />
          </CardHeader>
          <CardContent className="space-y-6 py-8">
            <p className="text-xl font-semibold text-center">{currentQuestion.questionText}</p>
            
            <RadioGroup 
              value={selectedOption || undefined} 
              onValueChange={handleOptionChange}
              disabled={isAnswered}
              className="space-y-3"
            >
              {currentQuestion.options.map((option) => {
                const isCorrect = option.id === currentQuestion.correctOptionId;
                const isSelected = option.id === selectedOption;
                let optionStyle = "border-border hover:border-primary";
                if (isAnswered) {
                  if (isCorrect) optionStyle = "border-green-500 bg-green-500/10";
                  else if (isSelected && !isCorrect) optionStyle = "border-red-500 bg-red-500/10";
                  else optionStyle = "border-border opacity-70";
                } else if (isSelected) {
                   optionStyle = "border-primary bg-primary/10";
                }

                return (
                  <Label 
                    key={option.id} 
                    htmlFor={option.id}
                    className={cn(
                      "flex items-center space-x-3 p-4 border-2 rounded-md cursor-pointer transition-all duration-150",
                      optionStyle,
                      isAnswered && !isSelected && !isCorrect ? "cursor-not-allowed" : ""
                    )}
                  >
                    <RadioGroupItem value={option.id} id={option.id} disabled={isAnswered} />
                    <span className="flex-1 text-base">{option.text}</span>
                    {isAnswered && isSelected && isCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600" />}
                    {isAnswered && !isSelected && isCorrect && <CheckCircle className="h-5 w-5 text-green-600 opacity-60" />}
                  </Label>
                );
              })}
            </RadioGroup>

            {isAnswered && currentQuestion.explanation && (
              <div className="mt-6 p-4 border-l-4 border-primary bg-accent/50 rounded">
                <p className="font-semibold text-sm mb-1">Explanation:</p>
                <p className="text-sm">{currentQuestion.explanation}</p>
              </div>
            )}

          </CardContent>
          <CardFooter className="flex justify-end">
            {!isAnswered ? (
              <Button onClick={handleSubmitAnswer} disabled={!selectedOption} size="lg">
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNextQuestion} size="lg">
                {currentQuestionIndex < quizData.length - 1 ? "Next Question" : "Finish Quiz"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}


// End of file