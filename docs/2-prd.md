# PRD: todolist-app

> 버전: 1.0.0
> 작성일: 2026-03-31
> 작성자: Business Analyst
> 참조 문서: `docs/1-domain-definition.md` (v1.1.0)

### 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0.0 | 2026-03-31 | 최초 작성 |
| 1.1.0 | 2026-04-01 | 비밀번호 복잡도/길이 규칙 강화 / JWT 인증 방식 상세 명세 추가 |
| 1.2.0 | 2026-04-01 | 시나리오 교차 검토 반영 — 비밀번호 확인 필드 추가 / 완료 처리 다이얼로그 명세 / OVERDUE 경고 분기 추가 / F-T-07 완료 해제 범위 명확화 / 통계 필터 연동 추가 / 네비게이션 흐름 보완 |

---

## 1. 문서 정보

### 문서 목적

본 PRD(Product Requirements Document)는 `todolist-app`의 제품 요구사항을 정의하며, 개발팀, 디자인팀, QA팀 등 모든 이해관계자가 동일한 기준으로 제품을 구현하고 검증하기 위한 기준 문서다.

### 참조 문서

| 문서명 | 경로 | 버전 |
|--------|------|------|
| 도메인 정의서 | `docs/1-domain-definition.md` | v1.1.0 |

---

## 2. 제품 개요

### 제품 목적

`todolist-app`은 인증된 개인 사용자가 자신만의 할일을 체계적으로 등록, 관리, 추적할 수 있는 개인 맞춤형 할일 관리 웹 애플리케이션이다.

시작일과 종료일을 기반으로 할일의 상태를 자동 산출하고, 완료율 통계를 통해 사용자가 스스로 목표 달성 현황을 파악할 수 있도록 지원한다.

### 핵심 가치

| 가치 | 설명 |
|------|------|
| 개인화 | 회원 인증 기반으로 나만의 할일 공간을 보장한다 |
| 시간 기반 관리 | 시작일과 종료일을 필수로 지정하여 모든 할일에 명확한 기간을 부여한다 |
| 현황 가시성 | 5가지 상태 자동 산출 및 통계로 할일 진행 현황을 한눈에 파악한다 |

### 목표 사용자 (Target Persona)

- 대상: 10대부터 50대까지 디지털 기기를 사용하는 일반 사용자 전체
- 사용 환경: 모바일 웹 및 데스크탑 웹
- 사용 목적: 개인 일정 및 할일의 체계적 등록, 추적, 완료 관리

### KPI (핵심 성공 지표)

| 지표 | 목표값 | 측정 방법 |
|------|--------|----------|
| 할일 완료율 | 100% | 전체 등록 할일 대비 완료(COMPLETED_ON_TIME + COMPLETED_LATE) 비율 |
| 등록 사용자 수 | 10만 명 | DB User 테이블 누적 row 수 |
| 동시접속 지원 규모 | 500명 | 서버 부하 테스트 기준 |

---

## 3. 범위 (Scope)

### MVP 포함 기능

| 영역 | 기능 |
|------|------|
| 인증 | 회원가입, 로그인, 로그아웃 |
| 할일 관리 | 등록, 목록 조회, 상세 조회, 수정, 삭제, 완료 처리, 완료 해제 |
| 조회/분석 | 상태별 필터링, 정렬 기준 적용, 통계 조회 |
| 플랫폼 | 반응형 웹 (모바일 웹 + 데스크탑 웹) |
| 보안 | JWT 기반 인증, bcrypt 비밀번호 해시, HTTPS 필수 |
| TBD 결정 항목 | 계정 잠금 정책(TBD-01), 이메일 인증(TBD-02), 페이지네이션(TBD-03) — 3항목 모두 MVP에 포함 (상세 내용은 10절 참조) |

### MVP 제외 기능 (향후 검토)

| 기능 | 제외 사유 |
|------|----------|
| 할일 공유 / 협업 | 현재 단일 사용자 개인화 모델로 설계됨 |
| 알림 / 푸시 | 초기 MVP 범위 외, 추후 단계에서 검토 |
| 외부 서비스 연동 (캘린더, Slack 등) | 초기 MVP 범위 외 |
| 파일 첨부 | 초기 MVP 범위 외 |
| 네이티브 앱 (iOS / Android) | 반응형 웹으로 대체 |
| 다국어 지원 | 초기 한국어 단일 언어로 출시 |

---

## 4. 기능 요구사항

