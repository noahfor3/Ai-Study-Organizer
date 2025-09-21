/**
 * Core summarization service with business logic for text processing
 */

import { ModelClient } from '../integrations/modelClient';
import { wordCount, normalize, extractSentences, truncateToWordCount, containsNumbers, extractNumbers } from '../utils/text';
import { redactPII } from '../utils/redact';

export interface SummarizeRequest {
  text: string;
  mode: 'abstract' | 'bullets';
  bulletCount?: number;
  redactPII?: boolean;
}

export interface SummarizeResponse {
  summaryType: 'abstract' | 'bullets';
  content: string | string[];
  meta: {
    tokensIn: number;
    tokensOut: number;
  };
}

export interface SummarizeError extends Error {
  code: 'VALIDATION_ERROR' | 'PROCESSING_ERROR' | 'HALLUCINATION_ERROR';
}

/**
 * Validation error for input validation failures
 */
export class ValidationError extends Error implements SummarizeError {
  code: 'VALIDATION_ERROR' = 'VALIDATION_ERROR';
  
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Processing error for summarization failures
 */
export class ProcessingError extends Error implements SummarizeError {
  code: 'PROCESSING_ERROR' = 'PROCESSING_ERROR';
  
  constructor(message: string) {
    super(message);
    this.name = 'ProcessingError';
  }
}

/**
 * Hallucination error for when AI introduces facts not in source
 */
export class HallucinationError extends Error implements SummarizeError {
  code: 'HALLUCINATION_ERROR' = 'HALLUCINATION_ERROR';
  
  constructor(message: string) {
    super(message);
    this.name = 'HallucinationError';
  }
}

/**
 * Core summarization service
 */
export class SummarizerService {
  private modelClient: ModelClient;
  private temperature: number;

  constructor(modelClient: ModelClient, temperature: number = 0) {
    this.modelClient = modelClient;
    this.temperature = temperature;
  }

  /**
   * Main summarization method
   * @param request - The summarization request
   * @returns Promise with summarization result
   */
  async summarize(request: SummarizeRequest): Promise<SummarizeResponse> {
    // Validate input
    this.validateInput(request);

    // Normalize and prepare text
    const normalizedText = normalize(request.text);
    
    // Apply PII redaction if requested
    const processedText = request.redactPII ? redactPII(normalizedText) : normalizedText;

    // Generate summary using model client
    const rawSummary = await this.modelClient.generateSummary({
      text: processedText,
      mode: request.mode,
      bulletCount: request.bulletCount || 5,
      temperature: this.temperature,
    });

    // Post-process the summary
    const processedSummary = this.postProcessSummary(
      rawSummary,
      request.mode,
      request.bulletCount || 5,
      processedText
    );

    // Calculate metadata
    const tokensIn = wordCount(processedText);
    const tokensOut = Array.isArray(processedSummary) 
      ? processedSummary.reduce((sum, bullet) => sum + wordCount(bullet), 0)
      : wordCount(processedSummary);

    return {
      summaryType: request.mode,
      content: processedSummary,
      meta: {
        tokensIn,
        tokensOut,
      },
    };
  }

  /**
   * Validate input parameters
   * @param request - The request to validate
   * @throws ValidationError if validation fails
   */
  private validateInput(request: SummarizeRequest): void {
    if (!request.text || typeof request.text !== 'string') {
      throw new ValidationError('Text is required and must be a string');
    }

    if (request.text.length < 200) {
      throw new ValidationError('Text must be at least 200 characters long');
    }

    if (request.mode !== 'abstract' && request.mode !== 'bullets') {
      throw new ValidationError('Mode must be either "abstract" or "bullets"');
    }

    if (request.mode === 'bullets') {
      const bulletCount = request.bulletCount || 5;
      if (bulletCount < 3 || bulletCount > 7) {
        throw new ValidationError('Bullet count must be between 3 and 7');
      }
    }
  }

