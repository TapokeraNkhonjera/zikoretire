import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.preprocessing import StandardScaler
from datetime import datetime
import json

from training.malawi_data_generator import MalawiPensionDataGenerator
from core.features import FEATURES

class MultiModelTrainer:
    """
    Trains multiple ML models for different pension prediction outputs
    with version control and model persistence
    """
    
    def __init__(self, models_dir: str = "models"):
        self.models_dir = models_dir
        self.latest_dir = os.path.join(models_dir, "latest")
        self.versions_dir = os.path.join(models_dir, "versions")
        
        # Ensure directories exist
        os.makedirs(self.latest_dir, exist_ok=True)
        os.makedirs(self.versions_dir, exist_ok=True)
        
        # Model configurations
        self.model_configs = {
            'readiness': {
                'model_type': 'RandomForest',
                'params': {
                    'n_estimators': 100,
                    'max_depth': 10,
                    'random_state': 42,
                    'min_samples_split': 5,
                    'min_samples_leaf': 2
                }
            },
            'consistency': {
                'model_type': 'GradientBoosting',
                'params': {
                    'n_estimators': 100,
                    'learning_rate': 0.1,
                    'max_depth': 6,
                    'random_state': 42
                }
            },
            'volatility': {
                'model_type': 'RandomForest',
                'params': {
                    'n_estimators': 150,
                    'max_depth': 8,
                    'random_state': 42,
                    'min_samples_split': 10
                }
            },
            'sustainability': {
                'model_type': 'GradientBoosting',
                'params': {
                    'n_estimators': 120,
                    'learning_rate': 0.08,
                    'max_depth': 7,
                    'random_state': 42
                }
            },
            'inflation_vulnerability': {
                'model_type': 'RandomForest',
                'params': {
                    'n_estimators': 80,
                    'max_depth': 12,
                    'random_state': 42,
                    'min_samples_leaf': 3
                }
            }
        }
        
        self.trained_models = {}
        self.model_metrics = {}
    
    def generate_training_data(self, n_formal: int = 800, n_informal: int = 3200, n_seasonal: int = 1200) -> pd.DataFrame:
        """Generate training data using Malawi-specific generator"""
        print("Generating Malawi-specific training data...")
        generator = MalawiPensionDataGenerator(seed=42)
        
        # Generate dataset with specified distribution
        df = generator.generate_training_data(
            n_formal=n_formal,
            n_informal=n_informal,
            n_seasonal=n_seasonal
        )
        
        return df
    
    def prepare_data(self, df: pd.DataFrame) -> tuple:
        """Prepare features and targets for training"""
        # Feature columns
        feature_columns = FEATURES
        
        # Target columns
        target_columns = [
            'readiness_score',
            'consistency_score', 
            'volatility_score',
            'sustainability_score',
            'inflation_vulnerability_score'
        ]
        
        X = df[feature_columns]
        y = df[target_columns]
        
        return X, y, target_columns
    
    def create_model(self, config: dict):
        """Create model based on configuration"""
        model_type = config['model_type']
        params = config['params']
        
        if model_type == 'RandomForest':
            return RandomForestRegressor(**params)
        elif model_type == 'GradientBoosting':
            return GradientBoostingRegressor(**params)
        else:
            raise ValueError(f"Unsupported model type: {model_type}")
    
    def train_single_model(self, model_name: str, X_train, y_train, X_val, y_val) -> tuple:
        """Train a single model and return metrics"""
        print(f"Training {model_name} model...")
        
        config = self.model_configs[model_name]
        model = self.create_model(config)
        
        # Train model
        model.fit(X_train, y_train)
        
        # Predictions
        y_pred_train = model.predict(X_train)
        y_pred_val = model.predict(X_val)
        
        # Metrics
        train_mse = mean_squared_error(y_train, y_pred_train)
        val_mse = mean_squared_error(y_val, y_pred_val)
        train_r2 = r2_score(y_train, y_pred_train)
        val_r2 = r2_score(y_val, y_pred_val)
        train_mae = mean_absolute_error(y_train, y_pred_train)
        val_mae = mean_absolute_error(y_val, y_pred_val)
        
        # Cross-validation
        cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='r2')
        
        metrics = {
            'train_mse': train_mse,
            'val_mse': val_mse,
            'train_r2': train_r2,
            'val_r2': val_r2,
            'train_mae': train_mae,
            'val_mae': val_mae,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'model_type': config['model_type'],
            'params': config['params']
        }
        
        return model, metrics
    
    def train_all_models(self, df: pd.DataFrame) -> dict:
        """Train all models"""
        print("Preparing data for training...")
        X, y, target_columns = self.prepare_data(df)
        
        # Split data
        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=None
        )
        
        print(f"Training set size: {len(X_train)}")
        print(f"Validation set size: {len(X_val)}")
        
        # Train each model
        for i, target in enumerate(target_columns):
            model_name = target.replace('_score', '')
            
            model, metrics = self.train_single_model(
                model_name, 
                X_train, 
                y_train.iloc[:, i], 
                X_val, 
                y_val.iloc[:, i]
            )
            
            self.trained_models[model_name] = model
            self.model_metrics[model_name] = metrics
            
            print(f"{model_name} - Val R²: {metrics['val_r2']:.3f}, Val MSE: {metrics['val_mse']:.4f}")
        
        return self.model_metrics
    
    def save_models(self, version: str = None) -> str:
        """Save models with version control"""
        if version is None:
            version = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        version_dir = os.path.join(self.versions_dir, version)
        os.makedirs(version_dir, exist_ok=True)
        
        # Save individual models
        for model_name, model in self.trained_models.items():
            model_path = os.path.join(version_dir, f"{model_name}_model.pkl")
            joblib.dump(model, model_path)
            
            # Also save to latest
            latest_path = os.path.join(self.latest_dir, f"{model_name}_model.pkl")
            joblib.dump(model, latest_path)
        
        # Save metadata
        metadata = {
            'version': version,
            'created_at': datetime.now().isoformat(),
            'models': list(self.trained_models.keys()),
            'metrics': self.model_metrics,
            'features': FEATURES
        }
        
        metadata_path = os.path.join(version_dir, "metadata.json")
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        # Also save metadata to latest
        latest_metadata_path = os.path.join(self.latest_dir, "metadata.json")
        with open(latest_metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Models saved with version: {version}")
        return version
    
    def load_models(self, version: str = None) -> dict:
        """Load models from specific version or latest"""
        if version is None:
            load_dir = self.latest_dir
        else:
            load_dir = os.path.join(self.versions_dir, version)
            if not os.path.exists(load_dir):
                raise ValueError(f"Version {version} not found")
        
        models = {}
        for model_name in self.model_configs.keys():
            model_path = os.path.join(load_dir, f"{model_name}_model.pkl")
            if os.path.exists(model_path):
                models[model_name] = joblib.load(model_path)
            else:
                print(f"Warning: Model {model_name} not found at {model_path}")
        
        return models
    
    def evaluate_models(self, X_test, y_test) -> dict:
        """Evaluate all trained models on test data"""
        evaluation_results = {}
        
        for i, target in enumerate(['readiness_score', 'consistency_score', 'volatility_score', 
                                   'sustainability_score', 'inflation_vulnerability_score']):
            model_name = target.replace('_score', '')
            
            if model_name in self.trained_models:
                model = self.trained_models[model_name]
                y_pred = model.predict(X_test)
                
                metrics = {
                    'mse': mean_squared_error(y_test.iloc[:, i], y_pred),
                    'r2': r2_score(y_test.iloc[:, i], y_pred),
                    'mae': mean_absolute_error(y_test.iloc[:, i], y_pred)
                }
                
                evaluation_results[model_name] = metrics
        
        return evaluation_results
    
    def generate_training_report(self) -> str:
        """Generate a comprehensive training report"""
        report = []
        report.append("=" * 60)
        report.append("MULTI-MODEL TRAINING REPORT")
        report.append("=" * 60)
        report.append(f"Training Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append(f"Models Trained: {len(self.trained_models)}")
        report.append("")
        
        for model_name, metrics in self.model_metrics.items():
            report.append(f"MODEL: {model_name.upper()}")
            report.append("-" * 30)
            report.append(f"Type: {metrics['model_type']}")
            report.append(f"Validation R²: {metrics['val_r2']:.4f}")
            report.append(f"Validation MSE: {metrics['val_mse']:.6f}")
            report.append(f"Validation MAE: {metrics['val_mae']:.4f}")
            report.append(f"Cross-val R²: {metrics['cv_mean']:.4f} ± {metrics['cv_std']:.4f}")
            report.append("")
        
        return "\n".join(report)

def main():
    """Main training pipeline"""
    trainer = MultiModelTrainer()
    
    # Generate training data with default distribution
    df = trainer.generate_training_data()
    
    # Save training data for reference
    data_path = os.path.join("data", "malawi_training_data.csv")
    os.makedirs("data", exist_ok=True)
    df.to_csv(data_path, index=False)
    print(f"Training data saved to {data_path}")
    
    # Train all models
    metrics = trainer.train_all_models(df)
    
    # Save models
    version = trainer.save_models()
    
    # Generate and save report
    report = trainer.generate_training_report()
    report_path = os.path.join("training", f"training_report_{version}.txt")
    os.makedirs("training", exist_ok=True)
    with open(report_path, 'w') as f:
        f.write(report)
    
    print(f"\nTraining completed successfully!")
    print(f"Version: {version}")
    print(f"Report saved to: {report_path}")
    print("\n" + report)

if __name__ == "__main__":
    main()
