from fastapi import FastAPI
from pydantic import BaseModel, Field, ValidationError
from typing import List
import yfinance as yf
import pandas as pd
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import math

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

class Stock(BaseModel):
    ticker: str = Field(..., min_length=1, description="Ticker symbol must not be empty")
    weight: float = Field(..., gt=0, description="Weight must be a positive number")

class PortfolioRequest(BaseModel):
    portfolio: List[Stock] = Field(..., min_items=1, description="Portfolio must contain at least one stock")
    confidence_level: float = Field(0.95, ge=0, le=1, description="Confidence level must be between 0 and 1")

@app.post("/analyze_portfolio")
def analyze_portfolio(portfolio: List[Stock]):
    try:
        # Validate portfolio
        PortfolioRequest(portfolio=portfolio)
    except ValidationError as e:
        return {"error": e.errors()}

    data = {}
    weights = [stock.weight for stock in portfolio]
    invalid_tickers = []  # Track invalid tickers

    for stock in portfolio:
        try:
            ticker_data = yf.Ticker(stock.ticker)
            history = ticker_data.history(period="1y")
            if history.empty:
                raise ValueError(f"No data found for ticker: {stock.ticker}")
            data[stock.ticker] = history["Close"].pct_change().dropna()  # Daily returns
        except Exception as e:
            invalid_tickers.append(stock.ticker)

    if invalid_tickers:
        return {
            "error": "Some tickers are invalid or have no data.",
            "invalid_tickers": invalid_tickers
        }

    # Combine returns into a DataFrame
    returns_df = pd.DataFrame(data)

    # Sanitize the DataFrame: Drop rows with NaN or Infinity
    returns_df = returns_df.replace([np.inf, -np.inf], np.nan).dropna()

    # Calculate portfolio metrics
    portfolio_returns = np.dot(returns_df.mean(), weights)  # Weighted average return
    portfolio_volatility = np.sqrt(np.dot(weights, np.dot(returns_df.cov(), weights)))  # Risk

    risk_free_rate = 0.02 / 252  # Daily risk-free rate (assuming 252 trading days in a year)

    # Sharpe Ratio
    sharpe_ratio = (portfolio_returns - risk_free_rate) / portfolio_volatility

    # Maximum Drawdown
    cumulative_returns = (1 + returns_df).cumprod()
    drawdown = cumulative_returns / cumulative_returns.cummax() - 1
    max_drawdown = drawdown.min().min()  # Minimum value across all stocks

    # Calculate portfolio daily returns
    portfolio_daily_returns = returns_df.dot(weights)

    def sanitize_value(value):
        if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
            return None  # Replace with a default value if needed
        return value

    def sanitize_data_and_trim(data, dates):
        sanitized_data = []
        sanitized_dates = []
        for value, date in zip(data, dates):
            if not (isinstance(value, float) and (math.isnan(value) or math.isinf(value))):
                sanitized_data.append(value)
                sanitized_dates.append(date)
        return sanitized_data, sanitized_dates

    # Sanitize and trim the response data
    sanitized_portfolio_daily_returns, valid_dates = sanitize_data_and_trim(portfolio_daily_returns.tolist(), portfolio_daily_returns.index.strftime('%Y-%m-%d').tolist())

    return {
        "portfolio": portfolio,
        "portfolio_returns": sanitize_value(portfolio_returns),
        "portfolio_volatility": sanitize_value(portfolio_volatility),
        "sharpe_ratio": sanitize_value(sharpe_ratio),
        "max_drawdown": sanitize_value(max_drawdown),
        "portfolio_daily_returns": sanitized_portfolio_daily_returns,
        "dates": valid_dates
    }

@app.post("/calculate_var")
def calculate_var(request: PortfolioRequest):
    try:
        # Validate request
        request = PortfolioRequest(**request.dict())
    except ValidationError as e:
        return {"error": e.errors()}

    portfolio = request.portfolio
    confidence_level = request.confidence_level

    data = {}
    weights = [stock.weight for stock in portfolio]
    invalid_tickers = []  # Track invalid tickers

    # Fetch historical data and calculate daily returns
    for stock in portfolio:
        try:
            ticker_data = yf.Ticker(stock.ticker)
            history = ticker_data.history(period="1y")
            if history.empty:
                raise ValueError(f"No data found for ticker: {stock.ticker}")
            data[stock.ticker] = history["Close"].pct_change().dropna()  # Daily returns
        except Exception as e:
            invalid_tickers.append(stock.ticker)

    if invalid_tickers:
        return {
            "error": "Some tickers are invalid or have no data.",
            "invalid_tickers": invalid_tickers
        }

    # Combine returns into a DataFrame
    returns_df = pd.DataFrame(data)

    # Calculate portfolio daily returns
    portfolio_daily_returns = returns_df.dot(weights)

    # Sort returns and calculate VaR
    sorted_returns = portfolio_daily_returns.sort_values()
    var_index = int((1 - confidence_level) * len(sorted_returns))
    var = sorted_returns.iloc[var_index]

    # Calculate Expected Shortfall (ES)
    es = sorted_returns.iloc[:var_index].mean()

    return {
        "confidence_level": confidence_level,
        "value_at_risk": var,
        "expected_shortfall": es,
        "portfolio_daily_returns": portfolio_daily_returns.tolist()
    }

@app.exception_handler(RequestValidationError)
def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )

@app.get("/tickers")
def get_tickers():
    try:
        # Fetch tickers from Yahoo Finance
        tickers_data = yf.Tickers("AAPL MSFT AMZN TSLA GOOG NFLX NVDA JPM BAC XOM PFE KO DIS")
        tickers = []

        for symbol, ticker in tickers_data.tickers.items():
            if ticker.info:
                tickers.append({
                    "symbol": symbol,
                    "name": ticker.info.get("shortName", "Unknown")
                })

        return tickers
    except Exception as e:
        return {"error": "Failed to fetch tickers", "details": str(e)}

@app.get("/analyze_stock")
def analyze_stock(ticker: str):
    try:
        # Fetch historical data for the stock
        ticker_data = yf.Ticker(ticker)
        history = ticker_data.history(period="1y")

        if history.empty:
            return {"error": f"No data found for ticker: {ticker}"}

        # Calculate historical metrics
        historical_prices = history["Close"].tolist()
        dates = history.index.strftime('%Y-%m-%d').tolist()
        daily_returns = history["Close"].pct_change().dropna()

        average_return = daily_returns.mean()
        volatility = daily_returns.std()

        # Placeholder for prediction (can be replaced with a real model)
        prediction = "Uptrend" if average_return > 0 else "Downtrend"

        return {
            "average_return": average_return,
            "volatility": volatility,
            "prediction": prediction,
            "historical_prices": historical_prices,
            "dates": dates
        }
    except Exception as e:
        return {"error": "Failed to analyze stock", "details": str(e)}