import api from './index.js'
import { wrap } from '@/mock/index.js'
import { createMockInvestmentProfile } from '@/mock/investmentProfile.js'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const recommendApi = {
  analyzeInvestment(payload) {
    if (USE_MOCK) {
      return wrap(createMockInvestmentProfile(payload), '투자 성향 분석 성공')
    }
    return api.post('/api/recommend/analyze', payload)
  }
}
