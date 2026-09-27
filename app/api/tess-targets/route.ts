import { NextRequest } from "next/server";
import targets from "@/data/toiCatalog.json";

export const dynamic = "force-dynamic";

type TESSCatalogTarget = {
  ticId: string;
  toi: string;
  name: string;
  disposition: string;
  tfopDisposition: string;
  periodDays: string;
  epochBjd: string;
  durationHours: string;
  depthPpm: string;
  radiusEarth: string;
  equilibriumTempK: string;
  stellarTempK: string;
  stellarDistancePc: string;
  sectors: string;
};

const targetList = targets as TESSCatalogTarget[];
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9.]/g, "");

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return Response.json({ targets: [], totalMatches: 0, totalTargets: targetList.length });

  const search = normalize(query);
  const matches = targetList
    .filter((target) => normalize(`${target.toi} ${target.name} ${target.ticId}`).includes(search))
    .sort((a, b) => {
      const aName = normalize(`${a.name} ${a.toi} ${a.ticId}`);
      const bName = normalize(`${b.name} ${b.toi} ${b.ticId}`);
      return Number(!aName.startsWith(search)) - Number(!bName.startsWith(search)) || a.toi.localeCompare(b.toi, undefined, { numeric: true });
    });

  return Response.json({ targets: matches.slice(0, 30), totalMatches: matches.length, totalTargets: targetList.length });
}
