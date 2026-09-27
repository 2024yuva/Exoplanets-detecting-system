export interface Exoplanet {
  id: string;
  name: string;
  radiusEarth: number;
  radiusKm: number;
  diameterKm: number;
  massEarth: number;
  massKg: string;
  planetType: string;
  orbitalPeriodDays: number;
  distanceLightYears: number;
  discoveryMethod: string;
  hostStar: string;
  temperature: string;
  habitableZone: boolean;
  description: string;
  simpleExplanation: string;
}

export const exoplanets: Exoplanet[] = [
  {
    id: "earth",
    name: "Earth",
    radiusEarth: 1.0,
    radiusKm: 6371,
    diameterKm: 12742,
    massEarth: 1.0,
    massKg: "~5.97 × 10²⁴ kg",
    planetType: "Rocky",
    orbitalPeriodDays: 365.25,
    distanceLightYears: 0,
    discoveryMethod: "N/A",
    hostStar: "Sun (G-type main-sequence)",
    temperature: "~15 °C",
    habitableZone: true,
    description: "Our home planet. The only world known to harbor life, with liquid water oceans and a protective atmosphere.",
    simpleExplanation: "Earth is our home! We use Earth as the baseline to compare all other planets. When we say a planet is '2× Earth', we mean it is twice as wide as Earth."
  },
  {
    id: "trappist-1e",
    name: "TRAPPIST-1e",
    radiusEarth: 0.92,
    radiusKm: 5850,
    diameterKm: 11700,
    massEarth: 0.69,
    massKg: "~4.12 × 10²⁴ kg",
    planetType: "Rocky",
    orbitalPeriodDays: 6.1,
    distanceLightYears: 39.5,
    discoveryMethod: "Transit method",
    hostStar: "Red dwarf (TRAPPIST-1)",
    temperature: "~ -48 °C (estimated without atmosphere)",
    habitableZone: true,
    description: "One of seven Earth-sized planets orbiting a small, cool red dwarf star. It sits right in the habitable zone.",
    simpleExplanation: "TRAPPIST-1e is slightly smaller and lighter than Earth. It orbits very close to a small red star, but because the star is cool, the planet might still have liquid water."
  },
  {
    id: "k2-18b",
    name: "K2-18 b",
    radiusEarth: 2.6,
    radiusKm: 16600,
    diameterKm: 33200,
    massEarth: 8.6,
    massKg: "~5.14 × 10²⁵ kg",
    planetType: "Sub-Neptune",
    orbitalPeriodDays: 32.9,
    distanceLightYears: 124,
    discoveryMethod: "Transit method",
    hostStar: "Red dwarf (K2-18)",
    temperature: "~ -8 to 5 °C (estimated)",
    habitableZone: true,
    description: "A sub-Neptune exoplanet in its star's habitable zone. Astronomers have detected water vapor in its atmosphere.",
    simpleExplanation: "K2-18 b is much larger than Earth and orbits a cool red star. It is classified as a sub-Neptune, meaning it likely has a thick atmosphere and no solid surface like Earth's."
  },
  {
    id: "kepler-22b",
    name: "Kepler-22b",
    radiusEarth: 2.4,
    radiusKm: 15300,
    diameterKm: 30600,
    massEarth: 36, // rough upper limit often cited for density comparisons
    massKg: "Unknown (likely large)",
    planetType: "Super-Earth / Sub-Neptune",
    orbitalPeriodDays: 289.9,
    distanceLightYears: 620,
    discoveryMethod: "Transit method",
    hostStar: "G-type main-sequence (Kepler-22)",
    temperature: "~ 22 °C (estimated with Earth-like atmosphere)",
    habitableZone: true,
    description: "The first confirmed exoplanet found in the habitable zone of a Sun-like star. It could be a 'water world'.",
    simpleExplanation: "Kepler-22b is more than twice as wide as Earth and orbits a star very similar to our Sun. Its exact surface is a mystery, but it could be completely covered by a deep global ocean."
  },
  {
    id: "proxima-b",
    name: "Proxima Centauri b",
    radiusEarth: 1.1,
    radiusKm: 7000,
    diameterKm: 14000,
    massEarth: 1.27,
    massKg: "~7.58 × 10²⁴ kg",
    planetType: "Rocky",
    orbitalPeriodDays: 11.2,
    distanceLightYears: 4.24,
    discoveryMethod: "Radial velocity",
    hostStar: "Red dwarf (Proxima Centauri)",
    temperature: "~ -39 °C (estimated without atmosphere)",
    habitableZone: true,
    description: "The closest known exoplanet to our solar system. It orbits in the habitable zone of our nearest stellar neighbor.",
    simpleExplanation: "Proxima b is our closest exoplanet neighbor, but it would still take thousands of years to reach it. It is just a bit larger than Earth and orbits a tiny red star."
  },
  {
    id: "neptune",
    name: "Neptune",
    radiusEarth: 3.9,
    radiusKm: 24622,
    diameterKm: 49244,
    massEarth: 17.1,
    massKg: "~1.02 × 10²⁶ kg",
    planetType: "Ice Giant",
    orbitalPeriodDays: 60190,
    distanceLightYears: 0.00047, // inside solar system
    discoveryMethod: "Direct observation / Math",
    hostStar: "Sun",
    temperature: "~ -201 °C",
    habitableZone: false,
    description: "The eighth planet from the Sun in our solar system. Used as a reference for 'Neptune-like' exoplanets.",
    simpleExplanation: "We use Neptune to understand 'Ice Giant' and 'Sub-Neptune' planets. It's almost four times as wide as Earth and made mostly of thick gases and ice, not solid rock."
  },
  {
    id: "jupiter",
    name: "Jupiter",
    radiusEarth: 11.2,
    radiusKm: 71492,
    diameterKm: 142984,
    massEarth: 318,
    massKg: "~1.90 × 10²⁷ kg",
    planetType: "Gas Giant",
    orbitalPeriodDays: 4333,
    distanceLightYears: 0.00008,
    discoveryMethod: "Direct observation",
    hostStar: "Sun",
    temperature: "~ -145 °C",
    habitableZone: false,
    description: "The largest planet in our solar system. Used as a reference for 'Gas Giant' exoplanets.",
    simpleExplanation: "Jupiter is enormous! It is 11 times wider than Earth. When astronomers find 'Gas Giants' around other stars, they are finding planets similar in size to Jupiter."
  }
];
