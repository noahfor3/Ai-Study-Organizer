import request from 'supertest';
import { createApp } from '../../src/app';

describe('Quiz API Endpoints', () => {
  let app: any;

  beforeAll(() => {
    app = createApp();
  });

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

  describe('POST /api/quiz/generate', () => {
    it('should generate quiz with valid request', async () => {
      const quizRequest = {
        content: sampleContent,
        questionCount: 5,
        difficulty: 'medium',
        includeExplanations: true
      };

      const response = await request(app)
        .post('/api/quiz/generate')
        .send(quizRequest)
        .expect(200);

      expect(response.body.quizId).toBeDefined();
      expect(response.body.questions).toHaveLength(5);
      expect(response.body.metadata.totalQuestions).toBe(5);
      expect(response.body.metadata.difficulty).toBe('medium');
      expect(response.body.requestId).toBeDefined();
    });

    it('should generate quiz with custom question types', async () => {
      const quizRequest = {
        content: sampleContent,
        questionCount: 6,
        questionTypes: {
          mcq: 3,
          true_false: 2,
          short_answer: 1
        },
        difficulty: 'hard'
      };

      const response = await request(app)
        .post('/api/quiz/generate')
        .send(quizRequest)
        .expect(200);

      expect(response.body.questions).toHaveLength(6);
      
      const mcqQuestions = response.body.questions.filter((q: any) => q.type === 'mcq');
      const tfQuestions = response.body.questions.filter((q: any) => q.type === 'true_false');
      const saQuestions = response.body.questions.filter((q: any) => q.type === 'short_answer');

      expect(mcqQuestions).toHaveLength(3);
      expect(tfQuestions).toHaveLength(2);
      expect(saQuestions).toHaveLength(1);
    });

    it('should reject request with short content', async () => {
      const quizRequest = {
        content: 'Short content',
        questionCount: 5
      };

      const response = await request(app)
        .post('/api/quiz/generate')
        .send(quizRequest)
        .expect(400);

      expect(response.body.error).toBe('Content must be at least 200 characters long');
    });

    it('should reject request with invalid question count', async () => {
      const quizRequest = {
        content: sampleContent,
        questionCount: 0
      };

      const response = await request(app)
        .post('/api/quiz/generate')
        .send(quizRequest)
        .expect(400);

      expect(response.body.error).toBe('Question count must be between 1 and 50');
    });

    it('should reject request with question count over 50', async () => {
      const quizRequest = {
        content: sampleContent,
        questionCount: 100
      };

      const response = await request(app)
        .post('/api/quiz/generate')
        .send(quizRequest)
        .expect(400);

      expect(response.body.error).toBe('Question count must be between 1 and 50');
    });

    it('should handle PII redaction when enabled', async () => {
      const contentWithPII = `
        John Smith is a machine learning engineer at TechCorp. 
        You can reach him at john.smith@techcorp.com or call (555) 123-4567.
        He specializes in deep learning and neural networks.
        ${sampleContent}
      `;

      const quizRequest = {
        content: contentWithPII,
        questionCount: 3,
        redactPII: true
      };

      const response = await request(app)
        .post('/api/quiz/generate')
        .send(quizRequest)
        .expect(200);

      expect(response.body.questions).toHaveLength(3);
      // Questions should not contain PII
      response.body.questions.forEach((question: any) => {
        expect(question.stem).not.toContain('john.smith@techcorp.com');
        expect(question.stem).not.toContain('(555) 123-4567');
      });
    });
  });

  describe('POST /api/quiz/export', () => {
    const sampleQuestions = [
      {
        id: 'q1',
        type: 'mcq',
        stem: 'What is machine learning?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        explanation: 'Machine learning is a subset of AI',
        difficulty: 'medium',
        sourceSection: 'Introduction',
        metadata: {
          tokensUsed: 50,
          generatedAt: '2023-01-01T00:00:00.000Z',
          sourceLength: 1000
        }
      },
      {
        id: 'q2',
        type: 'true_false',
        stem: 'Machine learning is a subset of AI.',
        correctAnswer: true,
        explanation: 'This is true',
        difficulty: 'easy',
        sourceSection: 'Introduction',
        metadata: {
          tokensUsed: 30,
          generatedAt: '2023-01-01T00:00:00.000Z',
          sourceLength: 1000
        }
      }
    ];

    it('should export quiz to JSON format', async () => {
      const exportRequest = {
        questions: sampleQuestions,
        options: {
          format: 'json',
          includeMetadata: true,
          includeExplanations: true
        }
      };

      const response = await request(app)
        .post('/api/quiz/export')
        .send(exportRequest)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/json');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('.json');

      const exportedData = JSON.parse(response.text);
      expect(exportedData.questions).toHaveLength(2);
      expect(exportedData.totalQuestions).toBe(2);
      expect(exportedData.exportedAt).toBeDefined();
    });

    it('should export quiz to CSV format', async () => {
      const exportRequest = {
        questions: sampleQuestions,
        options: {
          format: 'csv',
          includeMetadata: false,
          includeExplanations: true
        }
      };

      const response = await request(app)
        .post('/api/quiz/export')
        .send(exportRequest)
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('.csv');

      const csvData = response.text;
      expect(csvData).toContain('ID,Type,Stem');
      expect(csvData).toContain('q1,mcq');
      expect(csvData).toContain('q2,true_false');
    });

    it('should reject export without questions', async () => {
      const exportRequest = {
        options: {
          format: 'json',
          includeMetadata: true
        }
      };

      const response = await request(app)
        .post('/api/quiz/export')
        .send(exportRequest)
        .expect(400);

      expect(response.body.error).toBe('Questions array is required');
    });

    it('should reject export without format', async () => {
      const exportRequest = {
        questions: sampleQuestions,
        options: {
          includeMetadata: true
        }
      };

      const response = await request(app)
        .post('/api/quiz/export')
        .send(exportRequest)
        .expect(400);

      expect(response.body.error).toBe('Export options with format are required');
    });

    it('should reject unsupported export format', async () => {
      const exportRequest = {
        questions: sampleQuestions,
        options: {
          format: 'xml',
          includeMetadata: true
        }
      };

      const response = await request(app)
        .post('/api/quiz/export')
        .send(exportRequest)
        .expect(400);

      expect(response.body.error).toBe('Unsupported export format. Use "json" or "csv"');
    });
  });

  describe('POST /api/quiz/validate', () => {
    const validQuestions = [
      {
        id: 'q1',
        type: 'mcq',
        stem: 'What is machine learning?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        difficulty: 'medium'
      },
      {
        id: 'q2',
        type: 'true_false',
        stem: 'Machine learning is a subset of AI.',
        correctAnswer: true,
        difficulty: 'easy'
      }
    ];

    const invalidQuestions = [
      {
        id: 'q1',
        type: 'mcq',
        stem: 'What?', // Too short
        options: ['Option A', 'Option B'], // Wrong number
        correctAnswer: 5, // Invalid index
        difficulty: 'medium'
      },
      {
        id: 'q2',
        type: 'true_false',
        stem: 'Machine learning is a subset of AI.',
        correctAnswer: 'true', // Should be boolean
        difficulty: 'easy'
      }
    ];

    it('should validate correct questions', async () => {
      const validateRequest = {
        questions: validQuestions
      };

      const response = await request(app)
        .post('/api/quiz/validate')
        .send(validateRequest)
        .expect(200);

      expect(response.body.summary.totalQuestions).toBe(2);
      expect(response.body.summary.validQuestions).toBe(2);
      expect(response.body.summary.invalidQuestions).toBe(0);
      expect(response.body.summary.totalErrors).toBe(0);
    });

    it('should identify validation errors', async () => {
      const validateRequest = {
        questions: invalidQuestions
      };

      const response = await request(app)
        .post('/api/quiz/validate')
        .send(validateRequest)
        .expect(200);

      expect(response.body.summary.totalQuestions).toBe(2);
      expect(response.body.summary.validQuestions).toBe(0);
      expect(response.body.summary.invalidQuestions).toBe(2);
      expect(response.body.summary.totalErrors).toBeGreaterThan(0);

      // Check specific errors
      const firstQuestionErrors = response.body.validationResults[0].errors;
      expect(firstQuestionErrors).toContain('Question stem is too short (minimum 10 characters)');
      expect(firstQuestionErrors).toContain('MCQ must have exactly 4 options');
      expect(firstQuestionErrors).toContain('MCQ correct answer must be a valid option index (0-3)');

      const secondQuestionErrors = response.body.validationResults[1].errors;
      expect(secondQuestionErrors).toContain('T/F questions must have boolean correct answer');
    });

    it('should reject validation without questions', async () => {
      const validateRequest = {};

      const response = await request(app)
        .post('/api/quiz/validate')
        .send(validateRequest)
        .expect(400);

      expect(response.body.error).toBe('Questions array is required');
    });
  });

  describe('GET /api/quiz/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/quiz/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('quiz-generator');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
