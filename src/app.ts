/**
 * Express application setup and configuration
 */

import express from 'express';
import cors from 'cors';
import summarizeRouter from './app/api/summarize.router';
import quizRouter from './app/api/quiz.router';
import logger from './lib/logger';

/**
 * Create and configure the Express application
 * @returns Configured Express app
 */
export function createApp(): express.Application {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging middleware
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    logger.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'ai-study-organizer-api',
      version: '1.0.0',
    });
  });

  // API routes
  app.use('/api', summarizeRouter);
  app.use('/api/quiz', quizRouter);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    });
  });

  // Error handling middleware
  app.use((error: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error('Unhandled error:', error);
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  });

  return app;
}
