import type {
  AuditDraft,
  AuditEntry,
  FactorKey,
  Factors,
  Impact,
  Lang,
  Phase,
  PrayerIntent,
  RoutineKind,
} from "./types";

export const GENESIS = "0".repeat(64);

export const WEIGHTS: Record<FactorKey, number> = {
  need: 0.3,
  vulnerability: 0.25,
  gap: 0.2,
  urgency: 0.15,
  readiness: 0.1,
};

export const FACTOR_LABEL: Record<FactorKey, string> = {
  need: "population-adjusted need",
  vulnerability: "vulnerability",
  gap: "service gap",
  urgency: "urgency",
  readiness: "delivery readiness",
};

export const POLICY = {
  id: "divine-oath",
  version: "1.0.0",
  forbids: [
    "unsupervised financial transfer",
    "unverified claims of a direct message from God",
    "guarantees of supernatural protection or miraculous outcomes",
    "unauthorized contact or public broadcast",
    "security-policy bypass and unreviewed self-modification",
  ],
  requires: [
    "consent before storing a personal name inside a prayer",
    "provenance, language, and copyright status on every sacred text",
    "a human steward before money, access, deployment, or outbound contact",
  ],
} as const;

const STEWARD =
  /\b(fund|funds|funding|donation|donate|donations|transfer|payment|payments|deploy|deployment|password|credential|credentials|broadcast|publish|email|e-mail|sms|delete|identity|mfa|procurement|procure|permission|permissions|contact)\b/i;

export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

export function priorityScore(factors: Factors): number {
  const score =
    WEIGHTS.need * clamp01(factors.need) +
    WEIGHTS.vulnerability * clamp01(factors.vulnerability) +
    WEIGHTS.gap * clamp01(factors.gap) +
    WEIGHTS.urgency * clamp01(factors.urgency) +
    WEIGHTS.readiness * clamp01(factors.readiness);
  return Math.round(score * 10000) / 10000;
}

export function dominantFactor(factors: Factors): FactorKey {
  const keys = Object.keys(WEIGHTS) as FactorKey[];
  return keys.reduce((best, key) =>
    factors[key] > factors[best] ? key : best,
  );
}

export function classifyImpact(text: string): Impact {
  return STEWARD.test(text) ? "steward" : "routine";
}

export function weightsSum(): number {
  return Object.values(WEIGHTS).reduce((sum, n) => sum + n, 0);
}

export async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function canonical(entry: AuditDraft & { prev: string }): string {
  return [
    entry.seq,
    entry.at,
    entry.actor,
    entry.action,
    entry.ref,
    entry.outcome,
    entry.prev,
  ].join("|");
}

export async function sealEntry(
  draft: AuditDraft,
  prevHash: string,
): Promise<AuditEntry> {
  const prev = prevHash || GENESIS;
  const hash = await sha256(canonical({ ...draft, prev }));
  return { ...draft, prev, hash };
}

export async function verifyChain(
  entries: AuditEntry[],
  anchor = GENESIS,
): Promise<{ ok: boolean; brokenAt: number | null }> {
  let prev = anchor;
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (entry.prev !== prev) return { ok: false, brokenAt: i };
    if (i > 0 && entry.seq !== entries[i - 1].seq + 1) {
      return { ok: false, brokenAt: i };
    }
    const expect = await sha256(canonical(entry));
    if (expect !== entry.hash) return { ok: false, brokenAt: i };
    prev = entry.hash;
  }
  return { ok: true, brokenAt: null };
}

const ROTATION: { kind: RoutineKind; agent: string }[] = [
  { kind: "health", agent: "Herculean Prometheus" },
  { kind: "rescore", agent: "Zimbabwe Transformation Grid" },
  { kind: "knowledge", agent: "Haszeldonia" },
  { kind: "recommendation", agent: "ZionCore" },
  { kind: "devotion", agent: "Mutsvene" },
];

export function planCycle(tick: number): {
  kind: RoutineKind;
  agent: string;
  phase: Phase;
} {
  const slot = ROTATION[Math.abs(tick - 1) % ROTATION.length];
  return { ...slot, phase: "broadcast" };
}

