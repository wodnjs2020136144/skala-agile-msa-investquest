<template>
  <div class="page">
    <div class="page-inner fade-in-up">
      <GameProgress :current="3" />

      <div v-if="!r" class="empty">
        <p>확정된 투자 내역이 없습니다.</p>
        <router-link to="/game/guide" class="btn btn-primary">게임 시작하기</router-link>
      </div>

      <template v-else>
        <div class="done-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </div>
        <h1 class="page-title center">투자를 확정했습니다</h1>
        <p class="page-sub center">
          결과는 <strong>{{ resultDate }}</strong>에 확인할 수 있습니다.
        </p>

        <section class="receipt">
          <h2 class="sec-title">내 포트폴리오</h2>
          <div class="card">
            <ul class="rc-list">
              <li v-for="row in rows" :key="row.key" class="rc-row">
                <span class="rc-name">{{ row.name }}</span>
                <span class="rc-amount num">{{ format(row.amount) }}원</span>
                <span class="rc-qty">{{ row.qty }}</span>
                <span class="rc-weight num">{{ row.weight.toFixed(0) }}%</span>
              </li>
            </ul>
            <div class="rc-total">
              <span>합계</span>
              <strong class="num num-md">{{ format(game.initialCash) }}원</strong>
            </div>
          </div>
        </section>

        <section class="profile-card card" aria-live="polite">
          <div class="profile-head">
            <div class="profile-title">
              <h2 class="sec-title">나의 투자 성향 미리보기</h2>
              <span class="profile-kicker">행동 기반 AI 분석</span>
            </div>
            <span v-if="game.profile" class="score"><span class="num num-xl">{{ game.profile.riskScore }}</span><span class="score-unit">점</span></span>
          </div>

          <div v-if="game.analyzing" class="profile-state">
            <div class="iq-skeleton" style="width: 40%"></div>
            <div class="iq-skeleton"></div>
            <div class="iq-skeleton" style="width: 80%"></div>
            <span class="sr-only">투자 행동을 분석하고 있습니다...</span>
          </div>
          <div v-else-if="game.analysisError" class="profile-state error-msg">
            {{ game.analysisError }}
            <button type="button" class="text-btn retry" @click="game.analyzeProfile()">다시 분석</button>
          </div>
          <template v-else-if="game.profile">
            <strong class="profile-name">{{ game.profile.profileName }}</strong>
            <p class="profile-summary">{{ game.profile.summary }}</p>

            <dl class="metric-grid">
              <div><dt>투자 비율</dt><dd class="num">{{ game.profile.metrics.investmentRatio }}%</dd></div>
              <div><dt>포트폴리오 변동성</dt><dd class="num">{{ game.profile.metrics.weightedRiskRatio }}점</dd></div>
              <div><dt>최대 종목 비중</dt><dd class="num">{{ game.profile.metrics.concentrationRatio }}%</dd></div>
              <div><dt>분산 점수</dt><dd class="num">{{ game.profile.metrics.diversificationScore }}점</dd></div>
            </dl>

            <h3 class="profile-subtitle">이렇게 분석했어요</h3>
            <ul class="reason-list">
              <li v-for="reason in game.profile.reasons" :key="reason">{{ reason }}</li>
            </ul>

            <div class="decision-box">
              <strong>{{ game.profile.decisionStyle.label }}</strong>
              <span>{{ game.profile.decisionStyle.description }}</span>
            </div>

            <h3 class="profile-subtitle">추천 학습 콘텐츠</h3>
            <ul class="content-list">
              <li v-for="content in game.profile.recommendedContents" :key="content.title">
                <strong>{{ content.title }}</strong>
                <span>{{ content.reason }}</span>
              </li>
            </ul>
          </template>
        </section>

        <NoticeCard
          title="다음 단계"
          :items="nextSteps"
        />

        <NoticeCard
          class="legal"
          tone="warn"
          icon="⚠️"
          :items="[
            '모의 투자이며 실제 매매가 이루어지지 않았습니다.',
            '이 결과는 참고용 보조 정보이며 공식 투자자 성향 진단을 대체하지 않습니다.'
          ]"
        />

        <BottomCta>
          <router-link to="/" class="btn btn-primary">홈으로</router-link>
        </BottomCta>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '@/store/game.js'
import GameProgress from '@/components/game/GameProgress.vue'
import NoticeCard from '@/components/game/NoticeCard.vue'
import { REWARD_POLICY } from '@/mock/scenario.js'
import BottomCta from '@/components/ui/BottomCta.vue'

const game = useGameStore()
const r = computed(() => game.result)

function format(n) {
  return Number(n).toLocaleString('ko-KR')
}

const rewardPolicy = computed(() => r.value?.rewardPolicy || REWARD_POLICY)
const nextSteps = computed(() => [
  '투자 확정 후 3일 동안에는 투자 내역을 변경할 수 없습니다.',
  `결과에 따라 최대 ${format(rewardPolicy.value.profitRewardPoints)}원의 참여 리워드가 지급됩니다.`,
  `지급된 포인트는 ${rewardPolicy.value.reinvestmentDays}일 동안 재투자한 후 출금할 수 있습니다.`,
  '결과와 함께 행동 기반 투자 성향 분석을 제공합니다.'
])

