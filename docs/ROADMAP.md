# B.O.B. Roadmap

**Status:** Accepted

The roadmap is capability-oriented rather than calendar-oriented. A release advances when its acceptance criteria are satisfied, not because a date arrived and demanded tribute.

## Revival baseline

**Goal:** Make the repository understandable before changing the runtime.

- authoritative README and documentation map;
- governance, security, and contribution rules;
- product definition;
- single-agent architecture and interaction design;
- PRDs, RFCs, ADRs;
- legacy status clearly documented.

## v0.2: Better Organized Brain core

**Goal:** Deliver a useful AI-independent personal planning application on the new architecture.

Includes:

- Today;
- Inbox;
- quick capture;
- task lifecycle;
- focus items;
- deterministic planning and replanning;
- local versioned state;
- accessibility baseline;
- import/export foundation.

Does not require an inference runtime.

## v0.3: B.O.B. with multiple inference backends

**Goal:** Prove the product distinction while preserving one B.O.B. identity.

Includes:

- B.O.B. Agent Core;
- RuntimeAdapter contract;
- Claude runtime adapter;
- Codex runtime adapter;
- one B.O.B. conversation identity across backends;
- simple default runtime plus explicit user override;
- bounded context broker;
- structured proposals;
- action preview and validation;
- subscription-first cost policy;
- continuity while switching runtimes.

The UI does not present a multi-agent roster or require the user to manage peer agents.

## v0.4: Bounded delegated work

**Goal:** Let the user delegate work to B.O.B. without collapsing the safety boundary between assistance and execution.

Includes:

- Assist and Delegate authority modes;
- bounded workspace grants;
- capability disclosure;
- runtime/tool selection behind B.O.B.;
- execution status;
- cancellation where supported;
- result capture;
- understandable activity history.

## v0.5: Optional local intelligence

**Goal:** Add a no-vendor-inference-fee local path when operationally justified.

Candidate:

- GG-CORE integration;
- local model selection behind B.O.B.;
- private/offline assist workflows;
- graceful fallback to deterministic B.O.B. when local inference is unavailable.

## Later candidates, not commitments

Potential future work must earn a PRD before entering implementation:

- calendar integration;
- recurring routines;
- notification scheduling;
- richer continuity summaries;
- optional runtime recommendations;
- selective document context;
- mobile companion or web access;
- encrypted sync;
- interoperability protocols.

These are intentionally not promises. The project should remain smaller than the problem space around it.
