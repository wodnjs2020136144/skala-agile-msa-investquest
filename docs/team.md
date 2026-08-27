# 팀 담당표

> ⚠️ **빈칸은 지어내지 않았다.** 킥오프(실습 18 역할 배분 · 실습 25 담당 디렉터리)에서
> 채운다. GitHub ID가 있어야 리포에 초대할 수 있다.

## 담당

| 이름 | 역할 | 담당 서비스/디렉터리 | GitHub ID | `uname -m` |
|---|---|---|---|---|
| 황재원 | FE + AI | `vue-frontend/` | `wodnjs2020136144` | `arm64` |
| | Product Owner | | | |
| | Scrum Master | | | |
| | BE | | | |
| | BE | | | |
| | BE | | | |

### ⚠️ `uname -m` 을 먼저 채운다

인프라 이미지 2종(`auth-server`, `api-gateway`)은 **`linux/arm64` 전용**이다.
`x86_64`인 사람은 `docker load` 후 기동에 실패하거나 QEMU 에뮬레이션으로만 돈다.

```bash
uname -m
#  arm64  → 정상
#  x86_64 → ⚠️ 인프라 기동 담당을 맡기지 않는다
```

## 손댈 수 있는 갈래

```
 user-service · course-service · enrollment-service
 payment-service · recommend-service · vue-frontend
   └─ 6갈래 = 6명
```

**단 Sprint1은 4갈래뿐이다.** 가이드1이 Sprint1을 "서비스 2~3개 안에서만 좁게"로
제한하고 `payment`·`kafka`·`recommend`는 원본 그대로 통과시키기 때문이다.

```
 Sprint1 에서 실제로 손대는 것
   user-service · course-service · enrollment-service · vue-frontend
     └─ 4갈래에 6명  →  2명이 남는다
```

남는 2명의 배치는 킥오프에서 정한다. **최소 1명은 인프라·통합 담당(compose·DB·기동·데모)을
두는 것을 권한다** — 통합 기동은 누군가 반드시 붙어야 하는 일인데 "모두의 일"로 두면
아무도 하지 않는다.

## 공동 파일 — 고치기 전에 팀 채널에 알린다

담당 디렉터리를 나눠 두면 충돌이 구조적으로 막힌다. 예외가 둘 있다.

| 파일 | 언제 충돌하나 |
|---|---|
| `init-db/01_init.sql` | 엔티티를 고치면 DDL 도 반드시 함께 고쳐야 한다 |
| `docker-compose.yml` | 환경변수를 추가할 때 |

> 스키마를 고친 뒤에는 `docker compose down -v`(볼륨 삭제)가 필요하다.
> `down`만으로는 반영되지 않는다 — `init-db/`는 볼륨이 빈 경우에만 실행된다.
