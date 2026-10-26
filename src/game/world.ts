export type Pt = { x: number; z: number; y: number };

export type Road = {
  id: string;
  name: string;
  level: 0 | 1;
  width: number;
  points: Pt[];
};

export type Block = {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  yaw: number;
  tint: number;
  shop: boolean;
};

export type Solid = { minX: number; maxX: number; minZ: number; maxZ: number };

export const HILL_SPAWN = { x: -15.2, z: 10.2, yaw: -Math.PI / 2 };
export const RAMAT_SPAWN = { x: 50.2, z: -200, yaw: Math.PI / 2 };

export const PARK = { x: 78, z: -230, r: 22 };
export const MAMA = { x: -30, z: -48 };
export const BOARD = { x: -16, z: -18 };
export const DRAIN = { x: 16, z: -58 };
export const HERITAGE = { x: 68, z: -214 };
export const KIOSK = { x: -22, z: -48 };
export const FUEL = { x: -8, z: -30 };
export const FARE_PICK = { x: -4, z: -40 };
export const FARE_DROP = { x: 70, z: -222 };
export const ERRAND_DROP = { x: -8.2, z: 10.2 };

export const ROADS: Road[] = [
  {
    id: "hill",
    name: "Ikpoba Slope",
    level: 0,
    width: 11,
    points: [
      { x: 0, z: 58, y: 0 },
      { x: 0, z: 6, y: 0 },
      { x: 5, z: -46, y: 0 },
      { x: 12, z: -110, y: 0 },
      { x: 18, z: -175, y: 0 },
      { x: 24, z: -228, y: 0 },
      { x: 30, z: -250, y: 1.4 },
      { x: 36, z: -278, y: 1.4 },
      { x: 44, z: -308, y: 0.1 },
    ],
  },
  {
    id: "market",
    name: "Oregbeni Lane",
    level: 0,
    width: 9,
    points: [
      { x: -125, z: -40, y: 0 },
      { x: 115, z: -30, y: 0 },
    ],
  },
  {
    id: "ramat-ground",
    name: "Ramat ground junction",
    level: 0,
    width: 13,
    points: [
      { x: -170, z: -175, y: 0 },
      { x: 180, z: -175, y: 0 },
    ],
  },
  {
    id: "ramp-west",
    name: "Flyover west ramp",
    level: 1,
    width: 9,
    points: [
      { x: -158, z: -175, y: 0 },
      { x: -124, z: -175, y: 2.5 },
      { x: -100, z: -175, y: 5.2 },
      { x: -78, z: -175, y: 7.45 },
    ],
  },
  {
    id: "deck",
    name: "Ramat Park Flyover",
    level: 1,
    width: 10,
    points: [
      { x: -78, z: -175, y: 7.45 },
      { x: 94, z: -175, y: 7.45 },
    ],
  },
  {
    id: "ramp-east",
    name: "Flyover east ramp",
    level: 1,
    width: 9,
    points: [
      { x: 94, z: -175, y: 7.45 },
      { x: 116, z: -175, y: 4.6 },
      { x: 136, z: -175, y: 1.8 },
      { x: 162, z: -175, y: 0 },
    ],
  },
];

const ROAD_BY_ID = new Map(ROADS.map((road) => [road.id, road]));

export function roadById(id: string) {
  const road = ROAD_BY_ID.get(id);
  if (!road) throw new Error(`Unknown road ${id}`);
  return road;
}

export function roadLength(road: Road) {
  let length = 0;
  for (let i = 1; i < road.points.length; i++) {
    const a = road.points[i - 1];
    const b = road.points[i];
    length += Math.hypot(b.x - a.x, b.z - a.z);
  }
  return length;
}

export function pointOnRoad(road: Road, dist: number) {
  const total = roadLength(road);
  let d = ((dist % total) + total) % total;
  const pts = road.points;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const seg = Math.hypot(b.x - a.x, b.z - a.z) || 0.0001;
    if (d <= seg || i === pts.length - 1) {
      const t = Math.max(0, Math.min(1, d / seg));
      return {
        x: a.x + (b.x - a.x) * t,
        z: a.z + (b.z - a.z) * t,
        y: a.y + (b.y - a.y) * t,
        tx: (b.x - a.x) / seg,
        tz: (b.z - a.z) / seg,
      };
    }
    d -= seg;
  }
  const last = pts[pts.length - 1];
  return { x: last.x, z: last.z, y: last.y, tx: 0, tz: -1 };
}

