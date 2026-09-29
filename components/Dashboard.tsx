"use client";

import { useEffect, useMemo, useState } from "react";
import { exoplanets, Exoplanet } from "@/data/exoplanets";
import type { KnowledgeSource } from "@/data/astronomyKnowledge";
import CachedLightCurve from "@/components/CachedLightCurve";
import LightCurveGallery from "@/components/LightCurveGallery";
import { ArrowDown, ArrowRight, ChevronDown, MessageCircle, Search, Send, X } from "lucide-react";

const earthReference = exoplanets.find((planet) => planet.id === "earth") ?? exoplanets[0];
const worlds = exoplanets.filter((planet) => planet.id !== "earth");
const k218Image = "https://assets.science.nasa.gov/dynamicimage/assets/science/missions/webb/science/2023/09/STScI-01H9R8AEK6Y7QR03MGN9V9P6ZJ.jpg?crop=faces%2Cfocalpoint&fit=clip&h=1080&w=1920";
const earthImage = "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/2023/12/PIA18033.jpg?crop=faces%2Cfocalpoint&fit=clip&h=1200&w=1900";
const jupiterImage = "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia01/pia01509/PIA01509.jpg?crop=faces%2Cfocalpoint&fit=clip&h=400&w=400";
const neptuneImage = "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/2023/09/p/i/a/0/PIA01492-1.jpg?crop=faces%2Cfocalpoint&fit=clip&h=800&w=800";
const lightCurveFiles: Record<string, { file: string; cacheId: string }> = {
  "k2-18b": { file: "k2-18-b", cacheId: "k2-18-b" },
  "trappist-1e": { file: "trappist-1-e", cacheId: "trappist-1-e" },
  "kepler-22b": { file: "kepler-22-b", cacheId: "kepler-22-b" },
};

