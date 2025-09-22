/**
 * Unit tests for PII redaction utilities
 */

import {
  redactEmails,
  redactPhones,
  redactPII,
  containsPII,
  getPIIStats,
} from '../../src/utils/redact';

describe('PII Redaction Utils', () => {
  describe('redactEmails', () => {
    it('should redact email addresses', () => {
      const text = 'Contact me at john.doe@example.com for more info';
      const redacted = redactEmails(text);
      expect(redacted).toBe('Contact me at [REDACTED_EMAIL] for more info');
    });

    it('should redact multiple email addresses', () => {
      const text = 'Email alice@test.com or bob+tag@domain.org for support';
      const redacted = redactEmails(text);
      expect(redacted).toBe('Email [REDACTED_EMAIL] or [REDACTED_EMAIL] for support');
    });

    it('should handle complex email formats', () => {
      const text = 'Emails: user.name+tag@sub.domain.com, test@example.org';
      const redacted = redactEmails(text);
      expect(redacted).toBe('Emails: [REDACTED_EMAIL], [REDACTED_EMAIL]');
    });

    it('should not redact non-email text', () => {
      const text = 'This is not an email address';
      const redacted = redactEmails(text);
      expect(redacted).toBe('This is not an email address');
    });

    it('should handle empty text', () => {
      expect(redactEmails('')).toBe('');
      expect(redactEmails(null as any)).toBe('');
      expect(redactEmails(undefined as any)).toBe('');
    });
  });

  describe('redactPhones', () => {
    it('should redact phone numbers', () => {
      const text = 'Call me at (555) 123-4567 for details';
      const redacted = redactPhones(text);
      expect(redacted).toBe('Call me at [REDACTED_PHONE] for details');
    });

    it('should redact various phone formats', () => {
      const text = 'Numbers: 555-123-4567, (555) 123.4567, +1 555 123 4567';
      const redacted = redactPhones(text);
      expect(redacted).toBe('Numbers: [REDACTED_PHONE], [REDACTED_PHONE], [REDACTED_PHONE]');
    });

    it('should handle international phone numbers', () => {
      const text = 'International: +44 20 7946 0958';
      const redacted = redactPhones(text);
      expect(redacted).toBe('International: [REDACTED_PHONE]');
    });

    it('should not redact short number sequences', () => {
      const text = 'The year is 2023 and the code is 123';
      const redacted = redactPhones(text);
      expect(redacted).toBe('The year is 2023 and the code is 123');
    });

    it('should handle empty text', () => {
      expect(redactPhones('')).toBe('');
      expect(redactPhones(null as any)).toBe('');
      expect(redactPhones(undefined as any)).toBe('');
    });
  });

  describe('redactPII', () => {
    it('should redact both emails and phones', () => {
      const text = 'Contact john@example.com or call (555) 123-4567';
      const redacted = redactPII(text);
      expect(redacted).toBe('Contact [REDACTED_EMAIL] or call [REDACTED_PHONE]');
    });

    it('should handle text with only emails', () => {
      const text = 'Email support@company.com for help';
      const redacted = redactPII(text);
      expect(redacted).toBe('Email [REDACTED_EMAIL] for help');
    });

    it('should handle text with only phones', () => {
      const text = 'Call (555) 123-4567 for support';
      const redacted = redactPII(text);
      expect(redacted).toBe('Call [REDACTED_PHONE] for support');
    });

    it('should handle text without PII', () => {
      const text = 'This is just regular text without any personal information';
      const redacted = redactPII(text);
      expect(redacted).toBe('This is just regular text without any personal information');
    });

    it('should handle empty text', () => {
      expect(redactPII('')).toBe('');
      expect(redactPII(null as any)).toBe('');
      expect(redactPII(undefined as any)).toBe('');
    });
  });

  describe('containsPII', () => {
    it('should detect emails', () => {
      expect(containsPII('Contact me at test@example.com')).toBe(true);
    });

    it('should detect phone numbers', () => {
      expect(containsPII('Call (555) 123-4567')).toBe(true);
    });

    it('should detect both emails and phones', () => {
      expect(containsPII('Email test@example.com or call (555) 123-4567')).toBe(true);
    });

    it('should return false for text without PII', () => {
      expect(containsPII('This is just regular text')).toBe(false);
    });

    it('should handle empty text', () => {
      expect(containsPII('')).toBe(false);
      expect(containsPII(null as any)).toBe(false);
      expect(containsPII(undefined as any)).toBe(false);
    });
  });

  describe('getPIIStats', () => {
    it('should count emails and phones correctly', () => {
      const text = 'Email alice@test.com, bob@example.org, or call (555) 123-4567, (555) 987-6543';
      const stats = getPIIStats(text);
      expect(stats.emails).toBe(2);
      expect(stats.phones).toBe(2);
    });

    it('should handle text with only emails', () => {
      const text = 'Contact alice@test.com or bob@example.org';
      const stats = getPIIStats(text);
      expect(stats.emails).toBe(2);
      expect(stats.phones).toBe(0);
    });

    it('should handle text with only phones', () => {
      const text = 'Call (555) 123-4567 or (555) 987-6543';
      const stats = getPIIStats(text);
      expect(stats.emails).toBe(0);
      expect(stats.phones).toBe(2);
    });

    it('should handle text without PII', () => {
      const text = 'This is just regular text';
      const stats = getPIIStats(text);
      expect(stats.emails).toBe(0);
      expect(stats.phones).toBe(0);
    });

    it('should handle empty text', () => {
      const stats = getPIIStats('');
      expect(stats.emails).toBe(0);
      expect(stats.phones).toBe(0);
      
      const statsNull = getPIIStats(null as any);
      expect(statsNull.emails).toBe(0);
      expect(statsNull.phones).toBe(0);
    });
  });
});
