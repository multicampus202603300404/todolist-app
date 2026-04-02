const http = require('http');

// 환경변수 설정
process.env.NODE_ENV = 'test';
process.env.PORT = '4001';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/todolist';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-32chars-long!!';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-32chars-long!';
process.env.JWT_ACCESS_EXPIRES_IN = '30m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.BCRYPT_COST_FACTOR = '4';
process.env.LOG_LEVEL = 'error';

// 테스트에서 rate limiter 비활성화
jest.mock('../src/middlewares/rateLimiter', () => ({
  authLimiter: (req, res, next) => next(),
  apiLimiter: (req, res, next) => next(),
  rateLimiter: () => (req, res, next) => next(),
}));

const app = require('../src/app');
const { pool } = require('../src/config/db');

let server;
let accessToken;
let testUserId;
let todoId;

const TEST_EMAIL = `inttest_${Date.now()}@test.com`;
const TEST_PW = 'Test1234!';

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost', port: 4001, path, method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;

    const r = http.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, body: parsed, headers: res.headers });
      });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

beforeAll((done) => {
  server = app.listen(4001, done);
});

afterAll(async () => {
  // 테스트 사용자 및 데이터 정리
  if (testUserId) {
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
  }
  server.close();
  await pool.end();
});

// ========================
// 인증 API 테스트 (BE-05)
// ========================
describe('Auth API', () => {
  test('POST /api/auth/register → 201', async () => {
    const res = await req('POST', '/api/auth/register', { email: TEST_EMAIL, password: TEST_PW });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.email).toBe(TEST_EMAIL);
    expect(res.body.created_at).toBeDefined();
    expect(res.body.password).toBeUndefined();
    testUserId = res.body.id;
  });

  test('POST /api/auth/register 이메일 중복 → 409', async () => {
    const res = await req('POST', '/api/auth/register', { email: TEST_EMAIL, password: TEST_PW });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  test('POST /api/auth/register 비밀번호 정책 위반 → 400', async () => {
    const res = await req('POST', '/api/auth/register', { email: 'weak@test.com', password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('POST /api/auth/login → 200 + access_token', async () => {
    const res = await req('POST', '/api/auth/login', { email: TEST_EMAIL, password: TEST_PW });
    expect(res.status).toBe(200);
    expect(res.body.access_token).toBeDefined();
    accessToken = res.body.access_token;
  });

  test('POST /api/auth/login 실패 → 401', async () => {
    const res = await req('POST', '/api/auth/login', { email: TEST_EMAIL, password: 'Wrong1234!' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  test('POST /api/auth/login 미존재 이메일 → 401', async () => {
    const res = await req('POST', '/api/auth/login', { email: 'noone@test.com', password: TEST_PW });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

// ========================
// 할일 CRUD 테스트 (BE-06~08)
// ========================
describe('Todo CRUD API', () => {
  test('POST /api/todos → 201 (할일 생성)', async () => {
    const res = await req('POST', '/api/todos', {
      title: '통합 테스트 할일',
      description: '테스트 설명',
      start_date: '2026-04-01',
      end_date: '2026-04-30',
    }, accessToken);
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('통합 테스트 할일');
    expect(res.body.status).toBeDefined();
    expect(res.body.is_completed).toBe(false);
    todoId = res.body.id;
  });

  test('POST /api/todos 미인증 → 401', async () => {
    const res = await req('POST', '/api/todos', { title: 'x', start_date: '2026-04-01', end_date: '2026-04-30' });
    expect(res.status).toBe(401);
  });

  test('POST /api/todos 종료일 < 시작일 → 400 (BR-T-02)', async () => {
    const res = await req('POST', '/api/todos', {
      title: '잘못된 날짜', start_date: '2026-04-30', end_date: '2026-04-01',
    }, accessToken);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_DATE_RANGE');
  });

  test('POST /api/todos 제목 누락 → 400 (BR-T-01)', async () => {
    const res = await req('POST', '/api/todos', {
      start_date: '2026-04-01', end_date: '2026-04-30',
    }, accessToken);
    expect(res.status).toBe(400);
  });

  test('GET /api/todos → 200 (목록 조회)', async () => {
    const res = await req('GET', '/api/todos', null, accessToken);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.totalPages).toBeDefined();
  });

  test('GET /api/todos?sort_by=end_date&order=asc → 정렬', async () => {
    const res = await req('GET', '/api/todos?sort_by=end_date&order=asc', null, accessToken);
    expect(res.status).toBe(200);
  });

  test('GET /api/todos/:id → 200', async () => {
    const res = await req('GET', `/api/todos/${todoId}`, null, accessToken);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(todoId);
    expect(res.body.description).toBe('테스트 설명');
    expect(res.body.status).toBeDefined();
  });

  test('PUT /api/todos/:id → 200 (수정)', async () => {
    const res = await req('PUT', `/api/todos/${todoId}`, {
      title: '수정된 할일', start_date: '2026-04-01', end_date: '2026-05-15',
    }, accessToken);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('수정된 할일');
  });

  test('PATCH /api/todos/:id/complete → 200', async () => {
    const res = await req('PATCH', `/api/todos/${todoId}/complete`, null, accessToken);
    expect(res.status).toBe(200);
    expect(res.body.is_completed).toBe(true);
    expect(res.body.completed_at).toBeDefined();
  });

  test('PATCH /api/todos/:id/complete 중복 → 409', async () => {
    const res = await req('PATCH', `/api/todos/${todoId}/complete`, null, accessToken);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('ALREADY_COMPLETED');
  });

  test('PATCH /api/todos/:id/uncomplete → 200', async () => {
    const res = await req('PATCH', `/api/todos/${todoId}/uncomplete`, null, accessToken);
    expect(res.status).toBe(200);
    expect(res.body.is_completed).toBe(false);
    expect(res.body.completed_at).toBeNull();
  });

  test('PATCH /api/todos/:id/uncomplete 중복 → 409', async () => {
    const res = await req('PATCH', `/api/todos/${todoId}/uncomplete`, null, accessToken);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('NOT_COMPLETED');
  });

  test('GET /api/todos/00000000-0000-0000-0000-000000000000 → 404 (미존재)', async () => {
    const res = await req('GET', '/api/todos/00000000-0000-0000-0000-000000000000', null, accessToken);
    expect(res.status).toBe(404);
  });

  test('DELETE /api/todos/:id → 204', async () => {
    const res = await req('DELETE', `/api/todos/${todoId}`, null, accessToken);
    expect(res.status).toBe(204);
  });

  test('GET /api/todos/:id 삭제 후 → 404', async () => {
    const res = await req('GET', `/api/todos/${todoId}`, null, accessToken);
    expect(res.status).toBe(404);
  });
});

// ========================
// 타인 할일 접근 테스트 (BR-U-03)
// ========================
describe('소유권 검증 (BR-U-03)', () => {
  let otherAccessToken;
  let otherTodoId;
  const OTHER_EMAIL = `other_${Date.now()}@test.com`;

  beforeAll(async () => {
    await req('POST', '/api/auth/register', { email: OTHER_EMAIL, password: TEST_PW });
    const loginRes = await req('POST', '/api/auth/login', { email: OTHER_EMAIL, password: TEST_PW });
    otherAccessToken = loginRes.body.access_token;

    const todoRes = await req('POST', '/api/todos', {
      title: '타인의 할일', start_date: '2026-04-01', end_date: '2026-04-30',
    }, otherAccessToken);
    otherTodoId = todoRes.body.id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [OTHER_EMAIL]);
  });

  test('타인 할일 조회 → 404', async () => {
    const res = await req('GET', `/api/todos/${otherTodoId}`, null, accessToken);
    expect(res.status).toBe(404);
  });

  test('타인 할일 수정 → 404', async () => {
    const res = await req('PUT', `/api/todos/${otherTodoId}`, {
      title: '해킹 시도', start_date: '2026-04-01', end_date: '2026-04-30',
    }, accessToken);
    expect(res.status).toBe(404);
  });

  test('타인 할일 삭제 → 404', async () => {
    const res = await req('DELETE', `/api/todos/${otherTodoId}`, null, accessToken);
    expect(res.status).toBe(404);
  });
});

// ========================
// 통계 API 테스트 (BE-09)
// ========================
describe('Statistics API', () => {
  test('GET /api/todos/statistics → 200', async () => {
    const res = await req('GET', '/api/todos/statistics', null, accessToken);
    expect(res.status).toBe(200);
    expect(res.body.total).toBeDefined();
    expect(res.body.by_status).toBeDefined();
    expect(res.body.by_status.UPCOMING).toBeDefined();
    expect(res.body.by_status.IN_PROGRESS).toBeDefined();
    expect(res.body.by_status.OVERDUE).toBeDefined();
    expect(res.body.by_status.COMPLETED_ON_TIME).toBeDefined();
    expect(res.body.by_status.COMPLETED_LATE).toBeDefined();
    expect(typeof res.body.completion_rate).toBe('number');
    expect(typeof res.body.on_time_rate).toBe('number');
    expect(typeof res.body.overdue_count).toBe('number');
  });

  test('통계 미인증 → 401', async () => {
    const res = await req('GET', '/api/todos/statistics');
    expect(res.status).toBe(401);
  });
});
