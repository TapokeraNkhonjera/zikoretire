from sklearn.metrics import mean_absolute_error, r2_score

def validate_model(model, X_val, y_val):
    """
    Evaluates an already trained model.
    DOES NOT train or modify it.
    """

    preds = model.predict(X_val)

    mae = mean_absolute_error(y_val, preds)
    r2 = r2_score(y_val, preds)

    return float(mae), float(r2)