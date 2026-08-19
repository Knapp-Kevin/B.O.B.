# ADR-0003: Subscription-First Inference

**Status:** Proposed  
**Date:** 2026-08-19

## Context

Personal AI usage can become expensive when every interaction uses a separately metered API. Existing user subscriptions may include substantial agent usage through supported vendor applications or CLIs. Local inference can also avoid per-request vendor charges.

Authentication method does not prove billing class.

## Decision

B.O.B.'s default inference priority is:

1. subscription-backed supported agent bridges;
2. local inference;
3. metered API providers only when explicitly enabled.

Metered inference is disabled by default and cannot be a silent fallback.

## Consequences

Positive:

- ordinary use aligns with predictable subscription costs;
- no surprise token billing from fallback behavior;
- provider cost semantics become visible product state;
- local inference remains available without becoming mandatory.

Costs:

- vendor CLI availability and allowance limits require bridge-specific handling;
- subscription interfaces may expose fewer controls than direct APIs;
- direct API integrations become an advanced rather than primary path.

## Rejected alternative

Using direct API keys as the default integration is technically straightforward but violates the product's cost objective for sustained personal use.
