export type QuestionType = 'mcq' | 'true_false' | 'short_answer';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  stem: string;
  options?: string[]; // For MCQ and T/F
  correctAnswer: string | number | boolean; // String for SA, number for MCQ, boolean for T/F
  explanation?: string;
  difficulty: DifficultyLevel;
  sourceSection?: string;
  metadata: {
    tokensUsed: number;
    generatedAt: string;
    sourceLength: number;
  };
}

export interface QuizRequest {
  content: string;
  questionCount: number;
  questionTypes?: {
    mcq?: number;
    true_false?: number;
    short_answer?: number;
  };
  difficulty?: DifficultyLevel;
  includeExplanations?: boolean;
  redactPII?: boolean;
  seed?: string; // For deterministic generation
}

export interface QuizResponse {
  quizId: string;
  questions: QuizQuestion[];
  metadata: {
    totalQuestions: number;
    difficulty: DifficultyLevel;
    coverage: {
      sections: string[];
      coveragePercentage: number;
    };
    generationTime: number;
    tokensUsed: number;
  };
}

export interface QuizValidationError {
  questionId: string;
  error: string;
  severity: 'warning' | 'error';
}

export interface QuizExportOptions {
  format: 'json' | 'csv';
  includeExplanations: boolean;
  includeMetadata: boolean;
}