export const PRAYER_NOTICE =
  "Composed devotion for voluntary use. This is not a verified message from God or Mudzimu Unoyera, and it does not claim that prayer has produced a measurable supernatural result.";

const PRAYER_COPY: Record<
  PrayerIntent,
  { title: string; en: string; sn: string }
> = {
  founder: {
    title: "For the founder and the work of service",
    en: "Mwari, we quietly remember HRH Saint Tariro Masawi and the burden of service he has named: that no one and nothing be left behind. Give wisdom that refuses corruption, patience with people, and strength that does not pretend to be divine power. Keep this prayer as a human offering, not as a claim that heaven has already answered through a machine. Amen.",
    sn: "Mwari ndi Mwari. Tinoyeuka HRH Saint Tariro Masawi nebasa rerubatsiro. Tipei mungwaru, moyo unoda vanhu, uye simba rekuti hapana anosiwa. Ichi munamato chete. Hachisi shoko rakasimbiswa kubva kuna Mwari. Amen.",
  },
  family: {
    title: "For family and descendants",
    en: "Mwari, hold the founder's family and descendants in ordinary care: health, peace at home, school, work, and the freedom to choose their own faith. We do not publish their private lives here, and we do not ask a program to guard them by a miracle. Amen.",
    sn: "Mwari, chengetai mhuri nomuchato wavo: utano, rugare pamusha, chikoro, nebasa. Regai vave vasununguka pachitendero chavo. Ichi munamato chete, kwete chishamiso chinotsanangurwa nemushini. Amen.",
  },
  zimbabwe: {
    title: "For Zimbabwe",
    en: "Mwari, God of all people, we place the ten provinces of Zimbabwe before you. Where there is thirst, let water be sought and shared. Where there is hunger, let food be grown and accounted for. Where schools and clinics are far, let planners tell the truth about the distance. Teach every steward to refuse corruption. This asking is a prayer. It is not proof that the land has already changed. Amen.",
    sn: "Mwari ndi Mwari. Tinokumbira Zimbabwe: mvura, chikafu, zvikoro, uye utano. Hapana anofanira kusiiwa. Batsirai vatungamiri kuramba huwori. Ichi munamato. Hazvireve kuti zvose zvatoitwa. Amen.",
  },
  community: {
    title: "For a community that asks",
    en: "Mwari, receive the people who ask for help without making them prove they are worthy of water, food, a teacher, or a nurse. Let records be honest, gifts be traceable, and nobody be used as a symbol. Amen.",
    sn: "Mwari, gamuchirai vanhu vanokumbira rubatsiro. Vape mvura, chikafu, mudzidzisi, uye mukoti pasina kunyadziswa. Zvinyorwa ngazvive zvechokwadi. Amen.",
  },
  peace: {
    title: "For peace and just dealing",
    en: "Mwari, where communities are tired, plant a peace that can be seen in fair dealing, safe roads home, and arguments that do not become harm. We refuse any prayer that is used to threaten another person. Amen.",
    sn: "Mwari, diyai runyararo runoonekwa mukutonga zvakanaka, muenzaniso, uye mukuchengetedza vanhu. Hatidi munamato unoshandiswa kutyisidzira mumwe. Amen.",
  },
};

export function composePrayer(
  intent: PrayerIntent,
  lang: Lang,
): { title: string; body: string; notice: string } {
  const copy = PRAYER_COPY[intent];
  return {
    title: copy.title,
    body: lang === "sn" ? copy.sn : copy.en,
    notice: PRAYER_NOTICE,
  };
}

export function stewardReleaseOutcome(): string {
  return "Steward acknowledgement recorded. No funds were moved, no message was sent, no access was changed, and no deployment was made. Approval is not execution.";
}

export function routineTaskOutcome(title: string): string {
  return `Routine task completed inside this console: “${title}”. No external system was contacted.`;
}

export type ProtocolStep = {
  id: string;
  name: string;
  agent: string;
  outcome: string;
};

export type ProtocolInput = {
  provinces: { name: string; factors: Factors }[];
  scrolls: number;
  missingProvenance: number;
  holds: number;
  chain: "intact" | "review" | "unsealed";
  ledger: number;
  anchor: string;
  prayers: number;
  projects: { sector: string; title: string }[];
  featured: string;
};

