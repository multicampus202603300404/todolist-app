const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const REQUIRED_VARS = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
  'CORS_ORIGIN',
];

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    '[ERROR] 필수 환경변수가 설정되지 않았습니다:',
    missing.join(', ')
  );
  process.exit(1);
}

const env = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: Number(process.env.PORT),
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  BCRYPT_COST_FACTOR: Number(process.env.BCRYPT_COST_FACTOR) || 12,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

module.exports = env;
