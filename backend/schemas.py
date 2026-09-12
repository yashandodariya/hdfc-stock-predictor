from pydantic import BaseModel, Field
from typing import List, Dict, Any

class PredictRequest(BaseModel):
    open: float = Field(..., description="Opening price of the day", gt=0)
    high: float = Field(..., description="High price of the day", gt=0)
    low: float = Field(..., description="Low price of the day", gt=0)
    close: float = Field(..., description="Closing price of the day", gt=0)
    volume: float = Field(..., description="Trading volume of the day", gt=0)
    model_name: str = Field("linear", description="The ML model to use for prediction")

class PredictResponse(BaseModel):
    predicted_close: float = Field(..., description="Predicted tomorrow close price")
    input_close: float = Field(..., description="Closing price input by user")
    change: float = Field(..., description="Absolute change in price")
    change_percent: float = Field(..., description="Percentage change in price")

class ModelPerformance(BaseModel):
    model: str = Field(..., description="Name of the model")
    rss: float = Field(..., description="Residual Sum of Squares")
    rmse: float = Field(..., description="Root Mean Squared Error")
    r2: float = Field(..., description="R² (R-squared) Score")

class PerformanceResponse(BaseModel):
    performances: List[ModelPerformance] = Field(..., description="List of performance metrics for all models")

class HealthResponse(BaseModel):
    status: str = Field(..., description="API Status")
    model_loaded: bool = Field(..., description="Whether the ML model is successfully loaded")

class HistoricalRecord(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int

class AnalyticsResponse(BaseModel):
    latest_close: float
    highest_close: float
    lowest_close: float
    average_volume: float
    total_records: int
    historical_data: List[HistoricalRecord]
