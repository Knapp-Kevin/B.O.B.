# B.O.B. Roadmap

**Status:** Proposed

The roadmap is capability-oriented rather than calendar-oriented. A release advances when its acceptance criteria are satisfied, not because a date arrived and demanded tribute.

## Revival baseline

**Goal:** Make the repository understandable before changing the runtime.

- authoritative README and documentation map;
- governance, security, and contribution rules;
- product definition;
- architecture and interaction design;
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

Does not require an AI provider.

## v0.3: Multi-agent assist

**Goal:** Prove the product distinction with at least two subscription-backed agent bridges.

Includes:

- AgentBridge contract;
- Claude Code bridge;
- Codex bridge;
- explicit agent selection;
- bounded context broker;
- structured proposals;
- action preview and validation;
- subscription-first cost policy;
- continuity while switching agents.

## v0.4: Delegated work

**Goal:** Allow selected agents to perform bounded external work without collapsing the safety boundary between chat and execution.

Includes:

- Assist and Delegate modes;
- workspace grants;
- capability disclosure;
- execution status;
- cancellation where supported;
- result capture;
- understandable activity history.

## v0.5: Optional local intelligence

**Goal:** Add a no-inference-fee local path when it is operationally justified.

Candidate:

- GG-CORE integration;
- locally managed model selection;
- private/offline assist workflows;
- graceful fallback to deterministic B.O.B. when local inference is unavailable.

## Later candidates, not commitments

Potential future work must earn a PRD before entering implementation:

- calendar integration;
- recurring routines;
- notification scheduling;
- richer continuity summaries;
- optional provider recommendations;
- selective document context;
- mobile companion or web access;
- encrypted sync;
- interoperability protocols.

These are intentionally not promises. The project should remain smaller than the problem space around it.
