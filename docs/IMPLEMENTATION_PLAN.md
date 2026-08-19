# Revival Implementation Plan

**Status:** Proposed  
**Objective:** Replace the legacy alpha architecture with the smallest coherent implementation of the accepted product definition.

## Strategy

The revival should not incrementally rehabilitate every old subsystem. Git history already preserves the experiments. The active tree should become a clear representation of the current product.

Implementation is divided into bounded vertical slices. Each slice must leave the repository in an understandable state.

The architectural invariant is:

> **B.O.B. is the agent. Models, inference runtimes, provider CLIs, and tools are capabilities behind B.O.B.**

## Phase 0: decision baseline

Deliverables:

- product definition;
- architecture specification;
- PRDs, RFCs, and ADRs;
- governance and contribution rules;
- explicit legacy/non-authoritative statement;
- implementation acceptance criteria.

Exit condition: product and architecture records are accepted before structural rewrite begins.

## Phase 1: application foundation

Scope:

- create the approved desktop shell;
- establish Rust core and typed frontend boundary;
- establish local versioned persistence;
- implement secure settings and protected credential references;
- remove privileged renderer patterns;
- establish local build, test, format, and type-check commands for developer/coding-agent validation;
- implement migration/export skeletons.

No AI inference integration is required for this phase. GitHub Actions remain intentionally minimal unless a later change demonstrates a specific low-cost gate is worth maintaining.

Exit criteria:

- clean install/build path;
- app launches to a minimal shell;
- UI cannot directly access unrestricted native APIs;
- local data survives restart;
- persistence recovery is tested;
- architecture docs match implementation;
- the implementing agent can report reproducible local validation evidence in a pull request.

## Phase 2: Today + Inbox vertical slice

Scope:

- quick capture;
- item lifecycle;
- Today surface;
- focus items;
- manual day blocks;
- next-action selection;
- completion and deferral;
- deterministic replanning;
- accessibility baseline.

Exit criteria:

- B.O.B. is useful without AI;
- a fresh user can capture, plan, start, complete, defer, and replan work;
- restart preserves state;
- no inference runtime is required.

## Phase 3: B.O.B. agent core + first subscription-backed inference adapter

Scope:

- implement B.O.B. as the single user-facing agent service;
- implement the internal runtime/inference adapter contract from RFC-0002;
- detect supported Claude subscription-path installation/authentication state;
- invoke the documented machine-consumable interface;
- build bounded B.O.B. context packages;
- show responses as B.O.B. responses, not as a second agent identity;
- parse structured proposals;
- validate and preview proposed B.O.B. actions;
- enforce subscription-first cost policy.

Exit criteria:

- the user interacts only with B.O.B.;
- B.O.B. can reason over current work through the first inference adapter;
- adapter failure cannot corrupt canonical state;
- model/runtime output cannot silently mutate application data;
- metered fallback is impossible unless deliberately enabled by policy.

## Phase 4: additional LLM/runtime adapters

Scope:

- add the Codex/OpenAI-backed adapter against its supported programmatic surface;
- normalize capability reporting without pretending backend capabilities are identical;
- preserve B.O.B. identity and continuity while changing inference backend;
- validate cancellation and failure behavior;
- keep runtime/provider selection secondary to the user experience.

Exit criteria:

- one B.O.B. workspace can use at least two inference backends without duplicating task state or creating separate agent identities;
- backend selection is understandable when exposed but does not become the main interaction model.

## Phase 5: bounded delegation and tools

Scope:

- explicit Assist vs Delegate authority modes for B.O.B.;
- bounded workspace grant;
- tool/capability disclosure;
- execution lifecycle and cancellation where supported;
- result capture and task linkage;
- audit trail sufficient for user comprehension.

Exit criteria:

- ordinary B.O.B. chat cannot accidentally gain delegated authority;
- delegated scope is visible before execution;
- B.O.B. may use an execution-capable runtime or approved tool only inside that grant;
- completion returns useful state and evidence to B.O.B.

## Phase 6: optional local inference

Scope only after GG-CORE integration requirements are demonstrably mature enough:

- implement the GG-CORE runtime adapter;
- choose embedded Rust or constrained IPC path;
- configure model lifecycle without turning B.O.B. into a model-manager product;
- expose local availability and resource state only where useful;
- preserve identical B.O.B. state and identity boundaries.

Local inference remains optional.

## Legacy cleanup policy

Before deleting historical code, identify whether it contains product behavior that is still required by an accepted PRD. Preserve required behavior by rewriting it into the new architecture, not by keeping an incompatible subsystem alive.

Historical implementation is already preserved in Git history and the named archive branch. Do not recreate an active-tree archive merely to make deletion feel safer.

## Validation matrix

| Capability | Deterministic tests | Integration tests | Manual UX check |
| --- | ---: | ---: | ---: |
| Item lifecycle | Required | Required | Required |
| Day planning | Required | Required | Required |
| Persistence/recovery | Required | Required | Required |
| B.O.B. authority policy | Required | Required | Required |
| Inference adapter invocation | Required where mockable | Required | Required |
| Backend-switch continuity | Required where practical | Required | Required |
| Delegation/tool authority | Required | Required | Required |
| Accessibility | Partial automation | N/A | Required |
| Packaging | N/A | Required | Required |

These checks are primarily the responsibility of the implementing developer or coding agent. Repository CI may remain deliberately small and should not be expanded merely to duplicate validation that is already required before review.

## Scope discipline

Do not parallelize features merely because old code contains them. The release path is Today + Inbox + continuity + B.O.B. agent core + inference adapters. Knowledge centers, generalized RAG, analytics dashboards, agent swarms, plugin ecosystems, cloud sync, cognitive profiling, and unrelated experimental modules remain out of scope until an accepted PRD changes that boundary.
