/**
 * Server startup file for the Express application
 */

import { createApp } from './app';

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || 'localhost';

/**
 * Start the server
 */
function startServer(): void {
  const app = createApp();
  
  const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 AI Study Organizer API server running on http://${HOST}:${PORT}`);
    console.log(`📊 Health check available at http://${HOST}:${PORT}/health`);
    console.log(`📝 Summarization API available at http://${HOST}:${PORT}/api/summarize`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

export { startServer };
