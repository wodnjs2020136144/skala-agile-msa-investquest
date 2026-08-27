/**
 * 게임 참여 세션 목.
 *
 * participations 는 백엔드 스키마 확정안이 신설하기로 한 테이블이다.
 * 소유 서비스는 enrollment-service 가 유력하나 아직 미확정이다
 * (docs/07_스키마-설계안_검토.md §B-3, 안건 1-2).
 *
 * ⚠️ 여기 status 는 participations 의 게임 상태이지
 *    enrollments.status(PENDING·ACTIVE·CANCELLED 3개 고정) 가 아니다.
 *    둘을 섞지 않는다.
 */
let seq = 9000

export function createMockParticipation(scenarioId, offeredStockIds) {
  seq += 1
  return {
    participationId: seq,
    scenarioId,
    offeredStockIds,
    status: 'READY',
    startedAt: new Date().toISOString()
  }
}
