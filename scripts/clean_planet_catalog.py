from pathlib import Path
import pandas as pd
import numpy as np
import json

# ----------------------------
# Paths
# ----------------------------

ROOT = Path(__file__).resolve().parent.parent

RAW = ROOT / "data" / "raw" / "PSCompPars_2026.07.22_01.13.33.csv"

PROCESSED = ROOT / "data" / "processed"
PROCESSED.mkdir(parents=True, exist_ok=True)

# ----------------------------
# Load Dataset
# ----------------------------

print("Loading dataset...")

df = pd.read_csv(RAW, comment="#", low_memory=False)

print(f"Original Shape : {df.shape}")

# ----------------------------
# Remove duplicate planets
# ----------------------------

before = len(df)

df = df.drop_duplicates(subset=["pl_name"])

duplicates_removed = before - len(df)

# ----------------------------
# Drop empty columns
# ----------------------------

empty_cols = df.columns[df.isnull().all()]

df.drop(columns=empty_cols, inplace=True)

# ----------------------------
# Remove columns having >70% missing values
# ----------------------------

missing_percent = df.isnull().mean()

drop_cols = missing_percent[missing_percent > 0.70].index

df.drop(columns=drop_cols, inplace=True)

# ----------------------------
# Fill Missing Values
# ----------------------------

numeric_cols = df.select_dtypes(include=np.number).columns

for col in numeric_cols:
    df[col] = df[col].fillna(df[col].median())

categorical_cols = df.select_dtypes(exclude=np.number).columns

for col in categorical_cols:

    if df[col].isnull().sum() > 0:

        mode = df[col].mode()

        if len(mode):
            df[col] = df[col].fillna(mode.iloc[0])
        else:
            df[col] = df[col].fillna("Unknown")

# ----------------------------
# Remove constant columns
# ----------------------------

constant_cols = []

for col in df.columns:

    if df[col].nunique() <= 1:
        constant_cols.append(col)

df.drop(columns=constant_cols, inplace=True)

print(f"Final Shape : {df.shape}")

# ----------------------------
# Save Clean Dataset
# ----------------------------

clean_path = PROCESSED / "planets_cleaned.csv"

df.to_csv(clean_path, index=False)

# ----------------------------
# Summary
# ----------------------------

summary = {

    "original_rows": before,
    "final_rows": len(df),

    "original_columns": 325,
    "final_columns": len(df.columns),

    "duplicates_removed": duplicates_removed,

    "empty_columns_removed": len(empty_cols),

    "high_missing_columns_removed": len(drop_cols),

    "constant_columns_removed": len(constant_cols)

}

with open(PROCESSED / "planet_preprocess_summary.json","w") as f:

    json.dump(summary,f,indent=4)

print("\nCleaning Complete!")

print(summary)