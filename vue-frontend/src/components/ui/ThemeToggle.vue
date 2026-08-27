<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="isDark ? '라이트 모드로 전환' : '다크 모드로 전환'"
    :title="isDark ? '라이트 모드' : '다크 모드'"
    @click="toggle"
  >
    <svg v-if="isDark" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
    <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  </button>
</template>

<script setup>
/**
 * 라이트/다크 토글.
 *
 * 저장값이 없으면 시스템 설정을 따른다(토큰의 prefers-color-scheme 블록).
 * 누르면 현재 보이는 테마의 반대를 data-theme 에 박고 localStorage 에 남긴다.
 * 첫 페인트 전 적용은 index.html 의 인라인 스크립트가 맡는다.
 */
import { ref, onMounted } from 'vue'

const KEY = 'iq-theme'
const isDark = ref(false)

function systemDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function current() {
  return document.documentElement.dataset.theme || (systemDark() ? 'dark' : 'light')
}

function toggle() {
  const next = current() === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = next
  try { localStorage.setItem(KEY, next) } catch { /* 프라이빗 모드 등 */ }
  isDark.value = next === 'dark'
}

onMounted(() => {
  isDark.value = current() === 'dark'
})
</script>

<style scoped>
.theme-toggle {
  width: 36px;
  height: 36px;
  border-radius: var(--r-full);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  transition: background-color var(--dur) var(--ease), transform var(--dur) var(--ease);
}
.theme-toggle:hover { background: var(--fill-weak); color: var(--text-strong); }
.theme-toggle:active { transform: scale(.94); }
</style>
