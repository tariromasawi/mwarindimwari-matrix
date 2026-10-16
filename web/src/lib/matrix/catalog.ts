import type { ModuleCard, Project, Province, ScrollDoc } from "./types";

export const IDENTITY = {
  name: "MWARINDIMWARI MATRIX",
  mark: "∞",
  declaration: "MWARINDIMWARI — Mwari ndi Mwari",
  mission: "NO ONE, NOTHING LEFT BEHIND",
  founder: "HRH Saint Tariro Masawi",
  office: "The Anointed Commander",
  identifier: "MKEY-MNM-001-TAC-2024",
  boardBorn: "17 February 1984",
  boardBornNote: "Printed on the command board. This console has not checked a civil register.",
  numerals: ["77-99-33", "777-999-333", "7777-9999-3333", "77777-99999-33333"],
  censusNote:
    "Provincial populations are ZIMSTAT 2022 Population and Housing Census preliminary totals, as published on the Zimbabwe Data Portal. Scenario factors are not official deprivation statistics.",
} as const;

export const CENSUS_SOURCE =
  "ZIMSTAT 2022 Population and Housing Census, preliminary provincial totals (Zimbabwe Data Portal)";

export const PROVINCES: Province[] = [
  {
    id: "harare",
    name: "Harare",
    short: "HRE",
    population: 2427231,
    factors: { need: 0.62, vulnerability: 0.48, gap: 0.44, urgency: 0.58, readiness: 0.72 },
  },
  {
    id: "bulawayo",
    name: "Bulawayo",
    short: "BYO",
    population: 665952,
    factors: { need: 0.5, vulnerability: 0.46, gap: 0.42, urgency: 0.47, readiness: 0.7 },
  },
  {
    id: "manicaland",
    name: "Manicaland",
    short: "MAN",
    population: 2037703,
    factors: { need: 0.7, vulnerability: 0.64, gap: 0.66, urgency: 0.6, readiness: 0.5 },
  },
  {
    id: "mashonaland-central",
    name: "Mashonaland Central",
    short: "MCE",
    population: 1384891,
    factors: { need: 0.74, vulnerability: 0.7, gap: 0.72, urgency: 0.63, readiness: 0.42 },
  },
  {
    id: "mashonaland-east",
    name: "Mashonaland East",
    short: "MEA",
    population: 1731173,
    factors: { need: 0.66, vulnerability: 0.58, gap: 0.6, urgency: 0.55, readiness: 0.52 },
  },
  {
    id: "mashonaland-west",
    name: "Mashonaland West",
    short: "MWE",
    population: 1893584,
    factors: { need: 0.68, vulnerability: 0.6, gap: 0.63, urgency: 0.57, readiness: 0.5 },
  },
  {
    id: "masvingo",
    name: "Masvingo",
    short: "MSV",
    population: 1638528,
    factors: { need: 0.73, vulnerability: 0.69, gap: 0.7, urgency: 0.66, readiness: 0.45 },
  },
  {
    id: "matabeleland-north",
    name: "Matabeleland North",
    short: "MTN",
    population: 827645,
    factors: { need: 0.78, vulnerability: 0.74, gap: 0.76, urgency: 0.7, readiness: 0.38 },
  },
  {
    id: "matabeleland-south",
    name: "Matabeleland South",
    short: "MTS",
    population: 760345,
    factors: { need: 0.76, vulnerability: 0.72, gap: 0.75, urgency: 0.68, readiness: 0.4 },
  },
  {
    id: "midlands",
    name: "Midlands",
    short: "MID",
    population: 1811905,
    factors: { need: 0.67, vulnerability: 0.61, gap: 0.64, urgency: 0.59, readiness: 0.51 },
  },
];

export const PROJECTS: Project[] = [
  {
    id: "p-mtn-water",
    provinceId: "matabeleland-north",
    sector: "water",
    title: "Illustrative borehole maintenance ledger",
    status: "proposed",
    illustrative: true,
  },
  {
    id: "p-msv-clinic",
    provinceId: "masvingo",
    sector: "healthcare",
    title: "Illustrative rural clinic supply count",
    status: "proposed",
    illustrative: true,
  },
  {
    id: "p-mce-school",
    provinceId: "mashonaland-central",
    sector: "education",
    title: "Illustrative classroom distance review",
    status: "proposed",
    illustrative: true,
  },
];

