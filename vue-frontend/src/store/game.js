import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { gameApi } from '@/api/game.js'
import { recommendApi } from '@/api/recommend.js'
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

  function setAllocation(stockId, amount) {
    const before = Number(allocations.value[stockId]) || 0
    let next = Math.max(0, Math.floor(Number(amount) || 0))

    // 예산을 넘기지 않도록 잘라낸다. 넘긴 값을 그대로 두면
    // 확정 버튼만 막히고 왜 막혔는지 화면에서 알기 어렵다.
    const others = investedTotal.value - before
    const room = initialCash.value - others
    if (next > room) next = Math.max(0, room)

    if (next === before) return

    allocations.value = { ...allocations.value, [stockId]: next }
    track('ALLOCATION_CHANGED', { stockId, beforeAmount: before, afterAmount: next })
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
            quantity: Math.floor(amount / s.price)
          }
        })

      track('INVESTMENT_SUBMITTED', {
        totalAmount: investedTotal.value,
        cashBalance: cashBalance.value,
        stockCount: list.length,
        changeCount: changeCount.value
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
          symbol: stock.symbol,
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

  function reset() {
    participation.value = null
    scenario.value = null
    stocks.value = []
    allocations.value = {}
    result.value = null
    profile.value = null
    analyzing.value = false
    analysisError.value = null
    error.value = null
    events.value = []
  }

  return {
    participation, scenario, stocks, allocations, loading, error, submitting, result, events,
    profile, analyzing, analysisError,
    initialCash, investedTotal, cashBalance, selectedCount, changeCount,
    isOverBudget, canSubmit, cashWeight,
    rules: GAME_RULES,
    weightOf, setAllocation, clearAllocations, allocateAllToCash,
    startGame, loadScenario, loadStocks, submit, analyzeProfile, reset, track
  }
})
