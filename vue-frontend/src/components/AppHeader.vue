<template>
  <header class="app-header">
    <div class="header-inner">
      <!-- 로고 -->
      <router-link to="/" class="logo">
        <img src="@/assets/images/logo/main_logo.png" alt="InvestQuest" class="logo-img" />
        <span class="logo-text">InvestQuest</span>
      </router-link>

      <!-- 네비게이션 -->
      <nav class="nav-links" v-if="auth.isAuthenticated">
        <router-link to="/game/guide" class="nav-link" :class="{ active: $route.path.startsWith('/game') }">투자 게임</router-link>
        <router-link to="/courses" class="nav-link nav-secondary" :class="{ active: $route.path.startsWith('/courses') }">강의</router-link>
        <router-link to="/enrollments" class="nav-link nav-secondary" :class="{ active: $route.path === '/enrollments' }">내 학습</router-link>
      </nav>

      <!-- 우측 액션 -->
      <div class="header-actions">
        <template v-if="auth.isAuthenticated">
          <router-link to="/mypage" class="user-avatar" :title="auth.user?.name">
            {{ auth.user?.name?.charAt(0) || '?' }}
          </router-link>
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
