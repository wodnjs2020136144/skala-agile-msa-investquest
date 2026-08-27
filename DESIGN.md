---
name: InvestQuest
description: 게임으로 시작하는 나의 첫 투자 성향 분석 — 토스증권 문법을 그대로 따르는 모바일 우선 웹 프런트
colors:
  ground: "#F2F4F6"
  surface: "#FFFFFF"
  fill-weak: "#F2F4F6"
  fill: "#E8EBED"
  fill-strong: "#DDE1E6"
  text-strong: "#191F28"
  text: "#4E5968"
  text-weak: "#6B7684"
  text-disabled: "#B0B8C1"
  line: "#E5E8EB"
  line-strong: "#D1D6DB"
  brand: "#3182F6"
  brand-strong: "#1B64DA"
  brand-weak: "#E8F3FF"
  brand-weaker: "#F4F9FF"
  on-brand: "#FFFFFF"
  up: "#F04452"
  up-weak: "#FDECEE"
  down: "#3182F6"
  down-weak: "#E8F3FF"
  flat: "#8B95A1"
  positive: "#0B8F63"
  positive-weak: "#E4F7F0"
  negative: "#F04452"
  negative-weak: "#FDECEE"
  caution: "#FF9500"
  caution-text: "#B26A00"
  caution-weak: "#FFF6E5"
typography:
  display:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Segoe UI', Roboto, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.32
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Segoe UI', Roboto, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.32
    letterSpacing: "-0.02em"
  title:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Segoe UI', Roboto, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "normal"
  body:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Segoe UI', Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Segoe UI', Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
  number:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Segoe UI', Roboto, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.32
    letterSpacing: "-0.02em"
    fontVariation: "tabular-nums"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  full: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "7": "32px"
  "8": "40px"
  "9": "48px"
  "10": "64px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.on-brand}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 20px"
  button-primary-hover:
    backgroundColor: "{colors.brand-strong}"
    textColor: "{colors.on-brand}"
  button-disabled:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.text-disabled}"
  button-secondary:
    backgroundColor: "{colors.brand-weak}"
    textColor: "{colors.brand}"
    rounded: "{rounded.md}"
    height: "44px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.text-strong}"
    rounded: "{rounded.md}"
    height: "44px"
  button-ghost:
    backgroundColor: "{colors.fill-weak}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    height: "44px"
  button-cta:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.on-brand}"
    rounded: "{rounded.lg}"
    height: "56px"
  chip:
    backgroundColor: "{colors.fill-weak}"
    textColor: "{colors.text}"
    rounded: "{rounded.full}"
    height: "36px"
    padding: "0 16px"
  chip-brand:
    backgroundColor: "{colors.brand-weak}"
    textColor: "{colors.brand}"
    rounded: "{rounded.full}"
    height: "36px"
  chip-on-ground:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.full}"
    height: "36px"
  badge:
    backgroundColor: "{colors.fill-weak}"
    textColor: "{colors.text}"
    rounded: "{rounded.full}"
    height: "24px"
    padding: "0 12px"
  tag-brand:
    backgroundColor: "{colors.brand-weak}"
    textColor: "{colors.brand}"
    rounded: "{rounded.full}"
    height: "28px"
    padding: "0 12px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "20px"
  card-lg:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "24px"
  notice-warn:
    backgroundColor: "{colors.caution-weak}"
    textColor: "{colors.caution-text}"
    rounded: "{rounded.lg}"
    padding: "20px"
  input:
    backgroundColor: "{colors.fill-weak}"
    textColor: "{colors.text-strong}"
    rounded: "{rounded.md}"
    height: "52px"
    padding: "0 16px"
  input-focus:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-strong}"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    height: "32px"
    padding: "0 12px"
  nav-link-active:
    backgroundColor: "{colors.brand-weak}"
    textColor: "{colors.brand}"
  bottom-cta-bar:
    backgroundColor: "{colors.surface}"
    padding: "12px 20px"
---

# Design System: InvestQuest

