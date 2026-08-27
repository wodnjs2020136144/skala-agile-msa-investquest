<template>
  <!--
    시연용 목/실 API 토글.

    발표 중에 "이건 목 데이터고, 플래그 하나만 끄면 실 API 로 갑니다"를
    말로만 하지 않고 그 자리에서 보여 주기 위한 것이다.
    .env 를 고치고 서버를 다시 띄우는 대신 localStorage 오버라이드를 쓴다.

    화면 구석에 고정하되 제품 UI 로 오해되지 않게 점선 테두리와 'DEMO' 라벨을 붙였다.
  -->
  <div class="mock-toggle" :class="{ open }">
    <button
      type="button"
      class="mt-badge"
      :class="USE_MOCK ? 'is-mock' : 'is-live'"
      :aria-expanded="open"
      aria-label="데이터 소스 전환 패널 열기"
      @click="open = !open"
    >
      <span class="mt-dot" aria-hidden="true"></span>
      <!-- 좁은 화면에서는 라벨을 접는다. 상태는 점 색으로 남는다 -->
      <span class="mt-label">{{ USE_MOCK ? 'MOCK' : 'LIVE' }}</span>
    </button>

    <div v-if="open" class="mt-panel">
      <p class="mt-title">
        <span class="mt-tag">DEMO</span>
        데이터 소스
      </p>

      <div class="mt-options" role="radiogroup" aria-label="데이터 소스">
        <button
          type="button"
          class="mt-opt"
          :class="{ active: USE_MOCK }"
          role="radio"
          :aria-checked="USE_MOCK"
          @click="choose(true)"
        >
          <strong>목 데이터</strong>
          <span>백엔드 없이 동작</span>
        </button>
        <button
          type="button"
          class="mt-opt"
          :class="{ active: !USE_MOCK }"
          role="radio"
          :aria-checked="!USE_MOCK"
          @click="choose(false)"
        >
          <strong>실 API</strong>
          <span>Gateway(8080) + OAuth2</span>
        </button>
      </div>

      <!-- 실 API 로 넘어가면 게이트웨이·auth-server 가 떠 있어야 한다. 미리 알린다. -->
      <p v-if="USE_MOCK" class="mt-warn">
        실 API 로 바꾸면 api-gateway(8080)와 auth-server(9000)가 떠 있어야 합니다.
      </p>

      <p class="mt-state">
        <template v-if="USE_MOCK_OVERRIDDEN">
          이 브라우저에만 저장된 설정입니다 (.env 기본값: {{ USE_MOCK_DEFAULT ? '목' : '실 API' }})
          <button type="button" class="mt-reset" @click="clearUseMock()">기본값으로</button>
        </template>
        <template v-else>.env 기본값을 쓰는 중입니다.</template>
      </p>

      <p class="mt-note">바꾸면 화면을 새로 불러옵니다. 진행 중인 게임은 초기화됩니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { USE_MOCK, USE_MOCK_DEFAULT, USE_MOCK_OVERRIDDEN, setUseMock, clearUseMock } from '@/config.js'

const open = ref(false)

function choose(value) {
  // 같은 값을 다시 고르면 새로고침만 하게 되므로 막는다
  if (value === USE_MOCK) {
    open.value = false
    return
  }
  setUseMock(value)
}
</script>

<style scoped>
.mock-toggle {
  position: fixed;
  left: 16px;
  bottom: 16px;
  z-index: 900;
  display: grid;
  gap: 8px;
  justify-items: start;
  font-size: 0.78rem;
}

.mt-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px dashed var(--color-border-hover);
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  cursor: pointer;
  box-shadow: var(--shadow-md);
}

.mt-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-text-muted);
}

.mt-badge.is-mock .mt-dot { background: var(--color-warning); }
.mt-badge.is-live .mt-dot { background: var(--color-success); }

.mt-panel {
  width: 268px;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  box-shadow: var(--shadow-lg);
  /* 배지 위로 열린다 — grid 순서상 패널이 뒤라 order 로 올린다 */
  order: -1;
}

.mt-title {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 10px;
  color: var(--color-text-primary);
  font-size: 0.82rem;
  font-weight: 800;
}

.mt-tag {
  padding: 3px 6px;
  border-radius: 4px;
  background: var(--color-bg-secondary);
  color: var(--color-text-muted);
  font-size: 0.6rem;
  letter-spacing: 0.08em;
}

.mt-options { display: grid; gap: 6px; }

.mt-opt {
  display: grid;
  gap: 2px;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
  text-align: left;
  cursor: pointer;
}

.mt-opt strong { color: var(--color-text-primary); font-size: 0.82rem; }
.mt-opt span { color: var(--color-text-muted); font-size: 0.72rem; }

.mt-opt.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.mt-opt.active strong { color: var(--color-primary); }

.mt-warn {
  margin: 10px 0 0;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  background: var(--color-warning-light);
  color: var(--color-text-secondary);
  font-size: 0.7rem;
  line-height: 1.5;
}

.mt-state {
  margin: 10px 0 0;
  color: var(--color-text-secondary);
  font-size: 0.7rem;
  line-height: 1.5;
}

.mt-reset {
  margin-left: 4px;
  border: 0;
  background: transparent;
  color: var(--color-primary);
  font-size: 0.7rem;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}

.mt-note {
  margin: 6px 0 0;
  color: var(--color-text-muted);
  font-size: 0.68rem;
  line-height: 1.45;
}

@media (max-width: 560px) {
  .mock-toggle { left: 12px; bottom: 12px; }
  .mt-panel { width: calc(100vw - 24px); max-width: 268px; }

  /*
   * 모바일에서는 본문이 화면 끝까지 차서 라벨이 붙은 배지가 목록 위를 덮는다.
   * 점만 남겨 가리는 면적을 줄인다 — 상태는 점 색(주황=목 / 초록=실 API)으로 읽힌다.
   */
  .mt-label { display: none; }
  .mt-badge { gap: 0; padding: 9px; }
}
</style>
