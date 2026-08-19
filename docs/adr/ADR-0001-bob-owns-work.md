# ADR-0001: B.O.B. Is the Agent and Owns the Work

**Status:** Accepted  
**Date:** 2026-08-19

## Context

Claude, ChatGPT, Codex, Claude Code, local models, and future AI runtimes already provide powerful model-specific capabilities. B.O.B. should not compete by rebuilding every vendor product, nor should it expose a collection of peer agents that the user must manage.

B.O.B.'s differentiated value is a single coherent personal agent and work layer that can draw on different models, inference runtimes, and tools without fragmenting the user experience.

## Decision

B.O.B. is the single user-facing agent.

B.O.B. owns canonical tasks, plans, preferences, continuity, application actions, conversation identity, and user-facing workflow state.

Models, inference runtimes, vendor CLIs, and tools provide capabilities behind B.O.B. They do not become peer user-facing agents or systems of record.

Provider/runtime identity may be exposed when relevant to cost, privacy, capability, troubleshooting, or explicit user choice, but ordinary interaction remains with B.O.B.

## Consequences

Positive:

- the user has one point of contact;
- changing models/runtimes does not move canonical work state or conversation identity;
- B.O.B. remains useful without AI inference;
- runtime replacement is an integration change rather than a product rewrite;
- the interface can optimize for executive function instead of provider mechanics;
- complex back-end capability does not require complex front-end mental models.

Costs:

- B.O.B. must implement a context broker, inference router, and proposal-validation layer;
- runtime-specific session features may not transfer directly;
- continuity summaries require deliberate product design;
- the application must distinguish B.O.B. authority from underlying runtime capabilities.

## Rejected alternatives

### Multi-agent user-facing architecture

Presenting Claude, Codex, local runtimes, and future systems as peer agents would expose infrastructure complexity directly to the user and undermine B.O.B.'s simplified one-point-of-contact purpose.

### Vendor session as system of record

Making a vendor conversation/session canonical would reduce initial integration work but would make B.O.B. dependent on that vendor's data and lifecycle semantics.
