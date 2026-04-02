const http = require('http');

process.env.NODE_ENV = 'test';
process.env.PORT = '4003';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/todolist';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-32chars-long!!';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-32chars-long!';
process.env.JWT_ACCESS_EXPIRES_IN = '30m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.BCRYPT_COST_FACTOR = '4';
process.env.LOG_LEVEL = 'error';

jest.mock('../src/middlewares/rateLimiter', () => ({
  authLimiter: (req, res, next) => next(),
  apiLimiter: (req, res, next) => next(),
  rateLimiter: () => (req, res, next) => next(),
}));

const app = require('../src/app');
const { pool } = require('../src/config/db');

let server;
let accessToken;
const TEST_EMAIL = `profile_${Date.now()}@test.com`;
const TEST_PW = 'Test1234!';

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost', port: 4003, path, method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    const r = http.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

beforeAll(async () => {
  server = await new Promise((resolve) => {
    const s = app.listen(4003, () => resolve(s));
  });
  // 회원가입 + 로그인
  await req('POST', '/api/auth/register', { email: TEST_EMAIL, password: TEST_PW });
  const loginRes = await req('POST', '/api/auth/login', { email: TEST_EMAIL, password: TEST_PW });
  accessToken = loginRes.body.access_token;
});

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE email LIKE $1', [`profile_%@test.com`]);
  await pool.query('DELETE FROM users WHERE email LIKE $1', [`changed_%@test.com`]);
  server.close();
  await pool.end();
});

describe('GET /api/auth/profile', () => {
  test('인증된 사용자 → 200, 프로필 반환', async () => {
    const res = await req('GET', '/api/auth/profile', null, accessToken);
    expect(res.status).toBe(200);
    expect(res.body.id).toBeDefined();
    expect(res.body.email).toBe(TEST_EMAIL);
    expect(res.body.created_at).toBeDefined();
    expect(res.body.password).toBeUndefined();
  });

  test('미인증 → 401', async () => {
    const res = await req('GET', '/api/auth/profile');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/auth/profile — 이메일 변경', () => {
  const NEW_EMAIL = `changed_${Date.now()}@test.com`;

  test('이메일 변경 → 200', async () => {
    const res = await req('PUT', '/api/auth/profile', { email: NEW_EMAIL }, accessToken);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(NEW_EMAIL);
  });

  test('변경된 이메일 확인 → GET profile', async () => {
    const res = await req('GET', '/api/auth/profile', null, accessToken);
    expect(res.body.email).toBe(NEW_EMAIL);
  });

  test('이메일 원복', async () => {
    const res = await req('PUT', '/api/auth/profile', { email: TEST_EMAIL }, accessToken);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(TEST_EMAIL);
  });

  test('중복 이메일 → 409', async () => {
    // 다른 사용자 생성
    const otherEmail = `profile_other_${Date.now()}@test.com`;
    await req('POST', '/api/auth/register', { email: otherEmail, password: TEST_PW });
    const res = await req('PUT', '/api/auth/profile', { email: otherEmail }, accessToken);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });
});

describe('PUT /api/auth/profile — 비밀번호 변경', () => {
  test('비밀번호 변경 → 200', async () => {
    const res = await req('PUT', '/api/auth/profile', {
      current_password: TEST_PW,
      new_password: 'NewPass1234!',
    }, accessToken);
    expect(res.status).toBe(200);
  });

  test('변경된 비밀번호로 로그인 → 200', async () => {
    const res = await req('POST', '/api/auth/login', { email: TEST_EMAIL, password: 'NewPass1234!' });
    expect(res.status).toBe(200);
    expect(res.body.access_token).toBeDefined();
    accessToken = res.body.access_token; // 토큰 갱신
  });

  test('이전 비밀번호로 로그인 → 401', async () => {
    const res = await req('POST', '/api/auth/login', { email: TEST_EMAIL, password: TEST_PW });
    expect(res.status).toBe(401);
  });

  test('current_password 누락 → 400', async () => {
    const res = await req('PUT', '/api/auth/profile', {
      new_password: 'Another1234!',
    }, accessToken);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('current_password 틀림 → 401', async () => {
    const res = await req('PUT', '/api/auth/profile', {
      current_password: 'WrongPass1!',
      new_password: 'Another1234!',
    }, accessToken);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});
