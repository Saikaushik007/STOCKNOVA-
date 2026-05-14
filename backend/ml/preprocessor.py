import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create technical features and lags for the ML models.
    """
    if df.empty:
        return df
    
    df = df.copy()
    
    # 1. Day Index (Primary for regression)
    df['Day_Index'] = np.arange(len(df))
    
    # 2. Moving Averages
    df['SMA_5'] = df['Close'].rolling(window=5).mean()
    df['SMA_20'] = df['Close'].rolling(window=20).mean()
    df['EMA_12'] = df['Close'].ewm(span=12, adjust=False).mean()
    
    # 3. Price Variations
    df['Price_Change'] = df['Close'].diff()
    df['Price_Change_Pct'] = df['Close'].pct_change()
    df['High_Low_Range'] = df['High'] - df['Low']
    
    # 4. Volume MA
    df['Volume_MA5'] = df['Volume'].rolling(window=5).mean()
    
    # 5. Lags
    df['Lag_1'] = df['Close'].shift(1)
    df['Lag_3'] = df['Close'].shift(3)
    df['Lag_5'] = df['Close'].shift(5)
    
    # Drop rows with NaN created by indicators/lags
    df = df.dropna()
    return df

def prepare_data(df: pd.DataFrame, feature_set: str = 'technical', test_size: float = 0.2):
    """
    Prepare X and y, perform time-series split and scaling.
    """
    feature_map = {
        'basic': ['Day_Index'],
        'technical': ['Day_Index', 'SMA_5', 'SMA_20', 'EMA_12', 'High_Low_Range'],
        'full': ['Day_Index', 'SMA_5', 'SMA_20', 'EMA_12', 'High_Low_Range', 'Volume_MA5', 'Lag_1', 'Lag_3', 'Lag_5']
    }
    
    feature_cols = feature_map.get(feature_set, feature_map['technical'])
    
    X = df[feature_cols].values
    y = df['Close'].values
    
    # Time-series split
    split_idx = int(len(df) * (1 - test_size))
    
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    
    # Scaling
    scaler = MinMaxScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    return X_train_scaled, X_test_scaled, y_train, y_test, scaler, split_idx, feature_cols

def prepare_future_features(df: pd.DataFrame, scaler, feature_set: str, feature_cols: list, n_days: int = 7):
    """
    Generate feature rows for future n_days.
    Extrapolates based on last known values.
    """
    last_row = df.iloc[-1]
    last_day_index = last_row['Day_Index']
    
    future_data = []
    
    # Simple extrapolation for future features
    for i in range(1, n_days + 1):
        row = {}
        for col in feature_cols:
            if col == 'Day_Index':
                row[col] = last_day_index + i
            else:
                # For simplicity in this demo, we assume other features stay constant 
                # or follow the last trend. Realistically, these would need their own models.
                row[col] = last_row[col]
        future_data.append(list(row.values()))
        
    future_X = np.array(future_data)
    return scaler.transform(future_X)