export type SurfaceHit = {
  y: number;
  cx: number;
  cz: number;
  dist: number;
  hw: number;
  level: number;
  roadId: string;
};

export function querySurface(x: number, z: number, currentY: number): SurfaceHit | null {
  let best: SurfaceHit | null = null;
  let bestScore = Infinity;
  for (const road of ROADS) {
    const hw = road.width * 0.5;
    const pts = road.points;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const abx = b.x - a.x;
      const abz = b.z - a.z;
      const len2 = abx * abx + abz * abz || 1;
      let t = ((x - a.x) * abx + (z - a.z) * abz) / len2;
      t = Math.max(0, Math.min(1, t));
      const cx = a.x + abx * t;
      const cz = a.z + abz * t;
      const dist = Math.hypot(x - cx, z - cz);
      if (dist > hw) continue;
      const y = a.y + (b.y - a.y) * t;
      const score = Math.abs(y - currentY) * 6 + dist * 0.03;
      if (score < bestScore) {
        bestScore = score;
        best = { y, cx, cz, dist, hw, level: road.level, roadId: road.id };
      }
    }
  }
  return best;
}

export function constrainElevated(x: number, z: number, y: number) {
  if (y < 1.15) return { x, z };
  const hit = querySurface(x, z, y);
  if (!hit || hit.level === 0 || hit.y < 1.15) return { x, z };
  const limit = hit.hw - 0.55;
  if (hit.dist > limit && hit.dist > 0.001) {
    const k = limit / hit.dist;
    return {
      x: hit.cx + (x - hit.cx) * k,
      z: hit.cz + (z - hit.cz) * k,
    };
  }
  return { x, z };
}

function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const TINTS = [0xe7d7c3, 0xd8c3a4, 0xcbb89a, 0xd5d0c4, 0xe4c2a8, 0xc9d0c4, 0xe8d8c8, 0xb7a48c];

function reserved(x: number, z: number) {
  if (x > -26 && x < -3 && z > -4 && z < 28) return true;
  if (x > 40 && x < 64 && z > -214 && z < -184) return true;
  if ((x - PARK.x) ** 2 + (z - PARK.z) ** 2 < (PARK.r + 6) ** 2) return true;
  if (Math.abs(z + 175) < 22 && x > -8 && x < 48) return true;
  if (x > -58 && x < 2 && z > -62 && z < -18) return true;
  if (z < -240) return true;
  return false;
}

function overlaps(blocks: Block[], x: number, z: number) {
  for (const block of blocks) {
    if (Math.hypot(block.x - x, block.z - z) < 10) return true;
  }
  return false;
}

export function buildBlocks(): Block[] {
  const blocks: Block[] = [];
  let n = 1;
  for (const road of ROADS) {
    if (road.level === 1) continue;
    const length = roadLength(road);
    for (let d = 16; d < length - 16; d += 15) {
      const p = pointOnRoad(road, d);
      const nx = -p.tz;
      const nz = p.tx;
      for (const side of [-1, 1]) {
        const setback = road.width * 0.5 + 6.2;
        const x = p.x + nx * side * setback;
        const z = p.z + nz * side * setback;
        n += 1;
        if (reserved(x, z) || overlaps(blocks, x, z)) continue;
        const hsh = hash(n * 19.1);
        const w = 7.2 + hash(n * 3.7) * 4.8;
        const depth = 6.4 + hash(n * 5.1) * 3.2;
        const tall = road.id === "hill" ? 15 : 9;
        const h = 4.2 + hash(n * 11.3) * tall;
        const faceX = -side * nx;
        const faceZ = -side * nz;
        blocks.push({
          x,
          z,
          w,
          d: depth,
          h,
          yaw: Math.atan2(faceX, faceZ),
          tint: TINTS[n % TINTS.length],
          shop: hsh > 0.58,
        });
        if (blocks.length >= 130) return blocks;
      }
    }
  }
  return blocks;
}

export const BLOCKS = buildBlocks();

