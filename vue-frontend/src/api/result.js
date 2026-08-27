import api from './index.js'
import { MOCK } from '@/config.js'
import { wrap } from '@/mock/index.js'
import { createMockGameResult } from '@/mock/gameResult.js'
import { createMockReward } from '@/mock/reward.js'
import { REWARD_POLICY } from '@/mock/scenario.js'
import { authApi } from './auth.js'

/**
 * 결과·리워드 API.
 *
 * ── 결과 조회 ────────────────────────────────────────────────
 * `POST /api/courses/internal/result` 를 쓴다. 요청은 프런트가 이미 보내던 모양
 * (`List<ResultRequest>` = {courseId, price, quantity})이 그대로 맞다.
 *
 * 응답 ResultResponse 는 전체 합계만 준다:
 *   { result: "SUCCESS"|"FAILED", returnRate, profitAmount, investedTotal, evaluatedTotal }
 *
 * 화면이 쓰는 나머지(cashBalance · finalTotal · initialCash)는 프런트가 이미 아는 값이라
 * 여기서 채운다. **종목별 orders[] 만은 채울 수 없다** — 백엔드가 종목별 내역을 주지 않고
 * CourseResponse 에 tempPrice 도 없어 프런트가 계산할 방법이 없다. 빈 배열로 둔다.
 *
 * ⚠️ 이 호출은 조회가 아니라 **지급**이다. CourseService.getResult 가 매번
 *    payment 에 리워드를 발급하므로 부를 때마다 payments 행이 생기고 users.money 가 는다.
 *    실 모드에서 중복 호출하지 않도록 store/game.js 가 1회 가드를 건다.
 *
 * ── 리워드 조회 ──────────────────────────────────────────────
 * 조회 엔드포인트가 **없다.** payment 에는 생성(`POST /api/payments/internal/result`)뿐이다.
 * 대신 지급분이 Kafka(reward.granted) → user-service 를 거쳐 users.money 에 적립되므로
 * `GET /api/users/me` 로 관측한다. 지급액 자체는 정책 상수로 계산한다 —
 * REWARD_POLICY 가 백엔드 PaymentService 의 10,000 / 5,000 과 같은 값이다.
 */
const PATH = {
  result: '/api/courses/internal/result'
}

/** 재투자·출금 일정은 백엔드에 없다. 목과 같은 계산을 쓴다. */
function scheduleFrom(startedAt) {
  const start = startedAt ? new Date(startedAt) : new Date()
  const end = new Date(start)
  end.setDate(end.getDate() + REWARD_POLICY.reinvestmentDays)
  return { reinvestmentStartedAt: start.toISOString(), withdrawalAvailableAt: end.toISOString() }
}

export const resultApi = {
  /**
   * 3일 뒤 투자 결과.
   *
   * @param {object}  ctx
   * @param {object}  ctx.submitResult  투자 확정 응답 (orders·cashBalance·resultAvailableAt)
   * @param {Array}   ctx.stocks        제시 종목 — 이름·섹터를 붙이는 용도. **목 전용**
   * @param {number}  ctx.initialCash   초기 자금
   * @param {boolean} ctx.reveal        예정일 전 결과 공개(발표 데모용). **목 전용**
   * @param {string}  ctx.outcome       'actual' | 'profit' | 'loss' | 'flat'. **목 전용**
   */
  getGameResult({ submitResult, stocks, initialCash, reveal = false, outcome = 'actual' }) {
    if (MOCK.result) {
      return wrap(
        createMockGameResult(submitResult, stocks, initialCash, { reveal, outcome }),
        '투자 결과 조회 성공'
      )
    }

    const orders = (submitResult?.orders || []).map((o) => ({
      courseId: o.courseId,
      price: o.stockPrice,
      quantity: o.quantity
    }))

    return api.post(PATH.result, orders).then((res) => {
      const r = res.data?.data ?? res.data ?? {}
      const cashBalance = Number(submitResult?.cashBalance ?? 0)
      const evaluatedTotal = Number(r.evaluatedTotal ?? 0)

      const merged = {
        participationId: submitResult?.participationId ?? null,
        // 동기 응답이라 대기 상태가 없다. 받은 시점이 곧 확정이다.
        status: 'CONFIRMED',
        resultAvailableAt: submitResult?.resultAvailableAt ?? null,
        initialCash: Number(initialCash ?? 0),
        investedTotal: Number(r.investedTotal ?? 0),
        cashBalance,
        evaluatedTotal,
        finalTotal: evaluatedTotal + cashBalance,
        profitAmount: Number(r.profitAmount ?? 0),
        returnRate: Number(r.returnRate ?? 0),
        // 백엔드가 종목별 내역을 주지 않는다. 화면이 이 배열이 비면 표를 숨긴다.
        orders: []
      }
      return { ...res, data: { ...res.data, data: merged } }
    })
  },

  /**
   * 리워드 상태 — 포인트, 재투자 종료 시각, 출금 가능 여부.
   *
   * 실 모드에서는 paymentId 를 받을 통로가 없어 무시한다. 지급액은 정책으로 계산하고
   * 잔액만 users.me 에서 읽는다. Kafka 가 비동기라 결과 직후엔 아직 반영 전일 수 있어
   * 짧게 재조회한다 — 끝내 안 오르면 마지막으로 읽은 값을 그대로 쓴다.
   */
  getReward(paymentId, ctx = {}) {
    if (MOCK.reward) {
      return wrap(
        createMockReward(ctx.returnRate ?? 0, { paymentId, startedAt: ctx.startedAt }),
        '리워드 조회 성공'
      )
    }

    const rewardPoints = REWARD_POLICY.rewardForReturn(ctx.returnRate ?? 0)
    const schedule = scheduleFrom(ctx.startedAt)

    return pollMoney().then((money) =>
      wrap(
        {
          paymentId: paymentId ?? null,
          userId: null,
          rewardPoints,
          balance: money,
          status: 'REINVESTING',
          withdrawable: false,
          ...schedule
        },
        '리워드 조회 성공'
      )
    )
  }
}

/**
 * users.money 를 최대 5회(1초 간격) 재조회한다.
 *
 * 값이 오르는 것을 기다리는 게 아니라 "적립이 반영된 값"을 최대한 잡으려는 것이다.
 * 기준값을 모르므로 증가 판정은 하지 않고, 마지막으로 성공한 조회값을 돌려준다.
 */
async function pollMoney(tries = 5, intervalMs = 1000) {
  let last = null
  for (let i = 0; i < tries; i += 1) {
    try {
      const res = await authApi.getMe()
      const me = res.data?.data ?? res.data ?? {}
      const money = Number(me.money ?? 0)
      // 값이 올라갔으면 적립이 반영된 것이다. 더 기다릴 이유가 없다.
      if (last !== null && money > last) return money
      last = money
    } catch {
      // 일시적 실패는 무시한다. 리워드 화면이 이것 때문에 죽으면 안 된다.
    }
    if (i < tries - 1) await new Promise((r) => setTimeout(r, intervalMs))
  }
  return last
}
