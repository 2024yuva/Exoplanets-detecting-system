"use client";

import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type CachedCurve = {
  planet: string;
  planetId: string;
  observed: boolean;
  mission: string;
  source: string;
  mode: "phase-folded";
  periodDays: number;
  campaign?: string | number;
  quarter?: string | number;
  sector?: string | number;
  numberOfRawPoints?: number;
  numberOfProcessedPoints?: number;
  points: { phase: number; flux: number }[];
};

const examples = [
  { id: "k2-18-b", file: "k2-18-b.json" },
  { id: "trappist-1-e", file: "trappist-1-e.json" },
  { id: "kepler-22-b", file: "kepler-22-b.json" },
];

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length ? (sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2) : null;
}

function transitDepthPpm(points: CachedCurve["points"]) {
  const center = median(points.filter((point) => Math.abs(point.phase) <= 0.002).map((point) => point.flux));
  const baseline = median(points.filter((point) => Math.abs(point.phase) >= 0.012 && Math.abs(point.phase) <= 0.04).map((point) => point.flux));
  if (center === null || baseline === null || baseline <= 0) return null;
  return Math.max(0, Math.round(((baseline - center) / baseline) * 1_000_000));
}

export default function LightCurveGallery() {
  const [curves, setCurves] = useState<Record<string, CachedCurve>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all(examples.map(async ({ id, file }) => {
      const response = await fetch(`/lightcurves/${file}`, { signal: controller.signal, cache: "force-cache" });
      if (!response.ok) return null;
      const curve = await response.json() as CachedCurve;
      if (!curve.observed || curve.planetId !== id || !Array.isArray(curve.points)) return null;
      const validPoints = curve.points.filter((point) => Number.isFinite(point.phase) && Number.isFinite(point.flux));
      return validPoints.length > 1 ? [id, { ...curve, points: validPoints }] as const : null;
    }))
      .then((results) => {
        if (!controller.signal.aborted) setCurves(Object.fromEntries(results.filter((result): result is NonNullable<typeof result> => result !== null)));
      })
      .catch(() => undefined)
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return <section className="lightcurve-gallery" aria-labelledby="archive-curves-heading" style={{ padding: "44px 5.5vw 30px", borderTop: "1px solid rgba(180,202,211,.12)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
      <div><p className="eyebrow">04 / ARCHIVE EXAMPLES</p><h2 id="archive-curves-heading" style={{ margin: "8px 0 0", color: "#edf2ee", fontSize: "clamp(24px,3vw,38px)", letterSpacing: "-.04em" }}>Three worlds, measured.</h2></div>
      <p style={{ maxWidth: 430, margin: 0, color: "#91a2a6", fontSize: 11, lineHeight: 1.7 }}>A reviewer view of real, phase-folded NASA / MAST observations. Each dip is measured from archival starlight data.</p>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 14 }}>
      {examples.map(({ id }) => {
        const curve = curves[id];
        if (!curve) return <article className="curve-panel" key={id} style={{ minWidth: 0 }}><div className="curve-heading"><div><p className="eyebrow">NASA / MAST ARCHIVE</p><h3>{id === "k2-18-b" ? "K2-18 b" : id === "trappist-1-e" ? "TRAPPIST-1 e" : "Kepler-22 b"}</h3></div><span className="data-badge">{loading ? "LOADING" : "UNAVAILABLE"}</span></div><div className="real-curve" style={{ minHeight: 165, display: "grid", placeItems: "center", color: "#91a2a6", fontSize: 11, textAlign: "center" }}>{loading ? "Loading cached observation…" : "Cached observed curve unavailable."}</div></article>;
        const depth = transitDepthPpm(curve.points);
        const observationWindow = curve.campaign ? `Campaign ${curve.campaign}` : curve.sector ? `Sector ${curve.sector}` : curve.quarter ?? "Archive data";
        return <article className="curve-panel" key={id} style={{ minWidth: 0 }}>
          <div className="curve-heading"><div><p className="eyebrow">{curve.mission} · {observationWindow}</p><h3>{curve.planet}</h3></div><span className="data-badge">● OBSERVED DATA</span></div>
          <div style={{ margin: "12px 0 8px", color: "#91a2a6", fontSize: 9 }}>Source: NASA / MAST</div>
          <div className="real-curve" style={{ width: "100%", height: 190, padding: "8px 6px 4px", background: "#f8f8f5" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curve.points} margin={{ top: 10, right: 8, bottom: 7, left: 3 }}>
                <CartesianGrid stroke="#dce2df" strokeDasharray="3 4" />
                <XAxis dataKey="phase" type="number" domain={[-0.15, 0.15]} tick={{ fill: "#53656c", fontSize: 8 }} tickFormatter={(value: number) => value.toFixed(2)} />
                <YAxis dataKey="flux" domain={["auto", "auto"]} tick={{ fill: "#53656c", fontSize: 8 }} tickFormatter={(value: number) => value.toFixed(3)} width={43} />
                <Tooltip labelFormatter={(value) => `Phase ${Number(value).toFixed(4)}`} formatter={(value) => [Number(value).toFixed(6), "Relative flux"]} />
                <ReferenceLine x={0} stroke="#63777c" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="flux" name="Observed relative flux" stroke="#087b9a" strokeWidth={1.25} dot={false} isAnimationActive={false} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 7, marginTop: 10 }}>
            {[
              ["ORBIT", `${curve.periodDays.toFixed(curve.periodDays < 100 ? 3 : 1)} d`],
              ["TRANSIT DIP", depth === null ? "Not resolved" : `${depth.toLocaleString()} ppm`],
              ["MEASUREMENTS", (curve.numberOfRawPoints ?? 0).toLocaleString()],
            ].map(([label, value]) => <div key={label} style={{ padding: "8px 7px", border: "1px solid rgba(180,202,211,.12)", background: "rgba(255,255,255,.025)", minWidth: 0 }}><span style={{ display: "block", color: "#91a2a6", fontSize: 7, letterSpacing: ".07em" }}>{label}</span><strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 5, color: "#dce6e2", fontSize: 11 }}>{value}</strong></div>)}
          </div>
          <p className="curve-caption" style={{ marginBottom: 0 }}>The transit is centered near orbital phase 0. Points are binned from {curve.numberOfRawPoints?.toLocaleString() ?? "archival"} measured flux samples.</p>
        </article>;
      })}
    </div>
  </section>;
}
