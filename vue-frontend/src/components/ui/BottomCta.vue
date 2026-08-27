<template>
  <!--
    화면 맨 아래 주 액션.
    모바일에서는 하단에 고정되고(토스 앱), 768px 이상에서는 컬럼 안 제자리에 놓인다.
    고정될 때 내용이 가려지지 않도록 같은 높이의 스페이서를 남긴다.
  -->
  <div class="bottom-cta" :class="{ 'mobile-only': mobileOnly }">
    <div class="bc-spacer" aria-hidden="true"></div>
    <!-- 모바일에서는 body 로 보낸다. 조상에 transform(fade-in-up)이 있으면 fixed 기준이 뷰포트가 아니게 되기 때문이다. -->
    <Teleport to="body" :disabled="!isMobile">
      <div class="bc-bar" :class="{ 'is-fixed': isMobile }">
        <div class="bc-inner actions">
          <slot name="secondary"></slot>
          <slot></slot>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

defineProps({
  /** 데스크톱에서는 화면 안에 이미 같은 액션이 있을 때 — 모바일 고정 바만 남긴다 */
  mobileOnly: { type: Boolean, default: false }
})

/* CSS 의 768px 경계와 같은 값. 텔레포트 여부를 정한다. */
const mq = typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)') : null
const isMobile = ref(mq ? mq.matches : false)
const onChange = (e) => { isMobile.value = e.matches }
onMounted(() => mq?.addEventListener('change', onChange))
onBeforeUnmount(() => mq?.removeEventListener('change', onChange))
</script>

<style scoped>
.bc-bar.is-fixed {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-cta);
  padding: var(--space-3) var(--space-5) calc(var(--space-3) + env(safe-area-inset-bottom));
  background: var(--surface);
  box-shadow: var(--elev-cta);
}
.bc-spacer {
  height: calc(var(--cta-h) + var(--space-3) * 2 + env(safe-area-inset-bottom));
}
.bc-inner {
  max-width: var(--content-max);
  margin: 0 auto;
  display: flex;
  gap: var(--space-2);
}
.bc-inner :deep(.btn) {
  height: var(--cta-h);
  border-radius: var(--r-16);
  font-size: var(--fs-17);
  font-weight: var(--fw-bold);
}
.bc-inner :deep(.btn-primary) { flex: 1; }
.bc-inner :deep(.btn-outline),
.bc-inner :deep(.btn-ghost) { padding: 0 var(--space-6); }

@media (min-width: 768px) {
  .mobile-only { display: none; }
  .bc-spacer { height: var(--space-8); }
  .bc-inner :deep(.btn) { height: 52px; font-size: var(--fs-15); }
}
</style>
