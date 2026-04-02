const rateStore = new Map();

function rateLimiter({ windowMs = 60000, max = 200 } = {}) {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const record = rateStore.get(key);

    if (!record || now - record.start > windowMs) {
      rateStore.set(key, { start: now, count: 1 });
      return next();
    }

    record.count++;

    if (record.count > max) {
      return res.status(429).json({
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요',
        },
      });
    }

    return next();
  };
}

const authLimiter = rateLimiter({ windowMs: 60000, max: 20 });
const apiLimiter = rateLimiter({ windowMs: 60000, max: 200 });

module.exports = { rateLimiter, authLimiter, apiLimiter };
