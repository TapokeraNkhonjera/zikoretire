import unittest

from fastapi.testclient import TestClient

from app.main import app
import core.predict as predict_module
from core.features import FEATURES


class TestMLBackendAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.payload = {
            "age": 30,
            "retirement_age": 60,
            "monthly_income": 400000,
            "monthly_contribution": 50000,
            "current_savings": 1000000,
            "inflation_rate": 8,
            "employment_type": 1,
            "job_stability": 0.7,
            "contribution_gap_months": 2,
        }

    def test_health_live_includes_request_id(self):
        response = self.client.get("/api/health/live")
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["status"], "ok")
        self.assertIn("request_id", body)
        self.assertTrue(response.headers.get("x-request-id"))

    def test_health_ready_returns_request_id_on_failure(self):
        original_model = predict_module.MODEL
        original_error = predict_module.MODEL_LOAD_ERROR
        try:
            predict_module.MODEL = None
            predict_module.MODEL_LOAD_ERROR = "forced-test-error"

            response = self.client.get("/api/health/ready")
            self.assertEqual(response.status_code, 503)
            body = response.json()["detail"]
            self.assertEqual(body["reason"], "MODEL_UNAVAILABLE")
            self.assertEqual(body["request_id"], response.headers.get("x-request-id"))
        finally:
            predict_module.MODEL = original_model
            predict_module.MODEL_LOAD_ERROR = original_error

    def test_predict_returns_request_id_and_contract(self):
        response = self.client.post("/api/predict-readiness", json=self.payload)
        self.assertIn(response.status_code, [200, 422, 500])
        if response.status_code == 200:
            body = response.json()
            self.assertIn("request_id", body)
            self.assertEqual(body["request_id"], response.headers.get("x-request-id"))
            self.assertIn("status", body)
            self.assertIn("warnings", body)

    def test_predict_degraded_when_model_missing(self):
        original_model = predict_module.MODEL
        original_error = predict_module.MODEL_LOAD_ERROR
        try:
            predict_module.MODEL = None
            predict_module.MODEL_LOAD_ERROR = "forced-test-error"

            response = self.client.post("/api/predict-readiness", json=self.payload)
            self.assertEqual(response.status_code, 200)
            body = response.json()
            self.assertEqual(body["status"], "degraded")
            self.assertEqual(body["risk"], "UNKNOWN")
            self.assertIn("MODEL_UNAVAILABLE", body["warnings"])
            self.assertEqual(body["request_id"], response.headers.get("x-request-id"))
        finally:
            predict_module.MODEL = original_model
            predict_module.MODEL_LOAD_ERROR = original_error

    def test_invalid_input_returns_422(self):
        bad_payload = dict(self.payload)
        bad_payload["age"] = 10
        response = self.client.post("/api/predict-readiness", json=bad_payload)
        self.assertEqual(response.status_code, 422)

    def test_payload_matches_core_feature_contract(self):
        required_by_features = set(FEATURES)
        payload_keys = set(self.payload.keys())
        missing = required_by_features - payload_keys
        self.assertEqual(
            missing,
            set(),
            f"Payload is missing model features: {sorted(missing)}",
        )

    def test_build_features_respects_core_feature_order(self):
        vector = predict_module.build_features(self.payload)
        self.assertEqual(len(vector), len(FEATURES))
        for idx, feature in enumerate(FEATURES):
            self.assertEqual(
                vector[idx],
                self.payload[feature],
                f"Feature order/value mismatch at {feature}",
            )


if __name__ == "__main__":
    unittest.main()