from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np

def evaluate_model(y_true, y_pred) -> dict:
    """
    Calculate performance metrics.
    """
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    
    # MAPE (Mean Absolute Percentage Error)
    mape = np.mean(np.abs((y_true - y_pred) / y_true)) * 100
    
    # Direction Accuracy (did we guess the movement right?)
    actual_diff = np.diff(y_true)
    pred_diff = np.diff(y_pred)
    direction_accuracy = np.mean((actual_diff > 0) == (pred_diff > 0)) * 100
    
    # Verdict logic
    if r2 >= 0.85:
        verdict = 'STRONG FIT'
    elif r2 >= 0.70:
        verdict = 'GOOD FIT'
    elif r2 >= 0.50:
        verdict = 'MODERATE FIT'
    else:
        verdict = 'WEAK FIT'
        
    return {
        'mae': round(float(mae), 2),
        'rmse': round(float(rmse), 2),
        'r2': round(float(r2), 4),
        'mape': round(float(mape), 2),
        'direction_accuracy': round(float(direction_accuracy), 2),
        'verdict': verdict
    }

def compare_models(results: dict) -> dict:
    """Compare multiple model results and find the best one."""
    best_model = None
    best_r2 = -float('inf')
    
    for name, metrics in results.items():
        if metrics['r2'] > best_r2:
            best_r2 = metrics['r2']
            best_model = name
            
    return {
        'best_model': best_model,
        'all_metrics': results
    }
