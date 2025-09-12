
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, FileText, Wand2, Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

export default function UploadDocumentPage() {
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map(file => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
      }));
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const newFiles = Array.from(event.dataTransfer.files).map(file => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
      }));
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      event.dataTransfer.clearData();
    }
  };
  
  const removeFile = (fileId: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <UploadCloud className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">Upload Documents & Generate Quiz</CardTitle>
          </div>
          <CardDescription>
            Upload your study materials (PDF, DOCX, TXT) and let AI generate a quiz for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div 
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
              ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter} // Prevent default to allow drop
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className={`h-12 w-12 mb-3 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="text-lg font-medium">
              {isDragging ? "Drop files here" : "Drag & drop files or click to browse"}
            </p>
            <p className="text-sm text-muted-foreground">Supported formats: PDF, DOCX, TXT</p>
            <Input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              onChange={handleFileChange}
              multiple 
              accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt"
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-md font-medium text-foreground">Uploaded Files:</h3>
              <ul className="space-y-2">
                {files.map((file) => (
                  <li key={file.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md border">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFile(file.id)} aria-label="Remove file">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {files.length > 0 && (
            <Button className="w-full gap-2" size="lg" asChild>
              <Link href="/quiz">
                <Wand2 className="h-5 w-5" />
                Generate Quiz from Uploaded File(s)
              </Link>
            </Button>
          )}
          {files.length === 0 && (
             <Alert variant="default" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No files uploaded</AlertTitle>
              <AlertDescription>
                Please upload at least one document to generate a quiz.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
