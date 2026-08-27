import { defineStore } from 'pinia'
import { ref } from 'vue'
import { courseApi } from '@/api/course.js'

const img = (name) =>
  new URL(`../assets/images/courses/${name}.png`, import.meta.url).href

/**
 * 카테고리 단일 진실원.
 *
 * 원본은 이 정보가 5곳에 흩어져 있었고 서로 어긋났다.
 *  - store 의 categoryLabelMap 은 DATA / AI 키를 썼는데 DB enum 에는 없는 값이다
 *  - CourseCreateView 는 DATA_SCIENCE 를 보내는데 어느 맵에도 키가 없어
 *    새로 만든 항목이 '전체' 외의 모든 필터에서 사라졌다
 *  - categoryConfig 가 3개 뷰에 복제돼 있고 DEVOPS 의 썸네일이 서로 달랐다
 *    (목록=docker, 상세=kubernetes) → 같은 항목이 화면마다 다른 그림이 됐다
 *
 * value 는 init-db/01_init.sql 의 courses.category 8종 실제 enum 이다.
 * 여기만 고치면 칩·셀렉트·배지·썸네일이 함께 바뀐다.
 */
export const CATEGORY_CATALOG = [
  { value: 'BACKEND',      label: '백엔드',     badge: 'badge-teal',   thumbBg: 'thumb-teal',   thumb: 'spring_boot' },
  { value: 'FRONTEND',     label: '프론트엔드', badge: 'badge-blue',   thumbBg: 'thumb-blue',   thumb: 'vue_js' },
  { value: 'DEVOPS',       label: 'DevOps',     badge: 'badge-purple', thumbBg: 'thumb-purple', thumb: 'kubernetes' },
  { value: 'DATA_SCIENCE', label: '데이터',     badge: 'badge-pink',   thumbBg: 'thumb-pink',   thumb: 'python' },
  { value: 'MOBILE',       label: '모바일',     badge: 'badge-amber',  thumbBg: 'thumb-amber',  thumb: 'generative_ai' },
  { value: 'SECURITY',     label: '보안',       badge: 'badge-gray',   thumbBg: 'thumb-gray',   thumb: 'docker' },
  { value: 'DATABASE',     label: '데이터베이스', badge: 'badge-gray', thumbBg: 'thumb-gray',   thumb: null },
  { value: 'OTHER',        label: '기타',       badge: 'badge-gray',   thumbBg: 'thumb-gray',   thumb: null }
]

const FALLBACK_CONFIG = {
  value: null,
  label: '기타',
  badge: 'badge-gray',
  thumbBg: 'thumb-gray',
  thumb: null
}

const BY_CODE = Object.fromEntries(CATEGORY_CATALOG.map((c) => [c.value, c]))
const BY_LABEL = Object.fromEntries(CATEGORY_CATALOG.map((c) => [c.label, c]))

/** 와이어 값 또는 표시 라벨 어느 쪽으로도 조회할 수 있다 */
export function getCategoryConfig(codeOrLabel) {
  if (!codeOrLabel) return FALLBACK_CONFIG
  return BY_CODE[codeOrLabel] || BY_LABEL[codeOrLabel] || FALLBACK_CONFIG
}

/** 필터 칩 — 카탈로그에서 파생한다 */
export const CATEGORY_CHIPS = ['전체', ...CATEGORY_CATALOG.map((c) => c.label)]

/** 등록 폼 셀렉트 — 같은 카탈로그에서 파생한다 */
export const CATEGORY_OPTIONS = CATEGORY_CATALOG.map((c) => ({
  value: c.value,
  label: c.label
}))

export const useCourseStore = defineStore('course', () => {
  const courses = ref([])
  const selectedCourse = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const selectedCategory = ref('전체')

  const categories = CATEGORY_CHIPS

  function normalizeCategory(category) {
    return getCategoryConfig(category).label
  }

  /**
   * 와이어 값을 categoryCode 로 보존한다.
   * 원본은 category 를 한국어 라벨로 덮어쓴 뒤 그 라벨을 설정 조회 키로 썼다 —
   * 표시 문자열을 키로 쓰면 라벨을 바꾸는 순간 매핑이 끊긴다.
   * 도메인 라벨을 갈아끼울 예정이므로 코드와 라벨을 분리해 둔다.
   */
  function normalizeCourse(course) {
    if (!course || typeof course !== 'object') return course

    const config = getCategoryConfig(course.category)
    return {
      ...course,
      categoryCode: config.value ?? course.category ?? null,
      category: config.label
    }
  }

  function getThumbnail(course) {
    const explicit = course?.thumbnail
    if (explicit) {
      try {
        return img(explicit)
      } catch {
        /* 알 수 없는 파일명이면 카테고리 기본값으로 넘어간다 */
      }
    }

    const { thumb } = getCategoryConfig(course?.categoryCode || course?.category)
    return thumb ? img(thumb) : null
  }

  async function fetchCourses() {
    loading.value = true
    error.value = null

    try {
      const res = await courseApi.getAll()

      const rawCourses = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : []

      courses.value = rawCourses.map(normalizeCourse)
    } catch (e) {
      console.error('[CourseStore] fetchCourses failed:', e)
      error.value = e.message || '강의 목록을 불러오지 못했습니다.'
      courses.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchCourse(id) {
    loading.value = true
    error.value = null

    try {
      const res = await courseApi.getById(id)

      const rawCourse =
        res.data?.data && typeof res.data.data === 'object'
          ? res.data.data
          : res.data

      selectedCourse.value = normalizeCourse(rawCourse)
    } catch (e) {
      console.error('[CourseStore] fetchCourse failed:', e)
      error.value = e.message || '강의 정보를 불러오지 못했습니다.'
      selectedCourse.value = null
    } finally {
      loading.value = false
    }
  }

  function setCategory(cat) {
    selectedCategory.value = cat
  }

  /** 상세에서 목록으로 돌아왔을 때 필터가 조용히 걸려 있는 문제를 막는다 */
  function resetCategory() {
    selectedCategory.value = '전체'
  }

  return {
    courses,
    selectedCourse,
    loading,
    error,
    categories,
    selectedCategory,
    getCategoryConfig,
    normalizeCategory,
    normalizeCourse,
    getThumbnail,
    fetchCourses,
    fetchCourse,
    setCategory,
    resetCategory
  }
})
