const AppError = require('../utils/AppError');

/**
 * 단일 필드 값을 규칙에 따라 검증한다.
 * 에러가 있으면 에러 메시지 문자열을 반환하고, 통과하면 null을 반환한다.
 *
 * @param {string} fieldName
 * @param {*} value
 * @param {object} rules
 * @returns {string|null}
 */
function validateField(fieldName, value, rules) {
  const isEmpty = value === undefined || value === null || value === '';

  if (rules.required && isEmpty) {
    return `${fieldName} 필드는 필수입니다.`;
  }

  // 값이 없고 required가 아닌 경우 나머지 검증 생략
  if (isEmpty) {
    return null;
  }

  if (rules.type) {
    // eslint-disable-next-line valid-typeof
    if (typeof value !== rules.type) {
      return `${fieldName} 필드의 타입은 ${rules.type}이어야 합니다.`;
    }
  }

  if (rules.minLength !== undefined && typeof value === 'string') {
    if (value.length < rules.minLength) {
      return `${fieldName} 필드는 최소 ${rules.minLength}자 이상이어야 합니다.`;
    }
  }

  if (rules.maxLength !== undefined && typeof value === 'string') {
    if (value.length > rules.maxLength) {
      return `${fieldName} 필드는 최대 ${rules.maxLength}자 이하이어야 합니다.`;
    }
  }

  if (rules.pattern !== undefined && typeof value === 'string') {
    const regex = rules.pattern instanceof RegExp ? rules.pattern : new RegExp(rules.pattern);
    if (!regex.test(value)) {
      return `${fieldName} 필드의 형식이 올바르지 않습니다.`;
    }
  }

  if (rules.enum !== undefined) {
    if (!rules.enum.includes(value)) {
      return `${fieldName} 필드는 [${rules.enum.join(', ')}] 중 하나이어야 합니다.`;
    }
  }

  if (rules.min !== undefined && typeof value === 'number') {
    if (value < rules.min) {
      return `${fieldName} 필드는 ${rules.min} 이상이어야 합니다.`;
    }
  }

  if (rules.max !== undefined && typeof value === 'number') {
    if (value > rules.max) {
      return `${fieldName} 필드는 ${rules.max} 이하이어야 합니다.`;
    }
  }

  if (rules.custom) {
    const result = rules.custom(value);
    if (result !== true && result !== undefined && result !== null) {
      return typeof result === 'string' ? result : `${fieldName} 필드가 유효하지 않습니다.`;
    }
  }

  return null;
}

/**
 * 요청 검증 미들웨어 팩토리.
 *
 * schema 예시:
 * {
 *   body: { email: { required: true, type: 'string' } },
 *   params: { id: { required: true } },
 *   query: { page: { type: 'string' } },
 * }
 *
 * @param {{ body?: object, params?: object, query?: object }} schema
 * @returns {Function} Express 미들웨어
 */
function validate(schema) {
  return function validationMiddleware(req, res, next) {
    const targets = [
      { source: req.body, rules: schema.body },
      { source: req.params, rules: schema.params },
      { source: req.query, rules: schema.query },
    ];

    for (const { source, rules } of targets) {
      if (!rules) continue;

      for (const [field, fieldRules] of Object.entries(rules)) {
        const value = source ? source[field] : undefined;
        const error = validateField(field, value, fieldRules);

        if (error) {
          return next(new AppError(400, 'VALIDATION_ERROR', error));
        }
      }
    }

    return next();
  };
}

module.exports = validate;
