<template>
  <div class="page">
    <!--
      1024px 이상에서는 두 컬럼 grid — 왼쪽 종목 리스트, 오른쪽 sticky 주문 패널(토스증권 웹).
      DOM 순서는 모바일 흐름(제목 → 요약 → 리스트 → CTA) 그대로라 좁은 폭에서는 block 으로 흐른다.
    -->
    <div class="page-inner fade-in-up">
      <div class="col-head">
        <GameProgress :current="2" />

        <h1 class="page-title">투자금 배분</h1>
        <p class="page-sub">
          제시된 종목과 현금에 투자금을 나눠 담아 보세요. 전액을 쓰지 않아도 됩니다.
        </p>
      </div>

      <!--
        잔액 요약 — 토스 주문 패널. 화면을 스크롤해도 항상 보이게 고정한다.
        좁은 폭에서는 컬럼 상단에, 데스크톱에서는 오른쪽 사이드바에 붙는다.
        잔여 현금이 이 화면의 유일한 큰 숫자다.
        (isOverBudget 은 스토어가 클램프해서 실제로는 도달하지 않는다. 스타일만 남긴다.)
      -->
      <aside class="side" aria-label="투자금 요약">
        <div class="side-inner">
          <div class="summary card" :class="{ over: game.isOverBudget, stuck }">
            <div class="sum-row">
              <span class="sum-label">보유 투자금</span>
              <strong class="sum-value num">{{ format(game.initialCash) }}원</strong>
            </div>
            <div class="sum-hero">
              <span class="sum-label">잔여 현금</span>
              <strong class="sum-value num num-xl">{{ format(game.cashBalance) }}원</strong>
            </div>
            <div class="cash-meter">
              <div class="track">
                <div class="track-fill" :style="{ transform: 'scaleX(' + game.cashWeight / 100 + ')' }"></div>
              </div>
              <span class="cm-label">현금 보유 비중 <span class="cm-weight num">{{ game.cashWeight.toFixed(0) }}%</span></span>
            </div>
            <div class="sum-row">
              <span class="sum-label">투자 합계</span>
              <strong class="sum-value num">{{ format(game.investedTotal) }}원</strong>
            </div>
          </div>

          <!--
            데스크톱 전용 확정 버튼 — 아래 BottomCta 와 같은 마크업.
            BottomCta 를 여기로 옮기지 않는 이유: 그 컴포넌트의 스페이서가 모바일에서 제자리에 남아
            페이지 중간에 빈 칸이 생긴다. 1024px 미만에서는 이 블록을 숨기고 BottomCta 가 맡는다.
          -->
          <div class="side-actions">
            <button
              type="button"
              class="btn btn-primary"
              :disabled="!game.canSubmit"
              @click="confirm"
            >
              {{ game.submitting ? '확정 중...' : '투자 확정하기' }}
            </button>
            <router-link to="/game/scenario" class="btn btn-ghost">이전</router-link>
          </div>
        </div>
      </aside>

      <div class="col-body">
        <div class="toolbar">
          <span class="tb-count">{{ game.selectedCount }}종목 선택됨</span>
          <button type="button" class="chip chip-on-ground" @click="game.allocateAllToCash()">
            전부 현금으로
          </button>
        </div>

        <div v-if="game.loading && !game.stocks.length" class="loading" aria-busy="true">
          <div class="iq-spinner" aria-hidden="true"></div>
          종목을 불러오는 중...
        </div>

        <p v-else-if="game.error && !game.stocks.length" class="error-msg" role="alert">
          {{ game.error }}
          <button type="button" class="text-btn retry" @click="load">다시 시도</button>
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

        <!-- 1024px 이상에서는 사이드바의 .side-actions 가 대신한다 -->
        <BottomCta class="cta-inline">
          <template #secondary>
            <router-link to="/game/scenario" class="btn btn-ghost">이전</router-link>
          </template>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="!game.canSubmit"
            @click="confirm"
          >
            {{ game.submitting ? '확정 중...' : '투자 확정하기' }}
          </button>
        </BottomCta>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/store/game.js'
import GameProgress from '@/components/game/GameProgress.vue'
import AllocationRow from '@/components/game/AllocationRow.vue'
import BottomCta from '@/components/ui/BottomCta.vue'

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

/* 화면 표시용 — 요약 카드가 붙은 뒤에는 모바일에서 한 줄로 접는다 (스토어와 무관) */
const stuck = ref(false)
function onScroll() {
  stuck.value = window.scrollY > 160
}

