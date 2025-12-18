const http = require('http');
const app = require('./app');
const { initSockets } = require('./sockets');
const { logger } = require('./utils/logger');
const { scheduleExpirationJob } = require('./jobs/expireReservations.job');
const { ensureDbDir } = require('./db');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await ensureDbDir();
    logger.info('Database directory initialized');
    const server = http.createServer(app);
    
    // Manejar errores del servidor
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use. Please kill the process using this port or use a different port.`);
        logger.error('On Windows, you can find and kill the process with: netstat -ano | findstr :4000 and then taskkill /PID <PID> /F');
        process.exit(1);
      } else {
        logger.error('Server error:', err);
        throw err;
      }
    });
    
    initSockets(server);
    server.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`);
    });
    scheduleExpirationJob();
  } catch (err) {
    logger.error('Failed to start server:', err);
    throw err;
  }
}

start().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