<!--
  범위: vue-frontend/ 의 웹 프런트엔드만. 백엔드 서비스는 이 문서와 무관하다.
  근거: 2026-08-27 빌드된 코드(global.css · ui.css · game-page.css · 게임 흐름 뷰 4개 · 홈 · 로그인)와
  .impeccable/review/*.jpg 스크린샷. 계획이 아니라 실제로 배포된 값만 적었다.
  토큰의 원본은 vue-frontend/src/assets/styles/global.css 이고, 이 파일의 frontmatter 는 그 사본이다.
  값을 바꾸려면 global.css 를 먼저 고치고 여기를 따라 맞춘다.
-->

## Overview

**Creative North Star: "이미 아는 증권 앱"**

InvestQuest 는 증권사에 막 가입한 초보 투자자가 모바일에서 여는 게임형 온보딩이다. 그래서 화면은
새로운 정체성을 실험하지 않고 사용자가 이미 손에 익힌 **토스증권 웹·토스 앱의 문법**을 그대로
따른다(PRODUCT.md 기준선, 2026-08-27 확정). 회색 바닥 위에 테두리 없는 흰 카드가 놓이고, 경계는
선이나 그림자가 아니라 **면의 명도 차이**로 선다. 숫자는 검정으로 크게, 파랑은 오직 누를 수 있는 것에만
쓴다. 사용자가 이 화면에서 새로 배워야 할 것은 게임 규칙뿐이어야 하고, UI 는 배울 것이 없어야 한다.

밀도는 모바일 기준의 여유 있는 리스트다. 한 화면에 큰 숫자 하나(잔여 현금·투자금·점수), 그 아래
라벨·값 행이 hairline 으로 나뉘어 이어진다. 카드 안에 카드를 넣지 않고, 상자 대신 선 하나로 행을
나눈다. 주 액션은 화면 하단에 고정된 56px 파란 버튼 하나이고, 나머지 액션은 회색 pill 칩이다.

이 세계가 거부한 것은 원본 강사 템플릿(LMS)의 문법이다: 남색 그라디언트, 1px 테두리 카드, 들어 올리는
hover 그림자, 카드 안의 타일, 이모지 아이콘. 그 화면들(강의·내 학습·마이페이지)은 코드에 남아 있지만
목 모드에서 숨겨져 있고, 이 문서의 대상이 아니다(Layout 절 마지막 참고).

**Key Characteristics:**
- 회색 바닥(`--bg`) + 흰 카드(`--surface`) 두 면의 대비가 구조의 전부. 테두리·hover 그림자 없음.
- 큰 숫자는 검정(`--text-strong`) 700, tabular-nums. 파랑(`--brand`)은 액션·선택 상태에만.
- 모든 작은 액션은 pill 칩, 주 액션은 하단 고정 56px CTA(모바일) 하나.
- 카드 안은 hairline 행(`--line` 1px)으로만 나눈다. 중첩 타일 없음.
- 눌림은 `scale(.97)`, hover 는 배경이 한 단 짙어지는 것뿐.
- 트랙은 `width` 가 아니라 `scaleX` 로 움직인다.
- 아이콘은 인라인 SVG stroke 만. 이모지 없음. 최대 굵기 700.
- 라이트·다크 두 팔레트를 시맨틱 토큰 한 벌이 덮는다. 컴포넌트는 `--l-*`/`--d-*` 를 직접 쓰지 않는다.
- 등락은 한국 관례: 빨강 상승 · 파랑 하락. 하락 파랑 == 브랜드 파랑은 의도된 수렴.

## Colors

토스 팔레트의 회색 6단과 파랑 1색으로 거의 모든 화면이 서고, 빨강·초록·주황은 상태에만 잠깐 등장한다.

### Primary
- **토스 블루** (`--brand`, #3182F6): 주 버튼 배경, 활성 내비 링크 글자, 선택된 종목 카드의 안쪽 링(1.5px inset), 진행 트랙의 채움, 체크 아이콘, 텍스트 버튼 색. **누를 수 있거나 진행 중인 것**에만 쓴다.
- **토스 블루 (진하게)** (`--brand-strong`, #1B64DA): 주 버튼 hover 배경, 텍스트 버튼 hover. 들어 올리지 않고 짙어진다.
- **연파랑 면** (`--brand-weak`, #E8F3FF): 브랜드 칩·태그·활성 내비의 배경, 보조 버튼 배경, 번호 원(`step-num`, `how-list::before`) 배경, `::selection`. 파랑 글자가 그 위에 앉는다.
- **더 연한 파랑** (`--brand-weaker`, #F4F9FF): 로그인 홈 상단 320px 그라디언트의 시작색뿐(`--gradient-hero`). 다른 데서 쓰지 않는다.
- **브랜드 위 글자** (`--text-on-brand`, #FFFFFF): 파란 버튼과 확정 체크 원 위의 흰 글자·아이콘.

### Neutral
- **바닥** (`--bg`, #F2F4F6): 페이지 전체 배경. 카드는 이 위에 놓인다. `theme-color` 메타도 이 값.
- **면** (`--surface`, #FFFFFF): 카드, 헤더, 하단 CTA 바, 로그인 페이지 전체, 포커스된 인풋 배경. `--surface-elevated` 는 라이트에서 같은 값이고 다크에서 한 단 밝다.
- **한 단 낮은 면** (`--fill-weak`, #F2F4F6): 흰 카드 위의 인풋·칩·ghost 버튼 배경. 라이트에서는 바닥과 같은 값이라 **회색 바닥 위에 직접 놓으면 보이지 않는다** — 그 경우 `.chip-on-ground`(흰 면 + 카드 그림자)를 쓴다.
- **채움** (`--fill`, #E8EBED): 트랙 배경, 비활성 버튼 배경, 칩·인풋의 hover 배경, 스켈레톤 하이라이트, 진행 바의 남은 단계.
- **짙은 채움** (`--fill-strong`, #DDE1E6): 스크롤바 thumb 뿐.
- **강한 글자** (`--text-strong`, #191F28): 제목, 큰 숫자, 행의 값, 종목명. 검정에 가까운 남회색.
- **본문 글자** (`--text`, #4E5968): 설명문, 행의 라벨, 칩 글자, ghost 버튼 글자.
- **약한 글자** (`--text-weak`, #6B7684): 캡션·단위·기준가 라벨·13px 라벨. 13px 에서도 흰 면 위 4.5:1 을 넘기기 위해 토스 원본의 #8B95A1(3.2:1)을 버리고 이 값을 골랐다.
- **비활성 글자** (`--text-disabled`, #B0B8C1): 비활성 버튼·칩 글자, 비중 0% 숫자. 배경은 항상 `--fill` 또는 `--fill-weak` 와 짝이다.
- **hairline** (`--line`, #E5E8EB): 카드 안 행 사이 1px, 로그인 폼 위 구분선, 지표 목록 위아래.
- **굵은 hairline** (`--line-strong`, #D1D6DB): outline 버튼의 1.5px inset 링, 영수증 합계 위 1.5px 선.
- **보합** (`--flat`, #8B95A1): 등락 없음 표시용. select 의 chevron 색.

### Tertiary (상태색 — 잠깐만 등장)
- **상승 / 부정** (`--up` · `--negative`, #F04452): 등락 빨강과 에러 글자가 같은 값이다. 에러 메시지 글자, 예산 초과 카드의 숫자. 배경은 `--negative-weak`(#FDECEE).
- **하락** (`--down`, #3182F6): 브랜드와 같은 값. 하락 표시용 토큰을 따로 두는 이유는 나중에 갈라도 컴포넌트가 안 깨지게 하려는 것이다. 배경 `--down-weak`(#E8F3FF).
- **긍정** (`--positive`, #0B8F63): 회원가입 성공 메시지, teal 배지. 배경 `--positive-weak`(#E4F7F0). 등락과 무관한 "잘 됐다" 신호.
- **주의** (`--caution`, #FF9500 / `--caution-text`, #B26A00 / `--caution-weak`, #FFF6E5): 준법 고지 카드(`NoticeCard tone="warn"`) 한 곳. 배경은 `--caution-weak`, 제목·아이콘은 `--caution-text`, 불릿 점은 `--caution`. 주황 배경 위에는 항상 진한 `--caution-text` 를 쓴다(#FF9500 은 글자로 못 쓴다).

### 다크 모드
시맨틱 토큰 이름은 같고 값만 `--d-*` 팔레트로 바뀐다: 바닥 #17171C, 면 #202027, 강한 글자 #E4E4E5, 브랜드 #4593FC, 상승 #F86D75. 다크 블록은 두 개(`@media (prefers-color-scheme: dark)` 의 `:root:not([data-theme='light'])`, 그리고 헤더 토글이 박는 `:root[data-theme='dark']`)이고 **내용이 같아야 하므로 항상 쌍으로 고친다.** 저장된 테마는 `localStorage['iq-theme']` 에 있고 index.html 인라인 스크립트가 첫 페인트 전에 적용한다. 다크에서는 카드 그림자(`--elev-card`)가 `none` 이 되어 카드와 바닥이 순수하게 명도차로만 갈린다.

### Named Rules
**The Blue-Is-Action Rule.** 파랑(`--brand`)은 누를 수 있는 것, 선택된 것, 진행 중인 것에만 쓴다. 금액·비중·수량 같은 정보 숫자는 검정(`--text-strong`)이다. 화면에서 파랑을 봤다면 그것은 버튼·링크·선택 링·진행 트랙 중 하나여야 한다.

**The Two-Surfaces Rule.** 라이트에서 `--fill-weak` 와 `--bg` 는 같은 값(#F2F4F6)이다. 흰 카드 위에는 `--fill-weak`(인풋·칩), 회색 바닥 위에는 `--surface`(카드·`.chip-on-ground`)를 놓는다. 회색 위에 회색을 놓으면 사라진다.

**The Red-Up Rule.** 등락색은 한국 관례를 따른다: 상승 빨강(`--up`), 하락 파랑(`--down`). 하락 파랑이 브랜드 파랑과 같은 값인 것은 토스 팔레트의 의도된 수렴이며 고칠 것이 아니다. 등락에는 반드시 `--up`/`--down` 토큰을 쓰고 `--brand`/`--negative` 를 직접 쓰지 않는다.

**The Disabled-Is-Fill Rule.** 비활성은 `opacity` 가 아니라 `--fill` 배경 + `--text-disabled` 글자다. 반투명 버튼은 이 세계에 없다.

## Typography

**Display Font:** Pretendard Variable (npm `pretendard` dynamic-subset woff2, 실제 쓰인 글자 범위만 받는다)
**Body Font:** 같은 Pretendard Variable — 한 서체 한 벌.
**Fallback:** Pretendard → -apple-system / BlinkMacSystemFont / system-ui → Apple SD Gothic Neo / Malgun Gothic → Segoe UI / Roboto → sans-serif
**Label/Mono Font:** 따로 없음. 숫자는 같은 서체의 `font-variant-numeric: tabular-nums` 로 줄을 맞춘다(`body` 전역).

**Character:** 토스가 쓰는 그 서체다. 굵기는 400·500·600·700 네 단만 쓰고 700 을 넘기지 않는다. 제목과 큰 숫자는 -0.02em 으로 조여 단단하게, 본문은 자간 없이. `word-break: keep-all` 로 한국어 어절이 줄 끝에서 쪼개지지 않는다.

### Hierarchy
- **Display** (700, 32px, 1.32, -0.02em): 비로그인 홈의 히어로 제목(모바일). 데스크톱(≥768px)에서만 44px 로 커진다 — 스케일 밖의 값이라 이 한 곳에서 끝난다. 로그인 홈 제목도 28→32px.
- **Headline** (700, 24px → 28px at ≥768px, 1.32, -0.02em): 게임 화면의 `page-title`, 홈 섹션 제목, 성향 이름(`profile-name`). `text-wrap: balance`.
- **Title** (700, 17px, 1.5): 섹션 제목(`sec-title`), 종목명, 단계 제목, 로고 워드마크. 카드 안 소제목은 15px/700(`profile-subtitle`, `nc-title`).
- **Body** (400, 15px, 1.5 또는 설명문 1.7): 본문·행 라벨·설명. 시나리오 상황 설명만 17px/1.7 `--text-strong`. 행 값은 15px/700 `--text-strong`.
- **Small body** (400, 14px, 1.5–1.7): 고지 카드 항목, 단계 설명, 에러 메시지, 텍스트 버튼(600).
- **Label** (500, 13px): 캡션·라벨·단위(`--text-weak`), 칩 글자(600), 진행 단계 이름. 배지는 12px/600. 11px 토큰은 정의만 있고 쓰지 않았다.
- **Number** (700, tabular-nums, -0.01em): `.num` 기본(부모 크기). `.num-md` 20px, `.num-lg` 24px(-0.02em), `.num-xl` 32px(-0.02em), 전부 1.32. 잔여 현금·가상 포트폴리오 합계·성향 점수가 `num-xl`, 종목 비중·보유 투자금이 `num-lg`.

### Named Rules
**The One-Big-Number Rule.** 한 화면(또는 한 카드)에 `num-xl` 은 하나다. 배분 화면은 잔여 현금, 시나리오는 보유 투자금, 확정 화면은 성향 점수. 나머지 숫자는 그보다 두 단 이상 작다.

**The No-Eyebrow Rule.** 제목 위에 작은 라벨(kicker·eyebrow)을 올리지 않는다. 배지·태그는 제목 **아래**(`hero-badge`, `scenario-tag`) 또는 **옆**(`profile-kicker`, 종목명 옆 섹터 배지)에 놓는다.

**The Tabular Rule.** 금액·비중·수량은 `font-variant-numeric: tabular-nums` 로 세로 정렬된다. 전역이라 따로 켤 필요 없지만 끄지도 않는다. 금액은 `toLocaleString('ko-KR')` + `원`, 비중은 정수 `%`, 수량은 정수 `주`.

## Layout

**모바일 우선 단일 컬럼.** 게임 흐름 4화면은 `game-page.css` 의 `.page > .page-inner` 뼈대를 공유한다: 회색 바닥 위 `max-width: 640px`(`--content-max`) 컬럼, 좌우 여백 20px, 상단 24px(≥768px 에서 40px), 하단 64px. 배분 화면만 720px 로 넓힌다. `.page-inner` 는 카드가 아니다 — 흰 면은 안쪽 `.card` 가 맡는다. 비로그인 홈만 1120px(`--content-max-wide`) 2컬럼 히어로(1.1fr : 1fr, ≥768px)를 쓰고, 로그인은 흰 바닥 위 400px 컬럼이다.

**세로 리듬.** 4px 단위 스케일(`--space-1..10` = 4·8·12·16·20·24·32·40·48·64). 카드 사이 8px(종목 리스트) 또는 16px, 섹션 사이 24–32px, 카드 안 패딩 20px(`card-pad`), 히어로·홈 섹션 40–64px. 카드 안 행은 `padding: 16px 0`(또는 12px) + 1px hairline 으로 이어지고 행 최소 높이는 52px(`.iq-row`).

**고정 요소.** 헤더 56px(`--header-h`, sticky, `--z-header: 100`). 배분 화면의 주문 요약 카드는 헤더 아래 8px 에 sticky(`--z-sticky: 50`)이고, 모바일에서 160px 이상 스크롤하면 `.stuck` 으로 접혀 큰 숫자가 32→20px, 보유·합계 행이 사라진다. 하단 CTA 는 `BottomCta` 가 `<768px` 에서 `<Teleport to="body">` 로 뷰포트 하단에 고정(`--z-cta: 90`)하고 같은 높이의 스페이서(56 + 24px + safe-area)를 남긴다. ≥768px 에서는 컬럼 안 제자리 블록으로 돌아오고 스페이서는 40px 여백이 된다. `fade-in-up` 은 `animation-fill-mode: backwards` — `both` 로 두면 transform 이 남아 fixed 자식의 기준이 뷰포트가 아니게 된다.

**브레이크포인트.** 주 경계는 하나, **768px**(CSS 와 `BottomCta` 의 `matchMedia` 가 같은 값). 보조: 560px(종목 카드 컨트롤이 세로→가로), 480px(헤더 워드마크 숨김). 데스크톱은 시연용이고 실제 사용 장면은 모바일이므로 폭이 넓어져도 컬럼이 640/720px 을 넘지 않는다.

**Z 순서.** sticky 50 < CTA 90 < header 100 < overlay 200.

**범위 밖 화면.** `views/CourseListView.vue` · `CourseCreateView.vue` · `CourseDetailView.vue` · `EnrollmentView.vue` · `MyPageView.vue` · `components/AppSidebar.vue` · `CourseCard.vue` · `views/LandingView.vue`(dead) 는 강사 템플릿 화면으로 목 모드에서 숨겨져 있다. 이들은 Layer 3 옛 이름 alias(`--color-*` `--radius-*` `--shadow-*`, 전부 시맨틱 토큰을 가리킨다)만 소비하며 이 문서의 규칙을 따르지 않는다. 새 코드는 alias 를 쓰지 않는다.

## Elevation & Depth

**면 대비가 깊이다.** 라이트 모드의 카드 그림자 `--elev-card` 는 `0 1px 2px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.04)` 로 거의 보이지 않는 안개 수준이고, 다크 모드에서는 `none` 이다. 즉 카드가 서는 이유는 그림자가 아니라 흰 면(#FFFFFF)과 회색 바닥(#F2F4F6)의 명도차다. 테두리는 카드에 없다. hover 로 그림자가 커지거나 요소가 떠오르는 일은 없다 — 배경이 한 단 짙어질 뿐이다.

### Shadow Vocabulary
- **카드 안개** (`--elev-card`: `0 1px 2px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.04)`; 다크 `none`): `.card`, `NoticeCard`, `.chip-on-ground`, 힌트 박스. 상태에 따라 변하지 않는다.
- **sticky 요약** (`--elev-sticky`: `0 2px 12px rgba(0,0,0,.06)`; 다크 `0 4px 16px rgba(0,0,0,.45)`): 배분 화면의 주문 요약 카드처럼 콘텐츠 위에 떠서 스크롤하는 것.
- **하단 CTA** (`--elev-cta`: `0 -2px 12px rgba(0,0,0,.05)`; 다크 `0 -2px 16px rgba(0,0,0,.5)`): 위쪽으로 떨어지는 그림자. 고정 CTA 바 한 곳.
- **포커스 링** (`--ring`: `0 0 0 3px rgba(49,130,246,.32)`; 다크 `rgba(69,147,252,.45)`): `:focus-visible` 에만. 마우스 클릭에는 뜨지 않는다.
- **선택 링** (`inset 0 0 0 1.5px var(--brand)`): 선택된 종목 카드와 포커스된 인풋. 바깥 테두리가 아니라 안쪽 링이라 레이아웃이 밀리지 않는다.

### Named Rules
**The No-Lift Rule.** hover 에 `translateY` 나 그림자 확대를 쓰지 않는다. hover 는 배경이 한 단 짙어지는 것(`--fill-weak → --fill`, `--brand → --brand-strong`), 눌림은 `transform: scale(.97)`(칩은 .96, 토글은 .94)이다.

**The Hairline-Not-Tile Rule.** 카드 안에서 정보를 나눌 때 작은 상자(타일)를 만들지 않는다. 행 사이 `1px solid var(--line)` 하나로 나눈다(`.iq-row + .iq-row`, `.term + .term`, `.rc-row + .rc-row`, `.metric-grid > div`). 합계처럼 강조할 행은 `1.5px solid var(--line-strong)` 위에 놓는다.

## Shapes

**둥글되 알약은 액션에만.** 카드 16px(`--r-16`, 홈의 큰 카드는 20px), 버튼 12px(`--r-12`, 하단 CTA·전폭 버튼은 16px), 인풋 12px, 작은 버튼·내비 링크·에러 박스·포커스 링 8px(`--r-8`). 칩·배지·태그·트랙은 완전한 pill(`--r-full: 999px`). 원형(50%)은 아바타(32px), 번호 원(24/32px), 확정 체크 원(64px), 스피너, 불릿 점(4px)에만.

테두리는 없다. 경계가 필요한 곳은 배경색 차이(카드), 1px hairline(행), 또는 inset 링(outline 버튼 1.5px `--line-strong`, 선택·포커스 1.5px `--brand`)으로 처리한다. `border` 속성으로 상자를 그리는 곳은 없다.

트랙은 6px 높이 pill(`.track`), 진행 단계 바는 4px. 채움(`.track-fill`)은 `width: 100%` 고정에 `transform: scaleX(비율)`, `transform-origin: left center`, `.35s var(--ease)`. 폭을 애니메이션하지 않는다.

## Components

### Buttons
공통 `.btn`: inline-flex, **44px** 높이, 좌우 20px, 12px 라운드, 15px/600, `-webkit-tap-highlight-color: transparent`. 전환은 background-color·color·transform 180ms `cubic-bezier(.25,.8,.5,1)`(`--dur`, `--ease`). `:active` 에 `scale(.97)`.
- **Primary** (`.btn-primary`): `--brand` 배경 + 흰 글자. hover `--brand-strong`. 한 화면에 하나.
- **Secondary** (`.btn-secondary`): `--brand-weak` 배경 + `--brand` 글자. hover 는 `color-mix` 로 파랑 20% 섞임.
- **Outline** (`.btn-outline`): 투명 배경, `--text-strong` 글자, `inset 0 0 0 1.5px var(--line-strong)`. hover `--fill-weak`.
- **Ghost** (`.btn-ghost`): `--fill-weak` 배경 + `--text` 글자. hover `--fill`. 하단 CTA 의 보조 액션(홈으로·이전), 헤더의 로그인·로그아웃.
- **Disabled** (`:disabled`, `.disabled`): `--fill` 배경 + `--text-disabled` 글자, `pointer-events: none`, transform 없음. `router-link` 에는 `.disabled` 클래스로 같은 모양을 준다. opacity 를 쓰지 않는다.
- **CTA 크기** (`BottomCta` 안, `.btn-full`, `.btn-lg`): **56px**(`--cta-h`) 높이, 16px 라운드, 17px/700. 주 버튼은 `flex: 1`, 보조는 좌우 24px 고정폭. ≥768px 에서 52px/15px.
- **Small** (`.btn-sm`, 헤더): 34px, 좌우 16px, 13px, 8px 라운드.
- **Text button** (`.text-btn`): 배경 없음, `--brand` 14px/600, hover `--brand-strong`. "회원가입"·"다시 시도" 같은 인라인 보조 액션.

### Chips
- **Style** (`.chip`): pill, **36px** 높이, 좌우 16px, `--fill-weak` 배경, `--text` 13px/600. hover `--fill`, active `scale(.96)`. disabled 는 `--text-disabled` 글자 + 같은 배경.
- **Brand** (`.chip-brand`): `--brand-weak` + `--brand`. 선택된 필터·강조 액션용.
- **On ground** (`.chip-on-ground`): 회색 바닥 위에 놓일 때 — `--surface` 배경 + `--elev-card`. hover 도 흰색 유지. 배분 화면의 "전부 현금으로".
- **Quick allocation** (종목 카드 안): 25% · 50% · 최대 · 비우기 4개가 한 줄, 모바일에서 `flex: 1` 균등, ≥560px 에서 내용 폭.

### Badges / Tags
- **Badge** (`.badge`): pill 24px, 좌우 12px, 12px/600. 기본 `-gray`(`--fill-weak` + `--text`) — 종목명 옆 섹터. `-blue`(`--brand-weak`/`--brand`), `-teal`, `-amber` 가 있고 purple·pink 는 템플릿 화면 전용.
- **Tag** (`.hero-badge`, `.status-chip`, `.scenario-tag` — 세 곳이 같은 정의): pill **28px**, 좌우 12px, `--brand-weak` + `--brand` 13px/700. 제목 아래 또는 카드 첫 줄. 제목 위에 두지 않는다.

### Cards / Containers
- **Corner Style:** 16px(`.card`), 20px(`.card-lg`, 홈 히어로 목업·단계 카드).
- **Background:** `--surface`. 바닥은 `--bg`.
- **Shadow Strategy:** `--elev-card`(안개, 다크에서 none). 상태별 변화 없음. 선택 시에만 `inset 0 0 0 1.5px var(--brand)` 가 더해진다(`AllocationRow.selected`).
- **Border:** 없음.
- **Internal Padding:** 20px(`.card-pad`, `AllocationRow`, `NoticeCard`, `profile-card`); 행 리스트 카드는 `padding: 8px 20px` 에 행마다 `16px 0`; 홈 목업 24px.
- **Row list inside** (`.iq-list > .iq-row`): 좌 라벨 15px `--text`, 우 값 15px/700 `--text-strong`, 부제 13px `--text-weak`. 최소 52px, 행 사이 hairline.

### Inputs / Fields
- **Style:** 테두리 없음, `--fill-weak` 배경, 12px 라운드, `--text-strong` 글자. 로그인 폼 52px/16px(iOS 자동 줌 방지), 수량 입력 48px/20px/700 우측 정렬 + 절대 배치 단위 "주"(`--text-weak`). 브라우저 스피너·autofill 배경은 지운다.
- **Hover:** `--fill`.
- **Focus:** 배경이 `--surface` 로 밝아지고 `inset 0 0 0 1.5px var(--brand)`. 바깥 outline 없음.
- **Placeholder:** `--text-weak`. **Label:** 13px/600 `--text`, 인풋 위 8px.
- **Select:** `appearance: none` + 우측 18px chevron SVG(data URI, stroke #8B95A1).
- **Error / Success:** 인풋을 빨갛게 칠하지 않고 아래에 박스 — `--negative-weak` 배경 + `--negative` 글자(에러), `--positive-weak` + `--positive`(성공). 12px 라운드, 14px, `12px 16px`.

### Navigation
- **Header** (`AppHeader`): 56px sticky, `--surface` 불투명, 테두리·그림자 없음(바닥과의 명도차가 경계). 내용은 1120px 컬럼: 로고 28px + 워드마크 17px/700 → 내비 링크 → 우측 테마 토글·아바타·버튼.
- **Nav link:** 32px, 좌우 12px, 8px 라운드, 15px/600 `--text`. hover `--fill-weak` + `--text-strong`, active `--brand-weak` + `--brand`.
- **Avatar:** 32px 원, `--fill-weak`, 이니셜 13px/700. 목 모드에서는 `is-static` 으로 hover 반응 없음.
- **Theme toggle:** 36px 원, stroke 1.8 해·달 SVG, hover `--fill-weak`, active `scale(.94)`.
- **Mobile:** <768px 에서 보조 링크(강의·내 학습) 숨김, <480px 에서 워드마크 숨김. 햄버거 없음.
- **Game progress** (`GameProgress`): 번호 원 대신 3분할 4px pill 트랙. 지난·현재 단계 `--brand`, 남은 단계 `--fill`. 라벨 13px — 현재 `--text-strong` 700, 지난 `--text` 500, 남은 `--text-weak` 500. `aria-current="step"`.

### Bottom CTA (signature)
`BottomCta` 는 화면의 주 액션 자리다. <768px: body 로 텔레포트된 fixed 바(`--surface`, `--elev-cta`, 패딩 `12px 20px calc(12px + safe-area-inset-bottom)`), 안쪽 640px 컬럼에 [보조 ghost] + [주 primary flex:1], 버튼 56px/16px 라운드/17px 700. ≥768px: 컬럼 안 제자리, 52px/15px. `mobile-only` 프롭이면 데스크톱에서 사라진다(비로그인 홈은 히어로 버튼으로 충분). 스페이서가 같은 높이를 남겨 콘텐츠가 가려지지 않는다.

### Order Summary (signature)
배분 화면 상단의 sticky 카드. 그리드 `hero / meter / row1 row2`: "잔여 현금" 라벨 13px `--text-weak` 위에 `num-xl`(모바일 24px, 데스크톱 32px), 그 아래 6px 현금 비중 트랙 + 13px 라벨, 마지막 줄에 보유 투자금·투자 합계 두 작은 행(12–13px 라벨, 14–15px/600 값). 그림자 `--elev-sticky`. 스크롤 160px 뒤 모바일에서 한 줄로 접힌다.

### Allocation Card (signature)
종목 하나 = 카드 하나(`AllocationRow`), 리스트 간격 8px. 위: 종목명 17px/700 + 섹터 gray 배지, 우측 "기준가" 12px + 금액 15px/600. 설명 13px `--text-weak` 2줄 clamp. 중간: 비중 `num-lg`(0% 이면 `--text-disabled`) + 수량 13px, 6px 트랙. 아래: 수량 인풋 + 칩 4개. 선택되면 1.5px 파란 inset 링.

### Notice Card
준법 고지 전용(`NoticeCard`). `info`: 흰 카드 + `--text-weak` info 원 아이콘 + 4px 회색 불릿. `warn`: `--caution-weak` 배경, 제목·아이콘 `--caution-text`, 불릿 `--caution`. 제목 15px/700, 항목 14px/1.7 `--text`. 어느 화면에서도 빠지지 않는다(PRODUCT.md 원칙 3).

### Feedback
- **Spinner** (`.iq-spinner`): 28px 원, 3px `--fill` 테두리 + `--brand` 상단, .8s 회전.
- **Skeleton** (`.iq-skeleton`): 14px 높이 8px 라운드, `--fill-weak → --fill → --fill-weak` 1.4s shimmer.
- **Done mark:** 64px `--brand` 원 + stroke 3 흰 체크, `pop` .3s(scale .8→1).
- **Reduced motion:** 전역에서 모든 animation·transition 을 0.01ms 로 줄인다.

## Do's and Don'ts

### Do:
- **Do** 새 코드에서는 Layer 1 시맨틱 토큰(`--bg` `--surface` `--text-*` `--brand` `--fill*` `--line*`)과 Layer 2 스케일만 쓴다. `--l-*`/`--d-*` 원시값과 `--color-*` alias 는 쓰지 않는다.
- **Do** 다크 블록 두 개(`prefers-color-scheme` + `[data-theme='dark']`)를 항상 같이 고친다.
- **Do** 회색 바닥 위 흰 카드(16px), 카드 안은 1px `--line` hairline 행. 카드 안에 카드·타일을 넣지 않는다.
- **Do** 큰 숫자는 `.num .num-xl|lg|md`(검정 700 tabular-nums). 한 화면에 `num-xl` 하나.
- **Do** 작은 액션은 pill `.chip`(36px), 주 액션은 `BottomCta` 안 `.btn-primary`(56px, 16px 라운드). 회색 바닥 위 칩은 `.chip-on-ground`.
- **Do** 비활성은 `--fill` + `--text-disabled`. 눌림은 `scale(.97)`. hover 는 배경 한 단 짙게.
- **Do** 트랙 채움은 `transform: scaleX()` 로, 선택·포커스 강조는 `inset 0 0 0 1.5px var(--brand)` 로.
- **Do** 아이콘은 인라인 SVG(`stroke="currentColor"`, stroke-width 1.8–2, 18–20px). 이모지·아이콘 폰트 금지.
- **Do** 13px 이하 캡션에는 `--text-weak`(#6B7684) 이하로 연해지지 않는다. 배지·태그는 제목 아래나 옆에.
- **Do** 등락은 `--up`(빨강)/`--down`(파랑) 토큰으로. 에러는 `--negative`, 성공은 `--positive`.
- **Do** 입력은 테두리 없는 `--fill-weak` 면, 포커스에 흰 면 + 1.5px 파란 inset 링. iOS 자동 줌을 막으려면 폼 인풋은 16px.

### Don't:
- **Don't** 카드에 `border` 를 긋거나 hover 에 그림자·`translateY` 를 주지 않는다(강사 템플릿 문법).
- **Don't** 정보 숫자(금액·비중·수량)를 파랑으로 칠하지 않는다. 파랑은 액션·선택·진행에만.
- **Don't** 제목 위에 eyebrow·kicker 를 놓지 않는다.
- **Don't** 700 을 넘는 굵기, 11px 이하 글자, `opacity` 로 만든 비활성을 쓰지 않는다.
- **Don't** 진행 트랙의 `width` 를 애니메이션하지 않는다. `fade-in-up` 을 `fill-mode: both` 로 바꾸지 않는다(fixed CTA 가 깨진다).
- **Don't** 라이트에서 `--fill-weak` 요소를 회색 바닥에 직접 놓지 않는다(같은 값이라 사라진다).
- **Don't** 한 화면에 `.btn-primary` 를 둘 이상, 하단 CTA 밖에 주 액션을 두지 않는다(데스크톱 히어로의 `mobile-only` 예외뿐).
- **Don't** 주황 `--caution`(#FF9500)을 글자색으로 쓰지 않는다. 글자는 `--caution-text`.
- **Don't** 강사 템플릿 화면(강의·내 학습·마이페이지)의 스타일을 게임 화면으로 가져오거나, 그 화면을 이 문서 기준으로 고치지 않는다 — Sprint1 범위 밖이다.
