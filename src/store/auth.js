import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth.js'

const AUTH_SERVER_URL = import.meta.env.VITE_AUTH_SERVER_URL || 'http://localhost:8080'

/**
 * 목 모드.
 *
 * 백엔드가 없으면 auth-server 도 안 떠 있어 OAuth2 로그인 자체가 불가능하다.
 * 그런데 /game/* 은 전부 requiresAuth 라서, 로그인을 못 하면 게임 화면에
 * 진입조차 못 해 목 데이터가 무의미해진다. 그래서 목 모드에서만 가짜 사용자로
 * 로그인한 것처럼 처리한다.
 *
 * ⚠️ 아래 OAuth2 코드는 한 줄도 지우지 않았다. VITE_USE_MOCK=false 로 두면
 *    기존 Authorization Code Flow 가 그대로 동작한다.
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const MOCK_USER = {
  id: 1,
  name: '김투자',
  email: 'student@lecture.com',
  // users.role 은 STUDENT / INSTRUCTOR 2개 고정이다. auth-server 이미지에
  // enum 이 컴파일돼 있어 다른 값을 넣으면 로그인이 조용히 깨진다.
  // 의미만 재해석한다 — STUDENT = 일반 투자자.
  role: 'STUDENT'
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(sessionStorage.getItem('access_token') || null)
  const user = ref(JSON.parse(sessionStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!accessToken.value)
  const isInstructor = computed(() => user.value?.role === 'INSTRUCTOR')

  function setToken(token) {
    accessToken.value = token
    sessionStorage.setItem('access_token', token)
  }

  function setUser(userData) {
    user.value = userData
    sessionStorage.setItem('user', JSON.stringify(userData))
  }

  async function fetchUser() {
    try {
      const res = await authApi.getMe()

      const userData = res?.data?.data ?? res?.data

      if (!userData || typeof userData !== 'object') {
        throw new Error('사용자 정보 형식이 올바르지 않습니다.')
      }

      setUser(userData)
    } catch (error) {
      console.error('[AuthStore] 사용자 정보 조회 실패:', error)
      logout(false)
    }
  }

  function logout(redirect = true) {
    accessToken.value = null
    user.value = null
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('user')

    if (redirect) {
      window.location.href = '/login'
    }
  }

  // OAuth2 Authorization Code Flow
  function redirectToLogin(redirectTo = '/') {
    if (USE_MOCK) {
      setToken('mock-access-token')
      setUser(MOCK_USER)
      window.location.href = redirectTo
      return
    }

    // OAuth 리다이렉트는 페이지를 통째로 갈아치우므로 라우터 상태가 사라진다.
    // CallbackView 가 읽을 수 있게 목적지를 sessionStorage 에 남긴다.
    sessionStorage.setItem('post_login_redirect', redirectTo)

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: import.meta.env.VITE_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_REDIRECT_URI,
      scope: 'openid profile read write'
    })

    window.location.href = `${AUTH_SERVER_URL}/oauth2/authorize?${params.toString()}`
  }

  async function handleCallback(code) {
    const res = await authApi.exchangeCode(code)

    const token = res?.data?.access_token

    if (!token) {
      throw new Error('액세스 토큰을 받지 못했습니다.')
    }

    setToken(token)
    await fetchUser()
  }

  return {
    accessToken,
    user,
    isAuthenticated,
    isInstructor,
    setToken,
    setUser,
    fetchUser,
    logout,
    redirectToLogin,
    handleCallback
  }
})