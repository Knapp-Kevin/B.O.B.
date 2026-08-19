# ADR-0005: Separate Assist Authority from Delegate Authority

**Status:** Proposed  
**Date:** 2026-08-19

## Context

Claude Code, Codex, and similar agents may possess filesystem, shell, repository, or tool authority. That capability is useful for delegated work but excessive for ordinary planning and conversational assistance.

## Decision

B.O.B. exposes two authority modes:

- **Assist:** reasoning and proposals over bounded context. No implicit external execution authority.
- **Delegate:** explicit bounded task execution with declared agent, workspace, capabilities, and cost class.

Entering Delegate mode requires intentional user action or an explicit policy that the user has configured for that exact class of work. Initial releases should require direct confirmation.

## Consequences

Positive:

- ordinary chat remains safer;
- delegation intent is visible;
- authority can be reasoned about independently from model capability;
- agent proposals cannot directly mutate canonical state.

Costs:

- some workflows require an extra confirmation step;
- bridge implementations must support restricted execution modes where vendor surfaces permit them;
- unsupported restriction capabilities must be surfaced rather than silently ignored.

## Rejected alternative

Giving every invoked coding agent its full native authority by default would make B.O.B. simpler to implement but would collapse the trust boundary between planning assistance and external execution.
