import api from './index.js'
import axios from 'axios'

export const authApi = {
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