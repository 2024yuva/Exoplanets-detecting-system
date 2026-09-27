from pathlib import Path
import pandas as pd

# -----------------------------
# Load dataset
# -----------------------------

ROOT = Path(__file__).resolve().parent.parent

DATA = ROOT / "data" / "raw" / "PSCompPars_2026.07.22_01.13.33.csv"

df = pd.read_csv(DATA, comment="#", low_memory=False)

print("=" * 60)
print("Dataset Shape")
print("=" * 60)
print(df.shape)

print("\n")

print("=" * 60)
print("Columns")
print("=" * 60)

for col in df.columns:
    print(col)

print("\n")

print("=" * 60)
print("Data Types")
print("=" * 60)

print(df.dtypes)

print("\n")

print("=" * 60)
print("Missing Values")
print("=" * 60)

print(df.isnull().sum().sort_values(ascending=False).head(30))

print("\n")

print("=" * 60)
print("Sample")
print("=" * 60)

print(df.head())