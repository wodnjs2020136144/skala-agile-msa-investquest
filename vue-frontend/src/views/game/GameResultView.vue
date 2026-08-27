<template>
  <div class="page">
    <div class="page-inner fade-in-up">
      <!-- 확정 내역이 없으면 결과를 만들 수 없다. 확정 화면과 같은 빈 상태를 쓴다. -->
      <div v-if="!game.result" class="empty">
        <p>확정된 투자 내역이 없습니다.</p>
        <router-link to="/game/guide" class="btn btn-primary">게임 시작하기</router-link>
      </div>

      <div v-else-if="game.loadingResult && !r" class="state" aria-busy="true">
        결과를 불러오는 중...
      </div>

      <p v-else-if="game.resultError && !r" class="error-msg" role="alert">
        {{ game.resultError }}
        <button type="button" class="retry" @click="load()">다시 시도</button>
      </p>

      <!-- ① 결과 예정일 전 — 대기 화면 -->
      <template v-else-if="r && r.status === 'PENDING'">
        <div class="wait-mark" aria-hidden="true">
          <!-- Free 에는 regular 웨이트 파일이 없어 fa-regular 는 빈 글리프가 된다 -->
          <i class="fa-solid fa-clock"></i>
        </div>
        <h1 class="page-title center">결과를 기다리는 중입니다</h1>
        <p class="page-sub center">
          <strong>{{ resultDate }}</strong>에 최종 수익률과 참여 리워드가 공개됩니다.
        </p>

        <div class="dday">
          <span>공개까지</span>
          <strong>{{ daysLeft }}</strong>
          <span>일 남음</span>
        </div>

        <section class="holding">
          <h2 class="sec-title">보유 중인 포트폴리오</h2>
          <ul class="rc-list">
            <li v-for="o in r.orders" :key="o.stockId" class="rc-row">
              <span class="rc-name">{{ o.name }}</span>
              <span class="rc-qty">{{ format(o.quantity) }}주</span>
              <span class="rc-amount">{{ format(o.investedAmount) }}원</span>
            </li>
            <li v-if="r.cashBalance > 0" class="rc-row">
              <span class="rc-name">현금 보유</span>
              <span class="rc-qty">-</span>
              <span class="rc-amount">{{ format(r.cashBalance) }}원</span>
            </li>
          </ul>
        </section>

        <NoticeCard
          title="결과 공개 전 안내"
          :items="[
            '투자 확정 후 3일 동안에는 투자 내역을 변경할 수 없습니다.',
            `수익이 나면 ${format(policy.profitRewardPoints)}원, 그렇지 않으면 ${format(policy.baseRewardPoints)}원의 참여 리워드가 지급됩니다.`,
            `지급된 리워드는 ${policy.reinvestmentDays}일 재투자 후 출금할 수 있습니다.`
          ]"
        />

        <!--
          발표에서 3일을 기다릴 수 없어 두는 우회로다.
          '데모'라고 이름에 못 박아 실제 기능으로 오해되지 않게 한다.
        -->
        <div class="actions">
          <router-link to="/" class="btn btn-outline">홈으로</router-link>
          <button type="button" class="btn btn-primary" @click="load(true)">
            <i class="fa-solid fa-forward" aria-hidden="true"></i>
            데모: 3일 뒤 결과 미리 보기
          </button>
        </div>
      </template>

      <!-- ② 결과 공개 -->
      <template v-else-if="r">
        <!--
          발표용 도구. 결과는 사용자의 실제 배분으로 계산되므로 손실 화면을 보려면
          하락 종목에 몰아넣는 조합을 미리 알아야 한다. 발표 중에 그럴 수 없어
          방향을 강제하는 전환을 둔다. 목 모드에서만 보인다.
        -->
        <div v-if="USE_MOCK" class="demo-box">
          <div class="demo-head">
            <span class="demo-tag">DEMO</span>
            <span class="demo-title">결과 시나리오</span>
          </div>
          <div class="demo-chips" role="radiogroup" aria-label="결과 시나리오">
            <button
              v-for="opt in OUTCOMES"
              :key="opt.key"
              type="button"
              class="demo-chip"
              :class="{ active: currentOutcome === opt.key }"
              role="radio"
              :aria-checked="currentOutcome === opt.key"
              @click="switchOutcome(opt.key)"
            >
              {{ opt.label }}
            </button>
          </div>
          <p v-if="r.revealed" class="demo-note">
            <i class="fa-solid fa-flask" aria-hidden="true"></i>
            발표용 미리 보기입니다. 실제 공개일은 {{ resultDate }}입니다.
          </p>
        </div>

        <!-- 실 모드에서는 미리 보기 안내만 남는다 -->
        <p v-else-if="r.revealed" class="demo-flag">
          <i class="fa-solid fa-flask" aria-hidden="true"></i>
          발표용 미리 보기입니다. 실제 공개일은 {{ resultDate }}입니다.
        </p>

        <!--
          손익별 마크. 손실에 큰 하락 화살표를 박으면 질책으로 읽힌다.
          기획 초안 §7 은 "수익이 많이 난 사용자를 무조건 좋은 투자자로 평가해서는 안 된다"고
          적어 두었다. 뒤집으면 손실자를 나쁜 투자자로 표현해서도 안 된다 — 손실은 중립 마크를 쓴다.
        -->
        <div class="verdict-mark" :class="tone" aria-hidden="true">
          <i v-if="tone === 'up'" class="fa-solid fa-arrow-trend-up"></i>
          <i v-else-if="tone === 'down'" class="fa-solid fa-minus"></i>
          <i v-else class="fa-solid fa-equals"></i>
        </div>

        <p class="result-kicker">3일간의 결과</p>
        <h1 class="page-title center">{{ headline }}</h1>

        <!--
          수익일 때만 숫자를 롤업하고 글로우를 준다.
          색으로는 감정을 가를 수 없다 — --color-up 이 --color-danger 와,
          --color-down 이 --color-primary 와 값이 같아서다. 그래서 모션·형태·밀도로 가른다.
        -->
        <div class="hero" :class="[tone, { celebrate: tone === 'up' }]">
          <span class="hero-label">수익률</span>
          <strong class="hero-rate">{{ signed(displayRate) }}%</strong>
          <span class="hero-amount">{{ signed(displayAmount, true) }}원</span>
        </div>

        <!--
          손실·0% 안심 배너. 결과 숫자를 본 직후에 둔다 — 여기서 이탈하면 리워드 화면을 못 본다.
          '손실 보전'으로 오해되지 않게 참여 보상임을 같은 블록에서 못 박는다.
        -->
        <div v-if="tone !== 'up'" class="assure">
          <i class="fa-solid fa-shield-heart" aria-hidden="true"></i>
          <div>
            <strong>
              {{ tone === 'down' ? '손실이 나도' : '수익이 나지 않아도' }}
              참여 리워드 {{ format(policy.baseRewardPoints) }}P 는 지급됩니다.
            </strong>
            <span>리워드는 참여에 대한 보상이며 손실을 보전하지 않습니다.</span>
          </div>
        </div>

        <dl class="sum-grid">
          <div>
            <dt>투자 원금</dt>
            <dd>{{ format(r.investedTotal) }}원</dd>
          </div>
          <div>
            <dt>평가 금액</dt>
            <dd>{{ format(r.evaluatedTotal) }}원</dd>
          </div>
          <div>
            <dt>보유 현금</dt>
            <dd>{{ format(r.cashBalance) }}원</dd>
          </div>
          <div class="final">
            <dt>최종 자산</dt>
            <dd>{{ format(r.finalTotal) }}원</dd>
          </div>
        </dl>

        <section class="detail">
          <h2 class="sec-title">종목별 결과</h2>
          <ul class="dt-list">
            <li v-for="o in sortedOrders" :key="o.stockId" class="dt-row">
              <div class="dt-main">
                <strong class="dt-name">{{ o.name }}</strong>
                <span class="dt-qty">{{ format(o.quantity) }}주 · {{ format(o.buyPrice) }}원 매수</span>
              </div>
              <div class="dt-nums">
                <span class="dt-rate" :class="toneOf(o.returnRate)">{{ signed(o.returnRate) }}%</span>
                <span class="dt-profit" :class="toneOf(o.profitAmount)">
                  {{ signed(o.profitAmount, true) }}원
                </span>
              </div>
            </li>
          </ul>
          <p class="detail-note">
            기준가 대비 3일 뒤 가격으로 계산했습니다. 모든 참여자가 같은 가격을 적용받습니다.
          </p>
        </section>

        <section class="reward-teaser" :class="tone">
          <div>
            <p class="rt-label">참여 리워드</p>
            <strong class="rt-points">{{ format(policy.rewardForReturn(r.returnRate)) }}P</strong>
            <p class="rt-desc">
              <!-- 0% 는 손실이 아니다. "수익이 나지 않아"로 묶으면 헤드라인(원금을 지켰습니다)과 톤이 갈린다 -->
              {{ rewardReason }}
              {{ format(policy.rewardForReturn(r.returnRate)) }}원 상당의 리워드가 지급됩니다.
            </p>
          </div>
          <router-link to="/game/reward" class="btn btn-primary">
            리워드 확인하기
            <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </router-link>
        </section>

        <NoticeCard
          class="legal"
          tone="warn"
          icon="fa-solid fa-triangle-exclamation"
          title="유의사항"
          :items="[
            '모의 투자이며 실제 매매가 이루어지지 않았습니다.',
            '등장하는 종목은 모두 가상이며 실존 기업과 무관합니다.',
            '이 결과는 참고용 보조 정보이며 공식 투자자 성향 진단을 대체하지 않습니다.'
          ]"
        />

        <!--
          재도전 링크는 손익과 무관하게 같은 비중으로 둔다.
          손실 직후 더 큰 보상을 내세워 다시 하게 만드는 건 손실 추종(loss chasing) 패턴이라
          증권사 도메인에서는 피한다.
        -->
        <div class="actions">
          <router-link to="/game/confirm" class="btn btn-outline">성향 분석 보기</router-link>
          <router-link to="/game/guide" class="btn btn-primary">다시 도전하기</router-link>
        </div>
        <p class="home-link">
          <router-link to="/">홈으로</router-link>
        </p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useGameStore } from '@/store/game.js'
