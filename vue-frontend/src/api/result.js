import api from './index.js'
import { USE_MOCK } from '@/config.js'
import { wrap } from '@/mock/index.js'
import { createMockGameResult } from '@/mock/gameResult.js'
import { createMockReward } from '@/mock/reward.js'

/**
 * 결과·리워드 API.
 *
 * ── 결과 조회 ────────────────────────────────────────────────
 * 실 경로는 이미 있는 `POST /api/courses/internal/result` 를 그대로 쓴다.
 * 요청 DTO(`List<ResultRequest>` = {courseId, price, quantity})도 지금 그대로 맞다.
 * **바꿔 달라고 요청할 것은 응답뿐이다.**
 *
 *   지금:  "SUCCESS" | "FAILED"                     ← 문자열 하나
 *   필요:  { returnRate, profitAmount, evaluatedTotal, finalTotal,
 *            orders: [{ courseId, quantity, buyPrice, resultPrice,
 *                       investedAmount, evaluatedAmount, profitAmount, returnRate }] }
 *
 * 화면이 "얼마를 벌었는지"를 보여 주려면 숫자가 필요한데 현재 응답에는 없다.
 * 또한 `CourseService.getResult` 가 요청의 `quantity` 를 쓰지 않아
 * Σ(tempPrice − price) 로만 판정한다 — 1주와 1000주가 같은 취급이라
 * 수량 가중(`× quantity`)을 넣어 달라는 요청이 함께 나간다.
 *
 * ── 리워드 조회 ──────────────────────────────────────────────
 * `GET /api/payments/internal/rewards/{paymentId}` 는 **이미 구현돼 있고 동작한다.**
 * 응답 필드도 mock/reward.js 와 1:1이라 플래그만 바꾸면 붙는다.
 *
 * ⚠️ 다만 리워드를 생성하는 `course → payment` 호출이 현재 DTO 불일치로 400 이라
 *    실 모드에서는 조회할 리워드가 아직 만들어지지 않는다.
 *
 * ⚠️ 새 prefix 를 만들 수 없다 — API Gateway 가 소스 없는 완성 이미지라
 *    /api/{users,courses,enrollments,payments,recommend} 밖은 404 다.
 */
const PATH = {
  result: '/api/courses/internal/result',
  reward: (paymentId) => `/api/payments/internal/rewards/${paymentId}`
}

export const resultApi = {
  /**
   * 3일 뒤 투자 결과.
   *
   * @param {object}  ctx
   * @param {object}  ctx.submitResult  투자 확정 응답 (orders·cashBalance·resultAvailableAt)
   * @param {Array}   ctx.stocks        제시 종목 — 이름·섹터를 붙이는 용도. **목 전용**
   * @param {number}  ctx.initialCash   초기 자금. **목 전용**
   * @param {boolean} ctx.reveal        예정일 전 결과 공개(발표 데모용). **목 전용**
   */
  getGameResult({ submitResult, stocks, initialCash, reveal = false }) {
    if (USE_MOCK) {
      return wrap(
        createMockGameResult(submitResult, stocks, initialCash, reveal),
        '투자 결과 조회 성공'
      )
    }
    // 실 모드에서는 주문 내역만 보낸다. 나머지 인자는 목 계산용이라 넘기지 않는다.
    const orders = (submitResult?.orders || []).map((o) => ({
      courseId: o.courseId,
      price: o.stockPrice,
      quantity: o.quantity
    }))
    return api.post(PATH.result, orders)
  },

  /** 리워드 상태 — 포인트, 재투자 종료 시각, 출금 가능 여부 */
  getReward(paymentId, ctx = {}) {
    if (USE_MOCK) {
      return wrap(
        createMockReward(ctx.returnRate ?? 0, { paymentId, startedAt: ctx.startedAt }),
        '리워드 조회 성공'
      )
    }
    return api.get(PATH.reward(paymentId))
  }
}
