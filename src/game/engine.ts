import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { CityAudio } from "./audio";
import { bridge, type GameApi, type NewGameCfg } from "./bridge";
import { ECON, GOODS, type GoodId } from "./content";
import {
  ADESUWA,
  NIGHT_CORNER,
  UNION_YARD,
  allowHaggle,
  applyCall,
  applyMeet,
  applyRice,
  applySide,
  biasForBackground,
  cityPressure,
  defaultSocial,
  drift,
  fareBonus,
  mamaRefusesRice,
  sleepSocial,
  type Social,
} from "./social";
import { consume, keys, pad, setKeys, setSteer, steerOverride } from "./input";
import { loadSave, writeSave } from "./save";
import { useHud } from "./store";
import type { Panel, Ride, SaveData } from "./types";
import {
  BLOCKS,
  BOARD,
  DRAIN,
  ERRAND_DROP,
  FARE_DROP,
  FARE_PICK,
  FUEL,
  HERITAGE,
  HILL_SPAWN,
  KIOSK,
  MAMA,
  PARK,
  PILLARS,
  RAMAT_SPAWN,
  ROADS,
  constrainElevated,
  placeName,
  pointInSolid,
  pointOnRoad,
  querySurface,
  resolveCircle,
  roadById,
  roadLength,
  yawFromTangent,
  type Road,
} from "./world";

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      setKeys?: (codes: string[]) => void;
      setSteer?: (v: number) => void;
    };
  }
}

type Bag = { p: number[]; n: number[]; uv: number[]; c: number[]; i: number[] };
type Agent = {
  road: string;
  dist: number;
  lane: number;
  speed: number;
  kind: "car" | "okada" | "bus";
  color: number;
};
type Ped = { road: string; dist: number; side: number; speed: number; phase: number; cloth: number; skin: number };

const SKIN = [0x3a2418, 0x5c3a28, 0x7a4f34, 0x8e6244];
const CLOTH = [0xd4652f, 0x1f4d3a, 0xe7d3b0, 0x243044];
const STEP = 1 / 60;

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function dampAngle(current: number, target: number, dt: number, speed: number) {
  const diff = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + diff * (1 - Math.exp(-speed * dt));
}

function bag(): Bag {
  return { p: [], n: [], uv: [], c: [], i: [] };
}

function toGeo(data: Bag) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(data.p, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(data.n, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(data.uv, 2));
  if (data.c.length) g.setAttribute("color", new THREE.Float32BufferAttribute(data.c, 3));
  g.setIndex(data.i);
  g.computeBoundingSphere();
  return g;
}

const color = new THREE.Color();

function appendBox(
  data: Bag,
  cx: number,
  cy: number,
  cz: number,
  sx: number,
  sy: number,
  sz: number,
  yaw: number,
  tint: number,
  facade: boolean,
) {
  color.setHex(tint);
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const faces: { n: number[]; v: number[][] }[] = [
    { n: [0, 0, 1], v: [[-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5]] },
    { n: [0, 0, -1], v: [[0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5]] },
    { n: [1, 0, 0], v: [[0.5, -0.5, 0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5]] },
    { n: [-1, 0, 0], v: [[-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5]] },
    { n: [0, 1, 0], v: [[-0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5]] },
    { n: [0, -1, 0], v: [[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5]] },
  ];
  for (const face of faces) {
    const base = data.p.length / 3;
    const nx = c * face.n[0] + s * face.n[2];
    const ny = face.n[1];
    const nz = -s * face.n[0] + c * face.n[2];
    for (const v of face.v) {
      const lx = v[0] * sx;
      const ly = v[1] * sy;
      const lz = v[2] * sz;
      data.p.push(cx + c * lx + s * lz, cy + ly, cz - s * lx + c * lz);
      data.n.push(nx, ny, nz);
      if (!facade || Math.abs(face.n[1]) > 0.5) data.uv.push(0.02, 0.02);
      else if (Math.abs(face.n[0]) > 0.5) data.uv.push((v[2] + 0.5) * (sz / 2.6), (v[1] + 0.5) * (sy / 3.05));
      else data.uv.push((v[0] + 0.5) * (sx / 2.6), (v[1] + 0.5) * (sy / 3.05));
      data.c.push(color.r, color.g, color.b);
    }
    data.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
}

function roadFrame(road: Road) {
  const frames: { lx: number; lz: number; rx: number; rz: number; y: number; len: number; nx: number; nz: number }[] = [];
  let len = 0;
  for (let i = 0; i < road.points.length; i++) {
    const p = road.points[i];
    const a = road.points[Math.max(0, i - 1)];
    const b = road.points[Math.min(road.points.length - 1, i + 1)];
    let tx = b.x - a.x;
    let tz = b.z - a.z;
    const mag = Math.hypot(tx, tz) || 1;
    tx /= mag;
    tz /= mag;
    const nx = -tz;
    const nz = tx;
    const hw = road.width / 2;
    if (i > 0) len += Math.hypot(p.x - road.points[i - 1].x, p.z - road.points[i - 1].z);
    frames.push({
      lx: p.x + nx * hw,
      lz: p.z + nz * hw,
      rx: p.x - nx * hw,
      rz: p.z - nz * hw,
      y: p.y,
      len,
      nx,
      nz,
    });
  }
  return frames;
}

function addQuad(
  data: Bag,
  verts: number[][],
  normal: number[],
  uvs: number[][],
  tint: number,
) {
  color.setHex(tint);
  const base = data.p.length / 3;
  for (let i = 0; i < 4; i++) {
    data.p.push(verts[i][0], verts[i][1], verts[i][2]);
    data.n.push(normal[0], normal[1], normal[2]);
    data.uv.push(uvs[i][0], uvs[i][1]);
    data.c.push(color.r, color.g, color.b);
  }
  data.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
}

function appendRoads(asphalt: Bag, concrete: Bag) {
  for (const road of ROADS) {
    const frames = roadFrame(road);
    const elevated = road.level === 1;
    const tint = elevated ? 0xc5c2bb : 0xffffff;
    for (let i = 0; i < frames.length - 1; i++) {
      const a = frames[i];
      const b = frames[i + 1];
      const lift = 0.05;
      addQuad(
        asphalt,
        [
          [a.lx, a.y + lift, a.lz],
          [a.rx, a.y + lift, a.rz],
          [b.rx, b.y + lift, b.rz],
          [b.lx, b.y + lift, b.lz],
        ],
        [0, 1, 0],
        [
          [0, a.len / 4],
          [1, a.len / 4],
          [1, b.len / 4],
          [0, b.len / 4],
        ],
        tint,
      );
      if (!elevated) continue;
      const drop = 0.48;
      addQuad(
        concrete,
        [
          [a.rx, a.y + lift - drop, a.rz],
          [a.lx, a.y + lift - drop, a.lz],
          [b.lx, b.y + lift - drop, b.lz],
          [b.rx, b.y + lift - drop, b.rz],
        ],
        [0, -1, 0],
        [
          [0, a.len / 6],
          [1, a.len / 6],
          [1, b.len / 6],
          [0, b.len / 6],
        ],
        0xb7b2a8,
      );
      addQuad(
        concrete,
        [
          [a.lx, a.y + lift, a.lz],
          [b.lx, b.y + lift, b.lz],
          [b.lx, b.y + lift - drop, b.lz],
          [a.lx, a.y + lift - drop, a.lz],
        ],
        [a.nx, 0, a.nz],
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
        ],
        0xc8c3b8,
      );
      addQuad(
        concrete,
        [
          [b.rx, b.y + lift, b.rz],
          [a.rx, a.y + lift, a.rz],
          [a.rx, a.y + lift - drop, a.rz],
          [b.rx, b.y + lift - drop, b.rz],
        ],
        [-a.nx, 0, -a.nz],
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
        ],
        0xc8c3b8,
      );
      const rail = 0.85;
      addQuad(
        concrete,
        [
          [a.lx, a.y + lift + rail, a.lz],
          [b.lx, b.y + lift + rail, b.lz],
          [b.lx, b.y + lift + 0.08, b.lz],
          [a.lx, a.y + lift + 0.08, a.lz],
        ],
        [a.nx, 0, a.nz],
        [
          [0, 1],
          [1, 1],
          [1, 0],
          [0, 0],
        ],
        0xdedad2,
      );
      addQuad(
        concrete,
        [
          [b.rx, b.y + lift + rail, b.rz],
          [a.rx, a.y + lift + rail, a.rz],
          [a.rx, a.y + lift + 0.08, a.rz],
          [b.rx, b.y + lift + 0.08, b.rz],
        ],
        [-a.nx, 0, -a.nz],
        [
          [0, 1],
          [1, 1],
          [1, 0],
          [0, 0],
        ],
        0xdedad2,
      );
    }
  }
}

function canvasTex(draw: (g: CanvasRenderingContext2D, size: number) => void, size = 128) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function makeVehicleGeo(kind: Agent["kind"]) {
  const data = bag();
  if (kind === "okada") {
    appendBox(data, 0, 0.42, 0, 0.28, 0.32, 1.35, 0, 0xffffff, false);
    appendBox(data, 0, 0.72, 0.15, 0.22, 0.28, 0.45, 0, 0xffffff, false);
    appendBox(data, 0, 0.28, 0.62, 0.12, 0.36, 0.12, 0, 0x222222, false);
    appendBox(data, 0, 0.28, -0.62, 0.12, 0.36, 0.12, 0, 0x222222, false);
  } else if (kind === "bus") {
    appendBox(data, 0, 0.85, 0, 1.7, 1.5, 4.4, 0, 0xffffff, false);
    appendBox(data, 0, 1.15, 1.55, 1.5, 0.7, 0.7, 0, 0xd7eef5, false);
    appendBox(data, 0, 0.32, 1.4, 0.28, 0.5, 0.28, 0, 0x222222, false);
    appendBox(data, 0, 0.32, -1.4, 0.28, 0.5, 0.28, 0, 0x222222, false);
  } else {
    appendBox(data, 0, 0.42, 0, 1.35, 0.48, 2.7, 0, 0xffffff, false);
    appendBox(data, 0, 0.92, -0.15, 1.15, 0.48, 1.35, 0, 0xd7eef5, false);
    appendBox(data, 0.62, 0.28, 0.85, 0.28, 0.42, 0.28, 0, 0x222222, false);
    appendBox(data, -0.62, 0.28, 0.85, 0.28, 0.42, 0.28, 0, 0x222222, false);
    appendBox(data, 0.62, 0.28, -0.85, 0.28, 0.42, 0.28, 0, 0x222222, false);
    appendBox(data, -0.62, 0.28, -0.85, 0.28, 0.42, 0.28, 0, 0x222222, false);
  }
  return toGeo(data);
}

function makePalm() {
  const trunk = new THREE.CylinderGeometry(0.14, 0.24, 5.4, 6);
  trunk.translate(0, 2.7, 0);
  const parts: THREE.BufferGeometry[] = [trunk];
  for (let i = 0; i < 6; i++) {
    const frond = new THREE.BoxGeometry(0.16, 0.05, 2.15);
    frond.translate(0, 0, 1);
    frond.rotateX(0.55);
    frond.rotateY((i / 6) * Math.PI * 2);
    frond.translate(0, 5.15, 0);
    parts.push(frond);
  }
  const merged = mergeGeometries(parts, false);
  if (!merged) throw new Error("palm");
  return merged;
}

