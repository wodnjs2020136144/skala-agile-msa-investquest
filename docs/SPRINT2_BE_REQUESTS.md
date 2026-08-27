# Sprint2 — 프런트가 백엔드에 요청하는 것

작성: 황재원(FE·AI) / 2026-08-27
기준 커밋: `a429d9e` (PR #7 머지 직후)

결과·리워드 화면을 목으로 먼저 만들면서 확인한 것들이다.
**1~3번은 지금 코드에 있는 결함이고, 4번은 새로 필요한 응답 필드다.**
목 응답은 이미 실제 DTO 필드명에 맞춰 뒀으므로, 아래가 채워지면 프런트는
`VITE_USE_MOCK=false` 한 줄만 바꾸면 된다.

---

## 1. 🔴 `course → payment` 리워드 호출이 확정 400

리워드가 **한 건도 생성되지 않는다.** 보내는 쪽과 받는 쪽 DTO 가 다르다.

| | 필드 |
|---|---|
| course 가 보냄 (`PaymentRewardRequest`) | `userId`, `result` (`SUCCESS`\|`FAILED`) |
| payment 가 받음 (`InternalRewardRequest`) | `userId`, `courseId`, `returnRate` — **셋 다 `@NotNull`** |

`result` 필드는 payment 쪽에 아예 없고, `courseId`·`returnRate` 는 course 가 보내지 않는다.
`@Valid` 가 걸려 있어 검증 단계에서 400 이다.

- `course-service/src/main/java/com/lecture/course/client/dto/PaymentRewardRequest.java`
- `payment-service/src/main/java/com/lecture/payment/dto/PaymentDto.java` (`InternalRewardRequest`)

**요청**: course 쪽에서 실제 수익률을 계산해 `returnRate` 로 보내도록 통일.
payment 의 `RewardPolicy.pointsFor(returnRate)` 가 이미 그 값을 기대한다.
(`> 0` → 10,000P, 그 외 → 5,000P — 정책 문서와 일치. 이쪽은 고칠 것 없음.)

## 2. 🔴 수익 판정이 `quantity` 를 무시한다

`CourseService.getResult` 가 이렇게만 계산한다:

```java
Σ ( course.tempPrice − course.price )   // 요청의 quantity·price 를 안 씀
```

**1주 산 종목과 1000주 산 종목이 같은 취급**이고, 절대 가격이 큰 종목이 결과를 지배한다.
지금 시드로 실제 계산해 보면:

| 종목 | 차액 | 실제 수익률 |
|---|---|---|
| 삼성바이오로직스 | +13,000 | +0.8% |
| 스페코 | +161 | **+10.3%** |

절대액으로는 삼성바이오로직스가 80배 크지만 수익률은 스페코가 13배 높다.
HLB 를 1000주 사서 크게 잃어도 삼성바이오로직스 1주만 끼우면 `SUCCESS` 가 나온다.

**요청**: `× quantity` 를 넣어 수량 가중을 적용.

```java
Σ ( (tempPrice − price) × quantity )
```

요청 DTO(`ResultRequest {courseId, price, quantity}`)는 지금 그대로 두면 된다 —
프런트가 이미 그 모양으로 보낼 준비가 돼 있다.

## 3. 🔴 `EnrollRequest` 에 투자 필드가 없다

`{courseId}` 하나뿐이라 **종목별 배분 금액을 보낼 통로가 없다.**

- `investmentAmount` · `participationId` · `quantity` 전부 부재
- `Enrollment.price` 는 컬럼만 있고 `createPendingEnrollment()` 에서 세팅하지 않아 **항상 0**
- `EnrollmentService.enroll()` 의 결제 금액이 `BigDecimal.valueOf(99000)` **하드코딩**
- `unique(user_id, course_id)` 때문에 **같은 종목 재매수 불가** → 반복 플레이와 충돌

프런트가 보내려는 payload (`api/game.js` 의 `submitInvestment`):

```json
{
  "participationId": 9001,
  "allocations": [{ "stockId": 101, "price": 2400, "amount": 3600000, "quantity": 1500 }],
  "cashBalance": 2680000
}
```

**요청**: `EnrollRequest` 확장 + `price` 저장 + 하드코딩 금액 제거.
`participationId` 를 어디에 저장할지(신규 컬럼 / 신규 테이블)는 팀 논의가 필요하다 —
지금은 recommend 의 요청 DTO 안에만 있고 **DB 어디에도 저장되지 않는다.**

## 4. 결과 응답에 숫자가 필요하다 (새 요청)

`POST /api/courses/internal/result` 의 **요청은 지금 그대로 맞다.** 응답만 바꾸면 된다.

```
지금:  "SUCCESS" | "FAILED"          ← 문자열 하나
```

화면이 "얼마를 벌었는지"를 보여 줘야 하는데 숫자가 없다. 필요한 형태:

```json
{
  "returnRate": 2.62,
  "profitAmount": 192000,
  "investedTotal": 7320000,
  "evaluatedTotal": 7512000,
  "cashBalance": 2680000,
  "finalTotal": 10192000,
  "paymentId": 5001,
  "orders": [
    {
      "courseId": 101,
      "quantity": 1500,
      "buyPrice": 2400,
      "resultPrice": 2760,
      "investedAmount": 3600000,
      "evaluatedAmount": 4140000,
      "profitAmount": 540000,
      "returnRate": 15.00
    }
  ]
}
```

**`returnRate` 의 분모는 투자 원금**이다(현금 제외). 리워드 정책의 "수익률 > 0" 판정과
같은 분모를 써야 화면 숫자와 지급액이 어긋나지 않는다. 현금은 값이 변하지 않으므로
분모에 넣으면 수익률이 희석된다.

`paymentId` 가 있어야 프런트가 `GET /api/payments/internal/rewards/{paymentId}` 를 부를 수 있다.

> 참고: `GET /api/payments/internal/rewards/{paymentId}` 는 **이미 구현돼 있고 응답 필드도
> 프런트 목과 1:1로 맞다.** 1번만 고쳐지면 이 경로는 바로 쓸 수 있다.

## 5. 종목명에서 종목 코드를 떼 달라 (새 요청)

시드가 종목 코드를 `title` 안에 넣어 두었다 — `삼성전자(005930)`.
정책(`SPRINT2_REWARD_POLICY.md`)은 **"종목 코드는 사용하거나 화면에 표시하지 않는다"** 이므로
그대로 렌더하면 규정을 어긴다.

프런트 목은 이미 분리해 두었다 (`name: '삼성전자'`, `code: '005930'` — `code` 는 렌더하지 않음).

**요청**: `courses` 에 종목 코드를 별도 컬럼으로 두거나, 응답에서 `name` 과 `code` 를 나눠 달라.
지금 상태로는 프런트가 괄호를 정규식으로 떼야 하는데, 종목명에 괄호가 들어가는 경우를
구분할 수 없어 안전하지 않다.

---

## 팀 결정이 필요한 것

### A. 🔴 시드가 실존 상장사다

`init-db/02_seed_courses.sql` 이 **실제 종목코드가 붙은 실존 기업**을 쓴다:

```
제주반도체(080220) · 삼성전자(005930) · HLB(028300)
삼성바이오로직스(207940) · 스페코(013810) · 한국항공우주(047810)
```

세 문서와 정면으로 충돌한다:

- `docs/SPRINT2_REWARD_POLICY.md` — **"종목 코드 사용/표시 금지"**
- `docs/sprint1-demo.md` — **"등장하는 종목은 모두 가상이며 실존 기업과 무관하다"**
- `vue-frontend/src/mock/stocks.js` — 가상 6종(가온반도체·한별금융지주·…)

게다가 `price → tempPrice` 는 **실존 종목의 미래 가격을 임의로 지정**하는 구조다
(삼성전자 267,000 → 269,000). 여기에 성향 분석과 상품 추천이 붙으면
실제 종목 시세 예측 + 상품 권유 형태가 된다.
`recommend-service` 의 `PRODUCTS` 위에 "실존 상품의 매수를 권유하지 않기 위한
데모용 카탈로그"라고 그어 둔 선과도 어긋난다.

**팀 결정: 실존 종목 유지.** 프런트 목을 시드에 맞춰 실존 6종으로 교체했다
(`vue-frontend/src/mock/stocks.js` — 종목명·업종·기준가·결과가가 시드와 1:1).

그에 맞춰 화면 고지 문구를 고쳤다. 그대로 두면 **화면에 거짓이 표시되기 때문이다**:

| | |
|---|---|
| 전 | 등장하는 종목은 모두 가상이며 실존 기업과 무관합니다. |
| 후 | **실존 종목명을 쓰지만 제시 가격과 결과는 가상이며 실제 시세가 아닙니다.** |

HomeView · GameGuideView · GameResultView · GameRewardView 4곳.

⚠️ **아직 남은 것 두 가지**
1. `docs/sprint1-demo.md` 와 `README.md` 의 안내 문구가 여전히 "모두 가상"이다 — 발표 대본이라 같이 고쳐야 한다.
2. 정책의 **"종목 코드 표시 금지"** 와 시드의 `삼성전자(005930)` 형식이 아직 충돌한다 (위 5번 참고).

### B. recommend 의 카테고리 enum 이 아직 구 강의 축이다

| 위치 | 값 | 상태 |
|---|---|---|
| 시드 (`courses.category`, String) | 반도체 · 바이오 · 방산 | 기준 |
| 프런트 목 (`stocks.js` 의 `sector`) | 반도체 · 바이오 · 방산 | ✅ 시드에 맞춤 |
| recommend (`CourseCategory` enum) | BACKEND · FRONTEND · … | ❌ 구 강의 축 |

프런트는 시드에 맞췄으므로 남은 것은 recommend 쪽 하나다. 이것 때문에 `GET /api/recommend/{user_id}` 가 **500** 이다 —
course-service 가 `86e922d` 로 카테고리를 String 으로 바꿨는데
파이썬 스키마가 아직 enum 이라 `CourseResponse(**c)` 에서 ValidationError 가 난다.
(같은 경로가 부르는 `GET /api/courses/internal/recommend` 도 주석 처리돼 404 다.)

---

## 프런트에서 이미 끝난 것

- `/game/result` · `/game/reward` 화면 (목 모드로 전 구간 동작)
- 목 응답 필드명을 `PaymentDto.RewardResponse` 와 1:1로 맞춤
- 리워드 정책 숫자는 `mock/scenario.js` 의 `REWARD_POLICY` 한 곳에서만 온다

---

# 갱신 — `6dcd760` 기준 (2026-08-27)

프런트를 실 API 에 부분 연동하면서 컨트롤러·DTO 를 전부 다시 읽었다.
**위의 1·2·4번은 해결됐다.** 대신 새로 확인된 것이 있다.

## ✅ 해결된 것

`6dcd760` "feat: return investment results through enrollment flow" 가 세 가지를 한 번에 고쳤다.

| 위 항목 | 지금 |
|---|---|
| §2 수익 판정이 `quantity` 무시 | `Σ(tempPrice−price)×quantity`. **수량 가중 적용됨** |
| §4 결과 응답에 숫자가 없다 | `ResultResponse{result, returnRate, profitAmount, investedTotal, evaluatedTotal}` 반환. `returnRate` 분모가 `investedTotal`(현금 제외)이라 **프런트 계산과 같다** |
| §1 `course → payment` 리워드 400 | `"SUCCESS"/"FAILURE"` 로 맞춰짐. 리워드가 실제로 생성되고 Kafka `reward.granted` → `users.money` 에 적립된다 |

`GET /api/users/me` 응답에 `money` 가 추가돼 적립 결과를 프런트가 관측할 수 있게 됐다.

## 🔴 지금 막힌 것

### N-1. `EnrollmentController` 가 게이트웨이 밖이다 — **1줄**

```java
@RequestMapping("/enrollments")      // 지금
@RequestMapping("/api/enrollments")  // 되돌려야 한다
```

PR #12(`c870619`)가 `/api/enrollments` → `/enrollments` 로 바꿨다. 게이트웨이는
`/api/enrollments` 만 라우팅하므로 **세 엔드포인트 전부 404** 다. 투자 확정이 실 API 로 못 간다.
프런트는 이것 하나만 풀리면 붙는다 (payload 어댑터는 프런트가 맡는다 —
백엔드 `EnrollRequest{items:[{courseId, quantity}]}` 를 그대로 쓴다).

### N-2. main 의 CI `build` 가 깨져 있다 — 코드 문제가 아니다

```
gradle (user-service)    Process completed with exit code 126
gradle (payment-service) Process completed with exit code 126
```

126 = 실행 권한 없음. PR #11 에서 `user-service/gradlew` · `payment-service/gradlew` 의
실행 비트가 날아갔다. 복구:

```bash
git update-index --chmod=+x user-service/gradlew payment-service/gradlew
```

### N-3. `POST /api/courses/internal/result` 가 조회가 아니라 **지급**이다

`CourseService.getResult()` 가 매번 `paymentClient.sendResult()` 를 부른다.
**부를 때마다 `payments` 행이 생기고 `users.money` 가 늘어난다.**
화면 새로고침·재진입만으로 리워드가 중복 지급된다.

프런트는 임시로 세션당 1회 가드를 걸었지만(`store/game.js`), 근본적으로는
**참여당 멱등 처리**나 **조회/지급 분리**가 필요하다.

또한 `PaymentRewardRequest(userId, 1L, result)` 의 `courseId` 가 여전히 하드코딩(`1L`)이다.

## 🟡 남은 요청

### N-4. 리워드 **조회** 엔드포인트가 없다

payment 에는 생성(`POST /api/payments/internal/result`)뿐이다.
`ResultResponse` 에 `paymentId` 를 실어 주거나 `GET /api/payments/internal/rewards/{paymentId}` 가 필요하다.

지금 프런트는 우회 중이다 — 지급액은 정책 상수로 계산하고(백엔드 `PaymentService` 의
10,000 / 5,000 과 같은 값), 잔액은 `GET /api/users/me` 의 `money` 를 재조회해서 보여 준다.
Kafka 가 비동기라 즉시 반영되지 않아 1초 간격으로 짧게 폴링한다.

### N-5. `ResultResponse` 에 종목별 내역이 없다

합계만 온다. `CourseResponse` 에 `tempPrice` 도 없어 **프런트가 계산할 방법도 없다.**
결과 화면의 "종목별 결과" 표를 띄울 수 없어 지금은 안내 문구로 대체했다.

필요한 형태 (§4 의 `orders[]` 와 동일):

```json
"orders": [{ "courseId": 1, "quantity": 10, "buyPrice": 76500, "resultPrice": 82400,
             "investedAmount": 765000, "evaluatedAmount": 824000,
             "profitAmount": 59000, "returnRate": 7.71 }]
```

### N-6. 종목 코드 분리 (위 §5 그대로)

프런트는 `/^(.*?)\s*\((\d{6})\)\s*$/` 로 떼어 쓰고 있다(`api/game.js` 의 `splitTitle`).
6자리 숫자 괄호만 코드로 보므로 당장은 안전하지만, `code` 컬럼 분리가 정석이다.

### N-7. Pages 배포 워크플로우가 둘로 갈라져 있다

리포 설정은 **`gh-pages` 브랜치 방식**(`build_type: legacy`)인데,
`feat/hwangjaewon-github-pages` 의 `.github/workflows/deploy-pages.yml` 은
`actions/deploy-pages@v4`(Actions 방식)이라 **현재 설정으로는 동작하지 않는다.**
`feat/parksungwoo-stock-options` 에도 **같은 경로**로 peaceiris→gh-pages 방식이 따로 있다.
둘 다 머지되면 파일이 충돌한다. 한 방식으로 합쳐야 한다.

### N-8. `6dcd760` 이 PR 없이 main 에 직접 push 됐다

팀 DoD(브랜치 → PR → 리뷰 1명 → squash merge) 위반이다. 리뷰 없이 들어가서
N-3 같은 부작용이 걸러지지 않았다.

---

## 프런트가 지금 어디까지 붙었나

`VITE_USE_MOCK` 하나로는 "절반만 붙은" 상태를 표현할 수 없어 **영역별 스위치**로 쪼갰다
(`vue-frontend/src/config.js` 의 `MOCK` 맵). 백엔드에 없는 영역은 막힌 이유를 주석으로
달아 `true` 로 고정해 두었으니, 경로가 생기면 그 줄만 `USE_MOCK` 으로 바꾸면 된다.

| 영역 | 경로 | 상태 |
|---|---|---|
| 로그인 | `POST /oauth2/token` | ✅ 실 API |
| 사용자 | `GET /api/users/me` | ✅ 실 API |
| 종목 목록 | `GET /api/courses` | ✅ 실 API (시드 6종) |
| 성향 분석 | `POST /api/recommend/analyze` | ✅ 실 API |
| 결과 | `POST /api/courses/internal/result` | ✅ 실 API (합계만, 종목별은 N-5) |
| 리워드 | — | ⚠ `users.me.money` 로 우회 (N-4) |
| 게임 세션 | `POST /api/enrollments/games` | ❌ 목 — 엔드포인트 없음 |
| 시나리오 | `GET /api/courses/scenarios/{id}` | ❌ 목 — 엔드포인트 없음 |
| 투자 확정 | `POST /api/enrollments` | ❌ 목 — **N-1** |