import NoticeCard from '@/components/game/NoticeCard.vue'
import { REWARD_POLICY } from '@/mock/scenario.js'
import { useCountUp } from '@/composables/useCountUp.js'
import { USE_MOCK } from '@/config.js'

/** 발표용 결과 시나리오. 'actual' 은 사용자가 실제로 배분한 결과다. */
const OUTCOMES = [
  { key: 'actual', label: '실제' },
  { key: 'profit', label: '수익' },
  { key: 'loss', label: '손실' },
  { key: 'flat', label: '0%' }
]

const game = useGameStore()
const r = computed(() => game.gameResult)
const policy = REWARD_POLICY

function format(n) {
  return Number(n ?? 0).toLocaleString('ko-KR')
}

/** 부호를 항상 붙인다 — 손익은 방향이 먼저 읽혀야 한다 */
function signed(n, isAmount = false) {
  const v = Number(n ?? 0)
  const body = isAmount ? format(Math.abs(v)) : Math.abs(v).toFixed(2)
  if (v > 0) return `+${body}`
  if (v < 0) return `-${body}`
  return isAmount ? body : `${body}`
}

/** 국내 증권 관례 — 상승 빨강, 하락 파랑 */
function toneOf(n) {
  const v = Number(n ?? 0)
  if (v > 0) return 'up'
  if (v < 0) return 'down'
  return 'flat'
}

