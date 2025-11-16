import { QuizGeneratorService } from '../../src/services/quiz-generator.service';
import { MockModelClient } from '../../src/integrations/modelClient';
import { QuizRequest, QuizQuestion } from '../../src/types/quiz';

const createMetadata = () => ({
  tokensUsed: 50,
  generatedAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
  sourceLength: 100,
});

describe('QuizGeneratorService', () => {
  let service: QuizGeneratorService;
  let mockClient: MockModelClient;

  beforeEach(() => {
    mockClient = new MockModelClient();
    service = new QuizGeneratorService(mockClient);
  });

  describe('generateQuiz', () => {
    const sampleContent = `
      # Introduction to Machine Learning
      
      Machine learning is a subset of artificial intelligence that focuses on algorithms and statistical models. 
      These algorithms enable computer systems to improve their performance on a specific task through experience.
      
      ## Types of Machine Learning
      
      There are three main types of machine learning:
      1. Supervised learning uses labeled training data
      2. Unsupervised learning finds patterns in unlabeled data
      3. Reinforcement learning learns through trial and error
      
      ## Applications
      
      Machine learning is used in many applications including image recognition, natural language processing, 
      and recommendation systems. These applications help automate decision-making processes.
    `;

    it('should generate quiz with default distribution', async () => {
      const request: QuizRequest = {
        content: sampleContent,
        questionCount: 10
      };

      const result = await service.generateQuiz(request);

      expect(result.quizId).toBeDefined();
      expect(result.questions).toHaveLength(10);
      expect(result.metadata.totalQuestions).toBe(10);
      expect(result.metadata.difficulty).toBe('medium');
      expect(result.metadata.coverage.coveragePercentage).toBeGreaterThan(0);
    });

    it('should generate quiz with custom question types', async () => {
      const request: QuizRequest = {
        content: sampleContent,
        questionCount: 6,
        questionTypes: {
          mcq: 3,
          true_false: 2,
          short_answer: 1
        }
      };

      const result = await service.generateQuiz(request);

      expect(result.questions).toHaveLength(6);
      
      const mcqQuestions = result.questions.filter(q => q.type === 'mcq');
      const tfQuestions = result.questions.filter(q => q.type === 'true_false');
      const saQuestions = result.questions.filter(q => q.type === 'short_answer');

      expect(mcqQuestions).toHaveLength(3);
      expect(tfQuestions).toHaveLength(2);
      expect(saQuestions).toHaveLength(1);
    });

    it('should generate quiz with specific difficulty', async () => {
      const request: QuizRequest = {
        content: sampleContent,
        questionCount: 5,
        difficulty: 'hard'
      };

      const result = await service.generateQuiz(request);

      expect(result.questions).toHaveLength(5);
      result.questions.forEach(question => {
        expect(question.difficulty).toBe('hard');
      });
    });

    it('should include explanations when requested', async () => {
      const request: QuizRequest = {
        content: sampleContent,
        questionCount: 3,
        includeExplanations: true
      };

      const result = await service.generateQuiz(request);

      expect(result.questions).toHaveLength(3);
      result.questions.forEach(question => {
        expect(question.explanation).toBeDefined();
        expect(question.explanation!.length).toBeGreaterThan(0);
      });
    });

    it('should validate MCQ questions have exactly 4 options', async () => {
      const request: QuizRequest = {
        content: sampleContent,
        questionCount: 5,
        questionTypes: { mcq: 5 }
      };

      const result = await service.generateQuiz(request);

      const mcqQuestions = result.questions.filter(q => q.type === 'mcq');
      mcqQuestions.forEach(question => {
        expect(question.options).toHaveLength(4);
        expect(typeof question.correctAnswer).toBe('number');
        expect(question.correctAnswer).toBeGreaterThanOrEqual(0);
        expect(question.correctAnswer).toBeLessThan(4);
      });
    });

    it('should validate T/F questions have boolean answers', async () => {
      const request: QuizRequest = {
        content: sampleContent,
        questionCount: 3,
        questionTypes: { true_false: 3 }
      };

      const result = await service.generateQuiz(request);

      const tfQuestions = result.questions.filter(q => q.type === 'true_false');
      tfQuestions.forEach(question => {
        expect(typeof question.correctAnswer).toBe('boolean');
      });
    });

    it('should validate short answer questions have string answers', async () => {
      const request: QuizRequest = {
        content: sampleContent,
        questionCount: 2,
        questionTypes: { short_answer: 2 }
      };

      const result = await service.generateQuiz(request);

      const saQuestions = result.questions.filter(q => q.type === 'short_answer');
      saQuestions.forEach(question => {
        expect(typeof question.correctAnswer).toBe('string');
        if (typeof question.correctAnswer === 'string') {
          expect(question.correctAnswer.length).toBeGreaterThan(0);
        }
      });
    });

    it('should gracefully handle content that is too short', async () => {
      const request: QuizRequest = {
        content: 'Short content',
        questionCount: 5
      };

      const result = await service.generateQuiz(request);
      expect(result.questions.length).toBeGreaterThan(0);
      expect(result.questions.length).toBeLessThanOrEqual(request.questionCount);
    });

    it('should reject invalid question count', async () => {
      const request: QuizRequest = {
        content: sampleContent,
        questionCount: 0
      };

      await expect(service.generateQuiz(request)).rejects.toThrow('Question count must be between 1 and 50');
    });

    it('should reject question count over 50', async () => {
      const request: QuizRequest = {
        content: sampleContent,
        questionCount: 100
      };

      await expect(service.generateQuiz(request)).rejects.toThrow('Question count must be between 1 and 50');
    });

    it('should reject mismatched question type counts', async () => {
      const request: QuizRequest = {
        content: sampleContent,
        questionCount: 10,
        questionTypes: {
          mcq: 5,
          true_false: 3,
          short_answer: 1 // Total: 9, but questionCount is 10
        }
      };

      await expect(service.generateQuiz(request)).rejects.toThrow('Sum of question types must equal total question count');
    });
  });

  describe('validateQuestion', () => {
    it('should validate correct MCQ question', () => {
      const question: QuizQuestion = {
        id: 'test-1',
        type: 'mcq',
        stem: 'What is machine learning?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        difficulty: 'medium',
        metadata: createMetadata(),
      };

      const errors = service.validateQuestion(question);
      expect(errors).toHaveLength(0);
    });

    it('should validate correct T/F question', () => {
      const question: QuizQuestion = {
        id: 'test-2',
        type: 'true_false',
        stem: 'Machine learning is a subset of AI.',
        correctAnswer: true,
        difficulty: 'easy',
        metadata: createMetadata(),
      };

      const errors = service.validateQuestion(question);
      expect(errors).toHaveLength(0);
    });

    it('should validate correct short answer question', () => {
      const question: QuizQuestion = {
        id: 'test-3',
        type: 'short_answer',
        stem: 'What are the three types of machine learning?',
        correctAnswer: 'Supervised, unsupervised, reinforcement',
        difficulty: 'medium',
        metadata: createMetadata(),
      };

      const errors = service.validateQuestion(question);
      expect(errors).toHaveLength(0);
    });

    it('should catch MCQ with wrong number of options', () => {
      const question: QuizQuestion = {
        id: 'test-4',
        type: 'mcq',
        stem: 'What is machine learning?',
        options: ['Option A', 'Option B'],
        correctAnswer: 0,
        difficulty: 'medium',
        metadata: createMetadata(),
      };

      const errors = service.validateQuestion(question);
      expect(errors).toContain('MCQ must have exactly 4 options');
    });

    it('should catch MCQ with invalid correct answer index', () => {
      const question: QuizQuestion = {
        id: 'test-5',
        type: 'mcq',
        stem: 'What is machine learning?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 5,
        difficulty: 'medium',
        metadata: createMetadata(),
      };

      const errors = service.validateQuestion(question);
      expect(errors).toContain('MCQ correct answer must be a valid option index (0-3)');
    });

    it('should catch T/F with non-boolean answer', () => {
      const question: QuizQuestion = {
        id: 'test-6',
        type: 'true_false',
        stem: 'Machine learning is a subset of AI.',
        correctAnswer: 'true',
        difficulty: 'easy',
        metadata: createMetadata(),
      };

      const errors = service.validateQuestion(question);
      expect(errors).toContain('T/F questions must have boolean correct answer');
    });

    it('should catch short answer with empty answer', () => {
      const question: QuizQuestion = {
        id: 'test-7',
        type: 'short_answer',
        stem: 'What are the three types of machine learning?',
        correctAnswer: '',
        difficulty: 'medium',
        metadata: createMetadata(),
      };

      const errors = service.validateQuestion(question);
      expect(errors).toContain('Short answer questions must have non-empty string answer');
    });

    it('should catch trick question patterns', () => {
      const question: QuizQuestion = {
        id: 'test-8',
        type: 'mcq',
        stem: 'Which of the following is correct? All of the above.',
        options: ['Option A', 'Option B', 'Option C', 'All of the above'],
        correctAnswer: 3,
        difficulty: 'medium',
        metadata: createMetadata(),
      };

      const errors = service.validateQuestion(question);
      expect(errors).toContain('Avoid "all/none of the above" patterns');
    });

    it('should catch short question stems', () => {
      const question: QuizQuestion = {
        id: 'test-9',
        type: 'mcq',
        stem: 'What?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        difficulty: 'medium',
        metadata: createMetadata(),
      };

      const errors = service.validateQuestion(question);
      expect(errors).toContain('Question stem is too short (minimum 10 characters)');
    });
  });
});
