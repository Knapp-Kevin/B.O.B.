# Revival Implementation Plan

**Status:** Proposed  
**Objective:** Replace the legacy alpha architecture with the smallest coherent implementation of the accepted product definition.

## Strategy

The revival should not incrementally rehabilitate every old subsystem. Git history already preserves the experiments. The active tree should become a clear representation of the current product.

The current first-alpha route is being resolved through the canonical Wayfinder map. This plan is therefore sequencing context, not authority to implement unresolved architecture. Before production implementation begins, the Wayfinder convergence audit must pass and the resulting build-ready specification and tracer-bullet tickets become the immediate implementation plan.

The architectural invariant is:

> **B.O.B. is the agent. Models, inference runtimes, provider CLIs, and tools are capabilities behind B.O.B.**

## Phase 0: decision convergence

Deliverables:

- resolved first-alpha Wayfinder decision route;
- reconciled product definition and architecture specification;
- required PRDs, RFCs, and ADRs in unambiguous lifecycle state;
- governance and contribution rules;
- explicit legacy/non-authoritative statement;
- build-ready first-alpha specification;
- tracer-bullet implementation tickets with real blockers and acceptance evidence.

Exit condition: the convergence audit in `docs/governance/WAYFINDER.md` passes. No coding agent is required to invent product behavior, architecture, persistence semantics, provider/cost behavior, authority boundaries, or validation policy.

## First-alpha implementation destination

The current resolved Wayfinder route establishes these already-settled boundaries:

- Tauri 2 desktop application with Rust privileged core;
- framework-free TypeScript + Vite frontend for the alpha unless measured complexity demonstrates a need to change;
- Windows 11 x64 as the first supported alpha platform;
- Today-first interaction shell with Inbox, B.O.B. Chat, Settings, accessibility, and overwhelmed/reorientation behavior;
- one user-facing B.O.B. identity;
- Gemini Developer API Free as the sole required first-alpha inference backend;
- guided 2–3 step Gemini credential onboarding through Google AI Studio;
- credentials stored outside ordinary application state through the resolved OS secret-store boundary;
- deterministic planning remains useful when inference is unavailable;
- Delegate/tool execution, a second inference backend, and local inference are deferred beyond the first alpha.

Unresolved Wayfinder tickets still govern persistence/recovery details, B.O.B. agent-core/runtime contract, remaining credential/runtime-discovery policy, and validation/packaging. Their resolution may refine this destination before implementation starts.

## Expected tracer-bullet sequence

The exact implementation tickets must be generated from the final build-ready specification rather than copied mechanically from this document. The expected vertical sequence is:

### Application foundation and canonical local state

Establish the approved Tauri/Rust/TypeScript boundary, canonical local persistence, migration/recovery behavior, protected credential abstraction, and reproducible local development validation.

### Today + Inbox deterministic workflow

Implement capture, item lifecycle, Today hierarchy, focus items, manual day blocks, completion/deferral, deterministic replanning, restart continuity, and accessibility baseline without requiring inference.

### Gemini onboarding and B.O.B. Assist

Implement the resolved Gemini Developer API Free credential flow, secure validation/storage state, B.O.B. agent-core contract, bounded context assembly, normalized inference invocation, proposal validation, and preview-before-apply behavior.

### Continuity and failure behavior

Verify resume/handoff, reorientation, compact conversation/work continuity, inference-unavailable behavior, quota/auth/provider failure handling, and recovery without corrupting canonical state.

### Windows alpha packaging and acceptance

Produce the resolved Windows 11 x64 package and the required local/manual evidence for Today, Inbox, Chat, accessibility, restart/recovery, credential handling, and runtime failure behavior.

## Deferred expansion slices

After first-alpha acceptance, later tracer slices may add:

- a second inference/runtime adapter while preserving B.O.B. identity and canonical state;
- subscription-backed Claude/Codex or other supported runtime paths;
- optional local inference;
- bounded Delegate/tool authority;
- additional desktop platforms when justified.

These are not first-alpha blockers unless the Wayfinder route is explicitly reopened by the owner.

## Legacy cleanup policy

Before deleting historical code, identify whether it contains product behavior that is still required by an accepted PRD or resolved Wayfinder decision. Preserve required behavior by rewriting it into the new architecture, not by keeping an incompatible subsystem alive.

Historical implementation is already preserved in Git history and the named archive branch. Do not recreate an active-tree archive merely to make deletion feel safer.

## Validation matrix

The final validation commands and packaging evidence are owned by the Wayfinder validation/packaging decision and build-ready specification. At minimum the implementation route must cover:

| Capability | Deterministic tests | Integration tests | Manual UX check |
| --- | ---: | ---: | ---: |
| Item lifecycle | Required | Required | Required |
| Day planning | Required | Required | Required |
| Persistence/recovery | Required | Required | Required |
| B.O.B. proposal/authority policy | Required | Required | Required |
| Gemini adapter invocation | Required where mockable | Required | Required |
| Inference-unavailable behavior | Required | Required | Required |
| Credential redaction/storage boundary | Required where testable | Required | Required |
| Accessibility | Partial automation | N/A | Required |
| Windows packaging | N/A | Required | Required |

These checks are primarily the responsibility of the implementing developer or coding agent. Repository CI may remain deliberately small and should not be expanded merely to duplicate validation already required before review.

## Scope discipline

Do not parallelize features merely because old code contains them. The first-alpha release path is the resolved Wayfinder destination. Knowledge centers, generalized RAG, analytics dashboards, agent swarms, plugin ecosystems, cloud sync, cognitive profiling, Delegate/tool execution, additional inference backends, and unrelated experimental modules remain outside the first alpha unless an explicit owner decision changes that boundary.
