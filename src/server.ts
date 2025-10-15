/**
 * Server startup file for the Express application
 */

import { createApp } from './app';
import logger from './lib/logger';

// Allow PORT=0 (ephemeral) by checking presence of env var first
const PORT = process.env.PORT !== undefined ? Number(process.env.PORT) : 3001;
const HOST = process.env.HOST || 'localhost';

/**
 * Start the server
 */
function startServer(): any {
  const app = createApp();

  const server = app.listen(PORT, HOST, () => {
    logger.info(`🚀 AI Study Organizer API server running on http://${HOST}:${PORT}`);
    logger.info(`📊 Health check available at http://${HOST}:${PORT}/health`);
    logger.info(`📝 Summarization API available at http://${HOST}:${PORT}/api/summarize`);
    logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });

  return server
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

export { startServer };
