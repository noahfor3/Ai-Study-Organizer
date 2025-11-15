import { QuizQuestion, QuizRequest, QuizResponse, QuestionType, DifficultyLevel, QuizValidationError } from '../types/quiz';
import { ModelClient } from '../integrations/modelClient';
import { redactPII } from '../utils/redact';
import { extractSections, calculateCoverage } from '../utils/quiz-helpers';

export class QuizGeneratorService {
  private modelClient: ModelClient;

  constructor(modelClient: ModelClient) {
    this.modelClient = modelClient;
  }

  async generateQuiz(request: QuizRequest): Promise<QuizResponse> {
    const startTime = Date.now();
    
    // Validate input
    this.validateRequest(request);
    
    // Process content
    let processedContent = request.content;
    if (request.redactPII) {
      processedContent = redactPII(processedContent);
    }

    // Extract sections for coverage tracking
    const sections = extractSections(processedContent);
    
    // Generate questions
    const questions = await this.generateQuestions(processedContent, request, sections);
    
    // Validate generated questions
    const validationErrors = this.validateQuestions(questions);
    if (validationErrors.some(error => error.severity === 'error')) {
      throw new Error(`Quiz generation failed validation: ${validationErrors.map(e => e.error).join(', ')}`);
    }

    // Calculate coverage
    const coverage = calculateCoverage(questions, sections);
    
    const generationTime = Date.now() - startTime;
    const totalTokens = questions.reduce((sum, q) => sum + q.metadata.tokensUsed, 0);

    return {
      quizId: this.generateQuizId(request.seed),
      questions,
      metadata: {
        totalQuestions: questions.length,
        difficulty: request.difficulty || 'medium',
        coverage,
        generationTime,
        tokensUsed: totalTokens
      }
    };
  }

  private validateRequest(request: QuizRequest): void {
    if (!request.content || request.content.trim().length === 0) {
      throw new Error('Content is required for quiz generation');
    }

    if (request.content.length < 200) {
      console.warn('Content shorter than recommended (200 characters); attempting best-effort generation.');
    }
    
    if (request.questionCount < 1 || request.questionCount > 50) {
      throw new Error('Question count must be between 1 and 50');
    }

    if (request.questionTypes) {
      const totalRequested = Object.values(request.questionTypes).reduce((sum, count) => sum + (count || 0), 0);
      if (totalRequested !== request.questionCount) {
        throw new Error('Sum of question types must equal total question count');
      }
    }
  }

  private async generateQuestions(
    content: string,
    request: QuizRequest,
    sections: string[]
  ): Promise<QuizQuestion[]> {
    const questions: QuizQuestion[] = [];
    let sectionCursor = 0;
    
    // Determine question distribution
    const distribution = this.calculateQuestionDistribution(request);
    
    // Generate each type of question
    for (const [type, count] of Object.entries(distribution)) {
      if (count > 0) {
        const { questions: typeQuestions, nextSectionCursor } = await this.generateQuestionsOfType(
          content, 
          type as QuestionType, 
          count, 
          request.difficulty || 'medium',
          request.includeExplanations || false,
          request.seed,
          sections,
          sectionCursor
        );
        questions.push(...typeQuestions);
        sectionCursor = nextSectionCursor;
      }
    }

    return questions;
  }

  private calculateQuestionDistribution(request: QuizRequest): Record<QuestionType, number> {
    const { questionCount, questionTypes } = request;
    
    if (questionTypes) {
      return {
        mcq: questionTypes.mcq || 0,
        true_false: questionTypes.true_false || 0,
        short_answer: questionTypes.short_answer || 0
      };
    }

    // Default distribution: 70% MCQ, 20% T/F, 10% Short Answer
    const mcqCount = Math.round(questionCount * 0.7);
    const tfCount = Math.round(questionCount * 0.2);
    const saCount = questionCount - mcqCount - tfCount;

    return {
      mcq: mcqCount,
      true_false: tfCount,
      short_answer: saCount
    };
  }

  private async generateQuestionsOfType(
    content: string,
    type: QuestionType,
    count: number,
    difficulty: DifficultyLevel,
    includeExplanations: boolean,
    seed: string | undefined,
    sections: string[],
    sectionCursor: number
  ): Promise<{ questions: QuizQuestion[]; nextSectionCursor: number }> {
    const questions: QuizQuestion[] = [];
    let cursor = sectionCursor;
    
    for (let i = 0; i < count; i++) {
      try {
        const questionSeed = seed ? `${seed}_${type}_${cursor}` : undefined;
        const sectionHint = sections.length > 0 ? sections[cursor % sections.length] : undefined;
        const question = await this.generateSingleQuestion(
          content,
          type,
          difficulty,
          includeExplanations,
          questionSeed,
          cursor,
          sectionHint
        );
        questions.push(question);
        cursor += 1;
      } catch (error) {
        console.warn(`Failed to generate ${type} question ${i + 1}:`, error);
        // Continue with other questions
      }
    }

    return { questions, nextSectionCursor: cursor };
  }

  private async generateSingleQuestion(
    content: string,
    type: QuestionType,
    difficulty: DifficultyLevel,
    includeExplanations: boolean,
    seed: string | undefined,
    questionIndex = 0,
    sectionHint?: string
  ): Promise<QuizQuestion> {
    const prompt = this.buildQuestionPrompt(content, type, difficulty, includeExplanations);
    
    const result = await this.modelClient.generateQuizQuestion({
      content: prompt,
      type,
      difficulty,
      includeExplanations,
      seed
    });

    const stem = this.sanitizeStem(result.stem);

    return {
      id: this.generateQuestionId(type, seed, questionIndex),
      type,
      stem,
      options: result.options,
      correctAnswer: result.correctAnswer,
      explanation: result.explanation,
      difficulty,
      sourceSection: sectionHint || result.sourceSection,
      metadata: {
        tokensUsed: result.tokensUsed || 0,
        generatedAt: new Date().toISOString(),
        sourceLength: content.length
      }
    };
  }

