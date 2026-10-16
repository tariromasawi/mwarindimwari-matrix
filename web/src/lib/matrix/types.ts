export type Factors = {
  need: number;
  vulnerability: number;
  gap: number;
  urgency: number;
  readiness: number;
};

export type FactorKey = keyof Factors;

export type Impact = "routine" | "steward";

export type RoutineKind =
  | "health"
  | "rescore"
  | "knowledge"
  | "recommendation"
  | "devotion";

export type Phase = "sense" | "translate" | "reprogram" | "broadcast";

export type PrayerIntent =
  | "founder"
  | "family"
  | "zimbabwe"
  | "community"
  | "peace";

export type Lang = "en" | "sn";

export type AuditDraft = {
  seq: number;
  at: string;
  actor: string;
  action: string;
  ref: string;
  outcome: string;
};

export type AuditEntry = AuditDraft & {
  prev: string;
  hash: string;
};

export type Province = {
  id: string;
  name: string;
  short: string;
  population: number;
  factors: Factors;
};

export type Project = {
  id: string;
  provinceId: string;
  sector: Sector;
  title: string;
  status: "proposed" | "reviewed";
  illustrative: boolean;
};

export type Sector =
  | "water"
  | "food"
  | "electricity"
  | "education"
  | "healthcare"
  | "employment"
  | "welfare";

export type Task = {
  id: string;
  title: string;
  detail: string;
  impact: Impact;
  status: "done" | "hold" | "released";
  at: string;
  result: string;
};

export type FeedItem = {
  id: string;
  at: string;
  agent: string;
  kind: RoutineKind | "task" | "steward";
  summary: string;
};

export type SavedPrayer = {
  id: string;
  at: string;
  intent: PrayerIntent;
  lang: Lang;
  title: string;
  body: string;
};

export type ScrollDoc = {
  id: string;
  title: string;
  tradition: string;
  language: string;
  copyright: string;
  source: string;
  verification: string;
  excerpt: string;
  submitted: boolean;
};

export type ModuleStatus = "operational" | "spiritual" | "visionary";

export type ModuleCard = {
  id: string;
  name: string;
  status: ModuleStatus;
  summary: string;
};
