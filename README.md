# InvestQuest — SKALA Agile·MSA 팀 프로젝트

증권사 신규 고객 온보딩용 **모의 투자 성향 게임**. 가상의 상황과 자금으로 모의 투자를
하게 한 뒤, 그 과정에서 나온 **행동 데이터**로 투자 성향을 분석한다.

> 설문으로 "위험을 감수하시겠습니까?"라고 묻는 대신, **위험을 감수하는지 지켜본다.**

강사 배포 템플릿(`msa-lecture`)의 기술 구조는 그대로 두고 업무 용어만 투자 게임 도메인으로
바꿨다. 저작권 고지는 [`NOTICE.md`](NOTICE.md) 참고.

---

## ⚠️ 시작 전 필수 — 2가지

### 1. `uname -m` 확인

```bash
uname -m
#  arm64  → 정상
#  x86_64 → ⚠️ 아래를 읽을 것
```

인프라 이미지 2종(`auth-server`, `api-gateway`)은 **`linux/arm64` 전용**이다
(`alpine-minirootfs-3.23.5-aarch64`). Apple Silicon Mac이 아니면 기동에 실패하거나
QEMU 에뮬레이션으로만 돈다. **`x86_64`인 사람에게 인프라 기동 담당을 맡기지 않는다.**

결과를 [`docs/team.md`](docs/team.md)에 적는다.

### 2. `infra-images.tar` 적재

```bash
docker load -i infra-images.tar
docker images | grep msa-lecture
#  msa-lecture/auth-server   1.0
#  msa-lecture/api-gateway   1.0
```

**이 파일은 리포에 없다.** 343MB로 GitHub 파일 한도(100MB)를 넘어 커밋이 불가능하다.
슬랙에 올라온 강사 배포본을 각자 받는다. **clone만 해서는 `docker compose up`이 실패한다.**

`auth-server`와 `api-gateway`는 **소스 디렉터리가 아예 없다.** 완성 이미지로만 존재한다.

---

## 기동

```bash
docker compose up -d              # 루트에서 바로 된다
open http://localhost:8761        # Eureka — 서비스 등록 확인
```

프론트는 compose에 없다:

```bash
cd vue-frontend && npm install && npm run dev
open http://localhost:3000
```

> **프론트는 지금 백엔드 없이도 돌아간다.** `vue-frontend/.env`의 `VITE_USE_MOCK=true`가
> 목 데이터로 Sprint1 전 구간을 태워 준다. 백엔드가 준비되면 `false`로 바꾼다.
> 자세한 것은 [`vue-frontend/README.md`](vue-frontend/README.md).

기동이 꼬이면:

```bash
docker compose down -v            # -v 로 볼륨까지. 스키마를 고쳤으면 필수
docker compose build --no-cache && docker compose up -d
docker compose logs -f <서비스명>
```

---

## 구성

| 디렉터리 | 포트 | API prefix | 비고 |
|---|---|---|---|
| `eureka-server/` | 8761 | — | 🔒 **수정 금지** (인프라) |
| `user-service/` | 8081 | `/api/users/**` | |
| `course-service/` | 8082 | `/api/courses/**` | 화면에서는 **종목·시나리오** |
| `enrollment-service/` | 8083 | `/api/enrollments/**` | 화면에서는 **모의 투자** |
| `payment-service/` | 8084 | `/api/payments/**` | 화면에서는 **리워드** |
| `recommend-service/` | 8085 | `/api/recommend/**` | 화면에서는 **성향 분석** |
| `vue-frontend/` | 3000 | — | compose에 없다 |
| `init-db/` | — | — | DDL. 시드 INSERT 없음 |

`auth-server`(9000) · `api-gateway`(8080)는 🔒 **수정 금지**이며 소스가 없다.

### 도메인 매핑

| 템플릿 | 우리 도메인 |
|---|---|
| 강사 | 증권사 운영자 |
| 과목(Course) | 게임 종목 / 가상 시나리오 |
| 수강신청(Enrollment) | 모의 투자 (종목 선택 + 투자금 배분) |
| 결제(Payment) | 참여 리워드 지급 |
| 추천(Recommend) | 행동 기반 투자 성향 분석 |

> **테이블명은 바꾸지 않는다.** `courses`를 `stocks`로 바꾸면 서비스 간 호출 경로·Kafka·
> 프런트가 연쇄로 깨진다. **화면에서만 종목으로 부른다.**

---

## ⚠️ 코드를 짜기 전에 알아야 할 것

### API 경로는 5개 prefix 안에만

```
/api/users   /api/courses   /api/enrollments   /api/payments   /api/recommend
```

**API Gateway는 소스 없는 완성 이미지라 라우트를 추가할 수 없다.** 위 5개 밖의 경로는
**404**가 난다. 새 마이크로서비스도 만들 수 없다.

```
❌ /api/games/available        →  404
❌ /api/scenarios/{id}         →  404
✅ /api/courses/scenarios/{id}
✅ /api/enrollments/games
```

### 사용자 식별은 `X-User-Id` 헤더로

게이트웨이가 JWT 클레임을 꺼내 헤더로 주입한다. **하위 서비스에서 JWT를 직접 파싱하지 않는다.**

