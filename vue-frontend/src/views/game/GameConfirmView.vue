<template>
  <div class="page">
    <div class="page-inner fade-in-up">
      <GameProgress :current="3" />

      <div v-if="!r" class="empty">
        <p>확정된 투자 내역이 없습니다.</p>
        <router-link to="/game/guide" class="btn btn-primary">게임 시작하기</router-link>
      </div>

      <template v-else>
        <div class="done-mark" aria-hidden="true">✓</div>
        <h1 class="page-title center">투자를 확정했습니다</h1>
        <p class="page-sub center">
          최종 수익률과 투자 성향 분석은 <strong>{{ resultDate }}</strong>에 확인할 수 있습니다.
        </p>

        <section class="receipt">
          <h2 class="sec-title">내 포트폴리오</h2>
          <ul class="rc-list">
            <li v-for="row in rows" :key="row.key" class="rc-row">
              <span class="rc-name">
                {{ row.name }}
              </span>
              <span class="rc-qty">{{ row.qty }}</span>
              <span class="rc-amount">{{ format(row.amount) }}원</span>
              <span class="rc-weight">{{ row.weight.toFixed(0) }}%</span>
            </li>
          </ul>
          <div class="rc-total">
            <span>합계</span>
            <strong>{{ format(game.initialCash) }}원</strong>
          </div>
        </section>

        <section class="profile-card" aria-live="polite">
          <div class="profile-head">
            <div>
              <span class="profile-kicker">행동 기반 AI 분석</span>
              <h2 class="sec-title">나의 투자 성향 미리보기</h2>
            </div>
            <span v-if="game.profile" class="score">{{ game.profile.riskScore }}점</span>
          </div>

          <div v-if="game.analyzing" class="profile-state">투자 행동을 분석하고 있습니다...</div>
          <div v-else-if="game.analysisError" class="profile-state error-msg">
            {{ game.analysisError }}
            <button type="button" class="retry" @click="game.analyzeProfile()">다시 분석</button>
          </div>
          <template v-else-if="game.profile">
            <strong class="profile-name">{{ game.profile.profileName }}</strong>
            <p class="profile-summary">{{ game.profile.summary }}</p>

            <dl class="metric-grid">
              <div><dt>투자 비율</dt><dd>{{ game.profile.metrics.investmentRatio }}%</dd></div>
              <div><dt>포트폴리오 변동성</dt><dd>{{ game.profile.metrics.weightedRiskRatio }}점</dd></div>
              <div><dt>최대 종목 비중</dt><dd>{{ game.profile.metrics.concentrationRatio }}%</dd></div>
              <div><dt>분산 점수</dt><dd>{{ game.profile.metrics.diversificationScore }}점</dd></div>
            </dl>

            <h3 class="profile-subtitle">이렇게 분석했어요</h3>
            <ul class="reason-list">
              <li v-for="reason in game.profile.reasons" :key="reason">{{ reason }}</li>
            </ul>

            <div class="decision-box">
              <strong>{{ game.profile.decisionStyle.label }}</strong>
              <span>{{ game.profile.decisionStyle.description }}</span>
            </div>

            <section v-if="game.profile.recommendedProducts?.length" class="product-section">
              <div class="product-section-head">
                <div>
                  <p>PERSONALIZED PRODUCT DISCOVERY</p>
                  <h3 class="profile-subtitle">성향 기반 상품 탐색</h3>
                </div>
                <i class="fa-solid fa-compass" aria-hidden="true"></i>
              </div>
              <p class="product-intro">분석된 투자 성향을 바탕으로 탐색해 볼 수 있는 증권사 상품·서비스입니다.</p>
              <ul class="product-list">
                <li v-for="product in game.profile.recommendedProducts" :key="product.id" class="product-card">
                  <div class="product-top">
                    <span>{{ product.category }}</span>
                    <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
                  </div>
                  <strong>{{ product.name }}</strong>
                  <p>{{ product.description }}</p>
                  <div class="product-reason"><i class="fa-solid fa-sparkles" aria-hidden="true"></i>{{ product.reason }}</div>
                  <div class="product-tags"><span v-for="tag in product.tags" :key="tag">{{ tag }}</span></div>
                </li>
              </ul>
              <p class="product-disclaimer">상품 탐색을 돕기 위한 예시이며, 실제 가입 또는 매수 전에는 적합성 확인이 필요합니다.</p>
            </section>

            <section v-if="game.profile.personalizedCoaching" class="coach-card">
              <div class="coach-head">
                <span><i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i> AI 코칭 추천</span>
                <strong>{{ game.profile.personalizedCoaching.focusMetric }}</strong>
              </div>
              <h3>{{ game.profile.personalizedCoaching.headline }}</h3>
              <p>{{ game.profile.personalizedCoaching.feedback }}</p>
              <div class="next-mission">
                <i class="fa-solid fa-bullseye" aria-hidden="true"></i>
                <div>
                  <strong>{{ game.profile.personalizedCoaching.nextMissionTitle }}</strong>
                  <span>{{ game.profile.personalizedCoaching.nextMissionDescription }}</span>
                  <em>목표: {{ game.profile.personalizedCoaching.target }}</em>
                </div>
              </div>
            </section>
          </template>
        </section>

        <NoticeCard
          icon="fa-solid fa-arrow-right"
          title="다음 단계"
          :items="nextSteps"
        />

        <NoticeCard
          class="legal"
          tone="warn"
          icon="fa-solid fa-triangle-exclamation"
          title="유의사항"
          :items="[
            '모의 투자이며 실제 매매가 이루어지지 않았습니다.',
            '이 결과는 참고용 보조 정보이며 공식 투자자 성향 진단을 대체하지 않습니다.'
          ]"
        />

        <div class="actions">
          <router-link to="/" class="btn btn-outline">홈으로</router-link>
          <router-link to="/game/result" class="btn btn-primary">
            결과 확인하러 가기
            <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </router-link>
        </div>
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

