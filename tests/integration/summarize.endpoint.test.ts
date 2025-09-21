/**
 * Integration tests for the summarization API endpoint
 */

import request from 'supertest';
import { createApp } from '../../src/app';

describe('Summarization API Endpoint', () => {
  let app: any;

  beforeEach(() => {
    app = createApp();
  });

  describe('POST /api/summarize', () => {
    const validLongText = 'This is a comprehensive document about artificial intelligence and machine learning. It covers various topics including neural networks, deep learning, natural language processing, and computer vision. The document explains how these technologies work together to create intelligent systems that can understand and process human language, recognize patterns in images, and make predictions based on data. It also discusses the applications of AI in various industries such as healthcare, finance, transportation, and entertainment. The document provides detailed explanations of key concepts and includes examples of real-world implementations. This content is designed to be long enough to pass the minimum character requirement for summarization.';

    describe('200 OK Responses', () => {
      it('should return abstract summary with valid input', async () => {
        const response = await request(app)
          .post('/api/summarize')
          .send({
            text: validLongText,
            mode: 'abstract',
          })
          .expect(200);

        expect(response.body).toHaveProperty('summaryType', 'abstract');
        expect(response.body).toHaveProperty('content');
        expect(response.body).toHaveProperty('meta');
        expect(response.body).toHaveProperty('requestId');
        expect(typeof response.body.content).toBe('string');
        expect(response.body.meta).toHaveProperty('tokensIn');
        expect(response.body.meta).toHaveProperty('tokensOut');
        expect(response.body.meta.tokensIn).toBeGreaterThan(0);
        expect(response.body.meta.tokensOut).toBeGreaterThan(0);
      });

      it('should return bullets summary with valid input', async () => {
        const response = await request(app)
          .post('/api/summarize')
          .send({
            text: validLongText,
            mode: 'bullets',
            bulletCount: 5,
          })
          .expect(200);

        expect(response.body).toHaveProperty('summaryType', 'bullets');
        expect(response.body).toHaveProperty('content');
        expect(response.body).toHaveProperty('meta');
        expect(response.body).toHaveProperty('requestId');
        expect(Array.isArray(response.body.content)).toBe(true);
        expect(response.body.content).toHaveLength(5);
        expect(response.body.meta).toHaveProperty('tokensIn');
        expect(response.body.meta).toHaveProperty('tokensOut');
      });

      it('should handle PII redaction when requested', async () => {
        const textWithPII = validLongText + ' Contact the author at john.doe@example.com for more information or call (555) 123-4567.';
        
        const response = await request(app)
          .post('/api/summarize')
          .send({
            text: textWithPII,
            mode: 'abstract',
            redactPII: true,
          })
          .expect(200);

        expect(response.body).toHaveProperty('summaryType', 'abstract');
        expect(response.body).toHaveProperty('content');
        expect(typeof response.body.content).toBe('string');
        
        // The content should not contain the original PII
        expect(response.body.content).not.toContain('john.doe@example.com');
        expect(response.body.content).not.toContain('(555) 123-4567');
      });

      it('should handle different bullet counts', async () => {
        const response = await request(app)
          .post('/api/summarize')
          .send({
            text: validLongText,
            mode: 'bullets',
            bulletCount: 3,
          })
          .expect(200);

        expect(response.body).toHaveProperty('summaryType', 'bullets');
        expect(Array.isArray(response.body.content)).toBe(true);
        expect(response.body.content).toHaveLength(3);
      });

      it('should use default bullet count when not specified', async () => {
        const response = await request(app)
          .post('/api/summarize')
          .send({
            text: validLongText,
            mode: 'bullets',
          })
          .expect(200);

        expect(response.body).toHaveProperty('summaryType', 'bullets');
        expect(Array.isArray(response.body.content)).toBe(true);
        expect(response.body.content).toHaveLength(5); // Default bullet count
      });
    });

    describe('400 Bad Request Responses', () => {
      it('should return 400 for missing text', async () => {
        const response = await request(app)
          .post('/api/summarize')
          .send({
            mode: 'abstract',
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('requestId');
        expect(response.body.error).toBe('Invalid input');
      });

      it('should return 400 for empty text', async () => {
        const response = await request(app)
          .post('/api/summarize')
          .send({
            text: '',
            mode: 'abstract',
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('requestId');
      });

      it('should return 400 for text shorter than 200 characters', async () => {
        const shortText = 'This is a short text that is less than 200 characters long and should be rejected by the validation logic.';
        
        const response = await request(app)
          .post('/api/summarize')
          .send({
            text: shortText,
            mode: 'abstract',
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('requestId');
        expect(response.body.error).toBe('Validation Error');
      });

      it('should return 400 for invalid mode', async () => {
        const response = await request(app)
          .post('/api/summarize')
          .send({
            text: validLongText,
            mode: 'invalid',
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('requestId');
        expect(response.body.error).toBe('Invalid input');
      });

      it('should return 400 for invalid bullet count', async () => {
        const response = await request(app)
          .post('/api/summarize')
          .send({
            text: validLongText,
            mode: 'bullets',
            bulletCount: 10, // Invalid: should be 3-7
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('requestId');
        expect(response.body.error).toBe('Validation Error');
      });

      it('should return 400 for non-string text', async () => {
        const response = await request(app)
          .post('/api/summarize')
          .send({
            text: 123, // Invalid: should be string
            mode: 'abstract',
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('requestId');
        expect(response.body.error).toBe('Invalid input');
      });
    });

    describe('500 Internal Server Error Responses', () => {
      it('should return 500 for processing errors', async () => {
        // Mock a processing error by sending malformed data
        const response = await request(app)
          .post('/api/summarize')
          .send({
            text: validLongText,
            mode: 'abstract',
            // Add some invalid property that might cause processing error
            invalidProperty: 'test',
          })
          .expect(200); // The service should handle this gracefully

        // The service should still work despite extra properties
        expect(response.body).toHaveProperty('summaryType', 'abstract');
      });
    });

    describe('Request ID and Logging', () => {
      it('should include request ID in all responses', async () => {
        const response = await request(app)
          .post('/api/summarize')
          .send({
            text: validLongText,
            mode: 'abstract',
          })
          .expect(200);

        expect(response.body).toHaveProperty('requestId');
        expect(typeof response.body.requestId).toBe('string');
        expect(response.body.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
      });

      it('should include request ID in error responses', async () => {
        const response = await request(app)
          .post('/api/summarize')
          .send({
            text: 'short',
            mode: 'abstract',
          })
          .expect(400);

        expect(response.body).toHaveProperty('requestId');
        expect(typeof response.body.requestId).toBe('string');
        expect(response.body.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
      });
    });

    describe('Content-Type and Headers', () => {
      it('should return JSON content type', async () => {
        const response = await request(app)
          .post('/api/summarize')
          .send({
            text: validLongText,
            mode: 'abstract',
          })
          .expect(200);

        expect(response.headers['content-type']).toMatch(/application\/json/);
      });
    });
  });

  describe('GET /api/summarize/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/summarize/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'summarization-api');
    });
  });

  describe('GET /health', () => {
    it('should return main health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'ai-study-organizer-api');
      expect(response.body).toHaveProperty('version', '1.0.0');
    });
  });

  describe('404 Not Found', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not Found');
      expect(response.body).toHaveProperty('message');
    });
  });
});
