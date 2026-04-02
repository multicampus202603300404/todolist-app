const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'UNAUTHORIZED', '인증이 필요합니다'));
  }

  const token = authHeader.slice(7); // 'Bearer ' 이후 토큰 추출

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AppError(401, 'TOKEN_EXPIRED', '토큰이 만료되었습니다'));
    }
    return next(new AppError(401, 'INVALID_TOKEN', '유효하지 않은 토큰입니다'));
  }
}

module.exports = authenticate;