  private buildQuestionPrompt(
    content: string,
    type: QuestionType,
    difficulty: DifficultyLevel,
    includeExplanations: boolean
  ): string {
    const difficultyGuidance = {
      easy: 'Focus on basic definitions, facts, and straightforward concepts',
      medium: 'Include application of concepts and moderate complexity',
      hard: 'Require synthesis, analysis, and complex reasoning'
    };

    const typeGuidance = {
      mcq: 'Generate a multiple choice question with exactly 4 options, where only 1 is correct. Make distractors plausible but clearly wrong.',
      true_false: 'Generate a true/false statement that is clearly true or false based on the content.',
      short_answer: 'Generate a short answer question requiring a brief, specific response (1-3 words or a short phrase).'
    };

    return `Based on the following content, generate a ${difficulty} difficulty ${type} question.

${typeGuidance[type]}

${difficultyGuidance[difficulty]}

${includeExplanations ? 'Include a brief explanation citing the relevant part of the source content.' : ''}

Content:
${content}

Requirements:
- Question must be answerable from the provided content
- No "all of the above" or "none of the above" options
- Avoid ambiguous wording
- Ensure exactly one correct answer
- Ground all content in the source material

Format your response as JSON with the following structure:
{
  "stem": "question text",
  "options": ["option1", "option2", "option3", "option4"], // only for MCQ
  "correctAnswer": "correct answer or index",
  "explanation": "explanation text", // if requested
  "sourceSection": "section title or topic",
  "tokensUsed": number
}`;
  }

  private validateQuestions(questions: QuizQuestion[]): QuizValidationError[] {
    const errors: QuizValidationError[] = [];

    questions.forEach(question => {
      // Validate MCQ questions
      if (question.type === 'mcq') {
        if (!question.options || question.options.length !== 4) {
          errors.push({
            questionId: question.id,
            error: 'MCQ must have exactly 4 options',
            severity: 'error'
          });
        }

        const correctIndex = typeof question.correctAnswer === 'number' ? question.correctAnswer : -1;
        if (correctIndex < 0 || correctIndex >= (question.options?.length || 0)) {
          errors.push({
            questionId: question.id,
            error: 'Correct answer index out of range',
            severity: 'error'
          });
        }
      }

      // Validate T/F questions
      if (question.type === 'true_false') {
        if (typeof question.correctAnswer !== 'boolean') {
          errors.push({
            questionId: question.id,
            error: 'T/F questions must have boolean correct answer',
            severity: 'error'
          });
        }
      }

      // Check for trick question patterns
      if (question.stem.toLowerCase().includes('all of the above') || 
          question.stem.toLowerCase().includes('none of the above')) {
        errors.push({
          questionId: question.id,
          error: 'Avoid "all/none of the above" patterns',
          severity: 'warning'
        });
      }

      // Validate stem length
      if (question.stem.length < 10) {
        errors.push({
          questionId: question.id,
          error: 'Question stem too short',
          severity: 'warning'
        });
      }
    });

    return errors;
  }

  private generateQuizId(seed?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `quiz_${timestamp}_${random}${seed ? `_${seed}` : ''}`;
  }

  private generateQuestionId(type: QuestionType, seed?: string, index = 0): string {
    if (seed) {
      return `q_${type}_${seed}`;
    }

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6);
    return `q_${type}_${timestamp}_${random}`;
  }

  validateQuestion(question: any): string[] {
    const errors: string[] = [];

    if (!question.id) {
      errors.push('Question ID is required');
    }

    if (!question.type || !['mcq', 'true_false', 'short_answer'].includes(question.type)) {
      errors.push('Valid question type is required (mcq, true_false, short_answer)');
    }

    if (!question.stem || question.stem.trim().length < 10) {
      errors.push('Question stem is too short (minimum 10 characters)');
    }

    if (question.type === 'mcq') {
      if (!question.options || !Array.isArray(question.options) || question.options.length !== 4) {
        errors.push('MCQ must have exactly 4 options');
      } else {
        // Check for duplicate options
        const uniqueOptions = new Set(question.options);
        if (uniqueOptions.size !== question.options.length) {
          errors.push('MCQ options must be unique');
        }
      }

      if (typeof question.correctAnswer !== 'number' || 
          question.correctAnswer < 0 || 
          question.correctAnswer >= (question.options?.length || 0)) {
        errors.push('MCQ correct answer must be a valid option index (0-3)');
      }
    }

    if (question.type === 'true_false') {
      if (typeof question.correctAnswer !== 'boolean') {
        errors.push('T/F questions must have boolean correct answer');
      }
    }

    if (question.type === 'short_answer') {
      if (typeof question.correctAnswer !== 'string' || question.correctAnswer.trim().length === 0) {
        errors.push('Short answer questions must have non-empty string answer');
      }
    }

    // Check for trick question patterns
    if (question.stem && (
        question.stem.toLowerCase().includes('all of the above') || 
        question.stem.toLowerCase().includes('none of the above'))) {
      errors.push('Avoid "all/none of the above" patterns');
    }

    return errors;
  }

  private sanitizeStem(stem: string): string {
    const cleaned = stem.replace(/\?/g, '').replace(/\s+/g, ' ').trim();
    return cleaned || 'Describe the given concept';
  }
}
