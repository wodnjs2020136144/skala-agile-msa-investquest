<template>
  <aside class="sidebar">
    <nav
      v-for="section in sections"
      :key="section.label"
      class="sidebar-section"
      :aria-label="section.label"
    >
      <div class="sidebar-label">{{ section.label }}</div>

      <router-link
        v-for="item in section.items"
        :key="item.to"
        :to="item.to"
        class="sidebar-item"
        :class="{ active: isActive(item.to) }"
        :aria-current="isActive(item.to) ? 'page' : undefined"
      >
        <span class="si-icon" aria-hidden="true">{{ item.icon }}</span>
        {{ item.label }}
      </router-link>

      <button
        v-if="section.logout"
        class="sidebar-item sidebar-btn"
        type="button"
        @click="handleLogout"
      >
        <span class="si-icon" aria-hidden="true">🚪</span>
        로그아웃
      </button>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth.js'

const route = useRoute()
const auth = useAuthStore()

const isInstructor = computed(() => auth.user?.role === 'INSTRUCTOR')

/**
 * 사이드바의 단일 진실원.
 * 이 배열 하나만 고치면 4개 뷰의 사이드바가 함께 바뀐다.
 */
const sections = computed(() => [
  {
    label: '메뉴',
    items: [
      { to: '/courses', icon: '📚', label: '강의 목록' },
      ...(isInstructor.value
        ? [{ to: '/courses/new', icon: '✍️', label: '강의 등록' }]
        : [{ to: '/enrollments', icon: '✅', label: '내 수강 목록' }]),
      { to: '/mypage', icon: '⭐', label: '마이페이지' }
    ]
  },
  {
    label: '계정',
    items: [],
    logout: true
  }
])

/**
 * active 판정을 한 곳으로 통일한다.
 * 원본은 뷰마다 $route.path 비교와 하드코딩 클래스를 섞어 써서
 * 같은 메뉴가 화면에 따라 다르게 강조됐다.
 */
function isActive(path) {
  if (path === '/courses') return route.path === '/courses'
  return route.path.startsWith(path)
}

/**
 * auth.logout()이 기본값 redirect=true로 window.location.href = '/login'을
 * 직접 수행한다. 원본 4개 뷰가 그 뒤에 붙여 둔 router.push('/')는
 * 도달하지 않는 죽은 코드라 옮기지 않는다.
 */
function handleLogout() {
  auth.logout()
}
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 8px;
}

.sidebar-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  padding: 8px 12px 4px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--color-text-secondary);
  transition: var(--transition);
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-family: var(--font-sans);
  text-decoration: none;
}

.sidebar-item:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.sidebar-item.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 500;
}

.si-icon {
  font-size: 15px;
}

.sidebar-btn {
  color: var(--color-text-secondary);
}

@media (max-width: 992px) {
  .sidebar {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 4px;
  }

  .sidebar-section {
    flex-direction: row;
    align-items: center;
    gap: 4px;
    margin-bottom: 0;
  }

  .sidebar-label {
    display: none;
  }

  .sidebar-item {
    width: auto;
    white-space: nowrap;
  }
}
</style>
