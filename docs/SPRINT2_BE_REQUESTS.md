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

**`VITE_USE_MOCK=false` 로 넘기는 순간 화면에 실존 종목명이 뜬다.** 그 전에 정해야 한다.
프런트 목의 가상 6종으로 시드를 교체하면 문서·화면·정책이 한 번에 맞는다.

### B. 카테고리 축이 3중으로 갈라져 있다

| 위치 | 값 |
|---|---|
| 시드 (`courses.category`, String) | 반도체 · 바이오 · 방산 |
| 프런트 목 (`stocks.js` 의 `sector`) | IT · 금융 · 바이오 · 소비재 · 에너지 · 운송 |
| recommend (`CourseCategory` enum) | BACKEND · FRONTEND · … (구 강의 축) |

세 번째 것 때문에 `GET /api/recommend/{user_id}` 가 **500** 이다 —
course-service 가 `86e922d` 로 카테고리를 String 으로 바꿨는데
파이썬 스키마가 아직 enum 이라 `CourseResponse(**c)` 에서 ValidationError 가 난다.
(같은 경로가 부르는 `GET /api/courses/internal/recommend` 도 주석 처리돼 404 다.)

---

## 프런트에서 이미 끝난 것

- `/game/result` · `/game/reward` 화면 (목 모드로 전 구간 동작)
- 목 응답 필드명을 `PaymentDto.RewardResponse` 와 1:1로 맞춤
- 리워드 정책 숫자는 `mock/scenario.js` 의 `REWARD_POLICY` 한 곳에서만 온다
