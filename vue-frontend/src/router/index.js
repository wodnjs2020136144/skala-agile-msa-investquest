import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth.js'
import { USE_MOCK } from '@/config.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guestOnly: true, hideChrome: true }
  },
  {
    path: '/callback',
    name: 'Callback',
    component: () => import('@/views/CallbackView.vue'),
    meta: { hideChrome: true }
  },

  // ── 투자 게임 (Sprint1 범위) ────────────────────────────────
  {
    path: '/game/guide',
    name: 'GameGuide',
    component: () => import('@/views/game/GameGuideView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/game/scenario',
    name: 'GameScenario',
    component: () => import('@/views/game/GameScenarioView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/game/invest',
    name: 'GameInvest',
    component: () => import('@/views/game/GameInvestView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/game/confirm',
    name: 'GameConfirm',
    component: () => import('@/views/game/GameConfirmView.vue'),
    meta: { requiresAuth: true }
  },

  // ── 결과·리워드 (Sprint2 범위) ──────────────────────────────
  // 확정 이후 단계라 GameProgress(3단계) 밖이다.
  // 확정 내역(game.result)이 없으면 각 화면이 빈 상태를 보여 준다.
  {
    path: '/game/result',
    name: 'GameResult',
    component: () => import('@/views/game/GameResultView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/game/reward',
    name: 'GameReward',
    component: () => import('@/views/game/GameRewardView.vue'),
    meta: { requiresAuth: true }
  },

  // ── 강사 배포 템플릿의 강의 화면 ─────────────────────────────
  // 백엔드가 아직 강의 API 그대로라 살려 둔다. 도메인 용어 교체는
  // 스키마·섹터명(안건 2-3)이 확정된 뒤 한 번에 한다.
  //
  // templateScreen: 이 화면들은 목 분기가 없어 목 모드에서 열면 실 API 를
  // 호출하다 실패한다. 아래 가드가 목 모드에서만 홈으로 돌린다.
  // 라우트를 지우지 않는 이유는 VITE_USE_MOCK=false 면 그대로 필요하기 때문이다.
  {
    path: '/courses',
    name: 'CourseList',
    component: () => import('@/views/CourseListView.vue'),
    meta: { requiresAuth: true, templateScreen: true }
  },
  {
    path: '/courses/new',
    name: 'CourseCreate',
    component: () => import('@/views/CourseCreateView.vue'),
    meta: { requiresAuth: true, instructorOnly: true, templateScreen: true }
  },
  {
    path: '/courses/:id(\\d+)',
    name: 'CourseDetail',
    component: () => import('@/views/CourseDetailView.vue'),
    meta: { requiresAuth: true, templateScreen: true }
  },
  {
    path: '/enrollments',
    name: 'Enrollment',
    component: () => import('@/views/EnrollmentView.vue'),
    meta: { requiresAuth: true, templateScreen: true }
  },
  {
    path: '/mypage',
    name: 'MyPage',
    component: () => import('@/views/MyPageView.vue'),
    meta: { requiresAuth: true, templateScreen: true }
  },

  // 없는 경로는 홈으로. 원본에는 catch-all 이 없어 흰 화면이 떴다.
  { path: '/:pathMatch(.*)*', redirect: { name: 'Home' } }
]

const router = createRouter({
  // GitHub Pages는 SPA의 서버 측 경로 재작성 기능이 없다.
  // 배포본만 hash URL을 써서 /game/invest 등을 새로고침해도 홈으로 404가 나지 않게 한다.
  history: import.meta.env.PROD ? createWebHashHistory() : createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 인증/권한 가드
router.beforeEach((to) => {
  const auth = useAuthStore()

  // 목 모드에서는 템플릿 화면을 열지 않는다.
  // 헤더에서 링크를 내렸어도 주소창 직접 입력·뒤로가기로는 들어올 수 있다.
  if (USE_MOCK && to.meta.templateScreen) {
    return { name: 'Home' }
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    // 로그인 후 원래 가려던 곳으로 돌려보낸다.
    // 원본은 무조건 /courses 로 보내 게임 URL 을 직접 연 사용자가 길을 잃었다.
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'Home' }
  }

  if (to.meta.instructorOnly && auth.user?.role !== 'INSTRUCTOR') {
    return { name: 'Home' }
  }
})

export default router
