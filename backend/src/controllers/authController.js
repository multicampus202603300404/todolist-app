const authService = require('../services/authService');
const env = require('../config/env');

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body.email, req.body.password);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { accessToken, refreshToken } = await authService.login(req.body.email, req.body.password);
    // Refresh Token을 httpOnly Cookie로 설정
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      path: '/api/auth',
    });
    res.status(200).json({ access_token: accessToken });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    res.clearCookie('refreshToken', { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'strict', path: '/api/auth' });
    res.status(200).json({ message: '로그아웃 되었습니다' });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      const AppError = require('../utils/AppError');
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', '유효하지 않거나 만료된 Refresh Token입니다');
    }
    const { accessToken } = await authService.refreshAccessToken(refreshToken);
    res.status(200).json({ access_token: accessToken });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, refresh };
