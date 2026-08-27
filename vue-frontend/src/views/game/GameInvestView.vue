<template>
  <div class="page dashboard-page">
    <div class="dashboard-shell fade-in-up">
      <GameProgress :current="2" />

      <header class="workspace-head">
        <div>
          <p class="workspace-kicker">INVESTMENT WORKSPACE · DAY 1</p>
          <h1 class="page-title">투자금 배분</h1>
          <p class="page-sub">최고 수익률을 목표로 종목과 현금 사이의 비중을 결정해 보세요.</p>
        </div>
      </header>

      <div class="invest-layout">
        <main class="market-panel">
          <div class="panel-head market-head">
            <div>
              <p class="panel-kicker">MARKET WATCH</p>
              <h2><i class="fa-solid fa-list" aria-hidden="true"></i>제시 종목</h2>
              <p>기회와 안정성의 균형을 판단해 정수 주 단위로 주문하세요.</p>
            </div>
            <div class="selection-count">
              <span><i class="fa-solid fa-layer-group" aria-hidden="true"></i> 선택 종목</span>
              <strong>{{ game.selectedCount }} <em>/ {{ game.stocks.length }}</em></strong>
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

          <p v-if="game.error && game.stocks.length" class="error-msg" role="alert">{{ game.error }}</p>
        </main>

        <!-- 종목 목록과 분리한 고정 포트폴리오: 선택 결과를 항상 확인할 수 있다. -->
        <aside class="portfolio-panel">
          <section class="portfolio-card" :class="{ over: game.isOverBudget }">
            <div class="panel-head compact-head">
              <div>
                <p class="panel-kicker">PORTFOLIO</p>
                <h2><i class="fa-solid fa-wallet" aria-hidden="true"></i>투자 현황</h2>
              </div>
              <span class="live-chip"><i></i>LIVE</span>
            </div>

            <div class="total-fund">
              <span>가상 운용 자금</span>
              <strong>{{ format(game.initialCash) }}원</strong>
            </div>

            <div class="portfolio-ledger">
              <div><span>투자 합계</span><strong>{{ format(game.investedTotal) }}원</strong></div>
              <div class="cash-line"><span>잔여 현금</span><strong>{{ format(game.cashBalance) }}원</strong></div>
            </div>

            <div class="cash-meter">
              <div class="meter-label"><span>현금 보유 비중</span><strong>{{ game.cashWeight.toFixed(0) }}%</strong></div>
              <div class="cm-bar"><div class="cm-fill" :style="{ width: game.cashWeight + '%' }"></div></div>
            </div>

            <button type="button" class="reset-button" @click="game.allocateAllToCash()"><i class="fa-solid fa-rotate-left" aria-hidden="true"></i> 전부 현금으로</button>
          </section>

          <section class="decision-card">
            <p class="decision-label">NEXT STEP</p>
            <p v-if="game.selectedCount === 0" class="hint">한 종목 이상 선택해야 투자를 확정할 수 있습니다.</p>
                <p v-else class="decision-copy">최고 수익률을 위한 전략인지 확인한 뒤 투자 결정을 확정하세요.</p>
            <div class="actions">
              <router-link to="/game/scenario" class="btn btn-outline"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> 이전</router-link>
              <button type="button" class="btn btn-primary" :disabled="!game.canSubmit" @click="confirm">
                <i v-if="!game.submitting" class="fa-solid fa-check" aria-hidden="true"></i>
                {{ game.submitting ? '확정 중...' : '투자 확정하기' }}
              </button>
            </div>
          </section>
        </aside>
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

.dashboard-shell { max-width: 1280px; margin: 0 auto; padding: 34px 24px 56px; }

