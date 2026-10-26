import type { GoodId } from "./content";
import type { Tone } from "./social";
import type { Background } from "./types";

export type NewGameCfg = {
  name: string;
  background: Background;
  skin: number;
  cloth: number;
};

export type GameApi = {
  startNew: (cfg: NewGameCfg) => void;
  continueGame: () => boolean;
  togglePause: () => void;
  closePanel: () => void;
  openPhone: () => void;
  openMap: () => void;
  buy: (id: GoodId) => void;
  haggle: () => void;
  useItem: (id: GoodId) => void;
  acceptJob: (id: "errand" | "fare") => void;
  payRent: () => void;
  sleep: () => void;
  reportDrain: () => void;
  practise: () => void;
  moveHome: () => void;
  stallChoice: (kind: "low" | "fair" | "high") => void;
  refuel: () => void;
  setRain: (on: boolean) => void;
  setHour: (minutes: number) => void;
  toggleMute: () => void;
  sit: () => void;
  meetPartner: (tone: Tone) => void;
  sideJob: (id: "union" | "night" | "guild") => void;
  partnerCall: () => void;
  giveRice: () => void;
  playReel: () => void;
  skipReel: () => void;
};

export const bridge: {
  api: GameApi | null;
  pendingNew: NewGameCfg | null;
  pendingContinue: boolean;
} = {
  api: null,
  pendingNew: null,
  pendingContinue: false,
};

export function startNew(cfg: NewGameCfg) {
  if (bridge.api) bridge.api.startNew(cfg);
  else bridge.pendingNew = cfg;
}

export function continueGame() {
  if (bridge.api) bridge.api.continueGame();
  else bridge.pendingContinue = true;
}

export function callApi(run: (api: GameApi) => void) {
  if (bridge.api) run(bridge.api);
}
