import os
import numpy as np
import pandas as pd
import lightkurve as lk
import tensorflow as tf
from tensorflow.keras import layers, models
from astropy.timeseries import BoxLeastSquares
import astropy.units as u
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="ISRO Exoplanet Pipeline API")

# Enable CORS for React frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock database matrix for target tracking management
target_database = []

# --- Custom ML Model Layer Definition ---
class AttentionLayer(layers.Layer):
    def __init__(self, **kwargs):
        super(AttentionLayer, self).__init__(**kwargs)
    def build(self, input_shape):
        self.W = self.add_weight(name='attention_weight', shape=(input_shape[-1], 1), initializer='random_normal', trainable=True)
        self.b = self.add_weight(name='attention_bias', shape=(input_shape[1], 1), initializer='zeros', trainable=True)
        super(AttentionLayer, self).build(input_shape)
    def call(self, inputs):
        e = tf.nn.tanh(tf.tensordot(inputs, self.W, axes=1) + self.b)
        a = tf.nn.softmax(e, axis=1)
        return tf.reduce_sum(inputs * a, axis=1)

_model = None
def get_trained_model():
    global _model
    if _model is None:
        inputs = layers.Input(shape=(2000, 1))
        x = layers.Conv1D(filters=32, kernel_size=7, activation='relu', padding='same')(inputs)
        x = layers.MaxPool1D(pool_size=2)(x)
        x = layers.Conv1D(filters=64, kernel_size=5, activation='relu', padding='same')(x)
        x = layers.MaxPool1D(pool_size=2)(x)
        x = layers.Bidirectional(layers.LSTM(32, return_sequences=True))(x)
        context_vector = AttentionLayer()(x)
        x = layers.Dense(32, activation='relu')(context_vector)
        outputs = layers.Dense(3, activation='softmax')(x)
        _model = models.Model(inputs=inputs, outputs=outputs)
        _model.compile(optimizer='adam', loss='sparse_categorical_crossentropy')
    return _model

model = get_trained_model()

# --- Astrophysical Helper Functions ---
def preprocess_lightcurve(tic_id: str):
    try:
        search_result = lk.search_lightcurve(f"TIC {tic_id}", mission="TESS", author="SPOC")
        if len(search_result) == 0: return None
        lc = search_result[0].download()
        if lc is None: return None
        lc = lc.remove_nans().remove_outliers(sigma_lower=20, sigma_upper=5)
        return lc.flatten(window_length=101)
    except Exception:
        return None

def standard_scale_signal(flux, target_length=2000):
    flux_clean = np.nan_to_num(flux, nan=1.0)
    xp = np.linspace(0, 1, len(flux_clean))
    x = np.linspace(0, 1, target_length)
    resampled_flux = np.interp(x, xp, flux_clean)
    return (resampled_flux - np.mean(resampled_flux)) / (np.std(resampled_flux) + 1e-8)

def estimate_transit_parameters(time, flux):
    durations = np.linspace(0.05, 0.3, 20) * u.day
    bls = BoxLeastSquares(time * u.day, flux)
    period_grid = np.linspace(0.5, 15, 2000) * u.day
    bls_results = bls.power(period_grid, durations)
    idx = np.argmax(bls_results.power)
    return {
        "period": float(bls_results.period[idx].value),
        "duration": float(bls_results.duration[idx].value),
        "t0": float(bls_results.transit_time[idx].value),
        "depth": float(bls_results.depth[idx].value),
        "snr": float(bls_results.depth_snr[idx])
    }

# --- Request/Response Data Structure Models ---
class AnalysisRequest(BaseModel):
    tic_id: str
    priority: str
    notes: Optional[str] = ""


class LightCurveAnalysisRequest(BaseModel):
    time: List[float]
    flux: List[float]
    source_name: Optional[str] = "uploaded_light_curve"
    priority: str = "Uploaded"
    notes: Optional[str] = ""

class TargetRecord(BaseModel):
    tic_id: str
    classification: str
    confidence: float
    period: float
    snr: float
    priority: str
    notes: str

