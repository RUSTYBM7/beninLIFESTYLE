import { create } from "zustand";
import { defaultSocial } from "./social";
import type { HudSnapshot } from "./types";

const emptyInv = { puff: 0, water: 0, rice: 0 };

export const initialHud: HudSnapshot = {
  ready: false,
  error: null,
  phase: "title",
  panel: null,
  name: "",
  background: "student",
  naira: 0,
  day: 1,
  minutes: 410,
  hunger: 20,
  energy: 90,
  debt: 0,
  place: "Ikpoba Hill",
  prompt: null,
  objective: "Wake, then step out onto the hill.",
  moment: null,
  speed: 0,
  mode: "foot",
  ride: null,
  fuel: 100,
  raining: false,
  muted: false,
  px: 0,
  pz: 0,
  yaw: 0,
  inv: emptyInv,
  skill: 0,
  rel: 0,
  flags: {},
  job: null,
  stallStep: 0,
  stallProfit: 0,
  home: "hill",
  rentDue: 1200,
  carUnlocked: false,
  social: defaultSocial(),
  reelT: 0,
};

type HudStore = HudSnapshot & {
  patch: (partial: Partial<HudSnapshot>) => void;
};

export const useHud = create<HudStore>((set) => ({
  ...initialHud,
  patch: (partial) => set(partial),
}));
