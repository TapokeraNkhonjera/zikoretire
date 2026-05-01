import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib

# Create simple synthetic data for Malawi seasonality
# Month 1-12, repeating twice
X = np.array([[1], [2], [3], [4], [5], [6], [7], [8], [9], [10], [11], [12]] * 2)
# Random income with a peak in December (Month 12)
y = np.array([200, 210, 190, 180, 220, 250, 230, 210, 200, 240, 300, 450] * 2) * 1000

# Train the model
model = RandomForestRegressor(n_estimators=100)
model.fit(X, y)

# Save it
joblib.dump(model, 'income_model.pkl')
print("Success: income_model.pkl has been created!")
