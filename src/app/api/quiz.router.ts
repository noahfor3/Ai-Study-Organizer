import { Router, Request, Response } from 'express';
import { QuizGeneratorService } from '../../services/quiz-generator.service';
import { createModelClient } from '../../integrations/modelClient';
import { QuizRequest, QuizExportOptions } from '../../types/quiz';
import { exportToJSON, exportToCSV } from '../../utils/quiz-helpers';

const router = Router();

// Initialize the quiz generator service
const modelClient = createModelClient({
  apiKey: process.env.MODEL_API_KEY,
  temperature: parseFloat(process.env.MODEL_TEMPERATURE || '0'),
}, true); // Use real AI model

const quizGeneratorService = new QuizGeneratorService(modelClient);

// Generate quiz endpoint
router.post('/generate', async (req: Request, res: Response) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  try {
    console.log(`[${requestId}] Quiz generation request received`);
    
    const quizRequest: QuizRequest = req.body;
    
    // Validate request
    if (!quizRequest.content || quizRequest.content.length < 200) {
      return res.status(400).json({
        error: 'Content must be at least 200 characters long',
        requestId
      });
    }

    if (!quizRequest.questionCount || quizRequest.questionCount < 1 || quizRequest.questionCount > 50) {
      return res.status(400).json({
        error: 'Question count must be between 1 and 50',
        requestId
      });
    }

    console.log(`[${requestId}] Generating quiz - ${quizRequest.questionCount} questions, difficulty: ${quizRequest.difficulty || 'medium'}`);
    
    // Generate quiz
    const quizResponse = await quizGeneratorService.generateQuiz(quizRequest);
    
    console.log(`[${requestId}] Quiz generation successful - ${quizResponse.questions.length} questions generated`);
    
    res.json({
      ...quizResponse,
      requestId
    });
    
  } catch (error) {
    console.error(`[${requestId}] Quiz generation failed:`, error);
    
    res.status(500).json({
      error: 'Quiz generation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      requestId
    });
  }
});

// Export quiz endpoint
router.post('/export', async (req: Request, res: Response) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  try {
    const { questions, options }: { questions: any[], options: QuizExportOptions } = req.body;
    
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({
        error: 'Questions array is required',
        requestId
      });
    }

    if (!options || !options.format) {
      return res.status(400).json({
        error: 'Export options with format are required',
        requestId
      });
    }

    console.log(`[${requestId}] Exporting quiz - ${questions.length} questions to ${options.format}`);
    
    let exportData: string;
    let contentType: string;
    let filename: string;

    if (options.format === 'json') {
      exportData = exportToJSON(questions, options.includeMetadata);
      contentType = 'application/json';
      filename = `quiz_${Date.now()}.json`;
    } else if (options.format === 'csv') {
      exportData = exportToCSV(questions, options.includeMetadata);
      contentType = 'text/csv';
      filename = `quiz_${Date.now()}.csv`;
    } else {
      return res.status(400).json({
        error: 'Unsupported export format. Use "json" or "csv"',
        requestId
      });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportData);
    
    console.log(`[${requestId}] Quiz export successful - ${options.format} format`);
    
  } catch (error) {
    console.error(`[${requestId}] Quiz export failed:`, error);
    
    res.status(500).json({
      error: 'Quiz export failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      requestId
    });
  }
});

// Validate quiz endpoint
router.post('/validate', async (req: Request, res: Response) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  try {
    const { questions } = req.body;
    
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({
        error: 'Questions array is required',
        requestId
      });
    }

    console.log(`[${requestId}] Validating quiz - ${questions.length} questions`);
    
    // Validate each question
    const validationResults = questions.map((question, index) => {
      const errors = quizGeneratorService.validateQuestion(question);
      return {
        questionIndex: index,
        questionId: question.id,
        errors,
        isValid: errors.length === 0
      };
    });

    const totalErrors = validationResults.reduce((sum, result) => sum + result.errors.length, 0);
    const validQuestions = validationResults.filter(result => result.isValid).length;

    res.json({
      validationResults,
      summary: {
        totalQuestions: questions.length,
        validQuestions,
        invalidQuestions: questions.length - validQuestions,
        totalErrors
      },
      requestId
    });
    
    console.log(`[${requestId}] Quiz validation complete - ${validQuestions}/${questions.length} valid questions`);
    
  } catch (error) {
    console.error(`[${requestId}] Quiz validation failed:`, error);
    
    res.status(500).json({
      error: 'Quiz validation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      requestId
    });
  }
});

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'quiz-generator',
    timestamp: new Date().toISOString()
  });
});

export default router;
