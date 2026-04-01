# 기술 아키텍처 다이어그램: todolist-app

> 버전: 1.0.0
> 작성일: 2026-03-31
> 작성자: Senior Backend Developer
> 참조 문서: `docs/1-domain-definition.md`, `docs/2-prd.md`, `docs/4-project-structure.md`

### 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0.0 | 2026-03-31 | 최초 작성 |

---

## 1. 시스템 전체 구조

> 3-Tier 아키텍처 개요 — 프론트엔드, 백엔드, 데이터베이스 각 레이어의 핵심 기술 스택을 표시한다.

```mermaid
graph TD
    FE["프론트엔드\nReact 19 + TypeScript\nZustand / TanStack Query"]
    BE["백엔드\nNode.js + Express\nJWT 인증"]
    DB[("데이터베이스\nPostgreSQL")]

    FE -->|"REST API (JSON)"| BE
    BE -->|"Raw SQL (pg)"| DB
```

---

## 2. 백엔드 레이어 구조

> HTTP 요청이 백엔드 내부를 통과하는 순서 — Router 에서 PostgreSQL 까지의 단방향 흐름을 표시한다.

```mermaid
graph LR
    R[Router] --> M[Middleware\nJWT 검증]
    M --> C[Controller]
    C --> S[Service\n비즈니스 로직]
    S --> Q[Query\nRaw SQL]
    Q --> DB[(PostgreSQL)]
```

---

## 3. 인증 흐름

> 로그인부터 Silent Refresh 까지의 전체 인증 시퀀스를 표시한다.

```mermaid
sequenceDiagram
    participant C as 클라이언트
    participant S as 서버

    C->>S: POST /api/auth/login
    S-->>C: Access Token (30분) + Refresh Token Cookie (7일)

    C->>S: API 요청 (Bearer 헤더)
    S-->>C: 200 응답

    Note over C,S: Access Token 만료 시
    C->>S: API 요청 → 401 수신
    C->>S: POST /api/auth/refresh (Cookie 자동 전송)
    S-->>C: 새 Access Token
    C->>S: API 요청 재시도
    S-->>C: 200 응답
```

---

## 4. 화면 네비게이션

> 7개 화면 간 이동 흐름 — 인증 여부에 따른 분기를 포함한다.

```mermaid
graph TD
    S01[SCR-01\n로그인]
    S02[SCR-02\n회원가입]
    S03[SCR-03\n메인 목록]
    S04[SCR-04\n등록]
    S05[SCR-05\n상세]
    S06[SCR-06\n수정]
    S07[SCR-07\n통계]

    S01 -->|"로그인 성공"| S03
    S01 -->|"회원가입 이동"| S02
    S02 -->|"가입 완료"| S01
    S03 -->|"등록"| S04
    S03 -->|"항목 선택"| S05
    S03 -->|"통계"| S07
    S04 -->|"저장"| S03
    S05 -->|"수정"| S06
    S05 -->|"삭제"| S03
    S05 -->|"완료/해제"| S05
    S06 -->|"저장"| S05
    S07 -->|"뒤로"| S03
```

---

## 5. ERD

> users 와 todos 두 테이블의 관계 및 핵심 컬럼을 표시한다.

```mermaid 
erDiagram
    users {
        UUID id PK
        VARCHAR email
        VARCHAR password
        TIMESTAMPTZ created_at
    }

    todos {
        UUID id PK
        UUID user_id FK
        VARCHAR title
        TEXT description
        DATE start_date
        DATE end_date
        BOOLEAN is_completed
        TIMESTAMPTZ completed_at
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    users ||--o{ todos : "소유"
```
