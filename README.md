# STOCKNOVA — AI Stock Price Prediction Platform

STOCKNOVA is a professional-grade financial intelligence dashboard that provides real-time stock price predictions using Machine Learning.

## ✨ Features
- **3 ML Models**: Linear Regression, Polynomial Regression, and Neural Networks (MLP).
- **Technical Indicators**: RSI, MACD, SMA, EMA, and Bollinger Bands.
- **Statistical Analytics**: Volatility, Sharpe Ratio, Max Drawdown, and more.
- **Cinematic UI**: Dark glassmorphic terminal with data-stream animations.
- **7-Day Forecast**: Future price predictions with confidence intervals.

## 🚀 Setup & Installation

### 1. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 2. Start the Backend
```bash
python backend/server.py
```

### 3. Open in Browser
Visit [http://localhost:5000](http://localhost:5000)

## 🛠 Tech Stack
- **Backend**: Flask, yfinance, scikit-learn, pandas, numpy
- **Frontend**: Vanilla JS, Chart.js, Vanilla CSS3 (Custom Properties)
- **Design**: Space Grotesk & JetBrains Mono typography

## 📈 Supported Assets
Supports US Stocks (AAPL, TSLA, etc.), Indian Stocks (INFY.NS, TCS.NS), and Crypto (BTC-USD, ETH-USD).
