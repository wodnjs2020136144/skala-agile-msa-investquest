/**
 * 3일 뒤 투자 결과 목 데이터.
 *
 * ⚠️ 백엔드에 대응 엔드포인트가 아직 없다. `POST /api/courses/internal/result` 는
 *    `"SUCCESS" | "FAILED"` 문자열만 돌려주고 수익률·수익금액을 주지 않는다.
 *    게다가 요청의 quantity 를 쓰지 않아 수량 가중이 빠져 있다
 *    (CourseService.getResult — Σ(tempPrice − price) 만 더한다).
 *    그래서 화면에 필요한 숫자를 여기서 계산한다. 이 파일의 응답 shape 이
 *    곧 BE 에 요청할 계약이다 — api/result.js 상단 주석 참고.
 *
 * ⚠️ 결과 가격은 고정값이다. 실시세가 아니다.
 *    전원 같은 조건이어야 사용자 간 성향 비교가 성립한다 (안건 3-6,
 *    mock/stocks.js 의 기준가와 같은 이유).
 */

/**
 * stockId → 3일 뒤 가격.
 *
 * 위험도(mock/stocks.js 의 risk)와 변동폭을 일부러 일치시켰다.
 * HIGH 는 크게 갈리고(+15% / −20%), LOW 는 거의 움직이지 않는다(+2% / −1%).
 * 고위험에 몰아넣는 것이 "정답"이 되지 않게 HIGH 두 종목의 방향을 반대로 뒀다 —
 * 집중투자가 항상 이기면 성향 신호가 오염된다 (GAME_RULES.targetIsGoal 과 같은 취지).
 */
export const RESULT_PRICES = {
  101: 2760, // 가온반도체   2400 → +15.0%  (HIGH)
  102: 1836, // 한별금융지주 1800 →  +2.0%  (LOW)
  103: 2560, // 누리바이오   3200 → −20.0%  (HIGH)
  104: 1188, // 들안식품     1200 →  −1.0%  (LOW)
  105: 2120, // 새빛에너지   2000 →  +6.0%  (NORMAL)
  106: 1425  // 미르물류     1500 →  −5.0%  (NORMAL)
}

function round2(n) {
  return Math.round(n * 100) / 100
}

/**
 * 투자 확정 응답(orders)과 종목 정보를 합쳐 결과를 만든다.
 *
 * @param {object}  submitResult  gameApi.submitInvestment 의 응답 (orders·cashBalance·resultAvailableAt)
 * @param {Array}   stocks        게임에 제시된 종목 목록 (이름·섹터를 붙이는 용도)
 * @param {number}  initialCash   시나리오 초기 자금
 * @param {boolean} reveal        결과 예정일 전이라도 결과를 공개할지 (발표 데모용)
 */
export function createMockGameResult(submitResult, stocks, initialCash, reveal = false) {
  const byId = Object.fromEntries((stocks || []).map((s) => [s.id, s]))
  const availableAt = submitResult?.resultAvailableAt ?? null
  const due = availableAt ? Date.now() >= new Date(availableAt).getTime() : true

  const orders = (submitResult?.orders || []).map((o) => {
    const stock = byId[o.courseId] || {}
    const buyPrice = Number(o.stockPrice) || 0
    const resultPrice = RESULT_PRICES[o.courseId] ?? buyPrice
    const quantity = Number(o.quantity) || 0
    const investedAmount = Number(o.investmentAmount) || 0
    const evaluatedAmount = resultPrice * quantity

    return {
      stockId: o.courseId,
      name: stock.name || `종목 ${o.courseId}`,
      sector: stock.sector ?? null,
      quantity,
      buyPrice,
      resultPrice,
      investedAmount,
      evaluatedAmount,
      profitAmount: evaluatedAmount - investedAmount,
      returnRate: investedAmount > 0
        ? round2(((evaluatedAmount - investedAmount) / investedAmount) * 100)
        : 0
    }
  })

  const investedTotal = orders.reduce((sum, o) => sum + o.investedAmount, 0)
  const evaluatedTotal = orders.reduce((sum, o) => sum + o.evaluatedAmount, 0)
  const cashBalance = Number(submitResult?.cashBalance) || 0
  const profitAmount = evaluatedTotal - investedTotal

  return {
    participationId: submitResult?.participationId ?? null,
    // 예정일 전에는 PENDING. reveal 은 발표에서 3일을 기다릴 수 없어 두는 우회로다.
    status: due || reveal ? 'CONFIRMED' : 'PENDING',
    revealed: !due && reveal,
    resultAvailableAt: availableAt,
    initialCash,
    investedTotal,
    cashBalance,
    evaluatedTotal,
    // 최종 자산 = 종목 평가액 + 쓰지 않은 현금
    finalTotal: evaluatedTotal + cashBalance,
    profitAmount,
    /**
     * 분모는 투자 원금이다. 초기 자금이 아니다.
     * 리워드 정책의 "수익률 > 0" 판정과 같은 분모를 써야 화면과 지급액이 어긋나지 않는다.
     * 현금은 값이 변하지 않으므로 분모에 넣으면 수익률이 희석된다.
     */
    returnRate: investedTotal > 0 ? round2((profitAmount / investedTotal) * 100) : 0,
    orders
  }
}
