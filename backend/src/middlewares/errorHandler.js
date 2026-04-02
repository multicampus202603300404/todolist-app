const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode;
  let code;
  let message;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  } else {
    statusCode = 500;
    code = 'INTERNAL_ERROR';
    message = '서버 내부 오류가 발생했습니다.';
  }

  const logMessage = `${req.method} ${req.originalUrl} — ${statusCode}: ${err.message}`;
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    logger.error(logMessage, err.stack);
  } else {
    logger.error(logMessage);
  }

  res.status(statusCode).json({
    error: {
      code,
      message,
    },
  });
}

module.exports = errorHandler;
