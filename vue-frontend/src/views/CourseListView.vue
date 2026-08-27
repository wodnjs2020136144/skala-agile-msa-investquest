<template>
  <div class="page-wrapper">
    <div class="page-layout">
      <AppSidebar />

      <!-- 메인 -->
      <main class="main-content">
        <div class="content-header">
          <div>
            <h1 class="page-title">강의 목록</h1>
            <p class="page-subtitle" v-if="isInstructor">
              강사 계정으로 등록된 강의를 확인하고 새 강의를 추가할 수 있습니다.
            </p>
          </div>

          <router-link
            v-if="isInstructor"
            to="/courses/new"
            class="btn btn-primary create-course-btn"
          >
            강의 등록
          </router-link>
        </div>

        <!-- 필터 -->
        <div class="filter-bar">
          <button
            v-for="cat in visibleCategories"
            :key="cat"
            :class="['filter-chip', { active: selectedCategory === cat }]"
            @click="selectCategory(cat)"
          >
            {{ cat }}
          </button>
        </div>

        <!-- 로딩 -->
        <div v-if="loading" class="loading-grid">
          <div v-for="i in 6" :key="i" class="skeleton-card">
            <div class="skeleton-thumb"></div>
            <div class="skeleton-body">
              <div class="skeleton-line short"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line medium"></div>
            </div>
          </div>
        </div>

        <!-- 에러 -->
        <div v-else-if="error" class="error-state" role="alert">
          <p class="error-title">강의 목록을 불러오지 못했습니다.</p>
          <p class="error-detail">{{ error }}</p>
          <button type="button" class="btn btn-primary" @click="retry">
            다시 시도
          </button>
        </div>

        <!-- 강의 그리드 -->
        <div v-else-if="filteredCourses.length" class="course-grid fade-in">
          <CourseCard
            v-for="course in filteredCourses"
            :key="course.id"
            :course="course"
          />
        </div>

        <!-- 빈 상태 -->
        <div v-else class="empty-state">
          <p>해당 카테고리의 강의가 없습니다.</p>

          <router-link
            v-if="isInstructor"
            to="/courses/new"
            class="btn btn-primary empty-action-btn"
          >
            첫 강의 등록하기
          </router-link>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import AppSidebar from '@/components/AppSidebar.vue'
import CourseCard from '@/components/CourseCard.vue'
import { useCourseStore } from '@/store/course.js'
import { useAuthStore } from '@/store/auth.js'

const courseStore = useCourseStore()
const auth = useAuthStore()

/*
 * storeToRefs 로 꺼낸다.
 * 원본은 `const { categories, loading } = courseStore` 로 구조분해했는데,
 * setup store 의 구조분해는 그 시점의 값을 복사할 뿐이라 loading 이 반응성을 잃는다.
 * loading 초기값이 false 라서 스켈레톤이 한 번도 뜨지 않았다.
 */
const { loading, error, selectedCategory, courses } = storeToRefs(courseStore)

const isInstructor = computed(() => auth.user?.role === 'INSTRUCTOR')

const filteredCourses = computed(() => {
  if (!Array.isArray(courses.value)) return []
  if (selectedCategory.value === '전체') return courses.value
  return courses.value.filter(c => c.category === selectedCategory.value)
})

/*
 * 칩을 카탈로그 8종 전부가 아니라 실제 데이터에 있는 것만 보여 준다.
 * 고르는 순간 빈 화면이 되는 선택지를 없애고, 동시에 선택지 개수도 줄인다.
 */
const visibleCategories = computed(() => {
  const present = new Set((courses.value || []).map(c => c.category))
  return ['전체', ...courseStore.categories.filter(c => c !== '전체' && present.has(c))]
})

function selectCategory(cat) {
  courseStore.setCategory(cat)
}

function retry() {
  courseStore.fetchCourses()
}

onMounted(() => {
  courseStore.resetCategory()
  courseStore.fetchCourses()
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


/* 메인 */
.main-content {
  min-width: 0;
}

.content-header {
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.page-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.create-course-btn {
  white-space: nowrap;
  text-decoration: none;
}

/* 필터 */
.filter-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.filter-chip {
  padding: 7px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  border: 1.5px solid var(--color-border);
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  transition: var(--transition);
  cursor: pointer;
}

.filter-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filter-chip.active {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-color: var(--color-primary);
}

/* 강의 그리드 */
.course-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

/* 스켈레톤 */
.loading-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.skeleton-card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.skeleton-thumb {
  height: 120px;
  background: linear-gradient(90deg, var(--color-skeleton-base) 25%, var(--color-skeleton-highlight) 50%, var(--color-skeleton-base) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.skeleton-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--color-skeleton-base) 25%, var(--color-skeleton-highlight) 50%, var(--color-skeleton-base) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.skeleton-line.short {
  width: 40%;
}

.skeleton-line.medium {
  width: 70%;
}

@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 80px 0;
  color: var(--color-text-muted);
  font-size: 15px;
}

.empty-action-btn {
  display: inline-flex;
  margin-top: 16px;
  text-decoration: none;
}

@media (max-width: 992px) {
  .page-layout {
    grid-template-columns: 1fr;
  }

  .course-grid,
  .loading-grid {
    grid-template-columns: 1fr;
  }

  .content-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>