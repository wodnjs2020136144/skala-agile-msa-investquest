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
        <ThemeToggle />
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
import ThemeToggle from '@/components/ui/ThemeToggle.vue'

const auth = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push('/')
}
</script>

<style scoped>
/* 선 없는 불투명 흰 면. 바닥(--bg)과의 명도차가 경계다. */
.app-header {
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  background: var(--header-glass);
}
.header-inner {
  max-width: var(--content-max-wide);
  margin: 0 auto;
  padding: 0 var(--space-5);
  height: var(--header-h);
  display: flex;
  align-items: center;
  gap: var(--space-6);
}
.logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}
.logo-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  border-radius: var(--r-8);
}
.logo-text {
  font-size: var(--fs-17);
  font-weight: var(--fw-bold);
  color: var(--text-strong);
  letter-spacing: var(--tracking-title);
}
.nav-links {
  display: flex;
  gap: var(--space-1);
  flex: 1;
}
.nav-link {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 var(--space-3);
  border-radius: var(--r-8);
  font-size: var(--fs-15);
  font-weight: var(--fw-semibold);
  color: var(--text);
  white-space: nowrap;
  transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease);
}
.nav-link:hover { background: var(--fill-weak); color: var(--text-strong); }
.nav-link.active { color: var(--brand); background: var(--brand-weak); }
.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
}
.btn-sm {
  height: 34px;
  padding: 0 var(--space-4);
  font-size: var(--fs-13);
  border-radius: var(--r-8);
}
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--fill-weak);
  color: var(--text-strong);
  font-size: var(--fs-13);
  font-weight: var(--fw-bold);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color var(--dur) var(--ease);
}
.user-avatar:hover { background: var(--fill); }
/* 목 모드의 아바타는 클릭할 곳이 없다. 눌릴 것처럼 보이지 않게 한다. */
.user-avatar.is-static { cursor: default; }
.user-avatar.is-static:hover { background: var(--fill-weak); }

/*
 * 좁은 폭 대응.
 * 게임이 주 흐름이므로 보조 링크(강의·내 학습)부터 접는다.
 */
@media (max-width: 767px) {
  .header-inner { gap: var(--space-3); padding: 0 var(--space-4); }
  .nav-secondary { display: none; }
  .logo-text { font-size: var(--fs-15); }
}

@media (max-width: 480px) {
  .logo-text { display: none; }
  .btn-sm { padding: 0 var(--space-3); }
}
</style>
