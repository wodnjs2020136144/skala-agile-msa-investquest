<template>
  <div class="page">
    <div class="page-inner fade-in-up">
      <GameProgress :current="2" />

      <h1 class="page-title">투자금 배분</h1>
      <p class="page-sub">
        제시된 종목과 현금에 투자금을 나눠 담아 보세요. 전액을 쓰지 않아도 됩니다.
      </p>

      <!-- 잔액 요약 — 화면을 스크롤해도 항상 보이게 고정한다 -->
      <div class="summary" :class="{ over: game.isOverBudget }">
        <div class="sum-item">
          <span class="sum-label">보유 투자금</span>
          <strong class="sum-value">{{ format(game.initialCash) }}원</strong>
        </div>
        <div class="sum-item">
          <span class="sum-label">투자 합계</span>
          <strong class="sum-value">{{ format(game.investedTotal) }}원</strong>
        </div>
        <div class="sum-item highlight">
          <span class="sum-label">잔여 현금</span>
          <strong class="sum-value">{{ format(game.cashBalance) }}원</strong>
        </div>
      </div>

      <div class="cash-meter">
        <span class="cm-label">현금 보유 비중</span>
        <div class="cm-bar">
          <div class="cm-fill" :style="{ width: game.cashWeight + '%' }"></div>
        </div>
        <span class="cm-weight">{{ game.cashWeight.toFixed(0) }}%</span>
      </div>

      <div class="toolbar">
        <span class="tb-count">{{ game.selectedCount }}종목 선택됨</span>
        <div class="tb-actions">
          <button type="button" class="tb-btn" @click="game.allocateAllToCash()">
            전부 현금으로
          </button>
        </div>
      </div>

      <div v-if="game.loading && !game.stocks.length" class="skeleton-box" aria-busy="true">
        종목을 불러오는 중...
      </div>

      <p v-else-if="game.error && !game.stocks.length" class="error-msg" role="alert">
        {{ game.error }}
        <button type="button" class="retry" @click="load">다시 시도</button>
      </p>

      <div v-else class="alloc-list">
        <AllocationRow
          v-for="stock in game.stocks"
          :key="stock.id"
          :stock="stock"
          :amount="Number(game.allocations[stock.id]) || 0"
          :max-amount="maxFor(stock.id)"
          :initial-cash="game.initialCash"
          @update="(v) => game.setAllocation(stock.id, v)"
        />
      </div>

      <p v-if="game.error && game.stocks.length" class="error-msg" role="alert">
        {{ game.error }}
      </p>

      <p v-if="game.selectedCount === 0" class="hint">
        한 종목 이상 선택해야 투자를 확정할 수 있습니다.
      </p>

      <div class="actions">
        <router-link to="/game/scenario" class="btn btn-outline">이전</router-link>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="!game.canSubmit"
          @click="confirm"
        >
          {{ game.submitting ? '확정 중...' : '투자 확정하기' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/store/game.js'
import GameProgress from '@/components/game/GameProgress.vue'
import AllocationRow from '@/components/game/AllocationRow.vue'

const router = useRouter()
const game = useGameStore()

function format(n) {
  return Number(n).toLocaleString('ko-KR')
}

/** 이 종목에 넣을 수 있는 상한 = 지금 넣은 금액 + 남은 현금 */
function maxFor(stockId) {
  const current = Number(game.allocations[stockId]) || 0
  return current + Math.max(game.cashBalance, 0)
}

async function load() {
  try {
    if (!game.scenario) await game.loadScenario(1)
    await game.loadStocks()
  } catch {
    // game.error 로 화면에 표시된다
  }
}

async function confirm() {
  try {
    await game.submit()
    router.push('/game/confirm')
  } catch {
    // game.error 로 화면에 표시된다
  }
}

onMounted(() => {
  if (!game.stocks.length) load()
})
</script>

<style scoped>
@import './game-page.css';

.page-inner { max-width: 860px; }

.summary {
  position: sticky;
  top: 76px;
  z-index: 5;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--color-border);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 16px;
  /* 스크롤 시 종목 카드 위로 지나가므로 떠 있다는 것이 보여야 한다 */
  box-shadow: var(--shadow-md);
}

.summary.over { border-color: var(--color-danger); }

.sum-item {
  background: var(--color-bg-primary);
  padding: 14px 16px;
  display: grid;
  gap: 5px;
}

.sum-item.highlight { background: var(--color-primary-light); }
.summary.over .sum-item.highlight { background: var(--color-danger-light); }

.sum-label { font-size: 0.78rem; color: var(--color-text-secondary); }

.sum-value {
  font-size: 1.05rem;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

.sum-item.highlight .sum-value { color: var(--color-primary); }
.summary.over .sum-item.highlight .sum-value { color: var(--color-danger); }

.cash-meter {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 0 2px;
}

.cm-label { font-size: 0.8rem; color: var(--color-text-secondary); white-space: nowrap; }

.cm-bar {
  flex: 1;
  height: 8px;
  background: var(--color-bg-tertiary);
  border-radius: 999px;
  overflow: hidden;
}

/* 현금은 '보유'라서 등락 파랑 계열을 쓴다 */
.cm-fill {
  height: 100%;
  background: var(--color-down);
  border-radius: 999px;
  transition: width 0.2s ease;
}

.cm-weight {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
  min-width: 34px;
  text-align: right;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.tb-count { font-size: 0.85rem; color: var(--color-text-secondary); font-weight: 600; }

.tb-btn {
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition);
}

.tb-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
.tb-btn:focus-visible { outline: none; box-shadow: var(--focus-ring); }

.alloc-list { display: grid; gap: 12px; }

.hint {
  margin: 16px 0 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  text-align: center;
}

.skeleton-box {
  padding: 60px 0;
  text-align: center;
  color: var(--color-text-muted);
}

.retry {
  margin-left: 10px;
  background: none;
  border: none;
  color: var(--color-danger);
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
  font-size: inherit;
}

@media (max-width: 620px) {
  .summary { grid-template-columns: 1fr; position: static; }
  .cash-meter { flex-wrap: wrap; }
}

@media (prefers-reduced-motion: reduce) {
  .cm-fill { transition: none; }
}
</style>
