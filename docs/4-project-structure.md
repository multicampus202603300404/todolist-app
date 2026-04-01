# 프로젝트 구조 설계 원칙: todolist-app

> 버전: 1.0.0
> 작성일: 2026-03-31
> 작성자: Senior Software Architect
> 참조 문서: `docs/1-domain-definition.md` (v1.1.0), `docs/2-prd.md` (v1.2.0), `docs/3-user-scenario.md` (v1.0.1)

### 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0.0 | 2026-03-31 | 최초 작성 |
| 1.1.0 | 2026-04-01 | 환경 변수 목록 테이블 추가 / 로깅 원칙을 console.log 기반으로 변경 |

---

## 1. 최상위 원칙

### 1.1 아키텍처 철학

1. **관심사 분리 (Separation of Concerns)**: 프론트엔드(렌더링/UX), 백엔드(비즈니스 로직), 데이터베이스(영속성)는 역할과 책임이 명확히 분리된다. 어떤 레이어도 다른 레이어의 내부 구현에 직접 의존하지 않는다.

2. **비즈니스 로직은 백엔드에만 존재한다**: 할일 상태 산출(UPCOMING / IN_PROGRESS / OVERDUE / COMPLETED_ON_TIME / COMPLETED_LATE)은 BR-T-05에 따라 서버에서만 계산한다. 프론트엔드는 서버가 내려준 `status` 값을 렌더링할 뿐이며, 클라이언트에서 상태를 재계산하지 않는다.

3. **데이터 소유권 강제**: 모든 데이터 접근은 인증된 사용자의 `user_id` 기준으로 필터링된다. 소유권 검증 실패 시 403이 아닌 404를 반환하여 타인의 리소스 존재 여부를 노출하지 않는다 (BR-U-03).

4. **단방향 의존성**: 의존성은 항상 상위 레이어 → 하위 레이어 방향으로만 흐른다. 하위 레이어(DB 쿼리, 서비스)는 상위 레이어(라우트, 컨트롤러)를 참조하지 않는다.

5. **설정과 코드 분리**: 환경에 따라 달라지는 모든 값(DB 접속 정보, JWT 시크릿, 포트 등)은 환경 변수로 관리하고 코드에 하드코딩하지 않는다.

### 1.2 모노레포 구조 원칙

- 프로젝트 루트에 `frontend/`, `backend/` 두 디렉토리를 분리하여 배치한다.
- 각 디렉토리는 독립적인 `package.json`을 갖는다. 의존성을 공유하지 않는다.
- 루트 `package.json`은 workspace 스크립트(`dev`, `build`, `test`)만 정의한다.
- 프론트엔드와 백엔드 코드는 절대 서로의 디렉토리를 `import`하지 않는다.
- 공유 타입이 필요한 경우 백엔드 API 응답 스키마를 OpenAPI 또는 별도 `shared/types/` 디렉토리를 통해 공유하되, 현재 MVP 단계에서는 각 측에서 중복 정의를 허용한다.

```
todolist-app/                  # 모노레포 루트
├── frontend/                  # React 19 + TypeScript SPA
├── backend/                   # Node.js + Express API 서버
├── docs/                      # 설계 문서
├── .gitignore
└── package.json               # 루트 워크스페이스 스크립트 전용
```

---

## 2. 의존성 / 레이어 원칙

### 2.1 백엔드 레이어 구조 및 의존성 방향

```
HTTP Request
    |
    v
[Router]          -- URL 매핑, 미들웨어 체이닝
    |
    v
[Middleware]      -- 인증(JWT 검증), 요청 유효성 검사, 에러 핸들링
    |
    v
[Controller]      -- 요청 파싱, 응답 직렬화, HTTP 상태 코드 결정
    |
    v
[Service]         -- 비즈니스 로직 (상태 산출, 소유권 검증, 완료율 계산)
    |
    v
[Query / DB]      -- Raw SQL (pg 라이브러리), 트랜잭션 관리
    |
    v
PostgreSQL
```

- Controller는 Service만 호출한다. Query 레이어를 직접 호출하지 않는다.
- Service는 Query 레이어만 호출한다. HTTP 객체(`req`, `res`)를 인자로 받지 않는다.
- Query 레이어는 순수 SQL 실행만 담당한다. 비즈니스 로직을 포함하지 않는다.

