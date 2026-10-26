export type FactionId = "union" | "market" | "guild" | "night";
export type Tone = "straight" | "kin" | "business";
export type Mood = "warm" | "wary" | "proud" | "strained";
export type PromiseId = "none" | "rice" | "clear" | "kept" | "broken";

export type Social = {
  respect: Record<FactionId, number>;
  heat: number;
  partner: "none" | "adesuwa";
  loyalty: number;
  mood: Mood;
  promise: PromiseId;
  checkedDay: number;
  bark: string;
};

export const ADESUWA = { x: -13.2, z: -16.6 };
export const UNION_YARD = { x: 3.2, z: 9.4 };
export const NIGHT_CORNER = { x: 66, z: -214 };

export const FACTIONS: { id: FactionId; name: string; hold: string }[] = [
  { id: "union", name: "Hill Union", hold: "Okada, rent, the slope" },
  { id: "market", name: "Oregbeni Circle", hold: "Prices, credit, names" },
  { id: "guild", name: "Bronze Shade", hold: "Skill, patronage, face" },
  { id: "night", name: "Night Line", hold: "The park after dark" },
];

function clamp(v: number, a = 0, b = 100) {
  return Math.max(a, Math.min(b, v));
}

export function defaultSocial(): Social {
  return {
    respect: { union: 18, market: 16, guild: 12, night: 8 },
    heat: 0,
    partner: "none",
    loyalty: 0,
    mood: "wary",
    promise: "none",
    checkedDay: -1,
    bark: "",
  };
}

export function clampSocial(s: Social) {
  (Object.keys(s.respect) as FactionId[]).forEach((id) => {
    s.respect[id] = clamp(s.respect[id]);
  });
  s.heat = clamp(s.heat);
  s.loyalty = clamp(s.loyalty);
}

export function applyMeet(s: Social, tone: Tone) {
  s.partner = "adesuwa";
  if (tone === "kin") {
    s.loyalty = 64;
    s.mood = "warm";
    s.respect.market += 10;
    s.respect.guild += 4;
    clampSocial(s);
    return "Adesuwa calls you cousin before you have earned it. The market will price you softer. Kinship here is a loan.";
  }
  if (tone === "business") {
    s.loyalty = 42;
    s.mood = "proud";
    s.respect.night += 8;
    s.respect.union += 6;
    s.respect.market -= 4;
    clampSocial(s);
    return "She nods like a contract. Proud, not tender. Night Line will hear you are ambitious. Mama Eki will hear it too.";
  }
  s.loyalty = 48;
  s.mood = "wary";
  s.respect.union += 4;
  clampSocial(s);
  return "Straight talk. She does not smile. Wary is safer than a performance. She will ride when the job is clean.";
}

export function applyCall(s: Social) {
  if (s.partner !== "adesuwa") return "The phone has no one who will pick up for you. Adesuwa is by the Oregbeni board.";
  if (s.mood === "strained" || s.promise === "broken")
    return "Adesuwa lets it ring. Strained people do not perform loyalty for an audience.";
  if (s.promise === "rice" || s.promise === "clear") return "She already asked. A promise still open is louder than a new one.";
  if (s.mood === "warm") {
    s.promise = "rice";
    return "Bring rice from Mama Eki. Not cash. In this city a plate is a treaty.";
  }
  if (s.mood === "proud") {
    s.respect.guild += 4;
    clampSocial(s);
    return "She wants Bronze Shade before dark. Pride is a bill. Practise the pour, then call her back with your hands dirty.";
  }
  s.promise = "clear";
  return "Stay off the Night Line until morning. She will know if the park learns your name.";
}

export function applyRice(s: Social) {
  if (s.partner !== "adesuwa" || s.promise !== "rice") return null;
  s.promise = "kept";
  s.loyalty += 22;
  s.mood = "warm";
  s.respect.market += 8;
  s.heat = Math.max(0, s.heat - 6);
  clampSocial(s);
  return "She takes the rice like a treaty. Oregbeni will hear you kept a small word. Small words run this city.";
}

