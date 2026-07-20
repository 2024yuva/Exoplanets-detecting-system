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

@app.get("/api/targets", response_model=List[TargetRecord])
async def get_all_targets():
    return target_database