> 도메인 정의서(v1.1.0)의 엔티티 정의, 비즈니스 규칙, 유스케이스를 기준으로 화면별 기능을 명세한다.

### 4.1 로그인 화면 (Screen: Login)

**진입 조건**: 비인증 상태의 사용자

| 기능 ID | 기능명 | 상세 설명 | 참조 |
|---------|--------|----------|------|
| F-A-01 | 로그인 | 이메일 + 비밀번호 입력 후 인증 처리. 성공 시 JWT 액세스 토큰(30분) + Refresh Token(7일) 발급. 실패 시 에러 메시지 표시 | UC-A-02, NFR-S-02 |
| F-A-02 | 회원가입 이동 | 회원가입 화면으로 이동하는 링크 제공 | UC-A-01 |
| F-A-03 | 계정 잠금 안내 | 로그인 실패 5회 시 계정 잠금 처리 및 안내 메시지 표시 (TBD-01 결정 사항) | TBD-01 |

### 4.2 회원가입 화면 (Screen: Register)

**진입 조건**: 비인증 상태의 사용자

| 기능 ID | 기능명 | 상세 설명 | 참조 |
|---------|--------|----------|------|
| F-A-04 | 회원가입 | 이메일 + 비밀번호 + 비밀번호 확인 입력 → 비밀번호 확인 일치 검증(클라이언트) → 이메일 중복 확인 → 비밀번호 정책 검증 → 계정 생성. 비밀번호 확인 필드는 서버로 전송하지 않으며 클라이언트에서만 검증한다 | UC-A-01, BR-U-01, BR-U-04 |
| F-A-05 | 이메일 인증 | 가입 후 인증 이메일 발송. 이메일 내 링크 클릭으로 인증 완료 (TBD-02 결정 사항) | TBD-02 |
| F-A-06 | 로그인 이동 | 로그인 화면으로 이동하는 링크 제공 | UC-A-02 |

**입력 항목 및 유효성 검증**

| 항목 | 유효성 규칙 | 오류 메시지 |
|------|------------|-----------|
| 이메일 | RFC 5321 형식, 시스템 내 고유값 | "올바른 이메일 형식을 입력해주세요" / "이미 사용 중인 이메일입니다" |
| 비밀번호 | 최소 8자 이상 최대 20자 이하, 영문 대문자 1자 이상, 영문 소문자 1자 이상, 숫자 1자 이상, 특수문자 1자 이상 (`!@#$%^&*`) | "비밀번호는 8~20자이며 대문자, 소문자, 숫자, 특수문자를 각각 1자 이상 포함해야 합니다" |
| 비밀번호 확인 | 비밀번호 필드와 동일한 값 (클라이언트 측 검증, 서버 미전송) | "비밀번호가 일치하지 않습니다" |

### 4.3 메인 목록 화면 (Screen: Todo List)

**진입 조건**: 인증된 사용자

| 기능 ID | 기능명 | 상세 설명 | 참조 |
|---------|--------|----------|------|
| F-T-01 | 할일 목록 조회 | 로그인한 사용자의 할일만 표시. 각 항목에 제목, 시작일, 종료일, 상태 표시 | UC-T-02, BR-U-03 |
| F-T-02 | 상태 필터링 | 5가지 상태(UPCOMING / IN_PROGRESS / OVERDUE / COMPLETED_ON_TIME / COMPLETED_LATE) 기준 필터링. 전체 보기 포함 | UC-Q-01 |
| F-T-03 | 정렬 | 정렬 기준(종료일 / 시작일 / 등록일 / 제목) + 방향(오름차순 / 내림차순) 선택 | UC-Q-02 |
| F-T-04 | 페이지네이션 | 목록 페이지 단위 분할 표시. Offset 방식 적용 (TBD-03 결정 사항) | TBD-03 |
| F-T-05 | 할일 등록 진입 | 새 할일 등록 폼 진입 버튼 제공 | UC-T-01 |
| F-T-06 | 할일 상세 진입 | 목록 항목 클릭 시 해당 할일 상세 화면으로 이동 | UC-T-03 |
| F-T-07 | 빠른 완료 처리/해제 | 목록에서 체크박스를 통해 완료 처리 및 완료 해제 모두 가능. 완료 해제 시 "이 할일의 완료를 취소하시겠습니까?" 간단한 확인 메시지 표시. API 호출 실패 시 체크박스를 이전 상태로 롤백하고 오류 토스트 표시 | UC-T-06, UC-T-07, BR-T-03, BR-T-04 |
| F-T-08 | 로그아웃 | Refresh Token 무효화 후 로그인 화면으로 이동 | UC-A-03 |

