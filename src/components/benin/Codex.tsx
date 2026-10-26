import { ROADMAP, SUGGESTIONS, WONDERS } from "@/game/codex";

export function Codex({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-bg/95 text-fg">
      <header className="safe-top flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <p className="text-xs tracking-[0.18em] text-brass uppercase">Production floor</p>
          <h2 className="font-display text-2xl leading-none">Iron and bronze</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 rounded-full border border-line bg-surface px-4 text-sm text-fg"
        >
          Close
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <p className="max-w-3xl text-sm leading-relaxed text-muted">
          Forty living systems and thirty wonders for BENIN LIFE. This is the city design: Benin City,
          not a borrowed coast. The playable slice already runs the promise ledger, four respects, heat,
          and Adesuwa. The rest is the build order, not a wishlist of missions.
        </p>
        {SUGGESTIONS.map((item) => (
          <article key={item.n} className="mt-4 border-t border-line pt-4">
            <p className="text-xs tracking-wide text-brass uppercase">
              {String(item.n).padStart(2, "0")} · {item.cluster}
            </p>
            <h3 className="font-display text-xl leading-tight">{item.name}</h3>
            <dl className="mt-2 grid gap-2 text-sm leading-relaxed">
              <div>
                <dt className="text-muted">Fantasy</dt>
                <dd>{item.fantasy}</dd>
              </div>
              <div>
                <dt className="text-muted">Choice</dt>
                <dd>{item.choice}</dd>
              </div>
              <div>
                <dt className="text-muted">Systems</dt>
                <dd>{item.systems}</dd>
              </div>
              <div>
                <dt className="text-muted">Ground</dt>
                <dd>{item.flavor}</dd>
              </div>
              <div>
                <dt className="text-muted">Long game</dt>
                <dd>{item.depth}</dd>
              </div>
            </dl>
          </article>
        ))}
        <h2 className="font-display mt-8 text-2xl">Thirty wonders</h2>
        <ol className="mt-3 grid gap-3">
          {WONDERS.map((wonder) => (
            <li key={wonder.n} className="rounded-2xl border border-line bg-surface px-3 py-3">
              <p className="text-xs text-brass">
                {String(wonder.n).padStart(2, "0")}
              </p>
              <p className="font-display text-lg leading-tight">{wonder.name}</p>
              <p className="mt-1 text-sm leading-relaxed">{wonder.what}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{wonder.why}</p>
            </li>
          ))}
        </ol>
        <h2 className="font-display mt-8 text-2xl">Build this first</h2>
        <ol className="mt-3 mb-10 grid gap-2 text-sm leading-relaxed">
          {ROADMAP.map((step, index) => (
            <li key={step} className="rounded-2xl bg-surface-2 px-3 py-3">
              <span className="text-brass">{index + 1}. </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
