from core.predict import predict_readiness

test_input = {
    "age": 30,
    "retirement_age": 60,
    "monthly_income": 400000,
    "monthly_contribution": 50000,
    "current_savings": 1000000,
    "inflation_rate": 8
}

result = predict_readiness(test_input)

print("✅ Readiness:", result)