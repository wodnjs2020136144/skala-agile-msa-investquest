# InvestQuest 투자 성향 분석

Sprint 2에서는 학습 데이터가 아직 없으므로 결과를 재현하고 근거를 설명할 수 있는
규칙 기반 분석을 사용한다. 기존 강의 추천 API는 유지하고 투자 게임용 API를 추가했다.

## API

```http
POST /api/recommend/analyze
Authorization: Bearer <access-token>
Content-Type: application/json
```

요청 예시:

```json
{
  "participationId": 9001,
  "initialCash": 10000000,
  "cashBalance": 2500000,
  "changeCount": 3,
  "decisionSeconds": 60,
  "allocations": [
    { "stockId": 101, "name": "가온반도체", "sector": "IT", "risk": "HIGH", "amount": 2000000 },
    { "stockId": 102, "name": "한별금융지주", "sector": "금융", "risk": "LOW", "amount": 2500000 },
    { "stockId": 105, "name": "새빛에너지", "sector": "에너지", "risk": "NORMAL", "amount": 3000000 }
  ]
}
```

`sum(allocations.amount) + cashBalance`는 반드시 `initialCash`와 같아야 한다.
위험도는 `LOW`, `NORMAL`, `HIGH` 중 하나다.

## 점수 기준

```text
위험 점수 = 투자 비율 × 30
          + 가중 위험도 × 45
          + 집중도 × 가중 위험도 × 15
          + 고위험 종목 비율 × 10
```

위험도 계수는 `LOW=0.2`, `NORMAL=0.6`, `HIGH=1.0`이다.

| 점수 | 결과 |
|---:|---|
| 0~39 | 안정 추구형 |
| 40~69 | 균형 투자형 |
| 70~100 | 적극 투자형 |

수정 횟수가 5회 이상이거나 결정 시간이 90초 이상이면 신중한 의사결정형으로,
수정 횟수가 2회 이하이고 30초 이내면 빠른 의사결정형으로 분류한다. 나머지는
균형 판단형이다.

이 분석은 공식 투자자 성향 진단이나 금융상품 투자 권유가 아니다. 응답의 추천 항목도
실제 종목이 아니라 투자 학습 콘텐츠로 제한한다.

## 테스트

Docker의 Python 3.12 환경에서 실행한다.

```bash
docker build -t investquest-recommend-ai-test .
docker run --rm investquest-recommend-ai-test \
  python -m unittest discover -s tests -v
```