const game = useGameStore()
const r = computed(() => game.result)

function format(n) {
  return Number(n).toLocaleString('ko-KR')
}

const rewardPolicy = computed(() => r.value?.rewardPolicy || REWARD_POLICY)
const nextSteps = computed(() => [
  '투자 확정 후 3일 동안에는 투자 내역을 변경할 수 없습니다.',
  `결과에 따라 최대 ${format(rewardPolicy.value.profitRewardPoints)}원의 참여 리워드가 지급됩니다.(손해 발생 시 5천원 지급)`,
  `지급된 포인트는 ${rewardPolicy.value.reinvestmentDays}일 동안 재투자한 후 출금할 수 있습니다.`,
  '최종 수익률 결과와 함께 행동 기반 투자 성향 분석을 제공합니다.'
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

.done-mark {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin: 8px auto 20px;
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 1.7rem;
  font-weight: 800;
  border: 1px solid var(--color-primary);
  box-shadow: none;
}

.page-title.center,
.page-sub.center { text-align: center; }
.page-sub.center strong { color: var(--color-primary); }

.receipt { margin-bottom: 24px; }

.profile-card {
  margin-bottom: 24px;
  padding: 22px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-tertiary);
  box-shadow: none;
}

.profile-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.profile-kicker {
  display: block;
  margin-bottom: 5px;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 800;
}

.profile-head .sec-title { margin: 0; }

.score {
  flex: 0 0 auto;
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.profile-state { padding: 28px 0 8px; text-align: center; }
.profile-name { display: block; margin-top: 20px; font-size: 1.35rem; color: var(--color-text-primary); }
.profile-summary { margin: 8px 0 18px; line-height: 1.6; color: var(--color-text-secondary); }

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 0;
}

.metric-grid div {
  padding: 12px;
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  text-align: center;
}

.metric-grid dt { font-size: 0.72rem; color: var(--color-text-secondary); }
.metric-grid dd { margin: 5px 0 0; font-weight: 800; color: var(--color-text-primary); }
.profile-subtitle { margin: 20px 0 8px; font-size: 0.9rem; color: var(--color-text-primary); }
.reason-list { margin: 0; padding-left: 20px; color: var(--color-text-secondary); line-height: 1.7; font-size: 0.85rem; }

.decision-box {
  display: grid;
  gap: 4px;
  margin-top: 16px;
  padding: 14px;
  border-left: 3px solid var(--color-primary);
  background: var(--color-bg-primary);
}

.decision-box span { color: var(--color-text-secondary); font-size: 0.82rem; line-height: 1.5; }

.product-section { margin-top: 22px; padding-top: 20px; border-top: 1px solid var(--color-border); }
.product-section-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
.product-section-head p { margin: 0 0 5px; color: var(--color-text-muted); font-size: .65rem; font-weight: 800; letter-spacing: .08em; }
.product-section-head .profile-subtitle { margin: 0; }
.product-section-head > .fa-solid { color: var(--color-text-secondary); font-size: 1.1rem; }
.product-intro, .product-disclaimer { margin: 8px 0 0; color: var(--color-text-secondary); font-size: .8rem; line-height: 1.55; }
.product-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 14px 0 0; padding: 0; list-style: none; }
.product-card { display: grid; align-content: start; gap: 8px; padding: 14px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg-primary); }
.product-top { display: flex; justify-content: space-between; align-items: center; color: var(--color-text-muted); font-size: .7rem; font-weight: 700; }
.product-top span { padding: 4px 6px; border: 1px solid var(--color-border); border-radius: 999px; }
.product-top .fa-solid { font-size: .72rem; }
.product-card > strong { color: var(--color-text-primary); font-size: .9rem; }
.product-card > p { margin: 0; color: var(--color-text-secondary); font-size: .78rem; line-height: 1.55; }
.product-reason { padding: 9px; border-left: 2px solid var(--color-border-hover); background: var(--color-bg-tertiary); color: var(--color-text-secondary); font-size: .74rem; line-height: 1.5; }
.product-reason .fa-solid { margin-right: 5px; color: var(--color-text-primary); }
.product-tags { display: flex; flex-wrap: wrap; gap: 5px; }
.product-tags span { padding: 4px 6px; border-radius: 999px; background: var(--color-bg-tertiary); color: var(--color-text-secondary); font-size: .68rem; }
.product-disclaimer { color: var(--color-text-muted); font-size: .72rem; }

