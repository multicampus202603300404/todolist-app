# todolist-app Backend

개인별 할일 관리 애플리케이션 REST API 서버

## 기술 스택

- Node.js + Express
- PostgreSQL + pg (Raw SQL)
- JWT (HS256) + bcrypt
- Jest (테스트)

## 시작하기

```bash
# 패키지 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일을 편집하여 DB 접속 정보 등 설정

# 데이터베이스 마이그레이션
npm run migrate

# 시드 데이터 (개발용)
npm run seed

# 서버 시작
npm start        # 프로덕션
npm run dev      # 개발 (파일 변경 감지 재시작)

# 테스트
npm test
```

## 환경변수

| 변수 | 필수 | 기본값 | 설명 |
|------|------|--------|------|
| NODE_ENV | O | development | 실행 환경 |
| PORT | O | 4000 | 서버 포트 |
| DATABASE_URL | O | - | PostgreSQL 연결 문자열 |
| JWT_ACCESS_SECRET | O | - | Access Token 서명 키 (최소 32자) |
| JWT_REFRESH_SECRET | O | - | Refresh Token 서명 키 (최소 32자) |
| JWT_ACCESS_EXPIRES_IN | O | 30m | Access Token 유효 기간 |
| JWT_REFRESH_EXPIRES_IN | O | 7d | Refresh Token 유효 기간 |
| BCRYPT_COST_FACTOR | X | 12 | bcrypt 해시 라운드 수 |
| CORS_ORIGIN | O | - | 허용 CORS 출처 |
| LOG_LEVEL | X | info | 로그 레벨 (debug/info/warn/error) |

## API 엔드포인트

### 인증

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| POST | /api/auth/register | X | 회원가입 |
| POST | /api/auth/login | X | 로그인 |
| POST | /api/auth/logout | O | 로그아웃 |
| POST | /api/auth/refresh | X | 토큰 갱신 |

### 할일

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| POST | /api/todos | O | 할일 생성 |
| GET | /api/todos | O | 목록 조회 |
| GET | /api/todos/statistics | O | 통계 조회 |
| GET | /api/todos/:id | O | 상세 조회 |
| PUT | /api/todos/:id | O | 수정 |
| DELETE | /api/todos/:id | O | 삭제 |
| PATCH | /api/todos/:id/complete | O | 완료 처리 |
| PATCH | /api/todos/:id/uncomplete | O | 완료 해제 |

### 운영

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | /api/health | X | 헬스체크 |

## 에러 코드

| HTTP | 코드 | 설명 |
|------|------|------|
| 400 | VALIDATION_ERROR | 입력 유효성 검증 실패 |
| 400 | INVALID_DATE_RANGE | 종료일이 시작일보다 앞섬 |
| 401 | UNAUTHORIZED | 인증 필요 |
| 401 | TOKEN_EXPIRED | 토큰 만료 |
| 401 | INVALID_TOKEN | 유효하지 않은 토큰 |
| 401 | INVALID_CREDENTIALS | 이메일/비밀번호 불일치 |
| 401 | INVALID_REFRESH_TOKEN | Refresh Token 무효 |
| 404 | TODO_NOT_FOUND | 할일 미존재 또는 소유권 불일치 |
| 404 | NOT_FOUND | 경로 미존재 |
| 409 | EMAIL_ALREADY_EXISTS | 이메일 중복 |
| 409 | ALREADY_COMPLETED | 이미 완료된 할일 |
| 409 | NOT_COMPLETED | 완료되지 않은 할일 |
| 429 | TOO_MANY_REQUESTS | Rate limit 초과 |
| 500 | INTERNAL_ERROR | 서버 내부 오류 |

## Rate Limiting

- 인증 API: 분당 20회
- 일반 API: 분당 200회
