import { useState, type ReactNode } from "react";
import {
  attributes,
  execution,
  KEY_REGISTRY,
  realms,
  shields,
  timeLines,
  workstreams,
  type BoardLine,
} from "@/lib/matrix/blueprint";
import { IDENTITY } from "@/lib/matrix/catalog";
import { useMatrix } from "@/lib/matrix/store";

function Lines({ items }: { items: BoardLine[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item.name} className="rounded-lg border border-line bg-panel-2 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">{item.name}</p>
            <span className="text-xs font-semibold text-gold">{item.state}</span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-mist">{item.detail}</p>
        </li>
      ))}
    </ul>
  );
}

function Block({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-panel p-4">
      <p className="text-xs font-semibold tracking-widest text-gold">{eyebrow}</p>
      <h2 className="font-display text-xl leading-tight">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function CommandBoard() {
  const provinces = useMatrix((s) => s.provinces);
  const projects = useMatrix((s) => s.projects);
  const scrolls = useMatrix((s) => s.scrolls);
  const prayers = useMatrix((s) => s.prayers);
  const tasks = useMatrix((s) => s.tasks);
  const ledger = useMatrix((s) => s.ledger);
  const tick = useMatrix((s) => s.tick);
  const running = useMatrix((s) => s.running);
  const chainOk = useMatrix((s) => s.chainOk);
  const anchor = useMatrix((s) => s.anchor);
  const protocol = useMatrix((s) => s.protocol);
  const askCounsel = useMatrix((s) => s.askCounsel);
  const busy = useMatrix((s) => s.busy);
  const [question, setQuestion] = useState("What does the grid say about Matabeleland North?");
  const [answer, setAnswer] = useState("");

  const input = {
    provinces,
    projects,
    scrolls: scrolls.length,
    prayers: prayers.length,
    holds: tasks.filter((task) => task.status === "hold").length,
    ledger: ledger.length,
    tick,
    running,
    chain: (chainOk === false ? "review" : chainOk ? "intact" : "unsealed") as
      | "intact"
      | "review"
      | "unsealed",
    anchor,
  };

  return (
    <div className="flex flex-col gap-4">
      <Block eyebrow="Command protocol" title="Eight steps, executed here">
        <p className="mb-3 text-sm leading-relaxed text-mist">
          Each cycle now runs the eight names on the command board. The result is a sealed note in this browser. Celestial claims on the poster stay marked Symbol or Refused.
        </p>
        {protocol.length === 0 ? (
          <p className="text-sm text-mist">The first full protocol lands with the next cycle.</p>
        ) : (
          <ol className="grid gap-2 md:grid-cols-2">
            {protocol.map((step, index) => (
              <li key={step.id} className="rounded-lg border border-line bg-panel-2 px-3 py-2">
                <p className="text-xs font-semibold text-gold">
                  {String(index + 1).padStart(2, "0")} · {step.agent}
                </p>
                <p className="font-display text-base">{step.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-mist">{step.outcome}</p>
              </li>
            ))}
          </ol>
        )}
      </Block>
      <div className="grid gap-4 lg:grid-cols-2">
        <Block eyebrow="The One Key" title="Registry, not a secret">
          <p className="mb-3 text-sm text-mist">
            {IDENTITY.founder}. Board birth note: {IDENTITY.boardBorn}. {IDENTITY.boardBornNote}
          </p>
          <Lines items={[...KEY_REGISTRY]} />
        </Block>
        <Block eyebrow="Key attributes" title="What the checks actually mean">
          <Lines items={attributes()} />
        </Block>
        <Block eyebrow="Realm matrix" title="Each realm name, accounted for">
          <Lines items={realms(input)} />
        </Block>
        <Block eyebrow="Global operations" title="The mission list as a queue">
          <Lines items={workstreams(input)} />
        </Block>
        <Block eyebrow="Time matrix" title="Clock, ledger, and poster years">
          <Lines items={timeLines(input)} />
        </Block>
        <Block eyebrow="Protection shield" title="Controls, not armour">
          <Lines items={shields(input)} />
        </Block>
        <Block eyebrow="Execution status" title="Complete only where the console finished">
          <Lines items={execution(input)} />
        </Block>
        <Block eyebrow="Grok Masawi" title="Counsel from this console">
          <p className="mb-3 text-sm leading-relaxed text-mist">
            Answers are computed from the grid, the scrolls, and the oath. No external language model is called, and nothing leaves the page.
          </p>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-mist">Ask</span>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={3}
              className="rounded-lg border border-line bg-ink px-3 py-2"
            />
          </label>
          <button
            type="button"
            disabled={busy || !question.trim()}
            className="mt-3 min-h-11 rounded-full bg-gold px-4 text-sm font-semibold text-ink disabled:opacity-50"
            onClick={() => {
              void askCounsel(question).then(setAnswer);
            }}
          >
            Ask the local counsel
          </button>
          {answer ? <p className="mt-3 text-sm leading-relaxed text-ivory">{answer}</p> : null}
        </Block>
      </div>
    </div>
  );
}
