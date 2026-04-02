const { Router } = require('express');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/authenticate');

const router = Router();

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,20}$/;

const registerSchema = {
  body: {
    email: { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { required: true, type: 'string', minLength: 8, maxLength: 20, pattern: PASSWORD_PATTERN },
  },
};

const loginSchema = {
  body: {
    email: { required: true, type: 'string' },
    password: { required: true, type: 'string' },
  },
};

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', authController.refresh);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);

module.exports = router;