| 헤더 | 출처 클레임 |
|---|---|
| `X-User-Id` | **`user_id`** (스네이크 케이스. `userId` 아님) |
| `X-User-Email` | `email` |
| `X-User-Role` | `role` |

게이트웨이를 안 거치고 8081~8084를 직접 호출하면 헤더가 없어 **400**이 난다.

### `users.role` 은 바꿀 수 없다

`auth-server` 이미지에 enum이 `STUDENT`/`INSTRUCTOR`로 컴파일돼 있고, 그 서버가 `users`
테이블을 직접 읽는다. 다른 값을 넣으면 **로그인만 조용히 깨진다.**
의미만 재해석한다 — `STUDENT` = 일반 투자자 / `INSTRUCTOR` = 운영자.

### 엔티티를 고치면 DDL도 함께

`init-db/01_init.sql`이 유일한 DDL이다. 엔티티만 고치면 `ddl-auto: update`가 컬럼을
덧붙여 **DDL과 실제 스키마가 갈라진다.** 반대로 DDL만 고치면 기동이 실패한다.

**스키마를 고친 뒤에는 `docker compose down -v`가 필요하다.** `init-db/`는 볼륨이 빈
경우에만 실행되므로 `down`만으로는 반영되지 않는다.

### 로그인 경로는 OAuth2 하나뿐

`/api/users/login`은 게이트웨이가 열어 뒀지만 컨트롤러에 매핑이 없어 **500**이 난다.
로그인은 `POST http://localhost:8080/oauth2/token`.

초기 계정: `student@lecture.com` / `instructor@lecture.com`, 비밀번호 `password1234`.

> `auth-server`를 재시작하면 RSA 서명 키가 새로 생성돼 **기존 발급 토큰이 전부 무효**가
> 된다. 실습 중 갑자기 401이 쏟아지면 이것부터 의심한다.

---

## 브랜치 · PR 규칙

```
main                              ← 직접 push 금지 (팀 규칙)
 ├─ feat/<이름>-<내용>             feat/hwangjaewon-enrollment-status
 ├─ fix/<이름>-<내용>
 └─ docs/<이름>-<내용>

태그
 ├─ sprint1-done                   Sprint1 Review 직후
 └─ sprint2-done
```

| 규칙 | 내용 |
|---|---|
| 1 PR = 1 Task | 제목에 Task 번호 — `[T-03] enrollment 상태 전이 추가` |
| 병합 | **squash merge** — `main` 이력이 Task 단위로 남는다 |
| 리뷰 | 최소 1명 승인 |
| 삭제 | 병합 후 브랜치 삭제 |

> ⚠️ **`main` 브랜치 보호를 기술적으로 걸 수 없다.** GitHub Free는 브랜치 보호를
> **public 리포에서만** 지원하는데 이 리포는 Private다(강사 배포 원본 포함).
> **그래서 위 규칙이 팀 DoD의 항목이 된다** — 도구가 아니라 사람이 지킨다.

### 충돌을 구조적으로 막는다

담당 디렉터리를 나누면 같은 파일을 동시에 고칠 일이 없다. **예외는 둘뿐이다.**

| 파일 | 고치기 전에 |
|---|---|
| `init-db/01_init.sql` | 팀 채널에 알린다 |
| `docker-compose.yml` | 팀 채널에 알린다 |

---

## Sprint 범위

| | 손대는 것 | 그대로 두는 것 |
|---|---|---|
| **Sprint1** | `user` · `course` · `enrollment` · `vue-frontend` | `payment` · `kafka` · `recommend` — 원본 그대로 통과시킨다 |
| **Sprint2** | `payment`(리워드) · Kafka 이벤트 · `recommend`(성향 분석) | Sprint1 서비스는 **한 줄도 고치지 않는다** |

Sprint2에서 리워드와 분석을 붙일 때 Sprint1의 회원·종목 서비스를 건드리지 않아도 되는 것,
그게 MSA의 "독립된 서비스 단위"와 Agile의 "점진적 확장"이 맞물린 지점이다.

**Kafka 규칙**: 토픽 이름과 Producer/Consumer 구조는 유지하고 **payload 필드만 확장**한다.

---

## 담당

[`docs/team.md`](docs/team.md) — **아직 빈칸이다.** 킥오프에서 채운다.

## 문서

| 문서 | 내용 |
|---|---|
| [`docs/team.md`](docs/team.md) | 담당표 · 환경(`uname -m`) |
| [`vue-frontend/README.md`](vue-frontend/README.md) | 프런트 목 모드 · 구조 · 연동 절차 |
| [`vue-frontend/STOCK_INVESTMENT_GAME_PROJECT_DRAFT.md`](vue-frontend/STOCK_INVESTMENT_GAME_PROJECT_DRAFT.md) | 기획 초안 (화면·시나리오·데이터 모델) |
| [`NOTICE.md`](NOTICE.md) | 강사 배포 원본 고지 · 기동 절차 원문 |

---

## 안내

- 등장하는 종목은 **모두 가상**이며 실존 기업과 무관하다.
- 모의 투자이며 실제 매매가 이루어지지 않는다.
- 게임 결과는 참고용 보조 정보이며 **공식 투자자 성향 진단을 대체하지 않는다.**
