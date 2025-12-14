const http = require('http');
const app = require('./app');
const { connectMongo } = require('./config/mongo');
const { initSockets } = require('./sockets');
const { logger } = require('./utils/logger');
const { scheduleExpirationJob } = require('./jobs/expireReservations.job');

const PORT = process.env.PORT || 4000;

async function start() {
  await connectMongo();
  const server = http.createServer(app);
  initSockets(server);
  server.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
  });
  scheduleExpirationJob();
}

start().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
