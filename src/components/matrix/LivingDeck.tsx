import { useState } from "react";
import { LivingField } from "@/components/matrix/LivingField";
import { IDENTITY, SEAL_COPY } from "@/lib/matrix/catalog";
import { planCycle, priorityScore } from "@/lib/matrix/engine";
import { useMatrix } from "@/lib/matrix/store";

const RAILS = [
  ["key", "Key"],
  ["grid", "Provinces"],
  ["feed", "Feed"],
] as const;

type Rail = (typeof RAILS)[number][0];

export function LivingDeck() {
  const provinces = useMatrix((s) => s.provinces);
  const feed = useMatrix((s) => s.feed);
  const chainOk = useMatrix((s) => s.chainOk);
  const running = useMatrix((s) => s.running);
  const tick = useMatrix((s) => s.tick);
  const ledger = useMatrix((s) => s.ledger);
  const motion = useMatrix((s) => s.motion);
  const [focus, setFocus] = useState("matabeleland-north");
  const [rail, setRail] = useState<Rail>("key");

  const ranked = [...provinces].sort(
    (a, b) => priorityScore(b.factors) - priorityScore(a.factors),
  );
  const selected = provinces.find((province) => province.id === focus) ?? ranked[0];
  const protocol = useMatrix((s) => s.protocol);
  const plan = tick > 0 ? planCycle(tick) : null;
  const chain = chainOk === null ? "Arming" : chainOk ? "Intact" : "Review";

  return (
    <div className="deck">
      <div className="deck-stage flex flex-col gap-3">
        <LivingField
          provinces={provinces}
          focus={focus}
          running={running}
          reduce={motion === "reduce"}
          onFocus={setFocus}
        />
        {protocol.length > 0 ? (
          <ol className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {protocol.map((step) => (
              <li key={step.id} className="rounded-lg border border-line bg-panel px-2 py-2">
                <p className="text-xs font-semibold text-gold">{step.name}</p>
                <p className="text-xs leading-relaxed text-mist">{step.agent}</p>
              </li>
            ))}
          </ol>
        ) : null}
        <div className="rail-switch" aria-label="Matrix rails">
          {RAILS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={
                rail === id
                  ? "min-h-11 flex-1 rounded-full bg-gold text-sm font-semibold text-ink"
                  : "min-h-11 flex-1 rounded-full border border-line text-sm text-mist"
              }
              onClick={() => setRail(id)}
            >
              {label}
            </button>
          ))}
        </div>
        {selected ? (
          <section key={selected.id} className="focus-card rounded-xl border border-line bg-panel p-4">
            <p className="text-xs font-semibold tracking-widest text-gold">Focused province</p>
            <h2 className="font-display text-2xl leading-tight">{selected.name}</h2>
            <p className="mt-1 text-sm text-mist">
              Scenario priority {priorityScore(selected.factors).toFixed(2)} · population{" "}
              {selected.population.toLocaleString("en-GB")} ·{" "}
              {plan
                ? `${plan.agent} is on the ${plan.kind} turn`
                : "ZionCore is arming the first cycle"}
            </p>
          </section>
        ) : null}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <Status label="Ledger" value={chain} />
          <Status label="Cycle" value={running ? "Running" : "Paused"} />
          <Status label="Seals" value={`${ledger.length} held`} />
        </div>
      </div>

      <div className={`deck-side deck-key ${rail === "key" ? "is-open" : ""}`}>
        <section className="rounded-xl border border-line bg-panel p-4">
          <p className="text-xs font-semibold tracking-widest text-gold">The One Key</p>
          <h2 className="font-display text-xl leading-tight">MKEY merged</h2>
          <p className="mt-2 text-sm leading-relaxed text-ivory">{IDENTITY.identifier}</p>
          <p className="mt-2 text-sm leading-relaxed text-mist">
            {IDENTITY.founder}, {IDENTITY.office}. The identifier is a symbol on the board. It is not a password and it does not unlock a celestial system.
          </p>
          <ul className="mt-3 flex flex-col gap-1 text-sm text-ivory">
            {IDENTITY.numerals.map((numeral) => (
              <li key={numeral}>{numeral}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-line bg-panel p-4">
          <p className="text-xs font-semibold tracking-widest text-gold">Seven-layer seal</p>
          <ul className="mt-2 flex flex-col gap-2">
            {SEAL_COPY.map((seal, index) => (
              <li key={seal.id} className="seal-row flex items-start justify-between gap-3 text-sm">
                <span>
                  <span className="text-gold">{index + 1}</span> {seal.name}
                </span>
                <span className="shrink-0 text-mist">
                  {index === 3 && chainOk === false ? "Review" : "Live"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className={`deck-side deck-provinces ${rail === "grid" || rail === "feed" ? "is-open" : ""}`}>
        <section className={`rounded-xl border border-line bg-panel p-4 ${rail === "feed" ? "max-lg:hidden" : ""}`}>
          <p className="text-xs font-semibold tracking-widest text-gold">Transformation grid</p>
          <h2 className="font-display text-xl">Ten provinces</h2>
          <ol className="mt-3 flex flex-col gap-1">
            {ranked.map((province, index) => (
              <li key={province.id}>
                <button
                  type="button"
                  className={
                    province.id === focus
                      ? "flex min-h-11 w-full items-center justify-between rounded-lg bg-gold px-3 text-sm font-semibold text-ink"
                      : "flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-sm text-ivory"
                  }
                  onClick={() => setFocus(province.id)}
                >
                  <span>
                    {index + 1}. {province.name}
                  </span>
                  <span>{priorityScore(province.factors).toFixed(2)}</span>
                </button>
              </li>
            ))}
          </ol>
        </section>
        <section className={`rounded-xl border border-line bg-panel p-4 ${rail === "grid" ? "max-lg:hidden" : ""}`}>
          <p className="text-xs font-semibold tracking-widest text-gold">Command feed</p>
          {feed.length === 0 ? (
            <p className="mt-2 text-sm text-mist">
              The first sealed note appears when ZionCore finishes a turn.
            </p>
          ) : (
            <ul className="mt-2 flex flex-col gap-3">
              {feed.slice(0, 4).map((item) => (
                <li key={item.id} className="feed-line">
                  <p className="text-xs text-gold">{item.agent}</p>
                  <p className="text-sm leading-relaxed text-mist">{item.summary}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Status({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel-2 px-2 py-3">
      <p className="text-mist">{label}</p>
      <p className="mt-1 font-display text-sm text-ivory">{value}</p>
    </div>
  );
}
