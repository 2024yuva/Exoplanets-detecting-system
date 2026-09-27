# CNN-LSTM Training Guide

## Quick Start

### Single training run (manual hyperparameters)

```powershell
cd C:\Users\HP\Exoplanets-detecting-system
.\.venv-1\Scripts\python.exe scripts\train_cnn_lstm.py
```

Edit hyperparameters at the top of `scripts/train_cnn_lstm.py`:

```python
LEARNING_RATE = 0.001  # Try: 0.001, 0.0005
BATCH_SIZE = 32         # Try: 32, 64
DROPOUT_RATE = 0.30     # Try: 0.2, 0.3, 0.4
```

### Automated hyperparameter sweep

```powershell
.\.venv-1\Scripts\python.exe scripts\run_experiments.py
```

Runs 6 experiments automatically:
- Baseline (LR=0.001, batch=32, dropout=0.3)
- Lower LR (0.0005)
- Larger batch (64)
- Higher dropout (0.4)
- Lower dropout (0.2)
- Combined (LR=0.0005, batch=64)

Results are logged to `results/experiments_log.txt`.

---

## Current Architecture

**Input:** 27 features (20 original + 7 engineered)

**Engineered features:**
1. `depth_per_radius` — transit depth / planet radius
2. `transit_duty_cycle` — duration / (period × 24)
3. `radius_ratio` — Rp / Rs (scaled)
4. `depth_snr` — depth / SNR
5. `stellar_density_proxy` — M★ / R★³
6. `abs_planet_radius` — Rp × R★
7. `insol_temp_ratio` — insolation / Teq

**Model:**
```
Conv1D(64, kernel=5, L2=1e-4) → BatchNorm
Conv1D(128, kernel=5, L2=1e-4) → BatchNorm → MaxPool(2) → Dropout
LSTM(64, dropout=0.3, recurrent_dropout=0.2) → Dropout
Dense(64, L2=1e-4) → Dropout(0.2)
Dense(32)
Dense(3, softmax)
```

**Training:**
- Optimizer: Adam
- Loss: Sparse categorical crossentropy
- Class balancing: SMOTE + class weights
- Callbacks: EarlyStopping (patience=12), ReduceLROnPlateau (factor=0.3, patience=4), ModelCheckpoint

---

## Baseline Performance

**Before feature engineering (20 features):**
- Test accuracy: 69%
- Macro F1: 0.65

**After feature engineering (27 features):**
- Run training to get new baseline

---

## Evaluation Metrics

The script reports:
- **Test accuracy** — overall correctness
- **Macro F1** — average F1 across all 3 classes (more informative for imbalanced data)
- **Per-class precision/recall/F1** — shows which classes are hardest to distinguish
- **Confusion matrix** — saved to `results/confusion_matrix.png`

---

## Next Steps (if accuracy plateaus)

1. **Add attention layer** — after LSTM, before Dense
2. **Increase CNN depth** — add 3rd Conv1D layer with 256 filters
3. **Ensemble** — train 3-5 models with different random seeds and average predictions
4. **Feature selection** — remove low-importance features using permutation importance

---

## Files

| File | Purpose |
|---|---|
| `scripts/preprocess_ml.py` | Feature engineering + train/val/test split |
| `scripts/train_cnn_lstm.py` | Model training (single run) |
| `scripts/run_experiments.py` | Hyperparameter sweep (6 experiments) |
| `data/processed/*.npy` | Preprocessed train/val/test arrays |
| `models/cnn_lstm_exoplanet.keras` | Best model checkpoint |
| `results/` | Plots + experiment logs |

---

## Troubleshooting

**Out of memory:**
- Reduce `BATCH_SIZE` to 16
- Reduce LSTM units to 32

**Training too slow:**
- Increase `BATCH_SIZE` to 64
- Reduce `epochs` to 50

**Overfitting (train >> val accuracy):**
- Increase `DROPOUT_RATE` to 0.4
- Increase L2 regularization to 1e-3

**Underfitting (train accuracy < 75%):**
- Decrease `DROPOUT_RATE` to 0.2
- Remove L2 regularization
- Increase model capacity (more filters, LSTM units)
