/**
 * 가상 시나리오 목 데이터.
 *
 * 필드명은 기획 초안 §13 의 Mock 모델을 그대로 따랐다.
 * ⚠️ FE 가 필드명을 확정하지 않는다 (안건 2-5). 실 API 스펙이 나오면
 *    이 파일과 api/game.js 의 매핑만 고치면 화면은 그대로 둔다.
 *
 * 투자 성향을 자연스럽게 드러낼 수 있도록 수익률 달성을 강요하지 않고,
 * 제한된 시간 안에 기회와 안정성 사이를 선택하는 이야기형 미션으로 구성한다.
 */
export const MOCK_SCENARIO = {
  id: 1,
  title: '최고의 수익률을 달성하라',
  description:
    '이 행사는 최고의 수익률을 달성하는 것을 목표로 합니다.',
  guide:
    ' 제한된 시간 안에 기회와 안정성 사이를 선택하며, ' +
    '자신만의 투자 전략을 완성해 보세요. 수익률만으로 승패를 정하므로, 공격적으로 기회를 잡을지, ' +
    '현금을 지키며 흔들림에 대비할지 선택하는 것이 중요합니다.',
  initialCash: 10000000,
  targetAmount: 30000000,
  durationDays: 3,
  rewardDescription: '3일 뒤 결과와 함께 최대 1만원의 참여 리워드가 지급됩니다.',
  status: 'AVAILABLE'
}

/**
 * Sprint 2 리워드 정책. 별도 테이블 없이 기존 Payment 흐름에 매핑한다.
 * 수익률 0%는 양의 수익이 아니므로 기본 보상 구간으로 처리한다.
 */
export const REWARD_POLICY = {
  profitRewardPoints: 10000,
  baseRewardPoints: 5000,
  reinvestmentDays: 3,
  rewardForReturn(returnRate) {
    return Number(returnRate) > 0 ? this.profitRewardPoints : this.baseRewardPoints
  }
}

/**
 * 게임 규칙. 전부 안건 3-3 · 3-4 미확정이라 기본값을 여기 한 곳에 모았다.
 * 팀 결정이 나면 이 객체만 고친다.
 */
export const GAME_RULES = {
  /** 안건 3-3 — 현금 보유 허용. 현금 비중이 성향 분석의 핵심 축이라 허용이 유리하다 */
  allowCash: true,
  /** 안건 3-4 — 종목 수 제한 없음. 집중투자 성향을 관찰하려면 제한하지 않는 편이 낫다 */
  maxStocks: null,
  /** 안건 3-4 — 종목당 최대 비중 제한 없음 */
  maxWeightPerStock: null,
  /** 안건 3-5 — 목표 금액 달성을 성공 조건으로 두지 않는다. 정답 맞추기가 되면 성향이 오염된다 */
  targetIsGoal: false,
  /** 주문 수량은 소수점 없이 1주 단위로만 변경한다 */
  shareStep: 1
}
