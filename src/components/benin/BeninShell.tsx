import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { BookOpen, CloudRain, Map, Phone, Volume2, VolumeX } from "lucide-react";
import { callApi, continueGame, startNew } from "@/game/bridge";
import { GOODS, HERITAGE_COPY, type GoodId } from "@/game/content";
import { mount } from "@/game/engine";
import { pad } from "@/game/input";
import { loadSave } from "@/game/save";
import { FACTIONS } from "@/game/social";
import { useHud } from "@/game/store";
import type { Background } from "@/game/types";
import { Codex } from "./Codex";

const BACKGROUNDS: { id: Background; title: string; detail: string }[] = [
  { id: "student", title: "Student", detail: "The market knows your face." },
  { id: "apprentice", title: "Apprentice", detail: "Bronze Shade trusts your hands." },
  { id: "trader", title: "Trader", detail: "Union standing. The car is yours." },
];

const CAPTIONS: [number, string][] = [
  [0, "Ikpoba Hill. The day starts owing the room."],
  [5, "Oregbeni sells food, then it sells your name."],
  [11, "The flyover holds two cities in one shadow."],
  [16, "After rain, the park changes owners."],
  [22, "Someone on the roadside will remember the promise."],
  [27, "BENIN LIFE. The corridor is waiting."],
];

