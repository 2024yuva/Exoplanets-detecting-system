import { NextRequest } from "next/server";
import { exoplanets } from "@/data/exoplanets";
import { findCatalogPlanets } from "@/data/planetCatalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function numberParameter(url: URL, key: string) {
  const value = Number(url.searchParams.get(key));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

const archiveNames: Record<string, string> = {
  "55-cancri-e": "55 Cnc e",
  "wasp-12b": "WASP-12 b",
  "hd-209458-b": "HD 209458 b",
  "kepler-186f": "Kepler-186 f",
  "lhs-1140b": "LHS 1140 b",
  "toi-700d": "TOI-700 d",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  let ticId = searchParams.get("ticId")?.replace(/\D/g, "") ?? "";
  let periodDays = numberParameter(request.nextUrl, "periodDays");
  let epochBjd = numberParameter(request.nextUrl, "epochBjd");
  let targetName = searchParams.get("targetName")?.slice(0, 120) ?? "TESS target";

  if (!ticId) {
    const planetId = searchParams.get("planetId");
    const selected = exoplanets.find((planet) => planet.id === planetId);
    if (!selected || ["earth", "jupiter", "neptune", "moon"].includes(selected.id)) {
      return Response.json({ error: "Select an exoplanet or search the TESS target catalog." }, { status: 400 });
    }

    const archiveName = archiveNames[selected.id] ?? (selected.id === "proxima-b" ? "Proxima Cen b" : selected.name);
    const record = findCatalogPlanets(archiveName, 1)[0];
    ticId = record?.tic_id?.replace(/\D/g, "") ?? "";
    periodDays ??= Number(record?.pl_orbper) || undefined;
    epochBjd ??= Number(record?.pl_tranmid) || undefined;
    targetName = record?.pl_name ?? selected.name;
  }

  if (!/^\d{5,}$/.test(ticId)) {
    return Response.json({ error: `No valid TIC identifier was found for ${targetName}.` }, { status: 404 });
  }

  const apiBase = (process.env.PYTHON_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
  const backendUrl = new URL(`${apiBase}/api/lightcurve/${ticId}`);
  if (periodDays) backendUrl.searchParams.set("period_days", String(periodDays));
  if (epochBjd) backendUrl.searchParams.set("epoch_bjd", String(epochBjd));
  backendUrl.searchParams.set("target_name", targetName);

  try {
    const response = await fetch(backendUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(150_000),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const detail = typeof data?.detail === "string" ? data.detail : "The TESS light-curve service could not retrieve this target.";
      return Response.json({ error: detail }, { status: response.status });
    }
    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({
      error: "TESS fetching is offline. Start the FastAPI service with `uvicorn main:app --host 127.0.0.1 --port 8000` and try again.",
    }, { status: 503 });
  }
}