**할일 상태 표시 기준** (도메인 정의서 4절 참조)

| 상태 코드 | 표시 레이블 | 판별 조건 |
|-----------|------------|----------|
| UPCOMING | 시작 전 | is_completed=false AND TODAY < start_date |
| IN_PROGRESS | 진행 중 | is_completed=false AND start_date <= TODAY <= end_date |
| OVERDUE | 종료됨 | is_completed=false AND TODAY > end_date |
| COMPLETED_ON_TIME | 기간 내 완료 | is_completed=true AND completed_at <= end_date |
| COMPLETED_LATE | 기간 초과 완료 | is_completed=true AND completed_at > end_date |

### 4.4 할일 등록/수정 화면 (Screen: Todo Form)

**진입 조건**: 인증된 사용자

| 기능 ID | 기능명 | 상세 설명 | 참조 |
|---------|--------|----------|------|
| F-T-09 | 할일 등록 | 제목(필수), 설명(선택), 시작일(필수), 종료일(필수) 입력 후 저장 | UC-T-01, BR-T-01, BR-T-02 |
| F-T-10 | 할일 수정 | 수정 가능 항목(title, description, start_date, end_date, is_completed) 편집 후 저장 | UC-T-04 |

**입력 항목 및 유효성 검증**

| 항목 | 필수 여부 | 유효성 규칙 | 오류 메시지 |
|------|----------|------------|-----------|
| title | 필수 | 최대 200자 | "제목은 필수이며 200자 이하여야 합니다" |
| description | 선택 | 최대 2000자 | "설명은 2000자 이하여야 합니다" |
| start_date | 필수 | 유효한 날짜 형식 | "시작일과 종료일은 필수 항목입니다" |
| end_date | 필수 | 유효한 날짜 형식, end_date >= start_date | "종료일은 시작일 이후여야 합니다" |

### 4.5 할일 상세 화면 (Screen: Todo Detail)

**진입 조건**: 인증된 사용자, 본인 소유의 할일

| 기능 ID | 기능명 | 상세 설명 | 참조 |
|---------|--------|----------|------|
| F-T-11 | 할일 상세 조회 | 제목, 설명, 시작일, 종료일, 현재 상태, 완료 일시(완료 시) 표시 | UC-T-03 |
| F-T-12 | 수정 진입 | 할일 수정 폼으로 이동 | UC-T-04 |
| F-T-13 | 완료 처리 | 확인 다이얼로그 표시 후 확인 시 is_completed=true 처리, completed_at 자동 기록. 취소 시 현재 화면 유지. **OVERDUE 상태 할일의 경우** "마감일이 지난 항목입니다" 경고 문구를 다이얼로그에 추가 표시 | UC-T-06, BR-T-03 |
| F-T-14 | 완료 해제 | 확인 다이얼로그 표시 후 확인 시 is_completed=false 처리, completed_at null 초기화. 취소 시 현재 화면 유지 | UC-T-07, BR-T-04 |
| F-T-15 | 할일 삭제 | 삭제 확인 다이얼로그 표시 후 확인 시 삭제 처리 | UC-T-05, NFR-D-02 |
| F-T-16 | 목록 복귀 | 메인 목록 화면으로 이동 | - |

### 4.6 통계 화면 (Screen: Statistics)

**진입 조건**: 인증된 사용자

| 기능 ID | 기능명 | 상세 설명 | 참조 |
|---------|--------|----------|------|
| F-Q-01 | 통계 조회 | 아래 5가지 지표를 카드형 UI로 표시. 상태별 건수 카드(UPCOMING / IN_PROGRESS / OVERDUE / COMPLETED_ON_TIME / COMPLETED_LATE) 클릭 시 해당 상태 필터가 적용된 메인 목록 화면(SCR-03)으로 이동 | UC-Q-03, UC-Q-01 |

**표시 지표**

| 지표명 | 산출 공식 |
|--------|----------|
| 전체 건수 | 사용자의 전체 Todo 수 |
| 상태별 건수 | 각 상태(5종) 해당 건수 |
| 완료율 | (COMPLETED_ON_TIME + COMPLETED_LATE) / 전체 건수 × 100 (%) |
| 기간 내 완료율 | COMPLETED_ON_TIME / (COMPLETED_ON_TIME + COMPLETED_LATE) × 100 (%) |
| 기간 초과 건수 | OVERDUE + COMPLETED_LATE 건수 |

