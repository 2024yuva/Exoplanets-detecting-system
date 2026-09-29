"""Build small, traceable phase-folded caches from public MAST light curves.

Run online with the project's Python environment. The runtime UI only reads the
resulting JSON files; it never contacts MAST.
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path

import lightkurve as lk
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "public" / "lightcurves"
BIN_COUNT = 700
PHASE_LIMIT = 0.15

TARGETS = [
    {
        "planet": "K2-18 b",
        "planetId": "k2-18-b",
        "target": "K2-18",
        "mission": "K2",
        "author": "K2SFF",
        "periodDays": 32.939623,
        "epochBjd": 2457264.39144,
        "file": "k2-18-b.json",
    },
    {
        "planet": "TRAPPIST-1 e",
        "planetId": "trappist-1-e",
        "target": "TRAPPIST-1",
        "mission": "K2",
        "author": "K2SFF",
        "campaignFilter": "Campaign 12",
        "periodDays": 6.101013,
        "epochBjd": 2457660.3676621,
        "file": "trappist-1-e.json",
    },
    {
        "planet": "Kepler-22 b",
        "planetId": "kepler-22-b",
        "target": "Kepler-22",
        "mission": "Kepler",
        "author": "Kepler",
        "periodDays": 289.863876,
        "epochBjd": 2454966.7001,
        "file": "kepler-22-b.json",
    },
    {
        "planet": "55 Cancri e",
        "planetId": "55-cancri-e",
        "target": "TIC 332064670",
        "mission": "TESS",
        "author": "SPOC",
        "periodDays": 0.7365474,
        "epochBjd": 2457063.2096,
        "file": "55-cancri-e.json",
    },
    {
        "planet": "WASP-12b",
        "planetId": "wasp-12b",
        "target": "TIC 86396382",
        "mission": "TESS",
        "author": "SPOC",
        "periodDays": 1.091418901,
        "epochBjd": 2457607.519305,
        "file": "wasp-12b.json",
    },
    {
        "planet": "HD 209458 b",
        "planetId": "hd-209458-b",
        "target": "TIC 420814525",
        "mission": "TESS",
        "author": "SPOC",
        "periodDays": 3.52474859,
        "epochBjd": 2451659.93742,
        "file": "hd-209458-b.json",
    },
    {
        "planet": "Kepler-186f",
        "planetId": "kepler-186f",
        "target": "TIC 268159861",
        "mission": "TESS",
        "author": "SPOC",
        "periodDays": 129.9441,
        "epochBjd": 2455789.494,
        "file": "kepler-186f.json",
    },
    {
        "planet": "LHS 1140 b",
        "planetId": "lhs-1140b",
        "target": "TIC 92226327",
        "mission": "TESS",
        "author": "SPOC",
        "periodDays": 24.73723,
        "epochBjd": 2458399.93,
        "file": "lhs-1140b.json",
    },
    {
        "planet": "TOI-700 d",
        "planetId": "toi-700d",
        "target": "TIC 150428135",
        "mission": "TESS",
        "author": "SPOC",
        "periodDays": 37.42396,
        "epochBjd": 2458816.9952,
        "file": "toi-700d.json",
    },
    {
        "planet": "Proxima Centauri b",
        "planetId": "proxima-b",
        "target": "TIC 388857263",
        "mission": "TESS",
        "author": "SPOC",
        "periodDays": 11.18465,
        "epochBjd": 2457897.9,
        "file": "proxima-b.json",
    },
]


def get_meta_value(lightcurve, *keys):
    for key in keys:
        value = lightcurve.meta.get(key)
        if value is not None and str(value).strip() and str(value).lower() != "nan":
            return value
    return None


def phase_folded_points(time_bjd, flux, period_days, epoch_bjd):
    phase = ((time_bjd - epoch_bjd + period_days / 2) % period_days) / period_days
    phase -= 0.5
    keep = np.isfinite(phase) & np.isfinite(flux) & (np.abs(phase) <= PHASE_LIMIT)
    phase, flux = phase[keep], flux[keep]
    if len(phase) < 20:
        raise RuntimeError(f"Only {len(phase)} real samples remain near transit.")

    bins = np.linspace(-PHASE_LIMIT, PHASE_LIMIT, BIN_COUNT + 1)
    bin_ids = np.digitize(phase, bins) - 1
    points = []
    for index in range(BIN_COUNT):
        in_bin = bin_ids == index
        if np.any(in_bin):
            points.append({
                "phase": float((bins[index] + bins[index + 1]) / 2),
                "flux": float(np.median(flux[in_bin])),
            })
    return points, len(phase)


def build_one(target):
    search = lk.search_lightcurve(
        target["target"], mission=target["mission"], author=target["author"]
    )
    if len(search) == 0:
        raise RuntimeError(f"No {target['mission']} {target['author']} products found for {target['target']}.")

    campaign_filter = target.get("campaignFilter")
    if campaign_filter and "mission" in search.table.colnames:
        campaign_mask = np.asarray([campaign_filter in str(value) for value in search.table["mission"]])
        search = search[campaign_mask]
        if len(search) == 0:
            raise RuntimeError(f"No {campaign_filter} observations found for {target['target']}.")

    # Kepler has both short and long cadence products. Keep the standard long
    # cadence where possible to keep the archive download compact.
    if target["mission"] == "Kepler" and "exptime" in search.table.colnames:
        long_cadence = np.asarray(search.table["exptime"], dtype=float) > 1000
        if np.any(long_cadence):
            search = search[long_cadence]

    collection = search.download_all()
    if collection is None or len(collection) == 0:
        raise RuntimeError(f"MAST returned no downloadable products for {target['target']}.")

    raw_count = 0
    time_parts = []
    flux_parts = []
    campaigns = set()
    quarters = set()
    obs_ids = {str(value) for value in search.table["obs_id"] if str(value).strip() and str(value).lower() != "nan"} if "obs_id" in search.table.colnames else set()
    product_files = {str(value) for value in search.table["productFilename"] if str(value).strip() and str(value).lower() != "nan"} if "productFilename" in search.table.colnames else set()
    for lightcurve in collection:
        clean = lightcurve.remove_nans().remove_outliers(sigma_lower=10, sigma_upper=6).normalize()
        times = np.asarray(clean.time.jd, dtype=float)
        fluxes = np.asarray(clean.flux.value, dtype=float)
        valid = np.isfinite(times) & np.isfinite(fluxes)
        times, fluxes = times[valid], fluxes[valid]
        raw_count += int(len(times))
        if len(times):
            time_parts.append(times)
            flux_parts.append(fluxes)

        campaign = get_meta_value(lightcurve, "CAMPAIGN")
        quarter = get_meta_value(lightcurve, "QUARTER")
        obs_id = get_meta_value(lightcurve, "OBSID", "OBS_ID")
        if campaign is not None:
            campaigns.add(str(campaign).zfill(2))
        if quarter is not None:
            quarters.add(str(quarter))
        if obs_id is not None:
            obs_ids.add(str(obs_id))

    if not time_parts:
        raise RuntimeError(f"No valid archival flux measurements were found for {target['planet']}.")

    time_bjd = np.concatenate(time_parts)
    flux = np.concatenate(flux_parts)
    points, processed_count = phase_folded_points(
        time_bjd, flux, target["periodDays"], target["epochBjd"]
    )

    payload = {
        "planet": target["planet"],
        "planetId": target["planetId"],
        "observed": True,
        "mission": target["mission"],
        "source": "MAST",
        "mode": "phase-folded",
        "periodDays": target["periodDays"],
        "numberOfRawPoints": raw_count,
        "numberOfProcessedPoints": len(points),
        "processingDate": date.today().isoformat(),
        "observationId": ", ".join(sorted(obs_ids)),
        "dataProduct": ", ".join(sorted(product_files)) or target["author"],
        "points": points,
    }
    if campaigns:
        payload["campaign"] = ", ".join(sorted(campaigns))
    if quarters:
        payload["quarter"] = "Quarters " + ", ".join(sorted(quarters, key=int))

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output = OUTPUT_DIR / target["file"]
    output.write_text(json.dumps(payload, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"{target['planet']}: wrote {len(points)} bins from {raw_count:,} MAST measurements to {output}")


if __name__ == "__main__":
    for item in TARGETS:
        build_one(item)
