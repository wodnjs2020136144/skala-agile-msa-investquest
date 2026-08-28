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

## 5. 종목명에서 종목 코드를 떼 달라 (철회)

> **철회 — 팀 결정.** 컬럼 분리는 하지 않고 **프런트 `splitTitle` 처리를 유지한다.**
> "종목 코드는 화면에 표시하지 않는다" 정책은 그대로 살아 있고, 프런트가 이미 그렇게 동작한다
> (`code` 를 렌더하는 화면은 0곳). 아래는 배경 기록으로 남긴다.

시드가 종목 코드를 `title` 안에 넣어 두었다 — `삼성전자(005930)`.
정책(`SPRINT2_REWARD_POLICY.md`)은 **"종목 코드는 사용하거나 화면에 표시하지 않는다"** 이므로
그대로 렌더하면 규정을 어긴다.

프런트 목은 이미 분리해 두었다 (`name: '삼성전자'`, `code: '005930'` — `code` 는 렌더하지 않음).

**요청**: `courses` 에 종목 코드를 별도 컬럼으로 두거나, 응답에서 `name` 과 `code` 를 나눠 달라.
지금 상태로는 프런트가 괄호를 정규식으로 떼야 하는데, 종목명에 괄호가 들어가는 경우를
구분할 수 없어 안전하지 않다.

---

## 팀 결정이 필요한 것

### A. ✅ 실존 상장사가 원래 팀 정의다 — 우리 Sprint1 문서가 틀렸다

> **이 항목은 앞서 "🔴 시드가 실존 상장사다 — 문서와 충돌"이라고 적었는데 방향이 반대였다.**
> 팀은 **처음부터 실존 상장사 기반 모의투자**로 정의했다. 목으로 급하게 진행하느라
> 가상 종목을 썼고, 그때 우리가 정리한 Sprint1 문서에 "종목은 모두 가상"이 잘못 들어갔다.
> **시드가 문서와 충돌한 게 아니라 문서가 틀린 것이다.**

`init-db/02_seed_courses.sql` 의 6종이 팀 정의대로다:

```
제주반도체(080220) · 삼성전자(005930) · HLB(028300)
삼성바이오로직스(207940) · 스페코(013810) · 한국항공우주(047810)
```

`vue-frontend/src/mock/stocks.js` 도 이미 이 6종으로 맞춰 두었다
(종목명·업종·기준가·결과가가 시드와 1:1).

**다만 `price → tempPrice` 는 실존 종목의 미래 가격을 임의로 지정하는 구조다**
(삼성전자 267,000 → 251,500). 여기에 성향 분석과 상품 추천이 붙으면
실제 종목 시세 예측 + 상품 권유 형태로 읽힐 수 있다.
`recommend-service` 의 `PRODUCTS` 위에 "실존 상품의 매수를 권유하지 않기 위한
데모용 카탈로그"라고 그어 둔 선과 같은 이유로, **화면 고지 문구가 이 선을 대신 그어 준다.**
그래서 4개 화면의 문구를 이렇게 고쳤다:

| | |
|---|---|
| 전 | 등장하는 종목은 모두 가상이며 실존 기업과 무관합니다. |
| 후 | **실존 종목명을 쓰지만 제시 가격과 결과는 가상이며 실제 시세가 아닙니다.** |

HomeView · GameGuideView · GameResultView · GameRewardView 4곳 — **완료.**

**같은 오기를 문서에서도 걷어냈다** (이 PR):
`docs/sprint1-demo.md` · `README.md` · `vue-frontend/README.md` · `docs/SPRINT2_REWARD_POLICY.md`.

**종목 코드는 계속 화면에 표시하지 않는다.** 정책(`SPRINT2_REWARD_POLICY.md`)은 그대로 살리고,
`title` 의 `삼성전자(005930)` 형식은 프런트 `splitTitle` 이 떼어 낸다 — 백엔드에 넘길 것이 없다
(위 §5 철회).

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

### N-4. 리워드를 결제와 **구분할 수 없다** (앞선 서술 정정)

> **정정.** 이 문서는 앞서 "리워드 조회 엔드포인트가 없다"고 적었는데 **틀렸다.**
> `GET /api/payments/user/{userId}` 가 있다 (`PaymentController.java:59`,
> 응답 `ApiResponse<List<PaymentResponse>>`).

```
PaymentResponse { paymentId, userId, courseId, amount, status, transactionId, createdAt }
```

문제는 다른 데 있다. **리워드 지급 기록도 같은 `payments` 테이블에 `Payment` 로 저장된다**
(`PaymentService.grantReward`). 그래서 위 목록에는 일반 결제와 리워드가 섞여 나오는데
**둘을 구분할 타입 필드가 `Payment` · `PaymentResponse` 어디에도 없다.**
`courseId` 도 리워드 쪽은 하드코딩 `1L` 이라 단서가 못 된다.

