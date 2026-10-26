import type { Social } from "./social";

export type Background = "student" | "apprentice" | "trader";

export type Ride = "okada" | "car";

export type Panel =
  | "shop"
  | "jobs"
  | "phone"
  | "map"
  | "heritage"
  | "room"
  | "stall"
  | "sleep"
  | "ledger"
  | "pause"
  | "partner"
  | "factions";

export type Job = { id: "errand" | "fare"; stage: number } | null;

export type Inventory = { puff: number; water: number; rice: number };

export type SaveData = {
  version: 1 | 2;
  name: string;
  background: Background;
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
  inv: Inventory;
  skill: number;
  rel: number;
  flags: Record<string, boolean>;
  job: Job;
  px: number;
  py: number;
  pz: number;
  yaw: number;
  mode: "foot" | "drive";
  ride: Ride | null;
  fuel: number;
  carUnlocked: boolean;
  raining: boolean;
  okada: { x: number; z: number; yaw: number };
  car: { x: number; z: number; yaw: number };
  social?: Social;
};

export type HudSnapshot = {
  ready: boolean;
  error: string | null;
  phase: "title" | "play" | "pause" | "reel";
  panel: Panel | null;
  name: string;
  background: Background;
  naira: number;
  day: number;
  minutes: number;
  hunger: number;
  energy: number;
  debt: number;
  place: string;
  prompt: string | null;
  objective: string;
  moment: string | null;
  speed: number;
  mode: "foot" | "drive";
  ride: Ride | null;
  fuel: number;
  raining: boolean;
  muted: boolean;
  px: number;
  pz: number;
  yaw: number;
  inv: Inventory;
  skill: number;
  rel: number;
  flags: Record<string, boolean>;
  job: Job;
  stallStep: number;
  stallProfit: number;
  home: "hill" | "ramat";
  rentDue: number;
  carUnlocked: boolean;
  social: Social;
  reelT: number;
};
