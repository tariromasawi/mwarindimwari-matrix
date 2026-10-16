import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  PROJECTS,
  PROVINCES,
  SCROLLS,
} from "./catalog";
import {
  GENESIS,
  classifyImpact,
  composePrayer,
  dominantFactor,
  FACTOR_LABEL,
  planCycle,
  priorityScore,
  routineTaskOutcome,
  sealEntry,
  stewardReleaseOutcome,
  verifyChain,
} from "./engine";
import type {
  AuditEntry,
  FactorKey,
  Factors,
  FeedItem,
  Lang,
  PrayerIntent,
  Project,
  Province,
  SavedPrayer,
  ScrollDoc,
  Sector,
  Task,
} from "./types";

const LEDGER_CAP = 120;

type Standing = {
  enabled: boolean;
  intent: PrayerIntent;
  lang: Lang;
};

type MatrixState = {
  running: boolean;
  busy: boolean;
  tick: number;
  anchor: string;
  chainOk: boolean | null;
  ledger: AuditEntry[];
  feed: FeedItem[];
  tasks: Task[];
  provinces: Province[];
  projects: Project[];
  prayers: SavedPrayer[];
  scrolls: ScrollDoc[];
  standing: Standing;
  motion: "system" | "reduce";
  setRunning: (running: boolean) => void;
  setMotion: (motion: "system" | "reduce") => void;
  setStanding: (standing: Partial<Standing>) => void;
  updateFactor: (provinceId: string, key: FactorKey, value: number) => void;
  addProject: (input: { provinceId: string; sector: Sector; title: string }) => void;
  addScroll: (input: Omit<ScrollDoc, "id" | "submitted" | "verification">) => void;
  addTask: (title: string, detail: string) => Promise<void>;
  releaseTask: (id: string) => Promise<void>;
  composeNow: () => Promise<void>;
  speakLatest: () => void;
  runCycle: () => Promise<void>;
};

