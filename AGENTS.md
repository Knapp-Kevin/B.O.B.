# AGENTS.md

Binding repository instructions for coding agents and agent-assisted development.

## Mission

Build B.O.B. as a small, vendor-neutral personal AI workbench with ADHD-friendly interaction design.

> **B.O.B. is the agent. Models, inference runtimes, and tools are capabilities behind B.O.B.**

## Read before changing anything

Read, in order:

1. `README.md`
2. `docs/governance/GOVERNANCE.md`
3. `docs/PRODUCT.md`
4. `docs/ARCHITECTURE.md`
5. `docs/DESIGN.md` when user-facing behavior is involved
6. the governing PRD, RFC, ADR, and implementation-plan sections for the change

The active tree is authoritative. Historical implementation is preserved on `archive/pre-revival-cleanup-2026-08-19` and must not be treated as current architecture unless a governing record explicitly brings a concept forward.

## Non-negotiable boundaries

- B.O.B. is the only user-facing agent identity.
- Multiple LLMs, inference runtimes, vendor CLIs, and tools are internal capabilities, not peer agents.
- B.O.B. owns canonical task, plan, preference, conversation continuity, and application state.
- Runtime adapters do not become systems of record.
- Core capture, task, and planning behavior remains useful without AI inference.
- Subscription-backed inference is preferred; local inference is permitted; metered inference requires explicit user enablement.
- Unknown provider cost classification fails closed.
- Normal Assist mode does not grant shell, filesystem, credential, repository, or arbitrary application authority.
- Delegate mode means the user delegates bounded authority to B.O.B., which may use an approved runtime or tool inside that grant.
- Model/runtime output is untrusted until B.O.B. validates proposed application actions.
- Provider/runtime detail may be visible when relevant, but must not become a multi-agent interaction model.
- Do not add cognitive profiling, diagnostic scoring, inferred neurodivergence traits, guilt mechanics, or productivity scoring disguised as wellbeing support.
- Accessibility and low cognitive load are product requirements, not post-launch polish.
- Do not add a service, daemon, database, framework, runtime, or dependency without a current requirement and documented architectural reason.
- Prefer deletion and a narrow typed boundary over parallel implementations.

## Change classification

Use the smallest record set that makes the change traceable:

| Change | Record |
| --- | --- |
| Material user capability or behavior | PRD |
| Significant implementation mechanism, protocol, integration, or migration | RFC |
| Durable architectural decision | ADR |
| Routine bug, test, copy, or dependency maintenance | PR only |

A record marked `Proposed` is not permission to pretend an unresolved decision is settled. If implementation depends on it, resolve the decision in the governing review first.

## Engineering discipline

- Keep UI, B.O.B. agent core, deterministic services, persistence, policy, inference routing, runtime adapters, and tool gateway separated by explicit boundaries.
- Prefer typed data contracts at every trust boundary.
- Keep deterministic planning logic deterministic and directly tested.
- Never put secrets in frontend state, logs, prompts, screenshots, fixtures, or ordinary application data.
- Make destructive state changes recoverable where practical.
- Treat provider CLIs and external runtimes as external processes with failure, version, auth, cancellation, and output-validation concerns.
- Do not silently widen workspace or filesystem permissions.
- Do not silently change provider, runtime, model, or cost class where that change materially affects user intent, privacy, or billing.
- Preserve B.O.B. conversation identity when the inference backend changes.
- Update documentation in the same change that makes a documented statement true or false.

## Validation responsibility

GitHub Actions and required CI gates are intentionally minimal for this small project. The implementing developer or coding agent owns validation before requesting review.

Run the checks that are relevant to the change, such as builds, unit tests, linting, type checks, targeted integration tests, and manual UI validation. Do not invent checks merely to fill a template. A pull request must state exactly what was run, what passed, what was not run, and why.

Repository CI is a safety net when present, not a substitute for implementation-time validation.

## Repository hygiene

The repository root is intentionally sparse. Do not place implementation experiments, generated inventories, model artifacts, temporary scripts, screenshots, research dumps, or historical copies in the root.

Expected root entries are limited to core repository surfaces such as `README.md`, `AGENTS.md`, `LICENSE`, `.gitignore`, `.github/`, `docs/`, and the eventual active application directories/configuration required to build the revived product.

Git history and the named archive branch are the archive. Do not recreate a museum in `master`.

## Pull requests

A material pull request must state:

- user problem and intended outcome;
- scope and explicit non-goals;
- governing PRD/RFC/ADR references;
- architecture, data, authority, security, and inference-cost impact;
- validation performed and evidence obtained;
- documentation changed with the behavior.

No AI attribution, generated-by footer, Co-Authored-By marker, or agent branding is required in repository artifacts.
