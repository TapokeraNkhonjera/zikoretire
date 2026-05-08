#!/usr/bin/env python3
"""
Multi-Model Training Script for ZikoML Pension Intelligence Engine

This script trains all 5 ML models:
1. Readiness Prediction
2. Contribution Consistency 
3. Income Volatility
4. Pension Sustainability
5. Inflation Vulnerability

Usage:
    python train_models.py [--version v1.0.0] [--samples 5000]
"""

import argparse
import os
import sys
from datetime import datetime

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from training.multi_model_trainer import MultiModelTrainer

def main():
    parser = argparse.ArgumentParser(description='Train ZikoML multi-output models')
    parser.add_argument('--version', type=str, help='Model version (auto-generated if not provided)')
    parser.add_argument('--samples', type=int, default=5000, help='Number of training samples to generate')
    parser.add_argument('--formal-ratio', type=float, default=0.15, help='Ratio of formal workers in dataset')
    parser.add_argument('--informal-ratio', type=float, default=0.60, help='Ratio of informal workers in dataset')
    parser.add_argument('--seasonal-ratio', type=float, default=0.25, help='Ratio of seasonal workers in dataset')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("ZIKO PENSION INTELLIGENCE ENGINE - MULTI-MODEL TRAINER")
    print("=" * 60)
    print(f"Training Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Total Samples: {args.samples:,}")
    print(f"Worker Distribution:")
    print(f"  - Formal: {args.formal_ratio:.1%} ({int(args.samples * args.formal_ratio):,} samples)")
    print(f"  - Informal: {args.informal_ratio:.1%} ({int(args.samples * args.informal_ratio):,} samples)")
    print(f"  - Seasonal: {args.seasonal_ratio:.1%} ({int(args.samples * args.seasonal_ratio):,} samples)")
    print()
    
    # Validate ratios sum to 1.0
    total_ratio = args.formal_ratio + args.informal_ratio + args.seasonal_ratio
    if abs(total_ratio - 1.0) > 0.01:
        print(f"ERROR: Ratios must sum to 1.0 (current: {total_ratio:.3f})")
        return 1
    
    try:
        # Initialize trainer
        trainer = MultiModelTrainer()
        
        # Generate training data with specified distribution
        print("Generating Malawi-specific training data...")
        
        n_formal = int(args.samples * args.formal_ratio)
        n_informal = int(args.samples * args.informal_ratio)
        n_seasonal = args.samples - n_formal - n_informal  # Ensure total matches
        
        df = trainer.generate_training_data(
            n_formal=n_formal,
            n_informal=n_informal, 
            n_seasonal=n_seasonal
        )
        
        # Save training data
        data_path = os.path.join("data", "malawi_training_data.csv")
        os.makedirs("data", exist_ok=True)
        df.to_csv(data_path, index=False)
        print(f"Training data saved to: {data_path}")
        
        # Train all models
        print("\nTraining all models...")
        metrics = trainer.train_all_models(df)
        
        # Display training results
        print("\nTRAINING RESULTS:")
        print("-" * 40)
        for model_name, model_metrics in metrics.items():
            print(f"{model_name.upper()}:")
            print(f"  Validation R²: {model_metrics['val_r2']:.4f}")
            print(f"  Validation MSE: {model_metrics['val_mse']:.6f}")
            print(f"  Cross-val R²: {model_metrics['cv_mean']:.4f} ± {model_metrics['cv_std']:.4f}")
            print(f"  Model Type: {model_metrics['model_type']}")
            print()
        
        # Save models with version control
        print("Saving models...")
        version = args.version or trainer.save_models()
        
        # Generate and save report
        report = trainer.generate_training_report()
        report_path = os.path.join("training", f"training_report_{version}.txt")
        os.makedirs("training", exist_ok=True)
        
        with open(report_path, 'w') as f:
            f.write(report)
        
        print(f"\n✅ TRAINING COMPLETED SUCCESSFULLY!")
        print(f"Version: {version}")
        print(f"Report: {report_path}")
        print(f"Models: models/latest/ and models/versions/{version}/")
        
        # Model health check
        print("\nMODEL HEALTH CHECK:")
        try:
            loaded_models = trainer.load_models()
            print(f"✅ {len(loaded_models)} models loaded successfully")
            
            for model_name in loaded_models.keys():
                print(f"  - {model_name}: ✓")
        except Exception as e:
            print(f"❌ Model loading failed: {e}")
            return 1
        
        return 0
        
    except Exception as e:
        print(f"❌ TRAINING FAILED: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
