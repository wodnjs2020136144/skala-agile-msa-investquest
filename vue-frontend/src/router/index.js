import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth.js'
import { SHOW_TEMPLATE_SCREENS } from '@/config.js'

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
  // templateScreen: 이 화면들은 목 분기가 없고, 부르는 경로도 백엔드에 없다
  // (GET /api/enrollments/my 등). 아래 가드가 홈으로 돌린다.
  // 라우트를 지우지 않는 이유는 경로가 생기면 그대로 필요하기 때문이다.
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
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 인증/권한 가드
router.beforeEach((to) => {
  const auth = useAuthStore()

  // 템플릿 화면은 닫아 둔다. 헤더에서 링크를 내렸어도
  // 주소창 직접 입력·뒤로가기로는 들어올 수 있다.
  if (!SHOW_TEMPLATE_SCREENS && to.meta.templateScreen) {
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
