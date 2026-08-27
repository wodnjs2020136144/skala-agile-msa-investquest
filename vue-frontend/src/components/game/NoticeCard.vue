<template>
  <aside class="notice-card" :class="tone">
    <h3 v-if="title" class="nc-title">
      <!-- 아이콘은 톤으로 그린다. icon 프롭은 호출부 호환용으로 남긴다. -->
      <svg v-if="tone === 'warn'" class="nc-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
      <svg v-else class="nc-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </svg>
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
/* 회색 바닥 위 흰 카드. 테두리 없음. (--fill-weak 는 라이트에서 바닥과 같은 값이라 안 보인다) */
.notice-card {
  background: var(--surface);
  box-shadow: var(--elev-card);
  border-radius: var(--r-16);
  padding: var(--space-5);
}
.notice-card.warn { background: var(--caution-weak); }
.nc-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--fs-15);
  font-weight: var(--fw-bold);
  color: var(--text-strong);
  margin: 0 0 var(--space-3);
}
.nc-icon { flex-shrink: 0; color: var(--text-weak); }
.notice-card.warn .nc-title,
.notice-card.warn .nc-icon { color: var(--caution-text); }
.nc-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--space-2);
}
.nc-list li {
  position: relative;
  padding-left: 14px;
  font-size: var(--fs-14);
  line-height: var(--lh-loose);
  color: var(--text);
}
.nc-list li::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 10px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--text-weak);
}
.notice-card.warn .nc-list li::before { background: var(--caution); }
</style>
