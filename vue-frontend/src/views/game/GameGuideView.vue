<template>
  <div class="page">
    <div class="page-inner fade-in-up">
      <GameProgress :current="1" />

      <h1 class="page-title">게임 안내</h1>
      <p class="page-sub">시작하기 전에 진행 방식을 확인해 주세요.</p>

      <ul class="fact-grid">
        <li v-for="f in facts" :key="f.label" class="fact">
          <span class="fact-label">{{ f.label }}</span>
          <strong class="fact-value">{{ f.value }}</strong>
        </li>
      </ul>

      <section class="how">
        <h2 class="sec-title">진행 방식</h2>
        <ol class="how-list">
          <li v-for="h in how" :key="h">{{ h }}</li>
        </ol>
      </section>

      <NoticeCard tone="warn" icon="⚠️" title="주의사항" :items="cautions" />

      <p v-if="game.error" class="error-msg" role="alert">{{ game.error }}</p>

      <div class="actions">
        <router-link to="/" class="btn btn-outline">홈으로</router-link>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="game.loading"
          @click="start"
        >
          {{ game.loading ? '준비 중...' : '동의하고 게임 시작' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useGameStore } from '@/store/game.js'
import GameProgress from '@/components/game/GameProgress.vue'
import NoticeCard from '@/components/game/NoticeCard.vue'

const router = useRouter()
const game = useGameStore()

const facts = [
  { label: '가상 투자금', value: '10,000원' },
  { label: '게임 기간', value: '7일' },
  { label: '제시 종목', value: '6종 + 현금' },
  { label: '참여 리워드', value: '결과 확인 시 지급' }
]

const how = [
  '가상의 지출 상황과 사용할 수 있는 투자금을 확인합니다.',
  '제시된 종목과 현금에 투자금을 원하는 비율로 나눠 담습니다.',
  '투자를 확정하면 약 일주일 뒤 결과와 투자 성향 분석을 확인할 수 있습니다.'
]

const cautions = [
  '이 게임은 모의 투자이며 실제 매매가 이루어지지 않습니다.',
  '등장하는 종목은 모두 가상이며 실존 기업과 무관합니다.',
  '게임 결과는 실제 투자 수익을 보장하지 않습니다.',
  '결과는 참고용 보조 정보이며 공식 투자자 성향 진단을 대체하지 않습니다.',
  '투자 과정에서의 선택 기록은 성향 분석에만 사용됩니다.'
]

async function start() {
  try {
    game.reset()
    await game.startGame(1)
    router.push('/game/scenario')
  } catch {
    // 에러 메시지는 스토어가 game.error 에 담아 화면에 표시한다
  }
}
</script>

<style scoped>
@import './game-page.css';

.fact-grid {
  list-style: none;
  margin: 0 0 32px;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.fact {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px;
  display: grid;
  gap: 6px;
}

.fact-label { font-size: 0.8rem; color: var(--color-text-secondary); }
.fact-value {
  font-size: 1.05rem;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

.how { margin-bottom: 28px; }

.how-list {
  margin: 0;
  padding-left: 20px;
  display: grid;
  gap: 10px;
}

.how-list li {
  color: var(--color-text-secondary);
  line-height: 1.7;
}
</style>
