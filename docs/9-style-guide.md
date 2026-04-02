# 스타일 가이드: todolist-app

> 버전: 1.0.0
> 작성일: 2026-04-01
> 작성자: UI Designer
> 참조 문서:
> - `docs/2-prd.md` (v1.2.0)
> - `docs/8-wireframes.md` (v1.0.0)

### 변경 이력

| 버전  | 날짜       | 변경 내용 |
|-------|------------|----------|
| 1.0.0 | 2026-04-01 | 최초 작성 |

---

## 목차

1. [디자인 철학](#1-디자인-철학)
2. [색상 팔레트](#2-색상-팔레트)
3. [타이포그래피](#3-타이포그래피)
4. [간격 시스템](#4-간격-시스템)
5. [그리드 & 레이아웃](#5-그리드--레이아웃)
6. [컴포넌트 스타일](#6-컴포넌트-스타일)
7. [아이콘 & 시각 요소](#7-아이콘--시각-요소)
8. [CSS 변수 정의 목록](#8-css-변수-정의-목록)

---

## 1. 디자인 철학

todolist-app의 UI는 다음 5가지 원칙을 기반으로 한다.

### 1.1 명료성 우선 (Clarity First)

할일의 제목, 상태, 기간이 한눈에 식별되어야 한다. 장식적 요소는 정보 전달을 방해하지 않는 선에서만 허용한다. 사용자가 목적 달성에 집중할 수 있도록 인터페이스는 최대한 투명하게 존재한다.

### 1.2 미니멀리즘 (Minimalism)

불필요한 그래픽 요소, 과도한 그림자, 복잡한 패턴을 배제한다. 화이트스페이스를 적극 활용하여 콘텐츠 간 호흡을 확보하고, 각 요소가 자신의 역할에만 집중하도록 한다.

### 1.3 일관된 계층 구조 (Consistent Hierarchy)

색상, 크기, 굵기의 조합으로 정보의 중요도를 명확하게 표현한다. 주요 행동(CTA)은 항상 다크 계열 Primary 버튼으로 강조하고, 보조 행동은 시각적으로 한 단계 아래 레벨을 유지한다.

### 1.4 접근성 보장 (Accessibility)

WCAG 2.1 AA 기준을 준수한다. 모든 텍스트와 배경의 명도 대비는 최소 4.5:1을 충족한다. 색상 외에도 형태, 레이블, 아이콘을 함께 사용하여 색맹 사용자도 상태를 구분할 수 있도록 한다.

### 1.5 반응형 우선 (Responsive First)

모바일(360px)에서 데스크탑(1280px+)까지 동일한 정보를 레이아웃만 달리하여 제공한다. 터치 타겟은 최소 44×44px를 보장하고, 모바일 환경의 한 손 조작을 고려한 위치에 핵심 조작 요소를 배치한다.

---

## 2. 색상 팔레트

### 2.1 Primary 색상

브랜드의 핵심 컬러로 주요 CTA 버튼, 활성 상태, 강조 링크에 사용한다.

| 이름 | 값 | CSS 변수 | 용도 |
|------|-----|----------|------|
| Primary Default | `#1A1A1A` | `--color-primary` | Primary 버튼 배경, 주요 제목 텍스트 |
| Primary Hover | `#333333` | `--color-primary-hover` | Primary 버튼 호버 배경 |
| Primary Active | `#000000` | `--color-primary-active` | Primary 버튼 클릭 배경 |
| Primary Foreground | `#FFFFFF` | `--color-primary-foreground` | Primary 버튼 위 텍스트 |

### 2.2 Secondary 색상

보조 버튼, 아웃라인 요소, 링크에 사용한다.

| 이름 | 값 | CSS 변수 | 용도 |
|------|-----|----------|------|
| Secondary Default | `#FFFFFF` | `--color-secondary` | Secondary 버튼 배경 |
| Secondary Border | `#1A1A1A` | `--color-secondary-border` | Secondary 버튼 테두리 |
| Secondary Foreground | `#1A1A1A` | `--color-secondary-foreground` | Secondary 버튼 텍스트 |
| Secondary Hover BG | `#F5F5F5` | `--color-secondary-hover` | Secondary 버튼 호버 배경 |

### 2.3 Neutral 색상

텍스트, 배경, 구분선 등 전반적인 레이아웃에 사용한다.

| 이름 | 값 | CSS 변수 | 용도 |
|------|-----|----------|------|
| Neutral 900 | `#1A1A1A` | `--color-neutral-900` | 주요 텍스트, 제목 |
| Neutral 700 | `#333333` | `--color-neutral-700` | 본문 텍스트 |
| Neutral 500 | `#666666` | `--color-neutral-500` | 보조 텍스트, 플레이스홀더 |
| Neutral 400 | `#999999` | `--color-neutral-400` | 비활성 텍스트, 힌트 |
| Neutral 200 | `#E5E5E5` | `--color-neutral-200` | 테두리, 구분선 |
| Neutral 100 | `#EEEEEE` | `--color-neutral-100` | 비활성 배경, 스켈레톤 |
| Neutral 50  | `#F9F9F9` | `--color-neutral-50`  | 페이지 배경, 입력 필드 배경 |
| White       | `#FFFFFF` | `--color-white`       | 카드 배경, 모달 배경 |

### 2.4 Semantic 색상

상태와 피드백을 전달하는 데 사용한다.

| 이름 | 값 | CSS 변수 | 용도 |
|------|-----|----------|------|
| Danger Default | `#E74C3C` | `--color-danger` | Danger 버튼, 에러 메시지, 삭제 강조 |
| Danger Light | `#FDECEA` | `--color-danger-light` | 에러 인라인 배경 |
| Danger Foreground | `#FFFFFF` | `--color-danger-foreground` | Danger 버튼 텍스트 |
| Success Default | `#27AE60` | `--color-success` | 성공 토스트, 완료 강조 |
| Success Light | `#E9F7EF` | `--color-success-light` | 성공 인라인 배경 |
| Warning Default | `#F39C12` | `--color-warning` | 경고 토스트, 주의 상태 |
| Warning Light | `#FEF9E7` | `--color-warning-light` | 경고 인라인 배경 |
| Info Default | `#2980B9` | `--color-info` | 정보 토스트, 안내 메시지 |
| Info Light | `#EBF5FB` | `--color-info-light` | 정보 인라인 배경 |

### 2.5 상태 뱃지 색상

할일의 5가지 상태 표현에 전용으로 사용한다. 색상 외에 텍스트 레이블을 반드시 함께 표시한다.

| 상태 | 배경색 | 텍스트색 | CSS 변수 쌍 | 레이블 |
|------|--------|---------|------------|--------|
| UPCOMING (시작 전) | `#EBF5FB` | `#1A6A9A` | `--badge-upcoming-bg` / `--badge-upcoming-fg` | 시작 전 |
| IN_PROGRESS (진행 중) | `#E9F7EF` | `#1A7A42` | `--badge-inprogress-bg` / `--badge-inprogress-fg` | 진행 중 |
| OVERDUE (종료됨) | `#FDECEA` | `#C0392B` | `--badge-overdue-bg` / `--badge-overdue-fg` | 종료됨 |
| COMPLETED_ON_TIME (기간 내 완료) | `#EAF4FF` | `#1558A6` | `--badge-completed-ontime-bg` / `--badge-completed-ontime-fg` | 기간 내 완료 |
| COMPLETED_LATE (기간 초과 완료) | `#FEF9E7` | `#9A6700` | `--badge-completed-late-bg` / `--badge-completed-late-fg` | 기간 초과 완료 |

---

## 3. 타이포그래피

### 3.1 폰트 패밀리

| 역할 | 폰트 | CSS 변수 |
|------|------|----------|
| 한글 기본 | Noto Sans KR | `--font-sans` |
| 영문 기본 | Inter | `--font-sans` |
| 숫자/모노 | JetBrains Mono | `--font-mono` |

```css
/* Google Fonts import */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
```

한글이 포함된 모든 텍스트에서 Inter와 Noto Sans KR을 함께 선언하여 영문과 한글 모두 최적의 가독성을 제공한다.

```css
font-family: 'Inter', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
```

### 3.2 사이즈 스케일

| 토큰 | 크기 | 굵기 | 행간 | 자간 | 용도 |
|------|------|------|------|------|------|
| `--text-h1` | 40px | 700 | 1.2 | -0.02em | 페이지 대제목 (로그인/통계 헤딩) |
| `--text-h2` | 28px | 700 | 1.3 | -0.01em | 섹션 대제목 |
| `--text-h3` | 22px | 600 | 1.4 | 0 | 카드 제목, 모달 제목 |
| `--text-h4` | 18px | 600 | 1.5 | 0 | 서브 섹션 제목 |
| `--text-h5` | 16px | 600 | 1.5 | 0 | 레이블, 소제목 |
| `--text-h6` | 14px | 600 | 1.5 | 0.01em | 대문자 레이블, 구분 헤더 |
| `--text-body-lg` | 18px | 400 | 1.7 | 0 | 리드 문단 |
| `--text-body-md` | 16px | 400 | 1.7 | 0 | 기본 본문 |
| `--text-body-sm` | 14px | 400 | 1.6 | 0 | 보조 본문, 입력 필드 텍스트 |
| `--text-caption` | 12px | 400 | 1.5 | 0.01em | 날짜, 힌트, 부가 정보 |
| `--text-label` | 12px | 600 | 1.4 | 0.05em | 상태 뱃지, 폼 레이블 |
| `--text-button` | 14px | 600 | 1 | 0.02em | 버튼 텍스트 |

### 3.3 적용 원칙

- 할일 목록의 제목은 `--text-body-md` + 굵기 500으로 가독성을 확보한다.
- 날짜 및 기간 정보는 `--text-caption`에 `--font-mono`를 적용하여 숫자 정렬을 일관되게 유지한다.
- 폼 레이블은 항상 입력 필드 위에 배치하며, `--text-label` 크기와 `--color-neutral-700` 색상을 사용한다.
- 플레이스홀더 텍스트는 `--text-body-sm` + `--color-neutral-400`을 사용한다.

---

## 4. 간격 시스템

4px를 기본 단위로 하는 간격 스케일을 사용한다. 모든 패딩, 마진, 갭은 이 스케일의 값만 사용한다.

### 4.1 기본 스케일

| 토큰 | 값 | CSS 변수 | 주요 용도 |
|------|-----|----------|----------|
| space-1 | 4px | `--space-1` | 아이콘과 텍스트 사이 간격, 인라인 요소 간 최소 여백 |
| space-2 | 8px | `--space-2` | 뱃지 내부 수평 패딩, 소형 컴포넌트 간격 |
| space-3 | 12px | `--space-3` | 입력 필드 내부 수직 패딩, 작은 카드 내부 간격 |
| space-4 | 16px | `--space-4` | 카드 내부 패딩 기본, 버튼 수평 패딩 |
| space-6 | 24px | `--space-6` | 폼 필드 간 간격, 카드 간 간격 |
| space-8 | 32px | `--space-8` | 섹션 내부 상하 패딩 |
| space-12 | 48px | `--space-12` | 섹션 간 간격 (모바일) |
| space-16 | 64px | `--space-16` | 섹션 간 간격 (태블릿+) |
| space-24 | 96px | `--space-24` | 페이지 상단 히어로 영역 상하 패딩 |

### 4.2 컴포넌트별 간격 기준

| 컴포넌트 | 내부 패딩 | 외부 마진(gap) |
|----------|----------|--------------|
| 버튼 (기본) | 수직 12px / 수평 24px | - |
| 버튼 (소형) | 수직 8px / 수평 16px | - |
| 입력 필드 | 수직 12px / 수평 16px | 하단 24px (폼 필드 간) |
| 카드 | 24px 전체 | 하단 16px |
| 모달 | 32px 전체 | - |
| 뱃지 | 수직 4px / 수평 10px | - |
| 페이지 컨테이너 | 수평 16px (모바일) / 24px (태블릿) / 0 (데스크탑, 최대 너비로 제어) | - |

---

## 5. 그리드 & 레이아웃

### 5.1 반응형 브레이크포인트

| 이름 | 최소 너비 | CSS 변수 | 적용 환경 |
|------|----------|----------|----------|
| Mobile | 360px | `--bp-mobile` | 스마트폰 세로 방향 |
| Tablet | 768px | `--bp-tablet` | 태블릿, 스마트폰 가로 방향 |
| Desktop | 1280px | `--bp-desktop` | 데스크탑, 와이드스크린 |

```css
/* 미디어 쿼리 작성 규칙 — mobile-first */
/* 기본 스타일: 360px (Mobile) */
/* 태블릿 이상 */
@media (min-width: 768px) { ... }
/* 데스크탑 이상 */
@media (min-width: 1280px) { ... }
```

### 5.2 컨테이너

| 환경 | 최대 너비 | 수평 패딩 |
|------|----------|----------|
| Mobile | 100% | 16px |
| Tablet | 100% | 24px |
| Desktop | 1200px | 0 (중앙 정렬) |

### 5.3 열 구조

| 환경 | 열 수 | 거터 | 용도 |
|------|-------|------|------|
| Mobile | 4열 | 16px | 단일 컬럼 레이아웃 |
| Tablet | 8열 | 24px | 2열 폼 레이아웃 가능 |
| Desktop | 12열 | 24px | 3열 카드 그리드, 좌우 분할 레이아웃 |

### 5.4 화면별 레이아웃 정책

| 화면 | Mobile | Desktop |
|------|--------|---------|
| 로그인 / 회원가입 | 전체 너비 단일 폼 카드 | 중앙 정렬 480px 폼 카드 |
| 메인 목록 | 단일 컬럼 카드 리스트 | 필터 사이드바(240px) + 카드 리스트 |
| 등록 / 수정 | 전체 너비 폼 | 중앙 640px 폼 카드 |
| 상세 | 전체 너비 단일 컬럼 | 중앙 640px 카드 |
| 통계 | 수직 스택 차트 | 2열 차트 그리드 |

---

## 6. 컴포넌트 스타일

### 6.1 버튼

버튼은 4가지 변형(Variant)과 2가지 크기(Size)를 제공한다.

#### 변형 (Variant)

**Primary**
- 배경: `--color-primary` (#1A1A1A)
- 텍스트: `--color-primary-foreground` (#FFFFFF)
- 테두리: 없음
- 호버: 배경 `--color-primary-hover` (#333333)
- 액티브: 배경 `--color-primary-active` (#000000)
- 비활성(disabled): 배경 `--color-neutral-200`, 텍스트 `--color-neutral-400`, 커서 not-allowed

**Secondary**
- 배경: `--color-secondary` (#FFFFFF)
- 텍스트: `--color-secondary-foreground` (#1A1A1A)
- 테두리: 1px solid `--color-secondary-border` (#1A1A1A)
- 호버: 배경 `--color-secondary-hover` (#F5F5F5)
- 액티브: 배경 `--color-neutral-100`
- 비활성: 테두리 `--color-neutral-200`, 텍스트 `--color-neutral-400`

**Danger**
- 배경: `--color-danger` (#E74C3C)
- 텍스트: `--color-danger-foreground` (#FFFFFF)
- 테두리: 없음
- 호버: 배경 `#C0392B`
- 액티브: 배경 `#A93226`
- 비활성: 배경 `--color-neutral-200`, 텍스트 `--color-neutral-400`
- 주 사용처: 삭제 확인 다이얼로그의 확인 버튼

**Ghost**
- 배경: 투명
- 텍스트: `--color-neutral-700`
- 테두리: 없음
- 호버: 배경 `--color-neutral-100`
- 액티브: 배경 `--color-neutral-200`
- 주 사용처: 다이얼로그의 취소 버튼, 아이콘 전용 버튼

#### 크기 (Size)

| 크기 | 높이 | 수평 패딩 | 폰트 크기 | border-radius |
|------|------|----------|----------|---------------|
| Default | 44px | 24px | 14px (600) | 4px |
| Small | 36px | 16px | 13px (600) | 4px |

- 터치 타겟 최소 44×44px를 보장하기 위해 Default 크기를 기본으로 사용한다.
- `border-radius`는 4px로 고정한다 (레퍼런스의 미니멀한 사각형 버튼 스타일 반영).
- 버튼 내 텍스트는 `letter-spacing: 0.02em`을 적용한다.
- 전체 너비 버튼(full-width)은 모바일 폼의 주요 CTA에서만 사용한다.

### 6.2 입력 필드

**기본 상태**
- 높이: 48px
- 배경: `--color-white` (#FFFFFF)
- 테두리: 1px solid `--color-neutral-200` (#E5E5E5)
- border-radius: 4px
- 텍스트: `--text-body-sm` (14px), `--color-neutral-900`
- 플레이스홀더: `--color-neutral-400`
- 내부 패딩: 수직 12px / 수평 16px

**포커스 상태**
- 테두리: 1.5px solid `--color-primary` (#1A1A1A)
- outline: none (기본 브라우저 outline 제거 후 테두리로 대체)
- 배경: `--color-white`

**에러 상태**
- 테두리: 1.5px solid `--color-danger` (#E74C3C)
- 하단 에러 메시지: `--text-caption` (12px), `--color-danger`, 상단 마진 4px
- 에러 아이콘을 필드 우측에 표시 (선택 사항)

**비활성(disabled) 상태**
- 배경: `--color-neutral-50`
- 텍스트: `--color-neutral-400`
- 테두리: 1px solid `--color-neutral-100`
- 커서: not-allowed

**textarea**
- 위 스타일 동일 적용
- 최소 높이: 120px
- resize: vertical 허용

### 6.3 카드

**할일 카드 (목록 아이템)**
- 배경: `--color-white`
- 테두리: 1px solid `--color-neutral-200`
- border-radius: 8px
- 패딩: 20px 24px
- 그림자: `0 1px 4px rgba(0, 0, 0, 0.06)`
- 호버: `0 4px 12px rgba(0, 0, 0, 0.10)`, 테두리 색 `--color-neutral-400`로 전환
- 호버 transition: `box-shadow 0.15s ease, border-color 0.15s ease`

**폼 카드 (로그인, 등록 등)**
- 배경: `--color-white`
- 테두리: 1px solid `--color-neutral-200`
- border-radius: 8px
- 패딩: 40px 40px (모바일: 24px 20px)
- 그림자: `0 2px 8px rgba(0, 0, 0, 0.08)`

**통계 카드**
- 배경: `--color-white`
- 테두리: 1px solid `--color-neutral-200`
- border-radius: 8px
- 패딩: 24px
- 그림자: `0 1px 4px rgba(0, 0, 0, 0.06)`

### 6.4 상태 뱃지

5가지 할일 상태를 인라인으로 표시하는 컴포넌트다.

**공통 스타일**
- border-radius: 4px
- 패딩: 4px 10px
- 폰트: `--text-label` (12px, 굵기 600)
- letter-spacing: 0.03em
- display: inline-flex
- align-items: center
- gap: 4px (아이콘 + 텍스트 사이)

**각 상태별 색상**

| 상태 | 배경 | 텍스트 |
|------|------|--------|
| UPCOMING | `#EBF5FB` | `#1A6A9A` |
| IN_PROGRESS | `#E9F7EF` | `#1A7A42` |
| OVERDUE | `#FDECEA` | `#C0392B` |
| COMPLETED_ON_TIME | `#EAF4FF` | `#1558A6` |
| COMPLETED_LATE | `#FEF9E7` | `#9A6700` |

모든 뱃지는 색상에 추가로 아이콘 또는 텍스트 레이블을 반드시 함께 표시하여 색각 이상 사용자도 상태를 인식할 수 있도록 한다.

### 6.5 다이얼로그

**오버레이**
- 배경: `rgba(0, 0, 0, 0.50)`
- 전체 화면 커버 (position: fixed, inset: 0)
- z-index: 1000
- 클릭 시 다이얼로그 닫힘 (단, 파괴적 작업 확인 다이얼로그는 배경 클릭으로 닫히지 않음)

**다이얼로그 카드**
- 배경: `--color-white`
- border-radius: 8px
- 패딩: 32px
- 최소 너비: 320px / 최대 너비: 480px
- 그림자: `0 8px 32px rgba(0, 0, 0, 0.16)`
- 중앙 정렬 (수평 + 수직)

**구조**
```
[제목 (--text-h3)]
[본문 텍스트 (--text-body-md, --color-neutral-700)]
[버튼 영역 — 우측 정렬]
  [Ghost 취소 버튼] [Primary 또는 Danger 확인 버튼]
```

- 버튼 영역 상단 마진: 24px
- 버튼 사이 간격: 8px
- 삭제/완료 처리 등 파괴적 작업의 확인 버튼은 Danger 변형 사용
- 일반 확인 버튼은 Primary 변형 사용

### 6.6 토스트

작업 결과를 화면 우측 하단에 비침투적으로 알리는 알림 컴포넌트다.

**위치**: 화면 우측 하단 (position: fixed, bottom: 24px, right: 24px). 모바일에서는 하단 중앙 (bottom: 16px, left: 50%, transform: translateX(-50%)).

**크기**: 최소 너비 280px / 최대 너비 400px

**구조 및 스타일**
- 배경: `--color-neutral-900` (#1A1A1A) — 기본
- 텍스트: `--color-white`, `--text-body-sm` (14px)
- border-radius: 6px
- 패딩: 12px 16px
- 그림자: `0 4px 16px rgba(0, 0, 0, 0.20)`
- 좌측 4px 컬러 바로 타입 구분:
  - Success: `--color-success` (#27AE60)
  - Danger/Error: `--color-danger` (#E74C3C)
  - Warning: `--color-warning` (#F39C12)
  - Info: `--color-info` (#2980B9)

**애니메이션**
- 등장: `translateY(16px)` → `translateY(0)` + `opacity 0 → 1`, duration 200ms, easing `ease-out`
- 퇴장: `opacity 1 → 0` + `translateY(0) → translateY(8px)`, duration 150ms, easing `ease-in`
- 자동 소멸: 3000ms 후 퇴장 애니메이션 시작

### 6.7 페이지네이션

**구조**: [이전] [1] [2] [3] ... [N] [다음]

**공통 스타일**
- 각 페이지 버튼: 36×36px, border-radius: 4px
- 기본: 배경 투명, 텍스트 `--color-neutral-700`, `--text-body-sm`
- 호버: 배경 `--color-neutral-100`
- 현재 페이지(active): 배경 `--color-primary` (#1A1A1A), 텍스트 `--color-white`, 굵기 600
- 비활성 이전/다음 버튼: 텍스트 `--color-neutral-400`, 커서 not-allowed
- 버튼 간 간격: 4px
- 전체 페이지네이션 상단 마진: 32px, 중앙 정렬

---

## 7. 아이콘 & 시각 요소

### 7.1 아이콘 라이브러리

**권장 라이브러리**: [Lucide React](https://lucide.dev/)

선택 근거:
- React 컴포넌트 형태로 제공되어 TypeScript와의 통합이 우수하다.
- MIT 라이선스로 상업적 이용에 제한이 없다.
- 일관된 스트로크 기반 디자인으로 미니멀한 스타일 방향성과 부합한다.
- 트리쉐이킹(tree-shaking)을 지원하여 번들 크기 최적화가 가능하다.

```bash
npm install lucide-react
```

### 7.2 아이콘 사이즈

| 크기 토큰 | 값 | CSS 변수 | 사용 위치 |
|----------|-----|----------|----------|
| icon-sm | 16px | `--icon-sm` | 뱃지 내 아이콘, 인라인 힌트 아이콘 |
| icon-md | 20px | `--icon-md` | 버튼 내 아이콘, 입력 필드 아이콘 |
| icon-lg | 24px | `--icon-lg` | 내비게이션 아이콘, 카드 액션 아이콘 |
| icon-xl | 32px | `--icon-xl` | 빈 상태(Empty State) 일러스트, 주요 기능 아이콘 |

### 7.3 아이콘 사용 원칙

- 아이콘만 단독으로 사용하는 경우 반드시 `aria-label` 또는 `title` 속성을 제공한다.
- 텍스트와 함께 사용하는 경우 아이콘은 `aria-hidden="true"`로 처리한다.
- 아이콘의 기본 stroke 굵기는 1.5px를 사용한다 (Lucide 기본값 준수).
- 아이콘 색상은 부모 컨테이너의 `color`를 상속받아 별도 지정을 최소화한다.

### 7.4 주요 아이콘 매핑

| 기능 | Lucide 아이콘 이름 |
|------|-------------------|
| 추가 | `Plus` |
| 수정 | `Pencil` |
| 삭제 | `Trash2` |
| 완료 처리 | `CheckCircle` |
| 완료 해제 | `RotateCcw` |
| 통계 | `BarChart2` |
| 로그아웃 | `LogOut` |
| 달력/날짜 | `Calendar` |
| 필터 | `Filter` |
| 정렬 | `ArrowUpDown` |
| 닫기 | `X` |
| 경고/에러 | `AlertCircle` |
| 정보 | `Info` |
| 성공 | `CheckCircle2` |

---

## 8. CSS 변수 정의 목록

아래의 CSS 변수를 프로젝트 루트 CSS 파일(예: `src/styles/variables.css` 또는 `src/index.css`)의 `:root` 선택자에 선언한다.

```css
:root {
  /* =============================================
   * COLOR — Primary
   * ============================================= */
  --color-primary: #1A1A1A;
  --color-primary-hover: #333333;
  --color-primary-active: #000000;
  --color-primary-foreground: #FFFFFF;

  /* =============================================
   * COLOR — Secondary
   * ============================================= */
  --color-secondary: #FFFFFF;
  --color-secondary-border: #1A1A1A;
  --color-secondary-foreground: #1A1A1A;
  --color-secondary-hover: #F5F5F5;

  /* =============================================
   * COLOR — Neutral
   * ============================================= */
  --color-neutral-900: #1A1A1A;
  --color-neutral-700: #333333;
  --color-neutral-500: #666666;
  --color-neutral-400: #999999;
  --color-neutral-200: #E5E5E5;
  --color-neutral-100: #EEEEEE;
  --color-neutral-50: #F9F9F9;
  --color-white: #FFFFFF;

  /* =============================================
   * COLOR — Semantic
   * ============================================= */
  --color-danger: #E74C3C;
  --color-danger-hover: #C0392B;
  --color-danger-active: #A93226;
  --color-danger-light: #FDECEA;
  --color-danger-foreground: #FFFFFF;

  --color-success: #27AE60;
  --color-success-light: #E9F7EF;

  --color-warning: #F39C12;
  --color-warning-light: #FEF9E7;

  --color-info: #2980B9;
  --color-info-light: #EBF5FB;

  /* =============================================
   * COLOR — Status Badge
   * ============================================= */
  --badge-upcoming-bg: #EBF5FB;
  --badge-upcoming-fg: #1A6A9A;

  --badge-inprogress-bg: #E9F7EF;
  --badge-inprogress-fg: #1A7A42;

  --badge-overdue-bg: #FDECEA;
  --badge-overdue-fg: #C0392B;

  --badge-completed-ontime-bg: #EAF4FF;
  --badge-completed-ontime-fg: #1558A6;

  --badge-completed-late-bg: #FEF9E7;
  --badge-completed-late-fg: #9A6700;

  /* =============================================
   * TYPOGRAPHY — Font Family
   * ============================================= */
  --font-sans: 'Inter', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;

  /* =============================================
   * TYPOGRAPHY — Font Size
   * ============================================= */
  --text-h1: 40px;
  --text-h2: 28px;
  --text-h3: 22px;
  --text-h4: 18px;
  --text-h5: 16px;
  --text-h6: 14px;
  --text-body-lg: 18px;
  --text-body-md: 16px;
  --text-body-sm: 14px;
  --text-caption: 12px;
  --text-label: 12px;
  --text-button: 14px;

  /* =============================================
   * TYPOGRAPHY — Font Weight
   * ============================================= */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* =============================================
   * TYPOGRAPHY — Line Height
   * ============================================= */
  --leading-tight: 1.2;
  --leading-snug: 1.4;
  --leading-normal: 1.5;
  --leading-relaxed: 1.6;
  --leading-loose: 1.7;

  /* =============================================
   * SPACING
   * ============================================= */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;

  /* =============================================
   * BORDER RADIUS
   * ============================================= */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-full: 9999px;

  /* =============================================
   * SHADOW
   * ============================================= */
  --shadow-xs: 0 1px 4px rgba(0, 0, 0, 0.06);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.10);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.16);
  --shadow-overlay: 0 4px 16px rgba(0, 0, 0, 0.20);

  /* =============================================
   * BREAKPOINTS (참조용 — JS에서 사용)
   * ============================================= */
  --bp-mobile: 360px;
  --bp-tablet: 768px;
  --bp-desktop: 1280px;

  /* =============================================
   * LAYOUT
   * ============================================= */
  --container-max-width: 1200px;
  --container-padding-mobile: 16px;
  --container-padding-tablet: 24px;
  --grid-gutter: 24px;

  /* =============================================
   * ICON SIZE
   * ============================================= */
  --icon-sm: 16px;
  --icon-md: 20px;
  --icon-lg: 24px;
  --icon-xl: 32px;

  /* =============================================
   * Z-INDEX
   * ============================================= */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 1000;
  --z-modal: 1001;
  --z-toast: 1100;

  /* =============================================
   * TRANSITION
   * ============================================= */
  --transition-fast: 0.15s ease;
  --transition-base: 0.20s ease;
  --transition-slow: 0.30s ease;
}
```
