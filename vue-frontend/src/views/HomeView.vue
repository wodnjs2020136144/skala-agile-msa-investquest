<template>
  <div class="home">
    <!-- ── 로그인 홈 ─────────────────────────────────────────── -->
    <section v-if="auth.isAuthenticated" class="signed">
      <div class="signed-inner fade-in-up">
        <p class="welcome">
          <strong>{{ auth.user?.name || '투자자' }}</strong>님, 반갑습니다.
        </p>
        <h1 class="signed-title">오늘의 투자 성향 게임이 준비돼 있어요</h1>
        <p class="signed-desc">
          가상의 상황에서 직접 투자금을 배분해 보세요.
          선택 하나하나가 당신의 투자 성향을 말해 줍니다.
        </p>

        <!-- 참여 상태 카드 — 지금은 '참여 전' 하나뿐이다 -->
        <div class="status-card card card-pad">
          <span class="status-chip">참여 전</span>
          <span class="status-note">아직 참여한 게임이 없습니다.</span>
        </div>

        <NoticeCard
          class="signed-notice"
          title="시작하기 전에 확인해 주세요"
          :items="noticeItems"
        />

        <BottomCta>
          <router-link to="/game/guide" class="btn btn-primary">게임 시작하기</router-link>
        </BottomCta>
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
              가상 투자 게임에 참여하고 3일 뒤 결과와 최대 1만원의 리워드를 확인하세요.
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
            <div class="mock-panel card card-lg">
              <div class="mp-head">
                <span class="mp-title">가상 포트폴리오</span>
                <span class="mp-amount num num-xl">10,000,000원</span>
              </div>
              <div class="mp-rows">
                <div v-for="row in previewRows" :key="row.name" class="mp-row">
                  <span class="mp-name">{{ row.name }}</span>
                  <div class="track">
                    <div class="track-fill" :style="{ width: row.weight + '%' }"></div>
                  </div>
                  <span class="mp-weight num">{{ row.weight }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="steps-section">
        <div class="section-inner">
          <h2 class="section-title">게임은 이렇게 진행됩니다</h2>
          <ol class="steps-grid">
            <li v-for="(s, i) in steps" :key="s.title" class="step-card">
              <span class="step-num num">{{ i + 1 }}</span>
              <div class="step-body">
                <h3 class="step-title">{{ s.title }}</h3>
                <p class="step-desc">{{ s.desc }}</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section class="notice-section">
        <div class="section-inner narrow">
          <NoticeCard tone="warn" icon="⚠️" title="안내" :items="legalItems" />
        </div>
      </section>

      <!-- 데스크톱은 히어로 안 버튼으로 충분하다. 모바일만 하단 고정. -->
      <BottomCta mobile-only>
        <router-link to="/login" class="btn btn-primary">로그인하고 시작하기</router-link>
      </BottomCta>
    </template>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/store/auth.js'
import NoticeCard from '@/components/game/NoticeCard.vue'
import BottomCta from '@/components/ui/BottomCta.vue'

const auth = useAuthStore()

/** 기획 초안 §10 화면 1 — 게임 방식 3단계 소개 */
const steps = [
  { title: '가상 미션 확인', desc: '달 기지행 셔틀 출발 전, 3일간 운용할 가상 투자금을 확인합니다.' },
  { title: '종목 선택과 모의 투자', desc: '제시된 종목과 현금에 투자금을 원하는 대로 나눠 담습니다.' },
  { title: '결과·성향·리워드 확인', desc: '3일 뒤 결과와 투자 성향 분석, 최대 1만원의 참여 리워드를 확인합니다.' }
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
  background: var(--gradient-hero);
  min-height: calc(100dvh - var(--header-h));
}
.signed-inner {
  max-width: var(--content-max);
  margin: 0 auto;
  padding: var(--space-7) var(--space-5) 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.welcome {
  font-size: var(--fs-15);
  color: var(--text);
  margin: 0;
}
.welcome strong { color: var(--text-strong); font-weight: var(--fw-bold); }
.signed-title {
  font-size: var(--fs-28);
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
  letter-spacing: var(--tracking-title);
  color: var(--text-strong);
  margin: 0;
  text-wrap: balance;
}
.signed-desc {
  font-size: var(--fs-15);
  line-height: var(--lh-loose);
  color: var(--text);
  margin: 0 0 var(--space-2);
}
.status-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
}
.status-chip {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 var(--space-3);
  border-radius: var(--r-full);
  background: var(--brand-weak);
  color: var(--brand);
  font-size: var(--fs-13);
  font-weight: var(--fw-bold);
}
.status-note {
  font-size: var(--fs-15);
  color: var(--text);
}

/* ── 비로그인 홈 ─────────────────────────────────────────── */
.hero {
  background: var(--surface);
  padding: var(--space-8) var(--space-5) var(--space-9);
}
.hero-inner {
  max-width: var(--content-max-wide);
  margin: 0 auto;
  display: grid;
  gap: var(--space-8);
  align-items: center;
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 var(--space-3);
  border-radius: var(--r-full);
  background: var(--brand-weak);
  color: var(--brand);
  font-size: var(--fs-13);
  font-weight: var(--fw-bold);
  margin-bottom: var(--space-4);
}
.hero-title {
  font-size: var(--fs-32);
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
  letter-spacing: var(--tracking-title);
  color: var(--text-strong);
  margin: 0 0 var(--space-4);
}
.hero-desc {
  font-size: var(--fs-17);
  line-height: var(--lh-loose);
  color: var(--text);
  margin: 0 0 var(--space-6);
  max-width: 34ch;
}
.hero-actions { display: none; }
.hero-disclaimer {
  font-size: var(--fs-13);
  color: var(--text-weak);
  margin: 0;
}

/* 가짜 포트폴리오 — 이 화면의 주인공 */
.mock-panel {
  padding: var(--space-6);
  background: var(--surface-elevated);
  box-shadow: var(--elev-card), inset 0 0 0 1px var(--line);
}
.mp-head {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-bottom: var(--space-6);
}
.mp-title {
  font-size: var(--fs-13);
  color: var(--text-weak);
  font-weight: var(--fw-medium);
}
.mp-rows {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.mp-row {
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
  gap: var(--space-3);
}
.mp-name {
  font-size: var(--fs-14);
  font-weight: var(--fw-semibold);
  color: var(--text);
}
.mp-weight {
  font-size: var(--fs-14);
  text-align: right;
}

/* 진행 3단계 */
.steps-section {
  padding: var(--space-9) var(--space-5);
}
.section-inner {
  max-width: var(--content-max-wide);
  margin: 0 auto;
}
.section-inner.narrow { max-width: var(--content-max); }
.section-title {
  font-size: var(--fs-24);
  font-weight: var(--fw-bold);
  letter-spacing: var(--tracking-title);
  color: var(--text-strong);
  margin: 0 0 var(--space-6);
}
.steps-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.step-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
}
.step-num {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--brand-weak);
  color: var(--brand);
  font-size: var(--fs-15);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.step-title {
  font-size: var(--fs-17);
  font-weight: var(--fw-bold);
  color: var(--text-strong);
  margin: 4px 0 var(--space-1);
}
.step-desc {
  font-size: var(--fs-14);
  line-height: var(--lh-loose);
  color: var(--text);
  margin: 0;
}
.notice-section {
  padding: 0 var(--space-5) var(--space-9);
}

@media (min-width: 768px) {
  .signed-inner { padding-top: var(--space-10); }
  .signed-title { font-size: var(--fs-32); }
  .hero { padding: var(--space-10) var(--space-6); }
  .hero-inner { grid-template-columns: 1.1fr 1fr; gap: var(--space-10); }
  .hero-title { font-size: 44px; }
  .hero-actions { display: block; margin-bottom: var(--space-4); }
  .hero-actions .btn-lg { height: 56px; padding: 0 var(--space-7); font-size: var(--fs-17); font-weight: var(--fw-bold); border-radius: var(--r-16); }
  .hero-visual { max-width: 440px; justify-self: end; width: 100%; }
  .steps-section { padding: var(--space-10) var(--space-6); }
  .steps-grid { flex-direction: row; gap: var(--space-4); }
  .step-card {
    flex: 1;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-6);
    background: var(--surface);
    border-radius: var(--r-20);
    box-shadow: var(--elev-card);
  }
  .step-title { margin-top: 0; }
}
</style>