.workspace-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin: 28px 0; }
.workspace-kicker, .panel-kicker, .decision-label { margin: 0 0 8px; color: var(--color-text-muted); font-size: .7rem; font-weight: 800; letter-spacing: .11em; }
.workspace-head .page-title { margin: 0; }
.workspace-head .page-sub { margin: 9px 0 0; }
.live-chip { display: inline-flex; align-items: center; gap: 7px; border: 1px solid var(--color-border); border-radius: 999px; padding: 8px 10px; color: var(--color-text-secondary); font-size: .75rem; font-weight: 700; white-space: nowrap; }
.live-chip i { width: 6px; height: 6px; border-radius: 50%; background: #62d396; box-shadow: 0 0 0 3px rgba(98, 211, 150, .1); }

.invest-layout { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 20px; align-items: start; }
.market-panel, .portfolio-card, .decision-card { border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-primary); }
.market-panel { padding: 22px; }
.panel-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
.panel-head h2 { margin: 0; color: var(--color-text-primary); font-size: 1.05rem; }
.panel-head h2 .fa-solid { margin-right: 7px; color: var(--color-text-secondary); font-size: .88em; }
.panel-head p:not(.panel-kicker) { margin: 7px 0 0; color: var(--color-text-secondary); font-size: .82rem; }
.market-head { padding-bottom: 20px; border-bottom: 1px solid var(--color-border); margin-bottom: 14px; }
.selection-count { min-width: 78px; padding: 8px 10px; background: var(--color-bg-tertiary); border-radius: var(--radius-sm); text-align: right; }
.selection-count span { display: block; color: var(--color-text-muted); font-size: .68rem; }
.selection-count span .fa-solid { font-size: .65rem; }
.selection-count strong { color: var(--color-text-primary); font-size: 1rem; font-variant-numeric: tabular-nums; }
.selection-count em { color: var(--color-text-muted); font-size: .75rem; font-style: normal; font-weight: 600; }
.alloc-list { display: grid; gap: 10px; }

.portfolio-panel { position: sticky; top: 82px; display: grid; gap: 12px; }
.portfolio-card, .decision-card { padding: 20px; }
.portfolio-card.over { border-color: var(--color-danger); }
.compact-head { align-items: center; padding-bottom: 18px; border-bottom: 1px solid var(--color-border); }
.compact-head .panel-kicker { margin-bottom: 5px; }
.live-chip { padding: 5px 7px; font-size: .65rem; }
.live-chip i { width: 5px; height: 5px; }
.total-fund { padding: 20px 0; border-bottom: 1px solid var(--color-border); }
.total-fund span { display: block; color: var(--color-text-secondary); font-size: .78rem; }
.total-fund strong { display: block; margin-top: 7px; color: var(--color-text-primary); font-size: 1.45rem; font-variant-numeric: tabular-nums; letter-spacing: -.035em; }
.portfolio-ledger { display: grid; gap: 12px; padding: 17px 0; }
.portfolio-ledger div { display: flex; justify-content: space-between; gap: 12px; color: var(--color-text-secondary); font-size: .8rem; }
.portfolio-ledger strong { color: var(--color-text-primary); font-variant-numeric: tabular-nums; }
.portfolio-ledger .cash-line strong { color: var(--color-primary); }
.portfolio-card.over .cash-line strong { color: var(--color-danger); }
.cash-meter { padding: 14px; background: var(--color-bg-tertiary); border-radius: var(--radius-sm); }
.meter-label { display: flex; justify-content: space-between; margin-bottom: 10px; color: var(--color-text-secondary); font-size: .76rem; }
.meter-label strong { color: var(--color-text-primary); font-variant-numeric: tabular-nums; }

.cm-bar {
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

.reset-button {
  width: 100%; margin-top: 12px; padding: 9px 12px; font-size: .78rem; font-weight: 700;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition);
}
.reset-button .fa-solid { margin-right: 4px; }
.reset-button:hover { border-color: var(--color-primary); color: var(--color-primary); }
.reset-button:focus-visible { outline: none; box-shadow: var(--focus-ring); }

.hint {
  margin: 0;
  font-size: .8rem;
  color: var(--color-text-muted);
  line-height: 1.55;
}
.decision-copy { margin: 0; color: var(--color-text-secondary); font-size: .8rem; line-height: 1.55; }
.decision-card .actions { display: grid; grid-template-columns: 1fr 1.45fr; gap: 8px; margin-top: 16px; }
.decision-card .btn { width: 100%; min-height: 42px; padding: 10px 12px; font-size: .82rem; }
.decision-card .btn .fa-solid { margin-right: 5px; }

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
  .dashboard-shell { padding: 24px 16px 44px; }
  .workspace-head { margin: 22px 0; flex-direction: column; gap: 14px; }
  .invest-layout { grid-template-columns: 1fr; }
  .portfolio-panel { position: static; order: -1; }
  .market-panel, .portfolio-card, .decision-card { padding: 16px; }
}

@media (prefers-reduced-motion: reduce) {
  .cm-fill { transition: none; }
}
</style>
