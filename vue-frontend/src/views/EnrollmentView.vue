<template>
  <div class="page-wrapper">
    <div class="page-layout">
      <AppSidebar />

      <main class="main-content">
        <h1 class="page-title">내 수강 목록</h1>

        <div v-if="loading" class="loading-center">
          <div class="spinner"></div>
        </div>

        <div v-else-if="loadError" class="error-state" role="alert">
          <p class="error-title">수강 목록을 불러오지 못했습니다.</p>
          <p class="error-detail">{{ loadError }}</p>
          <button type="button" class="btn btn-primary" @click="loadEnrollments">
            다시 시도
          </button>
        </div>

        <div v-else-if="enrollments.length" class="enrollment-list fade-in">
          <div v-for="item in enrollments" :key="item.id" class="enrollment-card">
            <div class="enroll-thumb" :class="getThumbBg(item.course)">
              <img :src="getThumbSrc(item.course)" :alt="item.course?.title" />
            </div>

            <div class="enroll-info">
              <span class="badge" :class="getBadge(item.course)">
                {{ item.course?.category }}
              </span>
              <h3 class="enroll-title">{{ item.course?.title }}</h3>
              <p class="enroll-instructor">강사: {{ item.course?.instructorName }}</p>
            </div>

            <div class="enroll-status">
              <span
                :class="[
                  'status-badge',
                  item.status === 'ACTIVE' ? 'status-active' : 'status-pending'
                ]"
              >
                {{ item.status === 'ACTIVE' ? '수강 중' : '대기 중' }}
              </span>
              <router-link :to="`/courses/${item.courseId}`" class="btn btn-ghost btn-sm">
                강의 보기
              </router-link>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <p class="empty-icon" aria-hidden="true">📭</p>
          <p>수강 중인 강의가 없습니다.</p>
          <router-link to="/courses" class="btn btn-primary" style="margin-top:16px;">
            강의 둘러보기
          </router-link>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import { enrollmentApi } from '@/api/enrollment.js'
import { useAuthStore } from '@/store/auth.js'
import { getCategoryConfig } from '@/store/course.js'

const router = useRouter()
const auth = useAuthStore()

const enrollments = ref([])
const loading = ref(true)
const loadError = ref(null)

const isInstructor = computed(() => auth.user?.role === 'INSTRUCTOR')

// 카테고리 설정은 store 의 CATEGORY_CATALOG 단일 진실원에서 가져온다
function getThumbBg(course) {
  return getCategoryConfig(course?.categoryCode || course?.category).thumbBg
}

function getBadge(course) {
  return getCategoryConfig(course?.categoryCode || course?.category).badge
}

function getThumbSrc(course) {
  const key =
    course?.thumbnail ||
    getCategoryConfig(course?.categoryCode || course?.category).thumb
  if (!key) return ''
  try {
    return new URL(`../assets/images/courses/${key}.png`, import.meta.url).href
  } catch {
    return ''
  }
}


async function loadEnrollments() {
  loading.value = true
  loadError.value = null

  try {
    const res = await enrollmentApi.getMyEnrollments()

    if (Array.isArray(res.data?.data)) {
      enrollments.value = res.data.data
    } else if (Array.isArray(res.data)) {
      enrollments.value = res.data
    } else {
      enrollments.value = []
    }
  } catch (e) {
    /*
     * 원본은 여기서 enrollments = [] 로만 만들어서
     * 네트워크 실패가 '수강 중인 강의가 없습니다' 빈 상태로 렌더됐다.
     * 사용자가 '데이터 없음'과 '고장'을 구분할 수 없다.
     */
    console.error('[EnrollmentView] failed to load enrollments:', e)
    loadError.value = e.message || '알 수 없는 오류'
    enrollments.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 강사는 이 페이지 접근 불가 → 마이페이지로 이동
  if (isInstructor.value) {
    router.replace('/mypage')
    return
  }
  loadEnrollments()
})
</script>

<style scoped>
.error-state {
  text-align: center;
  padding: 64px 24px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-danger-border);
  border-radius: var(--radius-lg);
}

.error-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-danger);
  margin-bottom: 6px;
}

.error-detail {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 20px;
}

.page-wrapper {
  min-height: 100vh;
  background: var(--color-bg-secondary);
}

.page-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 28px;
}


.main-content {
  min-width: 0;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 24px;
}

.enrollment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.enrollment-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  transition: var(--transition);
}

.enrollment-card:hover {
  box-shadow: var(--shadow-sm);
}

.enroll-thumb {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.enroll-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
}


.enroll-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.enroll-title {
  font-size: 15px;
  font-weight: 600;
}

.enroll-instructor {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.enroll-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background: var(--color-success-light);
  color: var(--color-success);
}

.status-pending {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.btn-sm {
  padding: 7px 14px;
  font-size: 13px;
}

.empty-state {
  text-align: center;
  padding: 80px 0;
  color: var(--color-text-muted);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>