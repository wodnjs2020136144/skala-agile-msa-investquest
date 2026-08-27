import logging
from fastapi import APIRouter, Depends
from app.config.security import verify_token
from app.model.schemas import (
    InvestmentProfileRequest,
    InvestmentProfileResponse,
    RecommendResponse,
)
from app.service.investment_profile_service import investment_profile_service
from app.service.recommend_service import recommend_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/recommend", tags=["recommend"])


@router.get("/health", include_in_schema=False)
async def health_check():
    return {"status": "UP", "service": "recommend-service"}


@router.post("/analyze", response_model=InvestmentProfileResponse)
async def analyze_investment_profile(
    request: InvestmentProfileRequest,
    token_payload: dict = Depends(verify_token),
):
    """모의 투자 배분과 의사결정 행동으로 투자 성향을 분석한다."""
    logger.info(
        "[Router] 투자 성향 분석 - participationId: %s, subject: %s",
        request.participationId,
        token_payload.get("sub"),
    )
    return investment_profile_service.analyze(request)


@router.get("/{user_id}", response_model=RecommendResponse)
async def get_recommendations(
    user_id: int,
    token_payload: dict = Depends(verify_token)
):
    """
    GET /recommend/{userId} - 사용자 기반 강의 추천

    추천 규칙:
    - 수강 이력 있음: 최빈 카테고리 기반 미수강 강의 추천 (수강생 수 기준 정렬)
    - 수강 이력 없음: 전체 인기 강의 추천
    """
    logger.info(f"[Router] 추천 요청 - userId: {user_id}")
    return await recommend_service.get_recommendations(user_id)