**먼저 — 이건 백엔드에서 고칠 수 있다.** `/api/payments` 는 게이트웨이가 이미 라우팅하는
**5개 prefix 중 하나**라, 그 아래 경로 추가나 DTO 변경은 게이트웨이를 건드리지 않는다.
손댈 수 없는 것은 소스 없는 `auth-server` · `api-gateway` 이미지뿐이고, 거기서 막히는 것은
**새 prefix 와 새 마이크로서비스**다. payment-service · course-service 는 둘 다 리포에 소스가 있고
Sprint2 담당 범위다.

**요청 — 안 A 하나면 된다.**

**🟢 안 A (권장).** `ResultResponse` 에 `paymentId` 를 추가한다. **course-service 만 고친다.**

```java
// PaymentClient.java:15  — 지금은 반환형이 void 라 payment 가 준 paymentId 를 버리고 있다
void sendResult(@RequestBody PaymentRewardRequest request);
// ↓
InvestmentResultResponse sendResult(@RequestBody PaymentRewardRequest request);
```

payment-service 는 이미 `InvestmentResultResponse{paymentId, userId, courseId, result, amount, status}`
를 응답으로 주고 있다(`PaymentController.java:37`). **받아서 흘려보내기만 하면 되므로
payment-service 는 한 줄도 안 고친다.** 스키마 변경이 없어 `docker compose down -v` 도 불필요하다.
프런트는 `paymentId` 로 `GET /api/payments/{id}` 를 불러 **실제 지급액 한 건**을 집는다.

> N-7 대로 프런트가 확정 응답(`POST /api/enrollments`)을 쓰게 되면
> `EnrollmentDto.CourseResult` 에도 `paymentId` 한 필드를 얹어야 한다 (enrollment-service 1줄).

**🔴 안 B (비추천).** `Payment` 에 종류 구분 필드(`kind: PAYMENT | REWARD`)를 추가한다.
`init-db/01_init.sql` 이 공유 파일이라 팀 공지 + `docker compose down -v` 가 따라온다.
리워드 **이력 목록**이 화면에 필요해지면 그때 다시 꺼낸다.

지금 프런트는 우회 중이다 — 지급액은 정책 상수로 계산하고(백엔드 `PaymentService` 의
10,000 / 5,000 과 같은 값), 잔액은 `GET /api/users/me` 의 `money` 를 재조회해서 보여 준다.
Kafka 가 비동기라 즉시 반영되지 않아 1초 간격으로 짧게 폴링한다.
`GET /api/payments/user/{userId}` 로 바꿀 수도 있지만, **리워드만 골라낼 수 없어 보류**한다.

### N-5. `ResultResponse` 에 종목별 내역이 없다

합계만 온다. `CourseResponse` 에 `tempPrice` 도 없어 **프런트가 계산할 방법도 없다.**
결과 화면의 "종목별 결과" 표를 띄울 수 없어 지금은 안내 문구로 대체했다.

필요한 형태 (§4 의 `orders[]` 와 동일):

```json
"orders": [{ "courseId": 1, "quantity": 10, "buyPrice": 76500, "resultPrice": 82400,
             "investedAmount": 765000, "evaluatedAmount": 824000,
             "profitAmount": 59000, "returnRate": 7.71 }]
```

> **정정 — 요청 DTO 와 `result` 값.** 이 문서 §2 는 `ResultRequest {courseId, price, quantity}`
> 라고 적었는데 지금은 **`record ResultRequest(int courseId, int quantity)`** 뿐이다
> (`course-service/.../dto/request/ResultRequest.java`). 프런트가 함께 보내는 `price` 는
> **서버가 버린다** (Spring Boot 기본이 unknown property 무시라 200 은 뜬다).
>
> 그리고 `Result` enum 은 **`SUCCESS` / `FAILED`** 다 — `FAILURE` 가 아니다
> (`course-service/.../dto/Result.java`). course 가 payment 로 넘길 때만 `"FAILURE"` 로 바꾼다
> (`CourseService.java:139`). `PaymentService.decideRewardAmount` 는 `SUCCESS`/`FAILURE`
> 외의 문자열에 예외를 던지므로 **두 이름을 섞어 쓰면 조용히 500 이 난다.**
> 화면에 `result` 문자열을 쓰기 시작하면 이 차이를 먼저 확인할 것.

> **철회된 요청 3건.** 아래 셋은 팀 결정으로 백엔드에 넘기지 않는다.
>
> - **종목 코드 컬럼 분리** (위 §5) — 컬럼을 나누지 않고 프런트 `splitTitle` 처리를 유지한다.
>   코드를 화면에 표시하지 않는 정책은 그대로 살아 있고, 프런트가 이미 그렇게 동작한다.
> - **Pages 배포 워크플로우 정리** — 급하게 시연용으로 배포한 것이라 나중에 정리한다.
> - **PR 없이 main 직접 push** — 2일짜리 MVP 사정상 규칙 위반은 너그럽게 보기로 했다.

---

## 🆕 4개 서비스를 다시 읽고 새로 확인된 것

앞의 N-1~N-5 는 프런트가 **부딪힌** 것이다. 아래 셋은 아직 부딪히지 않았지만
**N-1 이 풀리는 순간 바로 터진다.** 순서상 N-1 과 함께 처리해야 한다.

