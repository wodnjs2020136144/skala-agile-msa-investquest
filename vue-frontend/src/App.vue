<template>
  <!--
    AppHeader는 원본에서 6개 뷰가 각자 마운트했다.
    라우트 메타 hideChrome으로 로그인·콜백만 제외하고 여기서 한 번만 렌더한다.
  -->
  <AppHeader v-if="!$route.meta.hideChrome" />
  <router-view />
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
</script>
