<template>
  <ol class="game-progress" aria-label="게임 진행 단계">
    <li
      v-for="(step, i) in steps"
      :key="step"
      class="gp-step"
      :class="{ done: i < current - 1, active: i === current - 1 }"
      :aria-current="i === current - 1 ? 'step' : undefined"
    >
      <span class="gp-num" aria-hidden="true">{{ i < current - 1 ? '✓' : i + 1 }}</span>
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
  display: flex;
  align-items: center;
  gap: 8px;
  list-style: none;
  margin: 0 0 24px;
  padding: 0;
  flex-wrap: wrap;
}

.gp-step {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-weight: 600;
}

.gp-step:not(:last-child)::after {
  content: '';
  width: 28px;
  height: 1px;
  background: var(--color-border);
  margin-left: 8px;
}

.gp-num {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--color-bg-tertiary);
  color: var(--color-text-muted);
  font-size: 0.8rem;
  flex-shrink: 0;
}

.gp-step.active { color: var(--color-primary); }
.gp-step.active .gp-num {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.gp-step.done { color: var(--color-success); }
.gp-step.done .gp-num {
  background: var(--color-success-light);
  color: var(--color-success);
}

@media (max-width: 480px) {
  .gp-label { font-size: 0.82rem; }
  .gp-step:not(:last-child)::after { width: 14px; margin-left: 4px; }
}
</style>
