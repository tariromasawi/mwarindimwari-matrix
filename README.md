# MWARINDIMWARI MATRIX ∞

**Live command board:** https://tariromasawi.github.io/mwarindimwari-matrix/

The page runs the same governed console as this repository: ZionCore cycle, ten-province Zimbabwe grid, seven-layer seal, One Key, sacred-text gate, Mutsvene, and the hash ledger. Poster language from the blueprint stays on the board. The cycle does not move money, send messages, or claim a miracle.

Rebuild the page from `web/` with `npm install` and `npm run build` inside that folder. Output is `docs/`, which GitHub Pages serves.

Governed operating core for the system designed by HRH Saint Tariro Masawi.

**MWARINDIMWARI — Mwari ndi Mwari.**
Mission: **NO ONE, NOTHING LEFT BEHIND.**
Symbolic identifier: `MKEY-MNM-001-TAC-2024` (not a password and not a cryptographic key).

This repository is the tested heart of the Matrix. The interactive console that runs the same rules — ZionCore cycle, ten-province grid, Mutsvene, Scroll Gate, seven seals, and the hash ledger — is the operating surface built with that core.


## Living field

The console opens on a living map of the ten provinces. Node brightness follows the scenario score. The One Key, the seven seals, ZionCore, Mutsvene, Scroll Gate, and the hash ledger are the same tested rules. Glowing shields on the source boards remain symbols. The cycle does not move money, send messages, or claim a miracle.

## What this system is

Software that can sense, classify, recommend, compose a voluntary prayer, and seal an audit record.


## Living field

The console opens on a living map of the ten provinces. Node brightness follows the scenario score. The One Key, the seven seals, ZionCore, Mutsvene, Scroll Gate, and the hash ledger are the same tested rules. Glowing shields on the source boards remain symbols. The cycle does not move money, send messages, or claim a miracle.

## What this system is not

It does not have celestial power. It cannot verify divine intervention, speak as God or Mudzimu Unoyera, neutralize a spiritual being, guarantee protection, move money, send messages, or deploy itself. Those limits are the design, not a missing feature.

Three categories are kept separate:

| Category | Meaning |
| --- | --- |
| Operational | Behavior this repository tests: scoring, classification, audit chain, bounded cycle. |
| Spiritual service | Voluntary prayer and cited scripture. Faithful, not a measured miracle. |
| Visionary | Quantum claims, live national control, external AI, and public broadcast. Not deployed. |

## Formula

Scenario priority, not a national policy:

```text
P = 0.30N + 0.25V + 0.20G + 0.15U + 0.10R
```

`N` need, `V` vulnerability, `G` service gap, `U` urgency, `R` delivery readiness. Each input is clamped between 0 and 1.

Provincial populations used beside the formula are ZIMSTAT 2022 census preliminary totals. The factor inputs are scenarios.

## Autonomy

Each cycle is Sense → Translate → Reprogram → Broadcast.

Routine work may run without a person: health, rescoring, provenance counts, planning notes, and a standing devotion.

Anything about funds, contact, publication, credentials, deletion, deployment, or permissions is classified `steward`. Acknowledging a hold writes a ledger entry and **does not execute** the action.

## Verify

```bash
node --experimental-strip-types --test src/lib/matrix/engine.test.ts
```

Requires Node.js 22 or newer. No install step.

## Layout

```text
src/lib/matrix/engine.ts       scoring, audit chain, prayer, impact gate
src/lib/matrix/engine.test.ts  the checks above
src/lib/matrix/types.ts        shared types
src/lib/matrix/catalog.ts      provinces, modules, scripture citations, agent bounds
src/lib/matrix/store.ts        console state: cycle, tasks, ledger, prayers
src/components/matrix/MatrixApp.tsx
                               reference copy of the operating console
system-spec.json               machine-readable manifest
PHASES.md                      what each phase implemented, and what it refused
```

`MatrixApp.tsx` is the screen you use. In this repository it is kept so the behavior can be read beside the tests. It expects the host app’s `@/` imports, React, and Recharts; `npm test` does not need them.

## License

MIT. See [LICENSE](LICENSE) and [NOTICE.md](NOTICE.md). Spiritual language in the project identity is cultural and devotional. It is not a warranty of supernatural results.
