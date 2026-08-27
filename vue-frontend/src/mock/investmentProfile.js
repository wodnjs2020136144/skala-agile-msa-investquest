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
    ]
  },
  BALANCED: {
    name: '균형 투자형',
    summary: '안정성과 성장 가능성을 함께 고려해 위험을 조절하는 성향입니다.',
    contents: [
      ['ETF로 시작하는 분산투자', '안정성과 성장성을 함께 고려하는 포트폴리오 학습에 적합합니다.'],
      ['포트폴리오 리밸런싱', '목표 비중을 주기적으로 관리하는 방법을 소개합니다.']
    ]
  },
  AGGRESSIVE: {
    name: '적극 투자형',
    summary: '높은 변동성을 감수하고 적극적으로 수익 기회를 찾는 성향입니다.',
    contents: [
      ['고변동 자산의 손실 관리', '높은 기대수익과 함께 커지는 손실 가능성을 이해할 수 있습니다.'],
      ['집중투자와 분산투자의 차이', '특정 종목 비중이 커질 때 발생하는 위험을 비교합니다.']
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
    cautions: [
      '이 결과는 모의 투자 게임의 행동 데이터를 분석한 참고 정보입니다.',
      '공식 투자자 성향 진단이나 특정 금융상품에 대한 투자 권유가 아닙니다.'
    ]
  }
}
