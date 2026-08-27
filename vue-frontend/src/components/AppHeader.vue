<template>
  <header class="app-header">
    <div class="header-inner">
      <!-- 로고 -->
      <router-link to="/" class="logo">
        <img src="@/assets/images/logo/main_logo.png" alt="InvestQuest" class="logo-img" />
        <span class="logo-text">InvestQuest</span>
      </router-link>

      <!--
        네비게이션.

        강의·내 학습·마이페이지는 강사 템플릿 화면이고 목 분기가 없다
        (목은 게임 API 에만 있다). 목 모드에서 누르면 vite 프록시가
        localhost:8080 으로 나갔다가 연결 실패해 에러 화면이 뜬다.
        그래서 목 모드에서는 링크를 내린다. 라우트와 뷰 파일은 그대로 두므로
        VITE_USE_MOCK=false 면 지금까지와 똑같이 보인다.
      -->
      <nav class="nav-links" v-if="auth.isAuthenticated">
        <router-link to="/game/guide" class="nav-link" :class="{ active: $route.path.startsWith('/game') }">투자 게임</router-link>
        <template v-if="!USE_MOCK">
          <router-link to="/courses" class="nav-link nav-secondary" :class="{ active: $route.path.startsWith('/courses') }">강의</router-link>
          <router-link to="/enrollments" class="nav-link nav-secondary" :class="{ active: $route.path === '/enrollments' }">내 학습</router-link>
        </template>
      </nav>

      <!-- 우측 액션 -->
      <div class="header-actions">
        <template v-if="auth.isAuthenticated">
          <!--
            로그인 사용자 표시는 Sprint1 완료 조건이라 목 모드에서도 남긴다.
            마이페이지로 나가는 링크만 뗀다.
          -->
          <router-link v-if="!USE_MOCK" to="/mypage" class="user-avatar" :title="auth.user?.name">
            {{ auth.user?.name?.charAt(0) || '?' }}
          </router-link>
          <span v-else class="user-avatar is-static" :title="auth.user?.name">
            {{ auth.user?.name?.charAt(0) || '?' }}
          </span>
          <button class="btn btn-ghost btn-sm" @click="handleLogout">로그아웃</button>
        </template>
        <template v-else>
          <router-link to="/login" class="btn btn-ghost btn-sm">로그인</router-link>
          <router-link to="/login" class="btn btn-primary btn-sm">시작하기</router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/store/auth.js'
import { useRouter } from 'vue-router'
import { USE_MOCK } from '@/config.js'

const auth = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push('/')
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
}
.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 32px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.logo-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  border-radius: 8px;
}
.logo-text {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.3px;
}
.nav-links {
  display: flex;
  gap: 4px;
  flex: 1;
}
.nav-link {
  white-space: nowrap;
  padding: 6px 14px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: var(--transition);
}
.nav-link:hover,
.nav-link.active {
  color: var(--color-primary);
  background: var(--color-primary-light);
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
.btn-sm {
  padding: 7px 16px;
  font-size: 13px;
}
.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
}
.user-avatar:hover {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
/* 목 모드의 아바타는 클릭할 곳이 없다. 눌릴 것처럼 보이지 않게 한다. */
.user-avatar.is-static {
  cursor: default;
}
.user-avatar.is-static:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

/*
 * 좁은 폭 대응.
 * 원본 헤더에는 미디어쿼리가 없어, 링크를 하나만 늘려도 좁은 화면에서
 * 글자가 세로로 쪼개지며 헤더 밖으로 튀어나온다.
 * 게임이 주 흐름이므로 보조 링크(강의·내 학습)부터 접는다.
 */
@media (max-width: 720px) {
  .header-inner { gap: 12px; padding: 0 14px; }
  .nav-secondary { display: none; }
  .logo-text { font-size: 15px; }
  .logo-img { width: 30px; height: 30px; }
}

@media (max-width: 420px) {
  .logo-text { display: none; }
  .btn-sm { padding: 7px 12px; }
}
</style>