> 데이터가 없는 경우 모든 지표는 0으로 표시한다.

---

## 5. API 명세 요약

> 모든 인증 필요 엔드포인트는 요청 헤더에 `Authorization: Bearer {accessToken}` 포함이 필수다.
> 미인증 접근 시 HTTP 401을 반환한다 (NFR-S-03).

### 5.1 인증 API

| 메서드 | 엔드포인트 | 인증 필요 | 설명 |
|--------|-----------|----------|------|
| POST | /api/auth/register | 불필요 | 회원가입 |
| POST | /api/auth/login | 불필요 | 로그인 |
| POST | /api/auth/logout | 필요 | 로그아웃 |
| POST | /api/auth/refresh | 불필요 | 액세스 토큰 재발급 |

**POST /api/auth/register**

```
Request Body:
{
  "email": "string (RFC5321)",
  "password": "string (8~20자, 영문 대/소문자·숫자·특수문자 각 1자 이상)"
}

Response 201:
{
  "id": "UUID",
  "email": "string",
  "created_at": "ISO8601 DateTime"
}

Error:
  400 - 이메일 형식 오류 / 비밀번호 정책 미충족
  409 - 이메일 중복
```

**POST /api/auth/login**

```
Request Body:
{
  "email": "string",
  "password": "string"
}

Response 200:
{
  "access_token": "string (JWT, 30분)",
  "refresh_token": "string (7일)"
}

Error:
  401 - 이메일 또는 비밀번호 불일치
  423 - 계정 잠금 상태 (TBD-01)
```

**POST /api/auth/logout**

```
Request Body:
{
  "refresh_token": "string"
}

Response 200:
{
  "message": "로그아웃 되었습니다"
}
```

**POST /api/auth/refresh**

```
Request Body:
{
  "refresh_token": "string"
}

Response 200:
{
  "access_token": "string (JWT, 30분)"
}

Error:
  401 - 유효하지 않은 refresh_token
```

### 5.2 할일 API

| 메서드 | 엔드포인트 | 인증 필요 | 설명 |
|--------|-----------|----------|------|
| POST | /api/todos | 필요 | 할일 등록 |
| GET | /api/todos | 필요 | 할일 목록 조회 |
| GET | /api/todos/:id | 필요 | 할일 상세 조회 |
| PUT | /api/todos/:id | 필요 | 할일 수정 |
| DELETE | /api/todos/:id | 필요 | 할일 삭제 |
| PATCH | /api/todos/:id/complete | 필요 | 완료 처리 |
| PATCH | /api/todos/:id/uncomplete | 필요 | 완료 해제 |

**POST /api/todos**

```
Request Body:
{
  "title": "string (max 200자)",
  "description": "string | null (max 2000자)",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD"
}

Response 201:
{
  "id": "UUID",
  "user_id": "UUID",
  "title": "string",
  "description": "string | null",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "is_completed": false,
  "completed_at": null,
  "status": "UPCOMING | IN_PROGRESS",
  "created_at": "ISO8601 DateTime",
  "updated_at": "ISO8601 DateTime"
}

Error:
  400 - 유효성 검증 실패 (제목 누락, 날짜 오류 등)
```

**GET /api/todos**

```
Query Parameters:
  status: UPCOMING | IN_PROGRESS | OVERDUE | COMPLETED_ON_TIME | COMPLETED_LATE (선택)
  sort_by: end_date | start_date | created_at | title (기본: created_at)
  order: asc | desc (기본: desc)
  page: number (기본: 1) [TBD-03]
  limit: number (기본: 20) [TBD-03]

Response 200:
{
  "data": [
    {
      "id": "UUID",
      "title": "string",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD",
      "is_completed": "boolean",
      "completed_at": "ISO8601 DateTime | null",
      "status": "string",
      "created_at": "ISO8601 DateTime",
      "updated_at": "ISO8601 DateTime"
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
}

Error:
  400 - 유효하지 않은 status 또는 sort_by 값
```

**GET /api/todos/:id**

```
Response 200:
{
  "id": "UUID",
  "user_id": "UUID",
  "title": "string",
  "description": "string | null",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "is_completed": "boolean",
  "completed_at": "ISO8601 DateTime | null",
  "status": "string",
  "created_at": "ISO8601 DateTime",
  "updated_at": "ISO8601 DateTime"
}

Error:
  404 - 존재하지 않거나 타 사용자 소유의 할일
```

