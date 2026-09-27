"use client";

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type CachedLightCurveData = {
  planet: string;
  planetId: string;
  observed: boolean;
  mission: string;
  source: string;
  mode: "phase-folded";
  periodDays: number;
  points: { phase: number; flux: number }[];
  campaign?: string | number;
  sector?: string | number;
  quarter?: string | number;
  observationId?: string;
  dataProduct?: string;
  numberOfRawPoints?: number;
  numberOfProcessedPoints?: number;
  processingDate?: string;
};

type Props = {
  planetName: string;
  curve: CachedLightCurveData | null;
  loading: boolean;
  solarSystemReference: boolean;
  radialVelocityDetection: boolean;
  onAskRadialVelocity: () => void;
};

const emptyPanel = { minHeight: 280, display: "grid", placeItems: "center", padding: 24, color: "#91a2a6", fontSize: 12, textAlign: "center" as const };

export default function CachedLightCurve({ planetName, curve, loading, solarSystemReference, radialVelocityDetection, onAskRadialVelocity }: Props) {
  return <div className="curve-panel">
    <div className="curve-heading">
      <div><p className="eyebrow">03 / OBSERVED LIGHT CURVE</p><h3>{planetName}: stellar brightness</h3></div>
      <span className="data-badge">{curve ? "● OBSERVED DATA" : solarSystemReference ? "REFERENCE OBJECT" : radialVelocityDetection ? "RADIAL VELOCITY" : "OBSERVATION UNAVAILABLE"}</span>
    </div>

    {loading
      ? <div className="real-curve" style={emptyPanel}>Loading cached light curve…</div>
      : solarSystemReference
        ? <div className="real-curve" style={emptyPanel}><div><strong style={{ display: "block", color: "#dce6e2", marginBottom: 8 }}>Solar System reference object</strong>ExoScope’s transit-light-curve visualization is intended for exoplanet observations.</div></div>
        : radialVelocityDetection
          ? <div className="real-curve" style={emptyPanel}><div><strong style={{ display: "block", color: "#dce6e2", marginBottom: 8 }}>Transit light curve unavailable</strong><p style={{ margin: "0 auto 10px", maxWidth: 420 }}>Proxima Centauri b was detected using radial velocity, not a confirmed transit signal.</p><button className="text-link" onClick={onAskRadialVelocity}>Ask ExoScope AI about radial velocity →</button></div></div>
          : curve?.observed && curve.points.length > 1
            ? <>
              <div style={{ margin: "16px 0 8px", display: "flex", alignItems: "center", gap: 12, color: "#91a2a6", fontSize: 10 }}><span style={{ color: "#cfed85", letterSpacing: ".06em" }}>● OBSERVED DATA</span><span>Source: NASA / MAST · {curve.mission}{curve.campaign ? ` · Campaign ${curve.campaign}` : ""}{curve.sector ? ` · Sector ${curve.sector}` : ""}</span></div>
              <div className="real-curve" style={{ width: "100%", height: 300, padding: "12px 10px 5px", background: "#f8f8f5" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={curve.points} margin={{ top: 12, right: 12, bottom: 12, left: 7 }}>
                    <CartesianGrid stroke="#dce2df" strokeDasharray="3 4" />
                    <XAxis dataKey="phase" type="number" domain={[-0.15, 0.15]} tick={{ fill: "#53656c", fontSize: 9 }} tickFormatter={(value: number) => value.toFixed(2)} label={{ value: "Orbital Phase", position: "insideBottom", offset: -5, fill: "#53656c", fontSize: 10 }} />
                    <YAxis dataKey="flux" domain={["auto", "auto"]} tick={{ fill: "#53656c", fontSize: 9 }} tickFormatter={(value: number) => value.toFixed(4)} width={55} label={{ value: "Relative Flux", angle: -90, position: "insideLeft", fill: "#53656c", fontSize: 9 }} />
                    <Tooltip labelFormatter={(value) => `Orbital phase ${Number(value).toFixed(4)}`} formatter={(value) => [Number(value).toFixed(6), "Relative flux"]} />
                    <ReferenceLine x={0} stroke="#63777c" strokeDasharray="4 4" label={{ value: "Transit", fill: "#53656c", fontSize: 9, position: "insideTopRight" }} />
                    <Line type="monotone" dataKey="flux" name="Observed relative flux" stroke="#087b9a" strokeWidth={1.35} dot={false} isAnimationActive={false} connectNulls={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <details style={{ marginTop: 10, color: "#91a2a6", fontSize: 10 }}>
                <summary style={{ cursor: "pointer" }}>Data details</summary>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 7, marginTop: 8 }}>
                  <span>Mission: {curve.mission}</span><span>Campaign: {curve.campaign ?? "Not listed"}</span><span>Sector: {curve.sector ?? "Not listed"}</span><span>Quarter: {curve.quarter ?? "Not listed"}</span>
                  <span>Observation ID: {curve.observationId ?? curve.dataProduct ?? "Not listed"}</span><span>Period: {curve.periodDays} days</span><span>Processed points: {curve.numberOfProcessedPoints ?? curve.points.length}</span>
                </div>
              </details>
            </>
            : <div className="real-curve" style={emptyPanel}><div><strong style={{ display: "block", color: "#dce6e2", marginBottom: 8 }}>Observed transit light curve unavailable</strong>This planet does not currently have a cached observed transit light curve in ExoScope.</div></div>}

    <div className="curve-foot"><span>{curve?.observed ? `${curve.numberOfProcessedPoints ?? curve.points.length} phase-folded archival points` : solarSystemReference ? "Solar System size reference" : "No cached observational curve"}</span></div>
    <p className="curve-caption">{curve?.observed ? `Real ${curve.mission} photometry phase-folded on the ${curve.periodDays}-day orbital period. The dip near phase 0 is the observed transit.` : radialVelocityDetection ? "Radial velocity measures the host star’s motion; it does not provide a confirmed transit light curve for this planet." : solarSystemReference ? "This object is shown for scale comparison and is not presented as an exoplanet discovery observation." : "Only cached archival measurements are shown here. No simulated observational curve is substituted."}</p>
  </div>;
}