### 🔴 N-6. 같은 계정으로 두 번째 게임을 못 한다

`enrollment-service/.../service/EnrollmentService.java:96`

```java
if (enrollmentRepository.existsByUserIdAndCourseId(userId, courseId)) {
    throw new IllegalArgumentException("이미 구매한 주식입니다: " + courseId);
}
```

DB 에도 같은 제약이 있다 — `init-db/01_init.sql` 의 `UNIQUE KEY uq_user_course (user_id, course_id)`.

한 번 산 종목은 **영원히** 다시 못 산다. N-1 이 풀려 프런트가 `MOCK.invest` 를 끄는 순간,
같은 계정으로 두 번째 게임을 돌리면서 같은 종목을 고르면 **400** 이다.
시연에서 계정 하나로 두 번 돌리면 바로 걸린다.

**부분 저장 고착이 더 나쁘다.** `EnrollmentWriteService.createPendingEnrollment` 가
`REQUIRES_NEW` 독립 트랜잭션이라, 3종목 중 2번째에서 실패해도 **1번째 행은 이미 커밋돼 남는다.**
`enrollAll` 의 `@Transactional` 로는 롤백되지 않는다 → 같은 요청을 재시도하면
이제 1번째가 "이미 구매한 주식입니다" 로 막혀 **영원히 400** 이다.

**요청**: 게임(참여) 단위로 재매수를 허용하거나(`unique` 를 `(user_id, course_id, participation_id)`
같은 축으로 확장), 최소한 `enrollAll` 을 한 트랜잭션으로 묶어 부분 저장을 없애 달라.

### 🔴 N-7. N-1 이 풀리면 프런트가 `internal/result` 직접 호출을 걷어내야 한다

`POST /api/enrollments` 의 응답이 이미 결과를 함께 준다.

```
EnrollResultResponse { enrollments: [...], result: { result, returnRate, profitAmount,
                                                     investedTotal, evaluatedTotal } }
```

`EnrollmentService.enrollAll` 이 내부적으로 `CourseServiceClient.submitEnrollmentRequest`
→ `POST http://course-service/api/courses/internal/result` (헤더 `X-User-Id`) 를 **대신 호출**하기 때문이다.

즉 N-1 이 풀린 뒤에도 프런트가 결과 화면에서 `internal/result` 를 따로 부르면
**확정에서 1회 + 결과에서 1회, 리워드가 두 번 지급된다.** N-3 의 중복 지급이 더 나빠지는 형태다.
지금 `store/game.js` 의 세션당 1회 가드는 결과 재조회만 막지 이 경로는 못 막는다.

**정리 순서**: N-1 수정 → 프런트가 확정 응답의 `result` 를 그대로 결과 화면에 쓰고
`api/result.js` 의 직접 호출을 삭제 → `MOCK.invest` 를 끈다. **이건 프런트가 맡는다.**

### 🟡 N-8. enrollment 가 영원히 PENDING 이다

`activateEnrollment` 는 `payment.completed` 컨슈머에서만 호출되는데,
새 흐름의 payment-service 는 `reward.granted` 만 발행한다(`PaymentService.grantReward`).
`payment.completed` 를 발행하는 `processInternalPayment` 경로는 지금 아무도 부르지 않는다
(`EnrollmentService` 가 `PaymentServiceClient` 를 더 이상 주입하지 않는다).

결과:
- `enrollments.status` 가 `PENDING` 에서 안 바뀐다
- `courses.enrollment_count` 가 0 에 머문다
- `enrollment.completed` 가 발행되지 않는다 → **recommend-service 의 Kafka 경로가 끊겨 있다**
  (프런트가 `POST /api/recommend/analyze` 를 직접 부르므로 화면만 무사하다)

프런트는 결과 화면 상태를 `'CONFIRMED'` 로 하드코딩해 두어 지금은 가려져 있지만,
나중에 `GET /enrollments/user/{id}` 를 화면에 붙이면 전부 PENDING 으로 보인다.

### 기록용 — 조치는 지금 필요 없음

- **시드 `temp_price` 가 고정값이다** (`init-db/02_seed_courses.sql`).
  결과 가격이 종목마다 하나뿐이라 **몇 번을 다시 해도 수익률이 같다.**
  시연에서 "다시 해도 똑같네요" 가 나올 수 있다. 시나리오별 결과가 필요하면 별도 설계가 필요하다.
- **`POST /api/courses` 가 `tempPrice` 를 받지 않는다.** `CreateRequest` 에 필드가 없는데
  DDL 은 `temp_price NOT NULL` 이라 종목 생성 API 는 현재 깨져 있다.
  프런트에서 `SHOW_TEMPLATE_SCREENS=false` 로 화면을 막아 둬 지금은 무해하다.
- **종목당 투자 한도는 1,000만 원** 이다 (`EnrollmentService.java:142`, 총합 한도는 없다).
  프런트 초기 자금이 정확히 1,000만 원이라 한 종목 몰빵도 `>` 경계에서 통과한다 — 우연히 맞다.

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
