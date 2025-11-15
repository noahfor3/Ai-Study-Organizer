'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftCircle, ArrowRightCircle, RefreshCw, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardViewerProps {
  flashcards: Flashcard[];
}

const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ flashcards }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);

  if (!flashcards || flashcards.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>No Flashcards</AlertTitle>
        <AlertDescription>
          No flashcards were generated or provided. Try generating some from your text content.
        </AlertDescription>
      </Alert>
    );
  }

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
  };

  const handleFlip = () => {
    setIsFlipped((prevFlipped) => !prevFlipped);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <p className="text-center text-muted-foreground mb-2">
        Card {currentIndex + 1} of {flashcards.length}
      </p>
      <Card 
        className="min-h-[250px] flex flex-col justify-center items-center p-6 text-center shadow-lg cursor-pointer select-none hover:shadow-xl transition-shadow"
        onClick={handleFlip}
        data-ai-hint="flashcard content"
      >
        <CardContent className="text-xl font-medium flex-grow flex items-center justify-center">
          {isFlipped ? currentCard.back : currentCard.front}
        </CardContent>
      </Card>
      <div className="flex justify-between items-center mt-6">
        <Button variant="outline" onClick={handlePrevious} disabled={flashcards.length <= 1}>
          <ArrowLeftCircle className="mr-2 h-5 w-5" /> Previous
        </Button>
        <Button variant="outline" onClick={handleFlip}>
          <RefreshCw className="mr-2 h-5 w-5" /> Flip
        </Button>
        <Button variant="outline" onClick={handleNext} disabled={flashcards.length <= 1}>
          Next <ArrowRightCircle className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default FlashcardViewer;
