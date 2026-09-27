from pathlib import Path
import pandas as pd

# Project root
ROOT = Path(__file__).resolve().parent.parent

DATA = ROOT / "data" / "raw" / "tois.csv"

print("Loading:", DATA)

df = pd.read_csv(DATA, low_memory=False)

print("=" * 60)
print("Dataset Shape")
print("=" * 60)
print(df.shape)

print("\n")

print("=" * 60)
print("Columns")
print("=" * 60)
print(df.columns.tolist())

print("\n")

print("=" * 60)
print("First 5 Rows")
print("=" * 60)
print(df.head())

print("\n")

print("=" * 60)
print("Data Types")
print("=" * 60)
print(df.dtypes)

print("\n")

print("=" * 60)
print("Top 20 Missing Values")
print("=" * 60)
print(df.isnull().sum().sort_values(ascending=False).head(20))