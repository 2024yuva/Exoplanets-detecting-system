"""
Hyperparameter sweep runner for CNN-LSTM exoplanet classifier.
Runs multiple experiments with different LR, batch size, and dropout combinations.
"""

import subprocess
import sys
from pathlib import Path

# ------------------------------------
# Experiment configurations
# ------------------------------------

experiments = [
    # Baseline (current)
    {"lr": 0.001, "batch": 32, "dropout": 0.30, "name": "baseline"},
    
    # Lower learning rate
    {"lr": 0.0005, "batch": 32, "dropout": 0.30, "name": "lr_low"},
    
    # Larger batch
    {"lr": 0.001, "batch": 64, "dropout": 0.30, "name": "batch_large"},
    
    # Higher dropout
    {"lr": 0.001, "batch": 32, "dropout": 0.40, "name": "dropout_high"},
    
    # Lower dropout
    {"lr": 0.001, "batch": 32, "dropout": 0.20, "name": "dropout_low"},
    
    # Combined: lower LR + larger batch
    {"lr": 0.0005, "batch": 64, "dropout": 0.30, "name": "lr_batch_opt"},
]

# ------------------------------------
# Run experiments
# ------------------------------------

ROOT = Path(__file__).resolve().parent.parent
TRAIN_SCRIPT = ROOT / "scripts" / "train_cnn_lstm.py"
RESULTS_DIR = ROOT / "results"
RESULTS_DIR.mkdir(exist_ok=True)

results_log = RESULTS_DIR / "experiments_log.txt"

with open(results_log, "w") as log:
    log.write("="*80 + "\n")
    log.write("CNN-LSTM Hyperparameter Experiments\n")
    log.write("="*80 + "\n\n")

for i, exp in enumerate(experiments, 1):
    
    print("\n" + "="*80)
    print(f"Experiment {i}/{len(experiments)}: {exp['name']}")
    print(f"  LR={exp['lr']}, Batch={exp['batch']}, Dropout={exp['dropout']}")
    print("="*80 + "\n")
    
    # Modify the train script with current hyperparameters
    with open(TRAIN_SCRIPT, "r") as f:
        script_content = f.read()
    
    # Replace hyperparameter values
    modified = script_content
    modified = modified.replace(
        f"LEARNING_RATE = 0.001",
        f"LEARNING_RATE = {exp['lr']}"
    )
    modified = modified.replace(
        f"LEARNING_RATE = 0.0005",
        f"LEARNING_RATE = {exp['lr']}"
    )
    modified = modified.replace(
        f"BATCH_SIZE = 32",
        f"BATCH_SIZE = {exp['batch']}"
    )
    modified = modified.replace(
        f"BATCH_SIZE = 64",
        f"BATCH_SIZE = {exp['batch']}"
    )
    modified = modified.replace(
        f"DROPOUT_RATE = 0.30",
        f"DROPOUT_RATE = {exp['dropout']}"
    )
    modified = modified.replace(
        f"DROPOUT_RATE = 0.20",
        f"DROPOUT_RATE = {exp['dropout']}"
    )
    modified = modified.replace(
        f"DROPOUT_RATE = 0.40",
        f"DROPOUT_RATE = {exp['dropout']}"
    )
    
    # Write temporary script
    temp_script = ROOT / "scripts" / "train_temp.py"
    with open(temp_script, "w") as f:
        f.write(modified)
    
    # Run training
    try:
        result = subprocess.run(
            [sys.executable, str(temp_script)],
            capture_output=True,
            text=True,
            timeout=3600  # 1 hour max per experiment
        )
        
        # Log results
        with open(results_log, "a") as log:
            log.write(f"\n{'='*80}\n")
            log.write(f"Experiment: {exp['name']}\n")
            log.write(f"LR={exp['lr']}, Batch={exp['batch']}, Dropout={exp['dropout']}\n")
            log.write(f"{'='*80}\n")
            log.write(result.stdout)
            if result.stderr:
                log.write("\nERROR OUTPUT:\n")
                log.write(result.stderr)
            log.write("\n")
        
        print(f"\n✓ Experiment {i} completed")
        
    except subprocess.TimeoutExpired:
        print(f"\n✗ Experiment {i} timed out (>1 hour)")
        with open(results_log, "a") as log:
            log.write(f"\nExperiment {exp['name']} TIMED OUT\n\n")
    
    except Exception as e:
        print(f"\n✗ Experiment {i} failed: {e}")
        with open(results_log, "a") as log:
            log.write(f"\nExperiment {exp['name']} FAILED: {e}\n\n")
    
    finally:
        # Clean up temp script
        if temp_script.exists():
            temp_script.unlink()

print("\n" + "="*80)
print("All experiments completed!")
print(f"Results saved to: {results_log}")
print("="*80 + "\n")
