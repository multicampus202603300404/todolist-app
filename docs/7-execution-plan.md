# 실행계획: todolist-app

> 버전: 1.0.0
> 작성일: 2026-04-01
> 참조 문서: `docs/1-domain-definition.md`, `docs/2-prd.md`, `docs/3-user-scenario.md`, `docs/4-project-structure.md`

---

## 실행 순서 요약

```
Phase 1 (기반)     DB-01 → DB-02 → DB-03 → DB-04 → DB-05 → DB-06, DB-07
                    BE-01 (병렬)
                    FE-01 → FE-02 (병렬)

Phase 2 (인프라)    BE-03, BE-04 / FE-03, FE-04, FE-07

Phase 3 (인증)      BE-05 → BE-06 / FE-05 → FE-06 → FE-09, FE-15, FE-16

Phase 4 (CRUD)      BE-07 → BE-08 → BE-09 / FE-17 → FE-18, FE-19 → FE-20 → FE-21

Phase 5 (통계)      BE-10 / FE-22 → FE-23

Phase 6 (마무리)    BE-11, BE-12, DB-09, DB-10
```

---

## 데이터베이스 (DB-01 ~ DB-10)

### DB-01: PostgreSQL 연결 풀 설정
- **설명**: pg Pool 인스턴스 생성, 연결 검증, graceful shutdown, query 래퍼 함수 구현
- **산출물**: `backend/src/config/db.js`
- **완료 조건**:
  - [ ] `new Pool({ connectionString: DATABASE_URL, max: 10 })` 설정 완료
  - [ ] `pool.on('error')` 이벤트 핸들러 등록
  - [ ] 서버 시작 시 연결 검증 로직 구현
  - [ ] SIGTERM/SIGINT 수신 시 `pool.end()` graceful shutdown 처리
  - [ ] DATABASE_URL 미설정 시 프로세스 종료
  - [ ] `query(text, params)` 래퍼 함수 export
- **의존성**:
  - [ ] 없음 (독립 실행 가능)

---

### DB-02: 마이그레이션 실행 스크립트 구현
- **설명**: migrations/ 디렉토리의 SQL 파일을 순서대로 실행하는 러너. `schema_migrations` 테이블로 멱등성 보장
- **산출물**: `backend/src/migrations/migrate.js`
- **완료 조건**:
  - [ ] `schema_migrations` 추적 테이블 자동 생성
  - [ ] NNN_description.sql 파일명 오름차순 순차 실행
  - [ ] 이미 적용된 파일 건너뜀 (멱등성)
  - [ ] 각 마이그레이션 트랜잭션 내 실행, 실패 시 롤백
  - [ ] `npm run migrate` 스크립트 등록
- **의존성**:
  - [ ] DB-01 완료

---

### DB-03: pgcrypto 확장 활성화
- **설명**: `gen_random_uuid()` 사용을 위한 pgcrypto 확장 활성화
- **산출물**: `backend/src/migrations/001_enable_pgcrypto.sql`
- **완료 조건**:
  - [ ] `CREATE EXTENSION IF NOT EXISTS "pgcrypto"` 포함
  - [ ] `SELECT gen_random_uuid()` 정상 실행 확인
- **의존성**:
  - [ ] DB-02 완료

---

### DB-04: users 테이블 생성
- **설명**: users DDL 마이그레이션 (UUID PK, email UNIQUE, password bcrypt hash, created_at)
- **산출물**: `backend/src/migrations/002_create_users.sql`
- **완료 조건**:
  - [ ] `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - [ ] `email VARCHAR(254) UNIQUE NOT NULL`
  - [ ] `password VARCHAR(60) NOT NULL`
  - [ ] `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  - [ ] `CREATE TABLE IF NOT EXISTS` 멱등성 보장
- **의존성**:
  - [ ] DB-03 완료

---

### DB-05: todos 테이블 생성
- **설명**: todos DDL 마이그레이션 (FK CASCADE, 날짜 컬럼, status 컬럼 미포함)
- **산출물**: `backend/src/migrations/003_create_todos.sql`
- **완료 조건**:
  - [ ] `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - [ ] `user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
  - [ ] `title VARCHAR(200) NOT NULL`
  - [ ] `description TEXT` (NULL 허용)
  - [ ] `start_date DATE NOT NULL`, `end_date DATE NOT NULL`
  - [ ] `is_completed BOOLEAN NOT NULL DEFAULT false`
  - [ ] `completed_at TIMESTAMPTZ` (NULL 허용)
  - [ ] `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  - [ ] `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  - [ ] status 컬럼이 DDL에 포함되지 않음 확인 (BR-T-05)