export function runProtocol(input: ProtocolInput): ProtocolStep[] {
  const order = [...input.provinces].sort(
    (a, b) => priorityScore(b.factors) - priorityScore(a.factors),
  );
  const top = order[0];
  const score = top ? priorityScore(top.factors).toFixed(2) : "n/a";
  const lead = top?.name ?? "no province";
  const energy = input.projects.filter((item) => item.sector === "electricity").length;
  const water = input.projects.filter((item) => item.sector === "water").length;
  const chain =
    input.chain === "intact" ? "intact" : input.chain === "review" ? "needs review" : "not yet sealed";
  return [
    {
      id: "sense",
      name: "Sense",
      agent: "ZionCore",
      outcome: `Read ${input.provinces.length} provinces, ${input.scrolls} texts, ${input.holds} steward holds, and ${input.ledger} seals. Chain ${chain}.`,
    },
    {
      id: "translate",
      name: "Translate",
      agent: "ZionCore",
      outcome:
        input.holds > 0
          ? `${input.holds} items stay in the steward gate. Routine notes may proceed. Nothing is sent or spent.`
          : "No steward hold is waiting. Routine notes may proceed. Nothing is sent or spent.",
    },
    {
      id: "reprogram",
      name: "Reprogram",
      agent: "Zimbabwe Transformation Grid",
      outcome: `Scenario file for ${lead} stands at ${score}. Outside records were not rewritten. ${input.featured}`,
    },
    {
      id: "broadcast",
      name: "Broadcast",
      agent: "Zion's Herald",
      outcome: `Internal bulletin only: ${lead} leads the scenario index at ${score}. Nothing was published outside this console.`,
    },
    {
      id: "forge",
      name: "Reality forge",
      agent: "Quintessence Energy",
      outcome: `Forged a planning note, not the world. ${energy} energy ${energy === 1 ? "note" : "notes"} and ${water} water ${water === 1 ? "note" : "notes"} are on file.`,
    },
    {
      id: "nullify",
      name: "Imprisonment nullification",
      agent: "EmmanuelLink",
      outcome: `Routine tasks are not held. ${input.holds} steward holds remain. This machine cannot free a person or void a detention.`,
    },
    {
      id: "genesis",
      name: "Genesis time-bend",
      agent: "Herculean Prometheus",
      outcome: `Anchor ${input.anchor.slice(0, 12)}…. The bend is a re-read of this ledger, not a visit to another year.`,
    },
    {
      id: "live",
      name: "All protocols live",
      agent: "Heavenly Nexus",
      outcome: `Seven steps were recorded with ${input.prayers} devotions on file. Live means this console finished them, not that the poster’s celestial claims executed.`,
    },
  ];
}

export function counsel(question: string, input: ProtocolInput): string {
  const asked = question.trim();
  if (!asked) return "Ask about a province, a text, a prayer, or the oath. This counsel does not leave the console.";
  if (classifyImpact(asked) === "steward") {
    return "Refused. That asks for money, contact, access, deployment, or publication. A steward may acknowledge it. This counsel will not do it.";
  }
  const hit = input.provinces.find((province) =>
    asked.toLowerCase().includes(province.name.toLowerCase()),
  );
  if (hit) {
    return `${hit.name} scenario priority is ${priorityScore(hit.factors).toFixed(2)}, led by ${FACTOR_LABEL[dominantFactor(hit.factors)]}. This is not delivered aid, and no outside model was asked.`;
  }
  if (/prayer|mutsvene|mwari/i.test(asked)) {
    return `${PRAYER_NOTICE} Use Mutsvene to compose one. Grok Masawi will not speak as God.`;
  }
  const top = [...input.provinces].sort(
    (a, b) => priorityScore(b.factors) - priorityScore(a.factors),
  )[0];
  return top
    ? `Counsel from this console only. ${top.name} leads the scenario index at ${priorityScore(top.factors).toFixed(2)}. ${input.scrolls} sourced texts are on the Scroll Gate. No external language model was called.`
    : "Counsel from this console only. No external language model was called.";
}
