<template>
  <ol class="game-progress" aria-label="게임 진행 단계">
    <li
      v-for="(step, i) in steps"
      :key="step"
      class="gp-step"
      :class="{ complete: i < current - 1, active: i === current - 1, reached: i < current }"
      :aria-current="i === current - 1 ? 'step' : undefined"
    >
      <span class="gp-line" aria-hidden="true"></span>
      <span class="gp-label">{{ step }}</span>
    </li>
  </ol>
</template>

<script setup>
/**
 * 진행 단계 표시. 기획 초안 §10 화면 3의
 * "1. 상황 확인 → 2. 종목 선택 → 3. 투자 확정" 을 그대로 쓴다.
 */
defineProps({
  /** 1부터 시작 */
  current: { type: Number, required: true }
})

const steps = ['상황 확인', '종목 선택', '투자 확정']
</script>

<style scoped>
.game-progress {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  list-style: none;
  margin: 0 0 30px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.gp-step {
  display: grid;
  gap: 8px;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  font-weight: 500;
}

.gp-line {
  display: block;
  height: 4px;
  border-radius: 999px;
  background: var(--color-border);
}

.gp-step.reached .gp-line { background: var(--color-primary); }
.gp-step.active { color: var(--color-text-primary); font-weight: 800; }
.gp-step.complete { color: var(--color-text-secondary); }

@media (max-width: 480px) {
  .game-progress { gap: 5px; }
  .gp-label { font-size: 0.74rem; }
}
</style>
