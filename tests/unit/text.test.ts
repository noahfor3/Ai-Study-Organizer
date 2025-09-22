/**
 * Unit tests for text utility functions
 */

import {
  wordCount,
  normalize,
  splitIntoBullets,
  extractSentences,
  truncateToWordCount,
  containsNumbers,
  extractNumbers,
} from '../../src/utils/text';

describe('Text Utils', () => {
  describe('wordCount', () => {
    it('should count words correctly', () => {
      expect(wordCount('Hello world')).toBe(2);
      expect(wordCount('This is a test sentence.')).toBe(5);
      expect(wordCount('')).toBe(0);
      expect(wordCount('   ')).toBe(0);
      expect(wordCount('Single')).toBe(1);
    });

    it('should handle multiple spaces and newlines', () => {
      expect(wordCount('Hello    world\n\n\nTest')).toBe(3);
      expect(wordCount('  Multiple   spaces   ')).toBe(2);
    });

    it('should handle null and undefined', () => {
      expect(wordCount(null as any)).toBe(0);
      expect(wordCount(undefined as any)).toBe(0);
    });
  });

  describe('normalize', () => {
    it('should normalize whitespace', () => {
      expect(normalize('Hello    world')).toBe('Hello world');
      expect(normalize('Multiple\n\n\nlines')).toBe('Multiple\n\nlines');
      expect(normalize('  Leading and trailing  ')).toBe('Leading and trailing');
    });

    it('should handle empty strings', () => {
      expect(normalize('')).toBe('');
      expect(normalize('   ')).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(normalize(null as any)).toBe('');
      expect(normalize(undefined as any)).toBe('');
    });
  });

  describe('splitIntoBullets', () => {
    it('should split text with bullet markers', () => {
      const text = '- First point\n- Second point\n- Third point';
      const bullets = splitIntoBullets(text, 3);
      expect(bullets).toHaveLength(3);
      expect(bullets[0]).toContain('First point');
      expect(bullets[1]).toContain('Second point');
      expect(bullets[2]).toContain('Third point');
    });

    it('should split text with numbered lists', () => {
      const text = '1. First item\n2. Second item\n3. Third item';
      const bullets = splitIntoBullets(text, 3);
      expect(bullets).toHaveLength(3);
      expect(bullets[0]).toContain('First item');
    });

    it('should fall back to sentences when no bullet patterns', () => {
      const text = 'This is the first sentence. This is the second sentence. This is the third sentence.';
      const bullets = splitIntoBullets(text, 2);
      expect(bullets).toHaveLength(2);
      expect(bullets[0]).toContain('first sentence');
      expect(bullets[1]).toContain('second sentence');
    });

    it('should respect maxBullets limit', () => {
      const text = '- Point 1\n- Point 2\n- Point 3\n- Point 4\n- Point 5\n- Point 6';
      const bullets = splitIntoBullets(text, 3);
      expect(bullets).toHaveLength(3);
    });

    it('should handle empty text', () => {
      expect(splitIntoBullets('', 5)).toEqual([]);
      expect(splitIntoBullets(null as any, 5)).toEqual([]);
    });
  });

  describe('extractSentences', () => {
    it('should extract sentences correctly', () => {
      const text = 'First sentence. Second sentence! Third sentence?';
      const sentences = extractSentences(text);
      expect(sentences).toHaveLength(3);
      expect(sentences[0]).toBe('First sentence');
      expect(sentences[1]).toBe('Second sentence');
      expect(sentences[2]).toBe('Third sentence');
    });

    it('should handle empty text', () => {
      expect(extractSentences('')).toEqual([]);
      expect(extractSentences(null as any)).toEqual([]);
    });
  });

  describe('truncateToWordCount', () => {
    it('should truncate to specified word count', () => {
      const text = 'This is a very long sentence that should be truncated';
      const truncated = truncateToWordCount(text, 5);
      expect(truncated).toBe('This is a very long...');
    });

    it('should not truncate if under limit', () => {
      const text = 'Short text';
      const truncated = truncateToWordCount(text, 10);
      expect(truncated).toBe('Short text');
    });

    it('should handle empty text', () => {
      expect(truncateToWordCount('', 5)).toBe('');
      expect(truncateToWordCount(null as any, 5)).toBe('');
    });
  });

  describe('containsNumbers', () => {
    it('should detect numbers in text', () => {
      expect(containsNumbers('The year is 2023')).toBe(true);
      expect(containsNumbers('Price: $19.99')).toBe(true);
      expect(containsNumbers('No numbers here')).toBe(false);
      expect(containsNumbers('')).toBe(false);
    });

    it('should handle null and undefined', () => {
      expect(containsNumbers(null as any)).toBe(false);
      expect(containsNumbers(undefined as any)).toBe(false);
    });
  });

  describe('extractNumbers', () => {
    it('should extract numbers from text', () => {
      const numbers = extractNumbers('The price is $19.99 and quantity is 5');
      expect(numbers).toEqual([19.99, 5]);
    });

    it('should handle decimal numbers', () => {
      const numbers = extractNumbers('Values: 3.14, 2.71, 1.41');
      expect(numbers).toEqual([3.14, 2.71, 1.41]);
    });

    it('should return empty array for text without numbers', () => {
      expect(extractNumbers('No numbers here')).toEqual([]);
      expect(extractNumbers('')).toEqual([]);
      expect(extractNumbers(null as any)).toEqual([]);
    });
  });
});
