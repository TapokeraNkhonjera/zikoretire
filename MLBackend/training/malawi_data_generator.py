import numpy as np
import pandas as pd
from typing import Dict, List, Tuple
import random

class MalawiPensionDataGenerator:
    """
    Generates synthetic pension data tailored for Malawi economic realities
    including formal vs informal workers, seasonal patterns, and local economic conditions
    """
    
    def __init__(self, seed: int = 42):
        np.random.seed(seed)
        random.seed(seed)
        
        # Malawi-specific economic parameters
        self.malawi_params = {
            'avg_monthly_income': 150000,  # MWK ~$200 USD
            'min_wage': 50000,  # Minimum monthly wage
            'formal_sector_ratio': 0.15,  # Only 15% in formal sector
            'inflation_base': 8.5,  # Average inflation rate
            'agriculture_seasonality': True,  # Strong seasonal patterns
            'urban_rural_split': 0.2,  # 20% urban population
        }
        
    def generate_formal_worker(self, n_samples: int = 1000) -> pd.DataFrame:
        """Generate data for formal sector employees"""
        data = []
        
        for _ in range(n_samples):
            # Age distribution (25-60, peak around 35-45)
            age = np.clip(np.random.normal(38, 8), 25, 60)
            
            # Stable income with some variation
            base_income = np.random.normal(250000, 80000)
            monthly_income = max(self.malawi_params['min_wage'] * 2, base_income)
            
            # Consistent contributions (10-15% of income)
            contribution_rate = np.random.uniform(0.10, 0.15)
            monthly_contribution = monthly_income * contribution_rate
            
            # Job stability high for formal sector
            job_stability = np.random.uniform(0.8, 0.95)
            
            # Low contribution gaps
            contribution_gap_months = np.random.poisson(1)
            
            # Some savings
            current_savings = np.random.exponential(500000)
            
            # Retirement planning
            retirement_age = np.random.choice([55, 60], p=[0.3, 0.7])
            
            data.append({
                'age': int(age),
                'retirement_age': retirement_age,
                'monthly_income': monthly_income,
                'monthly_contribution': monthly_contribution,
                'current_savings': current_savings,
                'inflation_rate': np.random.normal(8.5, 2),
                'employment_type': 1,  # Formal
                'job_stability': job_stability,
                'contribution_gap_months': contribution_gap_months,
                'worker_type': 'formal'
            })
        
        return pd.DataFrame(data)
    
    def generate_informal_worker(self, n_samples: int = 2000) -> pd.DataFrame:
        """Generate data for informal sector workers"""
        data = []
        
        for _ in range(n_samples):
            # Age distribution (20-65, more spread out)
            age = np.clip(np.random.normal(40, 12), 20, 65)
            
            # Variable income
            income_type = np.random.choice(['market_vendor', 'artisan', 'small_business', 'casual_labor'])
            
            income_params = {
                'market_vendor': (120000, 60000),
                'artisan': (180000, 90000),
                'small_business': (200000, 120000),
                'casual_labor': (80000, 40000)
            }
            
            mean_income, std_income = income_params[income_type]
            monthly_income = max(30000, np.random.normal(mean_income, std_income))
            
            # Inconsistent contributions
            contribution_rate = np.random.uniform(0.05, 0.12)
            monthly_contribution = monthly_income * contribution_rate
            
            # Lower job stability
            job_stability = np.random.uniform(0.3, 0.7)
            
            # Higher contribution gaps
            contribution_gap_months = np.random.poisson(6)
            
            # Lower savings
            current_savings = np.random.exponential(200000)
            
            # Later retirement planning
            retirement_age = np.random.choice([60, 65], p=[0.4, 0.6])
            
            data.append({
                'age': int(age),
                'retirement_age': retirement_age,
                'monthly_income': monthly_income,
                'monthly_contribution': monthly_contribution,
                'current_savings': current_savings,
                'inflation_rate': np.random.normal(9.0, 2.5),
                'employment_type': 0,  # Informal
                'job_stability': job_stability,
                'contribution_gap_months': contribution_gap_months,
                'worker_type': 'informal',
                'income_category': income_type
            })
        
        return pd.DataFrame(data)
    
    def generate_seasonal_worker(self, n_samples: int = 1500) -> pd.DataFrame:
        """Generate data for seasonal workers (farmers, seasonal businesses)"""
        data = []
        
        for _ in range(n_samples):
            # Age distribution (30-65)
            age = np.clip(np.random.normal(42, 10), 30, 65)
            
            # Seasonal income patterns
            season_type = np.random.choice(['farming', 'tourism', 'seasonal_trade'])
            
            season_params = {
                'farming': (150000, 80000, 0.3),  # (base_income, variation, low_season_factor)
                'tourism': (200000, 100000, 0.2),
                'seasonal_trade': (180000, 90000, 0.25)
            }
            
            base_income, std_income, low_factor = season_params[season_type]
            monthly_income = max(40000, np.random.normal(base_income, std_income))
            
            # Seasonal contribution patterns
            contribution_rate = np.random.uniform(0.08, 0.15)
            monthly_contribution = monthly_income * contribution_rate
            
            # Seasonal job stability
            job_stability = np.random.uniform(0.4, 0.8)
            
            # Seasonal contribution gaps (follows harvest/tourism cycles)
            contribution_gap_months = np.random.poisson(4)
            
            # Variable savings
            current_savings = np.random.exponential(300000)
            
            # Retirement planning often delayed
            retirement_age = np.random.choice([60, 65, 70], p=[0.3, 0.5, 0.2])
            
            data.append({
                'age': int(age),
                'retirement_age': retirement_age,
                'monthly_income': monthly_income,
                'monthly_contribution': monthly_contribution,
                'current_savings': current_savings,
                'inflation_rate': np.random.normal(9.5, 3),
                'employment_type': 2,  # Seasonal
                'job_stability': job_stability,
                'contribution_gap_months': contribution_gap_months,
                'worker_type': 'seasonal',
                'season_type': season_type
            })
        
        return pd.DataFrame(data)
    
    def generate_labels(self, df: pd.DataFrame) -> pd.DataFrame:
        """Generate target labels for ML training"""
        df = df.copy()
        
        # Readiness calculation based on Malawi context
        years_to_retirement = df['retirement_age'] - df['age']
        
        # Projected savings (simplified calculation)
        monthly_return = 0.06 / 12  # Conservative 6% annual return
        total_months = years_to_retirement * 12
        
        # Adjust for contribution gaps
        effective_months = total_months - df['contribution_gap_months']
        effective_months = np.maximum(1, effective_months)
        
        future_contributions = df['monthly_contribution'] * (
            (np.power(1 + monthly_return, effective_months) - 1) / monthly_return
        )
        future_savings = df['current_savings'] * np.power(1 + monthly_return, total_months)
        total_savings = future_contributions + future_savings
        
        # Inflation adjustment
        inflation_factor = np.power(1 - df['inflation_rate']/100, years_to_retirement)
        real_savings = total_savings * inflation_factor
        
        # Required savings (20 years of retirement income)
        required_savings = df['monthly_income'] * 12 * 20
        
        # Readiness score
        readiness = np.minimum(real_savings / required_savings, 1.0)
        
        # Consistency score (inverse of contribution gaps)
        consistency = 1 - (df['contribution_gap_months'] / np.maximum(1, total_months))
        consistency = np.clip(consistency, 0, 1)
        
        # Volatility score (based on job stability and employment type)
        volatility = 1 - df['job_stability']
        volatility = np.where(df['employment_type'] == 0, volatility * 1.5, volatility)  # Higher for informal
        volatility = np.where(df['employment_type'] == 2, volatility * 1.2, volatility)  # Moderate for seasonal
        volatility = np.clip(volatility, 0, 1)
        
        # Sustainability score (how long retirement savings will last)
        annual_withdrawal = df['monthly_income'] * 12
        sustainability_years = real_savings / np.maximum(1, annual_withdrawal)
        sustainability = np.minimum(sustainability_years / 20, 1.0)  # Normalized to 20 years
        
        # Inflation vulnerability (higher for low savings, high inflation)
        inflation_vulnerability = (df['inflation_rate'] / 20) * (1 - real_savings / required_savings)
        inflation_vulnerability = np.clip(inflation_vulnerability, 0, 1)
        
        df['readiness_score'] = readiness
        df['consistency_score'] = consistency
        df['volatility_score'] = volatility
        df['sustainability_score'] = sustainability
        df['inflation_vulnerability_score'] = inflation_vulnerability
        
        return df
    
    def generate_training_data(self, n_formal: int = 1000, n_informal: int = 2000, n_seasonal: int = 1500) -> pd.DataFrame:
        """Generate complete training dataset"""
        
        print("Generating formal worker data...")
        formal_df = self.generate_formal_worker(n_formal)
        
        print("Generating informal worker data...")
        informal_df = self.generate_informal_worker(n_informal)
        
        print("Generating seasonal worker data...")
        seasonal_df = self.generate_seasonal_worker(n_seasonal)
        
        print("Combining datasets...")
        combined_df = pd.concat([formal_df, informal_df, seasonal_df], ignore_index=True)
        
        print("Generating labels...")
        labeled_df = self.generate_labels(combined_df)
        
        # Shuffle the dataset
        labeled_df = labeled_df.sample(frac=1).reset_index(drop=True)
        
        print(f"Generated {len(labeled_df)} training samples")
        print(f"Formal workers: {len(formal_df)}")
        print(f"Informal workers: {len(informal_df)}")
        print(f"Seasonal workers: {len(seasonal_df)}")
        
        return labeled_df
    
    def save_training_data(self, df: pd.DataFrame, output_path: str):
        """Save training data to CSV"""
        df.to_csv(output_path, index=False)
        print(f"Training data saved to {output_path}")
        
        # Print statistics
        print("\nDataset Statistics:")
        print(f"Total samples: {len(df)}")
        print(f"Average age: {df['age'].mean():.1f}")
        print(f"Average monthly income: MWK {df['monthly_income'].mean():,.0f}")
        print(f"Average monthly contribution: MWK {df['monthly_contribution'].mean():,.0f}")
        print(f"Average readiness score: {df['readiness_score'].mean():.3f}")
        print(f"Worker type distribution:")
        print(df['worker_type'].value_counts())