- **의존성**:
  - [ ] DB-04 완료

---

### DB-06: 인덱스 생성
- **설명**: NFR-P-04 성능 요건 충족을 위한 인덱스 생성
- **산출물**: `backend/src/migrations/004_create_indexes.sql`
- **완료 조건**:
  - [ ] `idx_todos_user_id` — todos(user_id)
  - [ ] `idx_todos_end_date` — todos(end_date)
  - [ ] `idx_todos_user_id_end_date` — todos(user_id, end_date) 복합
  - [ ] 모든 인덱스 `CREATE INDEX IF NOT EXISTS` 사용
- **의존성**:
  - [ ] DB-05 완료

---

### DB-07: updated_at 자동 갱신 트리거
- **설명**: todos UPDATE 시 updated_at을 NOW()로 자동 갱신하는 트리거 함수
- **산출물**: `backend/src/migrations/005_create_updated_at_trigger.sql`
- **완료 조건**:
  - [ ] `set_updated_at()` PL/pgSQL 함수 생성
  - [ ] `BEFORE UPDATE ON todos` 트리거 등록
  - [ ] UPDATE 후 updated_at 자동 변경 확인
  - [ ] created_at은 트리거에 의해 변경되지 않음 확인
- **의존성**:
  - [ ] DB-05 완료

---

### DB-08: 시드 데이터 스크립트
- **설명**: 개발/테스트용 초기 데이터 삽입 스크립트 (프로덕션 실행 방지 가드 포함)
- **산출물**: `backend/src/migrations/seed.js`
- **완료 조건**:
  - [ ] `NODE_ENV === 'production'` 시 실행 차단
  - [ ] 테스트 사용자 3건 이상 (bcrypt 해시 password)
  - [ ] 각 사용자당 todos 5건 이상 (다양한 상태 혼합)
  - [ ] `INSERT ON CONFLICT DO NOTHING` 멱등성 보장
  - [ ] `npm run seed` 스크립트 등록
- **의존성**:
  - [ ] DB-06 완료

---

### DB-09: 커넥션 풀 성능 검증
- **설명**: 동시접속 500명 규모 충족 여부 및 쿼리 응답 시간 검증
- **산출물**: `backend/tests/db-performance.test.js`
- **완료 조건**:
  - [ ] 10개 동시 쿼리 실행 시 정상 처리 확인
  - [ ] `idleTimeoutMillis`, `connectionTimeoutMillis` 설정 적용
  - [ ] todos 단건 조회 P95 100ms 이하 확인
- **의존성**:
  - [ ] DB-06 완료

---

### DB-10: 데이터베이스 연결 풀 모니터링 로깅
- **설명**: pg Pool 메트릭(totalCount, idleCount, waitingCount) 주기적 로깅
- **산출물**: `backend/src/config/db.js` (로깅 보강)
- **완료 조건**:
  - [ ] Pool 상태 메트릭을 console.info로 출력
  - [ ] 연결 풀 고갈 시 console.warn 경고 로그
- **의존성**:
  - [ ] DB-01 완료

---

## 백엔드 (BE-01 ~ BE-12)

### BE-01: 프로젝트 초기화 및 환경변수 설정
- **설명**: Node.js + Express 프로젝트 초기화, 패키지 설치, 디렉토리 구조 생성, 환경변수 로드/검증
- **산출물**: `backend/package.json`, `backend/.env.example`, `backend/src/config/env.js`, `backend/src/app.js`, `backend/src/server.js`
- **완료 조건**:
  - [ ] express, pg, bcrypt, jsonwebtoken, cookie-parser, cors, dotenv 패키지 설치
  - [ ] `env.js`가 10개 환경변수 검증, 누락 시 프로세스 종료
  - [ ] `server.js` 실행 시 포트 4000에서 정상 기동
  - [ ] `.env.example`에 모든 키 + 설명 주석 포함
- **의존성**:
  - [ ] 없음 (독립 실행 가능)

---

