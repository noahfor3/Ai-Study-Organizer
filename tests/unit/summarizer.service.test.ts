/**
 * Unit tests for the summarizer service
 */

import { SummarizerService, ValidationError, ProcessingError, HallucinationError } from '../../src/services/summarizer.service';
import { MockModelClient } from '../../src/integrations/modelClient';

describe('SummarizerService', () => {
  let service: SummarizerService;
  let mockClient: MockModelClient;

  beforeEach(() => {
    mockClient = new MockModelClient();
    service = new SummarizerService(mockClient, 0);
  });

  describe('Input Validation', () => {
    it('should throw ValidationError for empty text', async () => {
      await expect(service.summarize({
        text: '',
        mode: 'abstract',
      })).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for text shorter than 200 characters', async () => {
      const shortText = 'This is a short text that is less than 200 characters long and should be rejected by the validation logic.';
      await expect(service.summarize({
        text: shortText,
        mode: 'abstract',
      })).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid mode', async () => {
      const longText = 'This is a much longer text that exceeds the minimum 200 character requirement for validation. It contains enough content to pass the basic length validation but should fail due to invalid mode specification. The text continues to ensure it meets the minimum length requirements.';
      
      await expect(service.summarize({
        text: longText,
        mode: 'invalid' as any,
      })).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid bullet count', async () => {
      const longText = 'This is a much longer text that exceeds the minimum 200 character requirement for validation. It contains enough content to pass the basic length validation but should fail due to invalid bullet count specification. The text continues to ensure it meets the minimum length requirements.';
      
      await expect(service.summarize({
        text: longText,
        mode: 'bullets',
        bulletCount: 10, // Invalid: should be 3-7
      })).rejects.toThrow(ValidationError);
    });

    it('should accept valid input', async () => {
      const longText = 'This is a much longer text that exceeds the minimum 200 character requirement for validation. It contains enough content to pass the basic length validation and should be accepted by the service. The text continues to ensure it meets the minimum length requirements and provides sufficient content for summarization.';
      
      const result = await service.summarize({
        text: longText,
        mode: 'abstract',
      });
      
      expect(result).toBeDefined();
      expect(result.summaryType).toBe('abstract');
    });
  });

  describe('Abstract Mode', () => {
    it('should generate abstract summary with proper length control', async () => {
      const longText = 'This is a comprehensive document about artificial intelligence and machine learning. It covers various topics including neural networks, deep learning, natural language processing, and computer vision. The document explains how these technologies work together to create intelligent systems that can understand and process human language, recognize patterns in images, and make predictions based on data. It also discusses the applications of AI in various industries such as healthcare, finance, transportation, and entertainment. The document provides detailed explanations of key concepts and includes examples of real-world implementations.';
      
      const result = await service.summarize({
        text: longText,
        mode: 'abstract',
      });
      
      expect(result.summaryType).toBe('abstract');
      expect(typeof result.content).toBe('string');
      expect(result.meta.tokensIn).toBeGreaterThan(0);
      expect(result.meta.tokensOut).toBeGreaterThan(0);
    });

    it('should handle PII redaction in abstract mode', async () => {
      const textWithPII = 'This is a comprehensive document about artificial intelligence and machine learning. It covers various topics including neural networks, deep learning, natural language processing, and computer vision. The document explains how these technologies work together to create intelligent systems that can understand and process human language, recognize patterns in images, and make predictions based on data. Contact the author at john.doe@example.com for more information or call (555) 123-4567.';
      
      const result = await service.summarize({
        text: textWithPII,
        mode: 'abstract',
        redactPII: true,
      });
      
      expect(result.summaryType).toBe('abstract');
      expect(typeof result.content).toBe('string');
      // The content should not contain the original PII
      expect(result.content).not.toContain('john.doe@example.com');
      expect(result.content).not.toContain('(555) 123-4567');
    });
  });

  describe('Bullets Mode', () => {
    it('should generate exact number of bullets', async () => {
      const longText = 'This is a comprehensive document about artificial intelligence and machine learning. It covers various topics including neural networks, deep learning, natural language processing, and computer vision. The document explains how these technologies work together to create intelligent systems that can understand and process human language, recognize patterns in images, and make predictions based on data. It also discusses the applications of AI in various industries such as healthcare, finance, transportation, and entertainment. The document provides detailed explanations of key concepts and includes examples of real-world implementations.';
      
      const result = await service.summarize({
        text: longText,
        mode: 'bullets',
        bulletCount: 5,
      });
      
      expect(result.summaryType).toBe('bullets');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(5);
    });

    it('should respect bullet count limits', async () => {
      const longText = 'This is a comprehensive document about artificial intelligence and machine learning. It covers various topics including neural networks, deep learning, natural language processing, and computer vision. The document explains how these technologies work together to create intelligent systems that can understand and process human language, recognize patterns in images, and make predictions based on data. It also discusses the applications of AI in various industries such as healthcare, finance, transportation, and entertainment. The document provides detailed explanations of key concepts and includes examples of real-world implementations.';
      
      const result = await service.summarize({
        text: longText,
        mode: 'bullets',
        bulletCount: 3,
      });
      
      expect(result.summaryType).toBe('bullets');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(3);
    });

    it('should handle PII redaction in bullets mode', async () => {
      const textWithPII = 'This is a comprehensive document about artificial intelligence and machine learning. It covers various topics including neural networks, deep learning, natural language processing, and computer vision. The document explains how these technologies work together to create intelligent systems that can understand and process human language, recognize patterns in images, and make predictions based on data. Contact the author at john.doe@example.com for more information or call (555) 123-4567.';
      
      const result = await service.summarize({
        text: textWithPII,
        mode: 'bullets',
        bulletCount: 4,
        redactPII: true,
      });
      
      expect(result.summaryType).toBe('bullets');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(4);
      
      // Check that PII is redacted in all bullets
      const contentString = Array.isArray(result.content) ? result.content.join(' ') : result.content;
      expect(contentString).not.toContain('john.doe@example.com');
      expect(contentString).not.toContain('(555) 123-4567');
    });
  });

  describe('Hallucination Detection', () => {
    it('should detect hallucinated numbers in abstract mode', async () => {
      // Mock the client to return a summary with numbers not in source
      const mockClientWithHallucination = new MockModelClient();
      jest.spyOn(mockClientWithHallucination, 'generateSummary').mockResolvedValue(
        'This document discusses AI concepts and mentions that 95% of companies use machine learning.'
      );
      
      const serviceWithMock = new SummarizerService(mockClientWithHallucination, 0);
      
      const textWithoutNumbers = 'This is a comprehensive document about artificial intelligence and machine learning. It covers various topics including neural networks, deep learning, natural language processing, and computer vision. The document explains how these technologies work together to create intelligent systems that can understand and process human language, recognize patterns in images, and make predictions based on data.';
      
      await expect(serviceWithMock.summarize({
        text: textWithoutNumbers,
        mode: 'abstract',
      })).rejects.toThrow(HallucinationError);
    });

    it('should detect hallucinated numbers in bullets mode', async () => {
      // Mock the client to return bullets with numbers not in source
      const mockClientWithHallucination = new MockModelClient();
      jest.spyOn(mockClientWithHallucination, 'generateSummary').mockResolvedValue([
        'AI is used by 90% of companies',
        'Machine learning improves efficiency by 50%',
        'Neural networks process data faster',
      ]);
      
      const serviceWithMock = new SummarizerService(mockClientWithHallucination, 0);
      
      const textWithoutNumbers = 'This is a comprehensive document about artificial intelligence and machine learning. It covers various topics including neural networks, deep learning, natural language processing, and computer vision. The document explains how these technologies work together to create intelligent systems that can understand and process human language, recognize patterns in images, and make predictions based on data.';
      
      await expect(serviceWithMock.summarize({
        text: textWithoutNumbers,
        mode: 'bullets',
        bulletCount: 3,
      })).rejects.toThrow(HallucinationError);
    });

    it('should allow numbers that exist in source text', async () => {
      const textWithNumbers = 'This document discusses AI concepts and mentions that 95% of companies use machine learning. The technology has grown by 300% in the last decade. Artificial intelligence and machine learning have become essential tools in modern business operations, transforming how organizations process data and make decisions.';
      
      const result = await service.summarize({
        text: textWithNumbers,
        mode: 'abstract',
      });
      
      expect(result).toBeDefined();
      expect(result.summaryType).toBe('abstract');
    });
  });

  describe('Metadata', () => {
    it('should calculate correct token counts', async () => {
      const longText = 'This is a comprehensive document about artificial intelligence and machine learning. It covers various topics including neural networks, deep learning, natural language processing, and computer vision. The document explains how these technologies work together to create intelligent systems that can understand and process human language, recognize patterns in images, and make predictions based on data. It also discusses the applications of AI in various industries such as healthcare, finance, transportation, and entertainment. The document provides detailed explanations of key concepts and includes examples of real-world implementations.';
      
      const result = await service.summarize({
        text: longText,
        mode: 'abstract',
      });
      
      expect(result.meta.tokensIn).toBeGreaterThan(0);
      expect(result.meta.tokensOut).toBeGreaterThan(0);
      expect(result.meta.tokensOut).toBeLessThanOrEqual(result.meta.tokensIn);
    });

    it('should calculate correct token counts for bullets', async () => {
      const longText = 'This is a comprehensive document about artificial intelligence and machine learning. It covers various topics including neural networks, deep learning, natural language processing, and computer vision. The document explains how these technologies work together to create intelligent systems that can understand and process human language, recognize patterns in images, and make predictions based on data. It also discusses the applications of AI in various industries such as healthcare, finance, transportation, and entertainment. The document provides detailed explanations of key concepts and includes examples of real-world implementations.';
      
      const result = await service.summarize({
        text: longText,
        mode: 'bullets',
        bulletCount: 4,
      });
      
      expect(result.meta.tokensIn).toBeGreaterThan(0);
      expect(result.meta.tokensOut).toBeGreaterThan(0);
      expect(result.meta.tokensOut).toBeLessThanOrEqual(result.meta.tokensIn);
    });
  });
});
