/**
 * 목 응답 유틸.
 *
 * 백엔드 API가 아직 없어 Sprint1 프런트를 목으로 완주한다
 * (docs/04_팀-미확정_논의점.md 안건 1-4 기본값 = "Mock 선행").
 *
 * 응답 형태는 기획 초안 §14가 제안한 { data, message } 래핑을 따른다.
 * ⚠️ 이 형식은 아직 합의 전이다 (안건 2-5). 실 API가 래핑하지 않더라도
 *    api/index.js 를 거치는 코드가 `res.data.data ?? res.data` 로 이미 방어하므로
 *    양쪽 모두 동작한다.
 */

/** 네트워크 지연을 흉내 내 로딩 UI가 실제로 보이게 한다 */
const LATENCY_MS = 300

export function wrap(data, message = '성공') {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data: { data, message } }), LATENCY_MS)
  })
}

export function wrapError(status, message) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      const err = new Error(message)
      err.response = { status, data: { message } }
      reject(err)
    }, LATENCY_MS)
  })
}
