import api from './index.js'
import { MOCK } from '@/config.js'
import { wrap } from '@/mock/index.js'
import { MOCK_SCENARIO, REWARD_POLICY } from '@/mock/scenario.js'
import { MOCK_STOCKS } from '@/mock/stocks.js'
import { createMockParticipation } from '@/mock/participation.js'

/**
 * ⚠️ 새 prefix 를 만들면 안 된다. API Gateway 는 소스 없는 완성 이미지라
 *    라우트를 추가할 수 없고, /api/{users,courses,enrollments,payments,recommend}
 *    5개 밖의 경로는 404 가 난다 (docs/05_백엔드_제약사항.md §B-1).
 *
 * 종목 목록만 실 API 로 붙어 있다. 나머지 세 경로는 여전히 백엔드에 없다 —
 * 어디가 왜 막혔는지는 config.js 의 MOCK 맵에 적어 뒀다.
 */
const PATH = {
  startGame: '/api/enrollments/games',           // ❌ 없음 (제안 경로)
  scenario: (id) => `/api/courses/scenarios/${id}`, // ❌ 없음 (제안 경로)
  offeredStocks: '/api/courses',                 // ✅ 시드 6종을 그대로 준다
  submitInvestment: '/api/enrollments'           // ⚠ 컨트롤러가 /enrollments 라 게이트웨이 404
}

/**
 * '삼성전자(005930)' → { name: '삼성전자', code: '005930' }
 *
 * 시드(init-db/02_seed_courses.sql)가 종목 코드를 title 안에 넣어 뒀다.
 * 정책상 코드는 화면에 표시하지 않으므로 여기서 떼어 낸다.
 * 6자리 숫자 괄호만 코드로 본다 — 종목명에 든 일반 괄호는 건드리지 않는다.
 */
function splitTitle(title = '') {
  const m = /^(.*?)\s*\((\d{6})\)\s*$/.exec(title)
  return m ? { name: m[1], code: m[2] } : { name: title, code: null }
}

/**
 * course-service 의 CourseResponse → 프런트 종목 모델(mock/stocks.js 와 같은 모양).
 *
 * 두 모델이 거의 1:1이다. Course.Status(LOW|HIGH)가 프런트의 risk 이고,
 * category(반도체·바이오·방산)가 sector 다.
 */
function toStock(course) {
  const { name, code } = splitTitle(course.title)
  return {
    id: course.id,
    name,
    code,
    sector: course.category,
    price: Number(course.price),
    risk: course.status,
    description: course.description ?? ''
  }
}

export const gameApi = {
  /** 게임 시작 — 참여 세션을 만든다 */
  startGame(scenarioId) {
    if (MOCK.session) {
      const offeredIds = MOCK_STOCKS.map((s) => s.id)
      return wrap(createMockParticipation(scenarioId, offeredIds), '게임 참여 생성 성공')
    }
    return api.post(PATH.startGame, { scenarioId })
  },

  /** 시나리오 조회 */
  getScenario(id) {
    if (MOCK.scenario) return wrap(MOCK_SCENARIO, '시나리오 조회 성공')
    return api.get(PATH.scenario(id))
  },

  /**
   * 이 게임에서 제시할 종목 목록.
   *
   * 실 모드는 `GET /api/courses` 로 전 종목을 받아 온다. participationId 별로
   * 종목을 고르는 엔드포인트가 없어 인자는 목 분기에서만 의미가 있다.
   */
  getOfferedStocks() {
    if (MOCK.stocks) return wrap(MOCK_STOCKS, '제시 종목 조회 성공')
    // 응답이 ApiResponse<List<CourseResponse>> 라 payload 가 res.data.data 에 있다.
    // 호출부의 언랩(res.data.data ?? res.data)이 그대로 통하도록 같은 모양으로 되돌린다.
    return api.get(PATH.offeredStocks).then((res) => {
      const list = res.data?.data ?? res.data ?? []
      return { ...res, data: { ...res.data, data: list.map(toStock) } }
    })
  },

  /**
   * 투자 확정.
   *
   * ⚠️ 실 API 로 못 간다. EnrollmentController 가 @RequestMapping("/enrollments") 라
   *    게이트웨이의 /api/enrollments 라우트에 안 걸려 404 다. 1줄만 되돌리면 풀린다.
   *
   * ⚠️ 경로가 풀려도 payload 가 다르다. 백엔드 EnrollRequest 는
   *    { items: [{ courseId, quantity }] } 를 받고 participationId · 배분 금액은 자리가 없다.
   *    붙일 때 여기서 어댑터로 변환한다.
   */
  submitInvestment({ participationId, allocations, cashBalance }) {
    if (MOCK.invest) {
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
