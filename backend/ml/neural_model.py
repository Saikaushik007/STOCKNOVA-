from sklearn.neural_network import MLPRegressor
import numpy as np

def train_neural(X_train, y_train, hidden_layers=(64, 32)):
    """
    MLPRegressor (Multi-layer Perceptron) for time-series prediction.
    """
    model = MLPRegressor(
        hidden_layer_sizes=hidden_layers,
        activation='relu',
        solver='adam',
        max_iter=500,
        random_state=42,
        early_stopping=True,
        validation_fraction=0.1,
        n_iter_no_change=20,
        learning_rate_init=0.001,
        tol=1e-4
    )
    
    model.fit(X_train, y_train)
    return model

def get_training_info(model):
    """Get neural network training stats"""
    return {
        'n_iter': model.n_iter_,
        'loss': float(model.best_loss_),
        'n_layers': len(model.hidden_layer_sizes) + 2,
        'architecture': str(model.hidden_layer_sizes)
    }
