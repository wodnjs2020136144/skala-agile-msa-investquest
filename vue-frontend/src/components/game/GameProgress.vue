<template>
  <ol class="game-progress" aria-label="게임 진행 단계">
    <li
      v-for="(step, i) in steps"
      :key="step"
      class="gp-step"
      :class="{ done: i < current - 1, active: i === current - 1 }"
      :aria-current="i === current - 1 ? 'step' : undefined"
    >
      <span class="gp-bar" aria-hidden="true"></span>
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
/* 번호 원 대신 3분할 트랙. 지난 단계와 현재 단계는 브랜드색, 남은 단계는 회색. */
.game-progress {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
  list-style: none;
  margin: 0 0 var(--space-6);
  padding: 0;
}
.gp-step {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.gp-bar {
  display: block;
  height: 4px;
  border-radius: var(--r-full);
  background: var(--fill);
  transition: background-color var(--dur) var(--ease);
}
.gp-step.done .gp-bar,
.gp-step.active .gp-bar { background: var(--brand); }
.gp-label {
  font-size: var(--fs-13);
  font-weight: var(--fw-medium);
  color: var(--text-weak);
}
.gp-step.done .gp-label { color: var(--text); }
.gp-step.active .gp-label { color: var(--text-strong); font-weight: var(--fw-bold); }
</style>
