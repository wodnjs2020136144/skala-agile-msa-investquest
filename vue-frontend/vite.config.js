import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    host: 'localhost',
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      // 토큰 교환(POST /oauth2/token)이 여기를 탄다. 프록시를 태우면 동일 출처가 돼
      // 게이트웨이의 CORS 설정에 의존하지 않는다.
      '/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },

      // auth-server 세션(JSESSIONID)을 끊는다. 이게 없으면 프런트에서 로그아웃해도
      // 서버 세션이 살아 있어 다음 /oauth2/authorize 가 폼 없이 바로 코드를 내준다.
      //
      // 쿠키는 포트를 구분하지 않는다 — :8080 이 심은 JSESSIONID 가 :3000 에도 실려 오므로
      // 프록시를 태우면 동일 출처 fetch 로 세션을 끊을 수 있다.
      // SPA 에 /logout 라우트가 없어 경로도 겹치지 않는다.
      //
      // /login · /userinfo 프록시는 뺐다. 프런트가 API 로 부르지 않고,
      // /login 은 오히려 SPA 라우트라서 프록시에 걸리면 하드 새로고침 시
      // 로그인 화면 대신 게이트웨이 응답이 온다.
      '/logout': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
})