import os
import logging
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from schemas import PredictRequest, PredictResponse, HealthResponse, AnalyticsResponse, HistoricalRecord, PerformanceResponse, ModelPerformance
from sklearn.metrics import mean_squared_error, r2_score

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("hdfc-predictor-api")

app = FastAPI(title="HDFC Stock Price Prediction API", version="1.0.0")

# Enable CORS for React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend domain e.g., ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths to data & models
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
CSV_PATH = os.path.join(DATA_DIR, "HDFC_Data_New.csv")

# Model paths
MODEL_LINEAR_PATH = os.path.join(DATA_DIR, "HDFC_model.pkl")
MODEL_POLY_PATH = os.path.join(DATA_DIR, "polynomial_regression.pkl")
POLY_FEATURES_PATH = os.path.join(DATA_DIR, "polynomial_features.pkl")
MODEL_RIDGE_PATH = os.path.join(DATA_DIR, "ridge_regression.pkl")
MODEL_RF_PATH = os.path.join(DATA_DIR, "random_forest_regression.pkl")
MODEL_SVR_PATH = os.path.join(DATA_DIR, "svr.pkl")

# Global states
model = None  # Alias for backward compatibility (Linear Regression)
model_linear = None
model_poly = None
poly_features = None
model_ridge = None
model_rf = None
model_svr = None

scaler = None
df_historical = None
performances_cache = []

def calculate_performances(x_test, y_test):
    global performances_cache
    try:
        x_test_scaled = scaler.transform(x_test)
        
        # 1. Linear Regression
        p_linear = model_linear.predict(x_test_scaled)
        rss_linear = float(np.sum((y_test - p_linear) ** 2))
        rmse_linear = float(np.sqrt(mean_squared_error(y_test, p_linear)))
        r2_linear = float(r2_score(y_test, p_linear))
        
        # 2. Polynomial Regression
        p_poly = model_poly.predict(poly_features.transform(x_test_scaled))
        rss_poly = float(np.sum((y_test - p_poly) ** 2))
        rmse_poly = float(np.sqrt(mean_squared_error(y_test, p_poly)))
        r2_poly = float(r2_score(y_test, p_poly))
        
        # 3. Ridge Regression
        p_ridge = model_ridge.predict(x_test_scaled)
        rss_ridge = float(np.sum((y_test - p_ridge) ** 2))
        rmse_ridge = float(np.sqrt(mean_squared_error(y_test, p_ridge)))
        r2_ridge = float(r2_score(y_test, p_ridge))
        
        # 4. Random Forest Regression
        p_rf = model_rf.predict(x_test_scaled)
        rss_rf = float(np.sum((y_test - p_rf) ** 2))
        rmse_rf = float(np.sqrt(mean_squared_error(y_test, p_rf)))
        r2_rf = float(r2_score(y_test, p_rf))
        
        # 5. Support Vector Regression (SVR)
        p_svr = model_svr.predict(x_test_scaled)
        rss_svr = float(np.sum((y_test - p_svr) ** 2))
        rmse_svr = float(np.sqrt(mean_squared_error(y_test, p_svr)))
        r2_svr = float(r2_score(y_test, p_svr))
        
        performances_cache = [
            {"model": "Polynomial Regression", "rss": round(rss_poly, 2), "rmse": round(rmse_poly, 4), "r2": round(r2_poly, 6)},
            {"model": "Ridge Regression", "rss": round(rss_ridge, 2), "rmse": round(rmse_ridge, 4), "r2": round(r2_ridge, 6)},
            {"model": "Random Forest Regression", "rss": round(rss_rf, 2), "rmse": round(rmse_rf, 4), "r2": round(r2_rf, 6)},
            {"model": "Support Vector Regression (SVR)", "rss": round(rss_svr, 2), "rmse": round(rmse_svr, 4), "r2": round(r2_svr, 6)},
            {"model": "Linear Regression", "rss": round(rss_linear, 2), "rmse": round(rmse_linear, 4), "r2": round(r2_linear, 6)}
        ]
        logger.info("Successfully pre-calculated performance table values.")
    except Exception as e:
        logger.error(f"Error calculating model performances: {str(e)}")

