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
 * `init-db/02_seed_courses.sql` 의 `temp_price` 를 그대로 옮겼다.
 * 목과 DB 가 같은 숫자를 써야 실 API 로 넘겨도 결과가 달라지지 않는다.
 *
 * ⚠️ 실제 시세가 아니다. 게임용으로 정한 가상의 결과가다.
 *
 * 고위험 두 종목(제주반도체·HLB)의 방향이 반대라, 고위험에 몰아넣는 것이
 * "정답"이 되지 않는다 — 집중투자가 항상 이기면 성향 신호가 오염된다
 * (GAME_RULES.targetIsGoal 과 같은 취지).
 */
export const RESULT_PRICES = {
  101:   81000, // 제주반도체         76,500 →  +5.88%  (HIGH)
  102:  269000, // 삼성전자          267,000 →  +0.75%  (LOW)
  103:   32000, // HLB               35,900 → −10.86%  (HIGH)
  104: 1600000, // 삼성바이오로직스 1,587,000 →  +0.82%  (LOW)
  105:    1720, // 스페코             1,559 → +10.33%  (HIGH)
  106:  137500  // 한국항공우주      135,600 →  +1.40%  (LOW)
}

/**
 * 발표용 대체 가격표.
 *
 * 결과는 사용자의 실제 배분으로 계산되므로, 손실 화면을 보려면 하락 종목에
 * 몰아넣는 조합을 미리 알아야 한다. 발표 중에 그럴 수 없어 방향을 강제하는 표를 둔다.
 *
 * 전 종목이 한 방향이되 **폭은 제각각**으로 뒀다 — 종목별 결과가 전부 같은 %면
 * 만든 티가 나서 데모 가치가 없다. 폭은 RESULT_PRICES 와 같은 원칙으로
 * 위험도에 맞췄다 (HIGH ±17~21% / NORMAL ±5~7% / LOW ±1.5~2.5%).
 */
export const DEMO_PRICES = {
  loss: {
    101:   68850, // 제주반도체         76,500 → −10.00%  (HIGH)
    102:  261660, // 삼성전자          267,000 →  −2.00%  (LOW)
    103:   31592, // HLB               35,900 → −12.00%  (HIGH)
    104: 1563195, // 삼성바이오로직스 1,587,000 →  −1.50%  (LOW)
    105:    1419, // 스페코             1,559 →  −8.98%  (HIGH)
    106:  132888  // 한국항공우주      135,600 →  −2.00%  (LOW)
  },
  profit: {
    101:   84150, // 제주반도체         76,500 → +10.00%  (HIGH)
    102:  272340, // 삼성전자          267,000 →  +2.00%  (LOW)
    103:   40208, // HLB               35,900 → +12.00%  (HIGH)
    104: 1610805, // 삼성바이오로직스 1,587,000 →  +1.50%  (LOW)
    105:    1699, // 스페코             1,559 →  +8.98%  (HIGH)
    106:  138312  // 한국항공우주      135,600 →  +2.00%  (LOW)
  }
}

/**
 * 시나리오에 맞는 결과가를 고른다.
 * flat 은 기준가를 그대로 돌려줘 배분이 무엇이든 정확히 0% 가 나오게 한다.
 */
function priceFor(outcome, stockId, buyPrice) {
  if (outcome === 'flat') return buyPrice
  if (outcome === 'loss' || outcome === 'profit') {
    return DEMO_PRICES[outcome][stockId] ?? buyPrice
  }
  return RESULT_PRICES[stockId] ?? buyPrice
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
 * @param {object}  opts
 * @param {boolean} opts.reveal   결과 예정일 전이라도 결과를 공개할지 (발표 데모용)
 * @param {string}  opts.outcome  'actual'(실제 배분 결과) | 'profit' | 'loss' | 'flat' — 발표 데모용
 */
export function createMockGameResult(submitResult, stocks, initialCash, opts = {}) {
  const { reveal = false, outcome = 'actual' } = opts
  const byId = Object.fromEntries((stocks || []).map((s) => [s.id, s]))
  const availableAt = submitResult?.resultAvailableAt ?? null
  const due = availableAt ? Date.now() >= new Date(availableAt).getTime() : true

  const orders = (submitResult?.orders || []).map((o) => {
    const stock = byId[o.courseId] || {}
    const buyPrice = Number(o.stockPrice) || 0
    const resultPrice = priceFor(outcome, o.courseId, buyPrice)
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
    /** 지금 어떤 시나리오로 계산된 결과인지 — 화면의 데모 칩이 선택 상태를 표시하는 데 쓴다 */
    outcome,
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