export function applySide(s: Social, id: "union" | "night" | "guild") {
  if (id === "night" && s.promise === "clear") {
    s.promise = "broken";
    s.loyalty = Math.max(0, s.loyalty - 28);
    s.mood = "strained";
  }
  if (id === "union") {
    s.respect.union += 16;
    s.respect.night -= 12;
    s.respect.market -= 3;
    s.heat += 16;
    clampSocial(s);
    return {
      pay: 1800,
      line: "Hill Union pays the slope tax in cash. Night Line marks the slight. Heat climbs whether you feel it or not.",
    };
  }
  if (id === "night") {
    s.respect.night += 18;
    s.respect.union -= 16;
    s.respect.guild -= 8;
    s.respect.market -= 10;
    s.heat += 30;
    clampSocial(s);
    const broken =
      s.promise === "broken"
        ? " Adesuwa will hear before you reach the hill. You broke the clear-night promise."
        : "";
    return {
      pay: 2800,
      line: `Night Line cash is heavier and louder.${broken} The task force reads this kind of money.`,
    };
  }
  s.respect.guild += 14;
  s.respect.market += 6;
  s.heat = Math.max(0, s.heat - 8);
  s.loyalty += s.partner === "adesuwa" ? 6 : 0;
  if (s.mood === "proud") s.mood = "warm";
  clampSocial(s);
  return {
    pay: -200,
    line: "You buy wax and waste a pour at Bronze Shade. It is a fictional stall, not an Igun Street guild object. Your hands get better. The street gets quieter.",
  };
}

export function mamaRefusesRice(s: Social) {
  return s.respect.night >= 42 && s.respect.market <= 30;
}

export function fareBonus(s: Social) {
  if (s.partner === "adesuwa" && s.loyalty >= 40 && s.mood !== "strained") return 1.28;
  return 1;
}

export function allowHaggle(s: Social, rel: number, skill: number) {
  if (s.partner === "adesuwa" && s.mood === "warm" && s.loyalty >= 50) return true;
  return rel >= 1 || skill >= 1;
}

export function drift(s: Social, dt: number) {
  s.heat = clamp(s.heat - dt * 0.22);
  if (s.partner === "adesuwa" && s.mood === "warm") s.loyalty = clamp(s.loyalty + dt * 0.04);
  if (s.mood === "strained") s.loyalty = clamp(s.loyalty - dt * 0.015);
}

export function cityPressure(
  s: Social,
  ctx: { day: number; minutes: number; x: number; z: number; naira: number },
) {
  let line: string | null = null;
  let take = 0;
  let slow = 1;
  const night = ctx.minutes >= 19 * 60 || ctx.minutes < 5.5 * 60;
  const inPark = (ctx.x - 78) ** 2 + (ctx.z + 230) ** 2 < 34 ** 2;
  if (night && inPark && s.respect.union > s.respect.night + 14 && s.bark !== `park-${ctx.day}`) {
    s.bark = `park-${ctx.day}`;
    s.heat = clamp(s.heat + 6);
    line = "After dark the park belongs to Night Line. They have clocked the Union on you.";
  }
  const onSlope = ctx.z < -36 && ctx.z > -140 && Math.abs(ctx.x) < 24 && ctx.z !== 0;
  if (s.heat >= 58 && s.checkedDay !== ctx.day && onSlope) {
    s.checkedDay = ctx.day;
    take = Math.min(300, Math.max(0, ctx.naira));
    s.heat = clamp(s.heat - 12);
    slow = 0.3;
    line = "Task force on Ikpoba Slope. No paperwork. ₦300 leaves your hand and they wave the corridor open.";
  }
  const marketZone = Math.abs(ctx.z + 40) < 18 && ctx.x > -40 && ctx.x < 20;
  if (marketZone && s.respect.market < 12 && s.respect.night > 40 && s.bark !== `mkt-${ctx.day}`) {
    s.bark = `mkt-${ctx.day}`;
    line = "Oregbeni goes quiet when you pass. A market can refuse a person without raising its voice.";
  }
  return { line, take, slow };
}

export function sleepSocial(s: Social) {
  const broke = s.promise === "rice" || s.promise === "clear";
  if (broke) {
    s.promise = "broken";
    s.loyalty = clamp(s.loyalty - 24);
    s.mood = "strained";
  } else if (s.promise === "kept") {
    s.promise = "none";
    s.loyalty = clamp(s.loyalty + 4);
  }
  s.heat = clamp(s.heat - 14);
  s.checkedDay = -1;
  s.bark = "";
  if (!broke && s.mood === "strained" && s.loyalty > 36) s.mood = "wary";
  return broke
    ? "You slept on an open promise. Adesuwa counts that as a broken word. The morning is colder."
    : null;
}

export function biasForBackground(s: Social, background: "student" | "apprentice" | "trader") {
  if (background === "student") s.respect.market = 26;
  if (background === "apprentice") s.respect.guild = 30;
  if (background === "trader") s.respect.union = 34;
}
