const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
  console.log(`devops-nodejs-app listening on port ${config.port} (${config.nodeEnv})`);
});

const shutdown = (signal) => {
  console.log(`${signal} received, shutting down gracefully`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));