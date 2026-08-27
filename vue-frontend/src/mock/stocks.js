/**
 * 제시 종목 목 데이터.
 *
 * ⚠️ 전부 가상 종목이다. 실제 상장 기업으로 오인되지 않도록
 *    실존하지 않는 이름과 종목코드를 썼다. 발표에서도 가상임을 명시한다.
 *
 * risk / sector 는 백엔드 스키마 확정안이 courses 에 추가하기로 한
 * risk_level(LOW·NORMAL·HIGH) · symbol 을 미리 반영한 것이다
 * (docs/07_스키마-설계안_검토.md §D-3).
 *
 * ⚠️ sector 값은 안건 2-3(courses.category 8종을 어떤 섹터명으로 바꿀지) 미확정이다.
 *    그래서 store/course.js 의 CATEGORY_CATALOG 는 건드리지 않고 여기 따로 뒀다.
 *    확정되면 두 곳을 합친다.
 *
 * ⚠️ 안건 3-6 — 실시세가 아니라 고정 가격이다.
 *    전원 같은 조건이어야 사용자 간 성향 비교가 가능하다.
 */
export const MOCK_STOCKS = [
  {
    id: 101,
    symbol: 'V0101',
    name: '가온반도체',
    sector: 'IT',
    price: 2400,
    risk: 'HIGH',
    description: '변동이 큰 반도체 업종. 오를 때도 내릴 때도 폭이 크다.'
  },
  {
    id: 102,
    symbol: 'V0102',
    name: '한별금융지주',
    sector: '금융',
    price: 1800,
    risk: 'LOW',
    description: '가격 변동이 완만하고 배당이 안정적인 편이다.'
  },
  {
    id: 103,
    symbol: 'V0103',
    name: '누리바이오',
    sector: '바이오',
    price: 3200,
    risk: 'HIGH',
    description: '임상 결과에 따라 가격이 크게 흔들린다.'
  },
  {
    id: 104,
    symbol: 'V0104',
    name: '들안식품',
    sector: '소비재',
    price: 1200,
    risk: 'LOW',
    description: '경기 영향을 덜 받는 생활 필수 소비재.'
  },
  {
    id: 105,
    symbol: 'V0105',
    name: '새빛에너지',
    sector: '에너지',
    price: 2000,
    risk: 'NORMAL',
    description: '유가와 정책에 따라 중간 정도로 움직인다.'
  },
  {
    id: 106,
    symbol: 'V0106',
    name: '미르물류',
    sector: '운송',
    price: 1500,
    risk: 'NORMAL',
    description: '물동량에 따라 실적이 오르내린다.'
  }
]

/** 위험도 표시용. global.css 의 등락 토큰을 재사용한다 */
export const RISK_META = {
  LOW: { label: '낮음', className: 'risk-low' },
  NORMAL: { label: '보통', className: 'risk-normal' },
  HIGH: { label: '높음', className: 'risk-high' }
}

export function getRiskMeta(risk) {
  return RISK_META[risk] || RISK_META.NORMAL
}
