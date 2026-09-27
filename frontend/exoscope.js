/* ============================================================
   ExoScope — Interactive Exoplanet Explorer
   Complete JavaScript Application
   ============================================================ */

// ============================================================
// DATA: Static exoplanet dataset
// ============================================================
const EXOPLANETS = [
  {
    id: "earth",
    name: "Earth",
    type: "Rocky / Terrestrial",
    radiusEarth: 1.0,
    massEarth: 1.0,
    orbitalPeriodDays: 365.25,
    distanceLy: 0,
    discoveryMethod: "—",
    description: "Our home planet — the only world known to harbor life. Earth is a rocky planet with liquid water oceans, a breathable atmosphere, and a magnetic field that shields it from solar radiation.",
    explain: "Earth is the baseline we use to compare all other planets. When we say a planet is '2× Earth's radius,' we mean it's twice as wide as Earth.",
    color: "planet-earth"
  },
  {
    id: "trappist-1e",
    name: "TRAPPIST-1e",
    type: "Rocky / Terrestrial",
    radiusEarth: 0.92,
    massEarth: 0.69,
    orbitalPeriodDays: 6.1,
    distanceLy: 39,
    discoveryMethod: "Transit",
    description: "One of seven Earth-sized planets orbiting a small, cool red dwarf star. TRAPPIST-1e sits in the habitable zone — the region where liquid water could exist on its surface.",
    explain: "This planet is slightly smaller and lighter than Earth. It orbits much closer to its star, completing a 'year' in just 6 days — but its star is much dimmer, so the temperature could still allow liquid water.",
    color: "planet-rocky"
  },
  {
    id: "k2-18b",
    name: "K2-18 b",
    type: "Mini-Neptune",
    radiusEarth: 2.61,
    massEarth: 8.63,
    orbitalPeriodDays: 33,
    distanceLy: 124,
    discoveryMethod: "Transit",
    description: "A sub-Neptune exoplanet in its star's habitable zone. The James Webb Space Telescope detected hints of carbon dioxide and possibly dimethyl sulfide in its atmosphere — a molecule associated with life on Earth.",
    explain: "At 2.6× Earth's width and nearly 9× its mass, K2-18 b is much larger than Earth. It likely has a thick hydrogen-rich atmosphere over a water or ice layer — not a solid surface like Earth.",
    color: "planet-mini-neptune"
  },
  {
    id: "proxima-b",
    name: "Proxima Centauri b",
    type: "Rocky / Terrestrial",
    radiusEarth: 1.08,
    massEarth: 1.27,
    orbitalPeriodDays: 11.2,
    distanceLy: 4.24,
    discoveryMethod: "Radial Velocity",
    description: "The closest known exoplanet to Earth, orbiting the nearest star to our Sun. It sits in the habitable zone of Proxima Centauri — a small red dwarf star just 4.24 light-years away.",
    explain: "Despite being close in cosmic terms, reaching Proxima b with current technology would take over 70,000 years. Its size is similar to Earth, but intense stellar flares from its star may strip away any atmosphere.",
    color: "planet-rocky"
  },
  {
    id: "kepler-442b",
    name: "Kepler-442b",
    type: "Super-Earth",
    radiusEarth: 1.34,
    massEarth: 2.34,
    orbitalPeriodDays: 112.3,
    distanceLy: 1206,
    discoveryMethod: "Transit",
    description: "A super-Earth orbiting within the habitable zone of a K-type star. Kepler-442b has one of the highest Earth Similarity Indices among known exoplanets.",
    explain: "This planet is about a third wider than Earth and twice as heavy. With a 112-day year, it orbits at a comfortable distance from its star — making it one of the most potentially habitable worlds we've found.",
    color: "planet-super-earth"
  },
  {
    id: "55-cancri-e",
    name: "55 Cancri e",
    type: "Super-Earth",
    radiusEarth: 1.88,
    massEarth: 7.99,
    orbitalPeriodDays: 0.74,
    distanceLy: 41,
    discoveryMethod: "Transit",
    description: "An ultra-hot super-Earth that orbits so close to its star it completes a year in just 18 hours. Surface temperatures likely exceed 2,000°C — hot enough to melt rock.",
    explain: "This planet is nearly 2× Earth's width but 8× its mass — meaning it's incredibly dense. Its 'year' is under a day, and its surface may be covered in flowing lava oceans.",
    color: "planet-hot-jupiter"
  },
  {
    id: "neptune",
    name: "Neptune",
    type: "Ice Giant",
    radiusEarth: 3.88,
    massEarth: 17.15,
    orbitalPeriodDays: 60190,
    distanceLy: 0.00047,
    discoveryMethod: "Direct Observation",
    description: "The eighth planet in our solar system — a frigid ice giant with supersonic winds and a deep blue atmosphere of hydrogen, helium, and methane.",
    explain: "Neptune is nearly 4× wider than Earth and 17× heavier. It takes 165 Earth years to orbit the Sun. We include it here as a familiar reference point for understanding ice-giant-sized exoplanets.",
    color: "planet-ice-giant"
  },
  {
    id: "jupiter",
    name: "Jupiter",
    type: "Gas Giant",
    radiusEarth: 11.21,
    massEarth: 317.8,
    orbitalPeriodDays: 4333,
    distanceLy: 0.00008,
    discoveryMethod: "Direct Observation",
    description: "The largest planet in our solar system — a colossal gas giant with a mass greater than all other planets combined. Its Great Red Spot is a storm larger than Earth.",
    explain: "Jupiter is 11× wider than Earth and over 300× heavier. Many exoplanets found are 'hot Jupiters' — gas giants that orbit extremely close to their stars, unlike our Jupiter which orbits far from the Sun.",
    color: "planet-gas-giant"
  },
  {
    id: "kepler-16b",
    name: "Kepler-16b",
    type: "Gas Giant",
    radiusEarth: 8.45,
    massEarth: 105,
    orbitalPeriodDays: 228.8,
    distanceLy: 245,
    discoveryMethod: "Transit",
    description: "A Saturn-sized planet that orbits two stars — a real-life 'Tatooine.' If you stood on this world (if it had a surface), you'd see two sunsets.",
    explain: "This is a circumbinary planet — orbiting a pair of stars locked in their own orbit. At 8.4× Earth's width, it's a gas giant similar in size to Saturn, too large for a solid surface.",
    color: "planet-gas-giant"
  },
  {
    id: "gj-1214b",
    name: "GJ 1214 b",
    type: "Mini-Neptune",
    radiusEarth: 2.68,
    massEarth: 6.55,
    orbitalPeriodDays: 1.58,
    distanceLy: 48,
    discoveryMethod: "Transit",
    description: "A 'water world' candidate — a warm mini-Neptune that may have a steamy, water-vapor-rich atmosphere or even a global ocean beneath thick clouds.",
    explain: "At 2.7× Earth's width, GJ 1214 b is too large to be rocky like Earth but too small to be a gas giant. It likely has a thick atmosphere over a water-ice interior — a type of planet with no equivalent in our solar system.",
    color: "planet-mini-neptune"
  },
  {
    id: "wasp-121b",
    name: "WASP-121 b",
    type: "Hot Jupiter",
    radiusEarth: 19.2,
    massEarth: 382,
    orbitalPeriodDays: 1.27,
    distanceLy: 881,
    discoveryMethod: "Transit",
    description: "An extreme hot Jupiter so close to its star it's being stretched into an egg shape. Its upper atmosphere rains liquid iron and corundum (the mineral in rubies and sapphires).",
    explain: "This planet is nearly 20× wider than Earth and orbits in just 30 hours. Dayside temperatures exceed 2,500°C. It's one of the most extreme worlds ever found — a place where metals become weather.",
    color: "planet-hot-jupiter"
  },
  {
    id: "toi-700d",
    name: "TOI-700 d",
    type: "Rocky / Terrestrial",
    radiusEarth: 1.07,
    massEarth: 1.72,
    orbitalPeriodDays: 37.4,
    distanceLy: 101.4,
    discoveryMethod: "Transit",
    description: "An Earth-sized world discovered by NASA's TESS mission, orbiting within the habitable zone of a cool red dwarf star. One of the most promising Earth analogs found to date.",
    explain: "TOI-700 d is almost exactly Earth's size and sits at the right distance from its star for liquid water. It was discovered by the same TESS mission that our AI pipeline analyzes — making it directly connected to this project.",
    color: "planet-rocky"
  },
  {
    id: "kepler-452b",
    name: "Kepler-452b",
    type: "Super-Earth",
    radiusEarth: 1.63,
    massEarth: 3.29,
    orbitalPeriodDays: 384.8,
    distanceLy: 1402,
    discoveryMethod: "Transit",
    description: "Often called 'Earth's bigger, older cousin.' It orbits a Sun-like star at nearly the same distance Earth orbits the Sun, with a 385-day year.",
    explain: "This is one of the most Earth-like exoplanets by context — similar star, similar orbit. But at 1.6× Earth's width, it's a super-Earth and may have a thicker atmosphere and stronger gravity.",
    color: "planet-super-earth"
  },
  {
    id: "hr-8799e",
    name: "HR 8799 e",
    type: "Gas Giant",
    radiusEarth: 13.4,
    massEarth: 2860,
    orbitalPeriodDays: 18000,
    distanceLy: 129,
    discoveryMethod: "Direct Imaging",
    description: "One of four massive planets directly photographed orbiting the young star HR 8799. It was one of the first exoplanets ever seen in a telescope image.",
    explain: "Unlike most exoplanets found by indirect methods, HR 8799 e was directly imaged — we've actually seen it as a dot of light. At ~9× Jupiter's mass, it's a young, glowing gas giant still cooling from formation.",
    color: "planet-gas-giant"
  },
  {
    id: "lhs-1140b",
    name: "LHS 1140 b",
    type: "Super-Earth",
    radiusEarth: 1.73,
    massEarth: 5.6,
    orbitalPeriodDays: 24.7,
    distanceLy: 49,
    discoveryMethod: "Transit",
    description: "A dense, rocky super-Earth in the habitable zone of a quiet red dwarf. Its high density suggests an iron-rich core — and the star's low activity makes it an excellent target for atmospheric study.",
    explain: "LHS 1140 b is nearly twice Earth's width but 5.6× heavier — very dense, likely rocky with a substantial iron core. JWST has begun studying its atmosphere for signs of water vapor.",
    color: "planet-super-earth"
  }
];

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function getPlanetColorClass(type) {
  const map = {
    "Rocky / Terrestrial": "planet-rocky",
    "Super-Earth": "planet-super-earth",
    "Mini-Neptune": "planet-mini-neptune",
    "Ice Giant": "planet-ice-giant",
    "Gas Giant": "planet-gas-giant",
    "Hot Jupiter": "planet-hot-jupiter"
  };
  return map[type] || "planet-rocky";
}

