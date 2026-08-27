/**
 * 백엔드 없이 진행하는 Sprint 데모용 투자 성향 분석기.
 * FastAPI의 investment_profile_service.py와 같은 점수식을 사용한다.
 */
const RISK_WEIGHT = { LOW: 0.2, NORMAL: 0.6, HIGH: 1 }

const PROFILE = {
  CONSERVATIVE: {
    name: '안정 추구형',
    summary: '현금과 낮은 변동성을 중시하며 손실 가능성을 신중하게 관리하는 성향입니다.',
    contents: [
      ['현금성 자산과 채권의 역할', '원금 변동을 줄이는 자산의 특징을 학습할 수 있습니다.'],
      ['분산투자 기초', '낮은 위험을 유지하면서 여러 자산으로 나누는 방법을 소개합니다.']
    ],
    products: [
      { id: 'cma-cash', name: 'CMA 자동 운용 서비스', category: '현금 관리', description: '대기 자금을 관리하며 필요할 때 투자 기회를 살펴볼 수 있는 서비스입니다.', reason: '현금 비중과 낮은 변동성을 중시한 선택 흐름과 맞습니다.', tags: ['현금 관리', '낮은 변동성'] },
      { id: 'bond-etf', name: '채권형 ETF 탐색', category: 'ETF', description: '채권 중심 자산의 특징과 가격 변동 요인을 비교해 볼 수 있습니다.', reason: '원금 변동을 줄이는 자산의 역할을 먼저 살펴보기에 적합합니다.', tags: ['분산', '안정 추구'] }
    ]
  },
  BALANCED: {
    name: '균형 투자형',
    summary: '안정성과 성장 가능성을 함께 고려해 위험을 조절하는 성향입니다.',
    contents: [
      ['ETF로 시작하는 분산투자', '안정성과 성장성을 함께 고려하는 포트폴리오 학습에 적합합니다.'],
      ['포트폴리오 리밸런싱', '목표 비중을 주기적으로 관리하는 방법을 소개합니다.']
    ],
    products: [
      { id: 'etf-savings', name: 'ETF 적립식 투자 서비스', category: 'ETF', description: '일정 금액을 나누어 투자하며 장기적인 분산 전략을 탐색하는 서비스입니다.', reason: '성장 가능성과 안정성을 함께 고려한 배분 결과와 맞습니다.', tags: ['분산', '적립식'] },
      { id: 'rebalance-alert', name: '포트폴리오 리밸런싱 알림', category: '투자 관리', description: '목표 비중에서 벗어난 자산을 확인하고 배분을 점검하는 기능입니다.', reason: '여러 종목의 비중을 조절한 투자 방식과 연결됩니다.', tags: ['비중 관리', '포트폴리오'] }
    ]
  },
  AGGRESSIVE: {
    name: '적극 투자형',
    summary: '높은 변동성을 감수하고 적극적으로 수익 기회를 찾는 성향입니다.',
    contents: [
      ['고변동 자산의 손실 관리', '높은 기대수익과 함께 커지는 손실 가능성을 이해할 수 있습니다.'],
      ['집중투자와 분산투자의 차이', '특정 종목 비중이 커질 때 발생하는 위험을 비교합니다.']
    ],
    products: [
      { id: 'growth-etf', name: '글로벌 성장 ETF 탐색', category: 'ETF', description: '성장 산업 중심 ETF의 구성과 변동성 정보를 비교해 볼 수 있습니다.', reason: '높은 수익 기회와 변동성을 함께 감수한 투자 성향과 맞습니다.', tags: ['성장', '높은 변동성'] },
      { id: 'fractional-global', name: '해외주식 소수점 투자 탐색', category: '해외 투자', description: '해외 종목을 소액으로 나누어 비교·학습할 수 있는 투자 탐색 서비스입니다.', reason: '적극적인 기회 탐색과 분산 접근을 함께 경험할 수 있습니다.', tags: ['해외 투자', '소액 분산'] }
    ]
  }
}

function decisionStyle(changeCount, decisionSeconds) {
  if (changeCount >= 5 || decisionSeconds >= 90) {
    return ['CAREFUL', '신중한 의사결정형', '여러 번 비교하거나 충분한 시간을 두고 투자안을 결정했습니다.']
  }
  if (changeCount <= 2 && decisionSeconds <= 30) {
    return ['QUICK', '빠른 의사결정형', '비교적 적은 수정과 짧은 시간 안에 투자안을 결정했습니다.']
  }
  return ['DELIBERATE', '균형 판단형', '필요한 비교를 거친 뒤 과도하게 지체하지 않고 결정했습니다.']
}

