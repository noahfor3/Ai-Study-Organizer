// Jest setup file
// This file runs before all tests

// Set test environment variables
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  MODEL_API_KEY: 'test-key',
  MODEL_TEMPERATURE: '0',
};

// Global test timeout
jest.setTimeout(10000);
