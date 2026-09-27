from pathlib import Path
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (
    Input,
    Conv1D,
    MaxPooling1D,
    LSTM,
    Dense,
    Dropout,
    BatchNormalization
)

from tensorflow.keras.callbacks import (
    EarlyStopping,
    ModelCheckpoint,
    ReduceLROnPlateau
)

from tensorflow.keras.regularizers import l2
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.initializers import HeNormal

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    f1_score
)
from sklearn.utils.class_weight import compute_class_weight
from imblearn.over_sampling import SMOTE

import seaborn as sns

# ------------------------------------
# Hyperparameters
# ------------------------------------

LEARNING_RATE = 0.001
BATCH_SIZE = 32
DROPOUT_RATE = 0.30

# Experiment control
USE_SMOTE = True         # Experiment A: False, Experiment B: True
USE_CLASS_WEIGHTS = False # Experiment A: True, Experiment B: False

# ------------------------------------
# Paths
# ------------------------------------

ROOT = Path(__file__).resolve().parent.parent

DATA = ROOT / "data" / "processed"

MODELS = ROOT / "models"
MODELS.mkdir(exist_ok=True)

RESULTS = ROOT / "results"
RESULTS.mkdir(exist_ok=True)

# ------------------------------------
# Load Data
# ------------------------------------

print("\n" + "="*60)
print("CNN-LSTM Exoplanet Classification Training")
print("="*60)
print(f"Learning Rate    : {LEARNING_RATE}")
print(f"Batch Size       : {BATCH_SIZE}")
print(f"Dropout Rate     : {DROPOUT_RATE}")
print(f"Use SMOTE        : {USE_SMOTE}")
print(f"Use Class Weights: {USE_CLASS_WEIGHTS}")
print("="*60 + "\n")

X_train = np.load(DATA / "X_train.npy")
X_val = np.load(DATA / "X_val.npy")
X_test = np.load(DATA / "X_test.npy")

y_train = np.load(DATA / "y_train.npy")
y_val = np.load(DATA / "y_val.npy")
y_test = np.load(DATA / "y_test.npy")

print("Training Shape:", X_train.shape)

# ------------------------------------
# Clip Outliers (before reshape)
# Caps each feature at ±5 std devs — extreme outliers
# break Conv1D filter responses after StandardScaler
# ------------------------------------

X_train = np.clip(X_train, -5, 5)
X_val   = np.clip(X_val,   -5, 5)
X_test  = np.clip(X_test,  -5, 5)

print("Clipped to [-5, 5] standard deviations")

# ------------------------------------
# Class Balancing Strategy
# ------------------------------------

if USE_SMOTE:
    print("\nApplying SMOTE oversampling...")
    smote = SMOTE(random_state=42)
    X_train_res, y_train_res = smote.fit_resample(X_train, y_train)
    unique, counts = np.unique(y_train_res, return_counts=True)
    print("After SMOTE:", dict(zip(unique.tolist(), counts.tolist())))
else:
    print("\nSMOTE disabled — using original class distribution")
    X_train_res = X_train
    y_train_res = y_train
    unique, counts = np.unique(y_train_res, return_counts=True)
    print("Original distribution:", dict(zip(unique.tolist(), counts.tolist())))

if USE_CLASS_WEIGHTS:
    print("\nComputing class weights...")
    classes = np.unique(y_train_res)
    weights = compute_class_weight(
        class_weight="balanced",
        classes=classes,
        y=y_train_res
    )
    class_weights = dict(zip(classes.tolist(), weights.tolist()))
    print("Class Weights:", class_weights)
else:
    print("\nClass weights disabled — equal weight for all classes")
    class_weights = None

# ------------------------------------
# Reshape
# ------------------------------------

X_train_res = X_train_res.reshape(X_train_res.shape[0], X_train_res.shape[1], 1)

X_val = X_val.reshape(
    X_val.shape[0],
    X_val.shape[1],
    1
)

X_test = X_test.reshape(
    X_test.shape[0],
    X_test.shape[1],
    1
)

print("CNN Input Shape:", X_train_res.shape)

# ------------------------------------
# Build Model
# ------------------------------------

initializer = HeNormal()

model = Sequential()

model.add(Input(shape=(X_train_res.shape[1], 1)))