/** 백엔드와 동일한 개인화 코칭 규칙. 목 모드에서도 결과 화면을 완전하게 보여 준다. */
function personalizedCoaching(investmentRatio, concentrationRatio, highRiskRatio, selectedStockCount) {
  const pct = (value) => Math.round(value * 100)
  if (concentrationRatio >= 0.60) return {
    headline: '집중 투자 전략을 선택했어요',
    feedback: `한 종목 비중이 ${pct(concentrationRatio)}%입니다. 높은 수익 기회를 노릴 수 있지만 특정 종목의 변동이 전체 결과에 크게 영향을 줍니다.`,
    focusMetric: `최대 종목 비중 ${pct(concentrationRatio)}%`,
    nextMissionTitle: '다음 게임: 3종목 분산 챌린지',
    nextMissionDescription: '서로 다른 3개 이상 종목에 나누어 투자하고 집중 전략과 결과를 비교해 보세요.',
    target: '최대 종목 비중 50% 이하'
  }
  if (highRiskRatio >= 0.50) return {
    headline: '높은 변동성을 적극 활용했어요',
    feedback: `고위험 종목 비중이 ${pct(highRiskRatio)}%입니다. 수익 기회와 함께 큰 가격 변동도 감수하는 전략입니다.`,
    focusMetric: `고위험 종목 비중 ${pct(highRiskRatio)}%`,
    nextMissionTitle: '다음 게임: 변동성 조절 챌린지',
    nextMissionDescription: '고위험 종목과 일반 종목을 함께 담아 수익 기회와 변동성의 균형을 비교해 보세요.',
    target: '고위험 종목 비중 40% 이하'
  }
  if (investmentRatio <= 0.55) return {
    headline: '현금 방어 비중을 높게 유지했어요',
    feedback: `가상 자금의 ${pct(investmentRatio)}%만 투자했습니다. 시장 변동에 대비하는 전략이지만, 상승 기회를 놓칠 가능성도 함께 살펴볼 수 있습니다.`,
    focusMetric: `투자 비율 ${pct(investmentRatio)}%`,
    nextMissionTitle: '다음 게임: 기회 포착 챌린지',
    nextMissionDescription: '현금 비중을 일부 줄이고 여러 종목에 배분했을 때의 결과를 비교해 보세요.',
    target: '투자 비율 70% 이상'
  }
  if (selectedStockCount <= 2) return {
    headline: '간결한 포트폴리오를 구성했어요',
    feedback: '적은 수의 종목으로 명확한 전략을 세웠습니다. 종목 수를 늘렸을 때의 분산 효과도 비교해 볼 수 있습니다.',
    focusMetric: `선택 종목 ${selectedStockCount}개`,
    nextMissionTitle: '다음 게임: 섹터 분산 챌린지',
    nextMissionDescription: '서로 다른 3개 이상 섹터의 종목을 선택해 포트폴리오를 구성해 보세요.',
    target: '3개 이상 종목 선택'
  }
  return {
    headline: '균형 있는 배분 전략을 구성했어요',
    feedback: '여러 종목과 현금 비중을 함께 고려했습니다. 다음 게임에서는 한 가지 전략을 의도적으로 강화해 결과를 비교해 보세요.',
    focusMetric: `선택 종목 ${selectedStockCount}개`,
    nextMissionTitle: '다음 게임: 전략 비교 챌린지',
    nextMissionDescription: '이번 배분을 기준으로 성장 중심 또는 방어 중심 전략을 한 번 더 설계해 보세요.',
    target: '전략 2가지 결과 비교'
  }
}

export function createMockInvestmentProfile(payload) {
  const invested = payload.allocations.reduce((sum, item) => sum + item.amount, 0)
  const investmentRatio = invested / payload.initialCash
  const weightedRiskRatio = payload.allocations.reduce(
    (sum, item) => sum + item.amount * (RISK_WEIGHT[item.risk] ?? 0.6), 0
  ) / invested
  const highRiskAmount = payload.allocations
    .filter((item) => item.risk === 'HIGH')
    .reduce((sum, item) => sum + item.amount, 0)
  const highRiskRatio = highRiskAmount / invested
  const largest = [...payload.allocations].sort((a, b) => b.amount - a.amount)[0]
  const concentrationRatio = largest.amount / invested

  const score = Math.max(0, Math.min(100, Math.round(
    investmentRatio * 30
    + weightedRiskRatio * 45
    + concentrationRatio * weightedRiskRatio * 15
    + highRiskRatio * 10
  )))

  const profileType = score <= 39 ? 'CONSERVATIVE' : score <= 69 ? 'BALANCED' : 'AGGRESSIVE'
  const profile = PROFILE[profileType]
  const [styleType, styleLabel, styleDescription] = decisionStyle(
    payload.changeCount,
    payload.decisionSeconds
  )
  const percent = (value) => Math.round(value * 1000) / 10

  return {
    participationId: payload.participationId,
    profileType,
    profileName: profile.name,
    riskScore: score,
    summary: profile.summary,
    metrics: {
      investmentRatio: percent(investmentRatio),
      weightedRiskRatio: percent(weightedRiskRatio),
      highRiskRatio: percent(highRiskRatio),
      concentrationRatio: percent(concentrationRatio),
      diversificationScore: Math.round((1 - concentrationRatio) * 100),
      selectedStockCount: payload.allocations.length
    },
    decisionStyle: {
      type: styleType,
      label: styleLabel,
      description: styleDescription,
      changeCount: payload.changeCount,
      decisionSeconds: payload.decisionSeconds
    },
    reasons: [
      `가상자금 ${payload.initialCash.toLocaleString('ko-KR')}원 중 ${invested.toLocaleString('ko-KR')}원(${Math.round(investmentRatio * 100)}%)을 투자했습니다.`,
      `${payload.allocations.length}개 종목에 배분했고, 최대 비중은 ${largest.name} ${Math.round(concentrationRatio * 100)}%입니다.`,
      `포트폴리오의 가중 변동성 점수는 ${Math.round(weightedRiskRatio * 100)}점입니다.`
    ],
    recommendedContents: profile.contents.map(([title, reason]) => ({ title, reason })),
    recommendedProducts: profile.products,
    personalizedCoaching: personalizedCoaching(investmentRatio, concentrationRatio, highRiskRatio, payload.allocations.length),
    cautions: [
      '이 결과는 모의 투자 게임의 행동 데이터를 분석한 참고 정보입니다.',
      '공식 투자자 성향 진단이나 특정 금융상품에 대한 투자 권유가 아닙니다.'
    ]
  }
}
