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
  transitDurationHours?: number;
  transitDepthPpm?: number;
  signalClassification?: string;
  signalConfidence?: number;
  description: string;
  simpleExplanation: string;
  funFacts: string[];
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
    simpleExplanation: "Earth is our home! We use Earth as the baseline to compare all other planets. When we say a planet is '2× Earth', we mean it is twice as wide as Earth.",
    funFacts: [
      "Earth is currently the only world known to support life.",
      "About 71% of Earth's surface is covered by liquid water.",
      "Earth takes about 365.25 days to complete one orbit around the Sun."
    ]
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
    transitDurationHours: 1.1,
    transitDepthPpm: 4500,
    signalClassification: "Confirmed planet transit",
    signalConfidence: 0.99,
    description: "One of seven Earth-sized planets orbiting a small, cool red dwarf star. It sits right in the habitable zone.",
    simpleExplanation: "TRAPPIST-1e is slightly smaller and lighter than Earth. It orbits very close to a small red star, but because the star is cool, the planet might still have liquid water.",
    funFacts: [
      "TRAPPIST-1e is one of seven known planets orbiting the same red dwarf star.",
      "It is remarkably close to Earth's size, with about 92% of Earth's radius.",
      "TRAPPIST-1e receives an amount of starlight that makes it one of the system's most interesting worlds for habitability studies.",
      "Its entire orbit around TRAPPIST-1 takes only about 6.1 Earth days."
    ]
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
    transitDurationHours: 2.8,
    transitDepthPpm: 2700,
    signalClassification: "Confirmed planet transit",
    signalConfidence: 0.99,
    description: "A sub-Neptune exoplanet in its star's habitable zone. Astronomers have detected water vapor in its atmosphere.",
    simpleExplanation: "K2-18 b is much larger than Earth and orbits a cool red star. It is classified as a sub-Neptune, meaning it likely has a thick atmosphere and no solid surface like Earth's.",
    funFacts: [
      "K2-18 b is more than twice Earth's radius but much smaller than Neptune.",
      "It orbits within the habitable zone of its red dwarf host star.",
      "The planet's atmosphere has been studied extensively with the James Webb Space Telescope.",
      "K2-18 b is a sub-Neptune, a type of planet that has no direct equivalent in our Solar System."
    ]
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
    transitDurationHours: 11.5,
    transitDepthPpm: 500,
    signalClassification: "Confirmed planet transit",
    signalConfidence: 0.98,
    description: "The first confirmed exoplanet found in the habitable zone of a Sun-like star. It could be a 'water world'.",
    simpleExplanation: "Kepler-22b is more than twice as wide as Earth and orbits a star very similar to our Sun. Its exact surface is a mystery, but it could be completely covered by a deep global ocean.",
    funFacts: [
      "Kepler-22b was the first confirmed planet discovered by Kepler in the habitable zone of a Sun-like star.",
      "It is more than twice Earth's radius.",
      "One year on Kepler-22b lasts about 290 Earth days.",
      "Scientists do not yet know whether it has a rocky surface, a deep ocean, or a thick atmosphere."
    ]
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
    transitDurationHours: 1.7,
    transitDepthPpm: 0,
    signalClassification: "Radial-velocity signal",
    signalConfidence: 0.95,
    description: "The closest known exoplanet to our solar system. It orbits in the habitable zone of our nearest stellar neighbor.",
    simpleExplanation: "Proxima b is our closest exoplanet neighbor, but it would still take thousands of years to reach it. It is just a bit larger than Earth and orbits a tiny red star.",
    funFacts: [
      "Proxima Centauri b is one of the closest known exoplanets to our Solar System.",
      "It orbits Proxima Centauri, the closest star to the Sun.",
      "Its orbital period is only about 11.2 Earth days.",
      "Unlike many transiting exoplanets, Proxima b was discovered using the radial-velocity method."
    ]
  },
  {
    id: "55-cancri-e",
    name: "55 Cancri e",
    radiusEarth: 1.88,
    radiusKm: 11980,
    diameterKm: 23960,
    massEarth: 8.0,
    massKg: "~4.78 × 10²⁵ kg",
    planetType: "Super-Earth",
    orbitalPeriodDays: 0.7365,
    distanceLightYears: 41.0,
    discoveryMethod: "Transit method",
    hostStar: "55 Cancri (G-type main-sequence)",
    temperature: "~ 2400 °C",
    habitableZone: false,
    transitDurationHours: 1.6,
    transitDepthPpm: 390,
    signalClassification: "Confirmed planet transit",
    signalConfidence: 0.99,
    description: "A hot super-Earth orbiting so close to its star that one year lasts less than 18 hours.",
    simpleExplanation: "55 Cancri e is almost twice Earth's width, but its close orbit makes it an extremely hot world.",
    funFacts: [
      "A year on 55 Cancri e lasts less than 18 Earth hours.",
      "It is nearly twice Earth's radius.",
      "The planet is extremely close to its host star, making it intensely hot.",
      "It belongs to the super-Earth category despite being very different from Earth."
    ]
  },
  {
    id: "wasp-12b",
    name: "WASP-12b",
    radiusEarth: 1.90,
    radiusKm: 12100,
    diameterKm: 24200,
    massEarth: 446.0,
    massKg: "~2.67 × 10²⁷ kg",
    planetType: "Hot Jupiter",
    orbitalPeriodDays: 1.0914,
    distanceLightYears: 1410,
    discoveryMethod: "Transit method",
    hostStar: "WASP-12 (F-type main-sequence)",
    temperature: "~ 2500 °C",
    habitableZone: false,
    transitDurationHours: 3.0,
    transitDepthPpm: 13900,
    signalClassification: "Confirmed planet transit",
    signalConfidence: 0.99,
    description: "An inflated gas giant so close to its star that tidal forces are drawing material away from the planet.",
    simpleExplanation: "WASP-12b is nearly twice Earth's width and completes an orbit in about a day.",
    funFacts: [
      "WASP-12b completes an orbit around its star in only about 1.1 days.",
      "Its extreme proximity to its star causes enormous tidal forces.",
      "The planet is so strongly heated that its atmosphere is being lost to space.",
      "WASP-12b is an example of an inflated hot Jupiter."
    ]
  },
  {
    id: "hd-209458-b",
    name: "HD 209458 b",
    radiusEarth: 1.38,
    radiusKm: 8792,
    diameterKm: 17584,
    massEarth: 220.0,
    massKg: "~1.31 × 10²⁷ kg",
    planetType: "Hot Jupiter",
    orbitalPeriodDays: 3.5247,
    distanceLightYears: 159,
    discoveryMethod: "Transit method",
    hostStar: "HD 209458 (G-type main-sequence)",
    temperature: "~ 1000 °C",
    habitableZone: false,
    transitDurationHours: 2.9,
    transitDepthPpm: 15000,
    signalClassification: "Confirmed planet transit",
    signalConfidence: 0.99,
    description: "The first exoplanet observed transiting its star and the first known to have an atmosphere detected.",
    simpleExplanation: "HD 209458 b is a large gas giant whose passage blocks about 1.5 percent of its star's light.",
    funFacts: [
      "HD 209458 b is one of the best-studied hot Jupiters.",
      "It was the first exoplanet observed transiting its host star.",
      "Its atmosphere has been detected through observations made during transit.",
      "Its transit blocks roughly 1.5% of the light from its host star."
    ]
  },
  {
    id: "kepler-186f",
    name: "Kepler-186f",
    radiusEarth: 1.11,
    radiusKm: 7070,
    diameterKm: 14140,
    massEarth: 1.4,
    massKg: "~8.36 × 10²⁴ kg (estimated)",
    planetType: "Rocky",
    orbitalPeriodDays: 129.9,
    distanceLightYears: 500,
    discoveryMethod: "Transit method",
    hostStar: "Kepler-186 (M-type red dwarf)",
    temperature: "~ -85 °C (estimated)",
    habitableZone: true,
    transitDurationHours: 3.2,
    transitDepthPpm: 520,
    signalClassification: "Confirmed planet transit",
    signalConfidence: 0.97,
    description: "An Earth-sized planet orbiting in the temperate zone of a cool red dwarf star.",
    simpleExplanation: "Kepler-186f is only slightly larger than Earth and receives moderate starlight from its red dwarf host.",
    funFacts: [
      "Kepler-186f was the first Earth-sized planet discovered in the habitable zone of another star.",
      "It orbits a cool red dwarf rather than a Sun-like star.",
      "One year on Kepler-186f lasts about 130 Earth days.",
      "The planet is only about 11% wider than Earth."
    ]
  },
  {
    id: "lhs-1140b",
    name: "LHS 1140 b",
    radiusEarth: 1.73,
    radiusKm: 11020,
    diameterKm: 22040,
    massEarth: 6.98,
    massKg: "~4.17 × 10²⁵ kg",
    planetType: "Super-Earth",
    orbitalPeriodDays: 24.7,
    distanceLightYears: 49,
    discoveryMethod: "Transit method",
    hostStar: "LHS 1140 (M-type red dwarf)",
    temperature: "~ -49 °C (estimated)",
    habitableZone: true,
    transitDurationHours: 2.1,
    transitDepthPpm: 5200,
    signalClassification: "Confirmed planet transit",
    signalConfidence: 0.98,
    description: "A dense super-Earth in the habitable zone of a nearby red dwarf, well suited to atmospheric follow-up.",
    simpleExplanation: "LHS 1140 b is larger and heavier than Earth and crosses its star every 24.7 days.",
    funFacts: [
      "LHS 1140 b is a dense super-Earth orbiting a nearby red dwarf.",
      "It completes an orbit around its star in about 24.7 days.",
      "Its relatively large transit makes it an interesting target for atmospheric studies.",
      "The planet lies within the potentially habitable region of its star."
    ]
  },
  {
    id: "toi-700d",
    name: "TOI-700 d",
    radiusEarth: 1.14,
    radiusKm: 7260,
    diameterKm: 14520,
    massEarth: 1.72,
    massKg: "~1.03 × 10²⁵ kg (estimated)",
    planetType: "Rocky",
    orbitalPeriodDays: 37.4,
    distanceLightYears: 101.4,
    discoveryMethod: "Transit method",
    hostStar: "TOI-700 (M-type red dwarf)",
    temperature: "~ -4 °C (estimated)",
    habitableZone: true,
    transitDurationHours: 2.4,
    transitDepthPpm: 800,
    signalClassification: "Confirmed planet transit",
    signalConfidence: 0.98,
    description: "An Earth-sized planet in the habitable zone of a quiet, nearby red dwarf star.",
    simpleExplanation: "TOI-700 d is about 14 percent wider than Earth and receives a potentially temperate amount of starlight.",
    funFacts: [
      "TOI-700 d is an Earth-sized planet located in its star's habitable zone.",
      "It was discovered using NASA's TESS mission.",
      "Its host star is a relatively small and cool red dwarf.",
      "TOI-700 d takes about 37.4 Earth days to orbit its star."
    ]
  }
];
