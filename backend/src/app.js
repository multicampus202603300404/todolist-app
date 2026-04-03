const path = require('path');
const env = require('./config/env');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');
const { authLimiter, apiLimiter } = require('./middlewares/rateLimiter');

const swaggerDocument = require(path.resolve(__dirname, '../../swagger/swagger.json'));

const app = express();

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// --- Swagger UI ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCssUrl: 'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css',
  customJs: [
    'https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js',
    'https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js',
  ],
}));

// --- 헬스체크 ---
const healthRoutes = require('./routes/healthRoutes');
app.use('/api/health', healthRoutes);

// --- 라우터 ---
const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/todos', apiLimiter, todoRoutes);

// --- 404 핸들러 ---
app.use((req, res, next) => {
  next(new AppError(404, 'NOT_FOUND', `요청한 경로를 찾을 수 없습니다: ${req.method} ${req.originalUrl}`));
});

// --- 전역 에러 핸들러 ---
app.use(errorHandler);

module.exports = app;
