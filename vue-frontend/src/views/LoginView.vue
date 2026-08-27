<template>
  <div class="login-page">
    <div class="login-col fade-in-up">
      <router-link to="/" class="back-link">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        홈으로
      </router-link>

      <!-- 브랜딩 — 원래 좌측 패널에 있던 카피를 그대로 옮겼다 -->
      <div class="brand">
        <img src="@/assets/images/logo/main_logo.png" alt="InvestQuest" class="brand-logo" />
        <span class="brand-name">InvestQuest</span>
      </div>
      <div class="brand-content">
        <h2>게임으로 알아보는<br>나의 투자 성향</h2>
        <p>로그인하고 가상 투자 게임에 참여해 보세요.</p>
        <ul class="feature-list">
          <li v-for="f in features" :key="f">
            <svg class="check" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            {{ f }}
          </li>
        </ul>
      </div>

      <div class="login-box">
        <!-- 로그인 영역 -->
        <div v-if="!showRegister" class="section">
          <h3 class="section-title">로그인</h3>
          <p class="section-desc">InvestQuest 계정으로 로그인합니다.</p>
          <button class="btn btn-primary btn-full" @click="handleOAuth">로그인</button>
          <div class="switch-link">
            계정이 없으신가요?
            <button class="text-btn" @click="showRegister = true">회원가입</button>
          </div>
        </div>

        <!-- 회원가입 영역 -->
        <div v-else class="section">
          <h3 class="section-title">회원가입</h3>
          <form @submit.prevent="handleRegister" class="form">
            <div class="form-group">
              <label class="form-label">이름</label>
              <input v-model="registerForm.name" type="text" class="form-input" placeholder="홍길동" required />
            </div>
            <div class="form-group">
              <label class="form-label">이메일</label>
              <input v-model="registerForm.email" type="email" class="form-input" placeholder="user@example.com" required />
            </div>
            <div class="form-group">
              <label class="form-label">비밀번호</label>
              <input v-model="registerForm.password" type="password" class="form-input" placeholder="8자 이상" required />
            </div>
            <div class="form-group">
              <label class="form-label">역할</label>
              <select v-model="registerForm.role" class="form-input">
                <option value="STUDENT">학생</option>
                <option value="INSTRUCTOR">강사</option>
              </select>
            </div>
            <div v-if="error" class="error-msg">{{ error }}</div>
            <div v-if="success" class="success-msg">{{ success }}</div>
            <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
              <span v-if="loading">가입 중...</span>
              <span v-else>회원가입</span>
            </button>
          </form>
          <div class="switch-link">
            이미 계정이 있으신가요?
            <button class="text-btn" @click="showRegister = false">로그인</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth.js'
import { authApi } from '@/api/auth.js'

const auth = useAuthStore()

const showRegister = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref('')

const registerForm = ref({ name: '', email: '', password: '', role: 'STUDENT' })

const features = ['가상 자금으로 하는 모의 투자', '행동 기반 투자 성향 분석', '참여 리워드 지급']

const route = useRoute()

function handleOAuth() {
  // 라우터 가드가 넘겨 준 원래 목적지로 돌려보낸다.
  // 게임 URL 을 직접 열었다가 로그인으로 튕긴 경우가 여기에 해당한다.
  auth.redirectToLogin(route.query.redirect || '/')
}

async function handleRegister() {
  error.value = ''
  success.value = ''
  loading.value = true
  try {
    await authApi.register(registerForm.value)
    success.value = '회원가입 완료! 로그인 페이지로 이동합니다.'
    registerForm.value = { name: '', email: '', password: '', role: 'STUDENT' }
    setTimeout(() => {
      showRegister.value = false
      success.value = ''
    }, 2000)
  } catch (e) {
    error.value = e.response?.data?.message || '회원가입에 실패했습니다.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 스플릿 화면 대신 흰 바닥 위 단일 컬럼 — 토스 앱의 인증 화면은 카드 없이 흰 바탕에 폼만 둔다 */
.login-page {
  min-height: 100dvh;
  background: var(--surface);
  padding: var(--space-6) var(--space-5) var(--space-10);
}
.login-col {
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}
.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  align-self: flex-start;
  font-size: var(--fs-14);
  font-weight: var(--fw-semibold);
  color: var(--text);
  margin-left: -4px;
}
.back-link:hover { color: var(--text-strong); }
.brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.brand-logo {
  width: 32px;
  height: 32px;
  border-radius: var(--r-8);
  object-fit: contain;
}
.brand-name {
  font-size: var(--fs-17);
  font-weight: var(--fw-bold);
  letter-spacing: var(--tracking-title);
  color: var(--text-strong);
}
.brand-content h2 {
  font-size: var(--fs-28);
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
  letter-spacing: var(--tracking-title);
  color: var(--text-strong);
  margin: 0 0 var(--space-3);
}
.brand-content p {
  font-size: var(--fs-15);
  line-height: var(--lh-loose);
  color: var(--text);
  margin: 0 0 var(--space-5);
}
.feature-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.feature-list li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--fs-15);
  color: var(--text-strong);
}
.check { flex-shrink: 0; color: var(--brand); }

.login-box {
  padding-top: var(--space-6);
  border-top: 1px solid var(--line);
}
.section-title {
  font-size: var(--fs-20);
  font-weight: var(--fw-bold);
  color: var(--text-strong);
  margin: 0 0 var(--space-1);
}
.section-desc {
  font-size: var(--fs-14);
  color: var(--text);
  margin: 0 0 var(--space-5);
}
.btn-full {
  width: 100%;
  height: var(--cta-h);
  border-radius: var(--r-16);
  font-size: var(--fs-17);
  font-weight: var(--fw-bold);
}
.switch-link {
  margin-top: var(--space-5);
  text-align: center;
  font-size: var(--fs-14);
  color: var(--text);
  display: flex;
  justify-content: center;
  gap: var(--space-2);
}

/* 인풋 — 테두리 없이 한 단 낮은 면, 포커스에만 브랜드 링 */
.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.form-label {
  font-size: var(--fs-13);
  font-weight: var(--fw-semibold);
  color: var(--text);
}
.form-input {
  width: 100%;
  height: 52px;
  padding: 0 var(--space-4);
  border: none;
  border-radius: var(--r-12);
  background: var(--fill-weak);
  color: var(--text-strong);
  font-size: 16px; /* iOS 자동 줌 방지 */
  transition: box-shadow var(--dur) var(--ease), background-color var(--dur) var(--ease);
}
.form-input::placeholder { color: var(--text-weak); }
/* 브라우저 자동완성의 연파랑 배경을 토큰 면으로 덮는다 */
.form-input:-webkit-autofill,
.form-input:-webkit-autofill:hover,
.form-input:-webkit-autofill:focus {
  -webkit-box-shadow: inset 0 0 0 1000px var(--fill-weak);
  -webkit-text-fill-color: var(--text-strong);
  caret-color: var(--text-strong);
}
.form-input:hover { background: var(--fill); }
.form-input:focus {
  outline: none;
  background: var(--surface);
  box-shadow: inset 0 0 0 1.5px var(--brand);
}
select.form-input {
  appearance: none;
  -webkit-appearance: none;
  padding-right: var(--space-9);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238B95A1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--space-4) center;
  background-size: 18px;
}
.error-msg,
.success-msg {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--r-12);
  font-size: var(--fs-14);
  line-height: var(--lh);
}
.error-msg { background: var(--negative-weak); color: var(--negative); }
.success-msg { background: var(--positive-weak); color: var(--positive); }

@media (min-width: 768px) {
  .login-page { padding-top: var(--space-10); }
}
</style>