function id(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function ranked(provinces: Province[]): Province[] {
  return [...provinces].sort(
    (a, b) => priorityScore(b.factors) - priorityScore(a.factors),
  );
}

async function pushAudit(
  state: MatrixState,
  action: string,
  ref: string,
  outcome: string,
  actor: string,
): Promise<Pick<MatrixState, "ledger" | "anchor" | "chainOk">> {
  const seq = state.ledger.length
    ? state.ledger[state.ledger.length - 1].seq + 1
    : 1;
  const prev = state.ledger.length
    ? state.ledger[state.ledger.length - 1].hash
    : state.anchor;
  const entry = await sealEntry(
    { seq, at: now(), actor, action, ref, outcome },
    prev,
  );
  let ledger = [...state.ledger, entry];
  let anchor = state.anchor;
  if (ledger.length > LEDGER_CAP) {
    ledger = ledger.slice(ledger.length - LEDGER_CAP);
    anchor = ledger[0].prev;
  }
  const check = await verifyChain(ledger, anchor);
  return { ledger, anchor, chainOk: check.ok };
}

export const useMatrix = create<MatrixState>()(
  persist(
    (set, get) => ({
      running: true,
      busy: false,
      tick: 0,
      anchor: GENESIS,
      chainOk: null,
      ledger: [],
      feed: [],
      tasks: [],
      provinces: PROVINCES,
      projects: PROJECTS,
      prayers: [],
      scrolls: SCROLLS,
      standing: { enabled: true, intent: "zimbabwe", lang: "en" },
      motion: "system",
      setRunning: (running) => set({ running }),
      setMotion: (motion) => set({ motion }),
      setStanding: (standing) =>
        set({ standing: { ...get().standing, ...standing } }),
      updateFactor: (provinceId, key, value) =>
        set({
          provinces: get().provinces.map((province) =>
            province.id === provinceId
              ? {
                  ...province,
                  factors: { ...province.factors, [key]: value } as Factors,
                }
              : province,
          ),
        }),
      addProject: ({ provinceId, sector, title }) =>
        set({
          projects: [
            {
              id: id(),
              provinceId,
              sector,
              title: title.trim(),
              status: "proposed",
              illustrative: false,
            },
            ...get().projects,
          ],
        }),
      addScroll: (input) =>
        set({
          scrolls: [
            {
              ...input,
              id: id(),
              submitted: true,
              verification:
                "Added in this browser. Not independently verified.",
            },
            ...get().scrolls,
          ],
        }),
      addTask: async (title, detail) => {
        const state = get();
        if (state.busy) return;
        set({ busy: true });
        try {
          const impact = classifyImpact(`${title} ${detail}`);
          const at = now();
          const task: Task = {
            id: id(),
            title: title.trim(),
            detail: detail.trim(),
            impact,
            status: impact === "routine" ? "done" : "hold",
            at,
            result:
              impact === "routine"
                ? routineTaskOutcome(title.trim())
                : "Held for a human steward. The cycle will not perform this.",
          };
          const audited = await pushAudit(
            { ...state, tasks: [task, ...state.tasks] },
            impact === "routine" ? "routine-task" : "steward-hold",
            task.id,
            task.result,
            "Operator",
          );
          const feed: FeedItem = {
            id: id(),
            at,
            agent: impact === "routine" ? "ZionCore" : "EmmanuelLink",
            kind: impact === "routine" ? "task" : "steward",
            summary: task.result,
          };
          set({
            ...audited,
            tasks: [task, ...get().tasks],
            feed: [feed, ...get().feed].slice(0, 40),
          });
        } finally {
          set({ busy: false });
        }
      },
      releaseTask: async (taskId) => {
        const state = get();
        const task = state.tasks.find((item) => item.id === taskId);
        if (!task || task.status !== "hold" || state.busy) return;
        set({ busy: true });
        try {
          const result = stewardReleaseOutcome();
          const audited = await pushAudit(
            state,
            "steward-release",
            task.id,
            result,
            "Steward",
          );
          set({
            ...audited,
            tasks: get().tasks.map((item) =>
              item.id === taskId
                ? { ...item, status: "released", result }
                : item,
            ),
            feed: [
              {
                id: id(),
                at: now(),
                agent: "Living Key",
                kind: "steward" as const,
                summary: result,
              },
              ...get().feed,
            ].slice(0, 40),
          });
        } finally {
          set({ busy: false });
        }
      },
      composeNow: async () => {
        const state = get();
        if (state.busy) return;
        set({ busy: true });
        try {
          const prayer = composePrayer(state.standing.intent, state.standing.lang);
          const saved: SavedPrayer = {
            id: id(),
            at: now(),
            intent: state.standing.intent,
            lang: state.standing.lang,
            title: prayer.title,
            body: prayer.body,
          };
          const summary = `Operator asked Mutsvene for “${prayer.title}”. ${prayer.notice}`;
          const audited = await pushAudit(
            get(),
            "devotion",
            "Mutsvene",
            summary,
            "Mutsvene",
          );
          set({
            ...audited,
            prayers: [saved, ...get().prayers].slice(0, 24),
            feed: [
              {
                id: id(),
                at: now(),
                agent: "Mutsvene",
                kind: "devotion",
                summary,
              } satisfies FeedItem,
              ...get().feed,
            ].slice(0, 40),
          });
        } finally {
          set({ busy: false });
        }
      },
      speakLatest: () => {
        const prayer = get().prayers[0];
        if (!prayer || typeof window === "undefined" || !window.speechSynthesis) {
          return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(
          `Voluntary prayer, not a claimed message from God. ${prayer.body}`,
        );
        utterance.lang = prayer.lang === "sn" ? "sn" : "en";
        window.speechSynthesis.speak(utterance);
      },
      runCycle: async () => {
        const state = get();
        if (!state.running || state.busy) return;
        set({ busy: true });
        try {
          const tick = state.tick + 1;
          const plan = planCycle(tick);
          const order = ranked(state.provinces);
          const top = order[0];
          const missing = state.scrolls.filter(
            (scroll) => !scroll.source.trim() || !scroll.copyright.trim(),
          ).length;
          const holds = state.tasks.filter((task) => task.status === "hold").length;
          let summary = "";
          if (plan.kind === "health") {
            summary = `Heartbeat. Ledger entries ${state.ledger.length}. Steward holds ${holds}. Chain ${state.chainOk === false ? "needs review" : state.chainOk ? "intact" : "not yet sealed"}. No infrastructure was changed.`;
          } else if (plan.kind === "rescore") {
            const names = order
              .slice(0, 3)
              .map(
                (province, index) =>
                  `${index + 1}. ${province.name} ${priorityScore(province.factors).toFixed(2)}`,
              )
              .join("; ");
            summary = `Scenario ranking only, not official policy. ${names}.`;
          } else if (plan.kind === "knowledge") {
            summary = `Scroll Gate holds ${state.scrolls.length} texts. ${missing} lack provenance. Masowe history is not invented to fill a gap.`;
          } else if (plan.kind === "recommendation") {
            const factor = dominantFactor(top.factors);
            summary = `Planning note for ${top.name}: scenario priority ${priorityScore(top.factors).toFixed(2)}, led by ${FACTOR_LABEL[factor]}. This is not delivered aid.`;
          } else if (state.standing.enabled) {
            const prayer = composePrayer(state.standing.intent, state.standing.lang);
            const saved: SavedPrayer = {
              id: id(),
              at: now(),
              intent: state.standing.intent,
              lang: state.standing.lang,
              title: prayer.title,
              body: prayer.body,
            };
            set({ prayers: [saved, ...get().prayers].slice(0, 24) });
            summary = `Mutsvene composed “${prayer.title}”. ${prayer.notice}`;
          } else {
            summary =
              "Mutsvene is idle. Standing devotion is off, so nothing was composed.";
          }
          const audited = await pushAudit(
            get(),
            plan.kind,
            plan.agent,
            summary,
            plan.agent,
          );
          const feed: FeedItem = {
            id: id(),
            at: now(),
            agent: plan.agent,
            kind: plan.kind,
            summary,
          };
          set({
            ...audited,
            tick,
            feed: [feed, ...get().feed].slice(0, 40),
          });
        } finally {
          set({ busy: false });
        }
      },
    }),
    {
      name: "mwarindimwari-matrix",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        running: state.running,
        tick: state.tick,
        anchor: state.anchor,
        chainOk: state.chainOk,
        ledger: state.ledger,
        feed: state.feed,
        tasks: state.tasks,
        provinces: state.provinces,
        projects: state.projects,
        prayers: state.prayers,
        scrolls: state.scrolls,
        standing: state.standing,
        motion: state.motion,
      }),
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== "object") return current;
        const saved = persisted as Partial<MatrixState>;
        return {
          ...current,
          ...saved,
          busy: false,
          provinces: saved.provinces?.length ? saved.provinces : current.provinces,
          scrolls: saved.scrolls?.length ? saved.scrolls : current.scrolls,
          projects: saved.projects?.length ? saved.projects : current.projects,
        };
      },
    },
  ),
);
