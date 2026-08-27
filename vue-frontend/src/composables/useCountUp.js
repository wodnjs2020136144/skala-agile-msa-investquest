import { ref, onBeforeUnmount } from 'vue'

/**
 * 숫자 롤업.
 *
 * 결과·리워드 화면의 "수익" 케이스에서만 쓴다. 손실 숫자가 차오르는 연출은
 * 질책처럼 읽히므로 손실 쪽에서는 호출하지 않는다.
 *
 * ⚠️ global.css 의 전역 `prefers-reduced-motion` 블록은 CSS 애니메이션만 잡는다.
 *    JS 로 도는 이 카운트는 거기서 걸리지 않으므로 직접 확인해 즉시 최종값을 준다.
 */
export function useCountUp(duration = 900) {
  const value = ref(0)
  let raf = null
  let safety = null

  const reduced = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

  /** 감속 — 끝에서 부드럽게 멈춘다 */
  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3)
  }

  function stop() {
    if (raf !== null) {
      cancelAnimationFrame(raf)
      raf = null
    }
    if (safety !== null) {
      clearTimeout(safety)
      safety = null
    }
  }

  /**
   * 0 에서 target 까지 올린다.
   * @param {number} target 최종값
   */
  function start(target) {
    stop()
    const to = Number(target) || 0

    // 배경 탭에서는 requestAnimationFrame 이 아예 돌지 않는다.
    // 그대로 두면 숫자가 0 에 멈춰 "+0.00%" 를 결과로 보여 주게 된다.
    const hidden = typeof document !== 'undefined' && document.hidden

    if (reduced || hidden || to === 0) {
      value.value = to
      return
    }

    const t0 = performance.now()
    const step = (now) => {
      const p = Math.min(1, (now - t0) / duration)
      value.value = to * easeOut(p)
      if (p < 1) {
        raf = requestAnimationFrame(step)
      } else {
        // 마지막 프레임은 정확한 값으로 맞춘다 — 보간 오차가 남으면 안 된다
        value.value = to
        raf = null
      }
    }
    raf = requestAnimationFrame(step)

    /*
     * 안전망 — 애니메이션이 끝났어야 할 시각에도 값이 남아 있으면 최종값으로 스냅한다.
     * 탭이 도중에 배경으로 내려가면 rAF 가 멈춰 그 프레임 값에서 굳는데,
     * 틀린 숫자가 화면에 남는 것이 애니메이션이 끊기는 것보다 나쁘다.
     */
    safety = setTimeout(() => {
      stop()
      value.value = to
    }, duration + 150)
  }

  onBeforeUnmount(stop)

  return { value, start, reduced }
}
