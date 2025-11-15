import { QuizGeneratorService } from '../../src/services/quiz-generator.service';
import { MockModelClient } from '../../src/integrations/modelClient';
import { QuizRequest } from '../../src/types/quiz';

describe('Quiz Quality Tests (QZ-01 to QZ-15)', () => {
  let service: QuizGeneratorService;
  let mockClient: MockModelClient;

  beforeEach(() => {
    mockClient = new MockModelClient();
    service = new QuizGeneratorService(mockClient);
  });

  const comprehensiveContent = `
    # Introduction to Machine Learning
    
    Machine learning is a subset of artificial intelligence that focuses on algorithms and statistical models. 
    These algorithms enable computer systems to improve their performance on a specific task through experience.
    
    ## Types of Machine Learning
    
    There are three main types of machine learning:
    1. Supervised learning uses labeled training data to learn patterns
    2. Unsupervised learning finds patterns in unlabeled data
    3. Reinforcement learning learns through trial and error with rewards
    
    ## Supervised Learning
    
    Supervised learning is the most common type of machine learning. It uses labeled training data where 
    the correct answers are known. Examples include classification and regression problems.
    
    ## Unsupervised Learning
    
    Unsupervised learning works with unlabeled data to find hidden patterns. Common techniques include 
    clustering, dimensionality reduction, and association rule learning.
    
    ## Reinforcement Learning
    
    Reinforcement learning involves an agent learning to make decisions through trial and error. 
    The agent receives rewards or penalties based on its actions.
    
    ## Applications
    
    Machine learning is used in many applications including image recognition, natural language processing, 
    recommendation systems, fraud detection, and autonomous vehicles.
  `;

  describe('QZ-01: MCQ Validity', () => {
    it('should generate 10 MCQs with exactly 1 correct option per item', async () => {
      const request: QuizRequest = {
        content: comprehensiveContent,
        questionCount: 10,
        questionTypes: { mcq: 10 }
      };

      const result = await service.generateQuiz(request);

      expect(result.questions).toHaveLength(10);
      
      result.questions.forEach(question => {
        expect(question.type).toBe('mcq');
        expect(question.options).toHaveLength(4);
        expect(typeof question.correctAnswer).toBe('number');
        expect(question.correctAnswer).toBeGreaterThanOrEqual(0);
        expect(question.correctAnswer).toBeLessThan(4);
        
        // Check that distractors are plausible but different
        const options = question.options!;
        const correctOption = options[question.correctAnswer as number];
        const otherOptions = options.filter((_, index) => index !== question.correctAnswer);
        
        expect(correctOption).toBeDefined();
        expect(otherOptions.every(option => option !== correctOption)).toBe(true);
      });
    });
  });

  describe('QZ-02: Answer Key Integrity', () => {
    it('should maintain answer key integrity across export and validation', async () => {
      const request: QuizRequest = {
        content: comprehensiveContent,
        questionCount: 5,
        questionTypes: { mcq: 3, true_false: 2 }
      };

      const result = await service.generateQuiz(request);

      // Validate each question's answer key
      result.questions.forEach(question => {
        const errors = service.validateQuestion(question);
        expect(errors).toHaveLength(0);
        
        if (question.type === 'mcq') {
          expect(question.options![question.correctAnswer as number]).toBeDefined();
        }
      });

      // Test export and re-import integrity
      const exportedJSON = JSON.stringify(result.questions);
      const importedQuestions = JSON.parse(exportedJSON);
      
      importedQuestions.forEach((question: any) => {
        const errors = service.validateQuestion(question);
        expect(errors).toHaveLength(0);
      });
    });
  });

  describe('QZ-03: Explanations Grounded', () => {
    it('should provide explanations that cite or paraphrase source content', async () => {
      const request: QuizRequest = {
        content: comprehensiveContent,
        questionCount: 5,
        includeExplanations: true
      };

      const result = await service.generateQuiz(request);

      result.questions.forEach(question => {
        expect(question.explanation).toBeDefined();
        expect(question.explanation!.length).toBeGreaterThan(10);
        
        // Check that explanation doesn't contain obvious hallucinations
        expect(question.explanation).not.toContain('I cannot find');
        expect(question.explanation).not.toContain('not mentioned');
        expect(question.explanation).not.toContain('unknown');
      });
    });
  });

  describe('QZ-04: Difficulty Control', () => {
    it('should generate questions with appropriate difficulty levels', async () => {
      const easyRequest: QuizRequest = {
        content: comprehensiveContent,
        questionCount: 3,
        difficulty: 'easy'
      };

      const hardRequest: QuizRequest = {
        content: comprehensiveContent,
        questionCount: 3,
        difficulty: 'hard'
      };

      const easyResult = await service.generateQuiz(easyRequest);
      const hardResult = await service.generateQuiz(hardRequest);

      // Easy questions should focus on basic concepts
      easyResult.questions.forEach(question => {
        expect(question.difficulty).toBe('easy');
        expect(question.stem).toBeDefined();
      });

      // Hard questions should require more complex thinking
      hardResult.questions.forEach(question => {
        expect(question.difficulty).toBe('hard');
        expect(question.stem).toBeDefined();
      });

      // Hard questions should generally be longer/more complex
      const avgEasyLength = easyResult.questions.reduce((sum, q) => sum + q.stem.length, 0) / easyResult.questions.length;
      const avgHardLength = hardResult.questions.reduce((sum, q) => sum + q.stem.length, 0) / hardResult.questions.length;
      
      // This is a basic heuristic - hard questions might be more complex
      expect(avgHardLength).toBeGreaterThanOrEqual(avgEasyLength * 0.8);
    });
  });

  describe('QZ-05: Format Mix', () => {
    it('should generate requested mix of question formats', async () => {
      const request: QuizRequest = {
        content: comprehensiveContent,
        questionCount: 12,
        questionTypes: {
          mcq: 8,
          true_false: 2,
          short_answer: 2
        }
      };

      const result = await service.generateQuiz(request);

      expect(result.questions).toHaveLength(12);
      
      const mcqQuestions = result.questions.filter(q => q.type === 'mcq');
      const tfQuestions = result.questions.filter(q => q.type === 'true_false');
      const saQuestions = result.questions.filter(q => q.type === 'short_answer');

      expect(mcqQuestions).toHaveLength(8);
      expect(tfQuestions).toHaveLength(2);
      expect(saQuestions).toHaveLength(2);

      // Validate each format
      mcqQuestions.forEach(question => {
        expect(question.options).toHaveLength(4);
        expect(typeof question.correctAnswer).toBe('number');
      });

      tfQuestions.forEach(question => {
        expect(typeof question.correctAnswer).toBe('boolean');
      });

      saQuestions.forEach(question => {
        expect(typeof question.correctAnswer).toBe('string');
        if (typeof question.correctAnswer === 'string') {
          expect(question.correctAnswer.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('QZ-06: Coverage', () => {
    it('should cover multiple sections of the source content', async () => {
      const request: QuizRequest = {
        content: comprehensiveContent,
        questionCount: 12
      };

      const result = await service.generateQuiz(request);

      expect(result.questions).toHaveLength(12);
      expect(result.metadata.coverage.coveragePercentage).toBeGreaterThanOrEqual(70);
      expect(result.metadata.coverage.sections.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('QZ-07: Constraints/Limits', () => {
    it('should handle tiny input gracefully', async () => {
      const tinyContent = 'Machine learning is AI.';
      const request: QuizRequest = {
        content: tinyContent,
        questionCount: 3
      };

      // Should either generate fewer questions or provide rationale
      const result = await service.generateQuiz(request);
      
      expect(result.questions.length).toBeLessThanOrEqual(3);
      expect(result.questions.length).toBeGreaterThan(0);
    });
  });

  describe('QZ-08: Ambiguity Detection', () => {
    it('should avoid ambiguous questions with similar terms', async () => {
      const ambiguousContent = `
        Machine learning and deep learning are related concepts.
        Machine learning includes deep learning as a subset.
        Deep learning uses neural networks with multiple layers.
        Both machine learning and deep learning are important in AI.
      `;

      const request: QuizRequest = {
        content: ambiguousContent,
        questionCount: 5
      };

      const result = await service.generateQuiz(request);

      result.questions.forEach(question => {
        // Questions should be clear and not ambiguous
        expect(question.stem.length).toBeGreaterThan(10);
        expect(question.stem).not.toContain('?');
        expect(question.stem).not.toContain('?');
      });
    });
  });

  describe('QZ-09: PII/Safety', () => {
    it('should redact PII when safety is enabled', async () => {
      const contentWithPII = `
        John Smith is a machine learning engineer at TechCorp.
        You can reach him at john.smith@techcorp.com or call (555) 123-4567.
        He specializes in deep learning and neural networks.
        ${comprehensiveContent}
      `;

      const request: QuizRequest = {
        content: contentWithPII,
        questionCount: 5,
        redactPII: true
      };

      const result = await service.generateQuiz(request);

      result.questions.forEach(question => {
        expect(question.stem).not.toContain('john.smith@techcorp.com');
        expect(question.stem).not.toContain('(555) 123-4567');
        expect(question.stem).not.toContain('John Smith');
        expect(question.stem).not.toContain('TechCorp');
      });
    });
  });

  describe('QZ-10: Idempotency', () => {
    it('should generate stable output with same seed', async () => {
      const request: QuizRequest = {
        content: comprehensiveContent,
        questionCount: 5,
        seed: 'test-seed-123'
      };

      const result1 = await service.generateQuiz(request);
      const result2 = await service.generateQuiz(request);

      // With deterministic generation, results should be identical
      expect(result1.questions).toHaveLength(result2.questions.length);
      
      // Question IDs should be the same (they include the seed)
      result1.questions.forEach((question, index) => {
        expect(question.id).toBe(result2.questions[index].id);
      });
    });
  });

  describe('QZ-11: Latency/Scalability', () => {
    it('should handle large content within reasonable time', async () => {
      const largeContent = comprehensiveContent.repeat(10); // ~6k words
      
      const request: QuizRequest = {
        content: largeContent,
        questionCount: 20
      };

      const startTime = Date.now();
      const result = await service.generateQuiz(request);
      const endTime = Date.now();

      expect(result.questions).toHaveLength(20);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });

  describe('QZ-12: Export', () => {
    it('should export to JSON/CSV and preserve schema', async () => {
      const request: QuizRequest = {
        content: comprehensiveContent,
        questionCount: 5,
        includeExplanations: true
      };

      const result = await service.generateQuiz(request);

      // Test JSON export
      const jsonExport = JSON.stringify(result.questions, null, 2);
      const importedFromJSON = JSON.parse(jsonExport);
      
      expect(importedFromJSON).toHaveLength(5);
      importedFromJSON.forEach((question: any) => {
        expect(question.id).toBeDefined();
        expect(question.type).toBeDefined();
        expect(question.stem).toBeDefined();
        expect(question.correctAnswer).toBeDefined();
        expect(question.explanation).toBeDefined();
      });

      // Test CSV export (basic validation)
      const csvExport = result.questions.map(q => `${q.id},${q.type},${q.stem}`).join('\n');
      expect(csvExport).toContain('q_');
      expect(csvExport).toContain('mcq');
    });
  });

  describe('QZ-13: Trick Question Guard', () => {
    it('should avoid "all/none of the above" patterns', async () => {
      const request: QuizRequest = {
        content: comprehensiveContent,
        questionCount: 10,
        questionTypes: { mcq: 10 }
      };

      const result = await service.generateQuiz(request);

      result.questions.forEach(question => {
        if (question.type === 'mcq') {
          question.options!.forEach(option => {
            expect(option.toLowerCase()).not.toContain('all of the above');
            expect(option.toLowerCase()).not.toContain('none of the above');
          });
        }
      });
    });
  });

  describe('QZ-14: Negative Testing', () => {
    it('should handle corrupt input gracefully', async () => {
      const corruptRequests = [
        { content: '', questionCount: 5 },
        { content: comprehensiveContent, questionCount: -1 },
        { content: comprehensiveContent, questionCount: 100 },
        { content: comprehensiveContent, questionTypes: { mcq: 5, true_false: 3 } }, // Missing questionCount
      ];

      for (const request of corruptRequests) {
        await expect(service.generateQuiz(request as QuizRequest)).rejects.toThrow();
      }
    });
  });

  describe('QZ-15: Logging/Security', () => {
    it('should not log sensitive information', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const request: QuizRequest = {
        content: comprehensiveContent,
        questionCount: 3
      };

      await service.generateQuiz(request);

      // Check that logs don't contain full content or answer keys
      const logCalls = consoleSpy.mock.calls;
      const errorCalls = consoleErrorSpy.mock.calls;
      
      [...logCalls, ...errorCalls].forEach(call => {
        const logMessage = call.join(' ');
        expect(logMessage).not.toContain(comprehensiveContent);
        expect(logMessage).not.toContain('correctAnswer');
      });

      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });
});
