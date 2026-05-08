import pandas as pd
from config import DATA_PATH

def load_data():
    df = pd.read_csv(DATA_PATH)
    df = df.fillna(df.median(numeric_only=True))
    print("COLUMNS:", df.columns.tolist())
    print("SHAPE:", df.shape)
    print(df.head())
    return df

