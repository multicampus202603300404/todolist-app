const { calculateStatus, STATUSES } = require('../src/utils/todoStatus');

describe('calculateStatus', () => {
  const now = new Date('2026-04-01');

  test('UPCOMING: 시작일 이전이고 미완료', () => {
    const todo = { start_date: '2026-04-10', end_date: '2026-04-20', is_completed: false };
    expect(calculateStatus(todo, now)).toBe(STATUSES.UPCOMING);
  });

  test('IN_PROGRESS: 시작일~종료일 사이이고 미완료', () => {
    const todo = { start_date: '2026-03-25', end_date: '2026-04-10', is_completed: false };
    expect(calculateStatus(todo, now)).toBe(STATUSES.IN_PROGRESS);
  });

  test('OVERDUE: 종료일 지나고 미완료', () => {
    const todo = { start_date: '2026-03-01', end_date: '2026-03-20', is_completed: false };
    expect(calculateStatus(todo, now)).toBe(STATUSES.OVERDUE);
  });

  test('COMPLETED_ON_TIME: 완료일이 종료일 이내', () => {
    const todo = {
      start_date: '2026-03-01', end_date: '2026-04-05',
      is_completed: true, completed_at: '2026-04-01T10:00:00Z',
    };
    expect(calculateStatus(todo, now)).toBe(STATUSES.COMPLETED_ON_TIME);
  });

  test('COMPLETED_LATE: 완료일이 종료일 이후', () => {
    const todo = {
      start_date: '2026-03-01', end_date: '2026-03-20',
      is_completed: true, completed_at: '2026-04-01T10:00:00Z',
    };
    expect(calculateStatus(todo, now)).toBe(STATUSES.COMPLETED_LATE);
  });

  test('IN_PROGRESS: 시작일 당일', () => {
    const todo = { start_date: '2026-04-01', end_date: '2026-04-10', is_completed: false };
    expect(calculateStatus(todo, now)).toBe(STATUSES.IN_PROGRESS);
  });

  test('IN_PROGRESS: 종료일 당일', () => {
    const todo = { start_date: '2026-03-20', end_date: '2026-04-01', is_completed: false };
    expect(calculateStatus(todo, now)).toBe(STATUSES.IN_PROGRESS);
  });

  test('COMPLETED_ON_TIME: 완료일이 종료일 당일', () => {
    const todo = {
      start_date: '2026-03-01', end_date: '2026-04-01',
      is_completed: true, completed_at: '2026-04-01T23:59:59Z',
    };
    expect(calculateStatus(todo, now)).toBe(STATUSES.COMPLETED_ON_TIME);
  });
});

describe('AppError', () => {
  const AppError = require('../src/utils/AppError');

  test('statusCode, code, message 속성 포함', () => {
    const err = new AppError(404, 'TODO_NOT_FOUND', '할일을 찾을 수 없습니다');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('TODO_NOT_FOUND');
    expect(err.message).toBe('할일을 찾을 수 없습니다');
    expect(err.isOperational).toBe(true);
    expect(err instanceof Error).toBe(true);
  });
});

describe('logger', () => {
  test('error/warn/info/debug 메서드 존재', () => {
    const logger = require('../src/utils/logger');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });
});
