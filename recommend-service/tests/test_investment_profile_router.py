import unittest

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.config.security import verify_token
from app.router.recommend_router import router


class InvestmentProfileRouterTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app = FastAPI()
        app.include_router(router)
        app.dependency_overrides[verify_token] = lambda: {"sub": "test-user"}
        cls.client = TestClient(app)

    def test_analyze_endpoint_contract(self):
        response = self.client.post(
            "/api/recommend/analyze",
            json={
                "participationId": 9001,
                "initialCash": 10_000,
                "cashBalance": 2_500,
                "changeCount": 3,
                "decisionSeconds": 60,
                "allocations": [
                    {"stockId": 1, "name": "성장산업", "risk": "NORMAL", "amount": 3_000},
                    {"stockId": 2, "name": "안정금융", "risk": "LOW", "amount": 2_500},
                    {"stockId": 3, "name": "혁신기술", "risk": "HIGH", "amount": 2_000},
                ],
            },
        )

        self.assertEqual(200, response.status_code)
        body = response.json()
        self.assertEqual(9001, body["participationId"])
        self.assertEqual("BALANCED", body["profileType"])
        self.assertEqual(3, body["metrics"]["selectedStockCount"])
        self.assertGreaterEqual(len(body["reasons"]), 3)

    def test_analyze_endpoint_rejects_inconsistent_budget(self):
        response = self.client.post(
            "/api/recommend/analyze",
            json={
                "participationId": 9001,
                "initialCash": 10_000,
                "cashBalance": 5_000,
                "allocations": [
                    {"stockId": 1, "name": "안정금융", "risk": "LOW", "amount": 4_000}
                ],
            },
        )
        self.assertEqual(422, response.status_code)


if __name__ == "__main__":
    unittest.main()
