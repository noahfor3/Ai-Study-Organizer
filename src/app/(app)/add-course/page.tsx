
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, ArrowLeft } from 'lucide-react';

export default function AddCoursePage() {
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
            <PlusCircle className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">Add New Course</CardTitle>
          </div>
          <CardDescription>Enter the details for your new course below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="courseName">Course Name</Label>
            <Input id="courseName" placeholder="e.g., Introduction to Calculus" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="courseCode">Course Code (Optional)</Label>
            <Input id="courseCode" placeholder="e.g., MATH101" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instructorName">Instructor Name (Optional)</Label>
            <Input id="instructorName" placeholder="e.g., Dr. Smith" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadlines">Assignments & Deadlines</Label>
            <Textarea 
              id="deadlines" 
              placeholder="List assignments and their due dates, e.g.,&#10;Homework 1 - 2024-10-15&#10;Midterm Exam - 2024-11-05" 
              rows={5}
            />
            <p className="text-xs text-muted-foreground">Enter each assignment and deadline on a new line.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full sm:w-auto ml-auto">Save Course</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
