const jwt = require('jsonwebtoken');

// env 모듈 mock — dotenv 로드 전에 환경변수 설정
process.env.NODE_ENV = 'test';
process.env.PORT = '4000';
process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-32chars-long!!';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-32chars-long!';
process.env.JWT_ACCESS_EXPIRES_IN = '30m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.LOG_LEVEL = 'error';

const AppError = require('../src/utils/AppError');
const errorHandler = require('../src/middlewares/errorHandler');
const authenticate = require('../src/middlewares/authenticate');
const validate = require('../src/middlewares/validate');

// 헬퍼: mock req/res/next
function mockReq(overrides = {}) {
  return { method: 'GET', originalUrl: '/test', headers: {}, body: {}, params: {}, query: {}, ...overrides };
}

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// ========================
// errorHandler 테스트
// ========================
describe('errorHandler', () => {
  test('AppError → 해당 statusCode/code/message 반환', () => {
    const err = new AppError(409, 'EMAIL_ALREADY_EXISTS', '이미 사용 중인 이메일입니다');
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'EMAIL_ALREADY_EXISTS', message: '이미 사용 중인 이메일입니다' },
    });
  });

  test('일반 Error → 500/INTERNAL_ERROR', () => {
    const err = new Error('unexpected');
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'INTERNAL_ERROR', message: '서버 내부 오류가 발생했습니다.' },
    });
  });
});

// ========================
// authenticate 테스트
// ========================
describe('authenticate', () => {
  const SECRET = process.env.JWT_ACCESS_SECRET;

  test('유효한 토큰 → req.user 설정 후 next()', () => {
    const token = jwt.sign({ sub: 'user-123', email: 'a@b.com' }, SECRET, { algorithm: 'HS256', expiresIn: '30m' });
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } });
    const res = mockRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(req.user).toEqual({ id: 'user-123', email: 'a@b.com' });
    expect(next).toHaveBeenCalledWith();
  });

  test('헤더 누락 → 401 UNAUTHORIZED', () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401, code: 'UNAUTHORIZED' }));
  });

  test('만료된 토큰 → 401 TOKEN_EXPIRED', () => {
    const token = jwt.sign({ sub: 'user-123', email: 'a@b.com' }, SECRET, { algorithm: 'HS256', expiresIn: '-1s' });
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } });
    const res = mockRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401, code: 'TOKEN_EXPIRED' }));
  });

  test('잘못된 토큰 → 401 INVALID_TOKEN', () => {
    const req = mockReq({ headers: { authorization: 'Bearer invalidtoken' } });
    const res = mockRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401, code: 'INVALID_TOKEN' }));
  });
});

// ========================
// validate 테스트
// ========================
describe('validate', () => {
  test('필수 필드 누락 → 400 VALIDATION_ERROR', () => {
    const middleware = validate({ body: { email: { required: true, type: 'string' } } });
    const req = mockReq({ body: {} });
    const res = mockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400, code: 'VALIDATION_ERROR' }));
  });

  test('minLength 미달 → 400', () => {
    const middleware = validate({ body: { password: { required: true, type: 'string', minLength: 8 } } });
    const req = mockReq({ body: { password: 'short' } });
    const res = mockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('pattern 불일치 → 400', () => {
    const middleware = validate({ body: { email: { required: true, pattern: /^[^@]+@[^@]+$/ } } });
    const req = mockReq({ body: { email: 'invalid' } });
    const res = mockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('enum 불일치 → 400', () => {
    const middleware = validate({ query: { status: { enum: ['UPCOMING', 'IN_PROGRESS'] } } });
    const req = mockReq({ query: { status: 'INVALID' } });
    const res = mockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  test('유효한 입력 → next() 호출', () => {
    const middleware = validate({ body: { email: { required: true, type: 'string' } } });
    const req = mockReq({ body: { email: 'test@example.com' } });
    const res = mockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  test('선택 필드 미전달 → 통과', () => {
    const middleware = validate({ body: { desc: { type: 'string', maxLength: 100 } } });
    const req = mockReq({ body: {} });
    const res = mockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