.coach-card { margin-top: 20px; padding: 16px; border: 1px solid var(--color-border-hover); border-radius: var(--radius-md); background: var(--color-bg-primary); }
.coach-head { display: flex; justify-content: space-between; gap: 12px; color: var(--color-text-secondary); font-size: .75rem; font-weight: 800; }
.coach-head span .fa-solid { margin-right: 5px; color: var(--color-text-primary); }
.coach-head strong { color: var(--color-text-primary); font-variant-numeric: tabular-nums; }
.coach-card h3 { margin: 14px 0 6px; color: var(--color-text-primary); font-size: 1rem; }
.coach-card > p { margin: 0; color: var(--color-text-secondary); font-size: .84rem; line-height: 1.65; }
.next-mission { display: flex; gap: 10px; margin-top: 14px; padding: 13px; border-radius: var(--radius-sm); background: var(--color-bg-tertiary); }
.next-mission > .fa-solid { margin-top: 2px; color: var(--color-text-primary); }
.next-mission div { display: grid; gap: 4px; }
.next-mission strong { color: var(--color-text-primary); font-size: .84rem; }
.next-mission span, .next-mission em { color: var(--color-text-secondary); font-size: .78rem; line-height: 1.5; }
.next-mission em { color: var(--color-text-primary); font-style: normal; font-weight: 700; }

.retry {
  margin-left: 8px;
  border: 0;
  background: transparent;
  color: var(--color-primary);
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}

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
  grid-template-columns: 1fr auto auto 44px;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.88rem;
}

.rc-row:last-child { border-bottom: none; }

.rc-name { font-weight: 600; color: var(--color-text-primary); }

.rc-qty,
.rc-amount,
.rc-weight {
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  text-align: right;
}

.rc-amount { color: var(--color-text-primary); font-weight: 600; }
.rc-weight { font-weight: 700; color: var(--color-primary); }

.rc-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  margin-top: 8px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  font-size: 0.92rem;
  color: var(--color-text-secondary);
}

.rc-total strong {
  font-size: 1.05rem;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

.legal { margin-top: 12px; }


.empty {
  padding: 60px 0;
  text-align: center;
  display: grid;
  gap: 20px;
  justify-items: center;
  color: var(--color-text-secondary);
}

@media (max-width: 560px) {
  .metric-grid { grid-template-columns: repeat(2, 1fr); }
  .rc-row {
    grid-template-columns: 1fr auto;
    row-gap: 4px;
  }
  .rc-qty { grid-column: 1; font-size: 0.8rem; }
  .rc-weight { grid-column: 2; }
  .product-list { grid-template-columns: 1fr; }
}
</style>
