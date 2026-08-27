import unittest

from app.model.schemas import InvestmentProfileRequest
from app.service.investment_profile_service import investment_profile_service


class InvestmentProfileServiceTest(unittest.TestCase):
    def analyze(self, allocations, cash_balance, changes=3, seconds=60):
        request = InvestmentProfileRequest(
            participationId=1,
            initialCash=10_000_000,
            cashBalance=cash_balance,
            changeCount=changes,
            decisionSeconds=seconds,
            allocations=allocations,
        )
        return investment_profile_service.analyze(request)

    def test_conservative_profile(self):
        result = self.analyze(
            [{"stockId": 1, "name": "안정금융", "risk": "LOW", "amount": 3_000_000}],
            cash_balance=7_000_000,
            changes=7,
            seconds=120,
        )
        self.assertEqual("CONSERVATIVE", result.profileType)
        self.assertEqual("CMA 자동 운용 서비스", result.recommendedProducts[0].name)
        self.assertEqual("CAREFUL", result.decisionStyle.type)
        self.assertEqual(30.0, result.metrics.investmentRatio)

    def test_balanced_profile(self):
        result = self.analyze(
            [
                {"stockId": 1, "name": "성장산업", "risk": "NORMAL", "amount": 3_000_000},
                {"stockId": 2, "name": "안정금융", "risk": "LOW", "amount": 2_500_000},
                {"stockId": 3, "name": "혁신기술", "risk": "HIGH", "amount": 2_000_000},
            ],
            cash_balance=2_500_000,
        )
        self.assertEqual("BALANCED", result.profileType)
        self.assertEqual("ETF 적립식 투자 서비스", result.recommendedProducts[0].name)
        self.assertEqual(3, result.metrics.selectedStockCount)
        self.assertEqual(26.7, result.metrics.highRiskRatio)

    def test_aggressive_profile(self):
        result = self.analyze(
            [{"stockId": 1, "name": "고변동기술", "risk": "HIGH", "amount": 10_000_000}],
            cash_balance=0,
            changes=1,
            seconds=20,
        )
        self.assertEqual("AGGRESSIVE", result.profileType)
        self.assertEqual("글로벌 성장 ETF 탐색", result.recommendedProducts[0].name)
        self.assertEqual(100, result.riskScore)
        self.assertEqual("QUICK", result.decisionStyle.type)

    def test_rejects_invalid_budget(self):
        with self.assertRaises(ValueError):
            InvestmentProfileRequest(
                participationId=1,
                initialCash=10_000_000,
                cashBalance=5_000_000,
                allocations=[
                    {"stockId": 1, "name": "종목", "risk": "LOW", "amount": 4_000_000}
                ],
            )


if __name__ == "__main__":
    unittest.main()
