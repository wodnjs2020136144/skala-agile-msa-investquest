/**
 * 목 데이터 모드 스위치의 단일 진실원.
 *
 * .env 의 VITE_USE_MOCK 이 실제 값이고, 이 파일은 그것을 읽는 유일한 곳이다.
 * 원래 api/game.js 와 store/auth.js 가 같은 한 줄을 각자 선언하고 있었다.
 * 판정 방식(문자열 'true' 비교)이 갈라지면 화면과 API 가 서로 다른 모드로
 * 동작하게 되므로 한 곳으로 모은다.
 *
 * true  = src/mock/ 의 목 데이터 + 목 로그인. 백엔드 없이 동작
 * false = 실제 API Gateway(8080) + OAuth2 로그인
 */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