**PUT /api/todos/:id**

```
Request Body:
{
  "title": "string (max 200자)",
  "description": "string | null (max 2000자)",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD"
}

Response 200: (수정된 Todo 전체 객체)

Error:
  400 - 유효성 검증 실패
  404 - 존재하지 않거나 타 사용자 소유의 할일
```

**DELETE /api/todos/:id**

```
Response 204: (No Content)

Error:
  404 - 존재하지 않거나 타 사용자 소유의 할일
```

**PATCH /api/todos/:id/complete**

```
Response 200:
{
  "id": "UUID",
  "is_completed": true,
  "completed_at": "ISO8601 DateTime",
  "status": "COMPLETED_ON_TIME | COMPLETED_LATE"
}

Error:
  404 - 존재하지 않거나 타 사용자 소유의 할일
  409 - 이미 완료된 할일
```

**PATCH /api/todos/:id/uncomplete**

```
Response 200:
{
  "id": "UUID",
  "is_completed": false,
  "completed_at": null,
  "status": "UPCOMING | IN_PROGRESS | OVERDUE"
}

Error:
  404 - 존재하지 않거나 타 사용자 소유의 할일
  409 - 완료되지 않은 할일
```

### 5.3 통계 API

| 메서드 | 엔드포인트 | 인증 필요 | 설명 |
|--------|-----------|----------|------|
| GET | /api/todos/statistics | 필요 | 할일 통계 조회 |

**GET /api/todos/statistics**

```
Response 200:
{
  "total": "number",
  "by_status": {
    "UPCOMING": "number",
    "IN_PROGRESS": "number",
    "OVERDUE": "number",
    "COMPLETED_ON_TIME": "number",
    "COMPLETED_LATE": "number"
  },
  "completion_rate": "number (%, 소수점 둘째 자리)",
  "on_time_rate": "number (%, 소수점 둘째 자리)",
  "overdue_count": "number"
}
```

---

## 6. 기술 아키텍처

### 6.1 아키텍처 구조 (3-Tier)

```
[클라이언트 레이어]
  React 19 + TypeScript
  Zustand (클라이언트 상태관리)
  TanStack Query (서버 상태 캐싱 및 동기화)
  반응형 UI (모바일 웹 + 데스크탑 웹)
        |
        | HTTPS REST API
        v
[애플리케이션 레이어]
  Node.js + Express Framework
  JWT 인증 미들웨어
  비즈니스 로직 (상태 산출, 유효성 검증)
  pg 라이브러리 (Raw SQL, Prisma 미사용)
        |
        | SQL
        v
[데이터 레이어]
  PostgreSQL
  User 테이블, Todo 테이블
  CASCADE DELETE 설정
```

### 6.2 기술 스택 상세

| 영역 | 기술 | 버전/비고 |
|------|------|----------|
| 프론트엔드 프레임워크 | React | 19 |
| 프론트엔드 언어 | TypeScript | - |
| 클라이언트 상태관리 | Zustand | - |
| 서버 상태관리 | TanStack Query | - |
| 백엔드 런타임 | Node.js | - |
| 백엔드 프레임워크 | Express | - |
| DB 클라이언트 | pg (node-postgres) | Prisma 미사용 |
| 데이터베이스 | PostgreSQL | - |
| 인증 방식 | JWT (Access Token + Refresh Token) | - |
| 비밀번호 해시 | bcrypt | - |
| 통신 프로토콜 | HTTPS | HTTP -> HTTPS 리다이렉트 |
| 배포 환경 | TBD | 미정 |

### 6.3 데이터 흐름

```
1. 사용자 요청
   클라이언트 UI 액션 (버튼 클릭, 폼 제출)

2. 서버 상태 요청 (TanStack Query)
   API 호출 -> Authorization 헤더에 Access Token 첨부

3. 백엔드 인증 미들웨어
   JWT 검증 -> user_id 추출 -> 다음 핸들러 전달

4. 비즈니스 로직 처리
   유효성 검증 -> DB 조회/쓰기 (pg) -> 상태 산출 (서버 사이드)

5. 응답 반환
   JSON 응답 -> TanStack Query 캐시 갱신 -> UI 리렌더링
```

### 6.4 데이터베이스 스키마 개요

**users 테이블**

| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| email | VARCHAR(254) | UNIQUE, NOT NULL |
| password | VARCHAR(60) | NOT NULL (bcrypt hash) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

**todos 테이블**

| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| user_id | UUID | FK -> users.id, ON DELETE CASCADE |
| title | VARCHAR(200) | NOT NULL |
| description | TEXT | NULL 허용 |
| start_date | DATE | NOT NULL |
| end_date | DATE | NOT NULL |
| is_completed | BOOLEAN | NOT NULL, DEFAULT false |
| completed_at | TIMESTAMPTZ | NULL 허용 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

> `status` 필드는 DB에 저장하지 않으며, API 응답 시 서버에서 현재 날짜 기준으로 실시간 산출하여 반환한다 (BR-T-05).

---

## 7. 비기능 요구사항 (NFR)

> 도메인 정의서(v1.1.0) 6절의 NFR을 계승하며, 서비스 규모(등록 10만 명 / 동시접속 500명) 기반의 추가 요구사항을 포함한다.

### 7.1 성능

| NFR ID | 요구사항 |
|--------|---------|
| NFR-P-01 | 할일 목록 조회 API 응답 시간은 P95 기준 500ms 이내여야 한다 |
| NFR-P-02 | 할일 등록/수정/삭제 API 응답 시간은 P95 기준 300ms 이내여야 한다 |
| NFR-P-03 | 동시접속 500명 기준 정상 응답(에러율 1% 미만)을 유지해야 한다 |
| NFR-P-04 | 등록 사용자 10만 명 규모에서 todos 테이블 인덱스(user_id, end_date)를 통해 조회 성능을 확보해야 한다 |

### 7.2 보안

| NFR ID | 요구사항 |
|--------|---------|
| NFR-S-01 | 비밀번호는 bcrypt(cost factor 12) 알고리즘으로 해시 처리하여 저장한다. 평문 저장 금지 |
| NFR-S-01-1 | 비밀번호 규칙: 최소 8자 이상 최대 20자 이하, 영문 대문자 1자 이상, 영문 소문자 1자 이상, 숫자 1자 이상, 특수문자(`!@#$%^&*`) 1자 이상 |
| NFR-S-02 | JWT 액세스 토큰 유효 기간은 30분, Refresh Token 유효 기간은 7일로 한다 |
| NFR-S-02-1 | JWT 서명 알고리즘: HS256. 서명 키는 환경 변수(JWT_SECRET)로 관리하며 코드에 하드코딩 금지 |
| NFR-S-02-2 | JWT Payload 클레임: `sub`(user_id), `email`, `iat`(발급시각), `exp`(만료시각) |
| NFR-S-02-3 | 액세스 토큰은 클라이언트 메모리(Zustand store)에 저장. Refresh Token은 httpOnly Cookie로 저장하여 XSS 탈취 방지 |
| NFR-S-02-4 | 액세스 토큰 만료 시 Refresh Token으로 자동 갱신(Silent Refresh). Refresh Token 만료 시 로그인 화면으로 리다이렉트 |
| NFR-S-03 | 모든 API 엔드포인트(인증 제외)는 유효한 액세스 토큰 없이 접근 시 401을 반환한다 |
| NFR-S-04 | HTTPS 통신을 필수로 한다. HTTP 요청은 HTTPS로 리다이렉트한다 |
| NFR-S-05 | API 응답에서 타 사용자 데이터 접근 시도에 대한 정보를 노출하지 않는다 (소유권 위반 시 404 반환) |
| NFR-S-06 | 계정 잠금 해제는 이메일을 통한 본인 확인 절차로 처리한다 (TBD-01 결정 사항) |

### 7.3 데이터 보존

| NFR ID | 요구사항 |
|--------|---------|
| NFR-D-01 | 사용자가 계정을 삭제하면 해당 사용자의 모든 할일 데이터를 즉시 삭제한다 (CASCADE DELETE) |
| NFR-D-02 | 삭제된 데이터는 복구되지 않으므로 삭제 전 확인 절차를 UI에서 제공해야 한다 |

### 7.4 가용성 및 운영

| NFR ID | 요구사항 |
|--------|---------|
| NFR-O-01 | 서비스 목표 가용성: 99.5% 이상 (월간 다운타임 3.6시간 미만) |
| NFR-O-02 | 배포 환경 결정 이후 로그 수집 및 모니터링 체계를 구성해야 한다 |

### 7.5 접근성 및 호환성

