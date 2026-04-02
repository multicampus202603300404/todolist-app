const app = require('./app');
const env = require('./config/env');
const { verifyConnection } = require('./config/db');

async function start() {
  await verifyConnection();

  app.listen(env.PORT, () => {
    console.info(
      `[${new Date().toISOString()}] [INFO] 서버 시작 — port: ${env.PORT}, env: ${env.NODE_ENV}`
    );
  });
}

start();
