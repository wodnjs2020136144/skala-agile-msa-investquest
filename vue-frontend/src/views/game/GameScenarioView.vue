<template>
  <div class="page">
    <div class="page-inner fade-in-up">
      <GameProgress :current="1" />

      <div v-if="game.loading && !s" class="skeleton-box" aria-busy="true">
        불러오는 중...
      </div>

      <p v-else-if="game.error" class="error-msg" role="alert">
        {{ game.error }}
        <button type="button" class="retry" @click="load">다시 시도</button>
      </p>

      <template v-else-if="s">
        <span class="scenario-tag">가상 시나리오 {{ String(s.id).padStart(2, '0') }}</span>
        <h1 class="page-title">{{ s.title }}</h1>

        <p class="situation">{{ s.description }}</p>
        <p class="guide-text">{{ s.guide }}</p>

        <dl class="terms">
          <div class="term">
            <dt>보유 투자금</dt>
            <dd class="amount">{{ format(s.initialCash) }}원</dd>
          </div>
          <div class="term">
            <dt>게임 기간</dt>
            <dd>{{ s.durationDays }}일</dd>
          </div>
          <div class="term">
            <dt>목표</dt>
            <dd>제한된 기간 안에 최고의 수익률 달성</dd>
          </div>
        </dl>

        <NoticeCard
          icon="fa-solid fa-lightbulb"
          title="참고"
          :items="[
            '수익률이 순위를 결정하지만, 모든 선택 과정은 투자 성향 분석에 활용됩니다.',
            '공격적으로 기회를 잡거나 현금을 남겨 변동성에 대비할 수 있습니다.',
            '모의 투자이며 실제 투자 수익을 보장하지 않습니다.'
          ]"
        />
      </template>

      <div class="actions">
        <router-link to="/" class="btn btn-outline">홈으로</router-link>
        <router-link
          to="/game/invest"
          class="btn btn-primary"
          :class="{ disabled: !s }"
        >
          종목 선택하기
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useGameStore } from '@/store/game.js'
import GameProgress from '@/components/game/GameProgress.vue'
import NoticeCard from '@/components/game/NoticeCard.vue'

const game = useGameStore()
const s = computed(() => game.scenario)

function format(n) {
  return Number(n).toLocaleString('ko-KR')
}

async function load() {
  try {
    await game.loadScenario(game.participation?.scenarioId ?? 1)
  } catch {
    // game.error 로 화면에 표시된다
  }
}

onMounted(() => {
  if (!game.scenario) load()
})
</script>

<style scoped>
@import './game-page.css';

.scenario-tag {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 999px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 0.76rem;
  font-weight: 700;
  margin-bottom: 14px;
  border: 1px solid var(--color-border);
  letter-spacing: 0.08em;
}

.situation {
  font-size: 1.02rem;
  line-height: 1.8;
  color: var(--color-text-primary);
  margin: 0 0 14px;
}

.guide-text {
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin: 0 0 28px;
}

.terms {
  margin: 0 0 28px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-bg-tertiary);
}

.term {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border);
}

.term:last-child { border-bottom: none; }

.term dt {
  font-size: 0.88rem;
  color: var(--color-text-secondary);
}

.term dd {
  margin: 0;
  font-weight: 700;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.term dd.amount {
  font-size: 1.15rem;
  color: var(--color-primary);
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

.btn.disabled { pointer-events: none; opacity: 0.5; }
</style>
