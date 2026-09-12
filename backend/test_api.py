import time
import requests
import subprocess
import os
import sys

URL = "http://localhost:8000"

def test_api():
    print("Testing base endpoint...")
    r = requests.get(f"{URL}/")
    print("Base:", r.json())
    assert r.status_code == 200, "Base endpoint failed"

    print("\nTesting health endpoint...")
    r = requests.get(f"{URL}/health")
    print("Health:", r.json())
    assert r.status_code == 200, "Health endpoint failed"
    health_data = r.json()
    assert health_data["status"] == "healthy", "API degraded"
    assert health_data["model_loaded"] is True, "Model not loaded"

    print("\nTesting predict endpoint with valid new_data (815.89 expected)...")
    payload = {
        "close": 815.45,
        "high": 819.70,
        "low": 809.70,
        "open": 811.00,
        "volume": 21490000
    }
    r = requests.post(f"{URL}/predict", json=payload)
    print("Predict response status:", r.status_code)
    print("Predict response json:", r.json())
    assert r.status_code == 200, "Prediction failed"
    pred_data = r.json()
    assert abs(pred_data["predicted_close"] - 815.89) <= 0.5, f"Prediction {pred_data['predicted_close']} off from target 815.89"
    print("Prediction test PASSED.")

    print("\nTesting validation: Low > High...")
    invalid_payload = {
        "close": 815.45,
        "high": 809.70,
        "low": 819.70,
        "open": 811.00,
        "volume": 21490000
    }
    r = requests.post(f"{URL}/predict", json=invalid_payload)
    print("Invalid response status:", r.status_code)
    print("Invalid response detail:", r.json())
    assert r.status_code == 400, "Validation failed to trigger error for Low > High"
    print("Validation test PASSED.")

    print("\nTesting analytics endpoint...")
    r = requests.get(f"{URL}/analytics?limit=5")
    print("Analytics response status:", r.status_code)
    analytics_data = r.json()
    print("Sample analytics record count:", analytics_data["total_records"])
    print("Latest close:", analytics_data["latest_close"])
    print("Historical structure:", list(analytics_data["historical_data"][0].keys()))
    assert r.status_code == 200, "Analytics failed"
    assert len(analytics_data["historical_data"]) == 5, f"Analytics limit failed, expected 5, got {len(analytics_data['historical_data'])}"
    print("Analytics test PASSED.")

    print("\nTesting performance endpoint...")
    r = requests.get(f"{URL}/performance")
    print("Performance response status:", r.status_code)
    perf_data = r.json()
    print("Performance response:", perf_data)
    assert r.status_code == 200, "Performance endpoint failed"
    assert "performances" in perf_data, "Missing performances key"
    assert len(perf_data["performances"]) == 5, f"Expected 5 models, got {len(perf_data['performances'])}"
    print("Performance test PASSED.")

    print("\nTesting predict endpoint with Polynomial Regression...")
    payload_poly = {
        "close": 815.45,
        "high": 819.70,
        "low": 809.70,
        "open": 811.00,
        "volume": 21490000,
        "model_name": "Polynomial Regression"
    }
    r = requests.post(f"{URL}/predict", json=payload_poly)
    print("Predict (Poly) response status:", r.status_code)
    print("Predict (Poly) response json:", r.json())
    assert r.status_code == 200, "Polynomial prediction failed"
    print("Polynomial Prediction test PASSED.")

if __name__ == "__main__":
    test_api()
