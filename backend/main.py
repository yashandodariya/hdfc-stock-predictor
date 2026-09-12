import os
import json
import logging
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import (
    PredictRequest, PredictResponse, HealthResponse,
    AnalyticsResponse, HistoricalRecord, PerformanceResponse
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("hdfc-predictor-api")

app = FastAPI(title="HDFC Stock Price Prediction API", version="1.0.0")

# Enable CORS for React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths to data bundle
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
BUNDLE_PATH = os.path.join(DATA_DIR, "models_bundle.json")

# Global loaded state
bundle_data = None
scaler_mean = None
scaler_scale = None
linear_coef = None
linear_intercept = None
poly_coef = None
poly_intercept = None
poly_powers = None
ridge_coef = None
ridge_intercept = None
svr_sv = None
svr_dual_coef = None
svr_intercept = None
svr_gamma = None
rf_trees = None
performances_cache = []
analytics_summary = None
historical_records_cache = []

def init_ml_pipeline():
    global bundle_data, scaler_mean, scaler_scale, linear_coef, linear_intercept
    global poly_coef, poly_intercept, poly_powers, ridge_coef, ridge_intercept
    global svr_sv, svr_dual_coef, svr_intercept, svr_gamma, rf_trees
    global performances_cache, analytics_summary, historical_records_cache

    try:
        if not os.path.exists(BUNDLE_PATH):
            raise FileNotFoundError(f"Models bundle not found at {BUNDLE_PATH}")

        with open(BUNDLE_PATH, "r") as f:
            bundle_data = json.load(f)

        # Extract Scaler
        scaler_mean = np.array(bundle_data["scaler"]["mean"], dtype=np.float64)
        scaler_scale = np.array(bundle_data["scaler"]["scale"], dtype=np.float64)

        # Extract Linear
        linear_coef = np.array(bundle_data["linear"]["coef"], dtype=np.float64)
        linear_intercept = float(bundle_data["linear"]["intercept"])

        # Extract Poly
        poly_coef = np.array(bundle_data["poly"]["coef"], dtype=np.float64)
        poly_intercept = float(bundle_data["poly"]["intercept"])
        poly_powers = np.array(bundle_data["poly"]["powers"], dtype=np.int32)

        # Extract Ridge
        ridge_coef = np.array(bundle_data["ridge"]["coef"], dtype=np.float64)
        ridge_intercept = float(bundle_data["ridge"]["intercept"])

        # Extract SVR
        svr_sv = np.array(bundle_data["svr"]["support_vectors"], dtype=np.float64)
        svr_dual_coef = np.array(bundle_data["svr"]["dual_coef"], dtype=np.float64)
        svr_intercept = float(bundle_data["svr"]["intercept"])
        svr_gamma = float(bundle_data["svr"]["gamma"])

        # Extract RF
        rf_trees = bundle_data["rf"]["trees"]

        # Extract metrics & analytics
        performances_cache = bundle_data["performances"]
        analytics_summary = bundle_data["analytics_summary"]
        historical_records_cache = bundle_data["historical_data"]

        logger.info("Pure-NumPy ML pipeline and metrics loaded successfully from models_bundle.json.")
    except Exception as e:
        logger.critical(f"Failed to initialize ML pipeline bundle: {str(e)}")
        raise e

def ensure_pipeline_initialized():
    if bundle_data is None:
        init_ml_pipeline()

@app.on_event("startup")
def startup_event():
    ensure_pipeline_initialized()

# Auto-initialize on module import for serverless environments
try:
    ensure_pipeline_initialized()
except Exception as e:
    logger.warning(f"Initial ML pipeline load deferred: {e}")

@app.get("/")
@app.get("/api")
def read_root():
    return {"message": "HDFC Stock Prediction API is running"}

@app.get("/health", response_model=HealthResponse)
@app.get("/api/health", response_model=HealthResponse)
def health():
    ensure_pipeline_initialized()
    is_healthy = bundle_data is not None and scaler_mean is not None
    return {
        "status": "healthy" if is_healthy else "degraded",
        "model_loaded": is_healthy
    }

@app.get("/performance", response_model=PerformanceResponse)
@app.get("/api/performance", response_model=PerformanceResponse)
def performance():
    ensure_pipeline_initialized()
    if not performances_cache:
        raise HTTPException(status_code=503, detail="Performance table not initialized")
    return {"performances": performances_cache}

def preprocess_and_predict(payload: PredictRequest) -> float:
    # 1. Standard Input Validations
    if payload.low > payload.high:
        raise HTTPException(status_code=400, detail="Low price cannot be greater than High price")
    if payload.open < payload.low or payload.open > payload.high:
        raise HTTPException(status_code=400, detail="Open price must be between Low and High price")

    # Feature vector order: ['Close', 'High', 'Low', 'Open', 'Volume']
    raw_input = np.array([
        payload.close,
        payload.high,
        payload.low,
        payload.open,
        payload.volume
    ], dtype=np.float64)

    # Scale feature vector
    x_scaled = (raw_input - scaler_mean) / scaler_scale

    model_name = payload.model_name.lower().strip()

    if "polynomial" in model_name:
        # Polynomial feature expansion
        poly_terms = np.array([np.prod(x_scaled ** p) for p in poly_powers], dtype=np.float64)
        prediction = float(np.dot(poly_coef, poly_terms) + poly_intercept)

    elif "ridge" in model_name:
        prediction = float(np.dot(ridge_coef, x_scaled) + ridge_intercept)

    elif "random forest" in model_name:
        tree_preds = []
        for tree in rf_trees:
            left = tree["children_left"]
            right = tree["children_right"]
            feat = tree["feature"]
            thresh = tree["threshold"]
            val = tree["value"]
            node = 0
            while left[node] != right[node]:
                if x_scaled[feat[node]] <= thresh[node]:
                    node = left[node]
                else:
                    node = right[node]
            tree_preds.append(val[node])
        prediction = float(np.mean(tree_preds))

    elif "svr" in model_name or "support vector" in model_name:
        dists = np.sum((svr_sv - x_scaled) ** 2, axis=1)
        k = np.exp(-svr_gamma * dists)
        prediction = float(np.dot(svr_dual_coef, k) + svr_intercept)

    else:  # Default / Linear Regression
        prediction = float(np.dot(linear_coef, x_scaled) + linear_intercept)

    return prediction

@app.post("/predict", response_model=PredictResponse)
@app.post("/api/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    ensure_pipeline_initialized()
    if bundle_data is None:
        raise HTTPException(status_code=503, detail="Prediction model is not initialized/loaded")

    try:
        predicted_close_price = preprocess_and_predict(payload)

        change = predicted_close_price - payload.close
        change_percent = (change / payload.close) * 100.0

        return {
            "predicted_close": round(predicted_close_price, 2),
            "input_close": round(payload.close, 2),
            "change": round(change, 2),
            "change_percent": round(change_percent, 2)
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/analytics", response_model=AnalyticsResponse)
@app.get("/api/analytics", response_model=AnalyticsResponse)
def get_analytics(limit: int = 300):
    ensure_pipeline_initialized()
    if not historical_records_cache or analytics_summary is None:
        raise HTTPException(status_code=503, detail="Historical dataset is not loaded")

    try:
        sliced_history = historical_records_cache[-limit:] if limit > 0 else historical_records_cache
        records = [HistoricalRecord(**r) for r in sliced_history]

        return {
            "latest_close": analytics_summary["latest_close"],
            "highest_close": analytics_summary["highest_close"],
            "lowest_close": analytics_summary["lowest_close"],
            "average_volume": analytics_summary["average_volume"],
            "total_records": analytics_summary["total_records"],
            "historical_data": records
        }

    except Exception as e:
        logger.error(f"Analytics retrieval error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics data: {str(e)}")
