/**
 * Lightweight logger that silences output during tests.
 * Respects NODE_ENV==='test' or SUPPRESS_LOGS env var.
 */
const isTest = process.env.NODE_ENV === 'test' || process.env.SUPPRESS_LOGS === '1';

function noop(..._args: any[]) {
  // intentionally empty
}

export const logger = {
  log: isTest ? noop : console.log.bind(console),
  info: isTest ? noop : console.info.bind(console),
  warn: isTest ? noop : console.warn.bind(console),
  error: isTest ? noop : console.error.bind(console),
};

export default logger;