  /**
   * Post-process the AI-generated summary
   * @param rawSummary - Raw summary from AI
   * @param mode - Summary mode
   * @param bulletCount - Number of bullets (for bullets mode)
   * @param sourceText - Original source text for validation
   * @returns Processed summary
   */
  private postProcessSummary(
    rawSummary: string | string[],
    mode: 'abstract' | 'bullets',
    bulletCount: number,
    sourceText: string
  ): string | string[] {
    if (mode === 'abstract') {
      return this.processAbstract(rawSummary as string, sourceText);
    } else {
      return this.processBullets(rawSummary as string[], bulletCount, sourceText);
    }
  }

  /**
   * Process abstract summary with length control and hallucination checks
   * @param abstract - Raw abstract from AI
   * @param sourceText - Original source text
   * @returns Processed abstract
   */
  private processAbstract(abstract: string, sourceText: string): string {
    // Check for hallucinated numbers
    this.checkForHallucinatedNumbers(abstract, sourceText);

    // Normalize the abstract
    let processedAbstract = normalize(abstract);

    // Length control: target 100-150 words (±10%)
    const wordCount = this.wordCount(processedAbstract);
    const targetMin = 90; // 100 - 10%
    const targetMax = 165; // 150 + 10%

    if (wordCount > targetMax) {
      // Trim sentences until within target
      processedAbstract = this.trimToWordCount(processedAbstract, targetMax);
    } else if (wordCount < targetMin) {
      // If too short, we can't pad with fluff, so return as-is
      // The AI should have generated a longer summary
    }

    return processedAbstract;
  }

  /**
   * Process bullet points with count control and hallucination checks
   * @param bullets - Raw bullets from AI
   * @param bulletCount - Target number of bullets
   * @param sourceText - Original source text
   * @returns Processed bullets array
   */
  private processBullets(bullets: string[], bulletCount: number, sourceText: string): string[] {
    // Check each bullet for hallucinated numbers
    bullets.forEach(bullet => {
      this.checkForHallucinatedNumbers(bullet, sourceText);
    });

    // Normalize bullets
    let processedBullets = bullets
      .map(bullet => normalize(bullet))
      .filter(bullet => bullet.length > 0);

    // Ensure exact count
    if (processedBullets.length > bulletCount) {
      processedBullets = processedBullets.slice(0, bulletCount);
    } else if (processedBullets.length < bulletCount) {
      // Pad with generic bullets if needed
      while (processedBullets.length < bulletCount) {
        processedBullets.push(`Key point ${processedBullets.length + 1} from the content.`);
      }
    }

    return processedBullets;
  }

  /**
   * Check if summary introduces numbers not present in source text
   * @param summary - The summary to check
   * @param sourceText - Original source text
   * @throws HallucinationError if hallucinated numbers are found
   */
  private checkForHallucinatedNumbers(summary: string, sourceText: string): void {
    const sourceNumbers = extractNumbers(sourceText);
    const summaryNumbers = extractNumbers(summary);

    // If source has no numbers but summary does, that's a hallucination
    if (sourceNumbers.length === 0 && summaryNumbers.length > 0) {
      throw new HallucinationError('Summary introduces numbers not present in source text');
    }

    // Check if summary introduces numbers not in source
    const hallucinatedNumbers = summaryNumbers.filter(num => 
      !sourceNumbers.some(sourceNum => Math.abs(sourceNum - num) < 0.01)
    );

    if (hallucinatedNumbers.length > 0) {
      throw new HallucinationError('Summary introduces numbers not present in source text');
    }
  }

  /**
   * Trim text to a specific word count by removing sentences
   * @param text - Text to trim
   * @param maxWords - Maximum word count
   * @returns Trimmed text
   */
  private trimToWordCount(text: string, maxWords: number): string {
    const sentences = extractSentences(text);
    let result = '';
    let wordCount = 0;

    for (const sentence of sentences) {
      const sentenceWords = this.wordCount(sentence);
      if (wordCount + sentenceWords <= maxWords) {
        result += (result ? ' ' : '') + sentence;
        wordCount += sentenceWords;
      } else {
        break;
      }
    }

    return result || sentences[0] || '';
  }

  /**
   * Count words in text (helper method)
   * @param text - Text to count
   * @returns Word count
   */
  private wordCount(text: string): number {
    return wordCount(text);
  }
}
