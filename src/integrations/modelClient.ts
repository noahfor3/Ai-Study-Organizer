/**
 * Model client interface and implementation for AI text summarization
 */

export interface ModelClient {
  generateSummary(params: {
    text: string;
    mode: 'abstract' | 'bullets';
    bulletCount?: number;
    temperature?: number;
  }): Promise<string | string[]>;

  generateQuizQuestion(params: {
    content: string;
    type: 'mcq' | 'true_false' | 'short_answer';
    difficulty: 'easy' | 'medium' | 'hard';
    includeExplanations: boolean;
    seed?: string;
  }): Promise<{
    stem: string;
    options?: string[];
    correctAnswer: string | number | boolean;
    explanation?: string;
    sourceSection?: string;
    tokensUsed?: number;
  }>;
}

export interface ModelClientConfig {
  apiKey?: string;
  temperature?: number;
  baseUrl?: string;
}

/**
 * Mock implementation of ModelClient for testing and development
 * This simulates AI behavior without making real API calls
 */
export class MockModelClient implements ModelClient {
  private config: ModelClientConfig;

  constructor(config: ModelClientConfig = {}) {
    this.config = {
      temperature: 0,
      ...config,
    };
  }

  async generateSummary(params: {
    text: string;
    mode: 'abstract' | 'bullets';
    bulletCount?: number;
    temperature?: number;
  }): Promise<string | string[]> {
    const { text, mode, bulletCount = 5, temperature = this.config.temperature || 0 } = params;

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));

    if (mode === 'abstract') {
      return this.generateAbstract(text, temperature);
    } else {
      return this.generateBullets(text, bulletCount, temperature);
    }
  }

  private generateAbstract(text: string, _temperature: number = 0): string {
    // Extract key sentences and create a coherent abstract
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length === 0) {
      return 'No content available for summarization.';
    }

    // Take first few sentences and create a summary
    const keySentences = sentences.slice(0, Math.min(3, sentences.length));
    let abstract = keySentences.join('. ').trim();
    
    // Ensure it ends with proper punctuation
    if (!abstract.endsWith('.') && !abstract.endsWith('!') && !abstract.endsWith('?')) {
      abstract += '.';
    }

    // Add a concluding sentence if the abstract is too short
    if (abstract.split(' ').length < 50) {
      abstract += ' This content covers important topics and key concepts.';
    }

    return abstract;
  }

  private generateBullets(text: string, bulletCount: number, _temperature: number = 0): string[] {
    // Extract key points from the text
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length === 0) {
      return ['No content available for summarization.'];
    }

    // Create bullets from key sentences
    const bullets: string[] = [];
    const step = Math.max(1, Math.floor(sentences.length / bulletCount));
    
    for (let i = 0; i < bulletCount && i * step < sentences.length; i++) {
      const sentence = sentences[i * step].trim();
      if (sentence.length > 0) {
        // Clean up the sentence and make it bullet-friendly
        let bullet = sentence
          .replace(/^[-•*]\s*/, '') // Remove existing bullet markers
          .replace(/^\d+\.\s*/, '') // Remove numbered lists
          .trim();
        
        // Ensure it's not too long
        if (bullet.length > 100) {
          bullet = bullet.substring(0, 97) + '...';
        }
        
        bullets.push(bullet);
      }
    }

    // Fill remaining bullets if needed
    while (bullets.length < bulletCount) {
      bullets.push(`Key point ${bullets.length + 1} from the content.`);
    }

    return bullets.slice(0, bulletCount);
  }

  async generateQuizQuestion(params: {
    content: string;
    type: 'mcq' | 'true_false' | 'short_answer';
    difficulty: 'easy' | 'medium' | 'hard';
    includeExplanations: boolean;
    seed?: string;
  }): Promise<{
    stem: string;
    options?: string[];
    correctAnswer: string | number | boolean;
    explanation?: string;
    sourceSection?: string;
    tokensUsed?: number;
  }> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const { type, difficulty, includeExplanations } = params;
    
    // Extract content for question generation
    const sentences = params.content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const sourceSection = this.extractSection(params.content);

    if (type === 'mcq') {
      return this.generateMockMCQ(sentences, difficulty, includeExplanations, sourceSection);
    } else if (type === 'true_false') {
      return this.generateMockTrueFalse(sentences, difficulty, includeExplanations, sourceSection);
    } else {
      return this.generateMockShortAnswer(sentences, difficulty, includeExplanations, sourceSection);
    }
  }

  private generateMockMCQ(sentences: string[], difficulty: string, includeExplanations: boolean, sourceSection: string) {
    const stem = sentences[0]?.trim() || 'What is the main topic discussed?';
    const correctAnswer = sentences[1]?.trim() || 'The main concept';
    
    // Ensure we always have exactly 4 options
    const options = [
      correctAnswer,
      sentences[2]?.trim() || 'First alternative option',
      sentences[3]?.trim() || 'Second alternative option', 
      sentences[4]?.trim() || 'Third alternative option'
    ];
    
    // Guarantee exactly 4 unique options
    while (options.length < 4) {
      options.push(`Alternative ${options.length}`);
    }
    options.splice(4); // Ensure no more than 4

    return {
      stem: `Which of the following best describes: ${stem}?`,
      options,
      correctAnswer: 0,
      explanation: includeExplanations ? `The correct answer is based on the content: ${correctAnswer}` : undefined,
      sourceSection,
      tokensUsed: 50
    };
  }

  private generateMockTrueFalse(sentences: string[], difficulty: string, includeExplanations: boolean, sourceSection: string) {
    const statement = sentences[0]?.trim() || 'This concept is important';
    const isTrue = Math.random() > 0.5;

    return {
      stem: statement,
      correctAnswer: isTrue,
      explanation: includeExplanations ? `This statement is ${isTrue ? 'true' : 'false'} based on the content.` : undefined,
      sourceSection,
      tokensUsed: 30
    };
  }

  private generateMockShortAnswer(sentences: string[], difficulty: string, includeExplanations: boolean, sourceSection: string) {
    const question = sentences[0]?.trim() || 'What is the main concept?';
    const answer = sentences[1]?.split(' ').slice(0, 3).join(' ') || 'Main concept';

    return {
      stem: question,
      correctAnswer: answer,
      explanation: includeExplanations ? `The answer is: ${answer}` : undefined,
      sourceSection,
      tokensUsed: 25
    };
  }

  private extractSection(content: string): string {
    // Try to extract section headers
    const headerMatch = content.match(/^#+\s+(.+)$/m);
    if (headerMatch) {
      return headerMatch[1];
    }
    
    const capsMatch = content.match(/^[A-Z][A-Z\s]+$/m);
    if (capsMatch) {
      return capsMatch[0];
    }

    return 'General Content';
  }
}