### BE-02: 유틸리티 모듈 구현 (logger, AppError, todoStatus)
- **설명**: 콘솔 기반 로거, 커스텀 에러 클래스, 할일 상태 산출 함수 구현
- **산출물**: `backend/src/utils/logger.js`, `backend/src/utils/AppError.js`, `backend/src/utils/todoStatus.js`
- **완료 조건**:
  - [ ] `logger.js` — LOG_LEVEL 반영, error/warn/info/debug 메서드, 타임스탬프 포함
  - [ ] `AppError.js` — statusCode, code, message 속성 포함 커스텀 Error
  - [ ] `todoStatus.js` — `calculateStatus(todo, now)` 함수 구현:
    - [ ] `is_completed=true` AND `completed_at <= end_date` → COMPLETED_ON_TIME
    - [ ] `is_completed=true` AND `completed_at > end_date` → COMPLETED_LATE
    - [ ] `is_completed=false` AND `now < start_date` → UPCOMING
    - [ ] `is_completed=false` AND `start_date <= now <= end_date` → IN_PROGRESS
    - [ ] `is_completed=false` AND `now > end_date` → OVERDUE
  - [ ] todoStatus 단위 테스트 5개 케이스 통과
- **의존성**:
  - [ ] BE-01 완료

---

### BE-03: 공통 미들웨어 구현
- **설명**: 전역 에러 핸들러, JWT 인증 미들웨어, 요청 검증 미들웨어, CORS/보안 설정
- **산출물**: `backend/src/middlewares/errorHandler.js`, `backend/src/middlewares/authenticate.js`, `backend/src/middlewares/validate.js`, `backend/src/app.js` 업데이트
- **완료 조건**:
  - [ ] 에러 응답 형식 통일: `{ "error": { "code": "...", "message": "..." } }`
  - [ ] production에서 stack trace 클라이언트 미노출
  - [ ] `authenticate.js` — Bearer 토큰 검증, `req.user = { id, email }` 설정
  - [ ] 토큰 만료/서명 불일치/누락 시 401 반환
  - [ ] `validate.js` — 스키마 기반 req.body/params/query 검증 팩토리
  - [ ] CORS: credentials=true, CORS_ORIGIN 환경변수 반영
  - [ ] `app.js`에 express.json, cookie-parser, cors, 라우터, errorHandler 순서 등록
- **의존성**:
  - [ ] BE-01, BE-02 완료

---

### BE-04: 인증 Query/Service 구현
- **설명**: users 테이블 쿼리 및 회원가입/로그인/토큰 갱신 비즈니스 로직
- **산출물**: `backend/src/queries/userQueries.js`, `backend/src/services/authService.js`
- **완료 조건**:
  - [ ] `userQueries` — createUser, findUserByEmail, findUserById (파라미터 바인딩)
  - [ ] 이메일 중복 시 AppError(409) (BR-U-01)
  - [ ] bcrypt cost factor 12로 해시 저장 (BR-U-04)
  - [ ] 로그인 시 이메일 미존재에도 bcrypt.compare 수행 (타이밍 공격 방지)
  - [ ] Access Token(HS256, 30분) + Refresh Token(HS256, 7일) 생성
  - [ ] refresh — httpOnly 쿠키 Refresh Token 검증 → 새 Access Token 반환
- **의존성**:
  - [ ] BE-02, DB-04 완료

---

### BE-05: 인증 Controller/Route 구현
- **설명**: 인증 4개 엔드포인트 구현 (register, login, logout, refresh)
- **산출물**: `backend/src/controllers/authController.js`, `backend/src/routes/authRoutes.js`
- **완료 조건**:
  - [ ] POST /api/auth/register → 201, `{ user: { id, email, created_at } }`
  - [ ] POST /api/auth/login → 200, Access Token(body) + Refresh Token(httpOnly Cookie)
  - [ ] POST /api/auth/logout → 200, Refresh Token 쿠키 만료 처리
  - [ ] POST /api/auth/refresh → 200, 새 Access Token 반환
  - [ ] 비밀번호 규칙(8~20자, 대/소/숫자/특수문자) validate 미들웨어 검증 → 400
  - [ ] 로그인 실패 → 401 (이메일/비밀번호 동일 메시지)
- **의존성**:
  - [ ] BE-03, BE-04 완료

---

### BE-06: 할일 Query 구현
- **설명**: todos 테이블 모든 CRUD 쿼리 함수 (소유권 검증 WHERE user_id 포함)
- **산출물**: `backend/src/queries/todoQueries.js`
- **완료 조건**:
  - [ ] createTodo(userId, data) — 파라미터 바인딩
  - [ ] findTodoById(todoId, userId) — user_id 조건 포함 (BR-U-03)
  - [ ] findTodos(userId, filters) — status 필터, sort_by, order, page, limit 지원
  - [ ] updateTodo(todoId, userId, data)
  - [ ] deleteTodo(todoId, userId)
  - [ ] completeTodo(todoId, userId, completedAt) — BR-T-03
  - [ ] uncompleteTodo(todoId, userId) — completed_at NULL (BR-T-04)
  - [ ] 동적 정렬 화이트리스트 방식 적용 (SQL Injection 방지)
