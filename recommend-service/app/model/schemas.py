from pydantic import BaseModel, Field, model_validator
from typing import List, Optional
from enum import Enum
from decimal import Decimal
from datetime import datetime


class CourseCategory(str, Enum):
    BACKEND = "BACKEND"
    FRONTEND = "FRONTEND"
    DEVOPS = "DEVOPS"
    DATA_SCIENCE = "DATA_SCIENCE"
    MOBILE = "MOBILE"
    SECURITY = "SECURITY"
    DATABASE = "DATABASE"
    OTHER = "OTHER"


class CourseResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: CourseCategory
    price: Decimal
    instructorId: int
    enrollmentCount: int
    status: str
    createdAt: Optional[datetime] = None


class EnrollmentHistoryResponse(BaseModel):
    userId: int
    activeCourseIds: List[int]


class RecommendResponse(BaseModel):
    userId: int
    recommendedCourses: List[CourseResponse]
    basedOnCategory: Optional[CourseCategory] = None
    message: str


class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None


# ── InvestQuest 투자 성향 분석 ──────────────────────────────────────────────

class RiskLevel(str, Enum):
    LOW = "LOW"
    NORMAL = "NORMAL"
    HIGH = "HIGH"


class InvestmentAllocation(BaseModel):
    stockId: int = Field(gt=0)
    name: str = Field(min_length=1, max_length=100)
    symbol: Optional[str] = Field(default=None, max_length=20)
    sector: Optional[str] = Field(default=None, max_length=50)
    risk: RiskLevel
    amount: int = Field(gt=0)


class InvestmentProfileRequest(BaseModel):
    participationId: int = Field(gt=0)
    initialCash: int = Field(gt=0)
    cashBalance: int = Field(ge=0)
    changeCount: int = Field(default=0, ge=0)
    decisionSeconds: int = Field(default=0, ge=0)
    allocations: List[InvestmentAllocation] = Field(min_length=1, max_length=20)

    @model_validator(mode="after")
    def validate_budget(self):
        invested = sum(item.amount for item in self.allocations)
        if invested + self.cashBalance != self.initialCash:
            raise ValueError("투자금 합계와 잔여 현금의 합은 초기 자금과 같아야 합니다")
        return self


class ProfileMetrics(BaseModel):
    investmentRatio: float
    weightedRiskRatio: float
    highRiskRatio: float
    concentrationRatio: float
    diversificationScore: int
    selectedStockCount: int


class DecisionStyle(BaseModel):
    type: str
    label: str
    description: str
    changeCount: int
    decisionSeconds: int


class RecommendedContent(BaseModel):
    title: str
    reason: str


class InvestmentProfileResponse(BaseModel):
    participationId: int
    profileType: str
    profileName: str
    riskScore: int = Field(ge=0, le=100)
    summary: str
    metrics: ProfileMetrics
    decisionStyle: DecisionStyle
    reasons: List[str]
    recommendedContents: List[RecommendedContent]
    cautions: List[str]
