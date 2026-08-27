<template>
  <div class="page">
    <div class="page-inner fade-in-up">
      <!-- 리워드는 결과가 공개된 뒤에만 확정된다. 지급액이 수익률로 갈리기 때문이다. -->
      <div v-if="!game.gameResult || game.gameResult.status !== 'CONFIRMED'" class="empty">
        <p>아직 결과가 공개되지 않아 리워드를 확인할 수 없습니다.</p>
        <router-link to="/game/result" class="btn btn-primary">결과 화면으로</router-link>
      </div>

      <div v-else-if="game.loadingReward && !w" class="state" aria-busy="true">
        리워드 정보를 불러오는 중...
      </div>

      <p v-else-if="game.rewardError && !w" class="error-msg" role="alert">
        {{ game.rewardError }}
        <button type="button" class="retry" @click="load">다시 시도</button>
      </p>

      <template v-else-if="w">
        <p class="reward-kicker">참여 리워드</p>
        <h1 class="page-title center">{{ format(w.rewardPoints) }}P 지급되었습니다</h1>
        <p class="page-sub center">
          <!-- 0% 는 손실이 아니다. 결과 화면의 rewardReason 과 같은 기준으로 가른다. -->
          {{ rewardReason }}
          {{ format(w.rewardPoints) }}원 상당의 포인트가 적립되었습니다.
        </p>

        <div class="points-hero" :class="{ celebrate: profitable }">
          <i class="fa-solid fa-coins" aria-hidden="true"></i>
          <strong>{{ format(displayPoints) }}<em>P</em></strong>
        </div>

        <!--
          손실·0% 에게는 이 문장이 유의사항 맨 아래가 아니라 본문에 있어야 한다.
          5,000P 를 '손실 보전'으로 오해하는 것을 막는 것이 준법상 핵심이다.
        -->
        <p v-if="!profitable" class="reward-nature">
          <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
          이 포인트는 <strong>참여에 대한 보상</strong>이며 투자 수익금이나 손실 보전이 아닙니다.
        </p>

        <!-- 재투자 진행 상태 — 이 화면의 핵심 정보다 -->
        <section class="stage" :class="w.withdrawable ? 'done' : 'running'">
          <div class="stage-head">
            <span class="stage-chip">
              <i :class="w.withdrawable ? 'fa-solid fa-circle-check' : 'fa-solid fa-rotate'" aria-hidden="true"></i>
              {{ w.withdrawable ? '출금 가능' : '재투자 중' }}
            </span>
            <span v-if="!w.withdrawable" class="stage-dday">D-{{ daysLeft }}</span>
          </div>

          <div class="track" role="img" :aria-label="`재투자 ${progress}% 진행`">
            <div class="track-fill" :style="{ transform: `scaleX(${progress / 100})` }"></div>
          </div>

          <dl class="stage-dates">
            <div>
              <dt>재투자 시작</dt>
              <dd>{{ formatDate(w.reinvestmentStartedAt) }}</dd>
            </div>
            <div>
              <dt>출금 가능일</dt>
              <dd>{{ formatDate(w.withdrawalAvailableAt) }}</dd>
            </div>
          </dl>

          <p class="stage-note">
            {{ w.withdrawable
              ? '재투자 기간이 끝나 출금할 수 있습니다.'
              : `지급된 포인트는 ${policy.reinvestmentDays}일 동안 재투자된 뒤 출금할 수 있습니다.` }}
          </p>
        </section>

        <!--
          출금은 이번 스프린트 범위 밖이다. 버튼을 만들어 두고 아무 일도 일어나지 않으면
          사용자가 실패로 읽는다. 비활성 + 사유를 함께 적는다.
        -->
        <div class="withdraw-box">
          <button type="button" class="btn btn-primary btn-wide" disabled>
            <i class="fa-solid fa-wallet" aria-hidden="true"></i>
            출금 신청
          </button>
          <p class="withdraw-note">
            출금 실행은 준비 중입니다.
            {{ w.withdrawable ? '' : `재투자가 끝나는 ${formatDate(w.withdrawalAvailableAt)} 이후 신청할 수 있습니다.` }}
          </p>
        </div>

        <section class="policy">
          <h2 class="sec-title">리워드 지급 기준</h2>
          <ul class="policy-list">
            <li :class="{ active: profitable }">
              <span class="pl-cond">수익률 0% 초과</span>
              <strong class="pl-points">{{ format(policy.profitRewardPoints) }}P</strong>
            </li>
            <li :class="{ active: !profitable }">
              <span class="pl-cond">수익률 0% 이하</span>
              <strong class="pl-points">{{ format(policy.baseRewardPoints) }}P</strong>
            </li>
          </ul>
          <p class="policy-note">
            내 수익률은 <strong :class="rateTone">{{ signedRate }}%</strong>였습니다.
            <!-- 0% 규칙은 해당 구간에 걸린 사람에게만 설명이 필요하다.
                 !profitable 로 두면 -20% 손실자에게도 "수익률 0%는..." 이 떠서 어긋난다. -->
            <template v-if="returnRate === 0">수익률 0%는 양의 수익이 아니므로 기본 구간으로 처리합니다.</template>
          </p>
        </section>

        <NoticeCard
          class="legal"
          tone="warn"
          icon="fa-solid fa-triangle-exclamation"
          title="유의사항"
          :items="[
            '모의 투자이며 실제 매매가 이루어지지 않았습니다.',
            '리워드는 참여 보상이며 투자 수익금이 아닙니다.',
            '등장하는 종목은 모두 가상이며 실존 기업과 무관합니다.'
          ]"
        />

        <!-- 재도전은 손익과 무관하게 같은 비중. 손실 쪽에서 강조하면 손실 추종을 부추긴다. -->
        <div class="actions">
          <router-link to="/game/result" class="btn btn-outline">결과 다시 보기</router-link>
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