- **의존성**:
  - [ ] DB-05 완료

---

### BE-07: 할일 Service 구현
- **설명**: 할일 비즈니스 규칙 적용, 상태 산출 통합, 소유권 검증
- **산출물**: `backend/src/services/todoService.js`
- **완료 조건**:
  - [ ] 생성/수정 시 end_date >= start_date 검증 → AppError(400) (BR-T-02)
  - [ ] 소유권 미일치 또는 미존재 → AppError(404) (BR-U-03)
  - [ ] 모든 조회 응답에 `todoStatus.calculateStatus()` 결과 status 필드 포함
  - [ ] 이미 완료된 항목 재완료 → AppError(409)
  - [ ] 미완료 항목 완료 해제 → AppError(409)
- **의존성**:
  - [ ] BE-02, BE-06 완료

---

### BE-08: 할일 Controller/Route 구현
- **설명**: 할일 관련 9개 엔드포인트 + 통계 1개 구현, 인증 미들웨어 적용
- **산출물**: `backend/src/controllers/todoController.js`, `backend/src/routes/todoRoutes.js`
- **완료 조건**:
  - [ ] 모든 `/api/todos` 엔드포인트에 authenticate 미들웨어 적용
  - [ ] POST /api/todos → 201, 생성된 todo(status 포함)
  - [ ] GET /api/todos → 200, `{ data: [...], pagination: { total, page, limit, totalPages } }`
  - [ ] GET /api/todos/statistics 라우트가 /api/todos/:id 보다 먼저 등록
  - [ ] GET /api/todos/:id → 200, 단일 todo(status 포함)
  - [ ] PUT /api/todos/:id → 200, 수정된 todo
  - [ ] DELETE /api/todos/:id → 204
  - [ ] PATCH /api/todos/:id/complete → 200
  - [ ] PATCH /api/todos/:id/uncomplete → 200
  - [ ] 기본값: page=1, limit=20, sort_by=created_at, order=desc
- **의존성**:
  - [ ] BE-03, BE-07 완료

---

### BE-09: 통계 Service/엔드포인트 구현
- **설명**: 로그인 사용자의 할일 통계 집계 (5가지 지표)
- **산출물**: `backend/src/queries/statsQueries.js`, `backend/src/services/statsService.js`
- **완료 조건**:
  - [ ] GET /api/todos/statistics → 200 반환:
    - [ ] `total`: 전체 건수
    - [ ] `by_status`: 5가지 상태별 건수
    - [ ] `completion_rate`: 완료율 (%)
    - [ ] `on_time_rate`: 기간 내 완료율 (%)
    - [ ] `overdue_count`: OVERDUE + COMPLETED_LATE 건수
  - [ ] 할일 0건 사용자 → 모든 값 0 (나누기 0 방지)
  - [ ] 상태 산출 기준이 todoStatus.calculateStatus와 동일
- **의존성**:
  - [ ] BE-02, BE-06 완료

---

### BE-10: 통합 테스트
- **설명**: 전체 API 엔드포인트 통합 테스트, 비즈니스 규칙 위반 케이스 포함
- **산출물**: `backend/tests/auth.test.js`, `backend/tests/todos.test.js`, `backend/tests/statistics.test.js`
- **완료 조건**:
  - [ ] 인증 4개 엔드포인트 정상/에러 케이스 테스트
  - [ ] 할일 CRUD 9개 엔드포인트 정상 흐름 테스트
  - [ ] BR-U-01, BR-U-03, BR-T-01~05 각 규칙 위반 케이스 포함
  - [ ] 타인 할일 접근 → 404 테스트
  - [ ] CRUD P95 300ms 이내, 목록 조회 P95 500ms 이내
  - [ ] `npm test` 전체 통과
- **의존성**:
  - [ ] BE-05, BE-08, BE-09 완료

---

### BE-11: 보안 강화 및 운영 설정
- **설명**: Rate limiting, 헬스체크, 요청 바디 크기 제한, graceful shutdown
- **산출물**: `backend/src/middlewares/rateLimiter.js`, `backend/src/routes/healthRoutes.js`
- **완료 조건**:
  - [ ] 인증 엔드포인트 분당 20회, 일반 API 분당 200회 제한
  - [ ] Rate limit 초과 시 429 응답
  - [ ] GET /api/health → 200, `{ status: "ok", db: "connected" }`
  - [ ] express.json 바디 크기 10kb 제한
  - [ ] 프로세스 종료 시 pg Pool graceful shutdown
