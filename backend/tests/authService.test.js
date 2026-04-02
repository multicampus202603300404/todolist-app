process.env.NODE_ENV = 'test';
process.env.PORT = '4000';
process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-32chars-long!!';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-32chars-long!';
process.env.JWT_ACCESS_EXPIRES_IN = '30m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.BCRYPT_COST_FACTOR = '4'; // 테스트에서 빠르게
process.env.LOG_LEVEL = 'error';

const jwt = require('jsonwebtoken');

// DB 쿼리 mock
jest.mock('../src/queries/userQueries', () => ({
  createUser: jest.fn(),
  findUserByEmail: jest.fn(),
  findUserById: jest.fn(),
}));

const { createUser, findUserByEmail, findUserById } = require('../src/queries/userQueries');
const authService = require('../src/services/authService');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('authService.register', () => {
  test('정상 회원가입 → user 객체 반환 (password 미포함)', async () => {
    findUserByEmail.mockResolvedValue(null);
    createUser.mockResolvedValue({ id: 'uuid-1', email: 'a@b.com', created_at: '2026-04-01' });

    const result = await authService.register('a@b.com', 'Test1234!');

    expect(result).toEqual({ id: 'uuid-1', email: 'a@b.com', created_at: '2026-04-01' });
    expect(result.password).toBeUndefined();
    expect(createUser).toHaveBeenCalledWith('a@b.com', expect.any(String));
  });

  test('이메일 중복 → 409 EMAIL_ALREADY_EXISTS', async () => {
    findUserByEmail.mockResolvedValue({ id: 'existing', email: 'a@b.com' });

    await expect(authService.register('a@b.com', 'Test1234!'))
      .rejects.toMatchObject({ statusCode: 409, code: 'EMAIL_ALREADY_EXISTS' });
  });
});

describe('authService.login', () => {
  test('정상 로그인 → accessToken + refreshToken 반환', async () => {
    const bcrypt = require('bcrypt');
    const hashed = await bcrypt.hash('Test1234!', 4);
    findUserByEmail.mockResolvedValue({ id: 'uuid-1', email: 'a@b.com', password: hashed });

    const result = await authService.login('a@b.com', 'Test1234!');

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();

    const decoded = jwt.verify(result.accessToken, process.env.JWT_ACCESS_SECRET);
    expect(decoded.sub).toBe('uuid-1');
    expect(decoded.email).toBe('a@b.com');
  });

  test('사용자 미존재 → 401 INVALID_CREDENTIALS (타이밍 공격 방지)', async () => {
    findUserByEmail.mockResolvedValue(null);

    await expect(authService.login('nonexist@b.com', 'Test1234!'))
      .rejects.toMatchObject({ statusCode: 401, code: 'INVALID_CREDENTIALS' });
  });

  test('비밀번호 불일치 → 401 INVALID_CREDENTIALS', async () => {
    const bcrypt = require('bcrypt');
    const hashed = await bcrypt.hash('Correct1!', 4);
    findUserByEmail.mockResolvedValue({ id: 'uuid-1', email: 'a@b.com', password: hashed });

    await expect(authService.login('a@b.com', 'Wrong1234!'))
      .rejects.toMatchObject({ statusCode: 401, code: 'INVALID_CREDENTIALS' });
  });
});

describe('authService.refreshAccessToken', () => {
  test('유효한 refresh token → 새 accessToken 반환', async () => {
    const refreshToken = jwt.sign({ sub: 'uuid-1' }, process.env.JWT_REFRESH_SECRET, { algorithm: 'HS256', expiresIn: '7d' });
    findUserById.mockResolvedValue({ id: 'uuid-1', email: 'a@b.com' });

    const result = await authService.refreshAccessToken(refreshToken);

    expect(result.accessToken).toBeDefined();
    const decoded = jwt.verify(result.accessToken, process.env.JWT_ACCESS_SECRET);
    expect(decoded.sub).toBe('uuid-1');
  });

  test('만료된 refresh token → 401 INVALID_REFRESH_TOKEN', async () => {
    const refreshToken = jwt.sign({ sub: 'uuid-1' }, process.env.JWT_REFRESH_SECRET, { algorithm: 'HS256', expiresIn: '-1s' });

    await expect(authService.refreshAccessToken(refreshToken))
      .rejects.toMatchObject({ statusCode: 401, code: 'INVALID_REFRESH_TOKEN' });
  });

  test('사용자 미존재 → 401 INVALID_REFRESH_TOKEN', async () => {
    const refreshToken = jwt.sign({ sub: 'deleted-user' }, process.env.JWT_REFRESH_SECRET, { algorithm: 'HS256', expiresIn: '7d' });
    findUserById.mockResolvedValue(null);

    await expect(authService.refreshAccessToken(refreshToken))
      .rejects.toMatchObject({ statusCode: 401, code: 'INVALID_REFRESH_TOKEN' });
  });
});