### 2.2 프론트엔드 레이어 구조 및 의존성 방향

```
[Page Component]         -- 라우트 단위 컴포넌트, 레이아웃 조합
    |
    v
[Feature Component]      -- 도메인 기능 단위 컴포넌트 (TodoList, TodoForm 등)
    |
    v
[UI Component]           -- 재사용 가능한 순수 UI 요소 (Button, Input 등)

[TanStack Query Hook]    -- 서버 상태 관리 (API 호출, 캐싱, 동기화)
    |
    v
[API Client]             -- axios 인스턴스, 인터셉터, 엔드포인트 함수

[Zustand Store]          -- 클라이언트 전역 상태 (인증 상태, UI 상태)
```

- Page Component는 Feature Component를 조합한다. UI Component를 직접 대량으로 조합하지 않는다.
- 서버 데이터는 TanStack Query를 통해서만 관리한다. Zustand에 서버 데이터를 복사해 저장하지 않는다.
- Zustand는 인증 상태(accessToken, user)와 UI 전역 상태(필터, 정렬 기준)만 관리한다.

### 2.3 프론트엔드 ↔ 백엔드 통신 규약

1. **프로토콜**: HTTPS 필수 (NFR-S-04). 개발 환경에서도 HTTP를 사용하되, 프로덕션 배포 시 HTTPS 강제 적용.
2. **기본 URL**: `/api` 프리픽스를 모든 API 엔드포인트에 사용한다.
3. **인증 전달**: Access Token은 `Authorization: Bearer <token>` 헤더로 전달한다. Refresh Token은 `httpOnly; Secure; SameSite=Strict` 쿠키로만 주고받는다.
4. **요청/응답 형식**: 모든 요청과 응답 body는 `Content-Type: application/json`을 사용한다.
5. **날짜 형식**: 날짜는 `YYYY-MM-DD` 문자열(ISO 8601 date), 타임스탬프는 UTC ISO 8601 문자열(`2026-03-31T12:00:00.000Z`)로 통일한다.
6. **상태 필드**: 응답 body에 항상 `status` 필드를 포함한다. 할일 응답에는 서버가 산출한 `status`(UPCOMING 등)를 포함한다.
7. **에러 응답 구조**: 에러는 아래 구조를 준수한다.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "종료일은 시작일 이후여야 합니다"
  }
}
```

8. **페이지네이션**: 목록 조회 응답은 아래 구조를 준수한다.

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 2.4 비즈니스 로직 배치 원칙

| 로직 | 배치 위치 | 근거 |
|------|-----------|------|
| 할일 상태 산출 (UPCOMING 등) | 백엔드 Service 레이어 | BR-T-05: DB에 저장하지 않고 실시간 산출 |
| 소유권 검증 (`user_id` 일치 여부) | 백엔드 Service 레이어 | BR-U-03: 타인 접근 시 404 반환 |
| 비밀번호 해시/검증 | 백엔드 Service 레이어 | NFR-S-01: bcrypt cost factor 12 |
| JWT 발급/검증 | 백엔드 Middleware 레이어 | NFR-S-02, NFR-S-03 |
| 입력 유효성 검사 (형식/필수값) | 백엔드 Middleware + 프론트엔드 폼 | 백엔드가 최종 권위, 프론트엔드는 UX 보조 |
| 날짜 비교 (end_date >= start_date) | 백엔드 Service 레이어 (프론트 UX 보조) | BR-T-02 |
| 통계 계산 (완료율 등) | 백엔드 Service 레이어 | SQL 집계 + 서버 계산 |
| 토큰 자동 갱신 (Silent Refresh) | 프론트엔드 API Client 인터셉터 | 클라이언트 UX 처리 |

---

## 3. 코드 / 네이밍 원칙

### 3.1 파일 / 디렉토리 네이밍 컨벤션

| 대상 | 규칙 | 예시 |
|------|------|------|
| 백엔드 파일 전체 | `kebab-case` | `todo-service.js`, `auth-middleware.js` |
| 프론트엔드 컴포넌트 파일 | `PascalCase` | `TodoList.tsx`, `AuthGuard.tsx` |
| 프론트엔드 훅 파일 | `camelCase`, `use` 접두사 | `useTodos.ts`, `useAuth.ts` |
| 프론트엔드 스토어 파일 | `camelCase`, `Store` 접미사 | `authStore.ts`, `uiStore.ts` |
| 프론트엔드 유틸 / API | `camelCase` | `todoApi.ts`, `dateUtils.ts` |
| 타입 정의 파일 | `camelCase`, `.types.ts` 접미사 | `todo.types.ts`, `auth.types.ts` |
| 테스트 파일 | 대상 파일명 + `.test.ts(x)` | `todo-service.test.js`, `TodoList.test.tsx` |
| 환경 변수 파일 | `.env`, `.env.example` | `.env.development`, `.env.production` |
| DB 마이그레이션 파일 | `NNN_description.sql` (순번 3자리) | `001_create_users.sql`, `002_create_todos.sql` |

### 3.2 변수 / 함수 / 컴포넌트 네이밍 컨벤션

**공통**
- 모든 식별자는 약어를 지양하고 의미를 명확히 전달하는 이름을 사용한다.
- Boolean 변수/상태는 `is`, `has`, `can` 접두사를 사용한다. (`isCompleted`, `hasError`, `canSubmit`)

**백엔드 (Node.js)**
- 함수/변수: `camelCase` (`getUserTodos`, `hashPassword`)
- 상수: `UPPER_SNAKE_CASE` (`JWT_EXPIRES_IN`, `BCRYPT_COST_FACTOR`)
- 클래스/에러: `PascalCase` (`AppError`, `ValidationError`)
- DB 컬럼명은 쿼리 내에서 `snake_case`를 그대로 사용하되, 응답 직렬화 시 `camelCase`로 변환한다.

```js
// 올바른 예 — 응답 직렬화에서 snake_case → camelCase 변환
const row = await db.query('SELECT user_id, is_completed, end_date FROM todos WHERE id = $1', [id]);
return {
  userId: row.user_id,
  isCompleted: row.is_completed,
  endDate: row.end_date,
};
```

**프론트엔드 (React + TypeScript)**
- 컴포넌트: `PascalCase` (`TodoCard`, `LoginForm`)
- 이벤트 핸들러: `handle` 접두사 (`handleSubmit`, `handleDelete`)
- TanStack Query 훅: `use` + 리소스명 (`useTodos`, `useTodoById`)
- Zustand 액션: 동사 + 명사 (`setAccessToken`, `clearAuth`, `setStatusFilter`)

### 3.3 TypeScript 타입 정의 원칙

1. `any` 타입 사용을 금지한다. 불가피한 경우 `unknown`을 사용하고 타입 가드를 적용한다.
2. API 응답 타입은 `interface`로 정의한다. 유니온/교차 타입은 `type`을 사용한다.
3. 할일 상태는 `const` 열거형 대신 유니온 리터럴 타입으로 정의한다.

```ts
// todo.types.ts
export type TodoStatus =
  | 'UPCOMING'
  | 'IN_PROGRESS'
  | 'OVERDUE'
  | 'COMPLETED_ON_TIME'
  | 'COMPLETED_LATE';

