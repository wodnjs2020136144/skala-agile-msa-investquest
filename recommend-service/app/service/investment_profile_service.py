"""투자 게임 행동을 설명 가능한 규칙으로 분석한다.

학습 데이터가 없는 Sprint 2 단계에서는 결과를 재현하고 설명할 수 있는 규칙 기반
모델을 사용한다. 실제 행동 데이터가 쌓이면 이 클래스의 점수 계산부만 ML 모델로
교체하고 API 계약은 유지할 수 있다.
"""

from app.model.schemas import (
    DecisionStyle,
    InvestmentProfileRequest,
    InvestmentProfileResponse,
    ProfileMetrics,
    PersonalizedCoaching,
    RecommendedContent,
    RecommendedProduct,
    RiskLevel,
)


class InvestmentProfileService:
    RISK_WEIGHT = {
        RiskLevel.LOW: 0.2,
        RiskLevel.NORMAL: 0.6,
        RiskLevel.HIGH: 1.0,
    }

    CONTENTS = {
        "CONSERVATIVE": [
            RecommendedContent(
                title="현금성 자산과 채권의 역할",
                reason="원금 변동을 줄이는 자산의 특징을 학습할 수 있습니다.",
            ),
            RecommendedContent(
                title="분산투자 기초",
                reason="낮은 위험을 유지하면서 여러 자산으로 나누는 방법을 소개합니다.",
            ),
        ],
        "BALANCED": [
            RecommendedContent(
                title="ETF로 시작하는 분산투자",
                reason="안정성과 성장성을 함께 고려하는 포트폴리오 학습에 적합합니다.",
            ),
            RecommendedContent(
                title="포트폴리오 리밸런싱",
                reason="목표 비중을 주기적으로 관리하는 방법을 소개합니다.",
            ),
        ],
        "AGGRESSIVE": [
            RecommendedContent(
                title="고변동 자산의 손실 관리",
                reason="높은 기대수익과 함께 커지는 손실 가능성을 이해할 수 있습니다.",
            ),
            RecommendedContent(
                title="집중투자와 분산투자의 차이",
                reason="특정 종목 비중이 커질 때 발생하는 위험을 비교합니다.",
            ),
        ],
    }

    # 실존 상품의 매수를 권유하지 않기 위한 데모용 '상품 탐색' 카탈로그다.
    # 실제 서비스에서는 적합성 확인을 마친 상품 마스터 데이터로 대체한다.
    PRODUCTS = {
        "CONSERVATIVE": [
            RecommendedProduct(
                id="cma-cash",
                name="CMA 자동 운용 서비스",
                category="현금 관리",
                description="대기 자금을 관리하며 필요할 때 투자 기회를 살펴볼 수 있는 서비스입니다.",
                reason="현금 비중과 낮은 변동성을 중시한 선택 흐름과 맞습니다.",
                tags=["현금 관리", "낮은 변동성"],
            ),
            RecommendedProduct(
                id="bond-etf",
                name="채권형 ETF 탐색",
                category="ETF",
                description="채권 중심 자산의 특징과 가격 변동 요인을 비교해 볼 수 있습니다.",
                reason="원금 변동을 줄이는 자산의 역할을 먼저 살펴보기에 적합합니다.",
                tags=["분산", "안정 추구"],
            ),
        ],
        "BALANCED": [
            RecommendedProduct(
                id="etf-savings",
                name="ETF 적립식 투자 서비스",
                category="ETF",
                description="일정 금액을 나누어 투자하며 장기적인 분산 전략을 탐색하는 서비스입니다.",
                reason="성장 가능성과 안정성을 함께 고려한 배분 결과와 맞습니다.",
                tags=["분산", "적립식"],
            ),
            RecommendedProduct(
                id="rebalance-alert",
                name="포트폴리오 리밸런싱 알림",
                category="투자 관리",
                description="목표 비중에서 벗어난 자산을 확인하고 배분을 점검하는 기능입니다.",
                reason="여러 종목의 비중을 조절한 투자 방식과 연결됩니다.",
                tags=["비중 관리", "포트폴리오"],
            ),
        ],
        "AGGRESSIVE": [
            RecommendedProduct(
                id="growth-etf",
                name="글로벌 성장 ETF 탐색",
                category="ETF",
                description="성장 산업 중심 ETF의 구성과 변동성 정보를 비교해 볼 수 있습니다.",
                reason="높은 수익 기회와 변동성을 함께 감수한 투자 성향과 맞습니다.",
                tags=["성장", "높은 변동성"],
            ),
            RecommendedProduct(
                id="fractional-global",
                name="해외주식 소수점 투자 탐색",
                category="해외 투자",
                description="해외 종목을 소액으로 나누어 비교·학습할 수 있는 투자 탐색 서비스입니다.",
                reason="적극적인 기회 탐색과 분산 접근을 함께 경험할 수 있습니다.",
                tags=["해외 투자", "소액 분산"],
            ),
        ],
    }

    def analyze(self, request: InvestmentProfileRequest) -> InvestmentProfileResponse:
        invested = sum(item.amount for item in request.allocations)
        investment_ratio = invested / request.initialCash
        weighted_risk_ratio = sum(
            item.amount * self.RISK_WEIGHT[item.risk]
            for item in request.allocations
        ) / invested
        high_risk_amount = sum(
            item.amount for item in request.allocations if item.risk == RiskLevel.HIGH
        )
        high_risk_ratio = high_risk_amount / invested
        concentration_ratio = max(item.amount for item in request.allocations) / invested

        # 투자 실행 30점 + 포트폴리오 위험도 45점 + 위험 집중 15점
        # + 고위험 종목 비중 10점. 입력만 같으면 언제나 같은 결과가 나온다.
        score = round(
            investment_ratio * 30
            + weighted_risk_ratio * 45
            + concentration_ratio * weighted_risk_ratio * 15
            + high_risk_ratio * 10
        )
        score = max(0, min(100, score))

        profile_type, profile_name, summary = self._profile(score)
        largest = max(request.allocations, key=lambda item: item.amount)
        diversification_score = round((1 - concentration_ratio) * 100)

        metrics = ProfileMetrics(
            investmentRatio=round(investment_ratio * 100, 1),
            weightedRiskRatio=round(weighted_risk_ratio * 100, 1),
            highRiskRatio=round(high_risk_ratio * 100, 1),
            concentrationRatio=round(concentration_ratio * 100, 1),
            diversificationScore=diversification_score,
            selectedStockCount=len(request.allocations),
        )

        return InvestmentProfileResponse(
            participationId=request.participationId,
            profileType=profile_type,
            profileName=profile_name,
            riskScore=score,
            summary=summary,
            metrics=metrics,
            decisionStyle=self._decision_style(request),
            reasons=[
                f"가상자금 {request.initialCash:,}원 중 {invested:,}원({metrics.investmentRatio:.0f}%)을 투자했습니다.",
                f"{len(request.allocations)}개 종목에 배분했고, 최대 비중은 {largest.name} {metrics.concentrationRatio:.0f}%입니다.",
                f"포트폴리오의 가중 변동성 점수는 {metrics.weightedRiskRatio:.0f}점입니다.",
            ],
            recommendedContents=self.CONTENTS[profile_type],
            recommendedProducts=self.PRODUCTS[profile_type],
            personalizedCoaching=self._personalized_coaching(
                investment_ratio=investment_ratio,
                concentration_ratio=concentration_ratio,
                high_risk_ratio=high_risk_ratio,
                selected_stock_count=len(request.allocations),
            ),
            cautions=[
                "이 결과는 모의 투자 게임의 행동 데이터를 분석한 참고 정보입니다.",
                "공식 투자자 성향 진단이나 특정 금융상품에 대한 투자 권유가 아닙니다.",
            ],
        )

    @staticmethod
    def _personalized_coaching(
        investment_ratio: float,
        concentration_ratio: float,
        high_risk_ratio: float,
        selected_stock_count: int,
    ) -> PersonalizedCoaching:
        """가장 두드러진 행동 신호 하나를 골라 다음 게임 미션으로 연결한다.

        추천 근거가 화면 수치와 1:1로 이어져 발표·데모에서도 설명할 수 있다.
        추후 LLM을 붙이더라도 이 결과를 안전한 추천 후보/근거 데이터로 활용한다.
        """
        if concentration_ratio >= 0.60:
            return PersonalizedCoaching(
                headline="집중 투자 전략을 선택했어요",
                feedback=(
                    f"한 종목 비중이 {concentration_ratio * 100:.0f}%입니다. "
                    "높은 수익 기회를 노릴 수 있지만 특정 종목의 변동이 전체 결과에 크게 영향을 줍니다."
                ),
                focusMetric=f"최대 종목 비중 {concentration_ratio * 100:.0f}%",
                nextMissionTitle="다음 게임: 3종목 분산 챌린지",
                nextMissionDescription="서로 다른 3개 이상 종목에 나누어 투자하고 집중 전략과 결과를 비교해 보세요.",
                target="최대 종목 비중 50% 이하",
            )
        if high_risk_ratio >= 0.50:
            return PersonalizedCoaching(
                headline="높은 변동성을 적극 활용했어요",
                feedback=(
                    f"고위험 종목 비중이 {high_risk_ratio * 100:.0f}%입니다. "
                    "수익 기회와 함께 큰 가격 변동도 감수하는 전략입니다."
                ),
                focusMetric=f"고위험 종목 비중 {high_risk_ratio * 100:.0f}%",
                nextMissionTitle="다음 게임: 변동성 조절 챌린지",
                nextMissionDescription="고위험 종목과 일반 종목을 함께 담아 수익 기회와 변동성의 균형을 비교해 보세요.",
                target="고위험 종목 비중 40% 이하",
            )
        if investment_ratio <= 0.55:
            return PersonalizedCoaching(
                headline="현금 방어 비중을 높게 유지했어요",
                feedback=(
                    f"가상 자금의 {investment_ratio * 100:.0f}%만 투자했습니다. "
                    "시장 변동에 대비하는 전략이지만, 상승 기회를 놓칠 가능성도 함께 살펴볼 수 있습니다."
                ),
                focusMetric=f"투자 비율 {investment_ratio * 100:.0f}%",
                nextMissionTitle="다음 게임: 기회 포착 챌린지",
                nextMissionDescription="현금 비중을 일부 줄이고 여러 종목에 배분했을 때의 결과를 비교해 보세요.",
                target="투자 비율 70% 이상",
            )
        if selected_stock_count <= 2:
            return PersonalizedCoaching(
                headline="간결한 포트폴리오를 구성했어요",
                feedback="적은 수의 종목으로 명확한 전략을 세웠습니다. 종목 수를 늘렸을 때의 분산 효과도 비교해 볼 수 있습니다.",
                focusMetric=f"선택 종목 {selected_stock_count}개",
                nextMissionTitle="다음 게임: 섹터 분산 챌린지",
                nextMissionDescription="서로 다른 3개 이상 섹터의 종목을 선택해 포트폴리오를 구성해 보세요.",
                target="3개 이상 종목 선택",
            )
        return PersonalizedCoaching(
            headline="균형 있는 배분 전략을 구성했어요",
            feedback="여러 종목과 현금 비중을 함께 고려했습니다. 다음 게임에서는 한 가지 전략을 의도적으로 강화해 결과를 비교해 보세요.",
            focusMetric=f"선택 종목 {selected_stock_count}개",
            nextMissionTitle="다음 게임: 전략 비교 챌린지",
            nextMissionDescription="이번 배분을 기준으로 성장 중심 또는 방어 중심 전략을 한 번 더 설계해 보세요.",
            target="전략 2가지 결과 비교",
        )

    @staticmethod
    def _profile(score: int) -> tuple[str, str, str]:
        if score <= 39:
            return (
                "CONSERVATIVE",
                "안정 추구형",
                "현금과 낮은 변동성을 중시하며 손실 가능성을 신중하게 관리하는 성향입니다.",
            )
        if score <= 69:
            return (
                "BALANCED",
                "균형 투자형",
                "안정성과 성장 가능성을 함께 고려해 위험을 조절하는 성향입니다.",
            )
        return (
            "AGGRESSIVE",
            "적극 투자형",
            "높은 변동성을 감수하고 적극적으로 수익 기회를 찾는 성향입니다.",
        )

    @staticmethod
    def _decision_style(request: InvestmentProfileRequest) -> DecisionStyle:
        if request.changeCount >= 5 or request.decisionSeconds >= 90:
            style_type = "CAREFUL"
            label = "신중한 의사결정형"
            description = "여러 번 비교하거나 충분한 시간을 두고 투자안을 결정했습니다."
        elif request.changeCount <= 2 and request.decisionSeconds <= 30:
            style_type = "QUICK"
            label = "빠른 의사결정형"
            description = "비교적 적은 수정과 짧은 시간 안에 투자안을 결정했습니다."
        else:
            style_type = "DELIBERATE"
            label = "균형 판단형"
            description = "필요한 비교를 거친 뒤 과도하게 지체하지 않고 결정했습니다."

        return DecisionStyle(
            type=style_type,
            label=label,
            description=description,
            changeCount=request.changeCount,
            decisionSeconds=request.decisionSeconds,
        )


investment_profile_service = InvestmentProfileService()
