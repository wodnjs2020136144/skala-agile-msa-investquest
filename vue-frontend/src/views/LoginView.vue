<template>
  <div class="login-page">
    <div class="login-layout">
      <!-- 좌측 브랜딩 -->
      <div class="login-left">
        <div class="brand">
          <img src="@/assets/images/logo/main_logo.png" alt="InvestQuest" class="brand-logo" />
          <span class="brand-name">InvestQuest</span>
        </div>
        <div class="brand-content">
          <h2>게임으로 알아보는<br>나의 투자 성향</h2>
          <p>로그인하고 가상 투자 게임에 참여해 보세요.</p>
          <ul class="feature-list">
            <li v-for="f in features" :key="f">
              <span class="dot"></span>{{ f }}
            </li>
          </ul>
        </div>
      </div>

      <!-- 우측 -->
      <div class="login-right">
        <div class="login-box fade-in-up">
          <router-link to="/" class="back-link">← 홈으로</router-link>

          <!-- 로그인 영역 -->
          <div v-if="!showRegister" class="section">
            <h3 class="section-title">로그인</h3>
            <p class="section-desc">InvestQuest 계정으로 로그인합니다.</p>

            <!--
              목 모드에서는 자격증명이 의미가 없다. 입력칸을 두면 검증하는 척이 되므로
              버튼 하나만 둔다. 실 모드는 아래 폼을 쓴다.
            -->
            <button v-if="MOCK.auth" class="btn btn-primary btn-full" @click="handleMockLogin">
              로그인
            </button>

            <!--
              auth-server 는 소스가 없어 기본 로그인 페이지를 고칠 수 없다.
              그래서 여기서 자격증명을 받아 Spring Security 의 폼 로그인으로 보낸다
              (store/auth.js 의 loginWithPassword). 회원가입 폼과 같은 클래스를 써서
              두 화면의 서체·간격·포커스 링이 어긋나지 않게 한다.
            -->
            <form v-else @submit.prevent="handleLogin" class="form">
              <div class="form-group">
                <label class="form-label" for="login-email">이메일</label>
                <input
                  id="login-email"
                  v-model="loginForm.email"
                  type="email"
                  class="form-input"
                  placeholder="user@example.com"
                  autocomplete="username"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="login-password">비밀번호</label>
                <input
                  id="login-password"
                  v-model="loginForm.password"
                  type="password"
                  class="form-input"
                  placeholder="비밀번호"
                  autocomplete="current-password"
                  required
                />
              </div>
              <div v-if="error" class="error-msg">{{ error }}</div>
              <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
                <span v-if="loading">로그인 중...</span>
                <span v-else>로그인</span>
              </button>
            </form>

            <div class="switch-link">
              계정이 없으신가요?
              <button class="text-btn" @click="switchTo(true)">회원가입</button>
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
              <button class="text-btn" @click="switchTo(false)">로그인</button>
            </div>
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
import { MOCK } from '@/config.js'

const auth = useAuthStore()

const showRegister = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref('')

const loginForm = ref({ email: '', password: '' })
const registerForm = ref({ name: '', email: '', password: '', role: 'STUDENT' })

const features = ['가상 자금으로 하는 모의 투자', '행동 기반 투자 성향 분석', '참여 리워드 지급']

const route = useRoute()

/**
 * 로그인 후 돌아갈 곳.
 * 라우터 가드가 넘겨 준 원래 목적지다 — 게임 URL 을 직접 열었다가
 * 로그인으로 튕긴 경우가 여기에 해당한다.
 */
const backTo = () => route.query.redirect || '/'

/** 로그인 ↔ 회원가입 전환. 남아 있던 오류·안내 문구를 지운다 */
function switchTo(register) {
  showRegister.value = register
  error.value = ''
  success.value = ''
}

