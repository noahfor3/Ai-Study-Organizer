/**
 * Express router for the summarization API endpoint
 */

import { Router, Request, Response } from 'express';
import { SummarizerService, SummarizeRequest, ValidationError, ProcessingError, HallucinationError } from '../../services/summarizer.service';
import { createModelClient } from '../../integrations/modelClient';
import logger from '../../lib/logger';

const router = Router();

// Initialize the summarizer service
const modelClient = createModelClient({
  apiKey: process.env.MODEL_API_KEY,
  temperature: parseFloat(process.env.MODEL_TEMPERATURE || '0'),
}, true); // Use real AI model

const summarizerService = new SummarizerService(modelClient);

/**
 * POST /api/summarize
 * Summarize text content
 */
router.post('/summarize', async (req: Request, res: Response) => {
  const requestId = generateRequestId();
  
  try {
  // Log request (without full text for security)
  logger.log(`[${requestId}] Summarize request - mode: ${req.body.mode}, text length: ${req.body.text?.length || 0}`);
    
    // Validate request body
    const { text, mode, bulletCount, redactPII } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Text is required and must be a string',
        requestId,
      });
    }

    if (!mode || (mode !== 'abstract' && mode !== 'bullets')) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Mode must be either "abstract" or "bullets"',
        requestId,
      });
    }

    // Create summarization request
    const summarizeRequest: SummarizeRequest = {
      text,
      mode,
      bulletCount: bulletCount || 5,
      redactPII: redactPII || false,
    };

    // Process the request
    const result = await summarizerService.summarize(summarizeRequest);
    
  // Log success (without content for security)
  logger.info(`[${requestId}] Summarization successful - tokens in: ${result.meta.tokensIn}, tokens out: ${result.meta.tokensOut}`);
    
    // Return success response
    res.status(200).json({
      summaryType: result.summaryType,
      content: result.content,
      meta: result.meta,
      requestId,
    });

  } catch (error) {
  logger.error(`[${requestId}] Summarization error:`, error);
    
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message,
        requestId,
      });
    }
    
    if (error instanceof HallucinationError) {
      return res.status(400).json({
        error: 'Content Error',
        message: error.message,
        requestId,
      });
    }
    
    if (error instanceof ProcessingError) {
      return res.status(500).json({
        error: 'Processing Error',
        message: error.message,
        requestId,
      });
    }
    
    // Generic error
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing your request',
      requestId,
    });
  }
});

/**
 * GET /api/summarize/health
 * Health check endpoint
 */
router.get('/summarize/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'summarization-api',
  });
});

/**
 * Generate a unique request ID for logging
 * @returns Unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default router;