# ------------------------------------------------
# CNN Block 1
# ------------------------------------------------

model.add(
    Conv1D(
        filters=64,
        kernel_size=5,
        strides=1,
        padding="same",
        activation="relu",
        kernel_initializer=initializer,
        kernel_regularizer=l2(1e-4)
    )
)

model.add(BatchNormalization())

# ------------------------------------------------
# CNN Block 2
# ------------------------------------------------

model.add(
    Conv1D(
        filters=128,
        kernel_size=5,
        strides=1,
        padding="same",
        activation="relu",
        kernel_initializer=initializer,
        kernel_regularizer=l2(1e-4)
    )
)

model.add(BatchNormalization())

model.add(MaxPooling1D(pool_size=2))

model.add(Dropout(DROPOUT_RATE))

# ------------------------------------------------
# LSTM
# ------------------------------------------------

model.add(
    LSTM(
        64,
        return_sequences=False,
        dropout=DROPOUT_RATE,
        recurrent_dropout=0.20
    )
)

model.add(Dropout(DROPOUT_RATE))

# ------------------------------------------------
# Dense
# ------------------------------------------------

model.add(
    Dense(
        64,
        activation="relu",
        kernel_initializer=initializer,
        kernel_regularizer=l2(1e-4)
    )
)

model.add(Dropout(0.20))

model.add(
    Dense(
        32,
        activation="relu",
        kernel_initializer=initializer
    )
)

model.add(
    Dense(
        3,
        activation="softmax"
    )
)

# ------------------------------------------------

optimizer = Adam(learning_rate=LEARNING_RATE)

model.compile(
    optimizer=optimizer,
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# ------------------------------------
# Callbacks
# ------------------------------------

callbacks = [

    EarlyStopping(

        monitor="val_loss",

        patience=12,

        restore_best_weights=True,

        verbose=1

    ),

    ReduceLROnPlateau(

        monitor="val_loss",

        factor=0.3,

        patience=4,

        min_lr=1e-6,

        verbose=1

    ),

    ModelCheckpoint(

        MODELS / "cnn_lstm_exoplanet.keras",

        monitor="val_accuracy",

        mode="max",

        save_best_only=True,

        verbose=1

    )

]

# ------------------------------------
# Train
# ------------------------------------

history = model.fit(

    X_train_res,

    y_train_res,

    validation_data=(X_val, y_val),

    epochs=80,

    batch_size=BATCH_SIZE,

    callbacks=callbacks,

    class_weight=class_weights,

    verbose=1

)

# ------------------------------------
# Evaluate
# ------------------------------------

loss, acc = model.evaluate(X_test, y_test)

print(f"\nTest Accuracy : {acc:.4f}")

# ------------------------------------
# Predictions
# ------------------------------------

pred = model.predict(X_test)

pred = np.argmax(pred, axis=1)

# Calculate F1 scores
macro_f1 = f1_score(y_test, pred, average='macro')
weighted_f1 = f1_score(y_test, pred, average='weighted')

print(f"Macro F1      : {macro_f1:.4f}")
print(f"Weighted F1   : {weighted_f1:.4f}\n")

print(classification_report(y_test, pred))

# ------------------------------------
# Confusion Matrix
# ------------------------------------

cm = confusion_matrix(y_test, pred)

plt.figure(figsize=(8,6))

sns.heatmap(
    cm,
    annot=True,
    fmt="d",
    cmap="Blues"
)

plt.title("Confusion Matrix")

plt.savefig(RESULTS / "confusion_matrix.png")

# ------------------------------------
# Accuracy Plot
# ------------------------------------

plt.figure(figsize=(8,5))

plt.plot(history.history["accuracy"])

plt.plot(history.history["val_accuracy"])

plt.legend(["Train","Validation"])

plt.title("Accuracy")

plt.savefig(RESULTS / "accuracy.png")

# ------------------------------------
# Loss Plot
# ------------------------------------

plt.figure(figsize=(8,5))

plt.plot(history.history["loss"])

plt.plot(history.history["val_loss"])

plt.legend(["Train","Validation"])

plt.title("Loss")

plt.savefig(RESULTS / "loss.png")

print("\nTraining Completed Successfully!")