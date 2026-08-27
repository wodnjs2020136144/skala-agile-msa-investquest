import api from './index.js'
import { MOCK } from '@/config.js'
import { wrap } from '@/mock/index.js'
import { createMockInvestmentProfile } from '@/mock/investmentProfile.js'

// 게임 API 중 유일하게 백엔드와 계약이 처음부터 맞았던 곳이다.
// 요청·응답 DTO 가 mock/investmentProfile.js 와 1:1이라 플래그만 바꾸면 붙는다.

export const recommendApi = {
  analyzeInvestment(payload) {
    if (MOCK.profile) {
      return wrap(createMockInvestmentProfile(payload), '투자 성향 분석 성공')
    }
    return api.post('/api/recommend/analyze', payload)
  }
}