const resultDate = computed(() => {
  if (!r.value?.resultAvailableAt) return '3일 뒤'
  return new Date(r.value.resultAvailableAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

/** 확정 응답 + 종목 정보를 합쳐 영수증 행을 만든다 */
const rows = computed(() => {
  if (!r.value) return []
  const byId = Object.fromEntries(game.stocks.map((s) => [s.id, s]))
  const total = game.initialCash || 1

  const stockRows = (r.value.orders || []).map((o) => {
    const s = byId[o.courseId] || {}
    return {
      key: `s-${o.courseId}`,
      name: s.name || `종목 ${o.courseId}`,
      qty: `${o.quantity}주`,
      amount: o.investmentAmount,
      weight: (o.investmentAmount / total) * 100
    }
  })

  const cash = r.value.cashBalance ?? 0
  if (cash > 0) {
    stockRows.push({
      key: 'cash',
      name: '현금 보유',
      qty: '-',
      amount: cash,
      weight: (cash / total) * 100
    })
  }

  return stockRows
})
</script>

<style scoped>
@import './game-page.css';

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-10) 0;
  font-size: var(--fs-15);
  color: var(--text);
}

@keyframes pop {
  from { transform: scale(.8); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
.done-mark {
  width: 64px;
  height: 64px;
  margin: var(--space-2) auto var(--space-5);
  border-radius: 50%;
  background: var(--brand);
  color: var(--text-on-brand);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pop .3s var(--ease) both;
}
.center { text-align: center; }
.page-sub strong { color: var(--brand); font-weight: var(--fw-bold); }

/* 영수증 — 행마다 2×2 */
.receipt { margin: var(--space-2) 0 var(--space-4); }
.rc-list {
  list-style: none;
  margin: 0;
  padding: 0 var(--space-5);
}
.rc-row {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    'name amount'
    'qty weight';
  row-gap: 2px;
  column-gap: var(--space-4);
  padding: var(--space-4) 0;
}
.rc-row + .rc-row { border-top: 1px solid var(--line); }
.rc-name { grid-area: name; font-size: var(--fs-15); font-weight: var(--fw-semibold); color: var(--text-strong); }
.rc-amount { grid-area: amount; font-size: var(--fs-15); font-weight: var(--fw-semibold); text-align: right; }
.rc-qty { grid-area: qty; font-size: var(--fs-13); color: var(--text-weak); }
.rc-weight { grid-area: weight; font-size: var(--fs-13); font-weight: var(--fw-medium); color: var(--text-weak); text-align: right; }
/* 합계 — 상자가 아니라 굵은 선 위의 행 */
.rc-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 var(--space-5);
  padding: var(--space-4) 0;
  border-top: 1.5px solid var(--line-strong);
  font-size: var(--fs-15);
  color: var(--text);
}

/* 성향 분석 카드 — 흰 카드, 점수가 큰 숫자 */
.profile-card {
  padding: var(--space-5);
  margin-bottom: var(--space-4);
}
.profile-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}
.profile-head .sec-title { margin-bottom: 0; }
.profile-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}
.profile-kicker {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 var(--space-2);
  border-radius: var(--r-8);
  background: var(--brand-weak);
  color: var(--brand);
  font-size: var(--fs-12);
  font-weight: var(--fw-bold);
}
.score {
  display: flex;
  align-items: baseline;
  gap: 2px;
  color: var(--brand);
  flex-shrink: 0;
}
.score .num { color: var(--brand); }
.score-unit { font-size: var(--fs-15); font-weight: var(--fw-bold); }

.profile-state {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-2) 0;
}
.profile-state.error-msg { margin: 0; }
.retry { margin-left: var(--space-2); }

.profile-name {
  display: block;
  font-size: var(--fs-24);
  font-weight: var(--fw-bold);
  letter-spacing: var(--tracking-title);
  color: var(--text-strong);
  margin-bottom: var(--space-2);
}
.profile-summary {
  font-size: var(--fs-15);
  line-height: var(--lh-loose);
  color: var(--text);
  margin: 0 0 var(--space-5);
}

/* 지표 — 타일이 아니라 라벨·값 행 */
.metric-grid {
  display: flex;
  flex-direction: column;
  margin: 0 0 var(--space-6);
  border-top: 1px solid var(--line);
}
.metric-grid > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--line);
}
.metric-grid dt { font-size: var(--fs-14); color: var(--text); }
.metric-grid dd { margin: 0; font-size: var(--fs-17); }

.profile-subtitle {
  font-size: var(--fs-15);
  font-weight: var(--fw-bold);
  color: var(--text-strong);
  margin: 0 0 var(--space-3);
}
.reason-list {
  list-style: none;
  margin: 0 0 var(--space-5);
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.reason-list li {
  position: relative;
  padding-left: 14px;
  font-size: var(--fs-14);
  line-height: var(--lh-loose);
  color: var(--text);
}
.reason-list li::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 10px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--brand);
}
.decision-box {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-4) 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  margin-bottom: var(--space-6);
}
.decision-box strong { font-size: var(--fs-15); color: var(--text-strong); }
.decision-box span { font-size: var(--fs-13); line-height: var(--lh); color: var(--text); }
.content-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}
.content-list li {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-3) 0;
}
.content-list li + li { border-top: 1px solid var(--line); }
.content-list strong { font-size: var(--fs-15); font-weight: var(--fw-semibold); color: var(--text-strong); }
.content-list span { font-size: var(--fs-13); line-height: var(--lh); color: var(--text); }

.legal { margin-top: var(--space-3); }


@media (prefers-reduced-motion: reduce) {
  .done-mark { animation: none; }
}
</style>
