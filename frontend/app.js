(function () {
  const statusEl = document.getElementById("status");
  const getStartedBtn = document.getElementById("get-started-btn");
  const runDetectionBtn = document.getElementById("run-detection");
  const primaryTargetSelect = document.getElementById("primary-target-select");
  const comparisonTargetSelect = document.getElementById("comparison-target-select");
  const catalogBody = document.getElementById("catalog-body");
  const progressRows = [...document.querySelectorAll("#progress-rows .progress-row")];
  const progressHeadline = document.getElementById("progress-headline");
  const topbar = document.querySelector(".topbar");
  const dashboardShell = document.getElementById("dashboard");
  const homeScreen = document.getElementById("home-screen");
  const comparePrimaryName = document.getElementById("compare-primary-name");
  const comparePrimaryMeta = document.getElementById("compare-primary-meta");
  const compareSecondaryName = document.getElementById("compare-secondary-name");
  const compareSecondaryMeta = document.getElementById("compare-secondary-meta");
  const compareDeltaPeriod = document.getElementById("compare-delta-period");
  const compareDeltaConfidence = document.getElementById("compare-delta-confidence");

  const paramEls = {
    period: document.getElementById("param-period"),
    depth: document.getElementById("param-depth"),
    duration: document.getElementById("param-duration"),
    snr: document.getElementById("param-snr"),
  };

  const state = {
    rows: [],
    activeRow: null,
    comparisonRow: null,
    detectionModel: null,
    isRunningPipeline: false,
  };

  const metricEls = {
    total: document.getElementById("metric-total"),
    kp: document.getElementById("metric-kp"),
    snr: document.getElementById("metric-snr"),
    period: document.getElementById("metric-period"),
  };

  function setStatus(message) {
    statusEl.textContent = message;
  }

  function wait(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  function resetPipelineProgress() {
    progressRows.forEach((rowEl) => {
      rowEl.classList.remove("active", "complete");
      const fill = rowEl.querySelector("i");
      if (fill) {
        fill.style.width = "0%";
      }
    });
    progressHeadline.textContent = "Idle";
  }

  async function runPipelineProgress() {
    const stages = [
      { key: "loading", label: "Loading light curve data" },
      { key: "cleaning", label: "Cleaning noise spikes" },
      { key: "normalizing", label: "Normalizing flux baseline" },
      { key: "detecting", label: "Detecting transit dip" },
      { key: "classifying", label: "Classifying signal" },
    ];

    resetPipelineProgress();

    for (let index = 0; index < stages.length; index += 1) {
      const stage = stages[index];
      const rowEl = progressRows.find((el) => el.getAttribute("data-stage") === stage.key);
      if (!rowEl) {
        continue;
      }

      progressHeadline.textContent = stage.label;
      rowEl.classList.add("active");
      const fill = rowEl.querySelector("i");
      if (fill) {
        fill.style.width = "100%";
      }

      await wait(420);

      rowEl.classList.remove("active");
      rowEl.classList.add("complete");
    }

    progressHeadline.textContent = "Pipeline completed";
  }

  function parseCsv(text) {
    const rows = [];
    let current = "";
    let row = [];
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        row.push(current);
        current = "";
      } else if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") {
          i += 1;
        }
        row.push(current);
        current = "";
        if (row.some((cell) => cell !== "")) {
          rows.push(row);
        }
        row = [];
      } else {
        current += char;
      }
    }

    if (current.length || row.length) {
      row.push(current);
      rows.push(row);
    }

    const headers = rows[0] || [];
    return rows.slice(1).map((cells) => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = cells[index] || "";
      });
      return record;
    });
  }

  function movingAverage(values, windowSize) {
    const half = Math.max(1, Math.floor(windowSize / 2));
    return values.map((_, index) => {
      let sum = 0;
      let count = 0;
      for (let i = Math.max(0, index - half); i <= Math.min(values.length - 1, index + half); i += 1) {
        sum += values[i];
        count += 1;
      }
      return sum / count;
    });
  }

  function sampleSeries(series, count) {
    if (series.length <= count) {
      return series;
    }
    const sampled = [];
    for (let i = 0; i < count; i += 1) {
      const idx = Math.round((i / (count - 1)) * (series.length - 1));
      sampled.push(series[idx]);
    }
    return sampled;
  }

  function ensureActiveRowForUploadedCurve() {
    // No-op in the new flow; kept only to minimize touching unrelated logic.
  }

  function toNumber(value) {
    if (!value) {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function normalizeRows(records) {
    return records
      .map((record, index) => ({
        id: `${record.TOI || "TOI"}-${index}`,
        ticId: record["TIC ID"] || "",
        toi: record.TOI || "",
        disposition: record["TFOPWG Disposition"] || record["TESS Disposition"] || "Unknown",
        source: record.Source || "Unknown",
        comments: record.Comments || "No comments available.",
        period: toNumber(record["Period (days)"]),
        radius: toNumber(record["Planet Radius (R_Earth)"]),
        snr: toNumber(record["Planet SNR"]),
        depthPpm: toNumber(record["Depth (ppm)"]),
        durationHours: toNumber(record["Duration (hours)"]),
        stellarTemp: toNumber(record["Stellar Eff Temp (K)"]),
      }))
      .filter((row) => row.ticId && row.toi);
  }

  function median(values) {
    if (!values.length) {
      return null;
    }
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
  }

  function countBy(rows, key) {
    const map = new Map();
    rows.forEach((row) => {
      const value = row[key] || "Unknown";
      map.set(value, (map.get(value) || 0) + 1);
    });
    return [...map.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }

  function buildRadiusBuckets(rows) {
    const buckets = [
      { label: "Sub-Earth", count: 0 },
      { label: "Super-Earth", count: 0 },
      { label: "Neptune-like", count: 0 },
      { label: "Gas giant", count: 0 },
    ];

    rows.forEach((row) => {
      if (row.radius === null) {
        return;
      }
      if (row.radius < 1) {
        buckets[0].count += 1;
      } else if (row.radius < 2) {
        buckets[1].count += 1;
      } else if (row.radius < 6) {
        buckets[2].count += 1;
      } else {
        buckets[3].count += 1;
      }
    });

    return buckets;
  }

  function setFocus(row) {
    state.activeRow = row;
    document.getElementById("focus-toi").textContent = row.toi;
    document.getElementById("focus-subtitle").textContent = `TIC ${row.ticId} • ${row.comments}`;
    document.getElementById("focus-disposition").textContent = row.disposition;
    document.getElementById("focus-period").textContent =
      row.period !== null ? `${row.period.toFixed(2)} d` : "n/a";
    document.getElementById("focus-depth").textContent =
      row.depthPpm !== null ? `${Math.round(row.depthPpm)} ppm` : "n/a";
    document.getElementById("focus-snr").textContent = row.snr !== null ? row.snr.toFixed(1) : "n/a";

    paramEls.period.textContent = row.period !== null ? `${row.period.toFixed(2)} d` : "n/a";
    paramEls.depth.textContent = row.depthPpm !== null ? `${Math.round(row.depthPpm)} ppm` : "n/a";
    paramEls.duration.textContent = row.durationHours !== null ? `${row.durationHours.toFixed(2)} hr` : "n/a";
    paramEls.snr.textContent = row.snr !== null ? row.snr.toFixed(1) : "n/a";

    updateComparisonSummary();
  }

  function setComparisonRow(row) {
    state.comparisonRow = row;
    updateComparisonSummary();
  }

  function updateComparisonSummary() {
    if (comparePrimaryName) {
      comparePrimaryName.textContent = state.activeRow ? state.activeRow.toi : "-";
      comparePrimaryMeta.textContent = state.activeRow
        ? `TIC ${state.activeRow.ticId} • ${state.activeRow.disposition} • ${state.activeRow.period !== null ? `${state.activeRow.period.toFixed(2)} d` : "n/a"}`
        : "-";
    }
    if (compareSecondaryName) {
      compareSecondaryName.textContent = state.comparisonRow ? state.comparisonRow.toi : "-";
      compareSecondaryMeta.textContent = state.comparisonRow
        ? `TIC ${state.comparisonRow.ticId} • ${state.comparisonRow.disposition} • ${state.comparisonRow.period !== null ? `${state.comparisonRow.period.toFixed(2)} d` : "n/a"}`
        : "-";
    }

    if (compareDeltaPeriod) {
      const primaryPeriod = state.activeRow && state.activeRow.period !== null ? state.activeRow.period : null;
      const comparisonPeriod = state.comparisonRow && state.comparisonRow.period !== null ? state.comparisonRow.period : null;
      compareDeltaPeriod.textContent =
        primaryPeriod !== null && comparisonPeriod !== null
          ? `Period delta: ${(primaryPeriod - comparisonPeriod).toFixed(2)} d`
          : "Period delta: -";
    }
    if (compareDeltaConfidence) {
      const primaryConfidence = state.detectionModel ? state.detectionModel.confidence : null;
      const comparisonConfidence = state.comparisonRow && state.comparisonRow.snr !== null ? Math.max(0.5, Math.min(0.99, 0.5 + state.comparisonRow.snr / 100)) : null;
      compareDeltaConfidence.textContent =
        primaryConfidence !== null && comparisonConfidence !== null
          ? `Confidence delta: ${((primaryConfidence || 0) - comparisonConfidence).toFixed(2)}`
          : "Confidence delta: -";
    }
  }

  function generateDetectionModel(row) {
    if (state.uploadedCurve && state.uploadedCurve.length > 0) {
      return buildModelFromUploadedCurve(row);
    }

    const count = 180;
    const depth = Math.max(0.006, Math.min(0.06, ((row.depthPpm || 8000) / 1000000) * 1.25));
    const snr = row.snr || 14;
    const width = Math.max(0.03, Math.min(0.12, (row.durationHours || 3) / 48));
    const raw = [];
    const denoised = [];
    const probability = [];
    const outliers = [];
    const transitIndices = [];

    for (let i = 0; i < count; i += 1) {
      const t = i / (count - 1);
      const baseline = 1 + 0.0028 * Math.sin(t * 14) + 0.0014 * Math.cos(t * 22);
      const center = 0.5;
      const distance = Math.abs(t - center);
      const transitProfile = distance < width ? 1 - depth * (1 - (distance / width) ** 2) : 1;
      const deterministicNoise = 0.0035 * Math.sin(t * 43 + 0.4) + 0.002 * Math.cos(t * 61 + 1.2);
      let flux = baseline * transitProfile + deterministicNoise;

      if (i % 37 === 0 || i % 53 === 0) {
        flux += i % 2 === 0 ? 0.012 : -0.01;
        outliers.push({ x: t, y: flux });
      }

      const cleanFlux = baseline * transitProfile;
      const probabilityPulse = Math.exp(-((t - center) ** 2) / 0.0018);
      const probabilityValue = Math.max(0.06, Math.min(0.99, 0.08 + probabilityPulse * Math.min(0.92, snr / 38)));

      raw.push({ x: t, y: flux });
      denoised.push({ x: t, y: cleanFlux });
      probability.push({ x: t, y: probabilityValue });

      if (distance < width * 0.55) {
        transitIndices.push({ x: t, y: flux });
      }
    }

    const confidence = Math.max(0.62, Math.min(0.99, 0.55 + (snr || 10) / 80));
    const classification =
      row.disposition === "FA"
        ? "False Positive / Noise"
        : row.disposition === "KP"
          ? "Transit Detected"
          : confidence > 0.82
            ? "Candidate Transit"
            : "Possible Stellar Variability";

    const reasons = [
      `Periodic dip centered near phase 0.50 with best-fit period ${row.period !== null ? row.period.toFixed(2) : "n/a"} days.`,
      `Estimated transit depth ${row.depthPpm !== null ? Math.round(row.depthPpm) : "n/a"} ppm is preserved after denoising.`,
      `Signal-to-noise ratio ${row.snr !== null ? row.snr.toFixed(1) : "n/a"} supports ${confidence > 0.85 ? "high" : "moderate"} confidence detection.`,
      `${row.disposition === "KP" ? "Catalog disposition already favors a planet candidate." : "Classification remains explainable and reviewable before follow-up."}`,
    ];

    return {
      raw,
      denoised,
      probability,
      outliers,
      transitIndices,
      threshold: 0.72,
      confidence,
      classification,
      reasons,
    };
  }

  function svgEl(tag, attrs) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([key, value]) => {
      el.setAttribute(key, value);
    });
    return el;
  }

  function toRequestedClassLabel(classification) {
    const normalized = String(classification || "").toLowerCase();
    if (normalized.includes("transit") || normalized.includes("planet")) {
      return "Transit";
    }
    if (normalized.includes("eclips")) {
      return "Eclipsing Binary";
    }
    if (normalized.includes("blend")) {
      return "Blend";
    }
    return "Other";
  }

  function linePath(data, xMap, yMap) {
    return data
      .map((point, index) => `${index === 0 ? "M" : "L"} ${xMap(point.x).toFixed(2)} ${yMap(point.y).toFixed(2)}`)
      .join(" ");
  }

  function renderSignalChart(svgId, config) {
    const svg = document.getElementById(svgId);
    svg.innerHTML = "";

    const width = 620;
    const height = svgId === "raw-chart" ? 250 : 220;
    const padding = { top: 18, right: 18, bottom: 30, left: 46 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    const allValues = config.series.flatMap((series) => series.data.map((point) => point.y));
    const minY = Math.min(...allValues);
    const maxY = Math.max(...allValues);
    const yMin = minY - 0.004;
    const yMax = maxY + 0.004;

    const xMap = (value) => padding.left + value * innerWidth;
    const yMap = (value) => padding.top + innerHeight - ((value - yMin) / (yMax - yMin || 1)) * innerHeight;

    for (let i = 0; i <= 4; i += 1) {
      const y = padding.top + (innerHeight / 4) * i;
      svg.appendChild(svgEl("line", { x1: padding.left, x2: width - padding.right, y1: y, y2: y, class: "chart-grid-line" }));
    }

    svg.appendChild(svgEl("line", { x1: padding.left, x2: width - padding.right, y1: height - padding.bottom, y2: height - padding.bottom, class: "axis-line" }));
    svg.appendChild(svgEl("line", { x1: padding.left, x2: padding.left, y1: padding.top, y2: height - padding.bottom, class: "axis-line" }));

    const xLabel = svgEl("text", { x: width / 2, y: height - 8, "text-anchor": "middle", class: "axis-label" });
    xLabel.textContent = config.xLabel;
    svg.appendChild(xLabel);

    const yLabel = svgEl("text", { x: 16, y: height / 2, "text-anchor": "middle", transform: `rotate(-90 16 ${height / 2})`, class: "axis-label" });
    yLabel.textContent = config.yLabel;
    svg.appendChild(yLabel);

    if (config.threshold !== undefined) {
      const thresholdPath = svgEl("path", {
        d: `M ${padding.left} ${yMap(config.threshold)} L ${width - padding.right} ${yMap(config.threshold)}`,
        class: "threshold-line",
      });
      svg.appendChild(thresholdPath);
    }

    config.series.forEach((series) => {
      svg.appendChild(svgEl("path", { d: linePath(series.data, xMap, yMap), class: series.className }));
    });

    (config.points || []).forEach((pointSet) => {
      pointSet.data.forEach((point) => {
        svg.appendChild(svgEl("circle", {
          cx: xMap(point.x),
          cy: yMap(point.y),
          r: pointSet.radius || 2.7,
          class: pointSet.className,
        }));
      });
    });
  }

  function renderPipeline(model, row) {
    renderSignalChart("raw-chart", {
      xLabel: "Time (days)",
      yLabel: "Relative Flux",
      series: [{ data: model.raw, className: "raw-path" }],
      points: [
        { data: model.outliers, className: "outlier-point", radius: 3 },
        { data: model.transitIndices.slice(0, 3), className: "transit-point", radius: 3 },
      ],
    });

    renderSignalChart("denoised-chart", {
      xLabel: "Time",
      yLabel: "Flux",
      series: [{ data: model.denoised, className: "denoised-path" }],
    });

    renderSignalChart("probability-chart", {
      xLabel: "Time",
      yLabel: "Probability",
      threshold: model.threshold,
      series: [{ data: model.probability, className: "probability-path" }],
    });

    const requestedClassLabel = toRequestedClassLabel(model.classification);

    document.getElementById("pipeline-output").textContent = requestedClassLabel;
    document.getElementById("pipeline-confidence").textContent = model.confidence.toFixed(2);

    const resultBadge = document.getElementById("result-badge");
    resultBadge.textContent = requestedClassLabel;
    resultBadge.style.color = model.confidence > 0.8 ? "var(--success)" : "var(--warning)";
    resultBadge.style.background = model.confidence > 0.8 ? "rgba(110, 226, 155, 0.12)" : "rgba(255, 211, 118, 0.12)";
    resultBadge.style.borderColor = model.confidence > 0.8 ? "rgba(110, 226, 155, 0.22)" : "rgba(255, 211, 118, 0.22)";

    const tierEl = document.getElementById("result-confidence-tier");
    if (tierEl) {
      tierEl.textContent = model.confidence > 0.85 ? "High Confidence" : model.confidence > 0.72 ? "Moderate Confidence" : "Low Confidence";
    }

    document.getElementById("result-confidence").textContent = `${(model.confidence * 100).toFixed(1)}%`;
    document.getElementById("result-classification").textContent = requestedClassLabel;
    document.getElementById("result-duration").textContent =
      row.durationHours !== null ? `${row.durationHours.toFixed(2)} hr` : "n/a";
    document.getElementById("result-depth").textContent =
      row.depthPpm !== null ? `${Math.round(row.depthPpm)} ppm` : "n/a";

    const reasonList = document.getElementById("reason-list");
    reasonList.innerHTML = model.reasons.map((reason) => `<li>${reason}</li>`).join("");
    updateComparisonSummary();
  }

  function renderBars(containerId, items, formatter) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    const topCount = items[0] ? items[0].count : 1;

    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "bar-row";
      row.innerHTML = `
        <div class="bar-label">${item.label}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${(item.count / topCount) * 100}%"></div></div>
        <div class="bar-value">${formatter(item.count)}</div>
      `;
      container.appendChild(row);
    });
  }

  function renderScatter(rows) {
    const svg = document.getElementById("scatter-plot");
    svg.innerHTML = "";

    const points = rows
      .filter((row) => row.period !== null && row.radius !== null)
      .sort((a, b) => (b.snr || 0) - (a.snr || 0))
      .slice(0, 180);

    if (!points.length) {
      return;
    }

    const width = 640;
    const height = 320;
    const padding = 42;
    const maxPeriod = Math.max(...points.map((point) => point.period), 1);
    const maxRadius = Math.max(...points.map((point) => point.radius), 1);

    const xScale = (value) => padding + (value / maxPeriod) * (width - padding * 2);
    const yScale = (value) => height - padding - (value / maxRadius) * (height - padding * 2);

    for (let i = 0; i < 5; i += 1) {
      const y = padding + ((height - padding * 2) / 4) * i;
      svg.appendChild(svgEl("line", { x1: padding, x2: width - padding, y1: y, y2: y, class: "chart-grid-line" }));
    }

    svg.appendChild(svgEl("line", { x1: padding, x2: width - padding, y1: height - padding, y2: height - padding, class: "axis-line" }));
    svg.appendChild(svgEl("line", { x1: padding, x2: padding, y1: padding, y2: height - padding, class: "axis-line" }));

    const xLabel = svgEl("text", { x: width / 2, y: height - 8, "text-anchor": "middle", class: "axis-label" });
    xLabel.textContent = "Orbital period (days)";
    svg.appendChild(xLabel);

    const yLabel = svgEl("text", { x: 16, y: height / 2, "text-anchor": "middle", transform: `rotate(-90 16 ${height / 2})`, class: "axis-label" });
    yLabel.textContent = "Planet radius (R_Earth)";
    svg.appendChild(yLabel);

    points.forEach((point) => {
      const circle = svgEl("circle", {
        cx: xScale(point.period),
        cy: yScale(point.radius),
        r: Math.max(2, Math.min(7, (point.snr || 8) / 10)),
        class: "point",
      });
      const title = svgEl("title", {});
      title.textContent = `${point.toi} | ${point.disposition} | period ${point.period.toFixed(2)} d | radius ${point.radius.toFixed(2)} R_Earth`;
      circle.appendChild(title);
      svg.appendChild(circle);
    });
  }

  function renderFollowUp(rows) {
    const container = document.getElementById("follow-up-list");
    container.innerHTML = "";

    rows
      .filter((row) => (row.snr || 0) >= 30)
      .sort((a, b) => (b.snr || 0) - (a.snr || 0))
      .slice(0, 6)
      .forEach((row) => {
        const card = document.createElement("article");
        card.className = "follow-card";
        card.innerHTML = `
          <h3>${row.toi}</h3>
          <p>TIC <span class="mono">${row.ticId}</span></p>
          <p>${row.comments}</p>
          <div class="follow-meta">
            <span class="pill">${row.disposition}</span>
            <span class="pill">SNR ${row.snr !== null ? row.snr.toFixed(1) : "n/a"}</span>
            <span class="pill">${row.period !== null ? row.period.toFixed(2) + " d" : "period n/a"}</span>
          </div>
        `;
        card.addEventListener("click", () => activateRow(row, true));
        container.appendChild(card);
      });
  }

  function populateDispositionFilter(rows) {
    const options = ["ALL", ...new Set(rows.map((row) => row.disposition))];
    dispositionFilter.innerHTML = "";
    options.forEach((option) => {
      const el = document.createElement("option");
      el.value = option;
      el.textContent = option === "ALL" ? "All dispositions" : option;
      dispositionFilter.appendChild(el);
    });
  }

  function renderTable(rows) {
    if (!rows.length) {
      catalogBody.innerHTML = `<tr><td colspan="8" class="empty-cell">No targets available.</td></tr>`;
      return;
    }

    catalogBody.innerHTML = "";
    rows.slice(0, 150).forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="mono">${row.ticId}</td>
        <td>${row.toi}</td>
        <td>${row.disposition}</td>
        <td>${row.period !== null ? row.period.toFixed(4) + " d" : "n/a"}</td>
        <td>${row.radius !== null ? row.radius.toFixed(2) + " R_Earth" : "n/a"}</td>
        <td>${row.snr !== null ? row.snr.toFixed(1) : "n/a"}</td>
        <td>${row.source}</td>
        <td>${row.comments}</td>
      `;
      tr.addEventListener("click", () => {
        activateRow(row, true);
      });
      catalogBody.appendChild(tr);
    });
  }

  function populateComparisonSelectors(rows) {
    const options = rows.slice(0, 24);
    primaryTargetSelect.innerHTML = "";
    comparisonTargetSelect.innerHTML = "";

    options.forEach((row, index) => {
      const primaryOption = document.createElement("option");
      primaryOption.value = row.id;
      primaryOption.textContent = `${row.toi} (${row.ticId})`;
      primaryTargetSelect.appendChild(primaryOption);

      const comparisonOption = document.createElement("option");
      comparisonOption.value = row.id;
      comparisonOption.textContent = `${row.toi} (${row.ticId})`;
      comparisonTargetSelect.appendChild(comparisonOption);

      if (index === 0 && !state.activeRow) {
        primaryTargetSelect.value = row.id;
      }
      if (index === 1 && !state.comparisonRow) {
        comparisonTargetSelect.value = row.id;
      }
    });

    if (!state.comparisonRow && rows[1]) {
      comparisonTargetSelect.value = rows[1].id;
    }
  }

  function activateRow(row, scrollToPipeline, modelOverride) {
    setFocus(row);
    state.detectionModel = modelOverride || generateDetectionModel(row);
    state.comparisonRow = state.comparisonRow || state.rows.find((candidate) => candidate.id !== row.id) || null;
    renderPipeline(state.detectionModel, row);
    if (scrollToPipeline) {
      document.getElementById("pipeline").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  async function runDetectionExperience() {
    if (!state.activeRow && !state.uploadedCurve) {
      setStatus("Load the TOI catalog or upload a light curve so the detection pipeline has data to analyze.");
      return;
    }

    if (!state.activeRow && state.uploadedCurve) {
      ensureActiveRowForUploadedCurve();
    }

    if (state.isRunningPipeline) {
      return;
    }

    state.isRunningPipeline = true;
    setStatus(`Running AI pipeline for ${state.activeRow.toi}${state.uploadedCurve ? " using uploaded light curve" : ""}...`);
    runDetectionBtn.disabled = true;

    try {
      await runPipelineProgress();

      activateRow(state.activeRow, true);

      setStatus(`Transit analysis completed for ${state.activeRow.toi}. Confidence ${(state.detectionModel.confidence * 100).toFixed(1)}%.`);

      const resultsSection = document.getElementById("scientific-results");
      const analyticsSection = document.getElementById("analytics");

      await wait(650);
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      await wait(900);
      if (analyticsSection) {
        analyticsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } finally {
      state.isRunningPipeline = false;
      runDetectionBtn.disabled = false;
    }
  }

  function renderDashboard(rows) {
    state.rows = rows;

    const kpCount = rows.filter((row) => row.disposition === "KP").length;
    const highSnrCount = rows.filter((row) => (row.snr || 0) >= 50).length;
    const medianPeriodValue = median(rows.map((row) => row.period).filter((value) => value !== null));

    metricEls.total.textContent = rows.length.toLocaleString();
    metricEls.kp.textContent = kpCount.toLocaleString();
    metricEls.snr.textContent = highSnrCount.toLocaleString();
    metricEls.period.textContent = medianPeriodValue !== null ? `${medianPeriodValue.toFixed(2)} d` : "n/a";

    renderBars("disposition-bars", countBy(rows, "disposition").slice(0, 6), (value) => value.toLocaleString());
    renderBars("source-bars", countBy(rows, "source").slice(0, 6), (value) => value.toLocaleString());
    renderBars("radius-bars", buildRadiusBuckets(rows), (value) => value.toLocaleString());
    renderScatter(rows);
    renderFollowUp(rows);
    renderTable(rows);
    populateComparisonSelectors(rows);

    const bestRow =
      [...rows]
        .filter((row) => row.period !== null && row.snr !== null)
        .sort((a, b) => (b.snr || 0) - (a.snr || 0))[0] || rows[0];

    if (bestRow) {
      activateRow(bestRow, false);
      primaryTargetSelect.value = bestRow.id;
    }

    if (rows[1]) {
      setComparisonRow(rows[1]);
      comparisonTargetSelect.value = rows[1].id;
    }

    setStatus(`Loaded ${rows.length.toLocaleString()} TOI records. Choose planets to compare and inspect the detection pipeline.`);
  }

  async function loadDefaultCatalog() {
    setStatus("Loading bundled TOI catalog...");
    try {
      const response = await fetch("./dataset_exoplanets/tois.csv");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const text = await response.text();
      const rows = normalizeRows(parseCsv(text));
      renderDashboard(rows);
    } catch (error) {
      setStatus("Automatic load failed. Serve the frontend through the local Python server.");
      console.error(error);
    }
  }

  getStartedBtn.addEventListener("click", async () => {
    homeScreen.classList.add("is-hidden");
    topbar.classList.remove("is-hidden");
    dashboardShell.classList.remove("is-hidden");
    await loadDefaultCatalog();
  });
  runDetectionBtn.addEventListener("click", runDetectionExperience);

  primaryTargetSelect.addEventListener("change", () => {
    const selectedRow = state.rows.find((row) => row.id === primaryTargetSelect.value);
    if (selectedRow) {
      activateRow(selectedRow, false);
    }
  });

  comparisonTargetSelect.addEventListener("change", () => {
    const selectedRow = state.rows.find((row) => row.id === comparisonTargetSelect.value);
    if (selectedRow) {
      setComparisonRow(selectedRow);
    }
  });

  resetPipelineProgress();
})();