export interface Todo {
  id: string;           // UUID
  userId: string;
  title: string;
  description: string | null;
  startDate: string;    // YYYY-MM-DD
  endDate: string;      // YYYY-MM-DD
  isCompleted: boolean;
  completedAt: string | null;  // ISO 8601 UTC
  createdAt: string;
  updatedAt: string;
  status: TodoStatus;   // 서버 산출값, 클라이언트에서 재계산 금지
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
```

4. Props 타입은 컴포넌트 파일 상단에 `interface [ComponentName]Props`로 정의한다.
5. 제네릭을 적극 활용하여 API 응답 래퍼 타입을 재사용한다.

```ts
export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 3.4 SQL 쿼리 작성 규칙 (pg 라이브러리)

1. **파라미터화 쿼리 필수**: 사용자 입력값은 반드시 `$1`, `$2` 파라미터로 바인딩한다. 문자열 보간(템플릿 리터럴)으로 SQL을 조합하지 않는다.

```js
// 금지
const query = `SELECT * FROM todos WHERE user_id = '${userId}'`;

// 필수
const query = 'SELECT * FROM todos WHERE user_id = $1';
await db.query(query, [userId]);
```

2. **쿼리는 Query 레이어 파일에만 작성한다**: Service 파일 내에 SQL 문자열을 직접 작성하지 않는다.
3. **소유권 검증은 쿼리에서 동시 처리한다**: `WHERE id = $1 AND user_id = $2` 패턴으로 단일 쿼리에서 존재 여부와 소유권을 함께 검증한다.

```js
// todo-query.js — 올바른 소유권 검증 패턴
const findTodoByIdAndUserId = async (id, userId) => {
  const result = await db.query(
    'SELECT * FROM todos WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rows[0] ?? null; // null이면 Service에서 404 처리
};
```

4. **동적 정렬**은 허용된 컬럼명 화이트리스트를 통해 SQL 인젝션을 방지한다.

```js
const ALLOWED_SORT_COLUMNS = ['end_date', 'start_date', 'created_at', 'title'];
const ALLOWED_SORT_DIRECTIONS = ['ASC', 'DESC'];

const sortColumn = ALLOWED_SORT_COLUMNS.includes(reqSortBy) ? reqSortBy : 'created_at';
const sortDir = ALLOWED_SORT_DIRECTIONS.includes(reqOrder) ? reqOrder : 'DESC';
// 검증된 값은 파라미터가 아닌 SQL 식별자로 직접 삽입 허용
const query = `SELECT * FROM todos WHERE user_id = $1 ORDER BY ${sortColumn} ${sortDir}`;
```

5. **인덱스를 활용하는 쿼리 패턴**: `user_id`와 `end_date` 컬럼에 인덱스가 존재하므로, WHERE 절에 `user_id`를 항상 포함하고 `end_date` 범위 조건을 적극 활용한다.
6. **트랜잭션**: 복수의 쿼리를 원자적으로 처리해야 하는 경우 `BEGIN` / `COMMIT` / `ROLLBACK`을 명시적으로 사용한다.

---

## 4. 테스트 / 품질 원칙

### 4.1 테스트 전략

**단위 테스트 (Unit Test)**
- 대상: 백엔드 Service 레이어의 비즈니스 로직 함수
- 우선 대상: 상태 산출 로직(`calculateTodoStatus`), 소유권 검증, 통계 계산
- DB는 모킹(jest mock)하여 순수 로직만 검증한다.
- 목표 커버리지: Service 레이어 80% 이상

**통합 테스트 (Integration Test)**
- 대상: 백엔드 API 엔드포인트 전체
- 실제 PostgreSQL 테스트 DB(또는 Docker 컨테이너)를 사용한다.
- 각 엔드포인트별로 정상 케이스, 인증 실패(401), 소유권 실패(404), 유효성 실패(400) 케이스를 검증한다.
- 특히 `PATCH /api/todos/:id/complete`, `PATCH /api/todos/:id/uncomplete`의 멱등성(409 응답)을 반드시 검증한다.

**E2E 테스트 (End-to-End)**
- MVP 단계에서는 핵심 사용자 시나리오(US-01 ~ US-04) 위주로 Playwright를 사용하여 작성한다.
- CI 파이프라인에서 통합/E2E 테스트는 Docker Compose로 DB를 포함한 전체 스택을 띄워 실행한다.

**프론트엔드 테스트**
- React Testing Library로 Feature 컴포넌트의 사용자 상호작용을 검증한다.
- API 호출은 MSW(Mock Service Worker)로 모킹한다.
- 상태 산출 로직은 프론트엔드에 없으므로 상태 렌더링 조건(status 값별 UI 분기)을 위주로 테스트한다.

### 4.2 코드 품질 도구

| 도구 | 적용 범위 | 설정 파일 |
|------|-----------|-----------|
| ESLint | frontend/, backend/ | `.eslintrc.json` |
| Prettier | frontend/, backend/ | `.prettierrc` |
| TypeScript strict mode | frontend/ | `tsconfig.json` (`"strict": true`) |
| Husky + lint-staged | 루트 | `.husky/pre-commit` |

- Prettier는 ESLint와 통합하여 포매팅 충돌을 방지한다 (`eslint-config-prettier`).
- `pre-commit` 훅에서 lint-staged로 변경된 파일에만 ESLint + Prettier를 실행한다.
- TypeScript `strict` 모드를 활성화하여 `null` / `undefined` 처리를 컴파일 타임에 강제한다.

### 4.3 커밋 메시지 규칙

Conventional Commits 규격을 따른다.

```
<type>(<scope>): <subject>

[optional body]
```

**type**
| type | 용도 |
|------|------|
| `feat` | 새 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 동작 변경 없는 코드 개선 |
| `test` | 테스트 추가/수정 |
| `docs` | 문서 변경 |
| `chore` | 빌드, 의존성, 설정 변경 |
| `perf` | 성능 개선 |

**scope**: `auth`, `todo`, `statistics`, `frontend`, `backend`, `db`, `config`

```
# 예시
feat(todo): 할일 상태 산출 로직 구현 (BR-T-05)
fix(auth): refresh token 만료 시 401 대신 200 반환하는 버그 수정
test(todo): 소유권 검증 통합 테스트 추가
```

---

## 5. 설정 / 보안 / 운영 원칙

### 5.1 환경 변수 관리

- 모든 환경 변수는 `backend/.env`, `frontend/.env`에 관리한다.
- `.env` 파일은 `.gitignore`에 반드시 포함한다. `.env.example` 파일만 커밋한다.
- 백엔드 서버 시작 시 필수 환경 변수 존재 여부를 검증하고, 누락 시 프로세스를 종료한다.

#### 백엔드 환경 변수 목록

| 변수명 | 설명 | 필수 | 기본값 | 예시 |
|--------|------|------|--------|------|
| `NODE_ENV` | 실행 환경 | O | `development` | `development` / `production` / `test` |
| `PORT` | 서버 포트 | O | `4000` | `4000` |
| `DATABASE_URL` | PostgreSQL 연결 문자열 | O | - | `postgresql://user:password@localhost:5432/todolist` |
| `JWT_ACCESS_SECRET` | Access Token 서명 키 (최소 32자) | O | - | 무작위 문자열 |
| `JWT_REFRESH_SECRET` | Refresh Token 서명 키 (최소 32자) | O | - | 무작위 문자열 (Access와 다른 값) |
| `JWT_ACCESS_EXPIRES_IN` | Access Token 유효 기간 | O | `30m` | `30m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh Token 유효 기간 | O | `7d` | `7d` |
| `BCRYPT_COST_FACTOR` | bcrypt 해시 라운드 수 | X | `12` | `12` |
| `CORS_ORIGIN` | 허용 CORS 출처 | O | - | `http://localhost:3000` |
| `LOG_LEVEL` | 로그 출력 레벨 | X | `info` | `debug` / `info` / `warn` / `error` |

#### 프론트엔드 환경 변수 목록

| 변수명 | 설명 | 필수 | 기본값 | 예시 |
|--------|------|------|--------|------|
| `VITE_API_BASE_URL` | 백엔드 API 기본 URL | O | - | `http://localhost:4000` |

#### .env.example 템플릿

```
# backend/.env.example
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/todolist
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_ACCESS_EXPIRES_IN=30m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_COST_FACTOR=12
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

```
# frontend/.env.example
VITE_API_BASE_URL=http://localhost:4000
```

### 5.2 JWT / 인증 보안 규칙

1. **Access Token**: HS256 알고리즘, 유효 기간 30분, `Authorization: Bearer` 헤더로 전달 (NFR-S-02).
2. **Refresh Token**: 유효 기간 7일, `httpOnly; Secure; SameSite=Strict` 쿠키로만 전달. JavaScript에서 직접 접근 불가 (NFR-S-02).
3. **JWT 시크릿**: 최소 32자 이상의 무작위 문자열을 사용한다. Access / Refresh 시크릿은 반드시 별도로 설정한다.
4. **토큰 검증 미들웨어**: 인증이 필요한 모든 라우트에 적용한다. 공개 엔드포인트(`/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`)는 명시적으로 제외한다.
5. **비밀번호**: bcrypt cost factor 12로 해시 저장. 응답 body에 `password` 필드를 절대 포함하지 않는다.
6. **Silent Refresh**: 프론트엔드 axios 인터셉터에서 401 응답 수신 시 `/api/auth/refresh`를 호출하여 Access Token을 갱신한다. 갱신 실패 시 로그아웃 처리 후 로그인 화면으로 리다이렉트한다.

### 5.3 에러 처리 규칙

1. **중앙 에러 핸들러**: Express의 4-인자 에러 미들웨어(`(err, req, res, next)`)를 `app.js` 마지막에 등록하여 모든 에러를 일관된 형식으로 처리한다.
2. **커스텀 에러 클래스**: `AppError` 기반 클래스를 사용하여 HTTP 상태 코드와 에러 코드를 포함한 구조화된 에러를 throw한다.
3. **에러 응답 형식**: 항상 `{ "error": { "code": "...", "message": "..." } }` 구조를 유지한다.
4. **스택 트레이스 노출 금지**: `NODE_ENV=production`에서는 에러 스택 트레이스를 클라이언트에 반환하지 않는다.
5. **404 vs 403**: 소유권 검증 실패는 403 대신 404로 반환하여 타인 리소스 존재 여부를 노출하지 않는다 (BR-U-03).
6. **비동기 에러 전파**: Express 라우트의 비동기 핸들러는 `try/catch`로 감싸거나 `express-async-errors` 패키지를 사용하여 에러를 중앙 핸들러로 전파한다.

```js
// AppError 사용 예
class AppError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

// Service에서 사용
if (!todo) {
  throw new AppError(404, 'TODO_NOT_FOUND', '할일을 찾을 수 없습니다');
}
```

### 5.4 로깅 원칙

1. **콘솔 로그 사용**: 별도 로깅 라이브러리(winston, pino 등) 없이 Node.js 내장 `console` 객체를 사용한다. 레벨별로 `console.error()`, `console.warn()`, `console.info()`, `console.log()`를 구분하여 호출한다.
2. **로그 레벨 사용 기준**:
   - `console.error()` — 5xx 서버 에러, 예상치 못한 예외
   - `console.warn()` — 4xx 클라이언트 에러, 보안 이벤트 (로그인 실패, 토큰 검증 실패, 소유권 검증 실패)
   - `console.info()` — 서버 시작, HTTP 요청/응답 요약 (메서드, URL, 상태 코드, 응답 시간)
   - `console.log()` — 개발 환경 디버그 정보 (`NODE_ENV=production`에서는 사용 자제)
3. **로그 출력 형식**: `[시각] [레벨] 메시지` 형태로 통일한다. 환경 변수 `LOG_LEVEL`에 따라 해당 레벨 이상만 출력하는 간단한 래퍼 함수를 `backend/src/utils/logger.js`에 작성한다.
4. **요청 로그**: Express 미들웨어에서 각 HTTP 요청의 메서드, URL, 상태 코드, 응답 시간을 `console.info()`로 기록한다.
5. **민감 정보 제외**: 로그에 비밀번호, JWT 토큰 전체 값, Refresh Token을 절대 포함하지 않는다.
6. **에러 로그**: 5xx 에러 발생 시 에러 스택 트레이스를 `console.error()`로 서버 로그에만 기록한다. 클라이언트에는 스택 트레이스를 반환하지 않는다.
7. **보안 이벤트 로깅**: 로그인 실패, 토큰 검증 실패, 소유권 검증 실패 이벤트를 `console.warn()`으로 기록한다.

```js
// backend/src/utils/logger.js — 간단한 콘솔 로거 래퍼 예시
const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL || 'info'];

