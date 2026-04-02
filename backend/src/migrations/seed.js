require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const { pool, verifyConnection } = require('../config/db');

if (process.env.NODE_ENV === 'production') {
  console.error('[ERROR] 프로덕션 환경에서는 시드 스크립트를 실행할 수 없습니다.');
  process.exit(1);
}

// bcrypt hash of "Test1234!" (cost factor 12)
const HASHED_PASSWORD = '$2b$12$LJ3m4ys3Lk0TSwMCkV8HXe8GZ8KNfME8y9GKsQc8wKsQFz.MhxXi';

const USERS = [
  { email: 'alice@example.com' },
  { email: 'bob@example.com' },
  { email: 'charlie@example.com' },
];

function todosForUser(userId, userIndex) {
  const today = new Date();
  const d = (offset) => {
    const date = new Date(today);
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
  };

  return [
    // UPCOMING
    { user_id: userId, title: `프로젝트 기획서 작성 ${userIndex}`, description: '상반기 프로젝트 기획', start_date: d(5), end_date: d(15), is_completed: false },
    // IN_PROGRESS
    { user_id: userId, title: `주간 보고서 정리 ${userIndex}`, description: '이번 주 업무 요약', start_date: d(-3), end_date: d(3), is_completed: false },
    // OVERDUE
    { user_id: userId, title: `레거시 코드 리팩토링 ${userIndex}`, description: null, start_date: d(-20), end_date: d(-5), is_completed: false },
    // COMPLETED_ON_TIME
    { user_id: userId, title: `디자인 검토 완료 ${userIndex}`, description: 'UI 디자인 피드백 반영', start_date: d(-10), end_date: d(-1), is_completed: true, completed_at: new Date(today.getTime() - 2 * 86400000).toISOString() },
    // COMPLETED_LATE
    { user_id: userId, title: `테스트 코드 작성 ${userIndex}`, description: '단위 테스트 추가', start_date: d(-15), end_date: d(-8), is_completed: true, completed_at: new Date(today.getTime() - 1 * 86400000).toISOString() },
  ];
}

async function seed() {
  await verifyConnection();

  for (let i = 0; i < USERS.length; i++) {
    const { email } = USERS[i];

    // 사용자 삽입 (멱등)
    const userResult = await pool.query(
      `INSERT INTO users (email, password) VALUES ($1, $2)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [email, HASHED_PASSWORD]
    );

    let userId;
    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id;
      console.info(`[OK] 사용자 생성: ${email}`);
    } else {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      userId = existing.rows[0].id;
      console.info(`[SKIP] 사용자 이미 존재: ${email}`);
    }

    // 할일 삽입 (멱등 — title + user_id 조합으로 중복 방지)
    const todos = todosForUser(userId, i + 1);
    for (const todo of todos) {
      const existing = await pool.query(
        'SELECT id FROM todos WHERE user_id = $1 AND title = $2',
        [todo.user_id, todo.title]
      );
      if (existing.rows.length > 0) {
        console.info(`  [SKIP] 할일 이미 존재: ${todo.title}`);
        continue;
      }

      await pool.query(
        `INSERT INTO todos (user_id, title, description, start_date, end_date, is_completed, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [todo.user_id, todo.title, todo.description, todo.start_date, todo.end_date, todo.is_completed, todo.completed_at || null]
      );
      console.info(`  [OK] 할일 생성: ${todo.title}`);
    }
  }

  console.info('시드 데이터 삽입 완료');
  await pool.end();
}

seed();
