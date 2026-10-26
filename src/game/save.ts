import { defaultSocial } from "./social";
import type { SaveData } from "./types";

const KEY = "benin-life-v2";

export function loadSave(): SaveData | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem("benin-life-v1");
    if (!raw) return null;
    const data = JSON.parse(raw) as SaveData;
    if (!data || (data.version !== 1 && data.version !== 2) || typeof data.naira !== "number") return null;
    if (!data.social) data.social = defaultSocial();
    return data;
  } catch {
    return null;
  }
}

export function writeSave(data: SaveData) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* private mode / quota — the day still plays */
  }
}
