# InvestQuest — Sprint 1 프런트엔드

증권사 신규 고객 온보딩용 **모의 투자 성향 게임**의 프런트엔드다.
SKALA "Agile 방법론 및 MSA 개발" 과정 조별 프로젝트 산출물이며,
강사 배포 템플릿(`msa-lecture/vue-frontend`)에서 출발했다.

> **현재 상태: 백엔드 미연동.** 목 데이터로 Sprint 1 전 구간이 동작한다.
> 백엔드가 도착하면 `.env`의 `VITE_USE_MOCK=false` 한 줄로 실 API에 붙는다.

## 빠른 시작

```bash
npm install
npm run dev      # http://localhost:3000
```

목 모드라 백엔드가 없어도 전 구간이 돌아간다. 로그인 버튼을 누르면
가짜 사용자로 로그인된다(아래 "목 모드" 참고).

## Sprint 1 범위

```
/  →  /login  →  /game/guide  →  /game/scenario  →  /game/invest  →  /game/confirm
홈      로그인      게임 안내        가상 시나리오        투자금 배분        확정 완료
```

발표 기획서 §3-2의 워킹 스켈레톤 정의("시나리오를 읽고 종목에 투자금을 배분한 뒤
확정까지")를 따랐다.

### 완료 조건 (기획 초안 §16)

- [x] 비로그인 사용자가 홈 화면을 볼 수 있다
- [x] 로그인 버튼으로 로그인 흐름을 시작할 수 있다
- [x] 로그인 후 사용자 정보가 홈에 표시된다
- [x] 로그인 사용자에게 게임 시작하기 버튼이 표시된다
- [x] 3일 뒤 결과와 조건별 리워드가 지급된다는 안내가 표시된다
- [x] 모의 투자이며 실제 수익을 보장하지 않는다는 안내가 표시된다
- [x] 게임 시작 버튼이 안내·시나리오 화면으로 이동한다
- [x] 시나리오 화면에 상황·투자금·기간·목표가 표시된다
- [x] 보호된 게임 URL에 비로그인 접근 시 로그인 화면으로 이동한다
- [x] 화면이 Mock Data와 연결된다
- [x] 모바일(390px)과 데스크톱에서 정상 표시된다
- [x] `npm run build`가 오류 없이 완료된다
- [x] 정상 흐름과 데이터 조회 실패 흐름을 각각 확인했다

## 목 모드

`.env`의 `VITE_USE_MOCK`이 스위치다.

| 값 | 동작 |
|---|---|
| `true` (현재) | `src/mock/` 데이터 + 가짜 로그인. 백엔드 없이 동작 |
| `false` | API Gateway(8080) + OAuth2 Authorization Code Flow |

**왜 가짜 로그인이 필요한가**: `/game/*`은 전부 인증이 필요한데,
백엔드가 없으면 auth-server도 안 떠 있어 OAuth2 로그인 자체가 불가능하다.
로그인을 못 하면 게임 화면에 진입조차 못 해 목 데이터가 무의미해진다.
**기존 OAuth2 코드는 한 줄도 지우지 않았다** — 플래그만 끄면 그대로 동작한다.

## 구조

```
src/
├── mock/                     목 데이터 (백엔드 도착 시 제거 대상)
│   ├── scenario.js           시나리오 + GAME_RULES (게임 규칙 기본값)
│   ├── stocks.js             실존 종목 6종 (가격·결과는 가상)
│   ├── participation.js      게임 세션
│   └── index.js              { data, message } 래핑 + 지연 시뮬레이션
├── api/
│   ├── index.js              axios 인스턴스 (Bearer 주입, 401 처리)
│   ├── game.js               게임 API — USE_MOCK 분기, 실 경로 주석
│   ├── auth.js  course.js  enrollment.js
├── store/
│   ├── auth.js               OAuth2 + 목 로그인
│   ├── game.js               게임 세션·배분 계산·행동 이벤트
│   └── course.js             CATEGORY_CATALOG (섹터명 확정 시 여기 하나만 수정)
├── views/
│   ├── HomeView.vue          비로그인/로그인 분기 홈
│   ├── game/                 게임 화면 4개 + 공유 스타일
│   └── Course*.vue 등        강사 템플릿 화면 (백엔드가 아직 강의 API라 유지)
└── components/game/          GameProgress · NoticeCard · AllocationRow
```

## 백엔드 연동 시 할 일

1. `.env`에서 `VITE_USE_MOCK=false`
2. `src/api/game.js`의 `PATH` 상수를 확정 경로로 교체
3. `src/store/course.js`의 `CATEGORY_CATALOG`를 확정 섹터 enum으로 교체 (여기 한 곳뿐)
4. `EnrollRequest`에 `investmentAmount`·`participationId`가 추가됐는지 확인

### ⚠️ API 경로 제약

API Gateway는 소스 없는 완성 이미지라 **라우트를 추가할 수 없다.**
아래 5개 prefix 밖의 경로는 **404**가 난다.

```
/api/users  /api/courses  /api/enrollments  /api/payments  /api/recommend
```

기획 초안 §13의 `/api/games/available`, `/api/scenarios/{id}`는 **쓸 수 없다.**
`src/api/game.js`에 대안 경로(제안)를 주석으로 적어 뒀다.

## 아직 팀 결정을 기다리는 것

코드에서 값을 지어내지 않고 한 곳에 모아 뒀다. 결정되면 그 파일만 고치면 된다.

| 항목 | 현재 기본값 | 위치 |
|---|---|---|
| 현금 보유 허용 / 종목 수 제한 | 허용 / 무제한 | `src/mock/scenario.js`의 `GAME_RULES` |
| 섹터명 | 반도체·바이오·방산 (DB 시드에 맞춤) | `src/mock/stocks.js` |
| API 경로 | 미확정 (제안값) | `src/api/game.js`의 `PATH` |
| 행동 이벤트 전송 여부 | **수집만 하고 전송 안 함** | `src/store/game.js`의 `events` |

행동 이벤트 4종(`GAME_STARTED`·`SCENARIO_VIEWED`·`ALLOCATION_CHANGED`·`INVESTMENT_SUBMITTED`)을
수집한다. **"선택을 바꾼 횟수"는 최종 선택만 DB에 저장되므로 프런트에서만 관찰 가능하다.**

## 안내

- **실존 종목명**을 쓰지만 **제시 가격과 결과는 가상**이며 실제 시세가 아니다.
- 모의 투자이며 실제 매매가 이루어지지 않는다.
- 게임 결과는 참고용 보조 정보이며 공식 투자자 성향 진단을 대체하지 않는다.

## `.env`에 대하여

`.env`를 커밋했다. 값이 전부 **강사 배포 템플릿의 고정 공개값**이고
(`web-client`/`web-secret`은 auth-server 이미지에 하드코딩돼 있다),
팀원이 clone 후 바로 `npm run dev`할 수 있어야 하기 때문이다.
**실제 비밀이 아니며, 실서비스라면 client_secret을 프런트에 두면 안 된다.**
