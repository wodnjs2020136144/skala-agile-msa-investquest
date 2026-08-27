/**
 * 목 데이터 모드 스위치의 단일 진실원.
 *
 * `.env` 의 `VITE_USE_MOCK` 이 기본값이고, 이 파일은 그것을 읽는 유일한 곳이다.
 * 원래 api/game.js 와 store/auth.js 가 같은 한 줄을 각자 선언하고 있었다.
 * 판정 방식(문자열 'true' 비교)이 갈라지면 화면과 API 가 서로 다른 모드로
 * 동작하게 되므로 한 곳으로 모은다.
 *
 * true  = src/mock/ 의 목 데이터 + 목 로그인. 백엔드 없이 동작
 * false = 실제 API Gateway(8080) + OAuth2 로그인
 *
 * ── 시연용 런타임 오버라이드 ──────────────────────────────────
 * `VITE_USE_MOCK` 은 빌드 시점에 값이 박히는 환경변수라 배포된 화면에서는 바꿀 수 없다.
 * 발표 중에 목/실 API 를 오가려면 `.env` 를 고치고 다시 띄워야 하는데 그럴 시간이 없다.
 * 그래서 localStorage 값이 있으면 그것이 환경변수를 이긴다.
 *
 * 오버라이드는 **브라우저에 저장되고 새로고침해도 남는다.** 시연이 끝나면
 * 토글로 되돌리거나 `clearUseMock()` 으로 지운다.
 */
const STORAGE_KEY = 'iq-use-mock'

/** .env 가 정한 기본값 */
export const USE_MOCK_DEFAULT = import.meta.env.VITE_USE_MOCK === 'true'

/**
 * localStorage 오버라이드를 읽는다.
 * 시크릿 창·저장소 차단 환경에서는 접근 자체가 예외를 던지므로 감싼다.
 *
 * @returns {boolean|null} 저장된 값이 없으면 null
 */
function readOverride() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw === null ? null : raw === 'true'
  } catch {
    return null
  }
}

const override = readOverride()

/** 오버라이드가 걸려 있는가 — 화면에 "환경변수와 다르다"고 알릴 때 쓴다 */
export const USE_MOCK_OVERRIDDEN = override !== null

export const USE_MOCK = override ?? USE_MOCK_DEFAULT

/**
 * 모드를 바꾸고 새로고침한다.
 *
 * 새로고침하는 이유: USE_MOCK 은 모듈 로드 시점에 한 번 정해지는 상수이고,
 * 이미 만들어진 스토어에는 이전 모드의 데이터(목 participationId 등)가 남아 있다.
 * 값만 바꾸면 목 세션 위에 실 API 응답이 얹혀 추적하기 어려운 상태가 된다.
 */
export function setUseMock(value) {
  try {
    localStorage.setItem(STORAGE_KEY, String(Boolean(value)))
  } catch {
    // 저장소를 못 쓰면 오버라이드도 못 한다. 새로고침해도 .env 값으로 돌아간다.
  }
  window.location.reload()
}

/** 오버라이드를 지우고 .env 기본값으로 되돌린다 */
export function clearUseMock() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // 지울 것이 없다
  }
  window.location.reload()
}
