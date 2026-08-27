import api from './index.js'
import { wrap } from '@/mock/index.js'
import { MOCK_SCENARIO, REWARD_POLICY } from '@/mock/scenario.js'
import { MOCK_STOCKS } from '@/mock/stocks.js'
import { createMockParticipation } from '@/mock/participation.js'

/**
 * 목 모드 스위치. .env 의 VITE_USE_MOCK 로 켜고 끈다.
 * 백엔드가 도착하면 false 로 바꾸는 것만으로 실 API 로 넘어간다.
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/**
 * ⚠️ 아래 실 경로는 전부 "제안"이다. 아직 확정되지 않았다
 *    (안건 1-1 API 경로 재설계 — 최우선 미해결).
 *    docs/07_스키마-설계안_검토.md §B-4 의 제안 표를 그대로 옮겼다.
 *
 * ⚠️ 새 prefix 를 만들면 안 된다. API Gateway 는 소스 없는 완성 이미지라
 *    라우트를 추가할 수 없고, /api/{users,courses,enrollments,payments,recommend}
 *    5개 밖의 경로는 404 가 난다 (docs/05_백엔드_제약사항.md §B-1).
 *    그래서 초안 §13 의 /api/games/available · /api/scenarios/{id} 는 쓸 수 없다.
 */
const PATH = {
  startGame: '/api/enrollments/games',           // POST — participations 생성
  myGames: '/api/enrollments/games/my',          // GET
  scenario: (id) => `/api/courses/scenarios/${id}`,
  offeredStocks: (pid) => `/api/courses/offered?participationId=${pid}`,
  submitInvestment: '/api/enrollments'           // POST — 기존 경로에 필드 추가
}

export const gameApi = {
  /** 게임 시작 — 참여 세션을 만든다 */
  startGame(scenarioId) {
    if (USE_MOCK) {
      const offeredIds = MOCK_STOCKS.map((s) => s.id)
      return wrap(createMockParticipation(scenarioId, offeredIds), '게임 참여 생성 성공')
    }
    return api.post(PATH.startGame, { scenarioId })
  },

  /** 시나리오 조회 */
  getScenario(id) {
    if (USE_MOCK) return wrap(MOCK_SCENARIO, '시나리오 조회 성공')
    return api.get(PATH.scenario(id))
  },

  /** 이 게임에서 제시할 종목 목록 */
  getOfferedStocks(participationId) {
    if (USE_MOCK) return wrap(MOCK_STOCKS, '제시 종목 조회 성공')
    return api.get(PATH.offeredStocks(participationId))
  },

  /**
   * 투자 확정.
   *
   * ⚠️ 실 API 는 아직 이 payload 를 받지 못한다.
   *    EnrollmentController.enroll() 이 courseId 하나만 받고 있어
   *    EnrollRequest 에 investmentAmount · participationId 추가가 필요하다
   *    (docs/07_스키마-설계안_검토.md §D-1). BE 요청 사항으로 올라가 있다.
   *
   * ⚠️ 배분(N종목)이면 주문이 여러 건이다. 현재 체결 로직이
   *    findByUserIdAndCourseId 로 1건을 찾게 돼 있어 participationId 기준으로
   *    바꾸지 않으면 나머지가 PENDING 에 남는다 (같은 문서 §A-1).
   */
  submitInvestment({ participationId, allocations, cashBalance }) {
    if (USE_MOCK) {
      return wrap(
        {
          participationId,
          orders: allocations.map((a, i) => ({
            enrollmentId: 7000 + i,
            courseId: a.stockId,
            investmentAmount: a.amount,
            stockPrice: a.price,
            quantity: a.quantity,
            status: 'PENDING'
          })),
          cashBalance,
          resultAvailableAt: resultDateAfter(MOCK_SCENARIO.durationDays),
          rewardPolicy: {
            profitRewardPoints: REWARD_POLICY.profitRewardPoints,
            baseRewardPoints: REWARD_POLICY.baseRewardPoints,
            reinvestmentDays: REWARD_POLICY.reinvestmentDays
          }
        },
        '투자 확정 성공'
      )
    }
    return api.post(PATH.submitInvestment, {
      participationId,
      allocations,
      cashBalance
    })
  }
}

/** 결과 예정일 — durationDays 만큼 뒤 */
export function resultDateAfter(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}
