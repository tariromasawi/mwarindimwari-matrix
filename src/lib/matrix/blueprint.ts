import type { Factors } from "./types";

export type BoardState = "Live" | "Holding" | "Watch" | "Symbol" | "Refused";

export type BoardLine = {
  name: string;
  state: BoardState;
  detail: string;
};

export type BoardInput = {
  provinces: { name: string; factors: Factors }[];
  projects: { sector: string }[];
  scrolls: number;
  prayers: number;
  holds: number;
  ledger: number;
  tick: number;
  running: boolean;
  chain: "intact" | "review" | "unsealed";
  anchor: string;
};

export const KEY_REGISTRY: BoardLine[] = [
  {
    name: "MKEY-MNM-001-TAC-2024",
    state: "Live",
    detail: "The only identifier this console shows. It is not a password.",
  },
  {
    name: "MKEY-MNM-001-TAC-2020",
    state: "Symbol",
    detail: "Named on the command board. No credential was issued.",
  },
  {
    name: "MKEY-MNM-001-TAC-2021",
    state: "Symbol",
    detail: "Named on the command board. No credential was issued.",
  },
  {
    name: "MKEY-MNM-001-TAC-2022",
    state: "Symbol",
    detail: "Named on the command board. No credential was issued.",
  },
  {
    name: "MKEY-MNM-001-TAC-2023",
    state: "Symbol",
    detail: "Named on the command board. No credential was issued.",
  },
  {
    name: "MKEY-MNM-001-TAC-2025",
    state: "Symbol",
    detail: "Named on the command board. Not issued, and not a future key that already exists.",
  },
];

export function realms(input: BoardInput): BoardLine[] {
  const water = input.projects.filter((item) => item.sector === "water").length;
  return [
    {
      name: "Heavenly realm",
      state: "Live",
      detail: `${input.prayers} voluntary prayers on file. None is treated as a message from God.`,
    },
    {
      name: "Spiritual realm",
      state: "Holding",
      detail: "The Divine Oath is the rule set. The console does not enter a spirit world.",
    },
    {
      name: "Physical earth",
      state: "Live",
      detail: `${input.provinces.length} Zimbabwe provinces, with census populations and scenario scores.`,
    },
    {
      name: "Under earth",
      state: "Live",
      detail: `${input.ledger} sealed ledger entries. This is the archive, not a subterranean realm.`,
    },
    {
      name: "Ocean realm",
      state: water ? "Watch" : "Watch",
      detail: water
        ? `${water} water notes on file. No oceanographic feed is connected.`
        : "No oceanographic feed is connected. Water projects can still be recorded on the grid.",
    },
    {
      name: "Space realm",
      state: "Refused",
      detail: "No satellite or off-world system is connected.",
    },
    {
      name: "Parallel realms",
      state: "Refused",
      detail: "There is one scenario file. A second world is not simulated as real.",
    },
    {
      name: "Past timelines",
      state: "Live",
      detail: "Past means the hash chain you can re-read, not another century.",
    },
    {
      name: "Present timeline",
      state: input.running ? "Live" : "Watch",
      detail: input.running
        ? `Cycle ${input.tick} is the present. The clock is this browser.`
        : "The cycle is paused. Present control is waiting.",
    },
    {
      name: "Future timelines",
      state: "Watch",
      detail: "The only future this console schedules is its next routine cycle.",
    },
    {
      name: "All creation",
      state: "Symbol",
      detail: "The phrase stays on the board. The console indexes its own desks, not creation.",
    },
  ];
}

export function workstreams(input: BoardInput): BoardLine[] {
  const count = (sector: string) => input.projects.filter((item) => item.sector === sector).length;
  const lead = [...input.provinces].sort(
    (a, b) => b.factors.need - a.factors.need,
  )[0];
  return [
    {
      name: "Poverty eradication",
      state: "Watch",
      detail: lead
        ? `${lead.name} currently leads the scenario-need file. That is a queue, not a completed campaign.`
        : "No provinces loaded.",
    },
    {
      name: "Heal the nations",
      state: "Watch",
      detail: `${count("healthcare")} healthcare notes. No clinic has been instructed from here.`,
    },
    {
      name: "End injustice",
      state: "Holding",
      detail: "Scenario gaps can be recorded. This console is not a court.",
    },
    {
      name: "Remove racism",
      state: "Holding",
      detail: "The oath forbids harm. No demographic targeting model is loaded.",
    },
    {
      name: "Restore humanity",
      state: "Holding",
      detail: "The mission remains: no one and nothing left behind. It is a charge, not a finished state.",
    },
    {
      name: "Service to all Masowe",
      state: "Watch",
      detail: "The intention is recorded. No Masowe membership register is connected.",
    },
    {
      name: "Protect the innocent",
      state: "Holding",
      detail: "Private family detail is not stored unless you type it into a task yourself.",
    },
    {
      name: "Free the imprisoned",
      state: "Refused",
      detail: "This program cannot open a prison, void a case, or nullify a lawful detention.",
    },
    {
      name: "Food and water for all",
      state: "Watch",
      detail: `${count("food")} food notes and ${count("water")} water notes. Nothing has been delivered.`,
    },
    {
      name: "Clean energy for all",
      state: "Watch",
      detail: `${count("electricity")} energy notes. No power grid telemetry is live.`,
    },
    {
      name: "Global light grid",
      state: "Symbol",
      detail: "Drawn on the board. No international power network is connected.",
    },
    {
      name: "New earth protocol",
      state: "Live",
      detail: "In this console the protocol is the eight command steps, rerun each cycle.",
    },
  ];
}