function clock(mins: number) {
  const m = Math.floor(mins) % 1440;
  const h = Math.floor(m / 60);
  const min = Math.floor(m % 60);
  const h12 = h % 12 || 12;
  return `${h12}:${min.toString().padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}

function naira(value: number) {
  return `₦${Math.round(value).toLocaleString("en-NG")}`;
}

export function BeninShell() {
  const viewRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hud = useHud();
  const [name, setName] = useState("Osaze");
  const [background, setBackground] = useState<Background>("student");
  const [skin, setSkin] = useState(1);
  const [cloth, setCloth] = useState(0);
  const [overlay, setOverlay] = useState<"none" | "codex" | "trailer">("none");
  const [caption, setCaption] = useState(CAPTIONS[0][1]);
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    setHasSave(!!loadSave());
    const view = viewRef.current;
    if (!view) return;
    return mount(view, mapRef.current);
  }, []);

  const playing = hud.phase === "play";
  const showHud = playing || hud.phase === "pause" || hud.phase === "reel";

  return (
    <main className="game-root relative h-dvh w-full overflow-hidden bg-bg text-fg">
      <canvas ref={viewRef} className="absolute inset-0 h-full w-full" />
      <div className="vignette pointer-events-none absolute inset-0" />

      {showHud && hud.phase !== "reel" && (
        <header className="safe-top pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 px-3 pt-3">
          <div className="pointer-events-auto max-w-[16rem] rounded-2xl border border-line bg-bg/80 px-3 py-2 backdrop-blur-md">
            <p className="text-xs tracking-wide text-brass uppercase">{hud.place}</p>
            <p className="font-display text-lg leading-tight">
              Day {hud.day} · {clock(hud.minutes)}
            </p>
            <p className="text-sm text-muted">{hud.raining ? "Rain on the hill" : "Dry corridor"}</p>
            <div className="mt-2 grid grid-cols-4 gap-1">
              {FACTIONS.map((faction) => (
                <div key={faction.id} title={faction.name}>
                  <div className="h-1 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full bg-brass"
                      style={{ width: `${hud.social.respect[faction.id]}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="pointer-events-auto rounded-2xl border border-line bg-bg/80 px-3 py-2 text-right backdrop-blur-md">
              <p className="font-display text-xl leading-none">{naira(hud.naira)}</p>
              <p className="text-xs text-muted">Heat {Math.round(hud.social.heat)}</p>
            </div>
          </div>
        </header>
      )}

      <canvas
        ref={mapRef}
        width={320}
        height={320}
        className={`pointer-events-none absolute top-24 right-3 z-10 h-24 w-24 rounded-2xl border border-line bg-surface ${
          playing || hud.phase === "pause" ? "" : "hidden"
        }`}
      />

      {hud.phase === "reel" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-20 px-4">
          <div className="mx-auto max-w-lg rounded-2xl border border-line bg-bg/80 px-4 py-3 backdrop-blur-md">
            <p className="text-xs tracking-[0.16em] text-brass uppercase">Corridor reel</p>
            <p className="font-display text-xl leading-snug">{hud.moment}</p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
              <div className="h-full bg-primary" style={{ width: `${Math.min(100, (hud.reelT / 30) * 100)}%` }} />
            </div>
          </div>
        </div>
      )}

      {playing && !hud.panel && (
        <div className="absolute inset-x-0 bottom-0 z-10 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mb-2 rounded-2xl border border-line bg-bg/75 px-3 py-2 backdrop-blur-md">
            <p className="text-xs text-muted">Now</p>
            <p className="text-sm leading-snug">{hud.objective}</p>
          </div>
          {hud.moment && (
            <p className="mb-2 rounded-2xl bg-surface/90 px-3 py-2 text-sm leading-snug text-fg">{hud.moment}</p>
          )}
          <div className="flex items-end justify-between gap-3">
            <Stick />
            <div className="flex flex-1 flex-col items-stretch gap-2">
              {hud.prompt && (
                <button
                  type="button"
                  className="min-h-11 rounded-full bg-primary px-4 text-sm font-medium text-primary-fg"
                  onClick={() => {
                    pad.interact = true;
                  }}
                >
                  {hud.prompt.replace(/^E · /, "")}
                </button>
              )}
              <div className="flex justify-end gap-2">
                <IconButton label="Phone" onClick={() => callApi((api) => api.openPhone())}>
                  <Phone className="h-5 w-5" />
                </IconButton>
                <IconButton label="Map" onClick={() => callApi((api) => api.openMap())}>
                  <Map className="h-5 w-5" />
                </IconButton>
                <IconButton label="Pause" onClick={() => callApi((api) => api.togglePause())}>
                  <span className="text-xs font-medium">II</span>
                </IconButton>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <HoldButton label="Run" onHold={(down) => (pad.run = down)} />
              <button
                type="button"
                className="min-h-11 min-w-11 rounded-full border border-line bg-surface px-3 text-sm"
                onClick={() => {
                  pad.mount = true;
                }}
              >
                Ride
              </button>
              <button
                type="button"
                className="min-h-11 min-w-11 rounded-full border border-line bg-surface px-3 text-sm"
                onClick={() => {
                  pad.horn = true;
                }}
              >
                Horn
              </button>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-muted">
            {hud.mode === "drive"
              ? "W throttle · A left · D right · F step off"
              : "WASD walk · Shift run · E speak · F ride"}
            {hud.social.partner === "adesuwa" ? ` · Adesuwa ${hud.social.mood}` : ""}
          </p>
        </div>
      )}

      {hud.phase === "title" && overlay === "none" && (
        <div className="absolute inset-0 z-20 flex items-end justify-center bg-gradient-to-t from-bg via-bg/70 to-transparent sm:items-center">
          <section className="safe-bot max-h-[92dvh] w-full max-w-lg overflow-y-auto px-4 py-4">
            <p className="text-xs tracking-[0.22em] text-brass uppercase">Benin City · open corridor</p>
            <h1 className="font-display text-5xl leading-none sm:text-6xl">BENIN LIFE</h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
              Ikpoba Hill to Ramat Park. Rent, okada, a market that can refuse you, and a woman who keeps
              promises longer than factions keep peace.
            </p>
            <label className="mt-4 block text-xs text-muted">
              Name
              <input
                value={name}
                maxLength={18}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-base text-fg outline-none"
              />
            </label>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {BACKGROUNDS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setBackground(item.id)}
                  className={`min-h-11 rounded-xl border px-2 py-2 text-left ${
                    background === item.id ? "border-brass bg-surface-2" : "border-line bg-surface"
                  }`}
                >
                  <span className="block text-sm">{item.title}</span>
                  <span className="block text-xs leading-snug text-muted">{item.detail}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-4">
              <Swatches label="Skin" count={4} value={skin} prefix="skin" onPick={setSkin} />
              <Swatches label="Cloth" count={4} value={cloth} prefix="cloth" onPick={setCloth} />
            </div>
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                className="min-h-12 rounded-full bg-primary text-base font-medium text-primary-fg"
                onClick={() =>
                  startNew({
                    name: name.trim() || "Osaze",
                    background,
                    skin,
                    cloth,
                  })
                }
              >
                Start the day
              </button>
              <button
                type="button"
                disabled={!hasSave}
                className="min-h-11 rounded-full border border-line bg-surface text-sm disabled:opacity-40"
                onClick={() => continueGame()}
              >
                Continue
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="min-h-11 rounded-full border border-brass bg-surface text-sm text-brass"
                  onClick={() => {
                    setCaption(CAPTIONS[0][1]);
                    setOverlay("trailer");
                  }}
                >
                  Thirty seconds
                </button>
                <button
                  type="button"
                  className="min-h-11 rounded-full border border-line bg-surface text-sm"
                  onClick={() => callApi((api) => api.playReel())}
                >
                  Fly the corridor
                </button>
              </div>
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-sm text-muted"
                onClick={() => setOverlay("codex")}
              >
                <BookOpen className="h-4 w-4" />
                Production codex · 40 systems
              </button>
            </div>
          </section>
        </div>
      )}

      {hud.phase === "reel" && (
        <button
          type="button"
          className="absolute top-4 right-4 z-30 min-h-11 rounded-full border border-line bg-bg/80 px-4 text-sm"
          onClick={() => callApi((api) => api.skipReel())}
        >
          Skip
        </button>
      )}

      {hud.panel && hud.phase === "play" && (
        <PanelFrame
          title={panelTitle(hud.panel)}
          onClose={() => callApi((api) => api.closePanel())}
        >
          {hud.panel === "shop" && (
            <div className="grid gap-2">
              {(Object.keys(GOODS) as GoodId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  className="min-h-11 rounded-xl border border-line bg-surface px-3 text-left text-sm"
                  onClick={() => callApi((api) => api.buy(id))}
                >
                  {GOODS[id].name} · {naira(GOODS[id].price)}
                  <span className="block text-xs text-muted">Holding {hud.inv[id]}</span>
                </button>
              ))}
              <button
                type="button"
                className="min-h-11 rounded-full border border-brass text-sm text-brass"
                onClick={() => callApi((api) => api.haggle())}
              >
                Ask last price
              </button>
            </div>
          )}
          {hud.panel === "jobs" && (
            <div className="grid gap-2">
              <button
                type="button"
                className="min-h-11 rounded-xl bg-surface px-3 text-left text-sm"
                onClick={() => callApi((api) => api.acceptJob("errand"))}
              >
                Parcel for Mama Eki · {naira(2200)}
                <span className="block text-xs text-muted">Walk it back up the hill.</span>
              </button>
              <button
                type="button"
                className="min-h-11 rounded-xl bg-surface px-3 text-left text-sm"
                onClick={() => callApi((api) => api.acceptJob("fare"))}
              >
                Okada fare to Ramat · {naira(1400)}
                <span className="block text-xs text-muted">Adesuwa can lift the price if she rides.</span>
              </button>
            </div>
          )}
          {hud.panel === "phone" && (
            <div className="grid gap-2">
              <p className="text-sm text-muted">
                {hud.social.partner === "adesuwa"
                  ? `Adesuwa · ${hud.social.mood} · loyalty ${Math.round(hud.social.loyalty)} · promise ${hud.social.promise}`
                  : "No one is saved on this line yet."}
              </p>
              <button
                type="button"
                className="min-h-11 rounded-xl bg-primary text-sm text-primary-fg"
                onClick={() => callApi((api) => api.partnerCall())}
              >
                Call Adesuwa
              </button>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(GOODS) as GoodId[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    className="min-h-11 rounded-xl bg-surface text-xs"
                    onClick={() => callApi((api) => api.useItem(id))}
                  >
                    Eat {GOODS[id].name}
                    <span className="block text-muted">{hud.inv[id]}</span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-surface text-sm"
                  onClick={() => callApi((api) => api.setRain(!hud.raining))}
                >
                  <CloudRain className="h-4 w-4" />
                  {hud.raining ? "Call the rain off" : "Call the rain"}
                </button>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-surface text-sm"
                  onClick={() => callApi((api) => api.toggleMute())}
                >
                  {hud.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  {hud.muted ? "Sound off" : "Sound on"}
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  ["Dawn", 7 * 60],
                  ["Noon", 12 * 60],
                  ["Gold", 17.5 * 60],
                  ["Night", 21 * 60],
                ].map(([label, minutes]) => (
                  <button
                    key={label}
                    type="button"
                    className="min-h-11 rounded-xl bg-surface text-xs"
                    onClick={() => callApi((api) => api.setHour(minutes as number))}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <ul className="grid gap-1 text-xs text-muted">
                {FACTIONS.map((faction) => (
                  <li key={faction.id} className="flex justify-between gap-3">
                    <span>{faction.name}</span>
                    <span className="text-fg">{Math.round(hud.social.respect[faction.id])}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hud.panel === "map" && (
            <div className="text-sm leading-relaxed">
              <p>You are in {hud.place}.</p>
              <p className="mt-2 text-muted">
                Orange is Hill Union, brass is Oregbeni, green is Bronze Shade, ivory is Night Line. The deck
                and the ground road are not the same street.
              </p>
              <p className="mt-2">{hud.objective}</p>
            </div>
          )}
          {hud.panel === "heritage" && (
            <div className="grid gap-3 text-sm leading-relaxed">
              <p>{HERITAGE_COPY}</p>
              <button
                type="button"
                className="min-h-11 rounded-full bg-primary text-sm text-primary-fg"
                onClick={() => callApi((api) => api.practise())}
              >
                Practise the pour
              </button>
              <button
                type="button"
                className="min-h-11 rounded-full border border-brass text-sm text-brass"
                onClick={() => callApi((api) => api.sideJob("guild"))}
              >
                Commission wax · ₦200
              </button>
            </div>
          )}
          {hud.panel === "partner" && (
            <div className="grid gap-2 text-sm">
              {hud.social.partner === "none" ? (
                <>
                  <p className="leading-relaxed text-muted">
                    Adesuwa waits like the board is a bus stop and a courtroom. Pick how you are known.
                  </p>
                  <ToneButton
                    title="Call her cousin"
                    detail="Warm. The market softens. Kinship is a loan."
                    onClick={() => callApi((api) => api.meetPartner("kin"))}
                  />
                  <ToneButton
                    title="Speak straight"
                    detail="Wary. She rides when the job is clean."
                    onClick={() => callApi((api) => api.meetPartner("straight"))}
                  />
                  <ToneButton
                    title="Talk business"
                    detail="Proud. Night Line hears ambition."
                    onClick={() => callApi((api) => api.meetPartner("business"))}
                  />
                </>
              ) : (
                <>
                  <p>
                    {hud.social.mood} · loyalty {Math.round(hud.social.loyalty)} · promise {hud.social.promise}
                  </p>
                  <p className="text-muted">
                    If she is not strained and loyalty holds, she sits the okada and the Ramat fare goes up.
                  </p>
                  <button
                    type="button"
                    className="min-h-11 rounded-full bg-primary text-sm text-primary-fg"
                    onClick={() => callApi((api) => api.giveRice())}
                  >
                    Hand her rice
                  </button>
                </>
              )}
            </div>
          )}
          {hud.panel === "factions" && (
            <div className="grid gap-2 text-sm">
              <p className="text-muted">
                Cash from one organism is an insult to another. Heat does not ask permission.
              </p>
              <button
                type="button"
                className="min-h-11 rounded-xl bg-surface px-3 text-left"
                onClick={() => callApi((api) => api.sideJob("union"))}
              >
                Carry for Hill Union · {naira(1800)}
                <span className="block text-xs text-muted">Night Line will mark it.</span>
              </button>
              <button
                type="button"
                className="min-h-11 rounded-xl bg-surface px-3 text-left"
                onClick={() => callApi((api) => api.sideJob("night"))}
              >
                Take Night Line cash · {naira(2800)}
                <span className="block text-xs text-muted">Breaks a clear-night promise if one is open.</span>
              </button>
            </div>
          )}
          {hud.panel === "room" && (
            <div className="grid gap-2 text-sm">
              <p>A room nearer the park. The hill key is let go. Deposit {naira(22000)}, a game rate.</p>
              <button
                type="button"
                className="min-h-11 rounded-full bg-primary text-sm text-primary-fg"
                onClick={() => callApi((api) => api.moveHome())}
              >
                Take the Ramat key
              </button>
            </div>
          )}
          {hud.panel === "ledger" && (
            <div className="grid gap-2 text-sm">
              <p>
                Due today {naira(hud.rentDue)}
                {hud.debt > 0 ? ` plus debt ${naira(hud.debt)}` : ""}. Home is the {hud.home}.
              </p>
              <button
                type="button"
                className="min-h-11 rounded-full bg-primary text-sm text-primary-fg"
                onClick={() => callApi((api) => api.payRent())}
              >
                Clear the ledger
              </button>
            </div>
          )}
          {hud.panel === "sleep" && (
            <div className="grid gap-2 text-sm">
              <p>Sleep ends the day. An open promise becomes a broken one.</p>
              <button
                type="button"
                className="min-h-11 rounded-full bg-primary text-sm text-primary-fg"
                onClick={() => callApi((api) => api.sleep())}
              >
                Sleep
              </button>
            </div>
          )}
          {hud.panel === "stall" && (
            <div className="grid gap-2">
              <p className="text-sm text-muted">
                Buyer {Math.min(hud.stallStep + 1, 3)} of 3 · taken {naira(hud.stallProfit)}
              </p>
              {(
                [
                  ["low", "Thin margin"],
                  ["fair", "Fair price"],
                  ["high", "They may walk"],
                ] as const
              ).map(([kind, label]) => (
                <button
                  key={kind}
                  type="button"
                  className="min-h-11 rounded-xl bg-surface text-sm"
                  onClick={() => callApi((api) => api.stallChoice(kind))}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          {hud.panel === "pause" && (
            <div className="grid gap-2">
              <button
                type="button"
                className="min-h-11 rounded-full bg-primary text-sm text-primary-fg"
                onClick={() => callApi((api) => api.togglePause())}
              >
                Resume
              </button>
            </div>
          )}
        </PanelFrame>
      )}

      {hud.phase === "pause" && !hud.panel && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg/70 px-4">
          <div className="w-full max-w-sm rounded-3xl border border-line bg-surface p-4">
            <h2 className="font-display text-3xl">Paused</h2>
            <p className="mt-1 text-sm text-muted">The hill keeps your place.</p>
            <button
              type="button"
              className="mt-4 min-h-11 w-full rounded-full bg-primary text-sm text-primary-fg"
              onClick={() => callApi((api) => api.togglePause())}
            >
              Resume
            </button>
          </div>
        </div>
      )}

      {overlay === "codex" && <Codex onClose={() => setOverlay("none")} />}

      {overlay === "trailer" && (
        <div className="absolute inset-0 z-40 flex flex-col bg-bg">
          <div className="safe-top flex items-center justify-between px-3 py-2">
            <p className="text-xs tracking-[0.16em] text-brass uppercase">Thirty seconds · premiere</p>
            <button
              type="button"
              className="min-h-11 rounded-full border border-line px-4 text-sm"
              onClick={() => {
                videoRef.current?.pause();
                setOverlay("none");
              }}
            >
              Close
            </button>
          </div>
          <video
            ref={videoRef}
            className="min-h-0 w-full flex-1 bg-bg object-contain"
            src="/trailer.mp4"
            autoPlay
            playsInline
            controls
            onTimeUpdate={(event) => {
              const t = event.currentTarget.currentTime;
              const line = [...CAPTIONS].reverse().find(([at]) => t >= at);
              if (line) setCaption(line[1]);
            }}
          />
          <p className="safe-bot px-4 py-3 text-center font-display text-lg leading-snug">{caption}</p>
        </div>
      )}

      {!hud.ready && !hud.error && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-bg">
          <p className="text-sm text-muted">Raising the corridor…</p>
        </div>
      )}
      {hud.error && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-bg px-6 text-center">
          <p>{hud.error}</p>
        </div>
      )}
    </main>
  );
}

function panelTitle(panel: string) {
  switch (panel) {
    case "shop":
      return "Mama Eki";
    case "jobs":
      return "Notice board";
    case "phone":
      return "Phone";
    case "map":
      return "Corridor";
    case "heritage":
      return "Bronze Shade";
    case "partner":
      return "Adesuwa";
    case "factions":
      return "The names";
    case "room":
      return "Ramat room";
    case "ledger":
      return "Rent ledger";
    case "sleep":
      return "Sleep";
    case "stall":
      return "Kiosk";
    default:
      return "Pause";
  }
}

function PanelFrame({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 mx-auto w-full max-w-lg px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <section className="max-h-[70dvh] overflow-y-auto rounded-3xl border border-line bg-bg/95 p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl leading-none">{title}</h2>
          <button type="button" className="min-h-11 rounded-full bg-surface px-4 text-sm" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function ToneButton({ title, detail, onClick }: { title: string; detail: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="min-h-11 rounded-xl border border-line bg-surface px-3 py-2 text-left">
      <span className="block">{title}</span>
      <span className="block text-xs text-muted">{detail}</span>
    </button>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line bg-surface text-fg"
    >
      {children}
    </button>
  );
}

function HoldButton({ label, onHold }: { label: string; onHold: (down: boolean) => void }) {
  return (
    <button
      type="button"
      className="min-h-11 rounded-full border border-line bg-surface px-3 text-sm"
      onPointerDown={() => onHold(true)}
      onPointerUp={() => onHold(false)}
      onPointerLeave={() => onHold(false)}
    >
      {label}
    </button>
  );
}

function Stick() {
  const ref = useRef<HTMLDivElement>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);

  function point(event: PointerEvent<HTMLDivElement>) {
    const node = ref.current;
    if (!node || !origin.current) return;
    const rect = node.getBoundingClientRect();
    const dx = (event.clientX - origin.current.x) / (rect.width * 0.45);
    const dy = (origin.current.y - event.clientY) / (rect.height * 0.45);
    pad.joy = true;
    pad.joyX = Math.max(-1, Math.min(1, dx));
    pad.joyY = Math.max(-1, Math.min(1, dy));
  }

  return (
    <div
      ref={ref}
      className="touch-controls relative h-28 w-28 shrink-0 rounded-full border border-line bg-surface/80"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        origin.current = { x: event.clientX, y: event.clientY };
        point(event);
      }}
      onPointerMove={(event) => {
        if (!origin.current) return;
        point(event);
      }}
      onPointerUp={() => {
        origin.current = null;
        pad.joy = false;
        pad.joyX = 0;
        pad.joyY = 0;
      }}
    >
      <span className="absolute top-1/2 left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
    </div>
  );
}

function Swatches({
  label,
  count,
  value,
  prefix,
  onPick,
}: {
  label: string;
  count: number;
  value: number;
  prefix: "skin" | "cloth";
  onPick: (index: number) => void;
}) {
  const tones = ["bg-skin-0", "bg-skin-1", "bg-skin-2", "bg-skin-3"];
  const cloths = ["bg-cloth-0", "bg-cloth-1", "bg-cloth-2", "bg-cloth-3"];
  const colors = prefix === "skin" ? tones : cloths;
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <div className="mt-1 flex gap-2">
        {Array.from({ length: count }, (_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`${label} ${index + 1}`}
            onClick={() => onPick(index)}
            className={`h-11 w-11 rounded-full ${colors[index]} ${value === index ? "ring-2 ring-brass" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
