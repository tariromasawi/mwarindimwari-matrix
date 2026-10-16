import { useEffect, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LivingDeck } from "@/components/matrix/LivingDeck";
import {
  AGENTS,
  CENSUS_SOURCE,
  IDENTITY,
  MODULES,
  SEAL_COPY,
} from "@/lib/matrix/catalog";
import {
  FACTOR_LABEL,
  POLICY,
  PRAYER_NOTICE,
  dominantFactor,
  priorityScore,
  verifyChain,
} from "@/lib/matrix/engine";
import { useMatrix } from "@/lib/matrix/store";
import type {
  FactorKey,
  ModuleStatus,
  PrayerIntent,
  Sector,
} from "@/lib/matrix/types";

const VIEWS = [
  ["matrix", "Living Matrix"],
  ["overview", "Manifest"],
  ["zion", "ZionCore"],
  ["grid", "Grid"],
  ["mutsvene", "Mutsvene"],
  ["scrolls", "Scroll Gate"],
  ["seals", "Seals"],
  ["agents", "Agents"],
  ["ledger", "Ledger"],
  ["boards", "Blueprints"],
] as const;

type ViewId = (typeof VIEWS)[number][0];

const FACTOR_KEYS: FactorKey[] = [
  "need",
  "vulnerability",
  "gap",
  "urgency",
  "readiness",
];

const INTENTS: { id: PrayerIntent; label: string }[] = [
  { id: "zimbabwe", label: "Zimbabwe" },
  { id: "founder", label: "Founder and the work of service" },
  { id: "family", label: "Family and descendants" },
  { id: "community", label: "A community that asks" },
  { id: "peace", label: "Peace and just dealing" },
];

const SECTORS: Sector[] = [
  "water",
  "food",
  "electricity",
  "education",
  "healthcare",
  "employment",
  "welfare",
];