def init_ml_pipeline():
    global model, model_linear, model_poly, poly_features, model_ridge, model_rf, model_svr, scaler, df_historical
    try:
        # Load all models
        if not os.path.exists(MODEL_LINEAR_PATH): raise FileNotFoundError(f"Linear model not found at {MODEL_LINEAR_PATH}")
        if not os.path.exists(MODEL_POLY_PATH): raise FileNotFoundError(f"Polynomial model not found at {MODEL_POLY_PATH}")
        if not os.path.exists(POLY_FEATURES_PATH): raise FileNotFoundError(f"Poly features not found at {POLY_FEATURES_PATH}")
        if not os.path.exists(MODEL_RIDGE_PATH): raise FileNotFoundError(f"Ridge model not found at {MODEL_RIDGE_PATH}")
        if not os.path.exists(MODEL_RF_PATH): raise FileNotFoundError(f"Random Forest model not found at {MODEL_RF_PATH}")
        if not os.path.exists(MODEL_SVR_PATH): raise FileNotFoundError(f"SVR model not found at {MODEL_SVR_PATH}")

        model_linear = joblib.load(MODEL_LINEAR_PATH)
        model = model_linear  # backward compatibility alias
        model_poly = joblib.load(MODEL_POLY_PATH)
        poly_features = joblib.load(POLY_FEATURES_PATH)
        model_ridge = joblib.load(MODEL_RIDGE_PATH)
        model_rf = joblib.load(MODEL_RF_PATH)
        model_svr = joblib.load(MODEL_SVR_PATH)

        logger.info("All regression models loaded successfully.")

        # Load dataset CSV
        if not os.path.exists(CSV_PATH):
            raise FileNotFoundError(f"Dataset CSV file not found at {CSV_PATH}")
        
        df = pd.read_csv(CSV_PATH)
        df = df.iloc[2:].reset_index(drop=True)
        df.rename(columns={'Price': 'Date'}, inplace=True)
        df[['Open', 'High', 'Low', 'Close']] = df[['Open', 'High', 'Low', 'Close']].astype(float)
        df['Volume'] = df['Volume'].astype(int)

        # Volume outlier filtering matching training notebook
        Q1 = df['Volume'].quantile(0.25)
        Q3 = df['Volume'].quantile(0.75)
        IQR = Q3 - Q1
        lower = Q1 - 1.5 * IQR
        upper = Q3 + 1.5 * IQR
        df = df[(df['Volume'] >= lower) & (df['Volume'] <= upper)]

        # Prepare target
        df['Tomorrow_close'] = df['Close'].shift(-1)
        df.dropna(inplace=True)

        # Store historical reference for analytics
        df_historical = df.copy()

        # Fit scaler using exact features and random split state (6244)
        X = df[['Close', 'High', 'Low', 'Open', 'Volume']]
        y = df['Tomorrow_close']
        
        x_train, x_test, y_train, y_test = train_test_split(X, y, train_size=0.8, random_state=6244)
        scaler = StandardScaler()
        scaler.fit(x_train)
        logger.info("Successfully initialized scaler using training split features (seed 6244).")

        # Dynamically calculate the metric cache
        calculate_performances(x_test, y_test)

    except Exception as e:
        logger.critical(f"Failed to initialize ML pipeline: {str(e)}")
        raise e

# Ensure ML pipeline is initialized
def ensure_pipeline_initialized():
    if model_linear is None or scaler is None:
        init_ml_pipeline()

# Initialize pipeline on startup
@app.on_event("startup")
def startup_event():
    ensure_pipeline_initialized()

# Auto-initialize on module load for Serverless environments
try:
    ensure_pipeline_initialized()
except Exception as e:
    logger.warning(f"Initial ML pipeline load deferred or failed: {e}")

