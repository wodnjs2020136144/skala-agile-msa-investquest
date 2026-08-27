<template>
  <!--
    AppHeader는 원본에서 6개 뷰가 각자 마운트했다.
    라우트 메타 hideChrome으로 로그인·콜백만 제외하고 여기서 한 번만 렌더한다.
  -->
  <AppHeader v-if="!$route.meta.hideChrome" />
  <!-- 고정 헤더가 게임 진행 단계·본문을 덮지 않도록 헤더 높이만큼 본문을 내린다. -->
  <main class="app-content" :class="{ 'with-header': !$route.meta.hideChrome }">
    <router-view />
  </main>
  <!-- 시연용 목/실 API 전환. 로그인·콜백 화면에서도 필요하므로 hideChrome 과 무관하게 둔다. -->
  <MockToggle />
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
import MockToggle from '@/components/ui/MockToggle.vue'
</script>

<style scoped>
.app-content.with-header { padding-top: 72px; }
</style>
