export const ECON = {
  rent: 1200,
  ramat: 22000,
  fuel: 400,
  hire: 500,
  errand: 2200,
  fare: 1400,
  practice: 600,
};

export const GOODS = {
  puff: { name: "Puff-puff", price: 300, hunger: 18, energy: 4 },
  water: { name: "Sachet water", price: 100, hunger: 6, energy: 10 },
  rice: { name: "Rice plate", price: 700, hunger: 42, energy: 8 },
} as const;

export type GoodId = keyof typeof GOODS;

export const SCENARIOS: { flag: string; title: string; detail: string }[] = [
  { flag: "paidRent", title: "First rental", detail: "Pay the room ledger." },
  { flag: "didJob", title: "Finding work", detail: "Finish a notice-board job." },
  { flag: "boughtFood", title: "Market", detail: "Buy a meal at Oregbeni." },
  { flag: "reachedRamat", title: "The corridor", detail: "Reach Ramat Park by road." },
  { flag: "sawRain", title: "Rainy evening", detail: "Be out when the hill gets wet." },
  { flag: "apprenticed", title: "Apprenticeship", detail: "Practise at Bronze Shade." },
  { flag: "ranStall", title: "Small business", detail: "Mind the kiosk for three buyers." },
  { flag: "reportedDrain", title: "Ward desk", detail: "Report the blocked drain." },
  { flag: "readHeritage", title: "Heritage", detail: "Read the bronze-casting note." },
  { flag: "movedHome", title: "Move up", detail: "Take the Ramat room." },
];

export const HERITAGE_COPY =
  "Benin City’s bronze-casting tradition is centuries old, historically centred on the Igun street guilds. Bronze Shade is a fictional practice stall in this slice — not a palace object, and not a stand-in for the families and museums who hold that history.";
