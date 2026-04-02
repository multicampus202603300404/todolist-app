require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const fs = require('fs');
const path = require('path');
const { pool, verifyConnection } = require('../config/db');

const MIGRATIONS_DIR = __dirname;

async function migrate() {
  await verifyConnection();

  // schema_migrations 추적 테이블 자동 생성
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // SQL 파일 목록 오름차순 정렬
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    // 이미 적용된 파일 건너뜀
    const { rows } = await pool.query(
      'SELECT filename FROM schema_migrations WHERE filename = $1',
      [file]
    );
    if (rows.length > 0) {
      console.info(`[SKIP] ${file} — 이미 적용됨`);
      continue;
    }

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    const client = await pool.connect();
    const start = Date.now();

    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)',
        [file]
      );
      await client.query('COMMIT');
      console.info(`[OK]   ${file} — ${Date.now() - start}ms`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`[FAIL] ${file} — ${err.message}`);
      process.exit(1);
    } finally {
      client.release();
    }
  }

  console.info('마이그레이션 완료');
  await pool.end();
}

migrate();