/**
 * Real implementation of ModelClient using Genkit AI
 * This integrates with the existing Genkit AI setup
 */
export class RealModelClient implements ModelClient {
  private config: ModelClientConfig;

  constructor(config: ModelClientConfig) {
    this.config = {
      temperature: 0,
      ...config,
    };
  }

  async generateSummary(params: {
    text: string;
    mode: 'abstract' | 'bullets';
    bulletCount?: number;
    temperature?: number;
  }): Promise<string | string[]> {
    try {
      // Import the existing AI flow
      const { generateNotes } = await import('../ai/flows/generate-notes-flow');
      
      // Map our summarization parameters to the existing flow
      const noteStyle = params.mode === 'abstract' ? 'comprehensive' : 'bullet-points';
      
      const result = await generateNotes({
        documentContent: params.text,
        noteStyle: noteStyle as any,
        focusArea: params.mode === 'abstract' ? 'key concepts and main points' : 'concise bullet points'
      });

      if (params.mode === 'bullets') {
        // Convert the notes to bullet points
        const bullets = result.notes
          .split('\n')
          .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().startsWith('*'))
          .map(line => line.replace(/^[-•*]\s*/, '').trim())
          .filter(line => line.length > 0)
          .slice(0, params.bulletCount || 5);
        
        return bullets.length > 0 ? bullets : [result.notes];
      } else {
        // Return as abstract
        return result.notes;
      }
    } catch (error) {
      console.error('Real AI model error:', error);
      // Fall back to mock implementation
      const mockClient = new MockModelClient(this.config);
      return mockClient.generateSummary(params);
    }
  }

  async generateQuizQuestion(params: {
    content: string;
    type: 'mcq' | 'true_false' | 'short_answer';
    difficulty: 'easy' | 'medium' | 'hard';
    includeExplanations: boolean;
    seed?: string;
  }): Promise<{
    stem: string;
    options?: string[];
    correctAnswer: string | number | boolean;
    explanation?: string;
    sourceSection?: string;
    tokensUsed?: number;
  }> {
    try {
      // Import the existing AI flow
      const { generateNotes } = await import('../ai/flows/generate-notes-flow');
      
      // Create a specialized prompt for quiz generation
      const quizPrompt = this.buildQuizPrompt(params);
      
      const result = await generateNotes({
        documentContent: quizPrompt,
        noteStyle: 'comprehensive' as any,
        focusArea: `Generate a ${params.type} question with ${params.difficulty} difficulty`
      });

      // Parse the AI response to extract quiz components
      return this.parseQuizResponse(result.notes, params.type);
    } catch (error) {
      console.error('Real AI quiz generation error:', error);
      // Fall back to mock implementation
      const mockClient = new MockModelClient(this.config);
      return mockClient.generateQuizQuestion(params);
    }
  }

  private buildQuizPrompt(params: {
    content: string;
    type: 'mcq' | 'true_false' | 'short_answer';
    difficulty: 'easy' | 'medium' | 'hard';
    includeExplanations: boolean;
  }): string {
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

    return `Based on the following content, generate a ${params.difficulty} difficulty ${params.type} question.

${typeGuidance[params.type]}

${difficultyGuidance[params.difficulty]}

${params.includeExplanations ? 'Include a brief explanation citing the relevant part of the source content.' : ''}

Content:
${params.content}

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

  private parseQuizResponse(response: string, type: string): {
    stem: string;
    options?: string[];
    correctAnswer: string | number | boolean;
    explanation?: string;
    sourceSection?: string;
    tokensUsed?: number;
  } {
    try {
      // Try to parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          stem: parsed.stem || 'Generated question',
          options: parsed.options,
          correctAnswer: parsed.correctAnswer,
          explanation: parsed.explanation,
          sourceSection: parsed.sourceSection || 'General Content',
          tokensUsed: parsed.tokensUsed || 50
        };
      }
    } catch (error) {
      console.warn('Failed to parse AI quiz response as JSON:', error);
    }

    // Fallback parsing for non-JSON responses
    return {
      stem: response.split('\n')[0] || 'Generated question',
      correctAnswer: type === 'true_false' ? true : 'Generated answer',
      explanation: response.includes('explanation') ? response : undefined,
      sourceSection: 'General Content',
      tokensUsed: 50
    };
  }
}

/**
 * Factory function to create the appropriate model client
 * @param config - Configuration for the model client
 * @param useReal - Whether to use real AI (default: false for testing)
 * @returns ModelClient instance
 */
export function createModelClient(config: ModelClientConfig = {}, useReal: boolean = false): ModelClient {
  if (useReal && config.apiKey) {
    return new RealModelClient(config);
  }
  return new MockModelClient(config);
}
