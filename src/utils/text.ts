/**
 * Text utility functions for processing and analyzing text content
 */

/**
 * Count the number of words in a text string
 * @param text - The text to count words in
 * @returns The number of words
 */
export function wordCount(text: string): number {
  if (!text || typeof text !== 'string') {
    return 0;
  }
  
  // Remove extra whitespace and split by whitespace
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

/**
 * Normalize text by removing extra whitespace and standardizing formatting
 * @param text - The text to normalize
 * @returns Normalized text
 */
export function normalize(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space
    .replace(/\n\s*\n\s*\n+/g, '\n\n') // Replace multiple newlines with double newline
    .trim();
}

/**
 * Split text into bullet points
 * @param text - The text to split
 * @param maxBullets - Maximum number of bullets to return
 * @returns Array of bullet point strings
 */
export function splitIntoBullets(text: string, maxBullets: number = 5): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  const normalized = normalize(text);
  let bullets: string[] = [];
  
  // Try to split by bullet markers first
  if (normalized.includes('- ')) {
    bullets = normalized
      .split(/\n?\s*-\s+/)
      .map(bullet => bullet.trim())
      .filter(bullet => bullet.length > 0)
      .slice(0, maxBullets);
  }
  // Try numbered lists
  else if (/^\d+\.\s+/m.test(normalized)) {
    bullets = normalized
      .split(/\n?\s*\d+\.\s+/)
      .map(bullet => bullet.trim())
      .filter(bullet => bullet.length > 0)
      .slice(0, maxBullets);
  }
  // Fall back to sentences
  else {
    const sentences = normalized
      .split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0)
      .slice(0, maxBullets);
    
    bullets = sentences;
  }
  
  return bullets;
}

/**
 * Extract sentences from text
 * @param text - The text to extract sentences from
 * @returns Array of sentences
 */
export function extractSentences(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  const normalized = normalize(text);
  
  return normalized
    .split(/[.!?]+/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0);
}

/**
 * Truncate text to a specific word count
 * @param text - The text to truncate
 * @param maxWords - Maximum number of words
 * @returns Truncated text
 */
export function truncateToWordCount(text: string, maxWords: number): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  const words = text.trim().split(/\s+/);
  
  if (words.length <= maxWords) {
    return text;
  }
  
  return words.slice(0, maxWords).join(' ') + '...';
}

/**
 * Check if text contains numbers
 * @param text - The text to check
 * @returns True if text contains numbers
 */
export function containsNumbers(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }
  
  return /\d/.test(text);
}

/**
 * Extract all numbers from text
 * @param text - The text to extract numbers from
 * @returns Array of numbers found in text
 */
export function extractNumbers(text: string): number[] {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  const matches = text.match(/\d+(?:\.\d+)?/g);
  return matches ? matches.map(Number) : [];
}
