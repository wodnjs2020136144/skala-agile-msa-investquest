<template>
  <div class="page">
    <div class="page-inner fade-in-up">
      <GameProgress :current="1" />

      <div v-if="game.loading && !s" class="loading" aria-busy="true">
        <div class="iq-spinner" aria-hidden="true"></div>
        불러오는 중...
      </div>

      <p v-else-if="game.error" class="error-msg" role="alert">
        {{ game.error }}
        <button type="button" class="text-btn retry" @click="load">다시 시도</button>
      </p>

      <template v-else-if="s">
        <span class="scenario-tag">가상 시나리오 {{ String(s.id).padStart(2, '0') }}</span>
        <h1 class="page-title">{{ s.title }}</h1>

        <p class="situation">{{ s.description }}</p>
        <p class="guide-text">{{ s.guide }}</p>

        <dl class="terms card">
          <div class="term">
            <dt>보유 투자금</dt>
            <dd class="amount num num-lg">{{ format(s.initialCash) }}원</dd>
          </div>
          <div class="term">
            <dt>게임 기간</dt>
            <dd>{{ s.durationDays }}일</dd>
          </div>
          <div class="term">
            <dt>목표</dt>
            <dd>자신의 판단 기준에 따라 투자하기</dd>
          </div>
        </dl>

        <NoticeCard
          title="참고"
          :items="[
            '정답은 없습니다. 어떤 배분이든 유효한 선택입니다.',
            '투자금을 전부 쓰지 않고 현금으로 남겨 두어도 됩니다.',
            '모의 투자이며 실제 투자 수익을 보장하지 않습니다.'
          ]"
        />
      </template>

      <BottomCta>
        <template #secondary>
          <router-link to="/" class="btn btn-ghost">홈으로</router-link>
        </template>
        <router-link
          to="/game/invest"
          class="btn btn-primary"
          :class="{ disabled: !s }"
        >
          종목 선택하기
        </router-link>
      </BottomCta>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useGameStore } from '@/store/game.js'
import GameProgress from '@/components/game/GameProgress.vue'
import NoticeCard from '@/components/game/NoticeCard.vue'
import BottomCta from '@/components/ui/BottomCta.vue'

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

.scenario-tag {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 var(--space-3);
  border-radius: var(--r-full);
  background: var(--brand-weak);
  color: var(--brand);
  font-size: var(--fs-13);
  font-weight: var(--fw-bold);
  margin-bottom: var(--space-3);
}
.situation {
  font-size: var(--fs-17);
  line-height: var(--lh-loose);
  color: var(--text-strong);
  margin: var(--space-4) 0 var(--space-3);
}
.guide-text {
  font-size: var(--fs-15);
  line-height: var(--lh-loose);
  color: var(--text);
  margin: 0 0 var(--space-6);
}

/* 조건 — 카드 안 라벨·값 행. 금액은 검정으로 크게, 파랑은 액션에만. */
.terms {
  margin: 0 0 var(--space-4);
  padding: var(--space-2) var(--space-5);
}
.term {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4) 0;
}
.term + .term { border-top: 1px solid var(--line); }
.term dt {
  font-size: var(--fs-15);
  color: var(--text);
  flex-shrink: 0;
}
.term dd {
  margin: 0;
  font-size: var(--fs-15);
  font-weight: var(--fw-bold);
  color: var(--text-strong);
  text-align: right;
}
</style>