type Sim = {
  phase: "title" | "play" | "pause" | "reel";
  panel: Panel | null;
  name: string;
  background: NewGameCfg["background"];
  skin: number;
  cloth: number;
  naira: number;
  day: number;
  minutes: number;
  hunger: number;
  energy: number;
  debt: number;
  rentPaidDay: number;
  home: "hill" | "ramat";
  inv: { puff: number; water: number; rice: number };
  skill: number;
  rel: number;
  flags: Record<string, boolean>;
  job: { id: "errand" | "fare"; stage: number } | null;
  stallStep: number;
  stallProfit: number;
  px: number;
  py: number;
  pz: number;
  yaw: number;
  speed: number;
  footSpeed: number;
  mode: "foot" | "drive";
  ride: Ride | null;
  fuel: number;
  carUnlocked: boolean;
  raining: boolean;
  autoRainDay: number;
  camOff: number;
  okada: { x: number; z: number; yaw: number };
  car: { x: number; z: number; yaw: number };
  muted: boolean;
  haggle: boolean;
  dryWarned: boolean;
  edgeTold: boolean;
  shake: number;
  walkPhase: number;
  social: Social;
  reelT: number;
  reelBeat: number;
};

function freshSim(): Sim {
  return {
    phase: "title",
    panel: null,
    name: "",
    background: "student",
    skin: 1,
    cloth: 0,
    naira: 0,
    day: 1,
    minutes: 17 * 60 + 25,
    hunger: 18,
    energy: 92,
    debt: 0,
    rentPaidDay: 0,
    home: "hill",
    inv: { puff: 0, water: 0, rice: 0 },
    skill: 0,
    rel: 0,
    flags: {},
    job: null,
    stallStep: 0,
    stallProfit: 0,
    px: HILL_SPAWN.x,
    py: 0,
    pz: HILL_SPAWN.z,
    yaw: HILL_SPAWN.yaw,
    speed: 0,
    footSpeed: 0,
    mode: "foot",
    ride: null,
    fuel: 100,
    carUnlocked: false,
    raining: false,
    autoRainDay: -1,
    camOff: 0,
    okada: { x: -7.3, z: 12.2, yaw: 0 },
    car: { x: -7.3, z: 4.6, yaw: 0 },
    muted: false,
    haggle: false,
    dryWarned: false,
    edgeTold: false,
    shake: 0,
    walkPhase: 0,
    social: defaultSocial(),
    reelT: 0,
    reelBeat: -1,
  };
}

