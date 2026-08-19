# AGENTS.md

Repository instructions for automated coding agents and agent-assisted development.

## Mission

Build B.O.B. as a small, vendor-neutral personal AI workbench with ADHD-friendly interaction design.

The governing product principle is:

> **B.O.B. owns the work. Agents provide the intelligence.**

## Before changing code

Read, in order:

1. `README.md`
2. `GOVERNANCE.md`
3. `docs/PRODUCT.md`
4. `docs/ARCHITECTURE.md`
5. relevant PRDs, RFCs, ADRs, and implementation plans

Do not infer current architecture from legacy Electron/Ollama code when an accepted decision record says otherwise.

## Non-negotiable boundaries

- B.O.B. owns canonical task, plan, preference, and continuity state.
- Agent bridges do not own application state.
- Metered inference is opt-in and must never be an invisible fallback.
- Core planning and task functionality must remain usable without AI.
- Agent execution authority must be bounded and explicit.
- Do not add cognitive profiling, diagnostic scoring, or inferred neurodivergence traits.
- Do not introduce a framework, service, database, daemon, or dependency unless the accepted architecture requires it.
- Prefer the smallest implementation that satisfies the accepted requirement.
- Preserve accessibility and low-cognitive-load behavior as product requirements, not cosmetic polish.

## Change discipline

Before implementation, classify the work under `GOVERNANCE.md` and create or update the required PRD, RFC, or ADR.

Do not modify accepted decision records to make an implementation appear compliant after the fact. Propose a superseding record instead.

## Code quality

- Keep modules narrow and explicit.
- Prefer typed boundaries between UI, application core, persistence, and agent bridges.
- Validate all agent-proposed actions before execution.
- Do not expose secrets to renderer code or logs.
- Add tests for deterministic logic and authority boundaries.
- Update documentation in the same change when behavior changes.

## Pull requests

A pull request must describe scope, governing records, behavior change, validation, security/cost impact, and documentation impact.

No AI attribution, agent markers, or generated-by footers are required in repository artifacts.
