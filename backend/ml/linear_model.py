from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import Pipeline
import numpy as np

def train_linear(X_train, y_train):
    """Simple Linear Regression"""
    model = LinearRegression()
    model.fit(X_train, y_train)
    return model

def train_polynomial(X_train, y_train, degree: int = 3):
    """Polynomial Regression via Pipeline"""
    model = Pipeline([
        ('poly', PolynomialFeatures(degree=degree, include_bias=False)),
        ('lr', LinearRegression())
    ])
    model.fit(X_train, y_train)
    return model

def predict(model, X):
    """Run prediction"""
    return model.predict(X)

def get_model_coefficients(model, feature_names):
    """Extract coefficients for explainability"""
    if isinstance(model, LinearRegression):
        return dict(zip(feature_names, model.coef_.tolist()))
    elif isinstance(model, Pipeline):
        # Extract from the 'lr' step
        lr_step = model.named_steps['lr']
        return {"intercept": lr_step.intercept_, "n_features": len(lr_step.coef_)}
    return {}
