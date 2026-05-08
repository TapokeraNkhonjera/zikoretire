import pandas as pd

from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score

from xgboost import XGBRegressor


def benchmark_models(X_train, X_val, y_train, y_val):
    
    models = {
        "RandomForest": RandomForestRegressor(
            n_estimators=200,
            max_depth=10,
            random_state=42
        ),
        "LinearRegression": LinearRegression(),
        "XGBoost": XGBRegressor(
            n_estimators=300,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42
        )
    }

    results = []

    for name, model in models.items():
        print(f"\n🚀 Training {name}...")

        model.fit(X_train, y_train)
        preds = model.predict(X_val)

        mae = mean_absolute_error(y_val, preds)
        r2 = r2_score(y_val, preds)

        results.append({
            "model": name,
            "mae": mae,
            "r2": r2
        })

        print(f"{name} → MAE: {mae:.4f}, R2: {r2:.4f}")

    results_df = pd.DataFrame(results).sort_values(by="r2", ascending=False)

    print("\n🏆 MODEL COMPARISON:")
    print(results_df)

    best_model_name = results_df.iloc[0]["model"]
    print(f"\n✅ Best model: {best_model_name}")

    return results_df, best_model_name