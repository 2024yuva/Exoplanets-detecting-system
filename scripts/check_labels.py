from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "raw" / "tois.csv"

df = pd.read_csv(DATA, low_memory=False)

print("=" * 60)
print("TESS Disposition")
print("=" * 60)
print(df["TESS Disposition"].value_counts(dropna=False))

print("\n")

print("=" * 60)
print("TFOPWG Disposition")
print("=" * 60)
print(df["TFOPWG Disposition"].value_counts(dropna=False))