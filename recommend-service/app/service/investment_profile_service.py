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
    RecommendedContent,
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
            cautions=[
                "이 결과는 모의 투자 게임의 행동 데이터를 분석한 참고 정보입니다.",
                "공식 투자자 성향 진단이나 특정 금융상품에 대한 투자 권유가 아닙니다.",
            ],
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
