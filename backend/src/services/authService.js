const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { createUser, findUserByEmail, findUserById, findUserByIdWithPassword, updateUserEmail, updateUserPassword } = require('../queries/userQueries');

// 타이밍 공격 방지용 더미 해시 (사용자 미존재 시에도 일정한 연산 시간 보장)
const DUMMY_HASH = '$2b$12$invalidsaltinvalidsaltinvali.invalidhashvalue00000000000';

async function register(email, password) {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new AppError(409, 'EMAIL_ALREADY_EXISTS', '이미 사용 중인 이메일입니다');
  }

  const hashedPassword = await bcrypt.hash(password, env.BCRYPT_COST_FACTOR);
  const user = await createUser(email, hashedPassword);

  return { id: user.id, email: user.email, created_at: user.created_at };
}

async function login(email, password) {
  const user = await findUserByEmail(email);

  // 사용자 미존재 시에도 bcrypt.compare 수행하여 타이밍 공격 방지
  const hashToCompare = user ? user.password : DUMMY_HASH;
  const isMatch = await bcrypt.compare(password, hashToCompare);

  if (!user || !isMatch) {
    throw new AppError(401, 'INVALID_CREDENTIALS', '이메일 또는 비밀번호가 올바르지 않습니다');
  }

  return generateTokens(user);
}

function generateTokens(user) {
  const accessToken = jwt.sign(
    { sub: user.id, email: user.email },
    env.JWT_ACCESS_SECRET,
    { algorithm: 'HS256', expiresIn: env.JWT_ACCESS_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { sub: user.id },
    env.JWT_REFRESH_SECRET,
    { algorithm: 'HS256', expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
}

async function refreshAccessToken(refreshToken) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', '유효하지 않거나 만료된 Refresh Token입니다');
  }

  const user = await findUserById(payload.sub);
  if (!user) {
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', '유효하지 않거나 만료된 Refresh Token입니다');
  }

  const accessToken = jwt.sign(
    { sub: user.id, email: user.email },
    env.JWT_ACCESS_SECRET,
    { algorithm: 'HS256', expiresIn: env.JWT_ACCESS_EXPIRES_IN }
  );

  return { accessToken };
}

async function getProfile(userId) {
  const user = await findUserById(userId);
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', '사용자를 찾을 수 없습니다');
  return user;
}

async function updateProfile(userId, data) {
  // 이메일 변경
  if (data.email) {
    const existing = await findUserByEmail(data.email);
    if (existing && existing.id !== userId) {
      throw new AppError(409, 'EMAIL_ALREADY_EXISTS', '이미 사용 중인 이메일입니다');
    }
    await updateUserEmail(userId, data.email);
  }
  // 비밀번호 변경
  if (data.new_password) {
    if (!data.current_password) {
      throw new AppError(400, 'VALIDATION_ERROR', '현재 비밀번호를 입력해주세요');
    }
    const user = await findUserByIdWithPassword(userId);
    const isMatch = await bcrypt.compare(data.current_password, user.password);
    if (!isMatch) {
      throw new AppError(401, 'INVALID_CREDENTIALS', '현재 비밀번호가 올바르지 않습니다');
    }
    const hashed = await bcrypt.hash(data.new_password, env.BCRYPT_COST_FACTOR);
    await updateUserPassword(userId, hashed);
  }
  return await findUserById(userId);
}

module.exports = { register, login, generateTokens, refreshAccessToken, getProfile, updateProfile };
