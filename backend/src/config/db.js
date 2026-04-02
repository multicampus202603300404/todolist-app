const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('[ERROR] DATABASE_URL 환경변수가 설정되지 않았습니다. 프로세스를 종료합니다.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error(`[${new Date().toISOString()}] [ERROR] PostgreSQL 풀 예기치 않은 에러:`, err.message);
});

async function verifyConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT current_database(), current_user');
    console.info(
      `[${new Date().toISOString()}] [INFO] PostgreSQL 연결 성공 — DB: ${result.rows[0].current_database}, User: ${result.rows[0].current_user}`
    );
    client.release();
  } catch (err) {
    console.error(`[${new Date().toISOString()}] [ERROR] PostgreSQL 연결 실패:`, err.message);
    process.exit(1);
  }
}

function logPoolMetrics() {
  const { totalCount, idleCount, waitingCount } = pool;
  console.info(
    `[${new Date().toISOString()}] [INFO] Pool 메트릭 — total: ${totalCount}, idle: ${idleCount}, waiting: ${waitingCount}`
  );
  if (waitingCount > 0) {
    console.warn(
      `[${new Date().toISOString()}] [WARN] 연결 풀 대기 중인 요청 ${waitingCount}건 — 풀 고갈 주의`
    );
  }
}

async function query(text, params) {
  return pool.query(text, params);
}

async function gracefulShutdown() {
  console.info(`[${new Date().toISOString()}] [INFO] PostgreSQL 연결 풀 종료 중...`);
  await pool.end();
  console.info(`[${new Date().toISOString()}] [INFO] PostgreSQL 연결 풀 종료 완료`);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = { pool, query, verifyConnection, logPoolMetrics, gracefulShutdown };
