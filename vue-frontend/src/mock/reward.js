/**
 * 참여 리워드 목 데이터.
 *
 * 필드명은 백엔드 `PaymentDto.RewardResponse` 와 1:1로 맞췄다.
 * (payment-service/src/main/java/com/lecture/payment/dto/PaymentDto.java)
 *   paymentId · userId · rewardPoints · status · reinvestmentStartedAt
 *   · withdrawalAvailableAt · withdrawable
 * 실 API 로 넘어갈 때 화면을 고치지 않아도 되도록 이름을 바꾸지 않는다.
 *
 * 금액·기간은 docs/SPRINT2_REWARD_POLICY.md 에서 확정된 값이고
 * mock/scenario.js 의 REWARD_POLICY 가 단일 출처다. 여기서 숫자를 다시 적지 않는다.
 */
import { REWARD_POLICY } from './scenario.js'

let seq = 5000

/**
 * 게임 결과로 리워드를 만든다.
 *
 * ⚠️ 실제로는 프런트가 만들지 않는다. 3일 뒤 course-service 가 수익률을 계산해
 *    `POST /api/payments/internal/rewards` 로 생성하는 것이 정책상 흐름이다.
 *    다만 그 호출이 현재 DTO 불일치로 400 이라 한 건도 생성되지 않는다
 *    (course 는 {userId, result}, payment 는 {userId, courseId, returnRate} 를 요구).
 *    목에서는 정책대로 계산해 둔다.
 *
 * @param {number} returnRate  수익률(%). 0 이하면 기본 보상 구간
 * @param {object} opts        userId · courseId · startedAt(재투자 시작 시각) 덮어쓰기
 */
export function createMockReward(returnRate, opts = {}) {
  seq += 1

  const startedAt = opts.startedAt ? new Date(opts.startedAt) : new Date()
  const availableAt = new Date(startedAt)
  availableAt.setDate(availableAt.getDate() + REWARD_POLICY.reinvestmentDays)

  const withdrawable = Date.now() >= availableAt.getTime()

  return {
    paymentId: opts.paymentId ?? seq,
    userId: opts.userId ?? 1,
    // 수익률 0% 는 양의 수익이 아니므로 기본 보상 구간이다 (정책 확정 사항)
    rewardPoints: REWARD_POLICY.rewardForReturn(returnRate),
    status: withdrawable ? 'WITHDRAWABLE' : 'REINVESTING',
    reinvestmentStartedAt: startedAt.toISOString(),
    withdrawalAvailableAt: availableAt.toISOString(),
    withdrawable
  }
}
