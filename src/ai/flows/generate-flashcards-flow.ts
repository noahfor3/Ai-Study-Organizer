'use server';
/**
 * @fileOverview A Genkit flow for generating flashcards from document content.
 * (Currently modified to return pseudo-text for demonstration purposes).
 *
 * - generateFlashcards - A function that handles the flashcard generation process.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generateFlashcards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FlashcardSchema = z.object({
  front: z.string().describe("The front of the flashcard (e.g., a question, term, or key concept)."),
  back: z.string().describe("The back of the flashcard (e.g., the corresponding answer, definition, or explanation)."),
});

const GenerateFlashcardsInputSchema = z.object({
  documentContent: z.string().min(50, { message: "Document content must be at least 50 characters long."})
    .describe("The text content from which to generate flashcards."),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema).describe("An array of generated flashcards."),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;


export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  // Validate input using the Zod schema
  const validationResult = GenerateFlashcardsInputSchema.safeParse(input);
  if (!validationResult.success) {
    const errorMessages = validationResult.error.issues.map(issue => `${issue.path.join('.')} - ${issue.message}`).join('; ');
    throw new Error(`Invalid input: ${errorMessages}`);
  }

  // Simulate pseudo text generation (mock data) instead of calling the LLM
  // This fulfills the "it doesnt have to use actual ai, just psuedo text is fine" requirement.
  console.log("StudyFlow: Generating pseudo-text flashcards for document content starting with:", input.documentContent.substring(0, 50) + "...");
  
  // Simulate a short delay as if processing
  await new Promise(resolve => setTimeout(resolve, 700));

  // Example of returning no flashcards for certain input
  if (input.documentContent.toLowerCase().includes("empty example please")) {
    return { flashcards: [] };
  }
  
  // Example of simulating an error
  if (input.documentContent.toLowerCase().includes("error example please")) {
    throw new Error("This is a simulated error from pseudo flashcard generation.");
  }

  const pseudoFlashcards: GenerateFlashcardsOutput = {
    flashcards: [
      {
        front: "What is the main idea of the first 30 characters?",
        back: `The main idea related to "${input.documentContent.substring(0, 30)}..." is concept X. (Pseudo-generated)`,
      },
      {
        front: `Define: "${input.documentContent.substring(5, 20) || 'a key term'}"`,
        back: `This term refers to Y and is important because of Z. (Pseudo-generated)`,
      },
      {
        front: "Summarize the input document.",
        back: "This document appears to be about various topics, summarized effectively here. (Pseudo-generated)",
      },
      {
        front: "What is a 'flashcard'?",
        back: "A card bearing information on both sides, used for studying. (Pseudo-generated)"
      }
    ],
  };
  // Return a subset if the document is very short, to make it seem more dynamic
  if (input.documentContent.length < 100) {
    return { flashcards: pseudoFlashcards.flashcards.slice(0, 2) };
  }

  return pseudoFlashcards;

  // Original AI call (now bypassed for pseudo-text):
  // return generateFlashcardsFlow(input); 
}

// --- Original Genkit AI Flow and Prompt (kept for future reference/activation) ---
/*
const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: {schema: GenerateFlashcardsInputSchema},
  output: {schema: GenerateFlashcardsOutputSchema},
  prompt: `You are an expert in creating concise and effective flashcards for studying.
Based on the following document content, generate a set of flashcards.
Each flashcard should have a 'front' with a question, term, or key concept, and a 'back' with the corresponding answer, definition, or explanation.
Ensure the flashcards are distinct and cover the main points of the document.

Document Content:
{{{documentContent}}}
`,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output || !output.flashcards || output.flashcards.length === 0) {
      // Consider if this case should throw an error or return empty:
      // For now, let's return an empty array if the LLM doesn't produce any.
      // The UI can then handle the "no flashcards generated" case.
      return { flashcards: [] };
    }
    return output;
  }
);
*/