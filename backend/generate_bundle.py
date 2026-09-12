import joblib
import os
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
CSV_PATH = os.path.join(DATA_DIR, "HDFC_Data_New.csv")
OUT_JSON_PATH = os.path.join(DATA_DIR, "models_bundle.json")

def generate_bundle():
    print("Loading CSV dataset and running clean feature preparation...")
    df = pd.read_csv(CSV_PATH).iloc[2:].reset_index(drop=True)
    df.rename(columns={'Price': 'Date'}, inplace=True)
    df[['Open', 'High', 'Low', 'Close']] = df[['Open', 'High', 'Low', 'Close']].astype(float)
    df['Volume'] = df['Volume'].astype(int)

    Q1 = df['Volume'].quantile(0.25)
    Q3 = df['Volume'].quantile(0.75)
    IQR = Q3 - Q1
    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR
    df = df[(df['Volume'] >= lower) & (df['Volume'] <= upper)]

    df['Tomorrow_close'] = df['Close'].shift(-1)
    df.dropna(inplace=True)

    X = df[['Close', 'High', 'Low', 'Open', 'Volume']]
    y = df['Tomorrow_close']
    x_train, x_test, y_train, y_test = train_test_split(X, y, train_size=0.8, random_state=6244)

    scaler = StandardScaler()
    scaler.fit(x_train)

    print("Loading scikit-learn model pickles...")
    m_linear = joblib.load(os.path.join(DATA_DIR, "HDFC_model.pkl"))
    m_poly = joblib.load(os.path.join(DATA_DIR, "polynomial_regression.pkl"))
    p_feat = joblib.load(os.path.join(DATA_DIR, "polynomial_features.pkl"))
    m_ridge = joblib.load(os.path.join(DATA_DIR, "ridge_regression.pkl"))
    m_rf = joblib.load(os.path.join(DATA_DIR, "random_forest_regression.pkl"))
    m_svr = joblib.load(os.path.join(DATA_DIR, "svr.pkl"))

    print("Computing exact performance metrics table...")
    x_test_scaled = scaler.transform(x_test)
    p_linear = m_linear.predict(x_test_scaled)
    p_poly = m_poly.predict(p_feat.transform(x_test_scaled))
    p_ridge = m_ridge.predict(x_test_scaled)
    p_rf = m_rf.predict(x_test_scaled)
    p_svr = m_svr.predict(x_test_scaled)

    performances = [
        {"model": "Polynomial Regression", "rss": round(float(np.sum((y_test - p_poly)**2)), 2), "rmse": round(float(np.sqrt(mean_squared_error(y_test, p_poly))), 4), "r2": round(float(r2_score(y_test, p_poly)), 6)},
        {"model": "Ridge Regression", "rss": round(float(np.sum((y_test - p_ridge)**2)), 2), "rmse": round(float(np.sqrt(mean_squared_error(y_test, p_ridge))), 4), "r2": round(float(r2_score(y_test, p_ridge)), 6)},
        {"model": "Random Forest Regression", "rss": round(float(np.sum((y_test - p_rf)**2)), 2), "rmse": round(float(np.sqrt(mean_squared_error(y_test, p_rf))), 4), "r2": round(float(r2_score(y_test, p_rf)), 6)},
        {"model": "Support Vector Regression (SVR)", "rss": round(float(np.sum((y_test - p_svr)**2)), 2), "rmse": round(float(np.sqrt(mean_squared_error(y_test, p_svr))), 4), "r2": round(float(r2_score(y_test, p_svr)), 6)},
        {"model": "Linear Regression", "rss": round(float(np.sum((y_test - p_linear)**2)), 2), "rmse": round(float(np.sqrt(mean_squared_error(y_test, p_linear))), 4), "r2": round(float(r2_score(y_test, p_linear)), 6)}
    ]

    gamma_val = float(getattr(m_svr, '_gamma', 1.0 / (5 * x_train.var().mean())))

    rf_trees = []
    for tree in m_rf.estimators_:
        t = tree.tree_
        rf_trees.append({
            "children_left": t.children_left.tolist(),
            "children_right": t.children_right.tolist(),
            "feature": t.feature.tolist(),
            "threshold": t.threshold.tolist(),
            "value": t.value[:, 0, 0].tolist()
        })

    historical_records = []
    for _, row in df.iterrows():
        historical_records.append({
            "date": str(row['Date']),
            "open": float(row['Open']),
            "high": float(row['High']),
            "low": float(row['Low']),
            "close": float(row['Close']),
            "volume": int(row['Volume'])
        })

    bundle_data = {
        "scaler": {
            "mean": scaler.mean_.tolist(),
            "scale": scaler.scale_.tolist()
        },
        "linear": {
            "coef": m_linear.coef_.tolist(),
            "intercept": float(m_linear.intercept_)
        },
        "poly": {
            "coef": m_poly.coef_.tolist(),
            "intercept": float(m_poly.intercept_),
            "powers": p_feat.powers_.tolist()
        },
        "ridge": {
            "coef": m_ridge.coef_.tolist(),
            "intercept": float(m_ridge.intercept_)
        },
        "svr": {
            "support_vectors": m_svr.support_vectors_.tolist(),
            "dual_coef": m_svr.dual_coef_[0].tolist(),
            "intercept": float(m_svr.intercept_[0]),
            "gamma": gamma_val
        },
        "rf": {
            "trees": rf_trees
        },
        "performances": performances,
        "analytics_summary": {
            "latest_close": round(float(df.iloc[-1]['Close']), 2),
            "highest_close": round(float(df['Close'].max()), 2),
            "lowest_close": round(float(df['Close'].min()), 2),
            "average_volume": round(float(df['Volume'].mean()), 2),
            "total_records": len(df)
        },
        "historical_data": historical_records
    }

    with open(OUT_JSON_PATH, "w") as f:
        json.dump(bundle_data, f)

    file_size_kb = os.path.getsize(OUT_JSON_PATH) / 1024.0
    print(f"Successfully generated {OUT_JSON_PATH} ({file_size_kb:.2f} KB)")

if __name__ == "__main__":
    generate_bundle()
