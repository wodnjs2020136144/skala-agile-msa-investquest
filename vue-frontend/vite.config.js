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
      '/logout': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },

      // Spring Security 의 폼 로그인 엔드포인트(POST /login).
      //
      // auth-server 는 소스 없는 완성 이미지라 기본 로그인 페이지를 고칠 수 없다.
      // 그래서 앱 안의 폼에서 자격증명을 여기로 보내 세션을 만들고,
      // 그다음 /oauth2/authorize 가 폼 없이 통과하게 한다.
      //
      // 경로를 /login 그대로 두지 않는 이유: SPA 의 /login 라우트와 겹쳐서
      // 하드 새로고침 시 로그인 화면 대신 게이트웨이 응답이 온다.
      //
      // autoRewrite 가 핵심이다. Spring 이 Location 을 절대 URL 로 준다
      // (성공 http://localhost:8080/ · 실패 .../login?error). 그대로 두면 fetch 가
      // 교차 출처로 따라가다 CORS 에 막혀 성공·실패를 구분할 수 없다.
      // autoRewrite 가 host 를 :3000 으로 되돌려 동일 출처로 만들어 준다.
      '/auth-login': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        autoRewrite: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/auth-login/, '/login')
      }
    }
  }
})