<template>
  <div class="home">
    <!-- ── 로그인 홈 ─────────────────────────────────────────── -->
    <section v-if="auth.isAuthenticated" class="signed">
      <div class="signed-inner fade-in-up">
        <p class="welcome">
          <strong>{{ auth.user?.name || '투자자' }}</strong>님, 반갑습니다.
        </p>
        <h1 class="signed-title">최고 수익률에 도전할 준비가 됐나요?</h1>
        <p class="signed-desc">
          제한된 시간 안에 기회와 안정성 사이에서 전략을 세워 보세요.
          수익률을 향한 선택 하나하나가 당신의 투자 성향을 보여 줍니다.
        </p>

        <div class="status-row">
          <span class="status-chip">참여 전</span>
          <span class="status-note">아직 참여한 게임이 없습니다.</span>
        </div>

        <NoticeCard
          class="signed-notice"
          icon="fa-solid fa-circle-info"
          title="시작하기 전에 확인해 주세요"
          :items="noticeItems"
        />

        <router-link to="/game/guide" class="btn btn-primary btn-lg signed-start">
          게임 시작하기
        </router-link>
      </div>
    </section>

    <!-- ── 비로그인 홈 ───────────────────────────────────────── -->
    <template v-else>
      <section class="hero">
        <div class="hero-inner">
          <div class="hero-content fade-in-up">
            <span class="hero-badge">증권사 신규 고객 온보딩</span>
            <h1 class="hero-title">게임으로 알아보는<br />나의 투자 성향</h1>
            <p class="hero-desc">
              제한된 시간 안에 나만의 전략으로 최고 수익률에 도전해 보세요.
              3일 뒤 최종 수익률과 최대 1만원의 리워드를 확인할 수 있습니다.
            </p>
            <div class="hero-actions">
              <router-link to="/login" class="btn btn-primary btn-lg">
                로그인하고 시작하기
              </router-link>
            </div>
            <p class="hero-disclaimer">
              모의 투자이며 실제 투자 수익을 보장하지 않습니다.
            </p>
          </div>

          <div class="hero-visual fade-in" aria-hidden="true">
            <div class="mock-panel">
              <div class="mp-head">
                <span class="mp-title">가상 포트폴리오</span>
                <span class="mp-amount">10,000,000원</span>
              </div>
              <div v-for="row in previewRows" :key="row.name" class="mp-row">
                <span class="mp-name">{{ row.name }}</span>
                <div class="mp-bar">
                  <div class="mp-fill" :style="{ width: row.weight + '%' }"></div>
                </div>
                <span class="mp-weight">{{ row.weight }}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="steps-section">
        <div class="section-inner">
          <h2 class="section-title center">게임은 이렇게 진행됩니다</h2>
          <ol class="steps-grid">
            <li v-for="(s, i) in steps" :key="s.title" class="step-card">
              <span class="step-num">{{ i + 1 }}</span>
              <h3 class="step-title">{{ s.title }}</h3>
              <p class="step-desc">{{ s.desc }}</p>
            </li>
          </ol>
        </div>
      </section>

      <section class="notice-section">
        <div class="section-inner narrow">
          <NoticeCard tone="warn" icon="fa-solid fa-triangle-exclamation" title="안내" :items="legalItems" />
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/store/auth.js'
import NoticeCard from '@/components/game/NoticeCard.vue'

const auth = useAuthStore()

/** 기획 초안 §10 화면 1 — 게임 방식 3단계 소개 */
const steps = [
  { title: ' 규칙 확인', desc: '3일 동안 최고의 수익률을 목표로, 주어진 가상 투자금과 조건을 확인합니다.' },
  { title: '전략 수립과 모의 투자', desc: '기회를 잡을지 현금을 지킬지 판단하며 종목별 투자 비중을 직접 정합니다.' },
  { title: '수익률·성향·리워드 확인', desc: '3일 뒤 최종 수익률과 투자 성향 분석, 최대 1만원의 참여 리워드를 확인합니다.' }
]

/** 기획 초안 §10 화면 2 — 핵심 안내사항 4줄 */
const noticeItems = [
  '게임은 가상의 투자금으로 진행됩니다.',
  '투자 결과는 3일 뒤 확인할 수 있습니다.',
  '참여 리워드는 결과에 따라 최대 1만원이 지급됩니다.',
  '지급된 포인트는 3일 동안 재투자한 후 출금할 수 있습니다.',
  '게임 결과는 실제 수익을 보장하지 않습니다.'
]

