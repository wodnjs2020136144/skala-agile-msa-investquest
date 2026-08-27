import axios from 'axios'
import { useAuthStore } from '@/store/auth.js'

const api = axios.create({
  baseURL: '',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const auth = useAuthStore()

      // 이미 로그아웃 상태면 리다이렉트 루프가 된다.
      if (auth.isAuthenticated) {
        console.warn('[API] 401 — 세션이 만료되어 로그아웃합니다.', err.config?.url)
        // logout 이 서버 세션도 끊는다(fetch). 먼저 이동하면 그 요청이 취소되므로 기다린다.
        const back = encodeURIComponent(location.pathname)
        auth.logout(false).finally(() => {
          window.location.href = `/login?redirect=${back}`
        })
      }
    }
    return Promise.reject(err)
  }
)

export default api
