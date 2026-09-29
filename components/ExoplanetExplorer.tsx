"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { exoplanets, type Exoplanet } from "@/data/exoplanets";
import CachedLightCurve from "@/components/CachedLightCurve";

type Curve = {
    planet: string;
    planetId: string;
    observed: boolean;
    mission: string;
    source: string;
    mode: "phase-folded";
    periodDays: number;
    points: { phase: number; flux: number }[];
    sector?: string;
    numberOfRawPoints?: number;
    numberOfProcessedPoints?: number;
};

type LiveCurve = {
    targetName?: string;
    mission?: string;
    source?: string;
    periodDays?: number;
    sectors?: (string | number)[];
    pointCount?: number;
    phaseFolded?: { phase: number; flux: number }[];
};

const curveFiles: Record<string, string> = {
    "k2-18b": "k2-18-b",
    "trappist-1e": "trappist-1-e",
    "kepler-22b": "kepler-22-b",
};

function planetClass(planet: Exoplanet) {
    return `orb orb-${planet.planetType.toLowerCase().replace(/[^a-z]+/g, "-")}`;
}

export default function ExoplanetExplorer() {
    const worlds = exoplanets.filter((planet) => planet.id !== "earth");
    const [selected, setSelected] = useState<Exoplanet>(worlds.find((planet) => planet.id === "k2-18b") ?? worlds[0]);
    const [query, setQuery] = useState("");
    const [curve, setCurve] = useState<Curve | null>(null);
    const [loading, setLoading] = useState(true);
    const filteredWorlds = useMemo(() => worlds.filter((planet) => planet.name.toLowerCase().includes(query.toLowerCase())), [query, worlds]);

    useEffect(() => {
        const controller = new AbortController();
        setCurve(null);
        setLoading(true);
        const file = curveFiles[selected.id] ?? selected.id;
        const accept = (candidate: Curve | null) => {
            if (!candidate?.observed || candidate.mode !== "phase-folded") return false;
            const points = candidate.points.filter((point) => Number.isFinite(point.phase) && Number.isFinite(point.flux));
            if (points.length < 2) return false;
            setCurve({ ...candidate, points });
            return true;
        };

        fetch(`/lightcurves/${encodeURIComponent(file)}.json`, { signal: controller.signal, cache: "force-cache" })
            .then(async (response) => response.ok ? await response.json() as Curve : null)
            .then(async (cached) => {
                if (controller.signal.aborted || accept(cached)) return;
                const response = await fetch(`/api/lightcurve?planetId=${encodeURIComponent(selected.id)}`, { signal: controller.signal, cache: "no-store" });
                if (!response.ok) return;
                const live = await response.json() as LiveCurve;
                const points = (live.phaseFolded ?? []).filter((point) => Number.isFinite(point.phase) && Number.isFinite(point.flux));
                if (points.length < 2 || controller.signal.aborted) return;
                accept({
                    planet: live.targetName ?? selected.name,
                    planetId: selected.id,
                    observed: true,
                    mission: live.mission ?? "TESS",
                    source: live.source ?? "MAST",
                    mode: "phase-folded",
                    periodDays: live.periodDays ?? selected.orbitalPeriodDays,
                    points,
                    sector: live.sectors?.join(", "),
                    numberOfRawPoints: live.pointCount,
                });
            })
            .catch(() => undefined)
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });

        return () => controller.abort();
    }, [selected]);

    return <main className="experience">
        <section className="section-intro" id="exoplanet-catalog">
            <div><p className="eyebrow">EXOPLANET CATALOG</p><h1>Explore a world<br />in its own light.</h1></div>
            <p>Choose one of the project's featured exoplanets to inspect its physical properties and observed or live phase-folded light curve.</p>
        </section>

        <section className="explorer">
            <aside className="world-list">
                <div className="panel-heading"><div><span className="section-number">A</span><div><h3>Choose an exoplanet</h3><p>{worlds.length} featured worlds</p></div></div></div>
                <label className="search-box"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search planets" aria-label="Search exoplanets" /></label>
                <div className="world-options">{filteredWorlds.map((planet) => <button className={`world-option ${planet.id === selected.id ? "selected" : ""}`} key={planet.id} onClick={() => setSelected(planet)} aria-pressed={planet.id === selected.id}><span className={`${planetClass(planet)} option-orb`} /><span><strong>{planet.name}</strong><small>{planet.planetType}</small></span><ChevronDown size={15} className="option-arrow" /></button>)}</div>
                {!filteredWorlds.length && <p className="empty-search">No exoplanets match that search.</p>}
            </aside>

            <aside className="planet-facts">
                <div className="panel-heading"><div><span className="section-number">B</span><div><h3>Planet overview</h3><p>{selected.name}</p></div></div></div>
                <div className="facts-visual"><span className={`${planetClass(selected)} facts-orb`} /><div><span>PLANET TYPE</span><strong>{selected.planetType}</strong></div></div>
                <p className="fact-summary">{selected.description}</p>
                <div className="fact-table"><div><span>Host star</span><strong>{selected.hostStar}</strong></div><div><span>Radius</span><strong>{selected.radiusEarth} R⊕</strong></div><div><span>Mass</span><strong>{selected.massEarth} M⊕</strong></div><div><span>Orbital period</span><strong>{selected.orbitalPeriodDays} days</strong></div><div><span>Transit duration</span><strong>{selected.transitDurationHours ? `${selected.transitDurationHours.toFixed(2)} hours` : "Not measured"}</strong></div><div><span>Transit depth</span><strong>{selected.transitDepthPpm ? `${selected.transitDepthPpm.toLocaleString()} ppm` : "Not measured"}</strong></div><div><span>Distance</span><strong>{selected.distanceLightYears} light-years</strong></div><div><span>Discovery</span><strong>{selected.discoveryMethod}</strong></div></div>
                <div className="habitable-note"><span className={selected.habitableZone ? "zone-dot" : "zone-dot muted"} />{selected.habitableZone ? "In the habitable zone" : "Outside the habitable zone"}<small>Habitability is not evidence of life.</small></div>
            </aside>

            <aside className="comparison-panel">
                <CachedLightCurve planetName={selected.name} curve={curve} loading={loading} solarSystemReference={false} radialVelocityDetection={false} onAskRadialVelocity={() => undefined} />
            </aside>
        </section>
    </main>;
}