const game = useGameStore()
const w = computed(() => game.reward)
const policy = REWARD_POLICY

function format(n) {
  return Number(n ?? 0).toLocaleString('ko-KR')
}

function formatDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const returnRate = computed(() => Number(game.gameResult?.returnRate ?? 0))
const profitable = computed(() => returnRate.value > 0)

/** 수익 / 손실 / 0% 를 각각 다르게 말한다 */
const rewardReason = computed(() => {
  if (returnRate.value > 0) return '수익을 냈으므로'
  if (returnRate.value < 0) return '이번에는 수익이 나지 않아'
  return '수익률이 0% 이므로'
})

const signedRate = computed(() => {
  const v = returnRate.value
  const body = Math.abs(v).toFixed(2)
  if (v > 0) return `+${body}`
  if (v < 0) return `-${body}`
  return body
})

/** 국내 증권 관례 — 상승 빨강, 하락 파랑 */
const rateTone = computed(() => {
  if (returnRate.value > 0) return 'up'
  if (returnRate.value < 0) return 'down'
  return 'flat'
})

/** 재투자 경과 비율(%) — 시작~출금 가능일 사이에서 지금 위치 */
const progress = computed(() => {
  const start = Date.parse(w.value?.reinvestmentStartedAt ?? '')
  const end = Date.parse(w.value?.withdrawalAvailableAt ?? '')
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 100
  const ratio = (Date.now() - start) / (end - start)
  return Math.min(100, Math.max(0, Math.round(ratio * 100)))
})

const daysLeft = computed(() => {
  const end = Date.parse(w.value?.withdrawalAvailableAt ?? '')
  if (!Number.isFinite(end)) return policy.reinvestmentDays
  return Math.max(0, Math.ceil((end - Date.now()) / 86400000))
})

/*
 * 수익일 때만 포인트를 롤업한다.
 * 손실 쪽 5,000P 가 차오르는 연출은 위로가 아니라 보상 강조가 되어
 * 다음 판을 부추기는 인상이 된다.
 */
const pointsUp = useCountUp()
const displayPoints = computed(() =>
  profitable.value ? Math.round(pointsUp.value.value) : Number(w.value?.rewardPoints ?? 0)
)

watch(
  () => [w.value?.rewardPoints, profitable.value],
  () => {
    if (!profitable.value) return
    pointsUp.start(Number(w.value?.rewardPoints ?? 0))
  },
  { immediate: true }
)

function load() {
  game.loadReward().catch(() => {
    // game.rewardError 로 화면에 표시된다
  })
}

onMounted(() => {
  if (!game.reward) load()
})
</script>

<style scoped>
@import './game-page.css';

.page-title.center { text-align: center; }
.page-sub.center { text-align: center; }

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

.reward-kicker {
  margin: 0 0 6px;
  color: var(--color-text-muted);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.11em;
  text-align: center;
}

.points-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 4px 0 28px;
  padding: 26px 20px;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-lg);
  background: var(--color-primary-light);
  overflow: hidden;
}

.points-hero i { color: var(--color-primary); font-size: 1.5rem; }

/*
 * 수익 축하 — 진입 팝 + 글로우 1회, 코인 아이콘 팝.
 * 손실 쪽에는 붙이지 않는다. 정적인 화면이 위로의 형태다.
 */
.points-hero.celebrate { animation: pointsRise 0.55s cubic-bezier(0.16, 1, 0.3, 1) both; }
.points-hero.celebrate i { animation: coinPop 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both; }

.points-hero.celebrate::after {
  content: '';
  position: absolute;
  inset: -40%;
  border-radius: 50%;
  background: radial-gradient(circle, var(--color-primary) 0%, transparent 62%);
  opacity: 0;
  pointer-events: none;
  animation: pointsGlow 1.1s ease-out 0.15s both;
}

