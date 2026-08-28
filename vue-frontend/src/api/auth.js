import api from './index.js'
import axios from 'axios'

export const authApi = {
  /**
   * Spring Security 폼 로그인.
   *
   * auth-server 는 소스 없는 완성 이미지라 기본 로그인 페이지("Please sign in")를
   * 고칠 수 없다. 그래서 앱 안의 폼에서 자격증명을 이 엔드포인트로 직접 보내
   * 세션(JSESSIONID)을 만든다. 그다음 /oauth2/authorize 가 폼 없이 통과하므로
   * 기존 Authorization Code Flow 가 그대로 이어진다.
   *
   * 성공·실패는 응답 URL 로 가른다. Spring 이 성공하면 '/', 실패하면 '/login?error'
   * 로 리다이렉트하는데, vite 프록시의 autoRewrite 가 host 를 :3000 으로 되돌려 주므로
   * 동일 출처가 되어 fetch 가 따라간 최종 URL 을 읽을 수 있다
   * (vite.config.js 의 /auth-login 참고).
   *
   * api 인스턴스가 아니라 fetch 인 이유: 세션 쿠키를 주고받아야 하고(credentials),
   * axios 인터셉터의 Bearer 주입·401 처리가 여기서는 방해가 된다.
   *
   * @throws {Error} 자격증명이 틀렸을 때
   */
  async login(username, password) {
    const body = new URLSearchParams({ username, password })

    const res = await fetch('/auth-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      credentials: 'include'
    })

    if (res.url.includes('error')) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
    }
  },

  // OAuth2 Authorization Code -> Access Token 교환
  // CLIENT_SECRET_BASIC: Authorization 헤더에 client_id:client_secret을 Base64로 인코딩
  //
  // 상대 경로를 쓴다. 절대 URL(VITE_API_BASE_URL)로 보내면 dev 프록시를 우회해
  // 게이트웨이가 localhost:3000 을 CORS 로 허용해 줘야만 동작한다.
  // 프록시(vite.config.js 의 /oauth2)를 태우면 동일 출처라 CORS 자체가 없다.
  //
  // api 인스턴스가 아니라 raw axios 인 이유: 요청 인터셉터가 Bearer 를 덮어쓰는데
  // 이 호출은 Basic 인증이라 그러면 안 된다.
  exchangeCode(code) {
    const clientId = import.meta.env.VITE_CLIENT_ID
    const clientSecret = import.meta.env.VITE_CLIENT_SECRET
    const redirectUri = import.meta.env.VITE_REDIRECT_URI
    const credentials = btoa(`${clientId}:${clientSecret}`)

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    })

    return axios.post(
      '/oauth2/token',
      body.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`
        }
      }
    )
  },

  // 내 정보 조회
  getMe() {
    return api.get('/api/users/me')
  },

  // 회원가입
  register(data) {
    return api.post('/api/users/register', data)
  }
}