function getPlanetGradient(type) {
  const map = {
    "Rocky / Terrestrial": "radial-gradient(circle at 35% 35%, #d4a574, #a0522d 50%, #654321 85%, #3a2512)",
    "Super-Earth": "radial-gradient(circle at 35% 35%, #8fc7a6, #3a9b6a 45%, #1a6b45 75%, #0d3d28)",
    "Mini-Neptune": "radial-gradient(circle at 35% 35%, #87ceeb, #4a90d9 45%, #2456a0 75%, #142f60)",
    "Ice Giant": "radial-gradient(circle at 35% 35%, #7dd3fc, #38bdf8 40%, #0284c7 70%, #0c4a6e)",
    "Gas Giant": "radial-gradient(circle at 35% 35%, #fbbf24, #f59e0b 35%, #d97706 55%, #92400e 80%, #451a03)",
    "Hot Jupiter": "radial-gradient(circle at 35% 35%, #fca5a5, #ef4444 40%, #b91c1c 65%, #7f1d1d 85%, #450a0a)"
  };
  return map[type] || map["Rocky / Terrestrial"];
}

function getGlowColor(type) {
  const map = {
    "Rocky / Terrestrial": "rgba(160, 82, 45, 0.3)",
    "Super-Earth": "rgba(58, 155, 106, 0.3)",
    "Mini-Neptune": "rgba(74, 144, 217, 0.3)",
    "Ice Giant": "rgba(56, 189, 248, 0.3)",
    "Gas Giant": "rgba(245, 158, 11, 0.3)",
    "Hot Jupiter": "rgba(239, 68, 68, 0.3)"
  };
  return map[type] || map["Rocky / Terrestrial"];
}

