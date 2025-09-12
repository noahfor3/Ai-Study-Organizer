
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
}

const mockQuizData: QuizQuestion[] = [
  {
    id: "q1",
    questionText: "What is the capital of France?",
    options: [
      { id: "o1a", text: "Berlin" },
      { id: "o1b", text: "Madrid" },
      { id: "o1c", text: "Paris" },
      { id: "o1d", text: "Rome" },
    ],
    correctOptionId: "o1c",
  },
  {
    id: "q2",
    questionText: "Which planet is known as the Red Planet?",
    options: [
      { id: "o2a", text: "Earth" },
      { id: "o2b", text: "Mars" },
      { id: "o2c", text: "Jupiter" },
      { id: "o2d", text: "Saturn" },
    ],
    correctOptionId: "o2b",
  },
  {
    id: "q3",
    questionText: "What is the largest ocean on Earth?",
    options: [
      { id: "o3a", text: "Atlantic Ocean" },
      { id: "o3b", text: "Indian Ocean" },
      { id: "o3c", text: "Arctic Ocean" },
      { id: "o3d", text: "Pacific Ocean" },
    ],
    correctOptionId: "o3d",
  },
];

export default function QuizPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [isAnswered, setIsAnswered] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [quizFinished, setQuizFinished] = React.useState(false);

  const currentQuestion = mockQuizData[currentQuestionIndex];
  const progressPercentage = mockQuizData.length > 0 ? ((currentQuestionIndex + 1) / mockQuizData.length) * 100 : 0;

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
    if (currentQuestionIndex < mockQuizData.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };
  
  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
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

      {quizFinished ? (
        <Card className="w-full max-w-xl shadow-lg text-center">
          <CardHeader>
            <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
            <CardDescription className="text-lg">
              You've finished the quiz. Well done!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-2xl font-semibold">Your Score: {score} / {mockQuizData.length}</p>
            <p className="text-muted-foreground">
              You answered {score} out of {mockQuizData.length} questions correctly.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={handleRestartQuiz} size="lg">
              <RotateCcw className="mr-2 h-5 w-5" />
              Restart Quiz
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
                <CardTitle className="text-2xl">Test Your Knowledge</CardTitle>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Question {currentQuestionIndex + 1} of {mockQuizData.length}
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

          </CardContent>
          <CardFooter className="flex justify-end">
            {!isAnswered ? (
              <Button onClick={handleSubmitAnswer} disabled={!selectedOption} size="lg">
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNextQuestion} size="lg">
                {currentQuestionIndex < mockQuizData.length - 1 ? "Next Question" : "Finish Quiz"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