export const SCROLLS: ScrollDoc[] = [
  {
    id: "kjv-psalm-46",
    title: "Psalm 46:1",
    tradition: "Christianity — Hebrew Bible / Old Testament",
    language: "English",
    copyright: "King James Version, public domain",
    source: "KJV Psalm 46:1",
    verification: "Standard public-domain citation. Not a new revelation.",
    excerpt: "God is our refuge and strength, a very present help in trouble.",
    submitted: false,
  },
  {
    id: "kjv-micah-6",
    title: "Micah 6:8",
    tradition: "Christianity — Hebrew Bible / Old Testament",
    language: "English",
    copyright: "King James Version, public domain",
    source: "KJV Micah 6:8",
    verification: "Standard public-domain citation. Not a new revelation.",
    excerpt:
      "He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?",
    submitted: false,
  },
  {
    id: "kjv-matthew-25",
    title: "Matthew 25:35",
    tradition: "Christianity — New Testament",
    language: "English",
    copyright: "King James Version, public domain",
    source: "KJV Matthew 25:35",
    verification: "Standard public-domain citation. Not a new revelation.",
    excerpt:
      "For I was an hungred, and ye gave me meat: I was thirsty, and ye gave me drink: I was a stranger, and ye took me in.",
    submitted: false,
  },
  {
    id: "kjv-psalm-121",
    title: "Psalm 121:1–2",
    tradition: "Christianity — Hebrew Bible / Old Testament",
    language: "English",
    copyright: "King James Version, public domain",
    source: "KJV Psalm 121:1–2",
    verification: "Standard public-domain citation. Not a new revelation.",
    excerpt:
      "I will lift up mine eyes unto the hills, from whence cometh my help. My help cometh from the LORD, which made heaven and earth.",
    submitted: false,
  },
];

export const MODULES: ModuleCard[] = [
  {
    id: "zioncore",
    name: "ZionCore",
    status: "operational",
    summary: "Runs the sense, translate, reprogram, and broadcast cycle for routine work only.",
  },
  {
    id: "ai",
    name: "MWARINDIMWARI AI",
    status: "operational",
    summary: "A bounded rules engine in this console. No external language model is connected.",
  },
  {
    id: "haszeldonia",
    name: "Haszeldonia",
    status: "operational",
    summary: "Counts sacred texts and flags any document that still lacks provenance.",
  },
  {
    id: "prometheus",
    name: "Herculean Prometheus",
    status: "operational",
    summary: "Checks the audit chain and reports console health. It does not deploy servers.",
  },
  {
    id: "mutsvene",
    name: "Mutsvene",
    status: "spiritual",
    summary: "Composes voluntary Shona and English prayers. It does not speak as God.",
  },
  {
    id: "scroll",
    name: "Scroll Gate",
    status: "spiritual",
    summary: "Keeps cited scripture and only those historical notes you source yourself.",
  },
  {
    id: "emmanuel",
    name: "EmmanuelLink",
    status: "operational",
    summary: "May draft a community notice. Sending it stays in the steward hold.",
  },
  {
    id: "grid",
    name: "Zimbabwe Transformation Grid",
    status: "operational",
    summary: "Ranks scenario need with the published formula across all ten provinces.",
  },
  {
    id: "seals",
    name: "Seven-Layer Seal",
    status: "operational",
    summary: "Seven auditable control families. This is not a production security certificate.",
  },
  {
    id: "living-key",
    name: "Living Key",
    status: "operational",
    summary: "Shows the symbolic founder identifier. It is not a password or a secret key.",
  },
  {
    id: "herald",
    name: "Zion's Herald",
    status: "operational",
    summary: "Writes the internal bulletin each cycle. It does not publish outside this console.",
  },
  {
    id: "nexus",
    name: "Heavenly Nexus",
    status: "operational",
    summary: "Registers every desk and confirms the eight command steps finished.",
  },
  {
    id: "energy",
    name: "Quintessence Energy",
    status: "operational",
    summary: "Counts energy and water planning notes. No power grid telemetry is live.",
  },
  {
    id: "realm",
    name: "Realm Matrix",
    status: "operational",
    summary: "Maps each realm name on the board to a desk this browser can actually open.",
  },
  {
    id: "time",
    name: "Time Matrix",
    status: "operational",
    summary: "Shows the ledger past, the cycle present, and the next scheduled turn. Poster years stay symbols.",
  },
  {
    id: "grok",
    name: "Grok Masawi",
    status: "operational",
    summary: "Answers from the provinces, texts, and oath already in this console. No external model is called.",
  },
  {
    id: "oath",
    name: "Divine Oath",
    status: "operational",
    summary: "The ethical rules the cycle is not allowed to cross.",
  },
  {
    id: "global",
    name: "Global Operations",
    status: "operational",
    summary: "Keeps the board’s mission list as a work queue. It does not contact another country.",
  },
];

