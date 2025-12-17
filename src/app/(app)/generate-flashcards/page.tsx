
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Layers } from 'lucide-react';
import FlashcardViewer from '@/components/flashcard-viewer';

interface Flashcard {
  front: string;
  back: string;
}

// Pre-defined fire safety flashcards
const fireSafetyFlashcards: Flashcard[] = [
  {
    front: "What is the most common cause of wildfires?",
    back: "Human activities, including campfires, discarded cigarettes, equipment use, and arson, account for approximately 85% of wildfires in the United States."
  },
  {
    front: "What should you do if you're caught in a wildfire?",
    back: "Stay calm, find a body of water or cleared area, lie face down covering your body, and breathe through a wet cloth if possible. Never try to outrun a fire uphill."
  },
  {
    front: "What is a defensible space?",
    back: "A defensible space is a buffer zone of at least 30 feet around your home that is cleared of flammable vegetation and materials to help protect your property from wildfires."
  },
  {
    front: "What does the acronym PASS stand for in fire safety?",
    back: "PASS stands for: Pull the pin, Aim at the base of the fire, Squeeze the trigger, and Sweep from side to side. This is the proper technique for using a fire extinguisher."
  },
  {
    front: "What are the three elements needed for a fire?",
    back: "The fire triangle consists of three elements: Fuel (combustible material), Heat (ignition source), and Oxygen. Remove any one of these and the fire cannot continue."
  },
  {
    front: "What should you do if you see smoke or flames while driving?",
    back: "Turn around immediately and find an alternate route. Never drive through smoke or flames. Close windows and vents, turn on headlights, and drive slowly with caution."
  },
  {
    front: "What is the recommended distance to keep flammable materials from your home?",
    back: "Keep flammable materials, including firewood, propane tanks, and dry vegetation, at least 30 feet away from your home to create a defensible space."
  },
  {
    front: "What should be included in a wildfire evacuation kit?",
    back: "A wildfire evacuation kit should include: important documents, medications, first aid supplies, water, non-perishable food, flashlight, batteries, cash, and a change of clothes. Keep it ready to go at all times."
  }
];

export default function GenerateFlashcardsPage() {
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

      <Card className="w-full max-w-2xl shadow-lg mb-8">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Layers className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">Fire Safety Flashcards</CardTitle>
          </div>
          <CardDescription>
            Test your knowledge of fire safety and wildfire prevention with these essential flashcards.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="w-full max-w-2xl">
        <FlashcardViewer flashcards={fireSafetyFlashcards} />
      </div>
    </div>
  );
}
