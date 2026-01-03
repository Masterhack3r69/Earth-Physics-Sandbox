/**
 * Material Definitions for Earth Physics Sandbox
 * Each material has properties that define its physical behavior
 */

// Material IDs
export const MATERIAL = {
  AIR: 0,
  // Solids
  STONE: 1,
  DIRT: 2,
  SAND: 3,
  CLAY: 4,
  METAL: 5,
  ICE: 6,
  // Liquids
  WATER: 10,
  MUD: 11,
  OIL: 12,
  LAVA: 13,
  // Gases
  STEAM: 20,
  SMOKE: 21,
  GAS: 22,
  // Organic
  GRASS: 30,
  PLANT: 31,
  WOOD: 32,
  CHARCOAL: 33,
  // Energy
  FIRE: 40,
  ELECTRICITY: 41,
  EXPLOSION: 42,
};

// Material states
export const STATE = {
  SOLID: "solid",
  POWDER: "powder",
  LIQUID: "liquid",
  GAS: "gas",
  ENERGY: "energy",
};

// Material categories for UI
export const CATEGORIES = {
  solids: [
    MATERIAL.STONE,
    MATERIAL.DIRT,
    MATERIAL.SAND,
    MATERIAL.CLAY,
    MATERIAL.METAL,
    MATERIAL.ICE,
  ],
  liquids: [MATERIAL.WATER, MATERIAL.MUD, MATERIAL.OIL, MATERIAL.LAVA],
  gases: [MATERIAL.AIR, MATERIAL.STEAM, MATERIAL.SMOKE, MATERIAL.GAS],
  organic: [MATERIAL.GRASS, MATERIAL.PLANT, MATERIAL.WOOD, MATERIAL.CHARCOAL],
  energy: [MATERIAL.FIRE, MATERIAL.ELECTRICITY, MATERIAL.EXPLOSION],
};

// Color variation helper
function colorVariant(base, variance = 10) {
  return () => {
    const v = Math.floor(Math.random() * variance * 2) - variance;
    return [
      Math.max(0, Math.min(255, base[0] + v)),
      Math.max(0, Math.min(255, base[1] + v)),
      Math.max(0, Math.min(255, base[2] + v)),
    ];
  };
}

// Animated color for fire/lava
function fireColor() {
  const r = 200 + Math.floor(Math.random() * 55);
  const g = Math.floor(Math.random() * 150);
  const b = Math.floor(Math.random() * 50);
  return [r, g, b];
}

function lavaColor() {
  const r = 200 + Math.floor(Math.random() * 55);
  const g = 50 + Math.floor(Math.random() * 100);
  const b = 0;
  return [r, g, b];
}

function electricityColor() {
  const intensity = Math.random() > 0.5 ? 255 : 200;
  return [intensity, intensity, Math.floor(Math.random() * 100)];
}