const logger = {
  error: (...args) => currentLevel >= 0 && console.error(`[${new Date().toISOString()}] [ERROR]`, ...args),
  warn:  (...args) => currentLevel >= 1 && console.warn(`[${new Date().toISOString()}] [WARN]`, ...args),
  info:  (...args) => currentLevel >= 2 && console.info(`[${new Date().toISOString()}] [INFO]`, ...args),
  debug: (...args) => currentLevel >= 3 && console.log(`[${new Date().toISOString()}] [DEBUG]`, ...args),
};

module.exports = logger;
```

---

## 6. 프론트엔드 디렉토리 구조

```
frontend/
├── public/                          # 정적 파일 (favicon, robots.txt)
├── src/
│   ├── main.tsx                     # React 앱 진입점, QueryClientProvider 등록
│   ├── App.tsx                      # 라우팅 설정 (React Router)
│   │
│   ├── features/                    # 기능 기반(feature-based) 모듈
│   │   ├── auth/                    # 인증 기능 (SCR-01, SCR-02)
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx    # 로그인 폼 컴포넌트
│   │   │   │   └── RegisterForm.tsx # 회원가입 폼 컴포넌트
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts       # 로그인/로그아웃/회원가입 mutation
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx    # SCR-01 로그인 화면
│   │   │   │   └── RegisterPage.tsx # SCR-02 회원가입 화면
│   │   │   └── auth.types.ts        # 인증 관련 타입 정의
│   │   │
│   │   └── todos/                   # 할일 기능 (SCR-03 ~ SCR-07)
│   │       ├── components/
│   │       │   ├── TodoList.tsx     # 할일 목록 (SCR-03)
│   │       │   ├── TodoCard.tsx     # 목록 내 개별 할일 카드
│   │       │   ├── TodoForm.tsx     # 등록/수정 공용 폼 (SCR-04, SCR-06)
│   │       │   ├── TodoDetail.tsx   # 상세 정보 (SCR-05)
│   │       │   ├── TodoStatusBadge.tsx  # 상태 표시 뱃지 (5종 상태)
│   │       │   ├── TodoFilterBar.tsx    # 상태 필터 + 정렬 선택 UI
│   │       │   └── TodoStatistics.tsx   # 통계 화면 (SCR-07)
│   │       ├── hooks/
│   │       │   ├── useTodos.ts      # 목록 조회 Query (TanStack Query)
│   │       │   ├── useTodoById.ts   # 단건 조회 Query
│   │       │   ├── useTodoMutations.ts  # 생성/수정/삭제/완료 Mutation
│   │       │   └── useTodoStatistics.ts # 통계 조회 Query
│   │       ├── pages/
│   │       │   ├── TodoListPage.tsx # SCR-03 메인 목록 화면
│   │       │   ├── TodoCreatePage.tsx   # SCR-04 할일 등록 화면
│   │       │   ├── TodoDetailPage.tsx   # SCR-05 할일 상세 화면
│   │       │   ├── TodoEditPage.tsx     # SCR-06 할일 수정 화면
│   │       │   └── StatisticsPage.tsx   # SCR-07 통계 화면
│   │       └── todo.types.ts        # Todo, TodoStatus 타입 정의
│   │
│   ├── shared/                      # 기능에 무관한 공용 코드
│   │   ├── components/              # 재사용 UI 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── ErrorMessage.tsx
│   │   ├── layouts/
│   │   │   ├── AuthLayout.tsx       # 비인증 화면 레이아웃 (로그인, 회원가입)
│   │   │   └── AppLayout.tsx        # 인증 후 메인 레이아웃 (네비게이션 포함)
│   │   └── guards/
│   │       └── AuthGuard.tsx        # 비인증 시 로그인 화면으로 리다이렉트
│   │
│   ├── stores/                      # Zustand 전역 상태 관리
│   │   ├── authStore.ts             # accessToken, user 정보, setAccessToken, clearAuth
│   │   └── uiStore.ts               # 상태 필터, 정렬 기준 등 UI 전역 상태
│   │
│   ├── api/                         # API 클라이언트
│   │   ├── axiosInstance.ts         # axios 인스턴스, 인터셉터 (Silent Refresh 포함)
│   │   ├── authApi.ts               # /api/auth/* 엔드포인트 함수
│   │   └── todoApi.ts               # /api/todos/* 엔드포인트 함수
│   │
│   └── utils/                       # 순수 유틸리티 함수
│       └── dateUtils.ts             # YYYY-MM-DD 포매팅, 날짜 비교 유틸
│
├── index.html
├── vite.config.ts
├── tsconfig.json                    # "strict": true 필수
├── .eslintrc.json
├── .prettierrc
└── package.json
```

---

## 7. 백엔드 디렉토리 구조

```
backend/
├── src/
│   ├── app.js                       # Express 앱 초기화, 미들웨어 등록, 라우터 마운트
│   ├── server.js                    # HTTP 서버 시작, 포트 바인딩, graceful shutdown
│   │
│   ├── config/
│   │   ├── env.js                   # 환경 변수 로드 및 유효성 검증 (누락 시 프로세스 종료)
│   │   └── db.js                    # pg Pool 설정, 커넥션 풀 초기화 (max: 10)
│   │
│   ├── routes/                      # URL 매핑 및 미들웨어 체이닝
│   │   ├── index.js                 # /api 라우터 집계 (authRouter, todoRouter 마운트)
│   │   ├── auth.route.js            # POST /api/auth/register, login, logout, refresh
│   │   └── todo.route.js            # /api/todos/* 엔드포인트 정의
│   │
│   ├── controllers/                 # 요청 파싱, 응답 직렬화, HTTP 상태 코드 결정
│   │   ├── auth.controller.js       # register, login, logout, refresh 처리
│   │   └── todo.controller.js       # CRUD, complete, uncomplete, statistics 처리
│   │
│   ├── services/                    # 비즈니스 로직 (HTTP 객체 미사용)
│   │   ├── auth.service.js          # 사용자 생성, 비밀번호 검증, JWT 발급/갱신
│   │   └── todo.service.js          # 할일 CRUD, 상태 산출, 소유권 검증, 통계 계산
│   │
│   ├── queries/                     # Raw SQL 쿼리 (pg 라이브러리 직접 사용)
│   │   ├── user.query.js            # users 테이블 CRUD 쿼리
│   │   └── todo.query.js            # todos 테이블 CRUD 쿼리 (user_id 필터 포함)
│   │
│   ├── middlewares/
│   │   ├── authenticate.js          # JWT Access Token 검증, req.user 설정
│   │   ├── validate.js              # 요청 body/params/query 유효성 검사 미들웨어
│   │   └── error-handler.js         # 중앙 에러 핸들러 (4-인자 Express 미들웨어)
│   │
│   ├── utils/
│   │   ├── AppError.js              # 커스텀 에러 클래스 (statusCode, code, message)
│   │   ├── jwt.js                   # JWT 발급/검증 유틸리티 함수
│   │   ├── password.js              # bcrypt 해시/검증 유틸리티 함수
│   │   └── todoStatus.js            # 할일 상태 산출 함수 (BR-T-05 구현체)
│   │
│   └── constants/
│       └── todoStatus.js            # TODO_STATUS 상수 객체 정의
│
├── migrations/                      # DB 마이그레이션 SQL 파일
│   ├── 001_create_users.sql         # users 테이블 생성
│   ├── 002_create_todos.sql         # todos 테이블 생성, FK, 인덱스
│   └── 003_add_indexes.sql          # user_id, end_date 인덱스 추가 (NFR 성능 요건)
│
├── tests/
│   ├── unit/
│   │   ├── todo.service.test.js     # 상태 산출, 소유권 검증 단위 테스트
│   │   └── auth.service.test.js     # 비밀번호 검증, 토큰 발급 단위 테스트
│   └── integration/
│       ├── auth.api.test.js         # 인증 API 통합 테스트
│       └── todo.api.test.js         # 할일 API 통합 테스트 (소유권 404 포함)
│
├── .env                             # 환경 변수 (gitignore 대상)
├── .env.example                     # 환경 변수 템플릿 (커밋 대상)
├── .eslintrc.json
├── .prettierrc
├── jest.config.js
└── package.json
```

### 7.1 핵심 파일 역할 요약

| 파일 | 역할 |
|------|------|
| `src/utils/todoStatus.js` | BR-T-05 구현체. `(isCompleted, completedAt, startDate, endDate, today) => TodoStatus` 순수 함수. 이 파일 외에서 상태 산출 로직을 중복 구현하지 않는다. |
| `src/config/db.js` | pg `Pool` 인스턴스 단일 생성 및 export. 전 모듈에서 이 인스턴스를 재사용한다. |
| `src/middlewares/authenticate.js` | `Authorization: Bearer` 헤더를 파싱하여 JWT를 검증하고 `req.user = { id, email }`을 설정한다. 인증 실패 시 401을 반환한다. |
| `src/middlewares/error-handler.js` | Service/Query에서 throw된 `AppError`를 받아 클라이언트에 일관된 에러 JSON을 반환한다. 프로덕션에서는 스택 트레이스를 제외한다. |
| `migrations/002_create_todos.sql` | `user_id` FK(CASCADE DELETE), `is_completed DEFAULT false`, `updated_at` 자동 갱신 트리거를 포함한다. |
| `migrations/003_add_indexes.sql` | `CREATE INDEX idx_todos_user_id ON todos(user_id)`, `CREATE INDEX idx_todos_end_date ON todos(end_date)` — NFR 성능 요건 충족을 위한 인덱스. |