onMounted(() => {
  if (!game.stocks.length) load()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
@import './game-page.css';

.page-inner { max-width: 720px; }

/* 주문 헤더 카드 — sticky. 모바일에서는 리스트를 덜 가리도록 낮게 짠다. */
.summary {
  position: sticky;
  top: calc(var(--header-h) + var(--space-2));
  z-index: var(--z-sticky);
  padding: var(--space-4) var(--space-5);
  margin-bottom: var(--space-4);
  box-shadow: var(--elev-sticky);
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    'hero hero'
    'meter meter'
    'row1 row2';
  row-gap: var(--space-3);
  column-gap: var(--space-4);
}
.sum-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  min-width: 0;
}
.sum-row:first-child { grid-area: row1; }
.sum-row:last-child { grid-area: row2; justify-content: flex-end; }
.sum-hero {
  grid-area: hero;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sum-label {
  font-size: var(--fs-13);
  font-weight: var(--fw-medium);
  color: var(--text-weak);
  white-space: nowrap;
}
.sum-row .sum-label { font-size: var(--fs-12); }
.sum-row .sum-value { font-size: var(--fs-14); font-weight: var(--fw-semibold); }
.sum-hero .sum-value { font-size: var(--fs-24); }
/* 붙은 상태(모바일) — 보유·합계 행을 접고 큰 숫자를 줄여 리스트를 가리지 않는다 */
@media (max-width: 767px) {
  .summary.stuck { padding-top: var(--space-3); padding-bottom: var(--space-3); row-gap: var(--space-2); }
  .summary.stuck .sum-row { display: none; }
  .summary.stuck .sum-hero { flex-direction: row; align-items: baseline; justify-content: space-between; }
  .summary.stuck .sum-hero .sum-value { font-size: var(--fs-20); }
}
.summary.over { background: var(--negative-weak); }
.summary.over .sum-hero .sum-value { color: var(--negative); }

.cash-meter {
  grid-area: meter;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.cm-label {
  font-size: var(--fs-13);
  color: var(--text-weak);
  display: flex;
  justify-content: space-between;
}
.cm-weight { font-size: var(--fs-13); color: var(--text); }

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
  padding: 0 var(--space-1);
}
.tb-count {
  font-size: var(--fs-14);
  font-weight: var(--fw-semibold);
  color: var(--text);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-10) 0;
  font-size: var(--fs-15);
  color: var(--text-weak);
}
.retry { margin-left: var(--space-2); }

.alloc-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

/* 확정 버튼이 왜 막혔는지 보여 준다 */
.hint {
  margin: var(--space-4) 0 0;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--r-12);
  background: var(--surface);
  box-shadow: var(--elev-card);
  font-size: var(--fs-14);
  color: var(--text);
  text-align: center;
}

/* 사이드바 전용 버튼 — 좁은 폭에서는 BottomCta 가 맡으므로 숨긴다 */
.side-actions { display: none; }

@media (min-width: 768px) {
  .summary { padding: var(--space-5) var(--space-6); }
  .sum-hero .sum-value { font-size: var(--fs-32); }
  .sum-row .sum-label { font-size: var(--fs-13); }
  .sum-row .sum-value { font-size: var(--fs-15); }
}

/*
 * 데스크톱 — 두 컬럼. 왼쪽 종목 리스트, 오른쪽 sticky 주문 패널(토스증권 웹).
 * aside 는 grid 의 두 행을 다 차지하고(stretch), 그 안의 .side-inner 가 sticky 라
 * 리스트 끝까지 따라온다.
 */
@media (min-width: 1024px) {
  .page-inner {
    max-width: 1040px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 320px;
    grid-template-areas:
      'head side'
      'body side';
    column-gap: var(--space-7);
  }
  .col-head { grid-area: head; }
  .col-body { grid-area: body; }
  .side { grid-area: side; }
  .side-inner {
    position: sticky;
    top: calc(var(--header-h) + var(--space-4));
  }

  /* 요약 카드 — 320px 안에서 세로 한 줄. 상단 sticky 는 .side-inner 로 넘긴다. */
  .summary {
    position: static;
    margin-bottom: var(--space-3);
    padding: var(--space-5);
    box-shadow: var(--elev-card);
    grid-template-columns: 1fr;
    grid-template-areas:
      'hero'
      'meter'
      'row1'
      'row2';
    row-gap: var(--space-3);
  }
  .sum-hero .sum-value { font-size: var(--fs-28); }
  .sum-row:first-child,
  .sum-row:last-child { justify-content: space-between; }
  .sum-row:last-child {
    padding-top: var(--space-3);
    border-top: 1px solid var(--line);
  }

  .side-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .side-actions .btn {
    height: 52px;
    border-radius: var(--r-16);
    font-size: var(--fs-15);
    font-weight: var(--fw-bold);
  }

  .cta-inline { display: none; }
}
</style>