function aabbOf(x: number, z: number, w: number, d: number, yaw: number, pad = 0.15): Solid {
  const hx = w / 2;
  const hz = d / 2;
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const lx of [-hx, hx]) {
    for (const lz of [-hz, hz]) {
      const wx = x + c * lx + s * lz;
      const wz = z - s * lx + c * lz;
      minX = Math.min(minX, wx);
      maxX = Math.max(maxX, wx);
      minZ = Math.min(minZ, wz);
      maxZ = Math.max(maxZ, wz);
    }
  }
  return { minX: minX - pad, maxX: maxX + pad, minZ: minZ - pad, maxZ: maxZ + pad };
}

export const PILLARS: { x: number; z: number }[] = [];
for (let x = -62; x <= 82; x += 16) {
  PILLARS.push({ x, z: -175 - 5.15 });
  PILLARS.push({ x, z: -175 + 5.15 });
}

const HOME_WALLS: Solid[] = [
  { minX: -19.4, maxX: -19, minZ: 2, maxZ: 20 },
  { minX: -19, maxX: -9, minZ: 2, maxZ: 2.45 },
  { minX: -19, maxX: -9, minZ: 19.55, maxZ: 20 },
  { minX: -9.45, maxX: -9, minZ: 2, maxZ: 8.15 },
  { minX: -9.45, maxX: -9, minZ: 12.25, maxZ: 20 },
];

const RAMAT_WALLS: Solid[] = [
  { minX: 56, maxX: 56.45, minZ: -208, maxZ: -190 },
  { minX: 44, maxX: 56, minZ: -208, maxZ: -207.55 },
  { minX: 44, maxX: 56, minZ: -190.45, maxZ: -190 },
  { minX: 44, maxX: 44.45, minZ: -208, maxZ: -202.3 },
  { minX: 44, maxX: 44.45, minZ: -198.1, maxZ: -190 },
];

export const SOLIDS: Solid[] = [
  ...BLOCKS.map((block) => aabbOf(block.x, block.z, block.w, block.d, block.yaw)),
  ...HOME_WALLS,
  ...RAMAT_WALLS,
  ...PILLARS.map((pillar) => ({
    minX: pillar.x - 0.55,
    maxX: pillar.x + 0.55,
    minZ: pillar.z - 0.55,
    maxZ: pillar.z + 0.55,
  })),
];

export function resolveCircle(x: number, z: number, radius: number) {
  for (let pass = 0; pass < 2; pass++) {
    for (const solid of SOLIDS) {
      const cx = Math.max(solid.minX, Math.min(x, solid.maxX));
      const cz = Math.max(solid.minZ, Math.min(z, solid.maxZ));
      let dx = x - cx;
      let dz = z - cz;
      const d2 = dx * dx + dz * dz;
      if (d2 === 0) {
        const left = x - solid.minX;
        const right = solid.maxX - x;
        const up = z - solid.minZ;
        const down = solid.maxZ - z;
        const min = Math.min(left, right, up, down);
        if (min === left) x = solid.minX - radius;
        else if (min === right) x = solid.maxX + radius;
        else if (min === up) z = solid.minZ - radius;
        else z = solid.maxZ + radius;
      } else if (d2 < radius * radius) {
        const d = Math.sqrt(d2);
        const push = radius - d + 0.001;
        dx /= d;
        dz /= d;
        x += dx * push;
        z += dz * push;
      }
    }
  }
  return { x, z };
}

export function pointInSolid(x: number, z: number) {
  for (const solid of SOLIDS) {
    if (x > solid.minX && x < solid.maxX && z > solid.minZ && z < solid.maxZ) return true;
  }
  return false;
}

export function placeName(x: number, z: number, y: number) {
  if (y > 3 && Math.abs(z + 175) < 16 && x > -150 && x < 160) return "Ramat flyover deck";
  if ((x - PARK.x) ** 2 + (z - PARK.z) ** 2 < (PARK.r + 4) ** 2) return "Ramat Park";
  if (x < -9 && x > -20 && z > 2 && z < 20 && y < 3) return "Rented room";
  if (x > 44 && x < 56 && z < -190 && z > -208) return "Ramat room";
  if (Math.abs(z + 40) < 20 && x > -80 && x < 30) return "Oregbeni";
  if (Math.abs(z + 175) < 26) return "Ramat junction";
  if (z < -242) return "Ikpoba bridge";
  if (z > -10) return "Ikpoba Hill";
  return "The corridor";
}

export function yawFromTangent(tx: number, tz: number) {
  return Math.atan2(-tx, -tz);
}