type CachedLightCurve = {
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

type LiveLightCurve = {
  targetName?: string;
  mission?: string;
  source?: string;
  periodDays?: number;
  sectors?: (string | number)[];
  pointCount?: number;
  phaseFolded?: { phase: number; flux: number }[];
};

function Orb({ planet, className = "" }: { planet: Exoplanet; className?: string }) {
  if (planet.id === "earth") return <span className={`orb orb-earth ${className}`} style={{ backgroundImage: `url(${earthImage})` }} />;
  if (planet.id === "jupiter") return <span className={`orb orb-jupiter ${className}`} style={{ backgroundImage: `url(${jupiterImage})` }} />;
  if (planet.id === "neptune") return <span className={`orb orb-neptune ${className}`} style={{ backgroundImage: `url(${neptuneImage})` }} />;
  if (planet.id === "k2-18b") return <span className={`orb orb-concept ${className}`} style={{ backgroundImage: `url(${k218Image})` }} />;
  return <span className={`orb orb-${planet.planetType.toLowerCase().replace(/[^a-z]+/g, "-")} ${className}`} />;
}

export default function Dashboard() {
  const [selected, setSelected] = useState<Exoplanet>(worlds.find((p) => p.id === "k2-18b") ?? worlds[0]);
  const [query, setQuery] = useState("");
  const [sizeMode, setSizeMode] = useState<"radius" | "mass">("radius");
  const [chatOpen, setChatOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatPending, setChatPending] = useState(false);
  const [chatModel, setChatModel] = useState("GPT-OSS 120B");
  const [messages, setMessages] = useState<{ from: "you" | "guide"; text: string; sources?: KnowledgeSource[] }[]>([]);
  const [cachedCurve, setCachedCurve] = useState<CachedLightCurve | null>(null);
  const [curveLoading, setCurveLoading] = useState(true);
  const filteredWorlds = useMemo(() => worlds.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())), [query]);
  const maxRadius = Math.max(1, selected.radiusEarth);
  const earthDiameter = 300 / maxRadius;
  const selectedDiameter = earthDiameter * selected.radiusEarth;
  const compareValue = sizeMode === "radius" ? selected.radiusEarth : selected.massEarth;
  const compareUnit = sizeMode === "radius" ? "Earth radii" : "Earth masses";

  const isSolarSystemReference = false;
  const hasRadialVelocityDetection = selected.id === "proxima-b";

  useEffect(() => {
    const controller = new AbortController();
    setCachedCurve(null);
    setCurveLoading(!isSolarSystemReference && !hasRadialVelocityDetection);
    if (isSolarSystemReference || hasRadialVelocityDetection) return () => controller.abort();

    const cache = lightCurveFiles[selected.id] ?? { file: selected.id, cacheId: selected.id };
    const useCurve = (curve: CachedLightCurve | null) => {
      if (!curve || !curve.observed || curve.mode !== "phase-folded" || !Array.isArray(curve.points)) return false;
      const validPoints = curve.points.filter((point) => Number.isFinite(point.phase) && Number.isFinite(point.flux));
      if (validPoints.length < 2) return false;
      setCachedCurve({ ...curve, points: validPoints });
      return true;
    };
    fetch(`/lightcurves/${encodeURIComponent(cache.file)}.json`, { signal: controller.signal, cache: "force-cache" })
      .then(async (response) => response.ok ? await response.json() as CachedLightCurve : null)
      .then(async (curve) => {
        if (controller.signal.aborted || useCurve(curve)) return;
        const response = await fetch(`/api/lightcurve?planetId=${encodeURIComponent(selected.id)}`, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) return;
        const live = await response.json() as LiveLightCurve;
        const points = (live.phaseFolded ?? []).filter((point) => Number.isFinite(point.phase) && Number.isFinite(point.flux));
        if (points.length < 2 || controller.signal.aborted) return;
        useCurve({
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
      .finally(() => { if (!controller.signal.aborted) setCurveLoading(false); });
    return () => controller.abort();
  }, [selected.id, isSolarSystemReference, hasRadialVelocityDetection]);

  const sendQuestion = async (text = question) => {
    const clean = text.trim();
    if (!clean || chatPending) return;
    const history = messages.slice(-8).map((message) => ({ role: message.from === "you" ? "user" as const : "assistant" as const, content: message.text })).filter((message) => message.content);
    setMessages((current) => [...current, { from: "you", text: clean }, { from: "guide", text: "", sources: [] }]);
    setQuestion("");
    setChatPending(true);

    const updateLastMessage = (update: (message: { from: "you" | "guide"; text: string; sources?: KnowledgeSource[] }) => { from: "you" | "guide"; text: string; sources?: KnowledgeSource[] }) => {
      setMessages((current) => current.map((message, index) => index === current.length - 1 ? update(message) : message));
    };

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: clean, planetId: selected.id, history }),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || "The science guide could not answer right now.");
      }
      if (!response.body) throw new Error("The chat response was empty.");

      let sources: KnowledgeSource[] = [];
      let answer = "";
      let buffer = "";
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const frame = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          const event = frame.match(/^event:\s*(.+)$/m)?.[1]?.trim();
          const data = frame.match(/^data:\s*(.+)$/m)?.[1];
          if (data) {
            const payload = JSON.parse(data);
            if (event === "sources") {
              sources = payload as KnowledgeSource[];
              updateLastMessage((message) => ({ ...message, sources }));
            } else if (event === "model") {
              setChatModel(String(payload).replace("openai/", "").toUpperCase());
            } else if (event === "token") {
              answer += payload as string;
              updateLastMessage((message) => ({ ...message, text: answer, sources }));
            } else if (event === "error") {
              throw new Error(payload.error || "The response stream was interrupted.");
            }
          }
          boundary = buffer.indexOf("\n\n");
        }
      }
      if (!answer) updateLastMessage((message) => ({ ...message, text: "I couldn't form an answer from the available NASA sources. Try asking in a different way." }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "The science guide could not answer right now.";
      updateLastMessage((last) => ({ ...last, text: `I couldn't answer that: ${message}` }));
    } finally {
      setChatPending(false);
    }
  };

  return <main className="experience">
    <section className="home-hero" id="home">
      <div className="hero-copy">
        <p className="eyebrow"><span className="live-dot" /> EXOSCOPE Â· FIELD GUIDE 01</p>
        <h1>Worlds beyond<br />our <em>solar system.</em></h1>
        <p className="hero-intro">A field guide to planets orbiting other stars. Compare their scale with Earth and see how astronomers find them in the light of distant suns.</p>
        <div className="hero-actions"><a className="button-primary" href="#explore">Explore the worlds <ArrowRight size={16} /></a><a className="text-link" href="#discover">How discovery works <ArrowDown size={15} /></a></div>
        <div className="hero-caption"><span>01 / 03</span><span>OUR PLACE IN THE COSMOS</span></div>
      </div>
      <div className="hero-art" aria-label="Earth and an artist concept of the exoplanet K2-18 b">
        <div className="hero-starfield" />
        <div className="scale-orbit orbit-one" /><div className="scale-orbit orbit-two" />
        <div className="hero-earth" style={{ background: "radial-gradient(circle at 35% 32%, #74c8d8 0%, #267b9b 38%, #12334d 68%, #030b14 100%)" }}><img src="https://images-assets.nasa.gov/image/PIA18033/PIA18033~medium.jpg" alt="Earth seen from space, NASA Blue Marble" onError={(event) => event.currentTarget.remove()} /></div>
        <div className="hero-exoplanet"><img src={k218Image} alt="Artist concept of K2-18 b" onError={(event) => event.currentTarget.remove()} /></div>
        <div className="scale-label label-earth"><i /> EARTH <small>1 RâŠ•</small></div>
        <div className="scale-label label-world"><i /> K2-18 b <small>2.6 RâŠ•</small></div>
        <div className="art-note">REAL EARTH IMAGE Â· EXOPLANET ARTIST CONCEPT</div>
      </div>
    </section>

    <section className="section-intro" id="explore">
      <div><p className="eyebrow">02 / SIZE EXPLORER</p><h2>Put a new world<br />next to Earth.</h2></div>
      <p>Choose a planet to compare its size and mass with our own. The illustrations are scaled to the same radius ratio; exoplanet appearances are artist concepts, because we cannot resolve their surfaces.</p>
    </section>

    <section className="explorer" id="size-explorer">
      <aside className="world-list">
        <div className="panel-heading"><div><span className="section-number">A</span><div><h3>Choose a world</h3><p>{worlds.length} featured objects</p></div></div></div>
        <label className="search-box"><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search planets" aria-label="Search planets" /></label>
        <div className="world-options">{filteredWorlds.map((planet) => <button className={`world-option ${selected.id === planet.id ? "selected" : ""}`} key={planet.id} onClick={() => setSelected(planet)} aria-pressed={selected.id === planet.id}><Orb planet={planet} className="option-orb" /><span><strong>{planet.name}</strong><small>{planet.planetType}</small></span><ChevronDown size={15} className="option-arrow" /></button>)}</div>
        {!filteredWorlds.length && <p className="empty-search">No worlds match that search.</p>}
        <div className="catalogue-note">TEN EXOPLANETS AVAILABLE FOR SIZE COMPARISON.</div>
      </aside>

      <div className="comparison-panel">
        <div className="panel-heading compare-heading"><div><span className="section-number">B</span><div><h3>World scale</h3><p>Relative to Earth Â· diameter drawn to scale</p></div></div><div className="toggle" aria-label="Comparison measure"><button className={sizeMode === "radius" ? "active" : ""} onClick={() => setSizeMode("radius")}>Radius</button><button className={sizeMode === "mass" ? "active" : ""} onClick={() => setSizeMode("mass")}>Mass</button></div></div>
        <div className="scale-stage">
          <div className="comparison-world earth-world"><div className="globe-wrap" style={{ width: `${earthDiameter}px`, height: `${earthDiameter}px` }}><Orb planet={earthReference} /></div><span>EARTH</span><small>1.0 RâŠ•</small></div>
          <div className="scale-rule"><span /><small>SAME SCALE</small><span /></div>
          <div className="comparison-world selected-world"><div className="globe-wrap" style={{ width: `${selectedDiameter}px`, height: `${selectedDiameter}px` }}><Orb planet={selected} /></div><span>{selected.name.toUpperCase()}</span><small>{selected.radiusEarth.toFixed(2)} RâŠ•</small></div>
        </div>
        <div className="comparison-result"><div><span>{selected.name} has</span><strong>{compareValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}Ã—</strong><span>Earth {sizeMode} <small>({compareUnit})</small></span></div><div className="result-mark">{sizeMode === "radius" ? "RâŠ•" : "MâŠ•"}</div></div>
        <p className="scale-disclaimer">Sphere size uses the catalogued radius ratio. Surface texture is illustrative; relative planet sizes are meaningful, but details are not to scale.</p>
      </div>

      <aside className="planet-facts">
        <div className="panel-heading"><div><span className="section-number">C</span><div><h3>Planet details</h3><p>Selected object Â· {selected.name}</p></div></div></div>
        <>
          <div className="facts-visual"><Orb planet={selected} className="facts-orb" /><div><span>PLANET TYPE</span><strong>{selected.planetType}</strong></div></div>
          <p className="fact-summary">{selected.description}</p>
          <div className="fact-table"><div><span>Radius</span><strong>{selected.radiusEarth} RâŠ•</strong></div><div><span>Mass</span><strong>{selected.massEarth} MâŠ•</strong></div><div><span>Orbital period</span><strong>{selected.orbitalPeriodDays.toLocaleString()} days</strong></div><div><span>Transit duration</span><strong>{selected.transitDurationHours ? `${selected.transitDurationHours.toFixed(2)} hours` : "Not measured"}</strong></div><div><span>Transit depth</span><strong>{selected.transitDepthPpm ? `${selected.transitDepthPpm.toLocaleString()} ppm` : "Not measured"}</strong></div><div><span>Signal</span><strong>{selected.signalClassification ?? selected.discoveryMethod}</strong></div><div><span>Confidence</span><strong>{selected.signalConfidence ? `${(selected.signalConfidence * 100).toFixed(1)}%` : "Not measured"}</strong></div><div><span>Distance</span><strong>{selected.distanceLightYears} light-years</strong></div><div><span>Discovery method</span><strong>{selected.discoveryMethod}</strong></div><div><span>Host star</span><strong>{selected.hostStar}</strong></div></div>
          <div className="habitable-note"><span className={selected.habitableZone ? "zone-dot" : "zone-dot muted"} />{selected.habitableZone ? "In the habitable zone" : "Outside the habitable zone"}<small>This describes starlight received, not evidence of life.</small></div>
        </>
      </aside>
    </section>

    <section className="discover-section" id="discover">
      <div className="discover-copy"><p className="eyebrow">03 / HOW WE DISCOVER</p><h2>Find a planet<br />in a <em>flicker.</em></h2><p>When a planet crosses in front of its star, it blocks a small fraction of the starlight. A telescope records brightness over time; repeated dips can reveal a planetâ€™s size and orbit.</p><div className="step-list"><div><span>01</span><p><strong>Watch the star</strong><small>Measure its brightness repeatedly.</small></p></div><div><span>02</span><p><strong>Spot the dip</strong><small>A planet crossing dims the star.</small></p></div><div><span>03</span><p><strong>Confirm the pattern</strong><small>Repeat dips reveal an orbit.</small></p></div></div></div>
      <CachedLightCurve planetName={selected.name} curve={cachedCurve} loading={curveLoading} solarSystemReference={isSolarSystemReference} radialVelocityDetection={hasRadialVelocityDetection} onAskRadialVelocity={() => { setChatOpen(true); setQuestion("How does radial velocity detect Proxima Centauri b?"); }} />
    </section>

    <LightCurveGallery />

    <footer className="site-footer"><a className="footer-brand" href="#home">EXOSCOPE <span>FIELD GUIDE</span></a><p>Explore carefully. A planetâ€™s size, temperature, or orbit alone cannot tell us whether it hosts life.</p><span className="asset-credits"><a href="https://www.jpl.nasa.gov/images/pia18033-earth/" target="_blank" rel="noreferrer">Earth: NASA/JPL</a><a href="https://science.nasa.gov/photojournal/jupiter-full-disk-with-great-red-spot/" target="_blank" rel="noreferrer">Jupiter: NASA/JPL</a><a href="https://science.nasa.gov/resource/neptune-full-disk-view/" target="_blank" rel="noreferrer">Neptune: NASA/JPL</a><a href="https://science.nasa.gov/asset/webb/exoplanet-k2-18-b-illustration/" target="_blank" rel="noreferrer">K2-18 b: NASA/ESA/CSA/STScI (artist concept)</a></span></footer>

    <button className="chat-launcher" onClick={() => setChatOpen(true)} aria-label="Open ExoScope science guide"><MessageCircle size={19} /><span>Ask ExoScope</span><span className="chat-context">{selected.name}</span></button>
    {chatOpen && <div className="chat-panel" role="dialog" aria-modal="false" aria-label="Ask ExoScope science guide"><div className="chat-header"><div><span className="chat-icon"><MessageCircle size={17} /></span><div><strong>Ask ExoScope</strong><small>GROQ {chatModel} Â· {selected.name}</small></div></div><button onClick={() => setChatOpen(false)} aria-label="Close chat"><X size={18} /></button></div><div className="chat-body"><div className="guide-message">Hi! Ask me about this world or exoplanet science. I fetch relevant NASA references as I answer.</div>{messages.map((msg, i) => <div className={msg.from === "you" ? "user-message" : "guide-message"} key={i}>{msg.text || (chatPending && i === messages.length - 1 ? "Fetching NASA sources and thinkingâ€¦" : "")}{msg.sources?.length ? <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 11px", marginTop: 9, paddingTop: 8, borderTop: "1px solid rgba(180,202,211,.15)" }}><span style={{ flexBasis: "100%", color: "#9badb6", fontSize: 8, letterSpacing: ".08em" }}>NASA SOURCES</span>{msg.sources.map((source, index) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" style={{ color: "#cfed85", fontSize: 9, textDecoration: "underline", textUnderlineOffset: 2 }}>[{index + 1}] {source.title}</a>)}</div> : null}</div>)}{!messages.length && <div className="quick-questions"><button disabled={chatPending} onClick={() => void sendQuestion("How big is it compared to Earth?")}>How big is it?</button><button disabled={chatPending} onClick={() => void sendQuestion("How was it discovered?")}>How was it found?</button><button disabled={chatPending} onClick={() => void sendQuestion("Could it support life?")}>Could it host life?</button><button disabled={chatPending} onClick={() => void sendQuestion("Show your sources")}>Show NASA sources</button></div>}</div><form className="chat-input" onSubmit={(e) => { e.preventDefault(); void sendQuestion(); }}><input value={question} onChange={(e) => setQuestion(e.target.value)} disabled={chatPending} placeholder={chatPending ? "Waiting for Groqâ€¦" : "Ask about this worldâ€¦"} aria-label="Ask a question" /><button disabled={chatPending} aria-label="Send question"><Send size={16} /></button></form><div className="chat-disclaimer">Answers use fetched NASA pages and the selected planetâ€™s app data.</div></div>}
  </main>;
}
