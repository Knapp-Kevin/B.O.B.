# ADR-0001: B.O.B. Owns the Work; Agents Provide the Intelligence

**Status:** Proposed  
**Date:** 2026-08-19

## Context

Claude, ChatGPT, Codex, Claude Code, local models, and future agents already provide model-specific interfaces. B.O.B. cannot and should not compete by rebuilding each vendor product.

The differentiated value is a consistent personal work layer across those agents.

## Decision

B.O.B. owns canonical tasks, plans, preferences, continuity, application actions, and user-facing workflow state.

Agent systems provide reasoning, generation, and explicitly delegated execution through bounded bridges.

## Consequences

Positive:

- vendor switching does not move canonical work state;
- B.O.B. remains useful without AI;
- agent replacement is an integration change rather than a product rewrite;
- user experience can optimize for executive function instead of vendor chat conventions.

Costs:

- B.O.B. must implement a context broker and proposal-validation layer;
- some vendor-native session features may not transfer between bridges;
- continuity summaries require deliberate product design.

## Rejected alternative

Making a vendor conversation/session the system of record would reduce initial integration work but would make B.O.B. dependent on that vendor's data and lifecycle semantics.