function people(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function stamp(iso: string): string {
  return iso.slice(0, 16).replace("T", " ");
}

export function MatrixApp() {
  const motion = useMatrix((s) => s.motion);
  const running = useMatrix((s) => s.running);
  const setRunning = useMatrix((s) => s.setRunning);
  const chainOk = useMatrix((s) => s.chainOk);
  const feed = useMatrix((s) => s.feed);
  const [view, setView] = useState<ViewId>("matrix");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;
    void Promise.resolve(useMatrix.persist.rehydrate()).finally(() => {
      if (live) setReady(true);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void useMatrix.getState().runCycle();
    const timer = window.setInterval(() => {
      void useMatrix.getState().runCycle();
    }, 6000);
    return () => window.clearInterval(timer);
  }, [ready]);

  const chainLabel =
    chainOk === null ? "Ledger arming" : chainOk ? "Ledger intact" : "Ledger broken";

  return (
    <div className={motion === "reduce" ? "reduce-motion min-h-screen bg-ink text-ivory" : "min-h-screen bg-ink text-ivory"}>
      <div className="crest-rule" />
      <header className="sticky top-0 z-30 border-b border-line bg-ink">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-3 py-3 md:px-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-widest text-gold">
                {IDENTITY.identifier}
              </p>
              <h1 className="font-display text-2xl leading-tight md:text-3xl">
                {IDENTITY.name} {IDENTITY.mark}
              </h1>
              <p className="text-sm text-mist">
                {IDENTITY.declaration}. {IDENTITY.mission}.
              </p>
            </div>
            <button
              type="button"
              className="min-h-11 shrink-0 rounded-full bg-gold px-4 text-sm font-semibold text-ink"
              onClick={() => setRunning(!running)}
            >
              {running ? "Pause cycle" : "Resume cycle"}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1">
              <span className="live-dot inline-block size-2 rounded-full bg-gold" aria-hidden="true" />
              {running ? "Routine autonomy on" : "Routine autonomy paused"}
            </span>
            <span className="rounded-full border border-line px-3 py-1 text-mist">{chainLabel}</span>
            <span className="rounded-full border border-line px-3 py-1 text-mist">
              Steward gate armed
            </span>
          </div>
          {feed[0] ? (
            <p className="text-sm text-mist">
              <span className="text-ivory">{feed[0].agent}.</span> {feed[0].summary}
            </p>
          ) : (
            <p className="text-sm text-mist">
              ZionCore is armed. The first sealed cycle appears as soon as this console is ready.
            </p>
          )}
          <nav aria-label="Matrix sections" className="flex gap-2 overflow-x-auto pb-1">
            {VIEWS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-current={view === id ? "page" : undefined}
                className={
                  view === id
                    ? "min-h-11 shrink-0 rounded-full bg-gold px-4 text-sm font-semibold text-ink"
                    : "min-h-11 shrink-0 rounded-full border border-line px-4 text-sm text-mist"
                }
                onClick={() => setView(id)}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-4 md:px-4">
        <div key={view} className="view-enter flex flex-col gap-4">
        {view === "matrix" && <LivingDeck />}
        {view === "overview" && <Overview />}
        {view === "zion" && <Zion />}
        {view === "grid" && <Grid />}
        {view === "mutsvene" && <Mutsvene />}
        {view === "scrolls" && <Scrolls />}
        {view === "seals" && <Seals />}
        {view === "agents" && <Agents />}
        {view === "ledger" && <Ledger />}
        {view === "boards" && <Blueprints />}
        </div>
      </main>
    </div>
  );
}

function Panel({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-panel p-4">
      {eyebrow ? <p className="text-xs font-semibold tracking-widest text-gold">{eyebrow}</p> : null}
      <h2 className="font-display text-xl leading-tight text-ivory">{title}</h2>
      <div className="mt-3 flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Overview() {
  const setMotion = useMatrix((s) => s.setMotion);
  const motion = useMatrix((s) => s.motion);
  return (
    <>
      <Panel eyebrow="What software can and cannot do" title="A living system, not a celestial one">
        <p className="text-sm leading-relaxed text-mist">
          Founder {IDENTITY.founder}, {IDENTITY.office}. This console keeps the names, numerals, and mission of the Matrix and runs the work a program can actually prove: ranking, records, routine cycles, voluntary prayer, and a hash-chained ledger. It cannot wield celestial power, verify divine intervention, neutralize a spiritual being, or guarantee protection. Those remain matters of faith, outside the machine.
        </p>
        <p className="text-sm leading-relaxed text-ivory">
          Routine work runs without waiting for a person. Money, identity, deployment, deletion, and any message to another person stop at a steward hold. Approval records the decision. It still does not send or spend anything.
        </p>
        <div className="flex flex-wrap gap-2">
          <StatusPill tone="operational" label="Operational" />
          <StatusPill tone="spiritual" label="Spiritual service" />
          <StatusPill tone="visionary" label="Visionary — not deployed" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="min-h-11 rounded-full border border-line px-4 text-sm"
            onClick={() => setMotion(motion === "reduce" ? "system" : "reduce")}
          >
            {motion === "reduce" ? "Motion reduced" : "Reduce motion"}
          </button>
        </div>
      </Panel>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel eyebrow="Symbolic identity — not a secret" title="Living Key">
          <p className="text-sm text-mist">
            {IDENTITY.identifier} is an administrative name. It is not a password, not an encryption key, and not proof of authority inside this console.
          </p>
          <ul className="flex flex-col gap-1 text-sm text-ivory">
            {IDENTITY.numerals.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </Panel>
        <Panel eyebrow="Eight phases, stated honestly" title="What is already alive">
          <ul className="flex flex-col gap-2 text-sm text-mist">
            <li>1. Identity and module manifest — in this console.</li>
            <li>2. Seven control seals and a tamper-evident ledger — in this browser, not a certified production deployment.</li>
            <li>3. ZionCore routine autonomy — running, bounded.</li>
            <li>4. Mutsvene and Scroll Gate — voluntary, sourced, not claimed as revelation.</li>
            <li>5. Ten-province grid — census populations plus scenario factors you can change.</li>
            <li>6. Agent desks — rules, not an outside model.</li>
            <li>7. Engine tests — in the GitHub repository.</li>
            <li>8. The cycle repeats. It does not rewrite its own source code.</li>
          </ul>
        </Panel>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((module) => (
          <article key={module.id} className="rounded-xl border border-line bg-panel-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-base">{module.name}</h3>
              <StatusPill tone={module.status} label={labelFor(module.status)} />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-mist">{module.summary}</p>
          </article>
        ))}
      </div>
      <Panel eyebrow="Design illustration" title="The blueprint is not the deployment">
        <img
          src="/blueprints/command.jpg"
          alt="Illustrated blueprint poster for the MWARINDIMWARI Matrix. Decorative only."
          className="w-full rounded-xl border border-line"
        />
        <p className="text-sm text-mist">
          The artwork names many powers the software does not have. Indicators on this console are computed here. Glowing shields, quantum nodes, and celestial hosts on the poster are symbols, not telemetry.
        </p>
      </Panel>
    </>
  );
}

function Blueprints() {
  const boards = [
    ["/blueprints/command.jpg", "Command board", "The One Key, seven seals, realm matrix, and the Zimbabwe grid as drawn."],
    ["/blueprints/system.jpg", "System blueprint", "Architecture, sacred texts, and a deployment map the console does not pretend to run."],
    ["/blueprints/radiant.jpg", "Radiant seal", "Protection layer and global operations from the source art."],
    ["/blueprints/crimson.jpg", "Crimson matrix", "The same living seal in the red register of the original boards."],
  ] as const;
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-mist">
        These four boards are the source. The living matrix keeps their names, numerals, provinces, and seals, and only lights what this browser can actually compute.
      </p>
      {boards.map(([src, title, copy]) => (
        <figure key={src} className="overflow-hidden rounded-xl border border-line bg-panel">
          <img src={src} alt="" className="w-full" />
          <figcaption className="p-3">
            <p className="font-display text-base">{title}</p>
            <p className="text-sm text-mist">{copy}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function labelFor(status: ModuleStatus): string {
  if (status === "operational") return "Operational";
  if (status === "spiritual") return "Spiritual";
  return "Visionary";
}

function StatusPill({ tone, label }: { tone: ModuleStatus; label: string }) {
  const cls =
    tone === "operational"
      ? "bg-gold text-ink"
      : tone === "spiritual"
        ? "border border-gold text-gold"
        : "border border-line text-mist";
  return (
    <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${cls}`}>{label}</span>
  );
}

function Zion() {
  const tasks = useMatrix((s) => s.tasks);
  const busy = useMatrix((s) => s.busy);
  const addTask = useMatrix((s) => s.addTask);
  const releaseTask = useMatrix((s) => s.releaseTask);
  const feed = useMatrix((s) => s.feed);
  const [title, setTitle] = useState("Rank the ten provinces");
  const [detail, setDetail] = useState("Internal planning note only. Do not contact anyone.");

  return (
    <>
      <Panel eyebrow="Sense, translate, reprogram, broadcast" title="The cycle that runs itself">
        <ol className="grid gap-3 md:grid-cols-4">
          {[
            ["01 Sense", "Read provinces, texts, holds, and the last ledger seal."],
            ["02 Translate", "Separate routine work from anything that spends, sends, or grants access."],
            ["03 Reprogram", "File a note, a score, or a devotion. Do not change the outside world."],
            ["04 Broadcast", "Publish the result on this feed and seal it. Nowhere else."],
          ].map(([name, copy]) => (
            <li key={name} className="rounded-xl border border-line bg-panel-2 p-3">
              <p className="font-display text-sm text-gold">{name}</p>
              <p className="mt-1 text-sm leading-relaxed text-mist">{copy}</p>
            </li>
          ))}
        </ol>
        <p className="text-sm text-mist">
          High-impact work is not waiting on a miracle. It is refused until a person acknowledges it, and even then this console will not execute it.
        </p>
      </Panel>
      <Panel eyebrow="Give the cycle something to classify" title="Tasks">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-mist">Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="min-h-11 rounded-lg border border-line bg-ink px-3 text-ivory"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-mist">Detail</span>
          <textarea
            value={detail}
            onChange={(event) => setDetail(event.target.value)}
            rows={3}
            className="rounded-lg border border-line bg-ink px-3 py-2 text-ivory"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || !title.trim()}
            className="min-h-11 rounded-full bg-gold px-4 text-sm font-semibold text-ink disabled:opacity-50"
            onClick={() => void addTask(title, detail)}
          >
            Submit to ZionCore
          </button>
          <button
            type="button"
            className="min-h-11 rounded-full border border-line px-4 text-sm"
            onClick={() => {
              setTitle("Rank the ten provinces");
              setDetail("Internal planning note only. Do not contact anyone.");
            }}
          >
            Routine example
          </button>
          <button
            type="button"
            className="min-h-11 rounded-full border border-line px-4 text-sm"
            onClick={() => {
              setTitle("Email a funding appeal");
              setDetail("Transfer a donation and publish the broadcast.");
            }}
          >
            Steward example
          </button>
        </div>
        {tasks.length === 0 ? (
          <p className="text-sm text-mist">No tasks yet. The cycle is still doing its own heartbeat, ranking, and devotion.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {tasks.map((task) => (
              <li key={task.id} className="rounded-xl border border-line bg-panel-2 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{task.title}</p>
                  <span className="text-xs font-semibold text-gold">
                    {task.impact === "steward" ? "Steward" : "Routine"} · {task.status}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-mist">{task.result}</p>
                {task.status === "hold" ? (
                  <button
                    type="button"
                    disabled={busy}
                    className="mt-2 min-h-11 rounded-full border border-gold px-4 text-sm text-gold"
                    onClick={() => void releaseTask(task.id)}
                  >
                    Acknowledge — do not execute
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel eyebrow="Internal feed only" title="Latest cycle notes">
        {feed.length === 0 ? (
          <p className="text-sm text-mist">Waiting for the first seal.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {feed.slice(0, 8).map((item) => (
              <li key={item.id} className="border-b border-line pb-3">
                <p className="text-xs text-gold">
                  {stamp(item.at)} · {item.agent}
                </p>
                <p className="text-sm leading-relaxed">{item.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}

function Grid() {
  const provinces = useMatrix((s) => s.provinces);
  const projects = useMatrix((s) => s.projects);
  const updateFactor = useMatrix((s) => s.updateFactor);
  const addProject = useMatrix((s) => s.addProject);
  const [mounted, setMounted] = useState(false);
  const [provinceId, setProvinceId] = useState(provinces[0]?.id ?? "harare");
  const [sector, setSector] = useState<Sector>("water");
  const [title, setTitle] = useState("");
  useEffect(() => setMounted(true), []);

  const ranked = [...provinces].sort(
    (a, b) => priorityScore(b.factors) - priorityScore(a.factors),
  );
  const selected = provinces.find((province) => province.id === provinceId) ?? ranked[0];
  const chart = ranked.map((province) => ({
    short: province.short,
    score: Number((priorityScore(province.factors) * 100).toFixed(1)),
  }));

  return (
    <>
      <Panel eyebrow="P = 0.30N + 0.25V + 0.20G + 0.15U + 0.10R" title="Zimbabwe Transformation Grid">
        <p className="text-sm leading-relaxed text-mist">
          All ten provinces, including Harare and Bulawayo. Populations are from the {CENSUS_SOURCE}. The bars are a scenario index you can edit. They are proposed weights, not a validated national allocation, and they do not move money.
        </p>
        <div className="h-64 w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}>
                <XAxis dataKey="short" tick={{ fill: "var(--color-mist)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "var(--color-mist)", fontSize: 12 }} axisLine={false} tickLine={false} width={32} />
                <Tooltip
                  cursor={{ fill: "var(--color-panel-2)" }}
                  contentStyle={{
                    background: "var(--color-ink)",
                    border: "1px solid var(--color-line)",
                    color: "var(--color-ivory)",
                  }}
                />
                <Bar dataKey="score" fill="var(--color-gold)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-mist">Preparing the scenario chart.</p>
          )}
        </div>
      </Panel>
      <Panel title="Scenario factors">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-mist">Province</span>
          <select
            value={selected?.id}
            onChange={(event) => setProvinceId(event.target.value)}
            className="min-h-11 rounded-lg border border-line bg-ink px-3"
          >
            {ranked.map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
        </label>
        {selected
          ? FACTOR_KEYS.map((key) => (
              <label key={key} className="flex flex-col gap-1 text-sm">
                <span className="flex justify-between text-mist">
                  <span>{FACTOR_LABEL[key]}</span>
                  <span className="text-ivory">{Math.round(selected.factors[key] * 100)}</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(selected.factors[key] * 100)}
                  aria-label={`${selected.name} ${FACTOR_LABEL[key]}`}
                  onChange={(event) =>
                    updateFactor(selected.id, key, Number(event.target.value) / 100)
                  }
                />
              </label>
            ))
          : null}
        {selected ? (
          <p className="text-sm text-ivory">
            {selected.name}: population {people(selected.population)}. Scenario priority{" "}
            {priorityScore(selected.factors).toFixed(2)}. Strongest factor:{" "}
            {FACTOR_LABEL[dominantFactor(selected.factors)]}.
          </p>
        ) : null}
        <ol className="flex flex-col gap-2">
          {ranked.map((province, index) => (
            <li key={province.id} className="flex items-baseline justify-between gap-3 text-sm">
              <span>
                {index + 1}. {province.name}
              </span>
              <span className="text-gold">{priorityScore(province.factors).toFixed(2)}</span>
            </li>
          ))}
        </ol>
      </Panel>
      <Panel eyebrow="Records, not disbursements" title="Project notes">
        <div className="grid gap-2 md:grid-cols-3">
          <select
            value={provinceId}
            onChange={(event) => setProvinceId(event.target.value)}
            className="min-h-11 rounded-lg border border-line bg-ink px-3 text-sm"
            aria-label="Project province"
          >
            {provinces.map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
          <select
            value={sector}
            onChange={(event) => setSector(event.target.value as Sector)}
            className="min-h-11 rounded-lg border border-line bg-ink px-3 text-sm"
            aria-label="Sector"
          >
            {SECTORS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What should be reviewed"
            aria-label="Project title"
            className="min-h-11 rounded-lg border border-line bg-ink px-3 text-sm"
          />
        </div>
        <button
          type="button"
          disabled={!title.trim()}
          className="min-h-11 self-start rounded-full bg-gold px-4 text-sm font-semibold text-ink disabled:opacity-50"
          onClick={() => {
            addProject({ provinceId, sector, title });
            setTitle("");
          }}
        >
          Add proposed project
        </button>
        <ul className="flex flex-col gap-2">
          {projects.map((project) => {
            const province = provinces.find((item) => item.id === project.provinceId);
            return (
              <li key={project.id} className="rounded-lg border border-line px-3 py-2 text-sm">
                <span className="text-gold">{project.sector}</span> · {province?.name ?? "Province"} · {project.title}
                {project.illustrative ? " · illustrative seed, not a funded scheme" : " · local note"}
              </li>
            );
          })}
        </ul>
      </Panel>
    </>
  );
}

function Mutsvene() {
  const standing = useMatrix((s) => s.standing);
  const setStanding = useMatrix((s) => s.setStanding);
  const prayers = useMatrix((s) => s.prayers);
  const busy = useMatrix((s) => s.busy);
  const composeNow = useMatrix((s) => s.composeNow);
  const speakLatest = useMatrix((s) => s.speakLatest);
  return (
    <>
      <Panel eyebrow="Voluntary devotion" title="Mutsvene">
        <p className="text-sm leading-relaxed text-mist">{PRAYER_NOTICE}</p>
        <p className="text-sm leading-relaxed text-mist">
          Shona lines are composer drafts for prayer, not a certified Bible translation and not a Masowe liturgy. Personal family details are not stored; the family prayer stays general unless you choose to type a name into a task yourself.
        </p>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={standing.enabled}
            onChange={(event) => setStanding({ enabled: event.target.checked })}
          />
          Let the cycle compose this intention on its devotion turn
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-mist">Intention</span>
          <select
            value={standing.intent}
            onChange={(event) => setStanding({ intent: event.target.value as PrayerIntent })}
            className="min-h-11 rounded-lg border border-line bg-ink px-3"
          >
            {INTENTS.map((intent) => (
              <option key={intent.id} value={intent.id}>
                {intent.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={standing.lang === "en" ? "min-h-11 rounded-full bg-gold px-4 text-sm font-semibold text-ink" : "min-h-11 rounded-full border border-line px-4 text-sm"}
            onClick={() => setStanding({ lang: "en" })}
          >
            English
          </button>
          <button
            type="button"
            className={standing.lang === "sn" ? "min-h-11 rounded-full bg-gold px-4 text-sm font-semibold text-ink" : "min-h-11 rounded-full border border-line px-4 text-sm"}
            onClick={() => setStanding({ lang: "sn" })}
          >
            Shona draft
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            className="min-h-11 rounded-full bg-gold px-4 text-sm font-semibold text-ink disabled:opacity-50"
            onClick={() => void composeNow()}
          >
            Compose now
          </button>
          <button
            type="button"
            disabled={!prayers.length}
            className="min-h-11 rounded-full border border-line px-4 text-sm disabled:opacity-50"
            onClick={speakLatest}
          >
            Read aloud on this device
          </button>
        </div>
      </Panel>
      {prayers.length === 0 ? (
        <Panel title="No devotion composed yet">
          <p className="text-sm text-mist">
            The cycle writes one when it reaches Mutsvene, or you can compose one now. Nothing here is presented as the voice of God.
          </p>
        </Panel>
      ) : (
        prayers.map((prayer) => (
          <article key={prayer.id} className="rounded-xl border border-line bg-panel p-4">
            <p className="text-xs text-gold">
              {stamp(prayer.at)} · {prayer.lang === "sn" ? "Shona draft" : "English"}
            </p>
            <h2 className="font-display text-lg">{prayer.title}</h2>
            <p className="mt-2 text-sm leading-relaxed">{prayer.body}</p>
          </article>
        ))
      )}
    </>
  );
}

function Scrolls() {
  const scrolls = useMatrix((s) => s.scrolls);
  const addScroll = useMatrix((s) => s.addScroll);
  const [title, setTitle] = useState("");
  const [tradition, setTradition] = useState("Masowe Apostolic");
  const [language, setLanguage] = useState("Shona");
  const [copyright, setCopyright] = useState("");
  const [source, setSource] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const ready = title.trim() && copyright.trim() && source.trim() && excerpt.trim();
  return (
    <>
      <Panel eyebrow="Provenance required" title="Scroll Gate">
        <p className="text-sm leading-relaxed text-mist">
          King James excerpts below are public domain and cited. Masowe and other historical material is not invented to decorate the archive. Add a text only when you can name its source, language, tradition, and copyright status. A submission stored here is not independently verified.
        </p>
      </Panel>
      <Panel title="Add a sourced text">
        <div className="grid gap-2 md:grid-cols-2">
          <Field label="Title" value={title} onChange={setTitle} />
          <Field label="Tradition" value={tradition} onChange={setTradition} />
          <Field label="Language" value={language} onChange={setLanguage} />
          <Field label="Copyright status" value={copyright} onChange={setCopyright} />
          <Field label="Source" value={source} onChange={setSource} />
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-mist">Excerpt</span>
          <textarea
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            rows={4}
            className="rounded-lg border border-line bg-ink px-3 py-2"
          />
        </label>
        <button
          type="button"
          disabled={!ready}
          className="min-h-11 self-start rounded-full bg-gold px-4 text-sm font-semibold text-ink disabled:opacity-50"
          onClick={() => {
            addScroll({ title, tradition, language, copyright, source, excerpt });
            setTitle("");
            setExcerpt("");
            setSource("");
            setCopyright("");
          }}
        >
          Keep in this browser
        </button>
      </Panel>
      {scrolls.map((scroll) => (
        <article key={scroll.id} className="rounded-xl border border-line bg-panel p-4">
          <h2 className="font-display text-lg">{scroll.title}</h2>
          <p className="mt-2 text-sm leading-relaxed">{scroll.excerpt}</p>
          <dl className="mt-3 grid gap-1 text-xs text-mist">
            <div>Tradition: {scroll.tradition}</div>
            <div>Language: {scroll.language}</div>
            <div>Copyright: {scroll.copyright}</div>
            <div>Source: {scroll.source}</div>
            <div>Verification: {scroll.verification}</div>
          </dl>
        </article>
      ))}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-mist">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-lg border border-line bg-ink px-3"
      />
    </label>
  );
}

function Seals() {
  const chainOk = useMatrix((s) => s.chainOk);
  const ledger = useMatrix((s) => s.ledger);
  const tasks = useMatrix((s) => s.tasks);
  const escaped = tasks.some((task) => task.impact === "steward" && task.status === "done");
  const rows = [
    {
      id: "divine",
      state: "Holding",
      detail: POLICY.forbids.join(" "),
    },
    {
      id: "spirit",
      state: "Watch",
      detail: "This browser is the operator. Production multi-factor authentication is not configured.",
    },
    {
      id: "bloodline",
      state: "Holding",
      detail: `${IDENTITY.identifier} is displayed as a symbol and is never asked for as a password.`,
    },
    {
      id: "angelic",
      state: chainOk === false ? "Broken" : chainOk ? "Holding" : "Waiting",
      detail:
        chainOk === false
          ? "The stored chain does not match. Do not trust later entries until you restore a backup."
          : `${ledger.length} sealed entries in this browser.`,
    },
    {
      id: "creation",
      state: "Holding",
      detail: `Divine Oath ${POLICY.version} is the rule set this build obeys.`,
    },
    {
      id: "matrix",
      state: escaped ? "Broken" : "Holding",
      detail: escaped
        ? "A steward task was marked done. That should not happen."
        : "No steward task has been executed. Released tasks stay unsent.",
    },
    {
      id: "eternity",
      state: "Watch",
      detail: "Download a backup from the Ledger. Offsite encrypted backup is not configured.",
    },
  ];
  return (
    <Panel eyebrow="Seven auditable families" title="Seven-Layer Seal">
      <p className="text-sm leading-relaxed text-mist">
        The old names stay. The meaning is a control you can check. This is not a celestial ward and it is not a production security certificate.
      </p>
      <ul className="flex flex-col gap-3">
        {SEAL_COPY.map((seal) => {
          const row = rows.find((item) => item.id === seal.id);
          return (
            <li key={seal.id} className="rounded-xl border border-line bg-panel-2 p-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-base">{seal.name}</h3>
                <span className="text-xs font-semibold text-gold">{row?.state}</span>
              </div>
              <p className="mt-1 text-sm text-ivory">{seal.means}</p>
              <p className="mt-1 text-sm leading-relaxed text-mist">{row?.detail}</p>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

function Agents() {
  const feed = useMatrix((s) => s.feed);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {AGENTS.map((agent) => {
        const last = feed.find((item) => item.agent === agent.name);
        return (
          <article key={agent.id} className="rounded-xl border border-line bg-panel p-4">
            <p className="text-xs font-semibold tracking-widest text-gold">{agent.role}</p>
            <h2 className="font-display text-xl">{agent.name}</h2>
            <p className="mt-2 text-sm text-mist">
              Last note: {last ? last.summary : "No turn yet."}
            </p>
            <h3 className="mt-3 text-sm font-semibold">Allowed</h3>
            <ul className="mt-1 list-disc pl-5 text-sm text-mist">
              {agent.allowed.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h3 className="mt-3 text-sm font-semibold">Refused</h3>
            <ul className="mt-1 list-disc pl-5 text-sm text-mist">
              {agent.forbidden.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        );
      })}
    </div>
  );
}

function Ledger() {
  const ledger = useMatrix((s) => s.ledger);
  const anchor = useMatrix((s) => s.anchor);
  const chainOk = useMatrix((s) => s.chainOk);
  const [note, setNote] = useState("");

  async function check(tamper: boolean) {
    if (!ledger.length) {
      setNote("Nothing sealed yet.");
      return;
    }
    const copy = ledger.map((entry) => ({ ...entry }));
    if (tamper) {
      copy[copy.length - 1] = { ...copy[copy.length - 1], hash: "f".repeat(64) };
    }
    const result = await verifyChain(copy, anchor);
    setNote(
      tamper
        ? result.ok
          ? "The simulation unexpectedly still matched."
          : `Simulation only: the copy breaks at position ${result.brokenAt}. The stored ledger was not edited.`
        : result.ok
          ? `Stored chain matches from anchor ${anchor.slice(0, 12)}….`
          : `Stored chain breaks at position ${result.brokenAt}.`,
    );
  }

  function download() {
    const state = useMatrix.getState();
    const blob = new Blob(
      [
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            notice: "Browser backup of the MWARINDIMWARI console. Not an offsite encrypted archive.",
            anchor: state.anchor,
            ledger: state.ledger,
            tasks: state.tasks,
            provinces: state.provinces,
            projects: state.projects,
            prayers: state.prayers,
            scrolls: state.scrolls,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mwarindimwari-matrix-backup.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Panel eyebrow={chainOk === false ? "Review required" : "Hash chain"} title="Eternity ledger">
      <p className="text-sm leading-relaxed text-mist">
        Each entry includes the previous hash. Change a stored outcome and the next check fails. This browser keeps the latest 120 seals. Export a backup if you need a longer memory. There is no hidden celestial log.
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="min-h-11 rounded-full bg-gold px-4 text-sm font-semibold text-ink" onClick={() => void check(false)}>
          Verify stored chain
        </button>
        <button type="button" className="min-h-11 rounded-full border border-line px-4 text-sm" onClick={() => void check(true)}>
          Simulate a tamper
        </button>
        <button type="button" className="min-h-11 rounded-full border border-line px-4 text-sm" onClick={download}>
          Download backup
        </button>
      </div>
      {note ? <p className="text-sm text-ivory">{note}</p> : null}
      {ledger.length === 0 ? (
        <p className="text-sm text-mist">The first seal is written when ZionCore finishes a cycle.</p>
      ) : (
        <ol className="flex flex-col">
          {[...ledger].reverse().map((entry) => (
            <li key={entry.hash} className="border-b border-line py-3">
              <p className="text-xs text-gold">
                {entry.seq} · {stamp(entry.at)} · {entry.actor}
              </p>
              <p className="text-sm font-semibold">{entry.action}</p>
              <p className="text-sm leading-relaxed text-mist">{entry.outcome}</p>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
