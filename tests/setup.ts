// Jest setup file
// This file runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.MODEL_API_KEY = 'test-key';
process.env.MODEL_TEMPERATURE = '0';

// Global test timeout
jest.setTimeout(10000);