- **의존성**:
  - [ ] BE-05, BE-08 완료

---

### BE-12: API 문서화 및 최종 검증
- **설명**: API 응답 예시 정리, 에러 코드 목록 정리, 최종 통합 동작 검증
- **산출물**: `backend/README.md`
- **완료 조건**:
  - [ ] 전체 12개 엔드포인트 정상 동작 확인
  - [ ] 에러 코드 목록 (400, 401, 404, 409, 423, 429) 정리
  - [ ] 환경 설정 가이드 포함
- **의존성**:
  - [ ] BE-10, BE-11 완료

---

## 프론트엔드 (FE-01 ~ FE-23)

### FE-01: Vite + React 19 + TypeScript 프로젝트 초기화
- **설명**: 프로젝트 생성, 경로 별칭(@/*), tsconfig strict 모드 설정
- **산출물**: `frontend/vite.config.ts`, `frontend/tsconfig.json`, `frontend/package.json`
- **완료 조건**:
  - [ ] `npm run dev` 정상 기동
  - [ ] `@/*` 경로 별칭 → `src/*` 해석
  - [ ] TypeScript strict 모드 활성화
  - [ ] `npm run build` 에러 없이 완료
- **의존성**:
  - [ ] 없음 (독립 실행 가능)

---

### FE-02: 패키지 설치 및 디렉토리 구조 생성
- **설명**: Zustand, TanStack Query, axios, React Router 설치, 기능 기반 디렉토리 골격 생성
- **산출물**: `frontend/package.json` 업데이트, `frontend/src/` 하위 디렉토리
- **완료 조건**:
  - [ ] zustand, @tanstack/react-query, axios, react-router-dom 설치
  - [ ] app/, features/auth/, features/todos/, shared/, stores/, api/, types/, styles/ 생성
- **의존성**:
  - [ ] FE-01 완료

---

### FE-03: 글로벌 스타일 및 CSS 변수 설정
- **설명**: 반응형 브레이크포인트, 색상 팔레트, 타이포그래피 CSS 커스텀 프로퍼티 정의
- **산출물**: `frontend/src/styles/global.css`, `frontend/src/styles/variables.css`, `frontend/src/styles/reset.css`
- **완료 조건**:
  - [ ] CSS 변수: primary, neutral, danger, success 색상 정의
  - [ ] 반응형 브레이크포인트: 360px / 768px / 1280px
  - [ ] 브라우저 기본 스타일 초기화 적용
- **의존성**:
  - [ ] FE-02 완료

---

### FE-04: TypeScript 공용 타입 정의
- **설명**: Todo, TodoStatus, ApiResponse, AuthUser 등 프로젝트 전반 타입 정의
- **산출물**: `frontend/src/types/auth.ts`, `frontend/src/types/todo.ts`, `frontend/src/types/api.ts`
- **완료 조건**:
  - [ ] `Todo` 인터페이스 — 전체 필드 + status
  - [ ] `TodoStatus` — 5종 유니온 리터럴 타입
  - [ ] `TodoListParams` — status, sort_by, order, page, limit
  - [ ] `ApiResponse<T>`, `PaginatedResponse<T>` 제네릭 타입
  - [ ] `AuthUser`, `LoginCredentials`, `RegisterCredentials` 타입
- **의존성**:
  - [ ] FE-02 완료

---

### FE-05: axios 인스턴스 및 Silent Refresh 인터셉터
- **설명**: axios 기본 설정, Authorization 헤더 주입, 401 시 토큰 갱신 + 요청 재시도
- **산출물**: `frontend/src/api/axiosInstance.ts`, `frontend/src/api/interceptors.ts`
- **완료 조건**:
  - [ ] baseURL = VITE_API_BASE_URL 환경변수 반영
  - [ ] 요청 인터셉터: authStore에서 accessToken 읽어 헤더 추가
  - [ ] 401 수신 시 /api/auth/refresh 호출 → 원래 요청 재시도
  - [ ] 갱신 중 동시 401 요청 큐잉 처리
  - [ ] refresh 실패 시 authStore 초기화 → `/login` 리다이렉트
  - [ ] withCredentials: true (httpOnly 쿠키 전송)
- **의존성**:
  - [ ] FE-04 완료

---

### FE-06: API 함수 모듈 작성
- **설명**: auth, todos 도메인별 타입 지정된 API 호출 함수
- **산출물**: `frontend/src/api/auth.api.ts`, `frontend/src/api/todos.api.ts`
- **완료 조건**:
  - [ ] authApi: register, login, logout, refresh
  - [ ] todosApi: createTodo, getTodos, getTodoById, updateTodo, deleteTodo, completeTodo, uncompleteTodo, getStatistics
  - [ ] 모든 함수 TypeScript 반환 타입 명시
- **의존성**:
  - [ ] FE-05 완료

---

### FE-07: Zustand authStore 구현
- **설명**: Access Token(메모리), 사용자 정보, 로그인 상태 관리 스토어
- **산출물**: `frontend/src/stores/authStore.ts`
- **완료 조건**:
  - [ ] accessToken, user, isAuthenticated 상태 정의
  - [ ] setToken, setUser, clearAuth 액션 구현
  - [ ] accessToken은 메모리에만 저장 (localStorage 사용 금지)
- **의존성**:
  - [ ] FE-04 완료

---

### FE-08: TanStack Query 설정 및 QueryClient
- **설명**: QueryClient 생성, staleTime/retry 정책, QueryClientProvider 적용
- **산출물**: `frontend/src/app/queryClient.ts`, `frontend/src/app/App.tsx`
- **완료 조건**:
  - [ ] staleTime 5분, retry 1회 설정
  - [ ] 401 에러 시 retry 비활성화
  - [ ] QueryClientProvider 최상위 래핑
  - [ ] 개발 환경에서만 React Query Devtools 렌더링
- **의존성**:
  - [ ] FE-07 완료

---

### FE-09: React Router 및 보호 라우트
- **설명**: 라우트 정의, 인증 여부 기반 접근 제어, ProtectedRoute 컴포넌트
- **산출물**: `frontend/src/app/Router.tsx`, `frontend/src/app/ProtectedRoute.tsx`
- **완료 조건**:
  - [ ] /login, /register → 비인증 사용자만
  - [ ] /, /todos/:id, /todos/new, /todos/:id/edit, /statistics → 인증 사용자만
  - [ ] 미인증 → /login 리다이렉트
  - [ ] 인증 상태에서 /login → / 리다이렉트
- **의존성**:
  - [ ] FE-07 완료

---

### FE-10: 공용 Button 컴포넌트
- **설명**: variant(primary/secondary/danger/ghost), size, loading 상태 지원
- **산출물**: `frontend/src/shared/Button/Button.tsx`, `Button.module.css`
- **완료 조건**:
  - [ ] variant 4종 + size 3종 구현
  - [ ] isLoading 시 스피너 + 비활성화
  - [ ] 키보드 접근성 (Tab, Enter, Space)
- **의존성**:
  - [ ] FE-03 완료

---

### FE-11: 공용 Input/Textarea 컴포넌트
- **설명**: label, 에러 메시지, 필수 표시, ref 전달 지원 폼 입력 컴포넌트
- **산출물**: `frontend/src/shared/Input/Input.tsx`, `Textarea.tsx`, `Input.module.css`
- **완료 조건**:
  - [ ] label, errorMessage, helperText, required prop 지원
  - [ ] React.forwardRef 구현
  - [ ] Textarea maxLength + 글자 수 카운터
  - [ ] 모바일 최소 44px 터치 타겟
- **의존성**:
  - [ ] FE-03 완료

---

### FE-12: 공용 Dialog(모달) 컴포넌트
- **설명**: Portal 기반 확인/취소 다이얼로그 (완료 처리, 삭제 확인용)
- **산출물**: `frontend/src/shared/Dialog/Dialog.tsx`, `ConfirmDialog.tsx`, `Dialog.module.css`
- **완료 조건**:
  - [ ] createPortal로 body에 렌더링
  - [ ] ESC 키 닫힘, body 스크롤 잠금
  - [ ] ConfirmDialog: title, description, confirmLabel, onConfirm, onCancel
  - [ ] ARIA role="dialog", aria-modal="true"
  - [ ] 포커스 트랩 구현
- **의존성**:
  - [ ] FE-10 완료

---

### FE-13: 공용 Toast 알림 컴포넌트
- **설명**: success/error/warning/info Toast 시스템, Zustand 기반 전역 호출
- **산출물**: `frontend/src/shared/Toast/Toast.tsx`, `ToastContainer.tsx`, `frontend/src/stores/toastStore.ts`
- **완료 조건**:
  - [ ] variant 4종, 기본 3초 auto-dismiss
  - [ ] toastStore.showToast(message, variant) 전역 호출
  - [ ] 여러 토스트 스택 표시
  - [ ] ToastContainer가 App.tsx에 등록
- **의존성**:
  - [ ] FE-07, FE-10 완료

---

### FE-14: 공용 LoadingSpinner/EmptyState 컴포넌트
- **설명**: 로딩 스피너(size별), 빈 목록 상태 안내 컴포넌트
- **산출물**: `frontend/src/shared/LoadingSpinner/`, `frontend/src/shared/EmptyState/`
- **완료 조건**:
  - [ ] LoadingSpinner size prop (sm/md/lg)
  - [ ] EmptyState: icon, title, description, action prop
  - [ ] prefers-reduced-motion 미디어 쿼리 적용
- **의존성**:
  - [ ] FE-03 완료

---

### FE-15: 로그인 화면 (SCR-01)
- **설명**: 이메일/비밀번호 폼, 로그인 API 호출, 계정 잠금(423) 안내, 회원가입 링크
- **산출물**: `frontend/src/features/auth/pages/LoginPage.tsx`, `LoginForm.tsx`, `useLogin.ts`
- **완료 조건**:
  - [ ] 이메일 형식 클라이언트 검증
  - [ ] 로그인 성공 → authStore 저장 + / 이동
  - [ ] 401 실패 → Toast 에러 표시
  - [ ] 423 잠금 → 잠금 안내 메시지 표시
  - [ ] 제출 중 로딩 상태 (중복 제출 방지)
  - [ ] 반응형 레이아웃 (360px ~ 1280px+)
- **의존성**:
  - [ ] FE-06, FE-07, FE-09, FE-11, FE-13 완료

---

### FE-16: 회원가입 화면 (SCR-02)
- **설명**: 이메일/비밀번호/비밀번호 확인, 비밀번호 정책 실시간 체크, 이메일 인증 안내
- **산출물**: `frontend/src/features/auth/pages/RegisterPage.tsx`, `RegisterForm.tsx`, `useRegister.ts`
- **완료 조건**:
  - [ ] 비밀번호 정책 정규식: 8~20자, 대/소/숫자/특수문자 각 1자 이상
  - [ ] 비밀번호 불일치 → "비밀번호가 일치하지 않습니다" 표시
  - [ ] 실시간 정책 충족 체크리스트 UI
  - [ ] 409 중복 → 이메일 필드 에러 표시
  - [ ] 성공 → 이메일 인증 안내 화면 전환
- **의존성**:
  - [ ] FE-06, FE-09, FE-11, FE-13 완료

---

### FE-17: 할일 목록 TanStack Query 훅
- **설명**: 목록 조회 훅 + 필터/정렬/페이지 URL 파라미터 동기화
- **산출물**: `frontend/src/features/todos/hooks/useTodoList.ts`, `useTodoFilters.ts`
- **완료 조건**:
  - [ ] useTodoList — TodoListParams 기반 useQuery
  - [ ] 필터/정렬/페이지 변경 → 쿼리 키 변경 → 자동 재조회
  - [ ] useTodoFilters — URL searchParams 양방향 동기화
  - [ ] 로딩/에러/빈 목록 상태 구분 반환
- **의존성**:
  - [ ] FE-06, FE-08 완료

---

### FE-18: 메인 목록 화면 (SCR-03)
- **설명**: 할일 목록, 상태 필터(5종+전체), 정렬, 페이지네이션, 체크박스 완료/해제, 로그아웃
- **산출물**: `frontend/src/features/todos/pages/TodoListPage.tsx`, `TodoListItem.tsx`, `TodoFilterBar.tsx`, `TodoSortControl.tsx`, `TodoPagination.tsx`
- **완료 조건**:
  - [ ] 상태 필터 탭/버튼 (5종 + 전체)
  - [ ] 정렬 기준(4종) × 방향(2종) 선택
  - [ ] 페이지네이션 20건 단위, 하단 컨트롤
  - [ ] 체크박스 완료/해제 → 목록 즉시 갱신
  - [ ] 목록 행 클릭 → SCR-05 이동
  - [ ] 등록 버튼 → SCR-04 이동
  - [ ] 로그아웃 → authStore 초기화 + /login
  - [ ] 빈 목록 → EmptyState 표시
  - [ ] 반응형 레이아웃
- **의존성**:
  - [ ] FE-12, FE-13, FE-14, FE-17 완료

---

### FE-19: 할일 등록 화면 (SCR-04)
- **설명**: 제목/설명/시작일/종료일 폼, TodoForm 재사용 컴포넌트
- **산출물**: `frontend/src/features/todos/pages/TodoCreatePage.tsx`, `TodoForm.tsx`, `useTodoCreate.ts`
- **완료 조건**:
  - [ ] 제목 필수, 200자 제한 + 글자 수 표시
  - [ ] 설명 2000자 제한
  - [ ] 종료일 < 시작일 → 유효성 에러
  - [ ] 성공 → Toast + SCR-03 이동 + 캐시 무효화
  - [ ] 취소 → 이전 화면 이동
- **의존성**:
  - [ ] FE-06, FE-08, FE-11, FE-13 완료

---

### FE-20: 할일 상세 화면 (SCR-05)
- **설명**: 상세 정보, 완료 처리/해제(확인 다이얼로그), 삭제(확인 다이얼로그), 수정 진입
- **산출물**: `frontend/src/features/todos/pages/TodoDetailPage.tsx`, `useTodoDetail.ts`, `useTodoDelete.ts`
- **완료 조건**:
  - [ ] URL :id로 상세 조회
  - [ ] 완료/해제 → 확인 다이얼로그 → PATCH API → 화면 갱신
  - [ ] 삭제 → 확인 다이얼로그 → DELETE API → SCR-03 이동
  - [ ] 수정 버튼 → SCR-06 이동
  - [ ] 404 응답 → 에러 처리 또는 목록 리다이렉트
  - [ ] 작업 후 관련 캐시 무효화
- **의존성**:
  - [ ] FE-06, FE-08, FE-12, FE-13 완료

---

### FE-21: 할일 수정 화면 (SCR-06)
- **설명**: 기존 데이터 프리필, TodoForm 재사용, 수정 후 저장
- **산출물**: `frontend/src/features/todos/pages/TodoEditPage.tsx`, `useTodoUpdate.ts`
- **완료 조건**:
  - [ ] URL :id로 기존 데이터 조회 → 폼 프리필
  - [ ] TodoForm 재사용 (등록/수정 모드 동일)
  - [ ] 성공 → Toast + SCR-05 이동 + 캐시 무효화
  - [ ] 취소 → SCR-05 이동
- **의존성**:
  - [ ] FE-19, FE-20 완료

---

### FE-22: 통계 TanStack Query 훅
- **설명**: GET /api/todos/statistics 호출 커스텀 훅
- **산출물**: `frontend/src/features/todos/hooks/useTodoStatistics.ts`, `frontend/src/types/statistics.ts`
- **완료 조건**:
  - [ ] TodoStatistics 타입 정의 (전체/상태별/완료율/기간내완료율/기간초과)
  - [ ] useTodoStatistics — useQuery, staleTime 1분
  - [ ] 로딩/에러 상태 반환
- **의존성**:
  - [ ] FE-06, FE-08 완료

---

### FE-23: 통계 화면 (SCR-07)
- **설명**: 5가지 지표 카드 표시, 상태 카드 클릭 시 SCR-03 필터 이동
- **산출물**: `frontend/src/features/todos/pages/StatisticsPage.tsx`, `StatCard.tsx`
- **완료 조건**:
  - [ ] 전체 건수, 상태별 5종, 완료율(%), 기간 내 완료율(%), 기간 초과 건수 표시
  - [ ] 상태 카드 클릭 → SCR-03 (status 쿼리 파라미터 포함) 이동
  - [ ] 완료율 progress bar 시각화
  - [ ] 반응형 그리드 (모바일 1열, 태블릿 2열, 데스크탑 3열)
  - [ ] 데이터 로딩 중 스켈레톤 카드 표시
- **의존성**:
  - [ ] FE-14, FE-22 완료

---

## 전체 의존성 맵

```
DB:  01 → 02 → 03 → 04 → 05 → 06 → 08
                               └→ 07   └→ 09
                               └→ 08   └→ 10

BE:  01 → 02 → 03 → 04 → 05
               └→ 06 → 07 → 08 → 10 → 12
               └→ 09 ──────────┘  └→ 11

FE:  01 → 02 → 03 → 10 → 12
               │    └→ 11   └→ 18
               │    └→ 14   └→ 23
               ├→ 04 → 05 → 06 → 15, 16, 17 → 18
               │  └→ 07 → 08 → 09             └→ 19 → 21
               │       └→ 13                   └→ 20 ┘
               └→ 22 → 23
```

> 총 Task: DB 10건 + BE 12건 + FE 23건 = **45건**
