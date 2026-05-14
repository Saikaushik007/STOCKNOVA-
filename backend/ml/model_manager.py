import time
import os
import numpy as np
import pandas as pd
from datetime import timedelta

from ml.data_fetcher import fetch_stock_data
from ml.preprocessor import engineer_features, prepare_data, prepare_future_features
from ml.linear_model import train_linear, train_polynomial, predict as lr_predict
from ml.neural_model import train_neural
from ml.ensemble_model import train_random_forest, train_gradient_boosting
from ml.evaluator import evaluate_model

def run_prediction(ticker: str, model_type: str, period: str, feature_set: str = 'technical'):
    """
    Main orchestration function for training and prediction.
    """
    start_time = time.time()
    
    # 1. Fetch data
    df_raw = fetch_stock_data(ticker, period)
    if df_raw.empty:
        raise ValueError(f"No data found for ticker {ticker}")
    
    # 2. Feature engineering
    df_feat = engineer_features(df_raw)
    
    # 3. Prepare data
    X_train, X_test, y_train, y_test, scaler, split_idx, feature_cols = prepare_data(df_feat, feature_set)
    
    # 4. Train model
    if model_type == 'linear':
        model = train_linear(X_train, y_train)
    elif model_type == 'polynomial':
        model = train_polynomial(X_train, y_train, degree=3)
    elif model_type == 'neural':
        model = train_neural(X_train, y_train)
    elif model_type == 'random_forest':
        model = train_random_forest(X_train, y_train)
    elif model_type == 'gradient_boosting':
        model = train_gradient_boosting(X_train, y_train)
    else:
        raise ValueError(f"Unsupported model type: {model_type}")
        
    # 5. Predict
    train_preds = model.predict(X_train)
    test_preds = model.predict(X_test)
    
    # 6. Evaluate
    metrics = evaluate_model(y_test, test_preds)
    
    # 7. Future prediction (next 7 days)
    future_X = prepare_future_features(df_feat, scaler, feature_set, feature_cols, n_days=7)
    future_preds = model.predict(future_X)
    
    # Calculate confidence bands (±1.96 * RMSE)
    rmse = metrics['rmse']
    lower_bound = future_preds - (1.96 * rmse)
    upper_bound = future_preds + (1.96 * rmse)
    
    # Prepare chart data
    dates = df_feat['Date'].dt.strftime('%Y-%m-%d').tolist()
    actual_prices = df_feat['Close'].tolist()
    
    # Create prediction arrays with nulls for the parts they don't cover
    train_line = [None] * len(df_feat)
    test_line = [None] * len(df_feat)
    
    # Fill in the predictions
    for i, p in enumerate(train_preds):
        train_line[i] = float(p)
        
    for i, p in enumerate(test_preds):
        test_line[split_idx + i] = float(p)
        
    # Future predictions structure
    last_date = df_feat['Date'].iloc[-1]
    future_dates = [(last_date + timedelta(days=i+1)).strftime('%Y-%m-%d') for i in range(7)]
    
    future_data = []
    for i in range(7):
        future_data.append({
            'date': future_dates[i],
            'price': float(future_preds[i]),
            'lower_bound': float(lower_bound[i]),
            'upper_bound': float(upper_bound[i])
        })
        
    end_time = time.time()
    
    return {
        'ticker': ticker,
        'model_type': model_type,
        'period': period,
        'chart_data': {
            'dates': dates,
            'actual_prices': actual_prices,
            'train_predictions': train_line,
            'test_predictions': test_line,
            'split_index': split_idx
        },
        'future_predictions': future_data,
        'metrics': metrics,
        'model_info': {
            'name': model_type.upper(),
            'feature_set': feature_set,
            'n_train_samples': len(X_train),
            'n_test_samples': len(X_test),
            'training_time_ms': round((end_time - start_time) * 1000, 2)
        }
    }

def run_all_models(ticker: str, period: str):
    """
    Train all 3 models and return comparison metrics.
    """
    results = {}
    # Use a subset of models for fast comparison, or all if performance allows
    models_to_run = ['linear', 'polynomial', 'neural', 'random_forest', 'gradient_boosting']
    for mtype in models_to_run:
        try:
            res = run_prediction(ticker, mtype, period)
            results[mtype] = res['metrics']
        except Exception as e:
            print(f"Error comparing model {mtype}: {e}")
            
    best_model = 'linear'
    best_r2 = -float('inf')
    for name, m in results.items():
        if m['r2'] > best_r2:
            best_r2 = m['r2']
            best_model = name
            
    return {
        'metrics': results,
        'best_model': best_model
    }
