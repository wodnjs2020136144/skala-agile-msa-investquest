/**
 * 제시 종목 목 데이터.
 *
 * `init-db/02_seed_courses.sql` 의 시드를 그대로 미러링한다.
 * 종목명·업종·기준가·위험도가 DB 와 1:1이라 `VITE_USE_MOCK=false` 로 넘겨도
 * 화면에 뜨는 종목이 바뀌지 않는다.
 *
 * ⚠️ 실존 상장 종목명을 쓴다. 다만 **제시 가격과 3일 뒤 결과는 전부 가상**이고
 *    실제 시세가 아니다. 특정 종목에 대한 투자 권유가 아니며, 화면 고지 문구도
 *    "모두 가상" 이 아니라 "가격과 결과가 가상" 으로 맞춰 두었다
 *    (HomeView · GameGuideView · GameResultView · GameRewardView 의 유의사항).
 *
 * ⚠️ 종목 코드는 화면에 표시하지 않는다 (docs/SPRINT2_REWARD_POLICY.md).
 *    `code` 는 DB 시드와 대조하기 위한 내부 값이고 어떤 화면에서도 렌더하지 않는다.
 *    시드는 코드를 `title` 안에 넣어 두었다(`삼성전자(005930)`) — 실 API 로 넘어갈 때는
 *    그 괄호를 떼서 보여 줘야 한다. BE 요청서에 올려 두었다.
 *
 * ⚠️ 안건 3-6 — 실시세가 아니라 고정 가격이다.
 *    전원 같은 조건이어야 사용자 간 성향 비교가 가능하다.
 *
 * risk 는 시드의 `status`(LOW | HIGH)를 그대로 옮긴 것이다.
 * 성향 분석용 내부 데이터이며 화면에는 표시하지 않는다.
 *
 * 설명문은 **업종과 주당 가격대의 성격**만 적는다. 개별 기업의 전망을 적으면
 * 모의 게임이 아니라 종목 분석으로 읽힌다.
 */
export const MOCK_STOCKS = [
  {
    id: 101,
    name: '제주반도체',
    code: '080220',
    sector: '반도체',
    price: 76500,
    risk: 'HIGH',
    description: '반도체 업종. 업황과 수요 변화에 따라 가격 변동 폭이 큰 편입니다.'
  },
  {
    id: 102,
    name: '삼성전자',
    code: '005930',
    sector: '반도체',
    price: 267000,
    risk: 'LOW',
    description: '반도체 업종의 대형주. 이 게임에서는 변동 폭을 작게 설정했습니다.'
  },
  {
    id: 103,
    name: 'HLB',
    code: '028300',
    sector: '바이오',
    price: 35900,
    risk: 'HIGH',
    description: '바이오 업종. 임상·허가 일정 같은 이벤트에 가격이 크게 흔들립니다.'
  },
  {
    id: 104,
    name: '삼성바이오로직스',
    code: '207940',
    sector: '바이오',
    price: 1587000,
    risk: 'LOW',
    description: '바이오 업종의 대형주. 주당 가격이 높아 적은 수량만 매수됩니다.'
  },
  {
    id: 105,
    name: '스페코',
    code: '013810',
    sector: '방산',
    price: 1559,
    risk: 'HIGH',
    description: '방산 업종의 소형주. 주당 가격이 낮아 많은 수량을 담을 수 있습니다.'
  },
  {
    id: 106,
    name: '한국항공우주',
    code: '047810',
    sector: '방산',
    price: 135600,
    risk: 'LOW',
    description: '방산 업종의 대형주. 이 게임에서는 변동 폭을 작게 설정했습니다.'
  }
]
