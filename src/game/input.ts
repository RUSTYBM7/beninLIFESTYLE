export const keys = new Set<string>();

export const pad = {
  joyX: 0,
  joyY: 0,
  joy: false,
  run: false,
  interact: false,
  mount: false,
  horn: false,
};

/** Same sign as production steer: +1 is left, -1 is right. Null means keys/stick win. */
export let steerOverride: number | null = null;

export function setKeys(codes: string[]) {
  keys.clear();
  for (const code of codes) keys.add(code);
}

export function setSteer(v: number | null) {
  steerOverride = v;
}

export function consume(flag: "interact" | "mount" | "horn") {
  const value = pad[flag];
  pad[flag] = false;
  return value;
}
