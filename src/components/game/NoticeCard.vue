<template>
  <aside class="notice-card" :class="tone">
    <h3 v-if="title" class="nc-title">
      <span class="nc-icon" aria-hidden="true">{{ icon }}</span>
      {{ title }}
    </h3>
    <ul class="nc-list">
      <li v-for="item in items" :key="item">{{ item }}</li>
    </ul>
  </aside>
</template>

<script setup>
/**
 * 리워드·모의 투자·위험 안내 공통 카드.
 *
 * 발표 기획서 §1-6 이 준법 관점 제약으로 "모의 투자 고지"와
 * "공식 투자자 성향 진단을 대체하지 않는다"는 안내를 요구한다.
 * 그 문구를 화면마다 다시 쓰지 않도록 여기로 모았다.
 */
defineProps({
  title: { type: String, default: '' },
  items: { type: Array, required: true },
  tone: { type: String, default: 'info' }, // info | warn
  icon: { type: String, default: 'ℹ️' }
})
</script>

<style scoped>
.notice-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px 18px;
  background: var(--color-bg-secondary);
}

.notice-card.warn {
  background: var(--color-warning-light);
  border-color: color-mix(in srgb, var(--color-warning) 25%, transparent);
}

.nc-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 10px;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.notice-card.warn .nc-title { color: var(--color-warning); }

.nc-list {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 6px;
}

.nc-list li {
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
}
</style>
