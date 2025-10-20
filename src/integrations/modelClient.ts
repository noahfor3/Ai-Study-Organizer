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

  private generateAbstract(text: string, temperature: number = 0): string {
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

  private generateBullets(text: string, bulletCount: number, temperature: number = 0): string[] {
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
          .replace(/^[•\-\*]\s*/, '') // Remove existing bullet markers
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
