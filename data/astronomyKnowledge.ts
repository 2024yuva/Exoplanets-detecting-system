import type { Exoplanet } from "@/data/exoplanets";

export interface KnowledgeSource {
  title: string;
  url: string;
}

export interface ScienceAnswer {
  answer: string;
  sources: KnowledgeSource[];
}

export const nasaSources = {
  methods: { title: "How We Find and Characterize Exoplanets", url: "https://science.nasa.gov/exoplanets/how-we-find-and-characterize/" },
  transit: { title: "What’s a Transit?", url: "https://science.nasa.gov/exoplanets/whats-a-transit/" },
  transitResource: { title: "Exoplanet Detection: Transit Method", url: "https://science.nasa.gov/resource/exoplanet-detection-transit-method/" },
  planetTypes: { title: "Exoplanet Types", url: "https://science.nasa.gov/exoplanets/planet-types/" },
  habitableZone: { title: "The Habitable Zone", url: "https://science.nasa.gov/exoplanets/habitable-zone/" },
  confirm: { title: "How do you find—and confirm—a planet?", url: "https://science.nasa.gov/universe/exoplanets/how-do-you-find-and-confirm-a-planet-10-things-about-the-search-for-exoplanets/" },
  resourceGuide: { title: "NASA Exoplanet Resource Guide", url: "https://www.nasa.gov/stem-content/exoplanet-resource-guide/" },
  compareEarth: { title: "Comparing Earth to an Exoplanet", url: "https://astrobiology.nasa.gov/classroom-materials/life-out-of-this-world/exoplanets/" },
  detectionFacts: { title: "Exoplanet Detection Facts", url: "https://science.nasa.gov/exoplanets/facts/" },
} satisfies Record<string, KnowledgeSource>;

const containsAny = (text: string, words: string[]) => words.some((word) => text.includes(word));

export function answerScienceQuestion(question: string, planet: Exoplanet): ScienceAnswer {
  const q = question.toLowerCase();

  if (containsAny(q, ["source", "reference", "citation", "dataset", "where did", "link"])) {
    return {
      answer: "I use these NASA learning and science pages as my core references. My replies are short summaries; open a source to read NASA’s full explanation.",
      sources: Object.values(nasaSources),
    };
  }

  if (containsAny(q, ["life", "habitable", "water", "habitation"])) {
    const zone = planet.habitableZone
      ? `${planet.name} is listed in the habitable zone in this guide.`
      : `${planet.name} is listed outside the habitable zone in this guide.`;
    return {
      answer: `${zone} That zone describes distances where a planet might have conditions for liquid water on its surface. It does not mean liquid water—or life—has been found there.`,
      sources: [nasaSources.habitableZone, nasaSources.compareEarth],
    };
  }

  if (containsAny(q, ["false positive", "artifact", "confirm", "confirmation", "prove", "sure", "eclipsing"])) {
    return {
      answer: "A transit-like dip is a clue, not proof by itself. Astronomers check whether the signal repeats and use follow-up observations and other methods to rule out stars, eclipses, or data effects that can imitate a planet.",
      sources: [nasaSources.confirm, nasaSources.methods],
    };
  }

  if (containsAny(q, ["type", "rocky", "terrestrial", "super-earth", "neptunian", "gas giant", "category", "classify"])) {
    return {
      answer: "Planet type names are broad ways to describe worlds. Terrestrial planets are rocky; super-Earths are larger than Earth but smaller than Neptune; Neptunian worlds resemble Neptune in size; gas giants are large and dominated by gas. A category alone does not tell us a planet’s exact surface or atmosphere.",
      sources: [nasaSources.planetTypes, nasaSources.resourceGuide],
    };
  }

  if (containsAny(q, ["radial velocity", "wobble", "microlensing", "direct imag", "methods", "find planets", "find them", "discover", "discovery method"])) {
    return {
      answer: "Astronomers use several methods: transits measure a star’s dimming; radial velocity measures a star’s motion from a planet’s gravitational pull; direct imaging separates a planet’s light from its star; microlensing looks for a brief brightening caused by gravity. No single method works for every system.",
      sources: [nasaSources.methods, nasaSources.detectionFacts],
    };
  }

  if (containsAny(q, ["atmosphere", "spectroscopy", "spectrum", "molecule", "air"])) {
    return {
      answer: "During transit spectroscopy, some starlight passes through a planet’s atmosphere. Instruments split that light into a spectrum; patterns in it can indicate which molecules are present. This characterizes an atmosphere—it is not, on its own, evidence of life.",
      sources: [nasaSources.methods, nasaSources.resourceGuide],
    };
  }

  if (containsAny(q, ["transit", "light curve", "lightcurve", "brightness", "dip", "curve", "signal"])) {
    return {
      answer: "When a planet crosses in front of its star, it blocks a little of the star’s light. Measuring brightness over time makes a light curve; a repeating dip can reveal an orbit, and the dip depth helps estimate the planet’s size relative to its star. One dip alone is not enough to confirm a planet.",
      sources: [nasaSources.transit, nasaSources.confirm, nasaSources.transitResource],
    };
  }

  if (containsAny(q, ["size", "big", "large", "radius", "mass", "earth"])) {
    return {
      answer: `${planet.name} is listed at ${planet.radiusEarth} Earth radii and ${planet.massEarth} Earth masses. Radius describes size; mass describes how much matter the planet contains. These catalog values are approximate and can have different measurement uncertainties.`,
      sources: [nasaSources.compareEarth, nasaSources.planetTypes],
    };
  }

  return {
    answer: `${planet.name} is a ${planet.planetType.toLowerCase()} world in this guide. Its listed radius is ${planet.radiusEarth} Earth radii, orbital period is ${planet.orbitalPeriodDays} days, and discovery method is ${planet.discoveryMethod}. Ask about transits, planet types, atmospheres, or the habitable zone for a NASA-sourced explanation.`,
    sources: [nasaSources.methods, nasaSources.resourceGuide, nasaSources.compareEarth],
  };
}
