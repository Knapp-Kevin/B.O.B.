# ADR-0004: Local B.O.B. State Is Canonical

**Status:** Proposed  
**Date:** 2026-08-19

## Context

A multi-agent workbench cannot provide continuity if each vendor session independently owns the user's tasks and working state.

## Decision

B.O.B. maintains canonical personal work state locally by default. Vendor sessions may be used to execute requests but are not required to reconstruct B.O.B.'s task, plan, preference, or continuity state.

## Consequences

Positive:

- provider independence;
- offline access to core work state;
- clear export and backup ownership;
- deterministic application behavior without an AI provider.

Costs:

- B.O.B. must own migrations and data recovery;
- selective context must be constructed for each provider invocation;
- cross-device sync is not automatic and remains a future product decision.

## Rejected alternative

Storing canonical state in a cloud model provider would reduce local persistence work but bind product continuity to one vendor and complicate multi-agent operation.
