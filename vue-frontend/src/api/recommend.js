import api from './index.js'
import { USE_MOCK } from '@/config.js'
import { wrap } from '@/mock/index.js'
import { createMockInvestmentProfile } from '@/mock/investmentProfile.js'

// 이 파일만 env 를 직접 읽고 있었다. config.js 가 단일 진실원이고,
// 런타임 오버라이드(시연용 토글)도 거기에만 반영되므로 맞춰 둔다.

export const recommendApi = {
  analyzeInvestment(payload) {
    if (USE_MOCK) {
      return wrap(createMockInvestmentProfile(payload), '투자 성향 분석 성공')
    }
    return api.post('/api/recommend/analyze', payload)
  }
}