@app.get("/")
@app.get("/api")
def read_root():
    return {"message": "HDFC Stock Prediction API is running"}

@app.get("/health", response_model=HealthResponse)
@app.get("/api/health", response_model=HealthResponse)
def health():
    ensure_pipeline_initialized()
    return {
        "status": "healthy" if model_linear is not None and scaler is not None else "degraded",
        "model_loaded": model_linear is not None
    }

@app.get("/performance", response_model=PerformanceResponse)
@app.get("/api/performance", response_model=PerformanceResponse)
def performance():
    ensure_pipeline_initialized()
    if not performances_cache:
        raise HTTPException(status_code=503, detail="Performance table not initialized")
    return {"performances": performances_cache}

def preprocess_and_predict(payload: PredictRequest) -> float:
    # 1. Standard Input Validations: Low <= High, and Open between Low and High
    if payload.low > payload.high:
        raise HTTPException(status_code=400, detail="Low price cannot be greater than High price")
    if payload.open < payload.low or payload.open > payload.high:
        raise HTTPException(status_code=400, detail="Open price must be between Low and High price")
        
    # 2. DataFrame Construction with explicit column ordering to avoid mismatches
    features = ['Close', 'High', 'Low', 'Open', 'Volume']
    input_df = pd.DataFrame([[
        payload.close,
        payload.high,
        payload.low,
        payload.open,
        payload.volume
    ]], columns=features)
    
    # 3. Scale input parameters
    scaled_features = scaler.transform(input_df)
    
    # 4. Predict using the selected regression engine
    model_name = payload.model_name.lower().strip()
    if "polynomial" in model_name:
        poly_scaled = poly_features.transform(scaled_features)
        prediction = float(model_poly.predict(poly_scaled)[0])
    elif "ridge" in model_name:
        prediction = float(model_ridge.predict(scaled_features)[0])
    elif "random forest" in model_name:
        prediction = float(model_rf.predict(scaled_features)[0])
    elif "svr" in model_name or "support vector" in model_name:
        prediction = float(model_svr.predict(scaled_features)[0])
    else:  # Default/Linear Regression
        prediction = float(model_linear.predict(scaled_features)[0])
        
    return prediction

@app.post("/predict", response_model=PredictResponse)
@app.post("/api/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    ensure_pipeline_initialized()
    if model_linear is None or scaler is None:
        raise HTTPException(status_code=503, detail="Prediction model is not initialized/loaded")
    
    try:
        predicted_close_price = preprocess_and_predict(payload)
        
        # Calculate changes compared to input closing price
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
    if df_historical is None:
        raise HTTPException(status_code=503, detail="Historical dataset is not loaded")
    
    try:
        # Compute summary stats
        latest_row = df_historical.iloc[-1]
        latest_close = float(latest_row['Close'])
        highest_close = float(df_historical['Close'].max())
        lowest_close = float(df_historical['Close'].min())
        average_volume = float(df_historical['Volume'].mean())
        total_records = len(df_historical)

        # Slice last N records for charting
        chart_df = df_historical.tail(limit)
        
        historical_records = []
        for _, row in chart_df.iterrows():
            historical_records.append(
                HistoricalRecord(
                    date=row['Date'] if isinstance(row['Date'], str) else row['Date'].strftime('%d-%m-%Y') if hasattr(row['Date'], 'strftime') else str(row['Date']),
                    open=float(row['Open']),
                    high=float(row['High']),
                    low=float(row['Low']),
                    close=float(row['Close']),
                    volume=int(row['Volume'])
                )
            )

        return {
            "latest_close": round(latest_close, 2),
            "highest_close": round(highest_close, 2),
            "lowest_close": round(lowest_close, 2),
            "average_volume": round(average_volume, 2),
            "total_records": total_records,
            "historical_data": historical_records
        }

    except Exception as e:
        logger.error(f"Analytics retrieval error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics data: {str(e)}")

