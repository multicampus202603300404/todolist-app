const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL || 'info'] ?? 2;

const timestamp = () => new Date().toISOString();

const logger = {
  error: (...args) => currentLevel >= 0 && console.error(`[${timestamp()}] [ERROR]`, ...args),
  warn:  (...args) => currentLevel >= 1 && console.warn(`[${timestamp()}] [WARN]`, ...args),
  info:  (...args) => currentLevel >= 2 && console.info(`[${timestamp()}] [INFO]`, ...args),
  debug: (...args) => currentLevel >= 3 && console.log(`[${timestamp()}] [DEBUG]`, ...args),
};

module.exports = logger;
