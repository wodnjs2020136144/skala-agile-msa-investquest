import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { gameApi } from '@/api/game.js'
import { recommendApi } from '@/api/recommend.js'
import { resultApi } from '@/api/result.js'
import { GAME_RULES } from '@/mock/scenario.js'

/**
 * 게임 세션 스토어.
 *
 * ⚠️ 게임 진행 단계(상황확인 → 배분 → 확정)는 프런트 로컬 상태로만 관리한다.
 *    enrollments.status 는 PENDING·ACTIVE·CANCELLED 3개로 고정돼 있고
 *    Consumer·Enrollment.activate()·프런트가 그 문자열을 직접 비교하므로
 *    초안 §6 의 READY/SUBMITTED/IN_PROGRESS/REWARDED 를 서버 상태로 쓸 수 없다
 *    (docs/07_스키마-설계안_검토.md §C).
 */
export const useGameStore = defineStore('game', () => {
  const participation = ref(null)
  const scenario = ref(null)
  const stocks = ref([])

  /** stockId → 투자 금액(원). 현금은 여기 없고 잔액으로 파생된다 */
  const allocations = ref({})

  const loading = ref(false)
  const error = ref(null)
  const submitting = ref(false)
  const result = ref(null)
  const profile = ref(null)
  const analyzing = ref(false)
  const analysisError = ref(null)

  /**
   * 3일 뒤 결과와 참여 리워드.
   *
   * 둘 다 확정(result) 이후에만 의미가 있다. 새로고침하면 result 가 날아가므로
   * 결과 화면은 result 가 없을 때 빈 상태를 보여 준다 — 확정 화면과 같은 방식이다.
   */
  const gameResult = ref(null)
  const loadingResult = ref(false)
  const resultError = ref(null)
  const reward = ref(null)
  const loadingReward = ref(false)
  const rewardError = ref(null)

  /**
   * 행동 이벤트 로그.
   *
   * 초안 §15 의 6개 중 Sprint1 범위 4개만 기록한다.
   * ⚠️ Sprint1 에서는 수집만 하고 서버로 보내지 않는다.
   *    전송 여부·지표 환산 방식은 안건 5-2 별도 세션에서 정한다.
   *
   * 이 로그가 있어야 나오는 지표가 있다 — "선택을 바꾼 횟수"는
   * 최종 선택만 enrollments 에 저장되므로 DB 에 남지 않는다
   * (docs/07_스키마-설계안_검토.md §C-1).
   */
  const events = ref([])

  function track(type, payload = {}) {
    events.value.push({ type, at: new Date().toISOString(), ...payload })
  }

  const initialCash = computed(() => scenario.value?.initialCash ?? 0)

  const investedTotal = computed(() =>
    Object.values(allocations.value).reduce((sum, v) => sum + (Number(v) || 0), 0)
  )

  const cashBalance = computed(() => initialCash.value - investedTotal.value)

  const selectedCount = computed(
    () => Object.values(allocations.value).filter((v) => Number(v) > 0).length
  )

  /** 배분을 바꾼 횟수 — 신중함 / 판단 변동성 지표의 원천 */
  const changeCount = computed(
    () => events.value.filter((e) => e.type === 'ALLOCATION_CHANGED').length
  )

  const isOverBudget = computed(() => cashBalance.value < 0)

  /**
   * 확정 가능 여부.
   * 안건 3-3 이 현금 보유를 허용하므로 전액 사용을 강제하지 않는다.
   * 다만 아무것도 투자하지 않으면 성향 신호가 전혀 없으므로 1종목 이상은 요구한다.
   */
  const canSubmit = computed(
    () => !isOverBudget.value && selectedCount.value > 0 && !submitting.value
  )

  /** 금액 → 비중(%) */
  function weightOf(stockId) {
    if (!initialCash.value) return 0
    return ((Number(allocations.value[stockId]) || 0) / initialCash.value) * 100
  }

  const cashWeight = computed(() => {
    if (!initialCash.value) return 0
    return (Math.max(cashBalance.value, 0) / initialCash.value) * 100
  })

  // ── 성향 신호 ────────────────────────────────────────────────
  //
  // 기획 초안 §7 의 행동 데이터를 화면에서 계산 가능한 형태로 옮긴 것이다.
  //
  // ⚠️ 분석 방식(규칙 기반 / LLM)은 Sprint2 에서 정한다. 여기서 확정하는 것은
  //    "무엇을 재는가"까지이고 유형·점수는 만들지 않는다. 어느 방식으로 가든
  //    입력은 같기 때문에 수집만 먼저 시작한다 — Sprint1 에 수집을 시작하지
  //    않으면 Sprint2 에 쓸 데이터 자체가 없다.
  //
  // 종목의 sector · risk 는 mock/stocks.js 에 이미 있다(백엔드 스키마 확정안이
  // courses 에 추가하기로 한 risk_level 을 미리 반영한 값). 새 데이터가 필요 없다.
  //
  // ⚠️ 분모는 투자금(investedTotal)이다. 초기자금이 아니다.
  //    화면에 쓰는 weightOf() · cashWeight 는 초기자금 기준이라 분모가 다르다.
  //    두 계열을 섞지 않는다 — 배분 화면은 현금이 한 행으로 들어가 합이 100%가
  //    되어야 하고(초기자금 기준), 성향 지표는 "투자한 돈을 어떻게 나눴나"를
  //    보는 것이라(투자금 기준) 서로 다른 질문에 답한다.
  //
  //    투자금 기준으로 맞춘 이유는 성향 분석 서비스가 그 기준으로 계산하기
  //    때문이다. 현금 비중은 그쪽 점수 공식의 investmentRatio 항이 따로 반영한다.
  //    같은 이름의 지표가 화면과 콘솔에서 2배 차이 나면 아무도 못 믿는다.

  /** 한 종목에 몰아넣은 최대 비중(%) — 집중투자 vs 분산 */
  const concentrationRatio = computed(() => {
    if (!investedTotal.value) return 0
    const amounts = Object.values(allocations.value).map((v) => Number(v) || 0)
    if (!amounts.length) return 0
    return (Math.max(...amounts) / investedTotal.value) * 100
  })

  /** 섹터별 투자 비중(%) 맵 — 관심 산업·테마 */
  const sectorWeights = computed(() => {
    if (!investedTotal.value) return {}
    const out = {}
    for (const s of stocks.value) {
      const amount = Number(allocations.value[s.id]) || 0
      if (amount <= 0) continue
      const sector = s.sector || 'UNKNOWN'
      out[sector] = (out[sector] || 0) + (amount / investedTotal.value) * 100
    }
    return out
  })

  /** 고변동성(risk HIGH) 종목 비중 합(%) — 위험 감수 경향 */
  const highRiskRatio = computed(() => {
    if (!investedTotal.value) return 0
    return stocks.value
      .filter((s) => s.risk === 'HIGH')
      .reduce((sum, s) => sum + (Number(allocations.value[s.id]) || 0), 0)
      / investedTotal.value * 100
  })

  /**
   * 게임을 시작한 순간부터 투자를 확정한 순간까지의 초 — 즉흥형 vs 숙고형.
   * 아직 확정하지 않았으면 지금까지의 경과를 준다.
   *
   * computed 가 아니라 함수인 이유: 값이 현재 시각에 의존하는데 Date.now() 는
   * 반응형 소스가 아니라 computed 로 두면 한 번 계산된 뒤 갱신되지 않는다.
   * 확정 시점에 한 번 호출해 쓴다.
   */
  function decisionSeconds() {
    // 새로고침하면 events 가 통째로 날아가 GAME_STARTED 가 없을 수 있다.
    // 그때는 남아 있는 가장 이른 이벤트(SCENARIO_VIEWED)로 대신한다.
    // 실제보다 짧게 나오지만 null 보다는 쓸모가 있다.
    const started = events.value.find((e) => e.type === 'GAME_STARTED')
      ?? events.value.find((e) => e.type === 'SCENARIO_VIEWED')
    if (!started) return null
    const submitted = [...events.value].reverse()
      .find((e) => e.type === 'INVESTMENT_SUBMITTED')
    const endAt = submitted ? new Date(submitted.at).getTime() : Date.now()
    return Math.max(0, Math.round((endAt - new Date(started.at).getTime()) / 1000))
  }

  /**
   * 확정 시점의 성향 신호 7종을 한 덩어리로 만든다.
   *
   * ⚠️ 서버로 보내지 않는다. 전송 여부는 미결 안건(5-2)이고 받을 백엔드 필드도
   *    아직 없다. 지금은 events 로그에만 남아 프런트에서 관찰된다.
   *    "선택을 바꾼 횟수"처럼 최종 상태만 저장하는 DB 로는 절대 복원할 수 없는
   *    지표가 섞여 있어, 보낼 곳이 생겼을 때 이 함수 하나만 연결하면 된다.
   */
  function behaviorMetrics() {
    return {
      cashWeight: cashWeight.value,
      concentrationRatio: concentrationRatio.value,
      highRiskRatio: highRiskRatio.value,
      sectorWeights: sectorWeights.value,
      stockCount: selectedCount.value,
      changeCount: changeCount.value,
      decisionSeconds: decisionSeconds()
    }
  }

  function setAllocation(stockId, amount) {
    const before = Number(allocations.value[stockId]) || 0
    const stock = stocks.value.find((item) => item.id === stockId)
    const stockPrice = Math.floor(Number(stock?.price) || 0)
    let next = Math.max(0, Math.floor(Number(amount) || 0))

    // 주문은 항상 정수 주 단위다. 금액 입력이 들어와도 살 수 있는 정수 주만 남긴다.
    if (stockPrice > 0) next = Math.floor(next / stockPrice) * stockPrice

    // 예산을 넘기지 않도록 잘라낸다. 넘긴 값을 그대로 두면
    // 확정 버튼만 막히고 왜 막혔는지 화면에서 알기 어렵다.
    const others = investedTotal.value - before
    const room = initialCash.value - others
    if (next > room) {
      next = stockPrice > 0
        ? Math.floor(Math.max(0, room) / stockPrice) * stockPrice
        : Math.max(0, room)
    }

    if (next === before) return

    allocations.value = { ...allocations.value, [stockId]: next }
    track('ALLOCATION_CHANGED', {
      stockId,
      beforeAmount: before,
      afterAmount: next,
      beforeQuantity: stockPrice > 0 ? Math.floor(before / stockPrice) : 0,
      afterQuantity: stockPrice > 0 ? Math.floor(next / stockPrice) : 0
    })
  }

  function clearAllocations() {
    const had = selectedCount.value > 0
    allocations.value = {}
    if (had) track('ALLOCATION_CHANGED', { stockId: null, beforeAmount: null, afterAmount: 0 })
  }

  /** 전액을 현금으로 두기 — 현금 100%도 유효한 선택이라는 것을 보여 준다 */
  function allocateAllToCash() {
    clearAllocations()
  }

  async function startGame(scenarioId = 1) {
    loading.value = true
    error.value = null
    try {
      const res = await gameApi.startGame(scenarioId)
      participation.value = res?.data?.data ?? res?.data
      track('GAME_STARTED', {
        scenarioId,
        participationId: participation.value?.participationId
      })
      return participation.value
    } catch (e) {
      error.value = '게임을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function loadScenario(scenarioId = 1) {
    loading.value = true
    error.value = null
    try {
      const res = await gameApi.getScenario(scenarioId)
      scenario.value = res?.data?.data ?? res?.data
      track('SCENARIO_VIEWED', { scenarioId })
      return scenario.value
    } catch (e) {
      error.value = '시나리오를 불러오지 못했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function loadStocks() {
    loading.value = true
    error.value = null
    try {
      const res = await gameApi.getOfferedStocks(participation.value?.participationId)
      stocks.value = res?.data?.data ?? res?.data ?? []
      return stocks.value
    } catch (e) {
      error.value = '종목 목록을 불러오지 못했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function submit() {
    if (!canSubmit.value) return null
    submitting.value = true
    error.value = null
    try {
      const list = stocks.value
        .filter((s) => Number(allocations.value[s.id]) > 0)
        .map((s) => {
          const amount = Number(allocations.value[s.id])
          return {
            stockId: s.id,
            price: s.price,
            amount,
            // 정수 주 단위. 남는 금액은 현금으로 돌아간다
            quantity: amount / s.price
          }
        })

      track('INVESTMENT_SUBMITTED', {
        totalAmount: investedTotal.value,
        cashBalance: cashBalance.value,
        ...behaviorMetrics()
      })

      const res = await gameApi.submitInvestment({
        participationId: participation.value?.participationId,
        allocations: list,
        cashBalance: cashBalance.value
      })
      result.value = res?.data?.data ?? res?.data
      await analyzeProfile()
      return result.value
    } catch (e) {
      error.value = '투자 확정에 실패했습니다. 다시 시도해 주세요.'
      throw e
    } finally {
      submitting.value = false
    }
  }

  /**
   * 최종 배분과 프런트에서 수집한 행동 로그를 AI 서비스 계약으로 변환한다.
   * 분석 실패는 이미 완료된 투자 확정을 되돌리지 않고 결과 화면에서 재시도할 수 있게 한다.
   */
  async function analyzeProfile() {
    if (!participation.value || selectedCount.value === 0) return null

    analyzing.value = true
    analysisError.value = null
    try {
      const started = events.value.find((event) => event.type === 'GAME_STARTED')
      const submitted = [...events.value].reverse()
        .find((event) => event.type === 'INVESTMENT_SUBMITTED')
      const startedAt = started ? Date.parse(started.at) : Date.now()
      const submittedAt = submitted ? Date.parse(submitted.at) : Date.now()
      const decisionSeconds = Math.max(0, Math.round((submittedAt - startedAt) / 1000))

      const profileAllocations = stocks.value
        .filter((stock) => Number(allocations.value[stock.id]) > 0)
        .map((stock) => ({
          stockId: stock.id,
          name: stock.name,
          sector: stock.sector,
          risk: stock.risk,
          amount: Number(allocations.value[stock.id])
        }))

      const res = await recommendApi.analyzeInvestment({
        participationId: participation.value.participationId,
        initialCash: initialCash.value,
        cashBalance: cashBalance.value,
        changeCount: changeCount.value,
        decisionSeconds,
        allocations: profileAllocations
      })
      profile.value = res?.data?.data ?? res?.data
      return profile.value
    } catch (error) {
      analysisError.value = '투자는 확정됐지만 성향 분석을 불러오지 못했습니다.'
      return null
    } finally {
      analyzing.value = false
    }
  }

  /**
   * 3일 뒤 결과를 불러온다.
   *
   * @param {boolean} reveal  예정일 전이라도 결과를 공개한다 (발표 데모용, 목 모드에서만 의미 있음)
   * @param {string}  outcome 'actual' | 'profit' | 'loss' | 'flat' — 결과 방향을 강제한다 (발표 데모용)
   */
  async function loadGameResult({ reveal = false, outcome = 'actual' } = {}) {
    if (!result.value) return null

    loadingResult.value = true
    resultError.value = null
    try {
      const res = await resultApi.getGameResult({
        submitResult: result.value,
        stocks: stocks.value,
        initialCash: initialCash.value,
        reveal,
        outcome
      })
      gameResult.value = res?.data?.data ?? res?.data
      /*
       * 리워드는 결과의 수익률에서 파생된다. 결과가 바뀌었는데 리워드를 그대로 두면
       * 손실 화면인데 10,000P 가 남는다. 비워 두면 리워드 화면이 onMounted 에서 다시 받아 온다.
       */
      reward.value = null
      return gameResult.value
    } catch (e) {
      resultError.value = '투자 결과를 불러오지 못했습니다.'
      throw e
    } finally {
      loadingResult.value = false
    }
  }

  /**
   * 참여 리워드 상태.
   *
   * 결과가 공개된 뒤에만 호출한다 — 지급액이 수익률로 갈리기 때문이다.
   * paymentId 는 실 모드에서 결과 응답이 알려 줘야 한다(아직 없음). 목에서는 자체 발급한다.
   */
  async function loadReward() {
    if (!gameResult.value || gameResult.value.status !== 'CONFIRMED') return null

    loadingReward.value = true
    rewardError.value = null
    try {
      /*
       * 재투자는 결과가 실제로 공개된 시점부터 센다.
       * 예정일이 지나 정상 공개됐다면 그 날짜가 시작점이고,
       * 발표용으로 미리 열어 본 경우(revealed)에는 예정일이 아직 미래라
       * 그대로 쓰면 "재투자 중 D-6" 처럼 시간축이 섞인다. 그때는 지금부터 센다.
       */
      const res = await resultApi.getReward(gameResult.value.paymentId ?? null, {
        returnRate: gameResult.value.returnRate,
        startedAt: gameResult.value.revealed ? undefined : gameResult.value.resultAvailableAt
      })
      reward.value = res?.data?.data ?? res?.data
      return reward.value
    } catch (e) {
      rewardError.value = '리워드 정보를 불러오지 못했습니다.'
      throw e
    } finally {
      loadingReward.value = false
    }
  }

  function reset() {
    participation.value = null
    scenario.value = null
    stocks.value = []
    allocations.value = {}
    result.value = null
    profile.value = null
    analyzing.value = false
    analysisError.value = null
    gameResult.value = null
    loadingResult.value = false
    resultError.value = null
    reward.value = null
    loadingReward.value = false
    rewardError.value = null
    error.value = null
    events.value = []
  }

  return {
    participation, scenario, stocks, allocations, loading, error, submitting, result, events,
    profile, analyzing, analysisError,
    gameResult, loadingResult, resultError, reward, loadingReward, rewardError,
    initialCash, investedTotal, cashBalance, selectedCount, changeCount,
    isOverBudget, canSubmit, cashWeight,
    concentrationRatio, sectorWeights, highRiskRatio,
    rules: GAME_RULES,
    weightOf, setAllocation, clearAllocations, allocateAllToCash,
    decisionSeconds, behaviorMetrics,
    startGame, loadScenario, loadStocks, submit, analyzeProfile,
    loadGameResult, loadReward, reset, track
  }
})
