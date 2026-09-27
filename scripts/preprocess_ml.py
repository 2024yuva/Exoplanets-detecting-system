from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib
import json

# -------------------------------------------------
# Paths
# -------------------------------------------------

ROOT = Path(__file__).resolve().parent.parent

DATA = ROOT / "data" / "raw" / "tois.csv"
OUTPUT = ROOT / "data" / "processed"

OUTPUT.mkdir(parents=True, exist_ok=True)

# -------------------------------------------------
# Load
# -------------------------------------------------

print("Loading TOI dataset...")

df = pd.read_csv(DATA, low_memory=False)

print("Original Shape:", df.shape)

# -------------------------------------------------
# Remove rows without labels
# -------------------------------------------------

df = df.dropna(subset=["TFOPWG Disposition"])

# -------------------------------------------------
# Target
# -------------------------------------------------

# -------------------------------------------------
# Target (Merge to 3 Classes)
# -------------------------------------------------

label_map = {
    "CP": "Confirmed",
    "KP": "Confirmed",

    "PC": "Candidate",
    "APC": "Candidate",

    "FP": "False Positive",
    "FA": "False Positive"
}

df = df[df["TFOPWG Disposition"].isin(label_map.keys())]

df["Target"] = df["TFOPWG Disposition"].map(label_map)

print("\nTarget Distribution")

print(df["Target"].value_counts())

y = df["Target"]

# -------------------------------------------------
# Selected Features
# -------------------------------------------------

selected_features = [

    "Imaging Observations",
    "Spectroscopy Observations",
    "Time Series Observations",

    "Predicted Mass (M_Earth)",
    "Predicted Radial Velocity Semi-amplitude (m/s)",

    "TESS Mag",

    "Planet Num",

    "Period (days)",
    "Duration (hours)",
    "Depth (ppm)",

    "Planet Radius (R_Earth)",
    "Planet Insolation (Earth Flux)",
    "Planet Equil Temp (K)",

    "Planet SNR",

    "Stellar Distance (pc)",
    "Stellar Eff Temp (K)",
    "Stellar log(g) (cm/s^2)",
    "Stellar Radius (R_Sun)",
    "Stellar Metallicity",
    "Stellar Mass (M_Sun)"

]

selected_features = [c for c in selected_features if c in df.columns]

X = df[selected_features].copy()

# -------------------------------------------------
# Missing Values
# -------------------------------------------------

for col in X.columns:
    X[col] = X[col].fillna(X[col].median())

# -------------------------------------------------
# Encode Labels
# -------------------------------------------------

encoder = LabelEncoder()

y = encoder.fit_transform(y)

# -------------------------------------------------
# Scale Features
# -------------------------------------------------

scaler = StandardScaler()

X_scaled = scaler.fit_transform(X)

# -------------------------------------------------
# Train / Validation / Test Split
# -------------------------------------------------

X_train, X_temp, y_train, y_temp = train_test_split(
    X_scaled,
    y,
    test_size=0.30,
    random_state=42,
    stratify=y
)

X_val, X_test, y_val, y_test = train_test_split(
    X_temp,
    y_temp,
    test_size=0.50,
    random_state=42,
    stratify=y_temp
)

# -------------------------------------------------
# Save Arrays
# -------------------------------------------------

np.save(OUTPUT / "X_train.npy", X_train)
np.save(OUTPUT / "X_val.npy", X_val)
np.save(OUTPUT / "X_test.npy", X_test)

np.save(OUTPUT / "y_train.npy", y_train)
np.save(OUTPUT / "y_val.npy", y_val)
np.save(OUTPUT / "y_test.npy", y_test)

# -------------------------------------------------
# Save Objects
# -------------------------------------------------

joblib.dump(scaler, OUTPUT / "scaler.pkl")
joblib.dump(encoder, OUTPUT / "label_encoder.pkl")

with open(OUTPUT / "feature_names.json", "w") as f:
    json.dump(selected_features, f, indent=4)

# -------------------------------------------------
# Summary
# -------------------------------------------------

summary = {
    "original_shape": list(df.shape),
    "selected_features": len(selected_features),
    "train_shape": list(X_train.shape),
    "validation_shape": list(X_val.shape),
    "test_shape": list(X_test.shape),
    "classes": encoder.classes_.tolist()
}

with open(OUTPUT / "ml_preprocess_summary.json", "w") as f:
    json.dump(summary, f, indent=4)

# -------------------------------------------------

print("\nPreprocessing Completed Successfully!\n")

print("Train      :", X_train.shape)
print("Validation :", X_val.shape)
print("Test       :", X_test.shape)

print("\nSelected Features:")
for feature in selected_features:
    print(" -", feature)

print("\nClasses:")
for idx, label in enumerate(encoder.classes_):
    print(f"{idx} -> {label}")