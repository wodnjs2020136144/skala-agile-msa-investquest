<template>
  <!--
    화면 맨 아래 주 액션.
    모바일에서는 하단에 고정되고(토스 앱), 768px 이상에서는 컬럼 안 제자리에 놓인다.
    고정될 때 내용이 가려지지 않도록 같은 높이의 스페이서를 남긴다.
  -->
  <div class="bottom-cta">
    <div class="bc-spacer" aria-hidden="true"></div>
    <div class="bc-bar">
      <div class="bc-inner actions">
        <slot name="secondary"></slot>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bc-bar {
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
  .bc-bar {
    position: static;
    padding: 0;
    background: transparent;
    box-shadow: none;
  }
  .bc-spacer { height: var(--space-8); }
  .bc-inner :deep(.btn) { height: 52px; font-size: var(--fs-15); }
}
</style>
