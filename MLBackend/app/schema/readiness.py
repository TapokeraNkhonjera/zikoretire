from pydantic import BaseModel, Field

class ReadinessRequest(BaseModel):
    age: int = Field(..., ge=18, le=100)
    retirement_age: int = Field(..., ge=30, le=80)
    monthly_income: float = Field(..., ge=0)
    monthly_contribution: float = Field(..., ge=0)
    current_savings: float = Field(..., ge=0)
    inflation_rate: float = Field(..., ge=0, le=100)
    employment_type: int = Field(0, ge=0, le=2)
    job_stability: float = Field(0.5, ge=0, le=1)
    contribution_gap_months: int = Field(3, ge=0, le=24)