| NFR ID | 요구사항 |
|--------|---------|
| NFR-A-01 | 반응형 UI를 적용하여 모바일 웹(360px 이상) 및 데스크탑 웹(1280px 이상)에서 정상 동작해야 한다 |
| NFR-A-02 | 최신 주요 브라우저(Chrome, Safari, Edge, Firefox) 최신 2버전을 지원한다 |

---

## 8. 화면 목록 및 네비게이션 흐름

### 8.1 화면 목록

| 화면 ID | 화면명 | 접근 조건 | 주요 기능 |
|---------|--------|----------|----------|
| SCR-01 | 로그인 화면 | 비인증 사용자 | 로그인, 회원가입 화면 이동 |
| SCR-02 | 회원가입 화면 | 비인증 사용자 | 회원가입, 이메일 인증 (TBD-02) |
| SCR-03 | 메인 목록 화면 | 인증 사용자 | 할일 목록, 필터, 정렬, 등록 진입, 로그아웃 |
| SCR-04 | 할일 등록 화면 | 인증 사용자 | 할일 신규 등록 |
| SCR-05 | 할일 상세 화면 | 인증 사용자 (본인 소유) | 상세 조회, 수정 진입, 완료/해제, 삭제 |
| SCR-06 | 할일 수정 화면 | 인증 사용자 (본인 소유) | 할일 수정 |
| SCR-07 | 통계 화면 | 인증 사용자 | 5가지 통계 지표 조회, 상태별 건수 클릭 시 필터 연동 이동 |

### 8.2 네비게이션 흐름

```
[앱 진입]
    |
    v
[SCR-01 로그인]
    |                  |
    | 로그인 성공       | 회원가입 클릭
    v                  v
[SCR-03 메인 목록]  [SCR-02 회원가입]
    |                  |
    |<--- 가입 완료 ---/
    |
    |--- 등록 버튼 ---> [SCR-04 할일 등록] ---> 등록 완료 ---> [SCR-03 메인 목록]
    |
    |--- 항목 클릭 ---> [SCR-05 할일 상세]
    |                       |--- 수정 버튼 ---> [SCR-06 할일 수정] ---> 저장 완료 ---> [SCR-05 할일 상세]
    |                       |--- 완료/해제 ---> 상태 갱신 (현재 화면 유지)
    |                       |--- 삭제 버튼 ---> 확인 다이얼로그 ---> 삭제 완료 ---> [SCR-03 메인 목록]
    |                       |--- 목록 복귀 ---> [SCR-03 메인 목록]
    |
    |--- 통계 탭 -----> [SCR-07 통계]
    |                       |--- 상태 카드 클릭 ---> [SCR-03 메인 목록 (해당 상태 필터 적용)]
    |
    |--- 로그아웃 ----> [SCR-01 로그인]
```

### 8.3 인증 보호 흐름

- 비인증 상태에서 SCR-03 ~ SCR-07 접근 시도 시 SCR-01(로그인)으로 자동 리다이렉트
- Access Token 만료 시 Refresh Token으로 자동 갱신, 갱신 실패 시 SCR-01으로 이동

---

## 9. 출시 계획

### 개발 완료 목표일

2026년 4월 3일

### 마일스톤

| 단계 | 명칭 | 목표 일정 | 포함 기능 | 대상 사용자 |
|------|------|----------|----------|------------|
| 1단계 | CB (Closed Beta) | 2026년 4월 3일 | MVP 전체 기능 (인증, 할일 CRUD, 완료 처리, 상태 필터, 정렬, 통계, 페이지네이션, 이메일 인증, 계정 잠금) | 내부 테스터, 초청 사용자 소수 |
| 2단계 | OB (Open Beta) | CB 테스트 완료 후 | CB 피드백 반영, 버그 수정, 성능 튜닝 | 일반 사용자 제한 모집 |
| 3단계 | 정식 배포 | OB 완료 후 | 안정화된 전체 기능, 모니터링 체계 적용 | 전체 일반 사용자 |

### 단계별 검증 기준

| 단계 | 완료 기준 |
|------|----------|
| CB | 13개 유스케이스 전체 기능 동작 확인, 치명적 버그 0건 |
| OB | CB 발견 버그 100% 수정, NFR-P-01/P-02 성능 기준 충족, 사용자 피드백 수집 완료 |
| 정식 배포 | OB 피드백 반영 완료, 동시접속 500명 부하 테스트 통과, 가용성 99.5% 기준 안정 확인 |

---