const tone = computed(() => toneOf(r.value?.returnRate))

const headline = computed(() => {
  const rate = Number(r.value?.returnRate ?? 0)
  if (rate > 0) return '수익으로 마감했습니다'
  if (rate < 0) return '손실로 마감했습니다'
  return '원금을 지켰습니다'
})

/** 0% 는 손실이 아니다. 셋을 각각 다르게 말한다 */
const rewardReason = computed(() => {
  const rate = Number(r.value?.returnRate ?? 0)
  if (rate > 0) return '수익을 냈으므로'
  if (rate < 0) return '이번에는 수익이 나지 않아'
  return '수익률이 0% 이므로'
})

/*
 * 수익일 때만 숫자를 롤업한다.
 * 손실 금액이 0 에서 차오르는 연출은 질책처럼 읽혀서 쓰지 않는다.
 * 손실·0% 는 최종값을 그대로 내보낸다.
 */
const rateUp = useCountUp()
const amountUp = useCountUp()

const displayRate = computed(() =>
  tone.value === 'up' ? rateUp.value.value : Number(r.value?.returnRate ?? 0)
)
const displayAmount = computed(() =>
  tone.value === 'up' ? Math.round(amountUp.value.value) : Number(r.value?.profitAmount ?? 0)
)

/** 결과가 도착하거나 바뀌면(데모 미리 보기 포함) 다시 센다 */
watch(
  () => [r.value?.returnRate, tone.value],
  () => {
    if (tone.value !== 'up') return
    rateUp.start(Number(r.value?.returnRate ?? 0))
    amountUp.start(Number(r.value?.profitAmount ?? 0))
  },
  { immediate: true }
)

