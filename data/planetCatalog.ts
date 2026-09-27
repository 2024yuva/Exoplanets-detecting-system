import catalog from "@/data/planetCatalog.json";

export type CatalogPlanet = {
  pl_name: string;
  tic_id: string | null;
  hostname: string | null;
  discoverymethod: string | null;
  disc_year: string | number | null;
  pl_orbper: string | number | null;
  pl_tranmid: string | number | null;
  pl_rade: string | number | null;
  pl_bmasse: string | number | null;
  pl_eqt: string | number | null;
  sy_dist: string | number | null;
  pl_dens: string | number | null;
  pl_insol: string | number | null;
  st_teff: string | number | null;
  st_rad: string | number | null;
  st_mass: string | number | null;
  pl_orbsmax: string | number | null;
  pl_orbeccen: string | number | null;
  pl_trandep: string | number | null;
  pl_trandur: string | number | null;
};

const planets = catalog as CatalogPlanet[];

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Finds exact planet names mentioned by the user, preferring the Archive's default parameter set. */
export function findCatalogPlanets(text: string, limit = 4): CatalogPlanet[] {
  const normalizedText = normalize(text);
  const found = new Map<string, CatalogPlanet>();

  for (const planet of planets) {
    const name = normalize(planet.pl_name);
    if (name.length < 4 || !normalizedText.includes(name)) continue;
    const current = found.get(name);
    const completeness = Object.values(planet).filter((value) => value !== "" && value !== null && value !== undefined).length;
    const currentCompleteness = current
      ? Object.values(current).filter((value) => value !== "" && value !== null && value !== undefined).length
      : -1;
    if (!current || completeness > currentCompleteness) {
      found.set(name, planet);
    }
  }

  return Array.from(found.values())
    .sort((a, b) => normalize(b.pl_name).length - normalize(a.pl_name).length)
    .slice(0, limit);
}

export function summarizeCatalogPlanet(planet: CatalogPlanet) {
  const properties: [string, string | number | null][] = [
    ["Catalog name", planet.pl_name],
    ["Host star", planet.hostname],
    ["Discovery method", planet.discoverymethod],
    ["Discovery year", planet.disc_year],
    ["Orbital period (days)", planet.pl_orbper],
    ["Radius (Earth radii)", planet.pl_rade],
    ["Mass (Earth masses)", planet.pl_bmasse],
    ["Equilibrium temperature (K)", planet.pl_eqt],
    ["Distance (parsecs)", planet.sy_dist],
    ["Density (g/cm³)", planet.pl_dens],
    ["Insolation (Earth flux)", planet.pl_insol],
    ["Host star effective temperature (K)", planet.st_teff],
    ["Host star radius (Sun radii)", planet.st_rad],
    ["Host star mass (Sun masses)", planet.st_mass],
    ["Semi-major axis (AU)", planet.pl_orbsmax],
    ["Orbital eccentricity", planet.pl_orbeccen],
    ["Transit depth (percent)", planet.pl_trandep],
    ["Transit duration (hours)", planet.pl_trandur],
  ];

  return properties
    .filter(([, value]) => value !== null && value !== undefined && value !== "" && value !== "null" && value !== "undefined")
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
}

export const catalogPlanetCount = planets.length;
