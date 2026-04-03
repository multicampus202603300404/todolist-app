# TodoList App

AI 기반 개발 관리자를 위한 TODO 관리 시스템. Claude Code 서브에이전트를 활용하여 설계부터 구현까지 전체 개발 라이프사이클을 실습한 프로젝트입니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React 19 + TypeScript + Vite |
| 상태 관리 | Zustand + TanStack Query |
| 백엔드 | Node.js + Express.js |
| 데이터베이스 | PostgreSQL |
| 인증 | JWT (HS256) + bcryptjs + HttpOnly Cookie |
| API 문서 | Swagger UI (OpenAPI 3.0.3) |
| 테스트 | Jest (56개 테스트) |

## 주요 기능

- 회원가입 / 로그인 / 토큰 자동 갱신 (Silent Refresh)
- 할일 CRUD (생성 / 조회 / 수정 / 삭제)
- 5가지 상태 관리 (대기 / 진행 중 / 완료 / 지연 / 취소)
- 필터링 및 정렬 (상태, 마감일 기준)
- 페이지네이션
- 통계 대시보드
- 다크 모드
- 다국어 지원 (한국어 / 영어 / 일본어 / 중국어)

## 프로젝트 구조

```
todolist-app/
├── backend/                # Express.js 백엔드
│   └── src/
│       ├── routes/         # API 라우팅
│       ├── controllers/    # 요청 처리
│       ├── services/       # 비즈니스 로직
│       ├── queries/        # DB 쿼리
│       ├── middlewares/    # 인증, 검증, 에러 처리
│       ├── migrations/     # SQL 마이그레이션
│       └── utils/          # 공통 유틸리티
├── frontend/               # React + TypeScript 프론트엔드
│   └── src/
│       ├── features/       # 기능별 모듈 (auth, todos)
│       ├── shared/         # 공용 컴포넌트
│       ├── stores/         # Zustand 상태
│       ├── api/            # Axios API 클라이언트
│       ├── i18n/           # 다국어 번역 파일
│       └── types/          # TypeScript 타입 정의
├── docs/                   # 설계 문서 (ERD, 아키텍처, 와이어프레임 등)
├── swagger/                # OpenAPI 스펙
└── test/                   # E2E 테스트 결과
```

## 시작하기

### 사전 요구사항

- Node.js 18+
- PostgreSQL 14+

### 환경변수 설정

**backend/.env**
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/todolist
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_ACCESS_EXPIRES_IN=30m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_COST_FACTOR=12
CORS_ORIGIN=http://localhost:5173
```

**frontend/.env**
```env
VITE_API_BASE_URL=http://localhost:4000
```

### 설치 및 실행

**백엔드**
```bash
cd backend
npm install

# DB 마이그레이션
npm run migrate

# (선택) 테스트 데이터 삽입
npm run seed

# 개발 서버 시작
npm run dev
```

**프론트엔드**
```bash
cd frontend
npm install
npm run dev
```

백엔드: http://localhost:4000  
프론트엔드: http://localhost:5173  
Swagger UI: http://localhost:4000/api-docs

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /api/auth/register | 회원가입 |
| POST | /api/auth/login | 로그인 |
| POST | /api/auth/refresh | 토큰 갱신 |
| POST | /api/auth/logout | 로그아웃 |
| GET | /api/todos | 할일 목록 조회 |
| POST | /api/todos | 할일 생성 |
| GET | /api/todos/:id | 할일 상세 조회 |
| PATCH | /api/todos/:id | 할일 수정 |
| DELETE | /api/todos/:id | 할일 삭제 |
| PATCH | /api/todos/:id/complete | 할일 완료 처리 |
| GET | /api/todos/statistics | 통계 조회 |
| GET | /health | 헬스 체크 |

## 테스트 실행

```bash
cd backend
npm test
```

56개 테스트 케이스 포함 (인증, 할일 CRUD, 통계, 미들웨어)

## 아키텍처

### 백엔드 (Clean Architecture)

```
Routes → Controllers → Services → Queries → PostgreSQL
```

- 계층별 책임 분리
- 미들웨어 기반 횡단 관심사 처리 (인증, Rate Limiting, 에러 처리)

### 프론트엔드 (Feature-Based)

- Feature 단위 폴더 구조 (`features/auth`, `features/todos`)
- TanStack Query로 서버 상태 관리
- Zustand로 클라이언트 상태 관리 (인증, 테마, 언어, 토스트)

### 인증 플로우

- Access Token (30분): 메모리 저장
- Refresh Token (7일): HttpOnly Cookie
- 401 응답 시 Axios 인터셉터가 자동으로 토큰 갱신 후 재요청
