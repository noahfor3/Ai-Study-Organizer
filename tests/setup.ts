// Jest setup file
// This file runs before all tests

// Set test environment variables
Object.assign(process.env, {
  NODE_ENV: 'test',
  MODEL_API_KEY: 'test-key',
  MODEL_TEMPERATURE: '0',
  GEMINI_API_KEY: 'test-gemini-key'
});

// Global test timeout
jest.setTimeout(15000);
