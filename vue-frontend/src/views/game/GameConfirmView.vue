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
          결과는 <strong>{{ resultDate }}</strong>에 확인할 수 있습니다.
        </p>

        <section class="receipt">
          <h2 class="sec-title">내 포트폴리오</h2>
          <ul class="rc-list">
            <li v-for="row in rows" :key="row.key" class="rc-row">
              <span class="rc-name">
                {{ row.name }}
                <span v-if="row.symbol" class="rc-symbol">{{ row.symbol }}</span>
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
              <div><dt>고위험 비중</dt><dd>{{ game.profile.metrics.highRiskRatio }}%</dd></div>
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
          :items="[
            '결과 산정 기간 동안에는 투자 내역을 변경할 수 없습니다.',
            '결과 확인 시 참여 리워드가 지급됩니다.',
            '결과와 함께 행동 기반 투자 성향 분석을 제공합니다.'
          ]"
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

        <div class="actions center-actions">
          <router-link to="/" class="btn btn-primary">홈으로</router-link>
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

const game = useGameStore()
const r = computed(() => game.result)

function format(n) {
  return Number(n).toLocaleString('ko-KR')
}

const resultDate = computed(() => {
  if (!r.value?.resultAvailableAt) return '약 일주일 뒤'
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
      symbol: s.symbol || '',
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
      symbol: '',
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
  background: var(--color-success-light);
  color: var(--color-success);
  font-size: 1.7rem;
  font-weight: 800;
}

.page-title.center,
.page-sub.center { text-align: center; }
.page-sub.center strong { color: var(--color-primary); }

.receipt { margin-bottom: 24px; }

.profile-card {
  margin-bottom: 24px;
  padding: 22px;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  background: var(--color-primary-light);
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
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 800;
}

.profile-head .sec-title { margin: 0; }

.score {
  flex: 0 0 auto;
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--color-primary);
  color: white;
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

.decision-box span,
.content-list span { color: var(--color-text-secondary); font-size: 0.82rem; line-height: 1.5; }
.content-list { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
.content-list li { display: grid; gap: 4px; padding: 12px; border-radius: var(--radius-sm); background: var(--color-bg-primary); }

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

.rc-symbol {
  margin-left: 6px;
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--color-text-muted);
}

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

.center-actions { justify-content: center; }

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
}
</style>
