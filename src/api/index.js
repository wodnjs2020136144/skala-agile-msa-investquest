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
        auth.logout(false)
        window.location.href = `/login?redirect=${encodeURIComponent(location.pathname)}`
      }
    }
    return Promise.reject(err)
  }
)

export default api
