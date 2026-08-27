<template>
  <div class="page">
    <div class="page-inner fade-in-up">
      <GameProgress :current="1" />

      <h1 class="page-title">게임 안내</h1>
      <p class="page-sub">시작하기 전에 진행 방식을 확인해 주세요.</p>

      <ul class="fact-grid card">
        <li v-for="f in facts" :key="f.label" class="fact">
          <span class="fact-label">{{ f.label }}</span>
          <strong class="fact-value num" :class="{ 'num-lg': f.label === '가상 투자금' }">{{ f.value }}</strong>
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

      <BottomCta>
        <template #secondary>
          <router-link to="/" class="btn btn-ghost">홈으로</router-link>
        </template>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="game.loading"
          @click="start"
        >
          {{ game.loading ? '준비 중...' : '동의하고 게임 시작' }}
        </button>
      </BottomCta>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useGameStore } from '@/store/game.js'
import GameProgress from '@/components/game/GameProgress.vue'
import NoticeCard from '@/components/game/NoticeCard.vue'
import BottomCta from '@/components/ui/BottomCta.vue'

const router = useRouter()
const game = useGameStore()

const facts = [
  { label: '가상 투자금', value: '10,000,000원' },
  { label: '게임 기간', value: '3일' },
  { label: '제시 종목', value: '6종 + 현금' },
  { label: '참여 리워드', value: '최대 1만원' }
]

const how = [
  '달 기지행 셔틀 출발 전, 3일간 수행할 가상 투자 미션을 확인합니다.',
  '제시된 종목과 현금에 투자금을 원하는 비율로 나눠 담습니다.',
  '투자를 확정하면 3일 뒤 결과와 투자 성향 분석을 확인할 수 있습니다.',
  '지급된 포인트는 3일 동안 재투자한 후 출금할 수 있습니다.'
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

/* 핵심 숫자 4개 — 흰 카드 한 장 안의 2×2 */
.fact-grid {
  list-style: none;
  margin: 0 0 var(--space-7);
  padding: var(--space-2) var(--space-5);
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.fact {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-4) 0;
}
.fact:nth-child(odd) { padding-right: var(--space-4); }
.fact:nth-child(n + 3) { border-top: 1px solid var(--line); }
.fact-label {
  font-size: var(--fs-13);
  color: var(--text-weak);
  font-weight: var(--fw-medium);
}
.fact-value {
  font-size: var(--fs-17);
}

/* 진행 방식 — 마크업은 <ol> 그대로, 번호 원은 CSS counter */
.how { margin-bottom: var(--space-7); }
.how-list {
  list-style: none;
  margin: 0;
  padding: 0;
  counter-reset: how;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.how-list li {
  counter-increment: how;
  position: relative;
  padding-left: 36px;
  font-size: var(--fs-15);
  line-height: var(--lh-loose);
  color: var(--text);
  min-height: 24px;
}
.how-list li::before {
  content: counter(how);
  position: absolute;
  left: 0;
  top: 1px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--brand-weak);
  color: var(--brand);
  font-size: var(--fs-13);
  font-weight: var(--fw-bold);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 768px) {
  .fact-grid { grid-template-columns: repeat(4, 1fr); padding: var(--space-3) var(--space-6); }
  .fact:nth-child(n + 3) { border-top: none; }
  .fact + .fact { padding-left: var(--space-5); border-left: 1px solid var(--line); }
  .fact:nth-child(odd) { padding-right: 0; }
}
</style>
