# Exoplanet Detection Dashboard

This frontend was rebuilt as a static dashboard after removing the npm/Vite scaffold.

## Files

- `index.html`: dashboard shell
- `styles.css`: visual system
- `app.js`: CSV parsing, metrics, charts, and catalog filtering
- `dataset_exoplanets/`: preserved dataset folder

## Dataset behavior

The dashboard is designed around `dataset_exoplanets/tois.csv`.

- Use the `Load bundled TOI catalog` button when serving the folder over HTTP.
- Use `Load CSV manually` if the browser blocks direct file fetches.

## Real light-curve upload

You can now run the detection pipeline on a dedicated light-curve file.

- Use `Upload light curve` to select a `.csv` or `.txt` file.
- The file must include at least two numeric columns (time, flux).
- After upload, click `Run detection pipeline` to generate raw, denoised, probability, and classification outputs from the uploaded signal.

## Run locally

From the project root:

```bash
uvicorn main:app --host 127.0.0.1 --port 8000
python serve_dashboard.py
```

Then open `http://127.0.0.1:8080/`.

Notes:

- The dashboard uses `http://127.0.0.1:8000` for uploaded light-curve model inference.
- If the API is not running, uploaded curves will fall back to local browser-side analysis.

## Why this rebuild exists

The original frontend depended on npm packages, but npm registry access on this machine was blocked. This version keeps the project moving without requiring package installation.
