from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt

# ----------------------------
# Paths
# ----------------------------

ROOT = Path(__file__).resolve().parent.parent

DATA = ROOT / "data" / "processed" / "planets_ml_ready.csv"

PLOTS = ROOT / "assets" / "plots"

PLOTS.mkdir(parents=True, exist_ok=True)

# ----------------------------
# Load dataset
# ----------------------------

df = pd.read_csv(DATA)

print("=" * 60)
print("Dataset Information")
print("=" * 60)

print(df.info())

print("\n")

print(df.describe())

# ----------------------------
# Missing Values
# ----------------------------

missing = df.isnull().sum()

missing = missing[missing > 0]

if len(missing):

    plt.figure(figsize=(12,6))

    missing.sort_values().plot(kind="bar")

    plt.title("Missing Values")

    plt.tight_layout()

    plt.savefig(PLOTS / "missing_values.png")

    plt.close()

# ----------------------------
# Numeric Columns
# ----------------------------

numeric = df.select_dtypes(include="number")

# ----------------------------
# Histograms
# ----------------------------

for col in numeric.columns:

    plt.figure(figsize=(6,4))

    numeric[col].hist(bins=30)

    plt.title(col)

    plt.tight_layout()

    plt.savefig(PLOTS / f"{col}_hist.png")

    plt.close()

# ----------------------------
# Boxplots
# ----------------------------

for col in numeric.columns:

    plt.figure(figsize=(6,4))

    plt.boxplot(numeric[col].dropna())

    plt.title(col)

    plt.tight_layout()

    plt.savefig(PLOTS / f"{col}_box.png")

    plt.close()

# ----------------------------
# Correlation Heatmap
# ----------------------------

corr = numeric.corr()

plt.figure(figsize=(12,10))

plt.imshow(corr)

plt.xticks(range(len(corr.columns)), corr.columns, rotation=90)

plt.yticks(range(len(corr.columns)), corr.columns)

plt.colorbar()

plt.tight_layout()

plt.savefig(PLOTS / "correlation_matrix.png")

plt.close()

# ----------------------------
# Discovery Method
# ----------------------------

if "discoverymethod" in df.columns:

    plt.figure(figsize=(10,5))

    df["discoverymethod"].value_counts().head(10).plot(kind="bar")

    plt.title("Top Discovery Methods")

    plt.tight_layout()

    plt.savefig(PLOTS / "discovery_method.png")

    plt.close()

print("\nEDA Completed Successfully!")