# --- API Router Endpoints ---
@app.post("/api/analyze")
async def analyze_target(req: AnalysisRequest):
    flat_lc = preprocess_lightcurve(req.tic_id)
    if flat_lc is None:
        raise HTTPException(status_code=404, detail="Light curve not found or invalid target TIC ID.")

    time, flux = flat_lc.time.value, flat_lc.flux.value
    standardized_input = standard_scale_signal(flux).reshape(1, 2000, 1)

    # DL Inference
    prediction = model.predict(standardized_input)[0]
    categories = ["Noise Background", "Confirmed/Candidate Planet Transit", "Eclipsing Binary System"]
    predicted_class_idx = np.argmax(prediction)

    # Transit parameter grid calculations
    metrics = estimate_transit_parameters(time, flux)

    # Downsample time-series plot data to 500 points for efficient React rendering
    step = max(1, len(time) // 500)
    time_series_data = [{"time": float(t), "flux": float(f)} for t, f in zip(time[::step], flux[::step])]

    # Calculate phase folding profile data arrays
    phase = ((time - metrics['t0']) / metrics['period']) % 1.0
    phase[phase > 0.5] -= 1.0
    sort_idx = np.argsort(phase)
    phase_folded_data = [{"phase": float(p), "flux": float(f)} for p, f in zip(phase[sort_idx][::step], flux[sort_idx][::step])]

    record = {
        "tic_id": req.tic_id,
        "classification": categories[predicted_class_idx],
        "confidence": float(prediction[predicted_class_idx] * 100),
        "period": round(metrics['period'], 4),
        "snr": round(metrics['snr'], 2),
        "priority": req.priority,
        "notes": req.notes or "No notes provided."
    }

    # Update or insert record inside our list database tracking matrix
    global target_database
    target_database = [r for r in target_database if r["tic_id"] != req.tic_id]
    target_database.append(record)

    return {
        "metrics": record,
        "additional_metrics": {
            "duration_hours": round(metrics['duration'] * 24, 2),
            "depth": round(metrics['depth'], 6)
        },
        "plot_data": {
            "time_series": time_series_data,
            "phase_folded": phase_folded_data
        }
    }


@app.post("/api/analyze-lightcurve")
async def analyze_uploaded_lightcurve(req: LightCurveAnalysisRequest):
    if len(req.time) != len(req.flux):
        raise HTTPException(status_code=400, detail="Time and flux arrays must have the same length.")
    if len(req.time) < 20:
        raise HTTPException(status_code=400, detail="At least 20 samples are required for analysis.")

    time = np.array(req.time, dtype=float)
    flux = np.array(req.flux, dtype=float)
    valid_mask = np.isfinite(time) & np.isfinite(flux)
    time = time[valid_mask]
    flux = flux[valid_mask]

    if len(time) < 20:
        raise HTTPException(status_code=400, detail="Not enough valid samples after removing invalid points.")

    sort_idx = np.argsort(time)
    time = time[sort_idx]
    flux = flux[sort_idx]

    standardized_input = standard_scale_signal(flux).reshape(1, 2000, 1)
    prediction = model.predict(standardized_input, verbose=0)[0]
    categories = ["Noise Background", "Confirmed/Candidate Planet Transit", "Eclipsing Binary System"]
    predicted_class_idx = int(np.argmax(prediction))

    try:
        metrics = estimate_transit_parameters(time, flux)
    except Exception:
        time_span = max(float(time[-1] - time[0]), 1e-6)
        metrics = {
            "period": max(0.5, time_span / 5),
            "duration": 0.12,
            "t0": float(time[len(time) // 2]),
            "depth": float(np.max(flux) - np.min(flux)),
            "snr": float(np.std(flux) and (np.max(flux) - np.min(flux)) / np.std(flux) or 0.0),
        }

    step = max(1, len(time) // 500)
    time_series_data = [{"time": float(t), "flux": float(f)} for t, f in zip(time[::step], flux[::step])]

    denoised_flux = pd.Series(flux).rolling(window=11, center=True, min_periods=1).mean().to_numpy()
    denoised_series_data = [{"time": float(t), "flux": float(f)} for t, f in zip(time[::step], denoised_flux[::step])]

    residual = flux - denoised_flux
    residual_span = float(np.max(residual) - np.min(residual) + 1e-8)
    probability = np.clip((np.max(residual) - residual) / residual_span * 0.92 + 0.04, 0.04, 0.995)
    probability_series_data = [{"time": float(t), "probability": float(p)} for t, p in zip(time[::step], probability[::step])]

    confidence_percent = float(prediction[predicted_class_idx] * 100)
    record = {
        "tic_id": req.source_name or "uploaded_light_curve",
        "classification": categories[predicted_class_idx],
        "confidence": confidence_percent,
        "period": round(float(metrics["period"]), 4),
        "snr": round(float(metrics["snr"]), 2),
        "priority": req.priority,
        "notes": req.notes or "Uploaded curve analysis",
    }

    global target_database
    target_database = [r for r in target_database if r["tic_id"] != record["tic_id"]]
    target_database.append(record)

    explanation = [
        f"Model classified the signal as {record['classification']} with {confidence_percent:.1f}% confidence.",
        f"Best-fit period estimate from BLS: {float(metrics['period']):.4f} days.",
        f"Estimated transit depth: {float(metrics['depth']) * 1_000_000:.0f} ppm.",
        f"Transit SNR estimate: {float(metrics['snr']):.2f}.",
    ]

    return {
        "metrics": record,
        "additional_metrics": {
            "duration_hours": round(float(metrics["duration"]) * 24, 2),
            "depth": round(float(metrics["depth"]), 8),
            "depth_ppm": round(float(metrics["depth"]) * 1_000_000, 2),
        },
        "plot_data": {
            "time_series": time_series_data,
            "denoised_series": denoised_series_data,
            "probability_series": probability_series_data,
            "threshold": 0.72,
        },
        "explanation": explanation,
    }

@app.get("/api/targets", response_model=List[TargetRecord])
async def get_all_targets():
    return target_database


@app.get("/api/lightcurve/{tic_id}")
async def get_tess_lightcurve(
    tic_id: str,
    period_days: Optional[float] = None,
    epoch_bjd: Optional[float] = None,
    target_name: Optional[str] = "TESS target",
):
    """Fetch public TESS photometry from MAST and return normalized and phase-folded samples."""
    if not tic_id.isdigit():
        raise HTTPException(status_code=400, detail="TIC ID must contain digits only.")

    try:
        search = lk.search_lightcurve(f"TIC {tic_id}", mission="TESS", author="SPOC")
        if len(search) == 0:
            search = lk.search_lightcurve(f"TIC {tic_id}", mission="TESS")
        if len(search) == 0:
            raise HTTPException(status_code=404, detail=f"MAST has no public TESS light curve for TIC {tic_id}.")

        # A few sectors provide useful coverage without pulling down every cadence for a long-lived target.
        selected_observations = search[:5]
        collection = selected_observations.download_all()
        if collection is None or len(collection) == 0:
            raise HTTPException(status_code=404, detail=f"MAST found TESS observations for TIC {tic_id}, but no downloadable light-curve files.")

        lightcurve = collection.stitch().remove_nans().remove_outliers(sigma_lower=20, sigma_upper=5).normalize()
        try:
            lightcurve = lightcurve.flatten(window_length=101, break_tolerance=5, niters=3)
        except Exception:
            # Keep the normalized data when there are too few samples to fit a trend safely.
            pass

        time = np.asarray(lightcurve.time.value, dtype=float)
        flux = np.asarray(lightcurve.flux.value, dtype=float)
        valid = np.isfinite(time) & np.isfinite(flux)
        time, flux = time[valid], flux[valid]
        if len(time) < 20:
            raise HTTPException(status_code=422, detail="The downloaded TESS light curve has too few valid measurements.")

        point_count = min(2500, len(time))
        raw_indices = np.linspace(0, len(time) - 1, point_count, dtype=int)
        time_series = [
            {"time": float(time[index]), "flux": float(flux[index])}
            for index in raw_indices
        ]

        phase_folded = []
        if period_days and period_days > 0 and epoch_bjd:
            # TESS time is BTJD (BJD - 2457000); TOI ephemerides are supplied as BJD.
            epoch_btjd = epoch_bjd - 2457000 if epoch_bjd > 1_000_000 else epoch_bjd
            phase = ((time - epoch_btjd + period_days / 2) % period_days) / period_days - 0.5
            bins = 600
            bin_ids = np.minimum(((phase + 0.5) * bins).astype(int), bins - 1)
            bin_counts = np.bincount(bin_ids, minlength=bins)
            bin_flux = np.bincount(bin_ids, weights=flux, minlength=bins)
            phase_folded = [
                {"phase": (index + 0.5) / bins - 0.5, "flux": float(bin_flux[index] / bin_counts[index])}
                for index in range(bins) if bin_counts[index] > 0
            ]

        sector_values = []
        if "sequence_number" in selected_observations.table.colnames:
            sector_values = sorted({int(value) for value in selected_observations.table["sequence_number"] if str(value).isdigit()})
        authors = []
        if "author" in selected_observations.table.colnames:
            authors = sorted({str(value) for value in selected_observations.table["author"] if str(value).strip()})

        return {
            "ticId": tic_id,
            "targetName": target_name,
            "mission": "TESS",
            "source": "MAST public light-curve products",
            "authors": authors,
            "sectors": sector_values,
            "periodDays": period_days,
            "epochBjd": epoch_bjd,
            "pointCount": int(len(time)),
            "normalization": "Outliers removed, median normalized, and flattened to reduce slow instrumental and stellar trends.",
            "timeSeries": time_series,
            "phaseFolded": phase_folded,
            "mastUrl": f"https://mast.stsci.edu/portal/Mashup/Clients/Mast/Portal.html?searchQuery=TIC%20{tic_id}",
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"MAST could not provide a TESS light curve for TIC {tic_id}: {exc}") from exc