export function mount(view: HTMLCanvasElement, minimap: HTMLCanvasElement | null) {
  const mobile = Math.min(window.innerWidth, window.innerHeight) < 820;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sim = freshSim();
  const audio = new CityAudio();
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const disposers: (() => void)[] = [];

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: view,
      antialias: !mobile,
      powerPreference: "high-performance",
      alpha: false,
    });
  } catch {
    useHud.getState().patch({
      ready: true,
      error: "This browser couldn't start the city view.",
    });
    return () => {};
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.7));
  renderer.setSize(view.clientWidth || 1, view.clientHeight || 1, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xd8b48a, 0.0075);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.12, 700);
  camera.position.set(20, 18, -150);

  const hemi = new THREE.HemisphereLight(0xffe2c2, 0x6a4030, 0.95);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.35);
  sun.castShadow = true;
  const shadowSpan = mobile ? 42 : 68;
  sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  sun.shadow.camera.near = 2;
  sun.shadow.camera.far = 160;
  sun.shadow.camera.left = -shadowSpan;
  sun.shadow.camera.right = shadowSpan;
  sun.shadow.camera.top = shadowSpan;
  sun.shadow.camera.bottom = -shadowSpan;
  sun.shadow.bias = -0.00035;
  sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);

  const nightFill = new THREE.HemisphereLight(0x1a2744, 0x120c09, 0);
  scene.add(nightFill);

  const facade = canvasTex((g, s) => {
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 500; i++) {
      g.fillStyle = `rgba(40, 24, 12, ${Math.random() * 0.06})`;
      g.fillRect(Math.random() * s, Math.random() * s, 2, 2);
    }
    g.fillStyle = "#1a2430";
    g.fillRect(s * 0.26, s * 0.18, s * 0.48, s * 0.58);
    g.fillStyle = "rgba(180, 220, 230, 0.35)";
    g.fillRect(s * 0.3, s * 0.22, s * 0.18, s * 0.22);
    g.fillStyle = "#e7e1d8";
    g.fillRect(s * 0.22, s * 0.78, s * 0.56, s * 0.045);
  });
  const glow = canvasTex((g, s) => {
    g.fillStyle = "#000";
    g.fillRect(0, 0, s, s);
    g.fillStyle = "#ffd7a8";
    g.fillRect(s * 0.3, s * 0.22, s * 0.4, s * 0.48);
  });
  const asphaltMap = canvasTex((g, s) => {
    g.fillStyle = "#3a3d42";
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 700; i++) {
      g.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`;
      g.fillRect(Math.random() * s, Math.random() * s, 2, 2);
    }
    g.fillStyle = "#f2efe6";
    g.fillRect(2, 0, 3, s);
    g.fillRect(s - 5, 0, 3, s);
    g.fillRect(s * 0.47, s * 0.08, s * 0.06, s * 0.38);
  }, 128);
  asphaltMap.repeat.set(1, 1);
  const laterite = canvasTex((g, s) => {
    g.fillStyle = "#8a4a30";
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = `rgba(40, 16, 8, ${Math.random() * 0.18})`;
      g.fillRect(Math.random() * s, Math.random() * s, 3, 2);
    }
  });
  const concreteMap = canvasTex((g, s) => {
    g.fillStyle = "#c9c4ba";
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 400; i++) {
      g.fillStyle = `rgba(60,50,40,${Math.random() * 0.08})`;
      g.fillRect(Math.random() * s, Math.random() * s, 4, 2);
    }
  });

  const buildingMat = new THREE.MeshStandardMaterial({
    map: facade,
    emissiveMap: glow,
    emissive: new THREE.Color(0xffc98a),
    emissiveIntensity: 0,
    roughness: 0.86,
    metalness: 0.02,
    vertexColors: true,
  });
  const asphaltMat = new THREE.MeshStandardMaterial({
    map: asphaltMap,
    roughness: 0.92,
    metalness: 0.04,
    vertexColors: true,
  });
  const concreteMat = new THREE.MeshStandardMaterial({
    map: concreteMap,
    roughness: 0.78,
    metalness: 0.05,
    vertexColors: true,
  });
  const groundMat = new THREE.MeshStandardMaterial({
    map: laterite,
    roughness: 1,
    metalness: 0,
    color: 0xffffff,
  });
  laterite.repeat.set(48, 48);
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x3f7a45, roughness: 0.95 });
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x2f6e78,
    roughness: 0.18,
    metalness: 0.45,
    transparent: true,
    opacity: 0.86,
  });
  const palmMat = new THREE.MeshStandardMaterial({ color: 0x2f6a3c, roughness: 0.8 });
  const trunkTint = new THREE.MeshStandardMaterial({ color: 0x6b4a32, roughness: 0.9 });
  mats.push(buildingMat, asphaltMat, concreteMat, groundMat, grassMat, waterMat, palmMat, trunkTint);

  const buildings = bag();
  const awnings = bag();
  const roofs = bag();
  for (const block of BLOCKS) {
    appendBox(buildings, block.x, block.h / 2, block.z, block.w, block.h, block.d, block.yaw, block.tint, true);
    appendBox(roofs, block.x, block.h + 0.12, block.z, block.w + 0.3, 0.22, block.d + 0.3, block.yaw, 0x6a3d32, false);
    if (block.shop) {
      const c = Math.cos(block.yaw);
      const s = Math.sin(block.yaw);
      const ox = c * 0 + s * (block.d / 2 + 0.45);
      const oz = -s * 0 + c * (block.d / 2 + 0.45);
      appendBox(awnings, block.x + ox, 2.4, block.z + oz, block.w * 0.7, 0.08, 1.1, block.yaw, CLOTH[block.tint % 4], false);
    }
  }
  const homeBag = bag();
  // Hill room — wall segments so the door is a real opening.
  appendBox(homeBag, -19.2, 1.55, 11, 0.4, 3.1, 18, 0, 0xe4d2b8, true);
  appendBox(homeBag, -14, 1.55, 2.22, 10.4, 3.1, 0.45, 0, 0xe4d2b8, true);
  appendBox(homeBag, -14, 1.55, 19.78, 10.4, 3.1, 0.45, 0, 0xe4d2b8, true);
  appendBox(homeBag, -9.22, 1.55, 5.08, 0.45, 3.1, 6.15, 0, 0xe4d2b8, true);
  appendBox(homeBag, -9.22, 1.55, 16.12, 0.45, 3.1, 7.75, 0, 0xe4d2b8, true);
  appendBox(homeBag, -14, 3.16, 11, 10.2, 0.12, 17.6, 0, 0x6a3d32, false);
  appendBox(homeBag, -14, 0.04, 11, 9.2, 0.06, 16.4, 0, 0xc4a98a, false);
  appendBox(homeBag, -16.4, 0.22, 15.2, 1.3, 0.28, 2.1, 0, 0xc45c26, false);
  appendBox(homeBag, -12.4, 0.38, 6.4, 0.9, 0.5, 0.7, 0, 0x6b4a32, false);
  // Ramat room, door facing the corridor.
  appendBox(homeBag, 56.22, 1.7, -199, 0.4, 3.4, 18, 0, 0xe7d8c4, true);
  appendBox(homeBag, 50, 1.7, -207.78, 12.2, 3.4, 0.45, 0, 0xe7d8c4, true);
  appendBox(homeBag, 50, 1.7, -190.22, 12.2, 3.4, 0.45, 0, 0xe7d8c4, true);
  appendBox(homeBag, 44.22, 1.7, -205.15, 0.45, 3.4, 5.7, 0, 0xe7d8c4, true);
  appendBox(homeBag, 44.22, 1.7, -194.05, 0.45, 3.4, 8.1, 0, 0xe7d8c4, true);
  appendBox(homeBag, 50, 3.42, -199, 12, 0.12, 17.6, 0, 0x5c4638, false);
  appendBox(homeBag, 52.2, 0.24, -202.2, 1.4, 0.3, 2.1, 0, 0x1f4d3a, false);

  const asphalt = bag();
  const concrete = bag();
  appendRoads(asphalt, concrete);
  for (const pillar of PILLARS) {
    appendBox(concrete, pillar.x, 3.55, pillar.z, 0.85, 7.1, 0.85, 0, 0xc8c3b8, false);
  }
  // Bridge deck visual along the raised hill span.
  appendBox(concrete, 33, 0.7, -264, 8, 1.2, 32, 0.18, 0xc8c3b8, false);

  const addMesh = (data: Bag, material: THREE.Material, shadow = true) => {
    const geo = toGeo(data);
    geos.push(geo);
    const mesh = new THREE.Mesh(geo, material);
    mesh.castShadow = shadow;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  };
  addMesh(buildings, buildingMat, !mobile);
  addMesh(roofs, concreteMat, false);
  addMesh(awnings, concreteMat, false);
  const homeMat = buildingMat.clone();
  homeMat.side = THREE.DoubleSide;
  mats.push(homeMat);
  addMesh(homeBag, homeMat, false);
  addMesh(asphalt, asphaltMat, false);
  addMesh(concrete, concreteMat, true);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(760, 760), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.08;
  ground.receiveShadow = true;
  scene.add(ground);
  geos.push(ground.geometry);

  const park = new THREE.Mesh(new THREE.CircleGeometry(PARK.r, 28), grassMat);
  park.rotation.x = -Math.PI / 2;
  park.position.set(PARK.x, 0.03, PARK.z);
  park.receiveShadow = true;
  scene.add(park);
  geos.push(park.geometry);

  const waterL = new THREE.Mesh(new THREE.PlaneGeometry(200, 36), waterMat);
  waterL.rotation.x = -Math.PI / 2;
  waterL.position.set(-80, -0.45, -270);
  const waterR = waterL.clone();
  waterR.position.x = 130;
  scene.add(waterL, waterR);
  geos.push(waterL.geometry);

  const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xa86b32, metalness: 0.82, roughness: 0.28 });
  mats.push(bronzeMat);
  for (const spec of [
    { h: 3.3, x: 0, z: 0 },
    { h: 2.2, x: 0.8, z: 0.4 },
    { h: 1.5, x: -0.7, z: 0.2 },
  ]) {
    const piece = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.5, spec.h, 6), bronzeMat);
    piece.position.set(PARK.x + spec.x - 4, spec.h / 2, PARK.z + spec.z);
    piece.castShadow = true;
    scene.add(piece);
    geos.push(piece.geometry);
  }

  const stallColors = [0xd4652f, 0xe0b15a, 0x1f4d3a, 0xf4ebd8, 0xc45c26, 0x3e6b52, 0x8d5a3b];
  for (let i = 0; i < 7; i++) {
    const x = -50 + i * 5.4;
    const cloth = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.12, 2.2),
      new THREE.MeshStandardMaterial({ color: stallColors[i], roughness: 0.7 }),
    );
    cloth.position.set(x, 1.7, -50);
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.7, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x6b4a32, roughness: 0.85 }),
    );
    table.position.set(x, 0.4, -50.4);
    cloth.castShadow = table.castShadow = true;
    scene.add(cloth, table);
    geos.push(cloth.geometry, table.geometry);
    mats.push(cloth.material, table.material);
  }

  const palmGeo = makePalm();
  geos.push(palmGeo);
  const treeSpots: { x: number; z: number; s: number }[] = [];
  for (const road of ROADS) {
    if (road.level === 1 || road.id === "ramat-ground") continue;
    const length = roadLength(road);
    for (let d = 18; d < length - 10; d += mobile ? 28 : 18) {
      const p = pointOnRoad(road, d);
      const side = d % 36 < 18 ? 1 : -1;
      const x = p.x + -p.tz * side * (road.width * 0.5 + 2.4);
      const z = p.z + p.tx * side * (road.width * 0.5 + 2.4);
      if (pointInSolid(x, z)) continue;
      if (x > -22 && x < -4 && z > 0 && z < 24) continue;
      treeSpots.push({ x, z, s: 0.85 + ((treeSpots.length * 17) % 5) * 0.08 });
    }
  }
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    treeSpots.push({
      x: PARK.x + Math.cos(a) * 14,
      z: PARK.z + Math.sin(a) * 12,
      s: 1.05,
    });
  }
  const palms = new THREE.InstancedMesh(palmGeo, palmMat, treeSpots.length);
  palms.castShadow = !mobile;
  palms.receiveShadow = true;
  const dummy = new THREE.Object3D();
  treeSpots.forEach((spot, i) => {
    dummy.position.set(spot.x, 0, spot.z);
    dummy.scale.setScalar(spot.s);
    dummy.rotation.y = i;
    dummy.updateMatrix();
    palms.setMatrixAt(i, dummy.matrix);
  });
  scene.add(palms);
  // Trunks read better with a second cheaper tint — the merged palm is one material.
  palmMat.color.set(0x3c6b3a);

  const agents: Agent[] = [
    { road: "hill", dist: 30, lane: 1, speed: 8, kind: "car", color: 0xc45c26 },
    { road: "hill", dist: 95, lane: -1, speed: -7, kind: "bus", color: 0xe0b15a },
    { road: "hill", dist: 150, lane: 1, speed: 9, kind: "okada", color: 0x1f4d3a },
    { road: "hill", dist: 210, lane: -1, speed: -6.5, kind: "car", color: 0x243044 },
    { road: "market", dist: 24, lane: 1, speed: 6.5, kind: "car", color: 0x6e8b74 },
    { road: "market", dist: 80, lane: -1, speed: -6, kind: "okada", color: 0xd4652f },
    { road: "market", dist: 140, lane: 1, speed: 7, kind: "bus", color: 0xf4ebd8 },
    { road: "ramat-ground", dist: 50, lane: 1, speed: 8, kind: "car", color: 0x355c8a },
    { road: "ramat-ground", dist: 170, lane: -1, speed: -9, kind: "car", color: 0x22262c },
    { road: "deck", dist: 30, lane: 0, speed: 11, kind: "car", color: 0xf4f1ea },
    { road: "deck", dist: 90, lane: 0, speed: 9, kind: "okada", color: 0xc45c26 },
  ];
  if (!mobile) {
    agents.push(
      { road: "hill", dist: 250, lane: 1, speed: 7.5, kind: "okada", color: 0x8d5a3b },
      { road: "ramat-ground", dist: 250, lane: 1, speed: 7, kind: "bus", color: 0xe0b15a },
      { road: "ramp-east", dist: 12, lane: 0, speed: -8, kind: "car", color: 0x1f4d3a },
    );
  }
  const byKind = {
    car: agents.filter((a) => a.kind === "car"),
    okada: agents.filter((a) => a.kind === "okada"),
    bus: agents.filter((a) => a.kind === "bus"),
  };
  const trafficMat = new THREE.MeshStandardMaterial({ roughness: 0.48, metalness: 0.22, vertexColors: false });
  mats.push(trafficMat);
  const trafficMesh: Record<Agent["kind"], THREE.InstancedMesh> = {
    car: new THREE.InstancedMesh(makeVehicleGeo("car"), trafficMat, Math.max(1, byKind.car.length)),
    okada: new THREE.InstancedMesh(makeVehicleGeo("okada"), trafficMat, Math.max(1, byKind.okada.length)),
    bus: new THREE.InstancedMesh(makeVehicleGeo("bus"), trafficMat, Math.max(1, byKind.bus.length)),
  };
  for (const kind of ["car", "okada", "bus"] as const) {
    geos.push(trafficMesh[kind].geometry);
    trafficMesh[kind].castShadow = !mobile;
    trafficMesh[kind].instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(trafficMesh[kind].count * 3), 3);
    scene.add(trafficMesh[kind]);
  }

  const peds: Ped[] = [];
  const pedCount = mobile ? 16 : 30;
  for (let i = 0; i < pedCount; i++) {
    peds.push({
      road: i % 2 === 0 ? "hill" : "market",
      dist: 12 + i * 19,
      side: i % 2 === 0 ? 1 : -1,
      speed: 0.85 + (i % 4) * 0.18,
      phase: i * 0.7,
      cloth: CLOTH[i % CLOTH.length],
      skin: SKIN[(i + 1) % SKIN.length],
    });
  }
  const bodyGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.85, 6);
  const headGeo = new THREE.SphereGeometry(0.2, 8, 6);
  geos.push(bodyGeo, headGeo);
  const pedBodyMat = new THREE.MeshStandardMaterial({ roughness: 0.7 });
  const pedHeadMat = new THREE.MeshStandardMaterial({ roughness: 0.65 });
  mats.push(pedBodyMat, pedHeadMat);
  const pedBody = new THREE.InstancedMesh(bodyGeo, pedBodyMat, peds.length);
  const pedHead = new THREE.InstancedMesh(headGeo, pedHeadMat, peds.length);
  pedBody.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(peds.length * 3), 3);
  pedHead.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(peds.length * 3), 3);
  peds.forEach((ped, i) => {
    color.setHex(ped.cloth);
    pedBody.setColorAt(i, color);
    color.setHex(ped.skin);
    pedHead.setColorAt(i, color);
  });
  scene.add(pedBody, pedHead);

  const lampGeo = new THREE.CylinderGeometry(0.06, 0.08, 4.2, 5);
  const bulbGeo = new THREE.SphereGeometry(0.16, 8, 6);
  geos.push(lampGeo, bulbGeo);
  const lampMat = new THREE.MeshStandardMaterial({ color: 0x2a2724, roughness: 0.6, metalness: 0.4 });
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0x33220f,
    emissive: 0xffb15a,
    emissiveIntensity: 0,
    roughness: 0.4,
  });
  mats.push(lampMat, bulbMat);
  const lampCount = mobile ? 18 : 32;
  const lamps = new THREE.InstancedMesh(lampGeo, lampMat, lampCount);
  const bulbs = new THREE.InstancedMesh(bulbGeo, bulbMat, lampCount);
  for (let i = 0; i < lampCount; i++) {
    const p = pointOnRoad(roadById("hill"), 20 + i * 16);
    const side = i % 2 === 0 ? 1 : -1;
    dummy.position.set(p.x + -p.tz * side * 6.4, 2.1, p.z + p.tx * side * 6.4);
    dummy.scale.set(1, 1, 1);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    lamps.setMatrixAt(i, dummy.matrix);
    dummy.position.y = 4.25;
    dummy.updateMatrix();
    bulbs.setMatrixAt(i, dummy.matrix);
  }
  scene.add(lamps, bulbs);

  function makeSign(text: string) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.Mesh();
    ctx.fillStyle = "#1a140f";
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = "#e0b15a";
    ctx.lineWidth = 8;
    ctx.strokeRect(6, 6, 500, 116);
    ctx.fillStyle = "#f4ebd8";
    ctx.font = "600 54px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 68);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    mats.push(mat);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 1.8), mat);
    geos.push(mesh.geometry);
    return mesh;
  }
  const signHill = makeSign("IKPOBA HILL");
  signHill.position.set(-4.2, 3.3, 36);
  const signMarket = makeSign("OREGBENI");
  signMarket.position.set(-36, 3.1, -24);
  signMarket.rotation.y = 0.4;
  const signPark = makeSign("RAMAT PARK");
  signPark.position.set(58, 3.2, -206);
  signPark.rotation.y = -0.6;
  const signDeck = makeSign("FLYOVER DECK");
  signDeck.position.set(8, 9.3, -169.2);
  scene.add(signHill, signMarket, signPark, signDeck);

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(480, 24, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uElev: { value: 0.4 },
        uSun: { value: new THREE.Vector3(0.2, 0.6, 0.2) },
        uRain: { value: 0 },
      },
      vertexShader: `
        varying vec3 vDir;
        void main() {
          vec4 w = modelMatrix * vec4(position, 1.0);
          vDir = position;
          gl_Position = projectionMatrix * viewMatrix * w;
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec3 vDir;
        uniform float uElev;
        uniform vec3 uSun;
        uniform float uRain;
        vec3 lin(vec3 c){ return pow(max(c, vec3(0.0)), vec3(2.2)); }
        void main() {
          vec3 dir = normalize(vDir);
          float h = clamp(dir.y, 0.0, 1.0);
          float day = clamp(uElev, 0.0, 1.0);
          vec3 zenith = mix(lin(vec3(0.07, 0.09, 0.16)), lin(vec3(0.34, 0.58, 0.86)), day);
          vec3 horizon = mix(lin(vec3(0.95, 0.48, 0.22)), lin(vec3(0.95, 0.78, 0.58)), day);
          if (uElev < 0.05) {
            zenith = lin(vec3(0.03, 0.04, 0.08));
            horizon = lin(vec3(0.33, 0.16, 0.1));
          }
          vec3 col = mix(horizon, zenith, pow(h, 0.55));
          col = mix(col, lin(vec3(0.45, 0.48, 0.52)), uRain * 0.55);
          float sun = pow(max(dot(dir, normalize(uSun)), 0.0), mix(280.0, 1400.0, day));
          col += lin(vec3(1.0, 0.82, 0.55)) * sun * (1.0 - uRain * 0.7);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    }),
  );
  scene.add(sky);
  geos.push(sky.geometry);
  const skyMat = sky.material as THREE.ShaderMaterial;

  const rain = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0xc5d0d8, size: 0.08, transparent: true, opacity: 0.55, depthWrite: false }),
  );
  const rainPositions = new Float32Array((mobile ? 700 : 1400) * 3);
  for (let i = 0; i < rainPositions.length; i += 3) {
    rainPositions[i] = (Math.random() - 0.5) * 50;
    rainPositions[i + 1] = Math.random() * 24;
    rainPositions[i + 2] = (Math.random() - 0.5) * 50;
  }
  rain.geometry.setAttribute("position", new THREE.BufferAttribute(rainPositions, 3));
  scene.add(rain);
  geos.push(rain.geometry);
  mats.push(rain.material as THREE.Material);

  const marker = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 6, 6),
    new THREE.MeshBasicMaterial({ color: 0xe0b15a, transparent: true, opacity: 0.85 }),
  );
  marker.visible = false;
  scene.add(marker);
  geos.push(marker.geometry);
  mats.push(marker.material as THREE.Material);

  const skinMat = new THREE.MeshStandardMaterial({ color: 0x5c3a28, roughness: 0.62 });
  const clothMat = new THREE.MeshStandardMaterial({ color: 0xd4652f, roughness: 0.72 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x241812, roughness: 0.5 });
  mats.push(skinMat, clothMat, darkMat);
  const avatar = new THREE.Group();
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.55, 0.24), clothMat);
  torso.position.y = 1.05;
  torso.castShadow = true;
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), skinMat);
  skull.position.y = 1.5;
  skull.castShadow = true;
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.155, 10, 8), darkMat);
  hair.position.y = 1.58;
  hair.scale.y = 0.65;
  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.46, 0.1), skinMat);
  const armR = armL.clone();
  armL.position.set(-0.28, 1.05, 0);
  armR.position.set(0.28, 1.05, 0);
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.52, 0.12), darkMat);
  const legR = legL.clone();
  legL.position.set(-0.12, 0.48, 0);
  legR.position.set(0.12, 0.48, 0);
  legL.geometry.translate(0, -0.26, 0);
  legL.position.y = 0.74;
  legR.geometry = legL.geometry;
  legR.position.y = 0.74;
  avatar.add(torso, skull, hair, armL, armR, legL, legR);
  avatar.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh) mesh.castShadow = true;
  });
  scene.add(avatar);

  const partnerCloth = new THREE.MeshStandardMaterial({ color: 0x1f4d3a, roughness: 0.68 });
  const partnerGold = new THREE.MeshStandardMaterial({ color: 0xe0b15a, metalness: 0.55, roughness: 0.35 });
  mats.push(partnerCloth, partnerGold);
  const partner = new THREE.Group();
  const partnerTorso = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.58, 0.22), partnerCloth);
  partnerTorso.position.y = 1.08;
  const partnerHead = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), skinMat);
  partnerHead.position.y = 1.52;
  const partnerWrap = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.46, 0.28), partnerCloth);
  partnerWrap.position.y = 0.7;
  const partnerEar = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.04), partnerGold);
  partnerEar.position.set(0.16, 1.5, 0.08);
  partner.add(partnerTorso, partnerHead, partnerWrap, partnerEar);
  partner.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh) mesh.castShadow = true;
  });
  scene.add(partner);

  function rideGroup(kind: Ride) {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(makeVehicleGeo(kind === "okada" ? "okada" : "car"), trafficMat);
    mesh.castShadow = true;
    group.add(mesh);
    if (kind === "car") group.scale.set(0.95, 0.95, 0.95);
    return group;
  }
  const parkedOkada = rideGroup("okada");
  const parkedCar = rideGroup("car");
  const rideOkada = rideGroup("okada");
  const rideCar = rideGroup("car");
  scene.add(parkedOkada, parkedCar, rideOkada, rideCar);
  const head = new THREE.SpotLight(0xfff1d0, 0, 30, Math.PI / 5.2, 0.45, 1);
  head.castShadow = false;
  const headTarget = new THREE.Object3D();
  head.target = headTarget;
  scene.add(head, headTarget);
  const roomLamp = new THREE.PointLight(0xffc48a, 0.85, 16, 1.5);
  roomLamp.position.set(-14, 2.55, 11);
  scene.add(roomLamp);

  let momentUntil = 0;
  let hudAcc = 0;
  let saveAcc = 0;
  let elapsed = 0;
  let dragging = false;
  let lastX = 0;
  const fogHot = new THREE.Color(0xe2b184);
  const fogNight = new THREE.Color(0x1a120e);
  const fogRain = new THREE.Color(0x8d9394);
  const camPos = new THREE.Vector3(30, 16, -140);
  const look = new THREE.Vector3();
  const sunVec = new THREE.Vector3();
  const desired = new THREE.Vector3();
  const ahead = new THREE.Vector3();
  const timer = new THREE.Timer();
  timer.connect(document);

  const mapCtx = minimap?.getContext("2d") ?? null;
  const mapBuffer = document.createElement("canvas");
  mapBuffer.width = 320;
  mapBuffer.height = 320;
  const mapBase = mapBuffer.getContext("2d");
  if (mapBase) {
    mapBase.fillStyle = "#1a140f";
    mapBase.fillRect(0, 0, 320, 320);
    const project = (x: number, z: number) => ({
      x: 12 + ((x + 170) / 350) * 296,
      y: 12 + ((z + 310) / 380) * 296,
    });
    mapBase.strokeStyle = "#3a3128";
    mapBase.lineWidth = 10;
    for (const road of ROADS) {
      mapBase.beginPath();
      road.points.forEach((p, i) => {
        const q = project(p.x, p.z);
        if (i === 0) mapBase.moveTo(q.x, q.y);
        else mapBase.lineTo(q.x, q.y);
      });
      mapBase.strokeStyle = road.level === 1 ? "#e0b15a" : "#8a8175";
      mapBase.lineWidth = road.level === 1 ? 4 : 7;
      mapBase.stroke();
    }
    const parkP = project(PARK.x, PARK.z);
    mapBase.fillStyle = "#3e6b52";
    mapBase.beginPath();
    mapBase.arc(parkP.x, parkP.y, 16, 0, Math.PI * 2);
    mapBase.fill();
  }

  function say(text: string) {
    sim.flags = { ...sim.flags };
    momentUntil = elapsed + 4.4;
    publish(true, text);
  }

  function objective() {
    if (sim.job?.id === "errand" && sim.job.stage === 0) return "Pick up Mama Eki’s parcel in Oregbeni.";
    if (sim.job?.id === "errand") return "Walk the parcel back to your gate on the hill.";
    if (sim.job?.id === "fare" && sim.job.stage === 0) return "Collect the passenger at Oregbeni — on the okada.";
    if (sim.job?.id === "fare") return "Drop them at Ramat Park. Adesuwa raises the fare if she is riding and not strained.";
    if (sim.social.promise === "rice") return "Adesuwa asked for rice, not cash. Mama Eki sells the plate.";
    if (sim.social.promise === "clear") return "Stay off Night Line until morning. She will hear the park.";
    if (sim.social.heat >= 58) return "Heat is high. The slope task force does not write receipts.";
    if (sim.debt > 0) return "The ledger is behind on rent. Pay it in the room.";
    if (!sim.flags.paidRent) return "Pay today’s rent, or earn it before the hill starts talking.";
    if (!sim.flags.didJob) return "The Oregbeni notice board is still the honest way to be seen.";
    if (sim.social.partner === "none") return "Adesuwa is beside the board. How you speak writes the city.";
    if (!sim.flags.reachedRamat) return "The corridor runs to Ramat. The deck is not the ground road.";
    if (!sim.flags.sawRain) return "Evening rain changes the hill. Wait, or call it from the phone.";
    return "Union, market, guild, Night Line. Only one of them should love you.";
  }

  function publish(force = false, moment: string | null = null) {
    hudAcc += force ? 1 : 0;
    if (!force && hudAcc < 0.12) return;
    hudAcc = 0;
    const prompt = currentPrompt();
    useHud.getState().patch({
      ready: true,
      error: null,
      phase: sim.phase,
      panel: sim.panel,
      name: sim.name,
      background: sim.background,
      naira: Math.round(sim.naira),
      day: sim.day,
      minutes: sim.minutes,
      hunger: sim.hunger,
      energy: sim.energy,
      debt: sim.debt,
      place: placeName(sim.px, sim.pz, sim.py),
      prompt: prompt?.label ?? null,
      objective: objective(),
      moment: moment ?? (elapsed < momentUntil ? useHud.getState().moment : null),
      speed: sim.mode === "drive" ? sim.speed : sim.footSpeed,
      mode: sim.mode,
      ride: sim.ride,
      fuel: sim.fuel,
      raining: sim.raining,
      muted: sim.muted,
      px: sim.px,
      pz: sim.pz,
      yaw: sim.yaw,
      inv: { ...sim.inv },
      skill: sim.skill,
      rel: sim.rel,
      flags: sim.flags,
      job: sim.job ? { ...sim.job } : null,
      stallStep: sim.stallStep,
      stallProfit: sim.stallProfit,
      home: sim.home,
      rentDue: ECON.rent,
      carUnlocked: sim.carUnlocked,
      social: { ...sim.social, respect: { ...sim.social.respect } },
      reelT: sim.reelT,
    });
  }

  function dist2(x: number, z: number) {
    return Math.hypot(sim.px - x, sim.pz - z);
  }

  function currentPrompt(): { id: string; label: string } | null {
    if (sim.phase !== "play" || sim.panel) return null;
    if (sim.job?.id === "errand" && sim.job.stage === 0 && dist2(MAMA.x, MAMA.z) < 2.8)
      return { id: "errand-pick", label: "E · Take the parcel" };
    if (sim.job?.id === "errand" && sim.job.stage === 1 && dist2(ERRAND_DROP.x, ERRAND_DROP.z) < 2.6)
      return { id: "errand-drop", label: "E · Deliver the parcel" };
    if (sim.job?.id === "fare" && sim.job.stage === 0 && dist2(FARE_PICK.x, FARE_PICK.z) < 3 && sim.ride === "okada")
      return { id: "fare-pick", label: "E · Passenger on" };
    if (sim.job?.id === "fare" && sim.job.stage === 0 && dist2(FARE_PICK.x, FARE_PICK.z) < 3)
      return { id: "fare-need", label: "Come back on the okada" };
    if (sim.job?.id === "fare" && sim.job.stage === 1 && dist2(FARE_DROP.x, FARE_DROP.z) < 4 && sim.ride === "okada")
      return { id: "fare-drop", label: "E · Drop passenger" };
    if (sim.social.promise === "rice" && sim.inv.rice > 0 && dist2(ADESUWA.x, ADESUWA.z) < 2.7)
      return { id: "rice", label: "E · Give Adesuwa the rice" };
    if (dist2(ADESUWA.x, ADESUWA.z) < 2.7)
      return {
        id: sim.social.partner === "none" ? "adesuwa" : "adesuwa-known",
        label: sim.social.partner === "none" ? "E · Speak with Adesuwa" : "E · Adesuwa",
      };
    if (dist2(UNION_YARD.x, UNION_YARD.z) < 2.8) return { id: "union", label: "E · Hill Union" };
    if (dist2(NIGHT_CORNER.x, NIGHT_CORNER.z) < 3.1) return { id: "night", label: "E · Night Line" };
    if (sim.mode === "drive") {
      if (dist2(FUEL.x, FUEL.z) < 3.2) return { id: "fuel", label: "E · Fill up · ₦400" };
      return { id: "dismount", label: "F · Step off" };
    }
    if (dist2(sim.okada.x, sim.okada.z) < 2.8 && sim.ride !== "okada")
      return { id: "mount-okada", label: "F · Take the okada" };
    if (dist2(sim.car.x, sim.car.z) < 3 && sim.ride !== "car")
      return {
        id: sim.carUnlocked ? "mount-car" : "hire-car",
        label: sim.carUnlocked ? "F · Take the car" : "F · Hire the car · ₦500",
      };
    const spots: { id: string; label: string; x: number; z: number; r: number }[] = [
      { id: "bed", label: sim.home === "hill" ? "E · Sleep" : "E · This room was let go", x: -16.2, z: 15.4, r: 1.8 },
      { id: "bed-ramat", label: sim.home === "ramat" ? "E · Sleep" : "E · Not your bed", x: 52, z: -202, r: 1.8 },
      { id: "ledger", label: "E · Rent ledger", x: -12.2, z: 6.2, r: 1.7 },
      { id: "mama", label: "E · Mama Eki", x: MAMA.x, z: MAMA.z, r: 2.5 },
      { id: "board", label: "E · Notice board", x: BOARD.x, z: BOARD.z, r: 2.3 },
      { id: "drain", label: sim.flags.reportedDrain ? "Drain logged" : "E · Report the drain", x: DRAIN.x, z: DRAIN.z, r: 2.2 },
      { id: "heritage", label: "E · Bronze Shade", x: HERITAGE.x, z: HERITAGE.z, r: 2.6 },
      { id: "park", label: "E · Sit a minute", x: PARK.x - 2, z: PARK.z + 2, r: 3.4 },
      { id: "room", label: "E · Look at the Ramat room", x: 46, z: -199, r: 2.4 },
      { id: "kiosk", label: sim.flags.ranStall ? "Kiosk closed" : "E · Mind the kiosk", x: KIOSK.x, z: KIOSK.z, r: 2.3 },
      { id: "fuel", label: "E · Fill-up kiosk", x: FUEL.x, z: FUEL.z, r: 2.4 },
    ];
    for (const spot of spots) {
      if (dist2(spot.x, spot.z) <= spot.r) return spot;
    }
    return null;
  }

  function openPanel(panel: Panel) {
    sim.panel = panel;
    publish(true);
  }

  function snapshot(): SaveData {
    return {
      version: 2,
      name: sim.name,
      background: sim.background,
      skin: sim.skin,
      cloth: sim.cloth,
      naira: sim.naira,
      day: sim.day,
      minutes: sim.minutes,
      hunger: sim.hunger,
      energy: sim.energy,
      debt: sim.debt,
      rentPaidDay: sim.rentPaidDay,
      home: sim.home,
      inv: { ...sim.inv },
      skill: sim.skill,
      rel: sim.rel,
      flags: { ...sim.flags },
      job: sim.job ? { ...sim.job } : null,
      px: sim.px,
      py: sim.py,
      pz: sim.pz,
      yaw: sim.yaw,
      mode: sim.mode,
      ride: sim.ride,
      fuel: sim.fuel,
      carUnlocked: sim.carUnlocked,
      raining: sim.raining,
      okada: { ...sim.okada },
      car: { ...sim.car },
      social: { ...sim.social, respect: { ...sim.social.respect } },
    };
  }

  function applySave(data: SaveData) {
    Object.assign(sim, {
      ...data,
      flags: { ...data.flags },
      inv: { ...data.inv },
      job: data.job ? { ...data.job } : null,
      okada: { ...data.okada },
      car: { ...data.car },
      phase: "play" as const,
      panel: null,
      footSpeed: 0,
      speed: data.mode === "drive" ? 4 : 0,
      stallStep: 0,
      stallProfit: 0,
      haggle: false,
      dryWarned: false,
      edgeTold: false,
      shake: 0,
      autoRainDay: data.raining ? data.day : -1,
      camOff: 0,
      muted: sim.muted,
      walkPhase: 0,
      social: data.social
        ? { ...data.social, respect: { ...data.social.respect } }
        : defaultSocial(),
      reelT: 0,
      reelBeat: -1,
    });
    dress();
  }

  function dress() {
    skinMat.color.setHex(SKIN[sim.skin] ?? SKIN[1]);
    clothMat.color.setHex(CLOTH[sim.cloth] ?? CLOTH[0]);
  }

  function spawnFresh(cfg: NewGameCfg) {
    const next = freshSim();
    Object.assign(sim, next);
    sim.name = cfg.name.trim() || "Osaze";
    sim.background = cfg.background;
    sim.skin = cfg.skin;
    sim.cloth = cfg.cloth;
    sim.phase = "play";
    sim.minutes = 6 * 60 + 50;
    sim.naira = cfg.background === "trader" ? 27000 : cfg.background === "apprentice" ? 11000 : 16000;
    sim.carUnlocked = cfg.background === "trader";
    sim.skill = cfg.background === "apprentice" ? 1 : 0;
    sim.px = HILL_SPAWN.x;
    sim.pz = HILL_SPAWN.z;
    sim.py = 0;
    sim.yaw = HILL_SPAWN.yaw;
    biasForBackground(sim.social, cfg.background);
    dress();
  }

  const api: GameApi = {
    startNew(cfg) {
      audio.unlock();
      spawnFresh(cfg);
      say("Morning on Ikpoba Hill. Rent is real, the market has a memory, and four names already share the road.");
      writeSave(snapshot());
    },
    continueGame() {
      const saved = loadSave();
      if (!saved) return false;
      audio.unlock();
      applySave(saved);
      say(`Day ${sim.day}. You are back on the hill.`);
      publish(true);
      return true;
    },
    togglePause() {
      if (sim.phase === "reel") {
        sim.phase = "title";
        sim.raining = false;
        publish(true);
        return;
      }
      if (sim.phase === "title") return;
      if (sim.panel && sim.phase === "play") {
        sim.panel = null;
        publish(true);
        return;
      }
      sim.phase = sim.phase === "pause" ? "play" : "pause";
      if (sim.phase === "pause") writeSave(snapshot());
      publish(true);
    },
    closePanel() {
      sim.panel = null;
      publish(true);
    },
    openPhone() {
      if (sim.phase === "title") return;
      sim.panel = sim.panel === "phone" ? null : "phone";
      sim.phase = "play";
      publish(true);
    },
    openMap() {
      if (sim.phase === "title") return;
      sim.panel = sim.panel === "map" ? null : "map";
      sim.phase = "play";
      publish(true);
    },
    buy(id: GoodId) {
      if (id === "rice" && mamaRefusesRice(sim.social)) {
        say("Mama Eki looks through you. Night Line is on your name. She has no rice for you.");
        return;
      }
      const good = GOODS[id];
      const price = Math.round(good.price * (sim.haggle ? 0.8 : 1));
      if (sim.naira < price) {
        say("That is more than you are holding.");
        return;
      }
      sim.naira -= price;
      sim.inv[id] += 1;
      sim.flags = { ...sim.flags, boughtFood: true };
      sim.haggle = false;
      sim.rel = Math.min(8, sim.rel + 1);
      audio.coin();
      say(`${good.name} is yours. ₦${price.toLocaleString("en-NG")}. Prices here are game rates.`);
    },
    haggle() {
      if (!allowHaggle(sim.social, sim.rel, sim.skill)) {
        say("Mama Eki smiles. Come back when she knows your face, after practice, or with Adesuwa warm.");
        return;
      }
      sim.haggle = true;
      say("Last price. Twenty percent off the next thing you pick up.");
    },
    useItem(id: GoodId) {
      if (sim.inv[id] <= 0) return;
      const good = GOODS[id];
      sim.inv[id] -= 1;
      sim.hunger = clamp(sim.hunger - good.hunger, 0, 100);
      sim.energy = clamp(sim.energy + good.energy, 0, 100);
      say(`You take the ${good.name.toLowerCase()}.`);
    },
    acceptJob(id) {
      if (sim.job) {
        say("Finish the one you already took.");
        return;
      }
      sim.job = { id, stage: 0 };
      sim.panel = null;
      say(id === "errand" ? "Mama Eki has a parcel. It is a short walk back up the hill." : "A passenger is waiting by Oregbeni. Okada only.");
    },
    payRent() {
      if (sim.rentPaidDay >= sim.day && sim.debt <= 0) {
        say("The ledger is already clear for today.");
        return;
      }
      const due = ECON.rent + sim.debt;
      if (sim.naira < due) {
        say(`You need ₦${due.toLocaleString("en-NG")} to clear it.`);
        return;
      }
      sim.naira -= due;
      sim.debt = 0;
      sim.rentPaidDay = sim.day;
      sim.flags = { ...sim.flags, paidRent: true };
      audio.coin();
      say("Rent is marked. The room is yours for the day.");
      sim.panel = null;
    },
    sleep() {
      const here = sim.home === "hill" ? dist2(-16.2, 15.4) < 2.4 : dist2(52, -202) < 2.4;
      if (!here) {
        say("Sleep happens in your own room.");
        return;
      }
      if (sim.rentPaidDay < sim.day) sim.debt += ECON.rent;
      sim.day += 1;
      sim.minutes = 6 * 60 + 40;
      sim.hunger = clamp(sim.hunger + 26, 0, 100);
      sim.energy = 100;
      sim.raining = false;
      sim.autoRainDay = -1;
      sim.flags = { ...sim.flags, practisedToday: false };
      const broken = sleepSocial(sim.social);
      const spawn = sim.home === "hill" ? HILL_SPAWN : RAMAT_SPAWN;
      sim.px = spawn.x;
      sim.pz = spawn.z;
      sim.py = 0;
      sim.yaw = spawn.yaw;
      sim.mode = "foot";
      sim.ride = null;
      sim.speed = 0;
      sim.panel = null;
      sim.phase = "play";
      writeSave(snapshot());
      say(broken ?? `Day ${sim.day}. The hill is awake again.`);
    },
    reportDrain() {
      if (sim.flags.reportedDrain) {
        say("The ward desk already has it. This desk is part of the game, not a government service.");
        return;
      }
      sim.flags = { ...sim.flags, reportedDrain: true };
      sim.rel = Math.min(8, sim.rel + 1);
      say("Logged with the fictional ward desk. A crew may clear it in a later day.");
    },
    practise() {
      sim.flags = { ...sim.flags, readHeritage: true };
      if (sim.flags.practisedToday) {
        say("Enough wax for today. Come back after you sleep.");
        return;
      }
      sim.flags = { ...sim.flags, apprenticed: true, readHeritage: true, practisedToday: true };
      sim.skill += 1;
      sim.naira += ECON.practice;
      audio.coin();
      sim.panel = null;
      say("You practise a pour. The real guilds are on Igun Street — this stall only teaches the rhythm.");
    },
    moveHome() {
      if (sim.home === "ramat") {
        say("You already keep the key to the Ramat room.");
        return;
      }
      if (sim.naira < ECON.ramat) {
        say(`The deposit is ₦${ECON.ramat.toLocaleString("en-NG")}. A game rate, not a city listing.`);
        return;
      }
      sim.naira -= ECON.ramat;
      sim.home = "ramat";
      sim.flags = { ...sim.flags, movedHome: true };
      sim.px = RAMAT_SPAWN.x;
      sim.pz = RAMAT_SPAWN.z;
      sim.yaw = RAMAT_SPAWN.yaw;
      sim.panel = null;
      audio.coin();
      say("The hill room is let go. You wake nearer the park from now on.");
      writeSave(snapshot());
    },
    stallChoice(kind) {
      const pay = kind === "fair" ? 220 : kind === "low" ? 90 : 0;
      sim.stallProfit += pay;
      sim.stallStep += 1;
      if (kind === "high") say("They walk. Margin is not the same thing as a sale.");
      else say(kind === "fair" ? "Fair price. They pay and go." : "They buy, and your margin is thin.");
      if (sim.stallStep >= 3) {
        sim.naira += sim.stallProfit;
        sim.flags = { ...sim.flags, ranStall: true };
        audio.coin();
        say(`The kiosk clears ₦${sim.stallProfit.toLocaleString("en-NG")} for the hour.`);
        sim.stallStep = 0;
        sim.stallProfit = 0;
        sim.panel = null;
      } else publish(true);
    },
    refuel() {
      if (sim.naira < ECON.fuel) {
        say("The kiosk wants ₦400.");
        return;
      }
      sim.naira -= ECON.fuel;
      sim.fuel = 100;
      sim.dryWarned = false;
      audio.coin();
      say("Tank is full. Game price, not a pump price.");
    },
    setRain(on) {
      sim.raining = on;
      if (on) {
        sim.flags = { ...sim.flags, sawRain: true };
        sim.autoRainDay = sim.day;
        say("Rain on the hill. The ramp is slicker, and the ground road is still there.");
      } else {
        sim.autoRainDay = sim.day;
        say("The rain moves off.");
      }
    },
    setHour(minutes) {
      sim.minutes = minutes;
      const elevNight = minutes > 19.5 * 60 || minutes < 5.5 * 60;
      if (minutes >= 17 * 60 && minutes <= 18.5 * 60) say("Golden hour. Take the deck if you want the whole junction in one glance.");
      else if (elevNight) say("The windows come on. Headlights matter on the deck.");
      else say("The hour shifts. The roads do not.");
    },
    toggleMute() {
      sim.muted = !sim.muted;
      audio.setMuted(sim.muted);
      publish(true);
    },
    sit() {
      sim.energy = clamp(sim.energy + 12, 0, 100);
      sim.panel = null;
      say("Ramat Park. The flyover’s shadow crosses the grass. After dark this lawn answers to Night Line.");
    },
    meetPartner(tone) {
      if (dist2(ADESUWA.x, ADESUWA.z) > 3.4) {
        say("Adesuwa stands by the notice board.");
        return;
      }
      if (sim.social.partner === "adesuwa") {
        say(
          sim.social.mood === "strained"
            ? "She turns half away. Strained is not a conversation you can restart with charm."
            : `She is ${sim.social.mood}. Loyalty ${Math.round(sim.social.loyalty)}. The promise is ${sim.social.promise}.`,
        );
        return;
      }
      say(applyMeet(sim.social, tone));
      sim.panel = null;
    },
    sideJob(id) {
      const spot = id === "union" ? UNION_YARD : id === "night" ? NIGHT_CORNER : HERITAGE;
      if (dist2(spot.x, spot.z) > 3.6) {
        say("You are not standing on their ground.");
        return;
      }
      if (id === "guild" && sim.naira < 200) {
        say("Wax for the pour is ₦200.");
        return;
      }
      const result = applySide(sim.social, id);
      sim.naira = Math.max(0, sim.naira + result.pay);
      if (id === "guild") {
        sim.skill += 1;
        sim.flags = { ...sim.flags, apprenticed: true, readHeritage: true };
      }
      audio.coin();
      sim.panel = null;
      say(result.line);
    },
    partnerCall() {
      say(applyCall(sim.social));
    },
    giveRice() {
      if (dist2(ADESUWA.x, ADESUWA.z) > 3.4) {
        say("She is not here to take a plate.");
        return;
      }
      if (sim.inv.rice <= 0) {
        say("Rice, from Mama Eki. Cash will not close this promise.");
        return;
      }
      const line = applyRice(sim.social);
      if (!line) {
        say("She did not ask for rice.");
        return;
      }
      sim.inv.rice -= 1;
      sim.panel = null;
      say(line);
    },
    playReel() {
      audio.unlock();
      sim.phase = "reel";
      sim.panel = null;
      sim.reelT = 0;
      sim.reelBeat = -1;
      sim.raining = false;
      sim.minutes = 7 * 60;
      publish(true, "Ikpoba Hill. Rent is due before pride.");
    },
    skipReel() {
      if (sim.phase !== "reel") return;
      sim.phase = "title";
      sim.raining = false;
      sim.reelT = 0;
      publish(true);
    },
  };

  function interact() {
    const prompt = currentPrompt();
    if (!prompt) return;
    if (prompt.id === "mama") openPanel("shop");
    else if (prompt.id === "board") openPanel("jobs");
    else if (prompt.id === "heritage") openPanel("heritage");
    else if (prompt.id === "adesuwa" || prompt.id === "adesuwa-known") openPanel("partner");
    else if (prompt.id === "union" || prompt.id === "night") openPanel("factions");
    else if (prompt.id === "rice") api.giveRice();
    else if (prompt.id === "room") openPanel("room");
    else if (prompt.id === "ledger") openPanel("ledger");
    else if (prompt.id === "bed" || prompt.id === "bed-ramat") {
      if ((prompt.id === "bed" && sim.home === "hill") || (prompt.id === "bed-ramat" && sim.home === "ramat")) openPanel("sleep");
      else say(prompt.id === "bed" ? "You let the hill room go." : "Pay the deposit before you sleep here.");
    } else if (prompt.id === "kiosk" && !sim.flags.ranStall) {
      sim.stallStep = 0;
      sim.stallProfit = 0;
      openPanel("stall");
    } else if (prompt.id === "drain") api.reportDrain();
    else if (prompt.id === "park") api.sit();
    else if (prompt.id === "fuel") api.refuel();
    else if (prompt.id === "errand-pick" && sim.job) {
      sim.job = { id: "errand", stage: 1 };
      say("Parcel under your arm. The gate is back up the slope.");
    } else if (prompt.id === "errand-drop" && sim.job) {
      sim.job = null;
      sim.naira += ECON.errand;
      sim.flags = { ...sim.flags, didJob: true };
      audio.coin();
      say(`Delivered. Mama Eki sends ₦${ECON.errand.toLocaleString("en-NG")}.`);
    } else if (prompt.id === "fare-pick" && sim.job) {
      sim.job = { id: "fare", stage: 1 };
      say("They sit. Ramat Park. Mind the ramp if the deck is the quicker line.");
    } else if (prompt.id === "fare-drop" && sim.job) {
      sim.job = null;
      const pay = Math.round(ECON.fare * fareBonus(sim.social));
      sim.naira += pay;
      sim.flags = { ...sim.flags, didJob: true, reachedRamat: true };
      audio.coin();
      const bonus = pay > ECON.fare ? " Adesuwa’s name was in the price." : "";
      say(`Fare paid, ₦${pay.toLocaleString("en-NG")}.${bonus}`);
    }
  }

  function tryMount() {
    if (sim.phase !== "play" || sim.panel) return;
    if (sim.mode === "drive") {
      const ride = sim.ride === "car" ? sim.car : sim.okada;
      ride.x = sim.px;
      ride.z = sim.pz;
      ride.yaw = sim.yaw;
      const rx = Math.cos(sim.yaw);
      const rz = -Math.sin(sim.yaw);
      sim.px += rx * 1.35;
      sim.pz += rz * 1.35;
      sim.mode = "foot";
      sim.ride = null;
      sim.speed = 0;
      sim.footSpeed = 0;
      say("You step off.");
      return;
    }
    if (dist2(sim.okada.x, sim.okada.z) < 2.8) {
      sim.mode = "drive";
      sim.ride = "okada";
      sim.yaw = sim.okada.yaw;
      sim.px = sim.okada.x;
      sim.pz = sim.okada.z;
      sim.speed = 0;
      say("Okada. A turns left, D turns right. The deck and the ground road are not the same street.");
      return;
    }
    if (dist2(sim.car.x, sim.car.z) < 3) {
      if (!sim.carUnlocked) {
        if (sim.naira < ECON.hire) {
          say("Hire is ₦500 for the day.");
          return;
        }
        sim.naira -= ECON.hire;
        sim.carUnlocked = true;
        audio.coin();
      }
      sim.mode = "drive";
      sim.ride = "car";
      sim.yaw = sim.car.yaw;
      sim.px = sim.car.x;
      sim.pz = sim.car.z;
      sim.speed = 0;
      say("Car is yours until you step off. Heavier in the rain.");
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
    if (e.repeat) {
      keys.add(e.code);
      return;
    }
    keys.add(e.code);
    if (sim.phase === "play" && !sim.panel) {
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
      if (e.code === "KeyE") pad.interact = true;
      if (e.code === "KeyF") pad.mount = true;
      if (e.code === "Space") pad.horn = true;
    }
    if (e.code === "Escape") api.togglePause();
    if (e.code === "KeyM") api.openMap();
    if (e.code === "KeyI") api.openPhone();
  }
  function onKeyUp(e: KeyboardEvent) {
    keys.delete(e.code);
  }
  function onBlur() {
    keys.clear();
    pad.joy = false;
    pad.run = false;
  }
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);
  disposers.push(() => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);
  });

  const onPointerDown = (e: PointerEvent) => {
    audio.unlock();
    if (e.button !== 0 && e.button !== 2) return;
    dragging = true;
    lastX = e.clientX;
    view.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    sim.camOff -= dx * 0.005;
  };
  const onPointerUp = () => {
    dragging = false;
  };
  view.addEventListener("pointerdown", onPointerDown);
  view.addEventListener("pointermove", onPointerMove);
  view.addEventListener("pointerup", onPointerUp);
  view.addEventListener("pointercancel", onPointerUp);
  view.addEventListener("contextmenu", (e) => e.preventDefault());
  disposers.push(() => {
    view.removeEventListener("pointerdown", onPointerDown);
    view.removeEventListener("pointermove", onPointerMove);
    view.removeEventListener("pointerup", onPointerUp);
    view.removeEventListener("pointercancel", onPointerUp);
  });

  function resize() {
    const w = view.clientWidth || window.innerWidth;
    const h = view.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  }
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(view.parentElement ?? view);
  disposers.push(() => resizeObserver.disconnect());

  function stepAgents(dt: number) {
    for (const agent of agents) {
      const road = roadById(agent.road);
      const length = roadLength(road);
      agent.dist = (agent.dist + agent.speed * dt + length) % length;
    }
    for (const ped of peds) {
      const road = roadById(ped.road);
      const length = roadLength(road);
      ped.dist += ped.speed * dt;
      ped.phase += dt * 4;
      if (ped.dist > length - 8 || ped.dist < 8) ped.speed *= -1;
      ped.dist = clamp(ped.dist, 8, length - 8);
    }
  }

  function writeAgents() {
    const counters = { car: 0, okada: 0, bus: 0 };
    for (const agent of agents) {
      const road = roadById(agent.road);
      const p = pointOnRoad(road, agent.dist);
      const side = agent.lane === 0 ? 0 : agent.lane;
      const x = p.x + -p.tz * side * 1.7;
      const z = p.z + p.tx * side * 1.7;
      const facing = yawFromTangent(p.tx * Math.sign(agent.speed || 1), p.tz * Math.sign(agent.speed || 1));
      dummy.position.set(x, p.y, z);
      dummy.rotation.set(0, facing + Math.PI, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      const mesh = trafficMesh[agent.kind];
      const index = counters[agent.kind]++;
      mesh.setMatrixAt(index, dummy.matrix);
      color.setHex(agent.color);
      mesh.setColorAt(index, color);
      if (sim.mode === "drive" && Math.hypot(sim.px - x, sim.pz - z) < 2.15 && Math.abs(sim.speed) > 4) {
        sim.speed *= 0.42;
        sim.shake = 0.45;
        audio.thud();
      }
    }
    for (const kind of ["car", "okada", "bus"] as const) {
      trafficMesh[kind].instanceMatrix.needsUpdate = true;
      if (trafficMesh[kind].instanceColor) trafficMesh[kind].instanceColor.needsUpdate = true;
    }
    for (let i = 0; i < peds.length; i++) {
      const ped = peds[i];
      const road = roadById(ped.road);
      const p = pointOnRoad(road, ped.dist);
      const x = p.x + -p.tz * ped.side * (road.width * 0.5 + 1.7);
      const z = p.z + p.tx * ped.side * (road.width * 0.5 + 1.7);
      const bob = Math.sin(ped.phase) * 0.06;
      const facing = yawFromTangent(p.tx * Math.sign(ped.speed), p.tz * Math.sign(ped.speed));
      dummy.position.set(x, 0.72 + bob, z);
      dummy.rotation.set(0, facing + Math.PI, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      pedBody.setMatrixAt(i, dummy.matrix);
      dummy.position.y = 1.38 + bob;
      dummy.updateMatrix();
      pedHead.setMatrixAt(i, dummy.matrix);
    }
    pedBody.instanceMatrix.needsUpdate = true;
    pedHead.instanceMatrix.needsUpdate = true;
  }

  function stepPlayer(dt: number) {
    if (consume("horn") && sim.mode === "drive") audio.horn();
    if (consume("interact")) interact();
    if (consume("mount")) tryMount();

    if (sim.mode === "foot") {
      const basis = sim.yaw + sim.camOff;
      const fx = -Math.sin(basis);
      const fz = -Math.cos(basis);
      const rx = Math.cos(basis);
      const rz = -Math.sin(basis);
      let throttle = 0;
      let strafe = 0;
      if (keys.has("KeyW") || keys.has("ArrowUp")) throttle += 1;
      if (keys.has("KeyS") || keys.has("ArrowDown")) throttle -= 1;
      if (keys.has("KeyA") || keys.has("ArrowLeft")) strafe -= 1;
      if (keys.has("KeyD") || keys.has("ArrowRight")) strafe += 1;
      if (pad.joy) {
        throttle += pad.joyY;
        strafe += pad.joyX;
      }
      throttle = clamp(throttle, -1, 1);
      strafe = clamp(strafe, -1, 1);
      let wishX = fx * throttle + rx * strafe;
      let wishZ = fz * throttle + rz * strafe;
      const wishLen = Math.hypot(wishX, wishZ) || 1;
      if (Math.hypot(wishX, wishZ) > 1) {
        wishX /= wishLen;
        wishZ /= wishLen;
      }
      const moving = Math.hypot(wishX, wishZ) > 0.08;
      const running = keys.has("ShiftLeft") || keys.has("ShiftRight") || pad.run;
      let target = moving ? (running ? 6.3 : 3.2) * Math.min(1, Math.hypot(wishX, wishZ)) : 0;
      if (sim.energy < 12) target *= 0.62;
      if (sim.pz < -246 && sim.py < 0.8) target *= 0.45;
      sim.footSpeed += (target - sim.footSpeed) * Math.min(1, dt * 9);
      if (moving) {
        const targetYaw = Math.atan2(-wishX, -wishZ);
        sim.yaw = dampAngle(sim.yaw, targetYaw, dt, 10);
        sim.px += wishX * sim.footSpeed * dt;
        sim.pz += wishZ * sim.footSpeed * dt;
        sim.walkPhase += dt * sim.footSpeed * 2.4;
      }
      sim.speed = 0;
    } else {
      let throttle = 0;
      let steer = 0;
      if (keys.has("KeyW") || keys.has("ArrowUp")) throttle += 1;
      if (keys.has("KeyS") || keys.has("ArrowDown")) throttle -= 1;
      if (keys.has("KeyA") || keys.has("ArrowLeft")) steer += 1;
      if (keys.has("KeyD") || keys.has("ArrowRight")) steer -= 1;
      if (pad.joy) {
        throttle += pad.joyY;
        steer += -pad.joyX;
      }
      if (steerOverride !== null) steer = steerOverride;
      throttle = clamp(throttle, -1, 1);
      steer = clamp(steer, -1, 1);
      const okada = sim.ride === "okada";
      const dry = sim.fuel <= 0;
      const max = (okada ? 14.6 : 16.8) * (sim.raining ? 0.84 : 1) * (dry ? 0.2 : 1);
      const accel = (okada ? 18 : 12) * (dry ? 0.35 : 1);
      const brake = (okada ? 24 : 28) * (sim.raining ? 0.6 : 1);
      if (throttle > 0.05) sim.speed += accel * throttle * dt;
      else if (throttle < -0.05) sim.speed -= (sim.speed > 0.4 ? brake : accel * 0.55) * dt;
      else sim.speed *= Math.exp(-1.7 * dt);
      sim.speed = clamp(sim.speed, -4.2, max);
      const reverse = sim.speed >= 0 ? 1 : -1;
      const speedFactor = clamp(Math.abs(sim.speed) / 4.2, 0.22, 1);
      const turn = (okada ? 2.2 : 1.42) * (sim.raining ? 1.2 : 1);
      sim.yaw += steer * turn * speedFactor * reverse * dt;
      const fx = -Math.sin(sim.yaw);
      const fz = -Math.cos(sim.yaw);
      sim.px += fx * sim.speed * dt;
      sim.pz += fz * sim.speed * dt;
      sim.footSpeed = Math.abs(sim.speed);
      if (!dry && Math.abs(sim.speed) > 1) sim.fuel = Math.max(0, sim.fuel - dt * (okada ? 1.55 : 2.05));
      if (sim.fuel <= 0 && !sim.dryWarned) {
        sim.dryWarned = true;
        say("The tank is dry. Coast to the Oregbeni fill-up, or walk it.");
      }
    }

    const radius = sim.mode === "drive" ? 0.72 : 0.4;
    const resolved = resolveCircle(sim.px, sim.pz, radius);
    sim.px = resolved.x;
    sim.pz = resolved.z;
    const hit = querySurface(sim.px, sim.pz, sim.py);
    const surface = hit ? hit.y : 0;
    sim.py += (surface - sim.py) * Math.min(1, dt * 10);
    const held = constrainElevated(sim.px, sim.pz, sim.py);
    sim.px = held.x;
    sim.pz = held.z;
    if (sim.px < -168 || sim.px > 172 || sim.pz > 68 || sim.pz < -312) {
      sim.px = clamp(sim.px, -168, 172);
      sim.pz = clamp(sim.pz, -312, 68);
      sim.speed *= 0.2;
      if (!sim.edgeTold) {
        sim.edgeTold = true;
        say("Edge of the slice. The rest of Benin City is not in this build.");
      }
    }
    if (sim.py > 5 && !sim.flags.crested) {
      sim.flags = { ...sim.flags, crested: true };
      say("You are on the deck. The junction under you is a different road — no hidden ramp in the middle.");
    }
    if (Math.hypot(sim.px - PARK.x, sim.pz - PARK.z) < PARK.r + 2 && !sim.flags.reachedRamat) {
      sim.flags = { ...sim.flags, reachedRamat: true };
      say("Ramat Park. The flyover is the landmark; the lawn is the pause.");
    }
    if (sim.px > -8.6 && !sim.flags.exited && sim.home === "hill" && sim.pz > 0 && sim.pz < 24) {
      sim.flags = { ...sim.flags, exited: true };
      say("Ikpoba Slope. Oregbeni is downhill. Ramat is further, under and over the flyover.");
    }

    drift(sim.social, dt);
    const pressure = cityPressure(sim.social, {
      day: sim.day,
      minutes: sim.minutes,
      x: sim.px,
      z: sim.pz,
      naira: sim.naira,
    });
    if (pressure.take > 0) {
      sim.naira -= pressure.take;
      sim.speed *= pressure.slow;
      sim.footSpeed *= pressure.slow;
      sim.shake = 0.35;
    }
    if (pressure.line) say(pressure.line);

    sim.minutes += dt * 2.5;
    if (sim.minutes >= 1440) {
      sim.minutes -= 1440;
      sim.day += 1;
    }
    sim.hunger = clamp(sim.hunger + dt * 0.18, 0, 100);
    if (sim.hunger > 80) sim.energy = clamp(sim.energy - dt * 0.4, 0, 100);
    else if (sim.hunger < 30) sim.energy = clamp(sim.energy + dt * 0.08, 0, 100);
    if (sim.minutes >= 17 * 60 && sim.minutes < 19.2 * 60 && sim.autoRainDay !== sim.day) {
      sim.raining = true;
      sim.autoRainDay = sim.day;
      sim.flags = { ...sim.flags, sawRain: true };
      say("Rain reaches the hill. Braking takes longer. The ground road is the calmer line.");
    }
  }

  function poseWorld(dt: number) {
    const dayT = (sim.minutes - 360) / (18.5 * 60 - 360);
    const clamped = clamp(dayT, 0, 1);
    const elev = dayT < 0 || dayT > 1 ? -0.12 : Math.sin(clamped * Math.PI);
    const az = -0.85 + clamped * 2.5;
    sunVec.set(Math.cos(az), Math.max(0.08, elev), Math.sin(az)).normalize();
    const night = elev < 0.08 ? 1 : elev > 0.38 ? 0 : 1 - (elev - 0.08) / 0.3;
    const rainAmt = sim.raining ? 1 : 0;
    const reelFocus = sim.phase === "reel" ? reelAnchor(sim.reelT) : null;
    const focusX = reelFocus ? reelFocus.lx : sim.phase === "title" ? 10 : sim.px;
    const focusZ = reelFocus ? reelFocus.lz : sim.phase === "title" ? -175 : sim.pz;
    sun.position.set(focusX + sunVec.x * 48, Math.max(8, sunVec.y * 48), focusZ + sunVec.z * 48);
    sun.target.position.set(focusX, 0, focusZ);
    sun.target.updateMatrixWorld();
    sun.intensity = (2.5 * Math.max(elev, 0) + 0.15) * (1 - rainAmt * 0.45);
    sun.color.set(night > 0.6 ? 0xa9c4ff : 0xfff0d8);
    hemi.intensity = 0.42 + (1 - night) * 0.55 - rainAmt * 0.1;
    hemi.color.set(night > 0.5 ? 0x243456 : 0xffe2c4);
    hemi.groundColor.set(0x6a4030);
    nightFill.intensity = night * 0.35;
    buildingMat.emissiveIntensity = night * 1.55;
    bulbMat.emissiveIntensity = night * 2.4;
    asphaltMat.roughness = sim.raining ? 0.28 : 0.92;
    asphaltMat.color.set(sim.raining ? 0x9aa3ad : 0xffffff);
    renderer.toneMappingExposure = 1.05 + (1 - night) * 0.08 - rainAmt * 0.12;
    const fog = scene.fog as THREE.FogExp2;
    const horizon = night > 0.5 ? fogNight : rainAmt > 0 ? fogRain : fogHot;
    fog.color.copy(horizon);
    fog.density = 0.0065 + night * 0.004 + rainAmt * 0.01;
    skyMat.uniforms.uElev.value = elev;
    (skyMat.uniforms.uSun.value as THREE.Vector3).copy(sunVec);
    skyMat.uniforms.uRain.value = rainAmt;
    sky.position.set(camera.position.x, 0, camera.position.z);

    head.intensity = sim.mode === "drive" && night > 0.35 ? 10 * night : 0;
    const active = sim.ride === "car" ? rideCar : rideOkada;
    if (sim.mode === "drive") {
      head.position.set(sim.px, sim.py + 0.8, sim.pz);
      ahead.set(-Math.sin(sim.yaw), 0, -Math.cos(sim.yaw));
      head.target.position.set(sim.px + ahead.x * 10, sim.py + 0.4, sim.pz + ahead.z * 10);
      head.target.updateMatrixWorld();
      active.position.set(sim.px, sim.py, sim.pz);
      active.rotation.set(0, sim.yaw + Math.PI, sim.ride === "okada" ? 0 : 0);
      active.rotation.z = sim.ride === "okada" ? steerLean() : steerLean() * 0.35;
      rideOkada.visible = sim.ride === "okada";
      rideCar.visible = sim.ride === "car";
      avatar.position.set(sim.px + ahead.x * -0.12, sim.py + (sim.ride === "okada" ? 0.48 : 0.42), sim.pz + ahead.z * -0.12);
      avatar.rotation.set(0, sim.yaw + Math.PI, 0);
      legL.rotation.x = 1.05;
      legR.rotation.x = 1.05;
    } else {
      rideOkada.visible = false;
      rideCar.visible = false;
      head.intensity = 0;
      avatar.position.set(sim.px, sim.py, sim.pz);
      avatar.rotation.set(0, sim.yaw + Math.PI, 0);
      const swing = Math.sin(sim.walkPhase) * Math.min(0.7, sim.footSpeed * 0.18);
      legL.rotation.x = swing;
      legR.rotation.x = -swing;
      armL.rotation.x = -swing;
      armR.rotation.x = swing;
    }
    parkedOkada.visible = sim.ride !== "okada";
    parkedCar.visible = sim.ride !== "car";
    parkedOkada.position.set(sim.okada.x, 0, sim.okada.z);
    parkedOkada.rotation.y = sim.okada.yaw + Math.PI;
    parkedCar.position.set(sim.car.x, 0, sim.car.z);
    parkedCar.rotation.y = sim.car.yaw + Math.PI;

    const ridingWith =
      sim.social.partner === "adesuwa" &&
      sim.social.loyalty >= 40 &&
      sim.social.mood !== "strained" &&
      sim.mode === "drive" &&
      sim.ride === "okada" &&
      sim.phase === "play";
    partner.visible = sim.phase === "play" || sim.phase === "pause";
    if (ridingWith) {
      const bx = -Math.sin(sim.yaw);
      const bz = -Math.cos(sim.yaw);
      partner.position.set(sim.px - bx * 0.42, sim.py + 0.46, sim.pz - bz * 0.42);
      partner.rotation.set(0, sim.yaw + Math.PI, 0);
    } else {
      partner.position.set(ADESUWA.x, Math.sin(elapsed * 1.4) * 0.02, ADESUWA.z);
      partner.rotation.y = sim.social.mood === "strained" ? Math.PI : 0.6;
    }

    const anchor = markerTarget();
    marker.visible = !!anchor && sim.phase === "play";
    if (anchor) marker.position.set(anchor.x, 3 + Math.sin(elapsed * 3) * 0.25, anchor.z);

    if (sim.raining) {
      const arr = rain.geometry.attributes.position as THREE.BufferAttribute;
      const pos = arr.array as Float32Array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] -= dt * 18;
        if (pos[i + 1] < 0) pos[i + 1] = 22;
        pos[i] += (sim.phase === "title" ? 0 : 0);
      }
      // Recentre the field on the camera without reallocating.
      rain.position.set(camera.position.x, 0, camera.position.z);
      arr.needsUpdate = true;
      rain.visible = true;
    } else rain.visible = false;

    if (!reduce && sim.shake > 0) sim.shake = Math.max(0, sim.shake - dt * 1.4);
  }

  function steerLean() {
    let steer = 0;
    if (keys.has("KeyA") || keys.has("ArrowLeft")) steer += 1;
    if (keys.has("KeyD") || keys.has("ArrowRight")) steer -= 1;
    if (pad.joy) steer += -pad.joyX;
    return steer * 0.28;
  }

  function markerTarget() {
    if (!sim.job) {
      if (!sim.flags.reachedRamat) return { x: PARK.x, z: PARK.z };
      return null;
    }
    if (sim.job.id === "errand" && sim.job.stage === 0) return MAMA;
    if (sim.job.id === "errand") return ERRAND_DROP;
    if (sim.job.id === "fare" && sim.job.stage === 0) return FARE_PICK;
    return FARE_DROP;
  }

  function reelAnchor(t: number) {
    const stops = [
      { t: 0, x: -28, y: 9, z: 24, lx: -12, ly: 1.6, lz: 8 },
      { t: 6, x: -36, y: 8, z: -24, lx: -8, ly: 1.4, lz: -42 },
      { t: 12, x: -10, y: 18, z: -158, lx: 24, ly: 8.2, lz: -175 },
      { t: 18, x: 48, y: 14, z: -198, lx: 78, ly: 2, lz: -220 },
      { t: 24, x: 96, y: 11, z: -236, lx: 74, ly: 1.5, lz: -228 },
      { t: 30, x: 30, y: 26, z: -140, lx: 10, ly: 7, lz: -175 },
    ];
    let i = 0;
    while (i < stops.length - 2 && t > stops[i + 1].t) i += 1;
    const a = stops[i];
    const b = stops[Math.min(stops.length - 1, i + 1)];
    const span = Math.max(0.001, b.t - a.t);
    const u = Math.max(0, Math.min(1, (t - a.t) / span));
    const e = u * u * (3 - 2 * u);
    const mix = (p: number, q: number) => p + (q - p) * e;
    return {
      x: mix(a.x, b.x),
      y: mix(a.y, b.y),
      z: mix(a.z, b.z),
      lx: mix(a.lx, b.lx),
      ly: mix(a.ly, b.ly),
      lz: mix(a.lz, b.lz),
    };
  }

  function frameCamera(dt: number) {
    if (sim.phase === "reel") {
      const a = reelAnchor(sim.reelT);
      desired.set(a.x, a.y, a.z);
      look.set(a.lx, a.ly, a.lz);
      const k = 1 - Math.exp(-dt * 1.5);
      camPos.lerp(desired, k);
      camera.position.copy(camPos);
      camera.lookAt(look);
      camera.fov += (60 - camera.fov) * Math.min(1, dt * 2);
      camera.updateProjectionMatrix();
      return;
    }
    if (sim.phase === "title") {
      const t = reduce ? 0.35 : (elapsed % 32) / 32;
      const x = -50 + t * 140;
      desired.set(x, 14.5, -175 + 26);
      look.set(x + 16, 6.2, -175);
      const k = 1 - Math.exp(-dt * 1.4);
      camPos.lerp(desired, k);
      camera.position.copy(camPos);
      camera.lookAt(look);
      camera.fov += (62 - camera.fov) * Math.min(1, dt * 2);
      camera.updateProjectionMatrix();
      return;
    }
    const fx = -Math.sin(sim.yaw + sim.camOff);
    const fz = -Math.cos(sim.yaw + sim.camOff);
    const dist = sim.mode === "drive" ? 8.4 + Math.min(2.2, Math.abs(sim.speed) * 0.12) : 5.6;
    const height = sim.mode === "drive" ? 3.15 : 2.35;
    desired.set(sim.px - fx * dist, sim.py + height, sim.pz - fz * dist);
    // Pull the camera in if the segment hits a wall.
    const steps = 8;
    let clearX = sim.px;
    let clearY = sim.py + 1.5;
    let clearZ = sim.pz;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = sim.px + (desired.x - sim.px) * t;
      const y = sim.py + 1.5 + (desired.y - (sim.py + 1.5)) * t;
      const z = sim.pz + (desired.z - sim.pz) * t;
      if (y < 4.2 && pointInSolid(x, z)) break;
      clearX = x;
      clearY = y;
      clearZ = z;
    }
    desired.set(clearX, clearY, clearZ);
    if (sim.shake > 0 && !reduce) {
      desired.x += Math.sin(elapsed * 48) * sim.shake * 0.15;
      desired.y += Math.cos(elapsed * 37) * sim.shake * 0.1;
    }
    const k = 1 - Math.exp(-dt * (sim.mode === "drive" ? 4.5 : 7));
    camPos.lerp(desired, k);
    camera.position.copy(camPos);
    look.set(sim.px + fx * 1.8, sim.py + (sim.mode === "drive" ? 1.15 : 1.25), sim.pz + fz * 1.8);
    camera.lookAt(look);
    const fov = sim.mode === "drive" ? 64 + Math.min(6, Math.abs(sim.speed) * 0.35) : 56;
    camera.fov += (fov - camera.fov) * Math.min(1, dt * 3);
    camera.updateProjectionMatrix();
    if (!dragging) sim.camOff *= Math.exp(-dt * 2.4);
  }

  function drawMap() {
    if (!mapCtx || !minimap || !mapBase) return;
    const w = minimap.width;
    const h = minimap.height;
    mapCtx.clearRect(0, 0, w, h);
    mapCtx.drawImage(mapBuffer, 0, 0, w, h);
    const project = (x: number, z: number) => ({
      x: (12 + ((x + 170) / 350) * 296) * (w / 320),
      y: (12 + ((z + 310) / 380) * 296) * (h / 320),
    });
    if (sim.phase !== "title") {
      const p = project(sim.px, sim.pz);
      mapCtx.save();
      mapCtx.translate(p.x, p.y);
      mapCtx.rotate(Math.atan2(-Math.cos(sim.yaw), -Math.sin(sim.yaw)));
      mapCtx.fillStyle = "#d4652f";
      mapCtx.beginPath();
      mapCtx.moveTo(7, 0);
      mapCtx.lineTo(-5, 4.5);
      mapCtx.lineTo(-5, -4.5);
      mapCtx.closePath();
      mapCtx.fill();
      mapCtx.restore();
    }
    const marks = [
      { x: UNION_YARD.x, z: UNION_YARD.z, c: "#d4652f" },
      { x: -18, z: -40, c: "#e0b15a" },
      { x: 68, z: -214, c: "#3e6b52" },
      { x: NIGHT_CORNER.x, z: NIGHT_CORNER.z, c: "#f4ebd8" },
    ];
    for (const mark of marks) {
      const q = project(mark.x, mark.z);
      mapCtx.fillStyle = mark.c;
      mapCtx.fillRect(q.x - 2.2, q.y - 2.2, 4.4, 4.4);
    }
  }

  let acc = 0;
  function loop(timestamp: number) {
    timer.update(timestamp);
    const frameDt = Math.min(timer.getDelta(), 0.05);
    elapsed += frameDt;
    if (sim.phase === "reel") {
      sim.reelT += frameDt;
      const beat = sim.reelT < 6 ? 0 : sim.reelT < 12 ? 1 : sim.reelT < 18 ? 2 : sim.reelT < 24 ? 3 : 4;
      if (beat !== sim.reelBeat) {
        sim.reelBeat = beat;
        const lines = [
          "Ikpoba Hill. Rent is due before pride.",
          "Oregbeni does not only sell food. It sells names.",
          "The flyover is a border. Under it, another law.",
          "Rain makes every faction honest.",
          "Ramat Park. Choose who rides home with you.",
        ];
        sim.minutes = [7 * 60, 11 * 60, 16 * 60, 18.4 * 60, 20.5 * 60][beat];
        sim.raining = beat >= 3;
        say(lines[beat]);
      }
      if (sim.reelT >= 30) {
        sim.phase = "title";
        sim.raining = false;
        sim.reelT = 30;
        publish(true, "The corridor is still there. Step into it.");
      }
    }
    const worldOn = sim.phase === "title" || sim.phase === "reel" || (sim.phase === "play" && !sim.panel);
    if (worldOn) {
      acc += frameDt;
      let guard = 0;
      while (acc >= STEP && guard++ < 5) {
        stepAgents(STEP);
        if (sim.phase === "play" && !sim.panel) stepPlayer(STEP);
        acc -= STEP;
      }
    } else acc = 0;
    writeAgents();
    poseWorld(frameDt);
    frameCamera(frameDt);
    const market = clamp(1 - dist2(-20, -40) / 40, 0, 1);
    audio.update(frameDt, {
      driving: sim.mode === "drive" && sim.phase === "play",
      speed: sim.speed,
      raining: sim.raining,
      walking: sim.mode === "foot" && sim.footSpeed > 0.4 && sim.phase === "play" && !sim.panel,
      market,
    });
    if (sim.phase === "play" && !sim.panel) {
      saveAcc += frameDt;
      if (saveAcc > 18) {
        saveAcc = 0;
        writeSave(snapshot());
      }
    }
    hudAcc += frameDt;
    publish(false);
    drawMap();
    renderer.render(scene, camera);
  }

  const probe = {
    getYaw: () => sim.yaw,
    getSpeed: () => (sim.mode === "drive" ? Math.abs(sim.speed) : sim.footSpeed),
    setKeys,
    setSteer: (v: number) => setSteer(v),
  };
  window.__controlsTest = probe;

  bridge.api = api;
  if (bridge.pendingNew) {
    const cfg = bridge.pendingNew;
    bridge.pendingNew = null;
    api.startNew(cfg);
  } else if (bridge.pendingContinue) {
    bridge.pendingContinue = false;
    api.continueGame();
  }
  publish(true);
  renderer.setAnimationLoop(loop);

  const onHide = () => {
    if (document.hidden && sim.phase === "play") writeSave(snapshot());
  };
  document.addEventListener("visibilitychange", onHide);

  return () => {
    renderer.setAnimationLoop(null);
    document.removeEventListener("visibilitychange", onHide);
    for (const dispose of disposers) dispose();
    timer.dispose();
    audio.dispose();
    if (bridge.api === api) bridge.api = null;
    if (window.__controlsTest === probe) delete window.__controlsTest;
    for (const geo of geos) geo.dispose();
    for (const mat of mats) mat.dispose();
    facade.dispose();
    glow.dispose();
    asphaltMap.dispose();
    laterite.dispose();
    concreteMap.dispose();
    renderer.dispose();
  };
}
