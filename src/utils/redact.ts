/**
 * PII (Personally Identifiable Information) redaction utilities
 */

/**
 * Redact email addresses in text
 * @param text - The text to redact emails from
 * @returns Text with emails replaced by [REDACTED_EMAIL]
 */
export function redactEmails(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Email regex pattern: word characters, dots, plus, minus, @, domain
  const emailPattern = /(\w[\w.+-]*@\w[\w.-]+\.\w+)/g;
  
  return text.replace(emailPattern, '[REDACTED_EMAIL]');
}

/**
 * Redact phone numbers in text
 * @param text - The text to redact phone numbers from
 * @returns Text with phone numbers replaced by [REDACTED_PHONE]
 */
export function redactPhones(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Phone regex pattern: matches complete phone numbers including parentheses, spaces, dashes, dots
  const phonePattern = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d[\d\s.-]{7,}\d)/g;
  
  return text.replace(phonePattern, '[REDACTED_PHONE]');
}

/**
 * Redact all PII (emails and phone numbers) in text
 * @param text - The text to redact PII from
 * @returns Text with PII replaced by redaction placeholders
 */
export function redactPII(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  let redacted = text;
  
  // First redact emails
  redacted = redactEmails(redacted);
  
  // Then redact phone numbers
  redacted = redactPhones(redacted);
  
  return redacted;
}

/**
 * Check if text contains any PII
 * @param text - The text to check
 * @returns True if text contains PII
 */
export function containsPII(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }
  
  const emailPattern = /(\w[\w.+-]*@\w[\w.-]+\.\w+)/g;
  const phonePattern = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d[\d\s.-]{7,}\d)/g;
  
  return emailPattern.test(text) || phonePattern.test(text);
}

/**
 * Get count of redacted items in text
 * @param text - The text to analyze
 * @returns Object with counts of emails and phones found
 */
export function getPIIStats(text: string): { emails: number; phones: number } {
  if (!text || typeof text !== 'string') {
    return { emails: 0, phones: 0 };
  }
  
  const emailPattern = /(\w[\w.+-]*@\w[\w.-]+\.\w+)/g;
  const phonePattern = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d[\d\s.-]{7,}\d)/g;
  
  const emailMatches = text.match(emailPattern);
  const phoneMatches = text.match(phonePattern);
  
  return {
    emails: emailMatches ? emailMatches.length : 0,
    phones: phoneMatches ? phoneMatches.length : 0,
  };
}