/** 발표 기획서 §1-6 준법 제약에서 온 고지 */
const legalItems = [
  '이 게임은 모의 투자이며 실제 매매가 이루어지지 않습니다.',
  '등장하는 종목은 모두 가상이며 실존 기업과 무관합니다.',
  '게임 결과는 참고용 보조 정보이며 공식 투자자 성향 진단을 대체하지 않습니다.'
]

const previewRows = [
  { name: 'IT', weight: 40 },
  { name: '금융', weight: 25 },
  { name: '현금', weight: 35 }
]
</script>

<style scoped>
/* ── 로그인 홈 ───────────────────────────────────────────── */
.signed {
  padding: 64px 24px 80px;
  background: var(--gradient-hero);
  min-height: calc(100vh - 72px);
}

.signed-inner {
  max-width: 640px;
  margin: 0 auto;
  padding: 38px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-bg-primary);
  box-shadow: none;
}

.welcome {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  margin: 0 0 8px;
}

.welcome strong { color: var(--color-primary); }

.signed-title {
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  font-weight: 800;
  line-height: 1.3;
  margin: 0 0 12px;
  color: var(--color-text-primary);
}

.signed-desc {
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin: 0 0 24px;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.status-chip {
  padding: 5px 12px;
  border-radius: 999px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 0.8rem;
  font-weight: 700;
}

.status-note { font-size: 0.85rem; color: var(--color-text-muted); }

.signed-notice { margin-top: 28px; }
.signed-start {
  width: 100%;
  min-height: 48px;
  justify-content: center;
  margin-top: 14px;
}

/* ── 비로그인 히어로 ─────────────────────────────────────── */
.hero {
  background: var(--gradient-hero);
  padding: 88px 24px 82px;
}

.hero-inner {
  max-width: 1120px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 48px;
  align-items: center;
}

.hero-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 0.78rem;
  font-weight: 700;
  margin-bottom: 18px;
  border: 1px solid var(--color-border);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  line-height: 1.25;
  margin: 0 0 16px;
  color: var(--color-text-primary);
  letter-spacing: -0.045em;
}

.hero-desc {
  font-size: 1.05rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin: 0 0 28px;
}

.hero-actions { margin-bottom: 16px; }

.hero-disclaimer {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  margin: 0;
}

/* 히어로 시각 요소 — 배분 화면을 미리 보여 준다 */
.mock-panel {
  position: relative;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: none;
  padding: 28px;
  overflow: hidden;
}

.mock-panel::before {
  content: 'PORTFOLIO SIMULATION';
  display: block;
  margin-bottom: 18px;
  color: var(--color-primary);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.mp-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-bottom: 14px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.mp-title { font-size: 0.85rem; color: var(--color-text-secondary); font-weight: 600; }
.mp-amount {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

.mp-row {
  display: grid;
  grid-template-columns: 48px 1fr 40px;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.mp-row:last-child { margin-bottom: 0; }
.mp-name { font-size: 0.82rem; color: var(--color-text-secondary); }

.mp-bar {
  height: 8px;
  background: var(--color-bg-tertiary);
  border-radius: 999px;
  overflow: hidden;
}

.mp-fill { height: 100%; background: var(--color-primary); border-radius: 999px; }

.mp-weight {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text-primary);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* ── 3단계 소개 ──────────────────────────────────────────── */
.steps-section { padding: 72px 24px; }
.notice-section { padding: 0 24px 72px; }

.section-inner { max-width: 1120px; margin: 0 auto; }
.section-inner.narrow { max-width: 720px; }

.section-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-text-primary);
  margin: 0 0 36px;
}

.section-title.center { text-align: center; }

.steps-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.step-card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 26px 22px;
  transition: var(--transition);
}

.step-card:hover {
  border-color: var(--color-border-hover);
  background: var(--color-bg-tertiary);
}

.step-num {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: 800;
  margin-bottom: 14px;
  box-shadow: none;
}

.step-title {
  font-size: 1.02rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--color-text-primary);
}

.step-desc {
  font-size: 0.88rem;
  line-height: 1.65;
  color: var(--color-text-secondary);
  margin: 0;
}

/* 공통 버튼 크기 — global.css 의 .btn 을 확장한다 */
.btn-lg { padding: 13px 28px; font-size: 1rem; }

@media (max-width: 860px) {
  .hero-inner { grid-template-columns: 1fr; gap: 36px; }
  .hero { padding: 48px 20px; }
  .hero-visual { order: -1; }
}

@media (max-width: 480px) {
  .signed { padding: 40px 18px 60px; }
  .steps-section { padding: 48px 18px; }
  .btn-lg { width: 100%; justify-content: center; }
}
</style>