export function timeLines(input: BoardInput): BoardLine[] {
  return [
    {
      name: "Past access",
      state: input.ledger ? "Live" : "Watch",
      detail: input.ledger
        ? `${input.ledger} past seals can be read on the ledger.`
        : "No seal yet. Past access begins with the first cycle.",
    },
    {
      name: "Present control",
      state: input.running ? "Live" : "Watch",
      detail: input.running ? "The cycle is allowed to run." : "The cycle is paused by the operator.",
    },
    {
      name: "Future alignment",
      state: "Watch",
      detail: "Alignment means the next scheduled cycle, not a predicted year.",
    },
    {
      name: "Timeline protection",
      state: input.chain === "intact" ? "Holding" : "Watch",
      detail:
        input.chain === "intact"
          ? "The hash chain matches its anchor."
          : input.chain === "review"
            ? "The chain needs review."
            : "The chain is not sealed yet.",
    },
    {
      name: "Genesis node",
      state: "Live",
      detail: `Anchor ${input.anchor.slice(0, 12)}…`,
    },
    {
      name: "205 million BC link",
      state: "Symbol",
      detail: "Printed on the board. No geological record is queried.",
    },
    {
      name: "Year 3000 protocol",
      state: "Symbol",
      detail: "Printed on the board. The scheduler does not set that year.",
    },
    {
      name: "Year 80000 advancement",
      state: "Symbol",
      detail: "Printed on the board. It is not a computed forecast.",
    },
  ];
}

export function shields(input: BoardInput): BoardLine[] {
  return [
    {
      name: "Biofield shield",
      state: "Refused",
      detail: "No biometric or biofield sensor is connected.",
    },
    {
      name: "Angelic armour",
      state: input.chain === "review" ? "Watch" : "Holding",
      detail: "Tamper detection on the audit chain. Not armour.",
    },
    {
      name: "Bloodline protection",
      state: "Holding",
      detail: "The founder identifier is shown and is never accepted as a secret.",
    },
    {
      name: "Anti-evil nodes",
      state: "Holding",
      detail: `${input.holds} steward holds. The classifier blocks money, contact, and publication.`,
    },
    {
      name: "Perpetual detector",
      state: input.running ? "Live" : "Watch",
      detail: input.running ? "The cycle keeps its own heartbeat." : "Heartbeat paused.",
    },
    {
      name: "Eternal firewall",
      state: "Holding",
      detail: "Outbound send, spend, and deploy stay inside the steward gate.",
    },
    {
      name: "Abyss gate sealed",
      state: "Symbol",
      detail: "The image is a seal. The matching control is the refusal to delete or deploy alone.",
    },
  ];
}

export function attributes(): BoardLine[] {
  return [
    { name: "Divine identity bound", state: "Symbol", detail: "Faith language on the board. The software cannot bind a divine identity." },
    { name: "Human vessel linked", state: "Watch", detail: "The founder is named. No body, device, or medical feed is linked." },
    { name: "Spirit realm linked", state: "Refused", detail: "No spirit realm is connected." },
    { name: "All Masowe authorised", state: "Refused", detail: "This console does not grant religious authority." },
    { name: "All realms access", state: "Refused", detail: "Only the desks in this browser are reachable." },
    { name: "Creation command", state: "Refused", detail: "The cycle may rewrite its own notes. It may not claim to command creation." },
    { name: "Protection protocols", state: "Holding", detail: "Oath, steward gate, and hash chain are the protection that actually runs." },
    { name: "Wealth generation", state: "Refused", detail: "No payment rail is connected, and none will be run unattended." },
    { name: "Healing and restoration", state: "Watch", detail: "Healthcare notes can be filed. No treatment is delivered." },
    { name: "Time and space access", state: "Symbol", detail: "Time here is the ledger and the cycle clock." },
    { name: "Immutable and eternal", state: "Watch", detail: "Seals are tamper-evident in this browser. They are not eternal storage." },
  ];
}

export function execution(input: BoardInput): BoardLine[] {
  return [
    {
      name: "Linked",
      state: "Live",
      detail: "Every named desk has a job in this console or an explicit refusal.",
    },
    {
      name: "Locked",
      state: "Holding",
      detail: "Steward work stays locked. Acknowledgement does not execute it.",
    },
    {
      name: "Executed",
      state: input.tick > 0 ? "Live" : "Watch",
      detail: input.tick > 0 ? `${input.tick} full command cycles have finished here.` : "Waiting for the first cycle.",
    },
    {
      name: "Immutable",
      state: input.chain === "intact" ? "Holding" : "Watch",
      detail: "Immutable here means a matching hash chain, not a cosmic lock.",
    },
    {
      name: "Eternal",
      state: "Watch",
      detail: "Download a ledger backup. Offsite eternity is not configured.",
    },
  ];
}