## 10. 미결 사항 (TBD)

도메인 정의서의 TBD 3개 항목은 모두 MVP에 포함하는 것으로 결정하였으며, 세부 정책을 아래와 같이 정의한다.

### TBD-01: 계정 잠금 정책 (결정 완료)

| 항목 | 결정 내용 |
|------|----------|
| 잠금 발동 조건 | 로그인 실패 5회 연속 |
| 잠금 적용 범위 | 해당 이메일 계정 |
| 잠금 해제 방법 | 가입 이메일로 잠금 해제 링크 발송 후 본인 확인 |
| 잠금 상태 HTTP 응답 | 423 Locked |
| 잠금 상태 에러 메시지 | "로그인 시도 횟수 초과로 계정이 잠겼습니다. 이메일을 확인하여 잠금을 해제하세요." |
| 실패 횟수 초기화 | 로그인 성공 시 0으로 초기화 |

> 추가 검토 필요: 실패 횟수 카운트 만료 시간 (예: 1시간 내 5회) 여부 — CB 테스트 단계에서 결정

### TBD-02: 이메일 인증 (결정 완료)

| 항목 | 결정 내용 |
|------|----------|
| 도입 여부 | 도입 (MVP 포함) |
| 인증 시점 | 회원가입 직후 인증 이메일 자동 발송 |
| 인증 방법 | 이메일 내 인증 링크 클릭 |
| 인증 링크 유효 시간 | 24시간 |
| 미인증 사용자 처리 | 이메일 인증 완료 전까지 로그인 불가. 재발송 기능 제공 |
| 인증 메일 재발송 | 사용자가 재발송 요청 가능 (로그인 시도 시 안내 포함) |

> 추가 검토 필요: 이메일 발송 서비스 제공자 선정 (AWS SES / SendGrid 등) — 배포 환경 결정 시 함께 결정

### TBD-03: 페이지네이션 (결정 완료)

| 항목 | 결정 내용 |
|------|----------|
| 방식 | Offset 기반 페이지네이션 |
| 기본 페이지 크기 | 20건 |
| Query Parameter | `page` (기본 1), `limit` (기본 20, 최대 100) |
| 응답 포함 정보 | `total`, `page`, `limit`, `totalPages` |
| 선택 사유 | 구현 단순성 및 페이지 번호 기반 UI와의 적합성. 초기 서비스 규모(10만 사용자, 개인별 할일 수 제한 없음)에서 Cursor 방식 대비 충분한 성능 제공 가능 |

> Cursor 방식으로의 전환은 사용자 규모 증가 및 성능 이슈 발생 시 OB 이후 단계에서 재검토

---

## 부록: 요구사항 추적 매트릭스 (RTM)

| 요구사항 ID | 유스케이스 | 화면 | API 엔드포인트 | 비즈니스 규칙 |
|------------|-----------|------|---------------|-------------|
| F-A-01 | UC-A-02 | SCR-01 | POST /api/auth/login | NFR-S-02 |
| F-A-04 | UC-A-01 | SCR-02 | POST /api/auth/register | BR-U-01, BR-U-04 |
| F-A-05 | UC-A-01 | SCR-02 | - | TBD-02 |
| F-T-01 | UC-T-02 | SCR-03 | GET /api/todos | BR-U-03 |
| F-T-02 | UC-Q-01 | SCR-03 | GET /api/todos?status= | BR-T-05 |
| F-T-03 | UC-Q-02 | SCR-03 | GET /api/todos?sort_by= | - |
| F-T-04 | UC-T-02 | SCR-03 | GET /api/todos?page= | TBD-03 |
| F-T-09 | UC-T-01 | SCR-04 | POST /api/todos | BR-T-01, BR-T-02 |
| F-T-10 | UC-T-04 | SCR-06 | PUT /api/todos/:id | BR-T-01, BR-T-02 |
| F-T-11 | UC-T-03 | SCR-05 | GET /api/todos/:id | BR-U-03 |
| F-T-13 | UC-T-06 | SCR-05 | PATCH /api/todos/:id/complete | BR-T-03 |
| F-T-14 | UC-T-07 | SCR-05 | PATCH /api/todos/:id/uncomplete | BR-T-04 |
| F-T-15 | UC-T-05 | SCR-05 | DELETE /api/todos/:id | NFR-D-01, NFR-D-02 |
| F-Q-01 | UC-Q-03 | SCR-07 | GET /api/todos/statistics | BR-T-05 |
