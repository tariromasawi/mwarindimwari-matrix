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
  sealEntry,
  stewardReleaseOutcome,
  verifyChain,
  weightsSum,
} from "./engine.ts";

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

describe("policy", () => {
  it("forbids supernatural guarantees and unsupervised money", () => {
    assert.ok(POLICY.forbids.some((rule) => /supernatural/i.test(rule)));
    assert.ok(POLICY.forbids.some((rule) => /financial/i.test(rule)));
  });
});