/** 목 모드 — 자격증명 없이 가짜 사용자로 들어간다 */
function handleMockLogin() {
  auth.redirectToLogin(backTo())
}

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    // 성공하면 OAuth 리다이렉트가 걸려 이 페이지를 떠난다.
    // 그래서 finally 의 loading=false 는 실패했을 때만 의미가 있다.
    await auth.loginWithPassword(loginForm.value.email, loginForm.value.password, backTo())
  } catch (e) {
    error.value = e.message || '로그인에 실패했습니다.'
    loading.value = false
  }
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
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: stretch;
}
.login-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  min-height: 100vh;
}
.login-left {
  background: var(--gradient-brand);
  padding: 48px;
  display: flex;
  flex-direction: column;
  gap: 48px;
  position: relative;
  overflow: hidden;
  border-right: 1px solid var(--color-border);
}
.login-left::after {
  content: none;
}
.brand { display: flex; align-items: center; gap: 10px; }
.brand-logo { width: 40px; height: 40px; border-radius: 10px; object-fit: contain; }
.brand-name { font-size: 18px; font-weight: 700; color: var(--color-text-primary); }
.brand-content h2 {
  font-size: 32px; font-weight: 700; color: var(--color-text-primary);
  line-height: 1.35; margin-bottom: 14px;
}
.brand-content p { font-size: 15px; color: var(--color-text-secondary); margin-bottom: 28px; }
.feature-list { list-style: none; display: flex; flex-direction: column; gap: 12px; }
.feature-list li { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--color-text-secondary); }
.dot { width: 7px; height: 7px; border-radius: 50%; background: var(--color-primary); flex-shrink: 0; }

.login-right {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: var(--color-bg-secondary);
}
.login-box {
  width: 100%;
  max-width: 420px;
  padding: 34px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-bg-primary);
  box-shadow: none;
}
.back-link {
  display: inline-block;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
  transition: var(--transition);
}
.back-link:hover { color: var(--color-primary); }

.section { display: flex; flex-direction: column; gap: 16px; }
.section-title { font-size: 22px; font-weight: 700; color: var(--color-text-primary); margin-bottom: 4px; }
.section-desc { font-size: 14px; color: var(--color-text-secondary); margin-bottom: 4px; }

.form { display: flex; flex-direction: column; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 500; color: var(--color-text-secondary); }
.form-input {
  padding: 10px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-family: var(--font-sans);
  color: var(--color-text-primary);
  background: var(--color-bg-tertiary);
  transition: var(--transition);
  outline: none;
}
.form-input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-light); }
/*
  크롬 자동완성이 파란 배경과 검은 글자를 강제로 덮어씌운다. 다크 모드에서는 글자가
  배경에 묻히고, 라이트 모드에서도 다른 입력칸과 색이 달라진다.
  background-color 는 !important 로도 못 이기므로 inset 그림자로 칠하고
  글자색은 -webkit-text-fill-color 로 되돌린다.
*/
.form-input:-webkit-autofill,
.form-input:-webkit-autofill:hover,
.form-input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 100px var(--color-bg-tertiary) inset;
  -webkit-text-fill-color: var(--color-text-primary);
  caret-color: var(--color-text-primary);
  transition: background-color 9999s ease-in-out 0s;
}
.form-input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 100px var(--color-bg-tertiary) inset, 0 0 0 3px var(--color-primary-light);
}
.btn-full { width: 100%; padding: 12px; font-size: 15px; justify-content: center; margin-top: 4px; }

.switch-link {
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}
.text-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 0 2px;
  text-decoration: underline;
}
.error-msg {
  padding: 10px 14px;
  background: var(--color-danger-light);
  border: 1px solid var(--color-danger-border);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--color-danger);
}
.success-msg {
  padding: 10px 14px;
  background: var(--color-success-light);
  border: 1px solid var(--color-success-border);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--color-success);
}

@media (max-width: 800px) {
  .login-layout { grid-template-columns: 1fr; }
  .login-left { display: none; }
  .login-right { padding: 24px; }
}
</style>
