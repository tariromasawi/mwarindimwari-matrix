import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  GENESIS,
  POLICY,
  PRAYER_NOTICE,
  classifyImpact,
  composePrayer,
  dominantFactor,
  planCycle,
  priorityScore,
  runProtocol,
  sealEntry,
  stewardReleaseOutcome,
  verifyChain,
  weightsSum,
  counsel,
} from "./engine.ts";
import { PROVINCES } from "./catalog.ts";
import { workstreams } from "./blueprint.ts";

describe("allocation formula", () => {
  it("uses the published weights and clamps inputs", () => {
    assert.equal(weightsSum(), 1);
    assert.equal(priorityScore({ need: 1, vulnerability: 0, gap: 0, urgency: 0, readiness: 0 }), 0.3);
    assert.equal(priorityScore({ need: 2, vulnerability: -1, gap: 0, urgency: 0, readiness: 0 }), 0.3);
    assert.equal(
      priorityScore({ need: 1, vulnerability: 1, gap: 1, urgency: 1, readiness: 1 }),
      1,
    );
  });

  it("names the strongest scenario factor", () => {
    assert.equal(
      dominantFactor({ need: 0.2, vulnerability: 0.9, gap: 0.4, urgency: 0.1, readiness: 0.3 }),
      "vulnerability",
    );
  });
});

describe("impact gate", () => {
  it("keeps ordinary planning routine and holds money, contact, and publication", () => {
    assert.equal(classifyImpact("Rank provinces by the formula"), "routine");
    assert.equal(classifyImpact("Compose a prayer for Masvingo"), "routine");
    assert.equal(classifyImpact("Transfer donation funds to a supplier"), "steward");
    assert.equal(classifyImpact("Email the council a public broadcast"), "steward");
    assert.equal(classifyImpact("Deploy the production credential"), "steward");
  });
});

describe("audit chain", () => {
  it("seals and verifies, then fails if a hash is altered", async () => {
    const first = await sealEntry(
      {
        seq: 1,
        at: "2026-01-01T00:00:00.000Z",
        actor: "ZionCore",
        action: "health",
        ref: "heartbeat",
        outcome: "ok",
      },
      GENESIS,
    );
    const second = await sealEntry(
      {
        seq: 2,
        at: "2026-01-01T00:00:05.000Z",
        actor: "ZionCore",
        action: "rescore",
        ref: "grid",
        outcome: "ranked",
      },
      first.hash,
    );
    assert.deepEqual(await verifyChain([first, second]), { ok: true, brokenAt: null });
    const tampered = { ...second, outcome: "funds sent" };
    const broken = await verifyChain([first, tampered]);
    assert.equal(broken.ok, false);
    assert.equal(broken.brokenAt, 1);
  });
});

describe("devotion and release", () => {
  it("labels every prayer as unverified devotion", () => {
    const prayer = composePrayer("zimbabwe", "sn");
    assert.match(prayer.body, /Mwari/);
    assert.equal(prayer.notice, PRAYER_NOTICE);
    assert.match(prayer.notice, /not a verified message/i);
  });

  it("does not treat steward approval as execution", () => {
    assert.match(stewardReleaseOutcome(), /No funds were moved/);
    assert.match(stewardReleaseOutcome(), /Approval is not execution/);
  });

  it("rotates desks without skipping the broadcast record", () => {
    assert.equal(planCycle(1).kind, "health");
    assert.equal(planCycle(5).agent, "Mutsvene");
    assert.equal(planCycle(5).phase, "broadcast");
  });
});

describe("command protocol", () => {
  const input = {
    provinces: PROVINCES,
    scrolls: 4,
    missingProvenance: 0,
    holds: 1,
    chain: "intact" as const,
    ledger: 3,
    anchor: "a".repeat(64),
    prayers: 0,
    projects: [
      { sector: "water", title: "note" },
      { sector: "electricity", title: "note" },
    ],
    featured: "Heartbeat only.",
  };

  it("runs all eight board steps without claiming a celestial result", () => {
    const steps = runProtocol(input);
    assert.equal(steps.length, 8);
    assert.equal(steps[3].name, "Broadcast");
    assert.match(steps[3].outcome, /Internal bulletin only/);
    assert.match(steps[5].outcome, /cannot free a person/);
    assert.match(steps[6].outcome, /not a visit to another year/);
    assert.match(steps[7].outcome, /not that the poster/);
  });

  it("refuses steward questions and stays inside the console", () => {
    assert.match(counsel("Transfer the donation", input), /Refused/);
    assert.match(counsel("How is Masvingo scored?", input), /Masvingo/);
    assert.match(counsel("How is Masvingo scored?", input), /no outside model/i);
  });

  it("keeps freeing prisoners off the work queue", () => {
    const free = workstreams({
      provinces: PROVINCES,
      projects: [],
      scrolls: 0,
      prayers: 0,
      holds: 0,
      ledger: 0,
      tick: 1,
      running: true,
      chain: "unsealed",
      anchor: "0".repeat(64),
    }).find((line) => line.name === "Free the imprisoned");
    assert.equal(free?.state, "Refused");
  });
});

describe("policy", () => {
  it("forbids supernatural guarantees and unsupervised money", () => {
    assert.ok(POLICY.forbids.some((rule) => /supernatural/i.test(rule)));
    assert.ok(POLICY.forbids.some((rule) => /financial/i.test(rule)));
  });
});
