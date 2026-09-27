from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import json

# -----------------------------------
# Project Paths
# -----------------------------------

ROOT = Path(__file__).resolve().parent.parent

RAW_DATA = ROOT / "data" / "raw" / "tois.csv"
PROCESSED = ROOT / "data" / "processed"

PROCESSED.mkdir(parents=True, exist_ok=True)

# -----------------------------------
# Load Dataset
# -----------------------------------

print("Loading dataset...")

df = pd.read_csv(RAW_DATA)

print(df.shape)

# -----------------------------------
# Remove duplicate rows
# -----------------------------------

df.drop_duplicates(inplace=True)

# -----------------------------------
# Remove rows with too many missing values
# -----------------------------------

df = df.dropna(thresh=int(df.shape[1] * 0.7))

# -----------------------------------
# Fill remaining missing values
# -----------------------------------

numeric_cols = df.select_dtypes(include=np.number).columns

df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())

categorical_cols = df.select_dtypes(exclude=np.number).columns

for col in categorical_cols:
    df[col] = df[col].fillna(df[col].mode()[0])

print("Missing values handled.")

# -----------------------------------
# Save cleaned dataset
# -----------------------------------

cleaned_path = PROCESSED / "toi_cleaned.csv"

df.to_csv(cleaned_path, index=False)

print("Saved cleaned dataset.")