/** 기여가 큰 순으로 — 무엇이 결과를 갈랐는지 먼저 보이게 한다 */
const sortedOrders = computed(() =>
  [...(r.value?.orders || [])].sort(
    (a, b) => Math.abs(b.profitAmount) - Math.abs(a.profitAmount)
  )
)

const resultDate = computed(() => {
  if (!r.value?.resultAvailableAt) return '3일 뒤'
  return new Date(r.value.resultAvailableAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const daysLeft = computed(() => {
  if (!r.value?.resultAvailableAt) return policy.reinvestmentDays
  const ms = new Date(r.value.resultAvailableAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 86400000))
})

const currentOutcome = computed(() => r.value?.outcome ?? 'actual')

function load(reveal = false, outcome = 'actual') {
  game.loadGameResult({ reveal, outcome }).catch(() => {
    // game.resultError 로 화면에 표시된다
  })
}

/**
 * 시나리오만 바꾼다. 미리 보기 상태는 유지해야 예정일 전에도 계속 볼 수 있다.
 * 결과가 바뀌면 스토어가 리워드를 비우므로 리워드 화면도 새 수익률을 따라간다.
 */
function switchOutcome(outcome) {
  if (outcome === currentOutcome.value) return
  load(r.value?.revealed ?? false, outcome)
}

onMounted(() => {
  if (game.result && !game.gameResult) load()
})
</script>

<style scoped>
@import './game-page.css';

.page-title.center { text-align: center; }
.page-sub.center { text-align: center; }
.page-sub.center strong { color: var(--color-primary); }

.state { padding: 60px 0; text-align: center; color: var(--color-text-secondary); }

.empty {
  padding: 60px 0;
  text-align: center;
  display: grid;
  gap: 20px;
  justify-items: center;
  color: var(--color-text-secondary);
}

.retry {
  margin-left: 8px;
  border: 0;
  background: transparent;
  color: var(--color-primary);
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}

/* ── 대기 화면 ─────────────────────────────────────────── */
.wait-mark {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin: 8px auto 20px;
  border-radius: 50%;
  border: 1px solid var(--color-border-hover);
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  font-size: 1.5rem;
}

.dday {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  margin-bottom: 28px;
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.dday strong {
  color: var(--color-primary);
  font-size: 2rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.holding { margin-bottom: 24px; }

/* ── 결과 공개 ─────────────────────────────────────────── */
/* ── 발표용 결과 시나리오 전환 ─────────────────────────── */
.demo-box {
  margin: 0 0 20px;
  padding: 12px 14px;
  border: 1px dashed var(--color-border-hover);
  border-radius: var(--radius-md);
  background: var(--color-bg-tertiary);
}

.demo-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }

.demo-tag {
  padding: 3px 6px;
  border-radius: 4px;
  background: var(--color-bg-secondary);
  color: var(--color-text-muted);
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.demo-title { color: var(--color-text-secondary); font-size: 0.78rem; font-weight: 700; }

.demo-chips { display: flex; flex-wrap: wrap; gap: 6px; }

.demo-chip {
  padding: 7px 14px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.demo-chip.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.demo-note {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 10px 0 0;
  color: var(--color-text-muted);
  font-size: 0.74rem;
  line-height: 1.5;
}

.demo-flag {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 20px;
  padding: 10px 14px;
  border: 1px dashed var(--color-border-hover);
  border-radius: var(--radius-sm);
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  font-size: 0.8rem;
}

.result-kicker {
  margin: 0 0 6px;
  color: var(--color-text-muted);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.11em;
  text-align: center;
}

/* ── 손익 마크 ─────────────────────────────────────────── */
.verdict-mark {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin: 4px auto 18px;
  border-radius: 50%;
  font-size: 1.4rem;
  border: 1px solid var(--color-border);
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

.verdict-mark.up {
  border-color: var(--color-up);
  background: var(--color-up-light);
  color: var(--color-up);
  animation: markPop 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* 손실·0% 는 팝하지 않는다. 축하 연출의 반대는 요란한 실패 연출이 아니라 정적인 화면이다. */
.verdict-mark.down { border-color: var(--color-border-hover); }

@keyframes markPop {
  from { transform: scale(0.82); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

/* ── 히어로 ────────────────────────────────────────────── */
.hero {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 4px;
  margin: 20px 0 24px;
  padding: 26px 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-tertiary);
  overflow: hidden;
}

.hero-label { color: var(--color-text-secondary); font-size: 0.8rem; }

.hero-rate {
  font-size: clamp(2.2rem, 8vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
}

.hero-amount {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  font-variant-numeric: tabular-nums;
}

/* 국내 증권 관례 — 상승 빨강, 하락 파랑 */
.hero.up .hero-rate, .dt-rate.up, .dt-profit.up { color: var(--color-up); }
.hero.down .hero-rate, .dt-rate.down, .dt-profit.down { color: var(--color-down); }
.hero.flat .hero-rate, .dt-rate.flat, .dt-profit.flat { color: var(--color-flat); }
.hero.up { background: var(--color-up-light); border-color: var(--color-up-light); }
.hero.down { background: var(--color-down-light); border-color: var(--color-down-light); }
/* flat 은 override 가 없어 기본 배경으로 남아 있었다. 중립 톤을 명시한다. */
.hero.flat { background: var(--color-bg-secondary); border-color: var(--color-border); }

/*
 * 수익 축하 — 진입 팝 + 방사 글로우 1회.
 * 손실 히어로는 이 블록이 붙지 않아 정적으로 남는다. 그게 '위로'의 형태다.
 */
.hero.celebrate { animation: heroRise 0.55s cubic-bezier(0.16, 1, 0.3, 1) both; }

.hero.celebrate::after {
  content: '';
  position: absolute;
  inset: -40%;
  border-radius: 50%;
  background: radial-gradient(circle, var(--color-up) 0%, transparent 62%);
  opacity: 0;
  pointer-events: none;
  animation: heroGlow 1.1s ease-out 0.15s both;
}

@keyframes heroRise {
  from { transform: scale(0.96); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

@keyframes heroGlow {
  0%   { opacity: 0; transform: scale(0.7); }
  45%  { opacity: 0.28; }
  100% { opacity: 0; transform: scale(1.1); }
}

/*
 * 손실 — 소리를 낮춘다. 숫자를 한 단계 줄이고 여백을 늘린다.
 * 같은 크기로 두면 손실이 수익만큼 크게 외쳐진다.
 */
.hero.down {
  padding: 30px 20px;
  margin-bottom: 16px;
}

.hero.down .hero-rate { font-size: clamp(2rem, 7vw, 2.6rem); }

/* ── 안심 배너 (손실·0%) ───────────────────────────────── */
.assure {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-tertiary);
}

/* 강조는 왼쪽 색 띠 대신 아이콘 배지로 준다 */
.assure > i {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 0.82rem;
}
.assure div { display: grid; gap: 3px; }
.assure strong { color: var(--color-text-primary); font-size: 0.86rem; line-height: 1.5; }
.assure span { color: var(--color-text-secondary); font-size: 0.78rem; line-height: 1.5; }

.sum-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 0 0 28px;
}

.sum-grid div {
  padding: 14px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
  text-align: center;
}

.sum-grid .final { background: var(--color-bg-secondary); }
.sum-grid dt { color: var(--color-text-secondary); font-size: 0.72rem; }
.sum-grid dd {
  margin: 6px 0 0;
  color: var(--color-text-primary);
  font-weight: 800;
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
}

.detail { margin-bottom: 24px; }

.dt-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.dt-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
}

.dt-row:last-child { border-bottom: none; }
.dt-main { display: grid; gap: 3px; min-width: 0; }
.dt-name { color: var(--color-text-primary); font-size: 0.9rem; }
.dt-qty { color: var(--color-text-muted); font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.dt-nums { display: grid; gap: 3px; text-align: right; flex: 0 0 auto; }
.dt-rate { font-weight: 800; font-size: 0.95rem; font-variant-numeric: tabular-nums; }
.dt-profit { font-size: 0.78rem; font-variant-numeric: tabular-nums; }

.detail-note {
  margin: 10px 2px 0;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  line-height: 1.5;
}

.reward-teaser {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
  padding: 20px;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-lg);
  background: var(--color-primary-light);
}

/*
 * 손실·0% 에서는 리워드 카드도 톤을 낮춘다.
 * 손실 직후 리워드를 화려하게 내밀면 "잃었지만 돈은 준다"로 읽혀
 * 손실 추종을 부추기는 인상이 된다.
 */
.reward-teaser.down,
.reward-teaser.flat {
  border-color: var(--color-border);
  background: var(--color-bg-tertiary);
}

.reward-teaser.down .rt-points,
.reward-teaser.flat .rt-points { color: var(--color-text-primary); }

.rt-label {
  margin: 0 0 4px;
  color: var(--color-text-secondary);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.rt-points {
  color: var(--color-primary);
  font-size: 1.6rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.rt-desc { margin: 6px 0 0; color: var(--color-text-secondary); font-size: 0.82rem; line-height: 1.5; }

.legal { margin-top: 12px; }

.home-link { margin: 14px 0 0; text-align: center; }
.home-link a { color: var(--color-text-secondary); font-size: 0.85rem; text-decoration: underline; }

.rc-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.rc-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.88rem;
}

.rc-row:last-child { border-bottom: none; }
.rc-name { font-weight: 600; color: var(--color-text-primary); }
.rc-qty { color: var(--color-text-secondary); font-variant-numeric: tabular-nums; }
.rc-amount { color: var(--color-text-primary); font-weight: 600; font-variant-numeric: tabular-nums; }

@media (max-width: 560px) {
  .sum-grid { grid-template-columns: repeat(2, 1fr); }
  .reward-teaser { flex-direction: column; align-items: stretch; }
  .reward-teaser .btn { justify-content: center; }
}
</style>
