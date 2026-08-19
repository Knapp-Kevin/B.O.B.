# ADR-0005: Separate B.O.B. Assist Authority from Delegate Authority

**Status:** Accepted  
**Date:** 2026-08-19

## Context

Some inference runtimes and tools available to B.O.B. may possess filesystem, shell, repository, or other execution capabilities. Those capabilities are useful for bounded delegated work but excessive for ordinary planning and conversational assistance.

The user should not need to reason about a collection of agents. The authority question is simpler: **what is B.O.B. allowed to do for this request?**

## Decision

B.O.B. exposes two authority modes:

- **Assist:** B.O.B. may reason, summarize, organize, transform, and propose using an allowed inference runtime. No implicit external execution authority.
- **Delegate:** the user explicitly grants B.O.B. bounded task execution authority with a declared workspace, capability set, runtime/tool constraints, and cost class.

Entering Delegate mode requires intentional user action or an explicit policy the user has configured for that exact class of work. Initial releases should require direct confirmation.

The user delegates to **B.O.B.**, not to a separate peer agent. B.O.B. may use an execution-capable runtime or approved tool inside the grant.

## Consequences

Positive:

- ordinary chat remains safer;
- B.O.B. remains the single point of contact;
- delegation intent is visible;
- authority can be reasoned about independently from model/runtime capability;
- model proposals cannot directly mutate canonical state;
- changing runtime does not silently change authority.

Costs:

- some workflows require an extra confirmation step;
- runtime/tool adapters must support restriction where possible;
- unsupported restriction capabilities must be surfaced rather than silently ignored.

## Rejected alternative

Giving every tool-capable runtime its full native authority by default would simplify integration but collapse the trust boundary between ordinary B.O.B. assistance and external execution.