function formatDistance(ly) {
  if (ly === 0) return "Home";
  if (ly < 0.01) return `${(ly * 63241.1).toFixed(0)} AU`;
  return `${ly.toLocaleString()} light-years`;
}

function formatPeriod(days) {
  if (days < 1) return `${(days * 24).toFixed(1)} hours`;
  if (days < 365) return `${days.toFixed(1)} days`;
  return `${(days / 365.25).toFixed(1)} years`;
}

function formatMass(m) {
  if (m === 1) return "1× Earth";
  if (m < 10) return `${m.toFixed(2)}× Earth`;
  if (m < 100) return `${m.toFixed(1)}× Earth`;
  return `${Math.round(m).toLocaleString()}× Earth`;
}

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

// ============================================================
// STARFIELD BACKGROUND
// ============================================================
(function initStarfield() {
  const canvas = document.getElementById("starfield");
  const ctx = canvas.getContext("2d");
  let stars = [];
  const STAR_COUNT = 300;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createStars();
  }

  function createStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.6 + 0.2,
        speed: Math.random() * 0.0008 + 0.0003,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function draw(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      const a = s.alpha * (0.6 + 0.4 * Math.sin(time * s.speed + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 210, 255, ${a})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(draw);
})();

// ============================================================
// HERO PLANET CANVAS
// ============================================================
(function initHeroPlanet() {
  const canvas = document.getElementById("hero-planet-canvas");
  const ctx = canvas.getContext("2d");
  const W = 600, H = 600;

  function draw(time) {
    ctx.clearRect(0, 0, W, H);
    const t = time * 0.001;

    // Ambient glow
    const glow = ctx.createRadialGradient(300, 300, 60, 300, 300, 280);
    glow.addColorStop(0, "rgba(96, 165, 250, 0.08)");
    glow.addColorStop(0.5, "rgba(96, 165, 250, 0.03)");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Orbiting ring
    ctx.save();
    ctx.translate(300, 300);
    ctx.rotate(-0.35);
    ctx.scale(1, 0.35);
    ctx.beginPath();
    ctx.arc(0, 0, 200, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(96, 165, 250, 0.15)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Small orbiting dot
    const angle = t * 0.4;
    const ox = 300 + Math.cos(angle) * 200;
    const oy = 300 + Math.sin(angle) * 200 * 0.35;
    if (Math.sin(angle) < 0) {
      drawSmallPlanet(ctx, ox, oy - 10);
    }

    // Main planet
    drawMainPlanet(ctx, 300, 290, 110, t);

    // Draw small planet on top if in front
    if (Math.sin(angle) >= 0) {
      drawSmallPlanet(ctx, ox, oy - 10);
    }

    requestAnimationFrame(draw);
  }

  function drawMainPlanet(ctx, cx, cy, r, t) {
    // Planet body
    const grad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.3, r * 0.1, cx, cy, r);
    grad.addColorStop(0, "#5b9bd5");
    grad.addColorStop(0.4, "#2563eb");
    grad.addColorStop(0.75, "#1e40af");
    grad.addColorStop(1, "#1a1a4e");
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Landmass hints
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    const landOffset = t * 8;
    ctx.fillStyle = "rgba(34, 197, 94, 0.2)";
    ctx.beginPath();
    ctx.ellipse(cx - 20 + Math.sin(landOffset * 0.01) * 5, cy - 25, 40, 22, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 25, cy + 30, 30, 18, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Cloud wisps
    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    ctx.beginPath();
    ctx.ellipse(cx - 30, cy - 15, 50, 8, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 20, cy + 20, 40, 6, -0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Atmosphere glow
    const atm = ctx.createRadialGradient(cx, cy, r - 4, cx, cy, r + 20);
    atm.addColorStop(0, "transparent");
    atm.addColorStop(0.7, "rgba(96, 165, 250, 0.06)");
    atm.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(cx, cy, r + 20, 0, Math.PI * 2);
    ctx.fillStyle = atm;
    ctx.fill();

    // Specular highlight
    const spec = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 0, cx - r * 0.35, cy - r * 0.35, r * 0.7);
    spec.addColorStop(0, "rgba(147, 197, 253, 0.2)");
    spec.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = spec;
    ctx.fill();
  }

  function drawSmallPlanet(ctx, x, y) {
    const r = 14;
    const grad = ctx.createRadialGradient(x - 4, y - 3, 1, x, y, r);
    grad.addColorStop(0, "#d4a574");
    grad.addColorStop(0.6, "#a0522d");
    grad.addColorStop(1, "#654321");
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    // Glow
    ctx.beginPath();
    ctx.arc(x, y, r + 6, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(x, y, r, x, y, r + 6);
    g.addColorStop(0, "rgba(160, 82, 45, 0.15)");
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fill();
  }

  requestAnimationFrame(draw);
})();

// ============================================================
// WHAT IS AN EXOPLANET - Solar System Canvas
// ============================================================
(function initSolarSystem() {
  const canvas = document.getElementById("solar-system-canvas");
  const ctx = canvas.getContext("2d");
  const W = 500, H = 500;
  const cx = W / 2, cy = H / 2;

  const orbits = [
    { r: 60, speed: 0.02, size: 6, color: "#a0a0a0" },       // Mercury-like
    { r: 90, speed: 0.015, color: "#e8c97a", size: 8 },      // Venus-like
    { r: 125, speed: 0.01, color: "#2563eb", size: 9, isEarth: true },  // Earth
    { r: 160, speed: 0.008, color: "#c45a3a", size: 7 },     // Mars-like
    { r: 210, speed: 0.004, color: "#d97706", size: 16 },    // Jupiter-like
  ];

  function draw(time) {
    ctx.clearRect(0, 0, W, H);
    const t = time * 0.001;

    // Star
    const starGlow = ctx.createRadialGradient(cx, cy, 5, cx, cy, 50);
    starGlow.addColorStop(0, "rgba(253, 224, 71, 0.9)");
    starGlow.addColorStop(0.3, "rgba(253, 224, 71, 0.3)");
    starGlow.addColorStop(1, "transparent");
    ctx.fillStyle = starGlow;
    ctx.fillRect(0, 0, W, H);

    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    const sg = ctx.createRadialGradient(cx - 6, cy - 6, 2, cx, cy, 22);
    sg.addColorStop(0, "#fef3c7");
    sg.addColorStop(0.5, "#fbbf24");
    sg.addColorStop(1, "#f59e0b");
    ctx.fillStyle = sg;
    ctx.fill();

    // Orbits + planets
    for (const o of orbits) {
      // Orbit path
      ctx.beginPath();
      ctx.arc(cx, cy, o.r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(100, 120, 200, 0.12)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Planet
      const angle = t * o.speed * 30 + o.r;
      const px = cx + Math.cos(angle) * o.r;
      const py = cy + Math.sin(angle) * o.r;

      ctx.beginPath();
      ctx.arc(px, py, o.size, 0, Math.PI * 2);
      const pg = ctx.createRadialGradient(px - o.size * 0.3, py - o.size * 0.3, 0, px, py, o.size);
      pg.addColorStop(0, o.isEarth ? "#93c5fd" : lighten(o.color, 30));
      pg.addColorStop(1, o.color);
      ctx.fillStyle = pg;
      ctx.fill();

      if (o.isEarth) {
        // Label
        ctx.font = "600 11px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "#93c5fd";
        ctx.textAlign = "center";
        ctx.fillText("Earth", px, py + o.size + 16);

        // Highlight glow
        ctx.beginPath();
        ctx.arc(px, py, o.size + 5, 0, Math.PI * 2);
        const eg = ctx.createRadialGradient(px, py, o.size, px, py, o.size + 5);
        eg.addColorStop(0, "rgba(96, 165, 250, 0.2)");
        eg.addColorStop(1, "transparent");
        ctx.fillStyle = eg;
        ctx.fill();
      }
    }

    // Outer boundary arrow + text
    ctx.beginPath();
    ctx.setLineDash([4, 6]);
    ctx.arc(cx, cy, 240, -0.5, 0.8);
    ctx.strokeStyle = "rgba(167, 139, 250, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = "500 10px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "rgba(167, 139, 250, 0.7)";
    ctx.textAlign = "center";
    ctx.fillText("Exoplanets orbit", cx + 150, cy - 190);
    ctx.fillText("other stars →", cx + 150, cy - 177);

    requestAnimationFrame(draw);
  }

  function lighten(hex, pct) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.min(255, r + pct);
    g = Math.min(255, g + pct);
    b = Math.min(255, b + pct);
    return `rgb(${r},${g},${b})`;
  }

  requestAnimationFrame(draw);
})();

// ============================================================
// SIZE EXPLORER
// ============================================================
(function initSizeExplorer() {
  const pills = document.getElementById("size-selector-pills");
  const earthSphere = document.getElementById("earth-sphere");
  const exoSphere = document.getElementById("exo-sphere");
  const exoName = document.getElementById("exo-name");
  const exoRadiusLabel = document.getElementById("exo-radius-label");

  const infoType = document.getElementById("size-info-type");
  const infoMass = document.getElementById("size-info-mass");
  const infoPeriod = document.getElementById("size-info-period");
  const infoDistance = document.getElementById("size-info-distance");
  const infoMethod = document.getElementById("size-info-method");

  // Subset for size explorer
  const sizeplanets = EXOPLANETS.filter(p =>
    ["earth", "trappist-1e", "k2-18b", "neptune", "jupiter", "kepler-452b", "55-cancri-e", "wasp-121b", "toi-700d"].includes(p.id)
  );

  const EARTH_BASE_SIZE = 100; // px at radius=1
  const MAX_DISPLAY_SIZE = 260;

  // Create pills
  sizeplanets.forEach((p, i) => {
    const btn = document.createElement("button");
    btn.className = "size-pill" + (i === 1 ? " active" : "");
    btn.textContent = p.name;
    btn.addEventListener("click", () => selectSizePlanet(p, btn));
    pills.appendChild(btn);
  });

  function selectSizePlanet(planet, btn) {
    // Update active pill
    document.querySelectorAll(".size-pill").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");

    if (planet.id === "earth") {
      updateSizeDisplay(planet, 1);
    } else {
      updateSizeDisplay(planet, planet.radiusEarth);
    }
  }

  function updateSizeDisplay(planet, ratio) {
    // Calculate display sizes
    const maxRatio = Math.max(ratio, 1);
    const scale = Math.min(1, MAX_DISPLAY_SIZE / (EARTH_BASE_SIZE * maxRatio));
    const earthPx = Math.round(EARTH_BASE_SIZE * scale);
    const exoPx = Math.round(EARTH_BASE_SIZE * ratio * scale);

    // Animate sizes
    earthSphere.style.width = earthPx + "px";
    earthSphere.style.height = earthPx + "px";
    exoSphere.style.width = exoPx + "px";
    exoSphere.style.height = exoPx + "px";

    // Set planet appearance
    const inner = exoSphere.querySelector(".exo-inner");
    if (planet.id === "earth") {
      inner.style.background = "radial-gradient(circle at 35% 35%, #5b9bd5, #2563eb 40%, #1e40af 70%, #1a1a4e)";
      inner.style.boxShadow = "inset -12px -8px 20px rgba(0,0,0,0.4), inset 8px 8px 20px rgba(147,197,253,0.2), 0 0 40px rgba(37,99,235,0.3)";
    } else {
      inner.style.background = getPlanetGradient(planet.type);
      inner.style.boxShadow = `inset -12px -8px 20px rgba(0,0,0,0.4), inset 8px 8px 20px rgba(255,255,255,0.08), 0 0 40px ${getGlowColor(planet.type)}`;
    }

    // Update labels
    exoName.textContent = planet.name;
    exoRadiusLabel.textContent = planet.radiusEarth + "× Earth";

    // Update info panel
    infoType.textContent = planet.type;
    infoMass.textContent = formatMass(planet.massEarth);
    infoPeriod.textContent = formatPeriod(planet.orbitalPeriodDays);
    infoDistance.textContent = formatDistance(planet.distanceLy);
    infoMethod.textContent = planet.discoveryMethod;
  }

  // Initial selection: TRAPPIST-1e
  updateSizeDisplay(sizeplanets[1], sizeplanets[1].radiusEarth);
})();

// ============================================================
// EXPLORE GRID
// ============================================================
(function initExploreGrid() {
  const grid = document.getElementById("explore-grid");
  const searchInput = document.getElementById("explore-search");
  const filterType = document.getElementById("filter-type");
  const filterSize = document.getElementById("filter-size");

  function renderGrid(planets) {
    grid.innerHTML = "";
    if (planets.length === 0) {
      grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color: var(--text-muted); padding: 48px;">No planets match your filters.</p>';
      return;
    }
    planets.forEach((p, i) => {
      const card = document.createElement("div");
      card.className = "planet-card";
      card.style.animationDelay = `${i * 0.05}s`;
      card.innerHTML = `
        <div class="planet-card-sphere">
          <div class="planet-inner ${getPlanetColorClass(p.type)}" style="box-shadow: inset -6px -4px 10px rgba(0,0,0,0.4), inset 4px 4px 10px rgba(255,255,255,0.08), 0 0 20px ${getGlowColor(p.type)};"></div>
        </div>
        <p class="planet-card-name">${p.name}</p>
        <p class="planet-card-type">${p.type}</p>
        <div class="planet-card-stats">
          <div class="planet-card-stat">
            <p class="planet-card-stat-label">Radius</p>
            <p class="planet-card-stat-value">${p.radiusEarth}× ⊕</p>
          </div>
          <div class="planet-card-stat">
            <p class="planet-card-stat-label">Mass</p>
            <p class="planet-card-stat-value">${formatMass(p.massEarth)}</p>
          </div>
          <div class="planet-card-stat">
            <p class="planet-card-stat-label">Period</p>
            <p class="planet-card-stat-value">${formatPeriod(p.orbitalPeriodDays)}</p>
          </div>
          <div class="planet-card-stat">
            <p class="planet-card-stat-label">Distance</p>
            <p class="planet-card-stat-value">${formatDistance(p.distanceLy)}</p>
          </div>
        </div>
      `;
      card.addEventListener("click", () => openDetailModal(p));
      grid.appendChild(card);
    });
  }

  function filterPlanets() {
    let planets = [...EXOPLANETS];
    const search = searchInput.value.toLowerCase().trim();
    const type = filterType.value;
    const size = filterSize.value;

    if (search) {
      planets = planets.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.type.toLowerCase().includes(search)
      );
    }
    if (type !== "all") {
      planets = planets.filter(p => p.type === type);
    }
    if (size !== "all") {
      planets = planets.filter(p => {
        if (size === "smaller") return p.radiusEarth < 1;
        if (size === "similar") return p.radiusEarth >= 0.8 && p.radiusEarth <= 1.5;
        if (size === "super") return p.radiusEarth > 1.5 && p.radiusEarth <= 4;
        if (size === "large") return p.radiusEarth > 4;
        return true;
      });
    }

    renderGrid(planets);
  }

  searchInput.addEventListener("input", filterPlanets);
  filterType.addEventListener("change", filterPlanets);
  filterSize.addEventListener("change", filterPlanets);

  renderGrid(EXOPLANETS);
})();

// ============================================================
// DETAIL MODAL
// ============================================================
function openDetailModal(planet) {
  const overlay = document.getElementById("detail-overlay");
  const sphere = document.getElementById("detail-inner");
  const name = document.getElementById("detail-name");
  const typeBadge = document.getElementById("detail-type-badge");
  const desc = document.getElementById("detail-description");
  const radius = document.getElementById("detail-radius");
  const mass = document.getElementById("detail-mass");
  const period = document.getElementById("detail-period");
  const distance = document.getElementById("detail-distance");
  const method = document.getElementById("detail-method");
  const explain = document.getElementById("detail-explain");

  // Set content
  sphere.style.background = planet.id === "earth"
    ? "radial-gradient(circle at 35% 35%, #5b9bd5, #2563eb 40%, #1e40af 70%, #1a1a4e)"
    : getPlanetGradient(planet.type);
  sphere.style.boxShadow = `inset -15px -10px 25px rgba(0,0,0,0.4), inset 10px 10px 25px rgba(255,255,255,0.08), 0 0 60px ${getGlowColor(planet.type)}`;

  name.textContent = planet.name;
  typeBadge.textContent = planet.type;
  desc.textContent = planet.description;
  radius.textContent = planet.radiusEarth + "× Earth's radius";
  mass.textContent = formatMass(planet.massEarth);
  period.textContent = formatPeriod(planet.orbitalPeriodDays);
  distance.textContent = formatDistance(planet.distanceLy);
  method.textContent = planet.discoveryMethod;
  explain.textContent = planet.explain;

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

(function initDetailModal() {
  const overlay = document.getElementById("detail-overlay");
  const closeBtn = document.getElementById("detail-close");

  function close() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();

// ============================================================
// TRANSIT DETECTION ANIMATION
// ============================================================
(function initTransitDemo() {
  const transitCanvas = document.getElementById("transit-canvas");
  const tCtx = transitCanvas.getContext("2d");
  const TW = 700, TH = 350;

  const lcCanvas = document.getElementById("lightcurve-canvas");
  const lCtx = lcCanvas.getContext("2d");
  const LW = 700, LH = 250;

  const caption = document.getElementById("transit-caption");

  const ORBIT_PERIOD = 6000; // ms for one orbit
  const STAR_X = TW / 2, STAR_Y = TH / 2, STAR_R = 65;
  const PLANET_R = 18;
  const ORBIT_RX = 240, ORBIT_RY = 40;

  let startTime = null;

  function draw(time) {
    if (!startTime) startTime = time;
    const elapsed = time - startTime;
    const phase = (elapsed % ORBIT_PERIOD) / ORBIT_PERIOD; // 0 to 1
    const angle = phase * Math.PI * 2 - Math.PI / 2;

    drawTransit(phase, angle);
    drawLightCurve(phase);

    // Update caption
    const transitPhase = Math.abs(phase - 0.25);
    if (transitPhase < 0.06) {
      caption.textContent = "🔴 Transit! The planet is crossing in front of the star — blocking light!";
    } else if (transitPhase < 0.15) {
      caption.textContent = "The planet is approaching the face of the star...";
    } else {
      caption.textContent = "Watch the planet orbit around its star...";
    }

    requestAnimationFrame(draw);
  }

  function drawTransit(phase, angle) {
    tCtx.clearRect(0, 0, TW, TH);

    // Background stars
    const seed = 42;
    for (let i = 0; i < 40; i++) {
      const sx = ((seed * (i + 1) * 7919) % TW);
      const sy = ((seed * (i + 1) * 6271) % TH);
      const sr = ((seed * (i + 1) * 3571) % 100) / 100 * 1.2 + 0.3;
      tCtx.beginPath();
      tCtx.arc(sx, sy, sr, 0, Math.PI * 2);
      tCtx.fillStyle = "rgba(180, 190, 220, 0.3)";
      tCtx.fill();
    }

    // Orbit path (behind star)
    tCtx.beginPath();
    tCtx.ellipse(STAR_X, STAR_Y, ORBIT_RX, ORBIT_RY, 0, 0, Math.PI * 2);
    tCtx.strokeStyle = "rgba(100, 120, 200, 0.1)";
    tCtx.lineWidth = 1;
    tCtx.stroke();

    // Planet position
    const px = STAR_X + Math.cos(angle) * ORBIT_RX;
    const py = STAR_Y + Math.sin(angle) * ORBIT_RY;
    const planetInFront = Math.sin(angle) >= -0.1;

    // Draw planet behind star
    if (!planetInFront) {
      drawPlanetDot(px, py);
    }

    // Star glow
    const starGlow = tCtx.createRadialGradient(STAR_X, STAR_Y, STAR_R * 0.5, STAR_X, STAR_Y, STAR_R * 2.5);
    starGlow.addColorStop(0, "rgba(253, 224, 71, 0.15)");
    starGlow.addColorStop(0.5, "rgba(253, 224, 71, 0.05)");
    starGlow.addColorStop(1, "transparent");
    tCtx.fillStyle = starGlow;
    tCtx.fillRect(0, 0, TW, TH);

    // Star
    const sg = tCtx.createRadialGradient(STAR_X - 15, STAR_Y - 15, 5, STAR_X, STAR_Y, STAR_R);
    sg.addColorStop(0, "#fef9c3");
    sg.addColorStop(0.4, "#fbbf24");
    sg.addColorStop(0.8, "#f59e0b");
    sg.addColorStop(1, "#d97706");
    tCtx.beginPath();
    tCtx.arc(STAR_X, STAR_Y, STAR_R, 0, Math.PI * 2);
    tCtx.fillStyle = sg;
    tCtx.fill();

    // Planet in front of star
    if (planetInFront) {
      drawPlanetDot(px, py);
    }

    // Transit indicator
    const transitDist = Math.abs(px - STAR_X);
    if (planetInFront && transitDist < STAR_R + PLANET_R) {
      tCtx.font = "600 13px 'Space Grotesk', sans-serif";
      tCtx.fillStyle = "rgba(239, 68, 68, 0.9)";
      tCtx.textAlign = "center";
      tCtx.fillText("● TRANSIT", STAR_X, TH - 25);
    }
  }

  function drawPlanetDot(x, y) {
    // Planet shadow / body
    const pg = tCtx.createRadialGradient(x - 4, y - 3, 1, x, y, PLANET_R);
    pg.addColorStop(0, "#4a4a5a");
    pg.addColorStop(0.5, "#2a2a3a");
    pg.addColorStop(1, "#1a1a2a");
    tCtx.beginPath();
    tCtx.arc(x, y, PLANET_R, 0, Math.PI * 2);
    tCtx.fillStyle = pg;
    tCtx.fill();
  }

  function drawLightCurve(currentPhase) {
    lCtx.clearRect(0, 0, LW, LH);

    const pad = { l: 60, r: 30, t: 30, b: 40 };
    const plotW = LW - pad.l - pad.r;
    const plotH = LH - pad.t - pad.b;

    // Axes
    lCtx.strokeStyle = "rgba(100, 120, 200, 0.2)";
    lCtx.lineWidth = 1;
    lCtx.beginPath();
    lCtx.moveTo(pad.l, pad.t);
    lCtx.lineTo(pad.l, pad.t + plotH);
    lCtx.lineTo(pad.l + plotW, pad.t + plotH);
    lCtx.stroke();

    // Y label
    lCtx.save();
    lCtx.font = "500 11px 'Space Grotesk', sans-serif";
    lCtx.fillStyle = "rgba(156, 163, 191, 0.7)";
    lCtx.textAlign = "center";
    lCtx.translate(18, pad.t + plotH / 2);
    lCtx.rotate(-Math.PI / 2);
    lCtx.fillText("Brightness", 0, 0);
    lCtx.restore();

    // X label
    lCtx.font = "500 11px 'Space Grotesk', sans-serif";
    lCtx.fillStyle = "rgba(156, 163, 191, 0.7)";
    lCtx.textAlign = "center";
    lCtx.fillText("Time →", pad.l + plotW / 2, LH - 8);

    // Normal brightness level
    const baseY = pad.t + 25;
    lCtx.strokeStyle = "rgba(96, 165, 250, 0.15)";
    lCtx.setLineDash([4, 4]);
    lCtx.beginPath();
    lCtx.moveTo(pad.l, baseY);
    lCtx.lineTo(pad.l + plotW, baseY);
    lCtx.stroke();
    lCtx.setLineDash([]);

    lCtx.font = "400 9px 'Inter', sans-serif";
    lCtx.fillStyle = "rgba(96, 165, 250, 0.5)";
    lCtx.textAlign = "right";
    lCtx.fillText("100%", pad.l - 8, baseY + 3);

    // Light curve
    const dipCenter = 0.25;
    const dipWidth = 0.06;
    const dipDepth = plotH * 0.55;
    const POINTS = 200;

    lCtx.beginPath();
    for (let i = 0; i <= POINTS; i++) {
      const p = i / POINTS;
      const x = pad.l + p * plotW;

      // Generate dip
      let brightness = baseY;
      const distFromDip = Math.abs(p - dipCenter);
      if (distFromDip < dipWidth) {
        const t = 1 - distFromDip / dipWidth;
        const dipAmount = t * t * (3 - 2 * t) * dipDepth; // smoothstep
        brightness += dipAmount;
      }

      // Add subtle noise
      const noise = Math.sin(p * 47) * 2 + Math.cos(p * 89) * 1.5;
      brightness += noise;

      if (i === 0) lCtx.moveTo(x, brightness);
      else lCtx.lineTo(x, brightness);
    }
    lCtx.strokeStyle = "rgba(96, 165, 250, 0.8)";
    lCtx.lineWidth = 2;
    lCtx.stroke();

    // Highlight current position
    const curX = pad.l + currentPhase * plotW;
    let curBrightness = baseY;
    const distFromDip = Math.abs(currentPhase - dipCenter);
    if (distFromDip < dipWidth) {
      const t = 1 - distFromDip / dipWidth;
      curBrightness += t * t * (3 - 2 * t) * dipDepth;
    }
    const noise = Math.sin(currentPhase * 47) * 2 + Math.cos(currentPhase * 89) * 1.5;
    curBrightness += noise;

    // Vertical line
    lCtx.strokeStyle = "rgba(239, 68, 68, 0.3)";
    lCtx.lineWidth = 1;
    lCtx.beginPath();
    lCtx.moveTo(curX, pad.t);
    lCtx.lineTo(curX, pad.t + plotH);
    lCtx.stroke();

    // Dot
    lCtx.beginPath();
    lCtx.arc(curX, curBrightness, 5, 0, Math.PI * 2);
    lCtx.fillStyle = distFromDip < dipWidth ? "#ef4444" : "#60a5fa";
    lCtx.fill();
    lCtx.strokeStyle = "rgba(255,255,255,0.3)";
    lCtx.lineWidth = 1.5;
    lCtx.stroke();

    // Dip label
    if (distFromDip < dipWidth) {
      lCtx.font = "600 11px 'Space Grotesk', sans-serif";
      lCtx.fillStyle = "#ef4444";
      lCtx.textAlign = "center";
      lCtx.fillText("DIP! Planet blocking light", curX, pad.t + plotH + 18);
    }

    // Arrow pointing to dip
    const dipX = pad.l + dipCenter * plotW;
    lCtx.font = "500 10px 'Space Grotesk', sans-serif";
    lCtx.fillStyle = "rgba(239, 68, 68, 0.6)";
    lCtx.textAlign = "center";
    lCtx.fillText("↓ Transit dip", dipX, baseY - 10);
  }

  requestAnimationFrame(draw);
})();

// ============================================================
// NAVIGATION
// ============================================================
(function initNav() {
  const nav = document.getElementById("main-nav");
  const toggle = document.getElementById("nav-toggle");
  const mobile = document.getElementById("nav-mobile");
  const links = document.querySelectorAll("[data-nav]");
  const sections = ["what-is", "size-explorer", "explore", "detection", "ai-connection"];

  // Scroll state
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 50);

    // Active section highlighting
    const scrollPos = window.scrollY + 200;
    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i]);
      if (el && el.offsetTop <= scrollPos) {
        links.forEach(l => l.classList.remove("active"));
        document.querySelectorAll(`[data-nav="${sections[i]}"]`).forEach(l => l.classList.add("active"));
        break;
      }
    }
  });

  // Mobile toggle
  toggle.addEventListener("click", () => {
    mobile.classList.toggle("open");
    const spans = toggle.querySelectorAll("span");
    if (mobile.classList.contains("open")) {
      spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
      spans[1].style.opacity = "0";
      spans[2].style.transform = "rotate(-45deg) translate(5px, -5px)";
    } else {
      spans[0].style.transform = "";
      spans[1].style.opacity = "";
      spans[2].style.transform = "";
    }
  });

  // Close mobile on link click
  mobile.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      mobile.classList.remove("open");
      const spans = toggle.querySelectorAll("span");
      spans[0].style.transform = "";
      spans[1].style.opacity = "";
      spans[2].style.transform = "";
    });
  });
})();

// ============================================================
// SCROLL ANIMATIONS (Intersection Observer)
// ============================================================
(function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
  );

  document.querySelectorAll("[data-animate]").forEach((el) => {
    observer.observe(el);
  });
})();

// ============================================================
// SMOOTH SCROLL for anchor links
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

console.log("🔭 ExoScope loaded — Explore worlds beyond our solar system!");