export const SEAL_COPY = [
  {
    id: "divine",
    name: "Divine Seal",
    means: "Ethical mission, consent, and a ban on miracle claims.",
  },
  {
    id: "spirit",
    name: "Spirit Seal",
    means: "Who is operating the console. Production MFA is not configured.",
  },
  {
    id: "bloodline",
    name: "Bloodline Seal",
    means: "Founder identity stays a public symbol, never a reusable secret.",
  },
  {
    id: "angelic",
    name: "Angelic Seal",
    means: "Tamper detection on the audit chain.",
  },
  {
    id: "creation",
    name: "Creation Seal",
    means: "The policy version this build is obeying.",
  },
  {
    id: "matrix",
    name: "AI Matrix Seal",
    means: "Agents may recommend. They may not execute steward actions.",
  },
  {
    id: "eternity",
    name: "Eternity Seal",
    means: "A backup you can download, plus the chain you can re-check.",
  },
] as const;

export const AGENTS = [
  {
    id: "zioncore",
    name: "ZionCore",
    role: "Orchestrator",
    allowed: ["Schedule routine cycles", "Write the audit ledger", "Rank scenario scores"],
    forbidden: ["Move money", "Change access", "Claim divine speech"],
  },
  {
    id: "haszeldonia",
    name: "Haszeldonia",
    role: "Knowledge desk",
    allowed: ["Count texts", "Flag missing provenance"],
    forbidden: ["Invent Masowe history", "Mark an unsourced text as verified"],
  },
  {
    id: "prometheus",
    name: "Herculean Prometheus",
    role: "Integrity desk",
    allowed: ["Recompute the hash chain", "Report console health"],
    forbidden: ["Deploy infrastructure", "Store a live secret"],
  },
  {
    id: "mutsvene",
    name: "Mutsvene",
    role: "Devotion desk",
    allowed: ["Compose voluntary prayers", "Read them with this device’s voice"],
    forbidden: ["Speak as God or Mudzimu Unoyera", "Promise protection"],
  },
  {
    id: "emmanuel",
    name: "EmmanuelLink",
    role: "Outreach desk",
    allowed: ["Draft a notice into the hold queue"],
    forbidden: ["Contact a person", "Publish outside this console"],
  },
  {
    id: "grid",
    name: "Transformation Grid",
    role: "Planning desk",
    allowed: ["Apply the published formula", "Keep proposed project notes"],
    forbidden: ["Disburse aid", "Treat scenario weights as national policy"],
  },
  {
    id: "herald",
    name: "Zion's Herald",
    role: "Internal bulletin",
    allowed: ["Write the cycle bulletin on this feed"],
    forbidden: ["Publish outside this console", "Claim the world already changed"],
  },
  {
    id: "nexus",
    name: "Heavenly Nexus",
    role: "Desk registry",
    allowed: ["Confirm the eight command steps finished", "Point to a desk in this console"],
    forbidden: ["Discover or call an outside service"],
  },
  {
    id: "energy",
    name: "Quintessence Energy",
    role: "Energy notes",
    allowed: ["Count energy and water planning notes"],
    forbidden: ["Switch a grid", "Invent live telemetry"],
  },
  {
    id: "grok",
    name: "Grok Masawi",
    role: "Local counsel",
    allowed: ["Answer from provinces, texts, and the oath"],
    forbidden: ["Call an external model", "Move money", "Speak as God"],
  },
] as const;
