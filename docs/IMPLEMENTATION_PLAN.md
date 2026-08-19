# Revival Implementation Plan

**Status:** Proposed  
**Objective:** Replace the legacy alpha architecture with the smallest coherent implementation of the accepted product definition.

## Strategy

The revival should not incrementally rehabilitate every old subsystem. Git history already preserves the experiments. The active tree should become a clear representation of the current product.

Implementation is divided into bounded vertical slices. Each slice must leave the repository in an understandable state.

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
- add baseline test, format, and build workflows;
- implement migration/export skeletons.

No AI integration is required for this phase.

Exit criteria:

- clean install/build path;
- app launches to a minimal shell;
- UI cannot directly access unrestricted native APIs;
- local data survives restart;
- persistence recovery is tested;
- architecture docs match implementation.

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
- fresh user can capture, plan, start, complete, defer, and replan work;
- restart preserves state;
- no legacy AI process is required.

## Phase 3: first subscription-backed agent bridge

Scope:

- implement `AgentBridge` internal contract;
- detect supported Claude Code installation/authentication state;
- invoke documented non-interactive interface;
- build bounded context package;
- show agent responses inside B.O.B.;
- parse structured proposals;
- validate and preview proposed B.O.B. actions;
- enforce subscription-first cost policy.

Exit criteria:

- B.O.B. can reason over current work through the first bridge;
- bridge failure cannot corrupt canonical state;
- agent cannot silently mutate application data;
- metered fallback is impossible unless deliberately enabled by later policy.

## Phase 4: Codex bridge

Scope:

- implement Codex adapter against its supported programmatic surface;
- normalize capability reporting;
- preserve B.O.B. continuity while switching bridges;
- validate cancellation and failure behavior.

Exit criteria:

- one B.O.B. workspace can use Claude Code and Codex without duplicating task state;
- switching bridges is explicit and understandable.

## Phase 5: delegation

Scope:

- explicit Assist vs Delegate modes;
- bounded workspace grant;
- capability disclosure;
- execution lifecycle and cancellation where supported;
- result capture and task linkage;
- audit trail sufficient for user comprehension.

Exit criteria:

- ordinary chat cannot accidentally grant delegated authority;
- delegated scope is visible before execution;
- completion returns useful state to B.O.B.

## Phase 6: optional local inference

Scope only after GG-CORE integration requirements are demonstrably mature enough:

- implement GG-CORE bridge;
- choose embedded Rust or constrained IPC path;
- configure model lifecycle without turning B.O.B. into a model manager product;
- expose local availability and resource state;
- preserve identical B.O.B. state boundaries.

Local inference remains optional.

## Legacy cleanup policy

Before deleting historical code, identify whether it contains product behavior that is still required by an accepted PRD. Preserve required behavior by rewriting it into the new architecture, not by keeping an incompatible subsystem alive.

Candidates for removal from the active tree include legacy version directories, generated directory dumps, old Ollama/RAG infrastructure, duplicate server managers, Python placeholder structures, obsolete module-framework experiments, and broken import paths.

A legacy tag should be created before major structural deletion so the old alpha state remains easy to locate in addition to normal Git history.

## Validation matrix

| Capability | Deterministic tests | Integration tests | Manual UX check |
| --- | ---: | ---: | ---: |
| Item lifecycle | Required | Required | Required |
| Day planning | Required | Required | Required |
| Persistence/recovery | Required | Required | Required |
| Agent policy | Required | Required | Required |
| Bridge invocation | Required where mockable | Required | Required |
| Delegation authority | Required | Required | Required |
| Accessibility | Partial automation | N/A | Required |
| Packaging | N/A | Required | Required |

## Scope discipline

Do not parallelize features merely because old code contains them. The release path is Today + Inbox + continuity + bridge integration. Knowledge centers, generalized RAG, analytics dashboards, plugin ecosystems, cloud sync, cognitive profiling, and unrelated experimental modules remain out of scope until an accepted PRD changes that boundary.