@keyframes pointsRise {
  from { transform: scale(0.96); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

@keyframes coinPop {
  from { transform: scale(0.72) rotate(-14deg); }
  to   { transform: scale(1) rotate(0); }
}

@keyframes pointsGlow {
  0%   { opacity: 0; transform: scale(0.7); }
  45%  { opacity: 0.22; }
  100% { opacity: 0; transform: scale(1.1); }
}

/* 손실·0% — 리워드 성격을 본문에서 못 박는다 */
.reward-nature {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin: -14px 0 26px;
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  font-size: 0.79rem;
  line-height: 1.55;
}

.reward-nature i { margin-top: 3px; color: var(--color-text-muted); }
.reward-nature strong { color: var(--color-text-primary); }

.points-hero strong {
  color: var(--color-primary);
  font-size: clamp(2rem, 7vw, 2.6rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.points-hero em { font-style: normal; font-size: 0.55em; margin-left: 2px; }

/* ── 재투자 상태 ───────────────────────────────────────── */
.stage {
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-tertiary);
}

.stage.done { border-color: var(--color-success-border); background: var(--color-success-light); }

.stage-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.stage-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border-radius: 999px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  font-size: 0.78rem;
  font-weight: 700;
}

.stage.done .stage-chip { color: var(--color-success); border-color: var(--color-success-border); }
.stage.running .stage-chip i { color: var(--color-primary); }

.stage-dday {
  color: var(--color-primary);
  font-size: 1.05rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.track {
  height: 8px;
  border-radius: 999px;
  /* 바탕이 --color-bg-tertiary 라 같은 계열로 두면 빈 트랙이 보이지 않는다 */
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.track-fill {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  background: var(--color-primary);
  /* width 대신 scaleX — 폭을 애니메이션하면 매 프레임 레이아웃이 다시 계산된다 */
  transform-origin: left center;
  transition: transform 0.4s ease;
}

.stage.done .track-fill { background: var(--color-success); }

.stage-dates {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin: 16px 0 0;
}

.stage-dates div {
  padding: 12px;
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
}

.stage-dates dt { color: var(--color-text-secondary); font-size: 0.72rem; }
.stage-dates dd {
  margin: 5px 0 0;
  color: var(--color-text-primary);
  font-weight: 700;
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
}

.stage-note { margin: 14px 0 0; color: var(--color-text-secondary); font-size: 0.82rem; line-height: 1.55; }

/* ── 출금 ─────────────────────────────────────────────── */
.withdraw-box { margin-bottom: 28px; }
.btn-wide { width: 100%; justify-content: center; min-height: 48px; }

/*
 * global.css 에 .btn:disabled 규칙이 없어 비활성 버튼이 활성처럼 보인다.
 * 누를 수 없는 버튼이 파랗게 칠해져 있으면 눌러 보고 고장으로 읽는다.
 * 전역 스타일은 다른 화면에도 영향을 주므로 여기서만 막아 둔다.
 */
.btn-wide:disabled,
.btn-wide:disabled:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-muted);
  border-color: var(--color-border);
  cursor: not-allowed;
  /* .btn-primary:hover 가 비활성 버튼도 들어 올린다 */
  transform: none;
}
.withdraw-note {
  margin: 10px 2px 0;
  color: var(--color-text-muted);
  font-size: 0.76rem;
  line-height: 1.5;
  text-align: center;
}

/* ── 지급 기준 ─────────────────────────────────────────── */
.policy { margin-bottom: 12px; }

.policy-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.policy-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
}

/* 내 구간을 강조해 "왜 이 금액인지"가 한눈에 보이게 한다 */
.policy-list li.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.pl-cond { color: var(--color-text-secondary); font-size: 0.85rem; }
.policy-list li.active .pl-cond { color: var(--color-text-primary); font-weight: 700; }
.pl-points { color: var(--color-text-primary); font-weight: 800; font-variant-numeric: tabular-nums; }
.policy-list li.active .pl-points { color: var(--color-primary); }

.policy-note { margin: 12px 2px 0; color: var(--color-text-secondary); font-size: 0.8rem; line-height: 1.55; }
.policy-note .up { color: var(--color-up); font-variant-numeric: tabular-nums; }
.policy-note .down { color: var(--color-down); font-variant-numeric: tabular-nums; }
.policy-note .flat { color: var(--color-flat); font-variant-numeric: tabular-nums; }

.legal { margin-top: 12px; }

.home-link { margin: 14px 0 0; text-align: center; }
.home-link a { color: var(--color-text-secondary); font-size: 0.85rem; text-decoration: underline; }

@media (max-width: 560px) {
  .stage-dates { grid-template-columns: 1fr; }
}
</style>
