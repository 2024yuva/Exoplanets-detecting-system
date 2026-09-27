from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent

INPUT = ROOT / "data" / "processed" / "planets_cleaned.csv"
OUTPUT = ROOT / "data" / "processed" / "planets_ml_ready.csv"

df = pd.read_csv(INPUT)

# ---------------------------------------
# Keep only scientifically useful columns
# ---------------------------------------

keep = [

    # Planet
    "pl_name",
    "hostname",

    "pl_orbper",
    "pl_orbsmax",
    "pl_rade",
    "pl_bmasse",
    "pl_dens",
    "pl_eqt",
    "pl_orbeccen",
    "pl_insol",

    # Transit

    "pl_trandep",
    "pl_trandur",
    "pl_ratror",

    # Stellar

    "st_teff",
    "st_rad",
    "st_mass",
    "st_lum",
    "st_logg",
    "st_met",

    # System

    "sy_dist",
    "sy_vmag",

    # Discovery

    "discoverymethod",
    "disc_year"

]

existing = [c for c in keep if c in df.columns]

df = df[existing]

df.to_csv(OUTPUT, index=False)

print("=" * 50)
print("ML Ready Dataset")
print("=" * 50)
print(df.shape)
print(df.columns.tolist())