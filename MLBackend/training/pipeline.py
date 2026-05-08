from training.data_loader import load_data
from training.validate import validate_model
from utils.model_versioning import save_model

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression

try:
    from xgboost import XGBRegressor
except Exception:
    XGBRegressor = None

from core.features import FEATURES

import pandas as pd


# =========================================================
# MODEL BENCHMARKING
# =========================================================
def benchmark_models(X_train, X_val, y_train, y_val):

    models = {
        "RandomForest": RandomForestRegressor(
            n_estimators=200,
            max_depth=10,
            random_state=42
        ),

        "LinearRegression": LinearRegression(),

    }
    if XGBRegressor is not None:
        models["XGBoost"] = XGBRegressor(
            n_estimators=300,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42
        )

    results = []

    for name, model in models.items():
        print(f"\n🚀 Training {name}...")

        model.fit(X_train, y_train)
        preds = model.predict(X_val)

        mae, r2 = validate_model(model, X_val, y_val)

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

    print(f"\n✅ Best model selected: {best_model_name}")

    return best_model_name


# =========================================================
# PIPELINE
# =========================================================
def run_pipeline():

    print("🔄 Loading data...")
    df = load_data()

    print("📊 Dataset shape:", df.shape)
    print("📊 Columns:", df.columns.tolist())

    # =====================================================
    # REMOVE LEAKAGE FEATURES
    # =====================================================
    X = df[FEATURES]
    y = df["readiness"]

    # =====================================================
    # TRAIN / VALIDATION SPLIT
    # =====================================================
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # =====================================================
    # MODEL BENCHMARKING (OPTION A)
    # =====================================================
    best_model_name = benchmark_models(
        X_train, X_val, y_train, y_val
    )

    # =====================================================
    # FINAL MODEL SELECTION
    # =====================================================
    print(f"\n🏋️ Training final model: {best_model_name}")

    if best_model_name == "RandomForest":
        final_model = RandomForestRegressor(
            n_estimators=200,
            max_depth=10,
            random_state=42
        )

    elif best_model_name == "LinearRegression":
        final_model = LinearRegression()

    elif best_model_name == "XGBoost" and XGBRegressor is not None:
        final_model = XGBRegressor(
            n_estimators=300,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42
        )

    else:
        raise ValueError("Unknown model selected")

    # =====================================================
    # TRAIN FINAL MODEL
    # =====================================================
    final_model.fit(X_train, y_train)

    # =====================================================
    # FINAL VALIDATION
    # =====================================================
    print("\n📊 Final validation...")
    mae, r2 = validate_model(final_model, X_val, y_val)

    metrics = {
        "mae": mae,
        "r2": r2
    }

    # =====================================================
    # SAVE VERSIONED MODEL
    # =====================================================
    print("\n💾 Saving model...")
    result = save_model(final_model, metrics)

    print("\n✅ Pipeline complete!")
    print(result)

    return result


if __name__ == "__main__":
    run_pipeline()