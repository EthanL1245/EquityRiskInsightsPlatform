import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from xgboost import XGBClassifier
import joblib
import os

# Fetch historical data for a stock
def fetch_data(ticker):
    ticker_data = yf.Ticker(ticker)
    history = ticker_data.history(period="1y")
    if history.empty:
        raise ValueError(f"No data found for ticker: {ticker}")
    return history

# Fetch historical data for multiple stocks
def fetch_multiple_stocks(tickers):
    combined_data = []
    for ticker in tickers:
        try:
            data = fetch_data(ticker)
            combined_data.append(data)
        except ValueError as e:
            print(f"Error fetching data for {ticker}: {e}")
    combined_df = pd.concat(combined_data, keys=tickers, names=['Ticker', 'Date']).reset_index()
    return combined_df

# Feature engineering
# Ensure features are calculated per stock to avoid data leakage
def create_features(data):
    def process_group(group):
        group = group.copy()  # Avoid modifying the original data
        group['Daily Return'] = group['Close'].pct_change()
        group['SMA_10'] = group['Close'].rolling(window=10).mean()
        group['SMA_50'] = group['Close'].rolling(window=50).mean()
        group['RSI'] = 100 - (100 / (1 + group['Close'].diff().clip(lower=0).rolling(window=14).mean() /
                                    -group['Close'].diff().clip(upper=0).rolling(window=14).mean()))
        group['Label'] = (group['Daily Return'].shift(-1) > 0).astype(int)  # 1 for uptrend, 0 for downtrend
        return group.dropna()

    return data.groupby('Ticker', group_keys=False).apply(process_group)

# Train the model on multiple stocks
def train_model_multiple_stocks(tickers):
    data = fetch_multiple_stocks(tickers)
    data = create_features(data)

    features = data[['SMA_10', 'SMA_50', 'RSI']]
    labels = data['Label']

    X_train, X_test, y_train, y_test = train_test_split(features, labels, test_size=0.2, random_state=42)

    model = XGBClassifier(eval_metric='logloss')
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    print(f"Model Accuracy: {accuracy * 100:.2f}%")

    # Save the model
    model_dir = 'models'
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'basic_stock_model.pkl')
    joblib.dump(model, model_path)
    print(f"Model saved as '{model_path}'")

if __name__ == "__main__":
    tickers = ["AAPL", "MSFT", "GOOG", "AMZN", "TSLA"]  # Example tickers
    train_model_multiple_stocks(tickers)