// Material properties database
export const MATERIALS = {
  [MATERIAL.AIR]: {
    id: MATERIAL.AIR,
    name: "Air",
    color: [10, 10, 20],
    density: 0,
    state: STATE.GAS,
    flammable: false,
    temperature: 20,
    conductivity: 0.01,
  },

  // === SOLIDS ===
  [MATERIAL.STONE]: {
    id: MATERIAL.STONE,
    name: "Stone",
    color: colorVariant([85, 85, 85], 15),
    density: 100,
    state: STATE.SOLID,
    flammable: false,
    temperature: 20,
    conductivity: 0.3,
    immovable: true,
  },
  [MATERIAL.DIRT]: {
    id: MATERIAL.DIRT,
    name: "Dirt",
    color: colorVariant([110, 80, 40], 12),
    density: 60,
    state: STATE.POWDER,
    flammable: false,
    temperature: 20,
    conductivity: 0.2,
    supportGrass: true,
  },
  [MATERIAL.SAND]: {
    id: MATERIAL.SAND,
    name: "Sand",
    color: colorVariant([210, 190, 140], 15),
    density: 50,
    state: STATE.POWDER,
    flammable: false,
    temperature: 20,
    conductivity: 0.15,
  },
  [MATERIAL.CLAY]: {
    id: MATERIAL.CLAY,
    name: "Clay",
    color: colorVariant([140, 100, 70], 10),
    density: 70,
    state: STATE.SOLID,
    flammable: false,
    temperature: 20,
    conductivity: 0.25,
    sticky: true,
  },
  [MATERIAL.METAL]: {
    id: MATERIAL.METAL,
    name: "Metal",
    color: colorVariant([120, 130, 150], 8),
    density: 150,
    state: STATE.SOLID,
    flammable: false,
    temperature: 20,
    conductivity: 0.9,
    conductive: true,
  },
  [MATERIAL.ICE]: {
    id: MATERIAL.ICE,
    name: "Ice",
    color: colorVariant([180, 220, 255], 10),
    density: 35,
    state: STATE.SOLID,
    flammable: false,
    temperature: -10,
    conductivity: 0.5,
    meltsTo: MATERIAL.WATER,
    meltTemp: 0,
  },

  // === LIQUIDS ===
  [MATERIAL.WATER]: {
    id: MATERIAL.WATER,
    name: "Water",
    color: colorVariant([50, 130, 200], 15),
    density: 40,
    state: STATE.LIQUID,
    flammable: false,
    temperature: 20,
    conductivity: 0.6,
    viscosity: 1,
    conductive: true,
    evaporatesTo: MATERIAL.STEAM,
    evaporateTemp: 100,
  },
  [MATERIAL.MUD]: {
    id: MATERIAL.MUD,
    name: "Mud",
    color: colorVariant([70, 55, 40], 8),
    density: 55,
    state: STATE.LIQUID,
    flammable: false,
    temperature: 20,
    conductivity: 0.3,
    viscosity: 8,
  },
  [MATERIAL.OIL]: {
    id: MATERIAL.OIL,
    name: "Oil",
    color: colorVariant([40, 35, 25], 5),
    density: 30,
    state: STATE.LIQUID,
    flammable: true,
    temperature: 20,
    conductivity: 0.1,
    viscosity: 3,
    burnTemp: 150,
  },
  [MATERIAL.LAVA]: {
    id: MATERIAL.LAVA,
    name: "Lava",
    color: lavaColor,
    density: 90,
    state: STATE.LIQUID,
    flammable: false,
    temperature: 1200,
    conductivity: 0.8,
    viscosity: 12,
    glows: true,
    ignites: true,
  },

  // === GASES ===
  [MATERIAL.STEAM]: {
    id: MATERIAL.STEAM,
    name: "Steam",
    color: colorVariant([200, 210, 220], 10),
    density: -20,
    state: STATE.GAS,
    flammable: false,
    temperature: 100,
    conductivity: 0.05,
    condensesTo: MATERIAL.WATER,
    condenseTemp: 80,
    lifetime: 300,
  },
  [MATERIAL.SMOKE]: {
    id: MATERIAL.SMOKE,
    name: "Smoke",
    color: colorVariant([60, 60, 65], 10),
    density: -15,
    state: STATE.GAS,
    flammable: false,
    temperature: 80,
    conductivity: 0.02,
    lifetime: 200,
    dissipates: true,
  },
  [MATERIAL.GAS]: {
    id: MATERIAL.GAS,
    name: "Gas",
    color: colorVariant([150, 220, 150], 20),
    density: -10,
    state: STATE.GAS,
    flammable: true,
    temperature: 20,
    conductivity: 0.02,
    explosive: true,
    burnTemp: 50,
  },

  // === ORGANIC ===
  [MATERIAL.GRASS]: {
    id: MATERIAL.GRASS,
    name: "Grass",
    color: colorVariant([50, 140, 50], 20),
    density: 25,
    state: STATE.SOLID,
    flammable: true,
    temperature: 20,
    conductivity: 0.1,
    burnTemp: 200,
    grows: true,
  },
  [MATERIAL.PLANT]: {
    id: MATERIAL.PLANT,
    name: "Plant",
    color: colorVariant([70, 180, 70], 25),
    density: 20,
    state: STATE.SOLID,
    flammable: true,
    temperature: 20,
    conductivity: 0.1,
    burnTemp: 180,
    spreads: true,
    needsWater: true,
  },
  [MATERIAL.WOOD]: {
    id: MATERIAL.WOOD,
    name: "Wood",
    color: colorVariant([120, 80, 40], 15),
    density: 35,
    state: STATE.SOLID,
    flammable: true,
    temperature: 20,
    conductivity: 0.15,
    burnTemp: 250,
    burnsTo: MATERIAL.CHARCOAL,
  },
  [MATERIAL.CHARCOAL]: {
    id: MATERIAL.CHARCOAL,
    name: "Charcoal",
    color: colorVariant([35, 35, 40], 5),
    density: 25,
    state: STATE.POWDER,
    flammable: true,
    temperature: 20,
    conductivity: 0.2,
    burnTemp: 400,
  },

  // === ENERGY ===
  [MATERIAL.FIRE]: {
    id: MATERIAL.FIRE,
    name: "Fire",
    color: fireColor,
    density: -30,
    state: STATE.ENERGY,
    flammable: false,
    temperature: 600,
    conductivity: 0.1,
    lifetime: 60,
    produces: MATERIAL.SMOKE,
    glows: true,
    ignites: true,
  },
  [MATERIAL.ELECTRICITY]: {
    id: MATERIAL.ELECTRICITY,
    name: "Electricity",
    color: electricityColor,
    density: 0,
    state: STATE.ENERGY,
    flammable: false,
    temperature: 50,
    conductivity: 1,
    lifetime: 5,
    glows: true,
    ignites: true,
  },
  [MATERIAL.EXPLOSION]: {
    id: MATERIAL.EXPLOSION,
    name: "Explosion",
    color: () => [255, 200 + Math.random() * 55, Math.random() * 100],
    density: 0,
    state: STATE.ENERGY,
    flammable: false,
    temperature: 2000,
    conductivity: 0,
    lifetime: 3,
    force: 10,
    glows: true,
    ignites: true,
  },
};

// Get material property safely
export function getMaterial(id) {
  return MATERIALS[id] || MATERIALS[MATERIAL.AIR];
}

// Get color for a material (handles both static and dynamic colors)
export function getColor(id) {
  const mat = getMaterial(id);
  if (typeof mat.color === "function") {
    return mat.color();
  }
  return mat.color;
}

// Check if material is affected by gravity
export function hasGravity(id) {
  const mat = getMaterial(id);
  return mat.state !== STATE.SOLID || !mat.immovable;
}

// Get material by name
export function getMaterialByName(name) {
  const lowerName = name.toLowerCase();
  for (const key in MATERIALS) {
    if (MATERIALS[key].name.toLowerCase() === lowerName) {
      return MATERIALS[key];
    }
  }
  return null;
}
