# PRD-0003: Agent Bridges and Cost Control

**Status:** Proposed  
**Related:** RFC-0002, ADR-0003, ADR-0005

## Summary

B.O.B. shall integrate AI through vendor-neutral bridges with an explicit cost policy that prefers subscription-backed usage, then local inference, and permits metered APIs only through deliberate user enablement.

## Problem

The same model vendor may expose subscription-backed applications and separately billed APIs. Authentication method alone does not establish billing class. A personal productivity application must not accidentally convert ordinary assistance into open-ended token charges.

## Required billing classes

Each bridge declares one of:

- `subscription`
- `local`
- `metered`
- `unknown`

`unknown` is blocked until the user or implementation can classify it safely.

## Initial bridge priorities

1. Claude Code subscription-backed bridge;
2. Codex subscription-backed bridge;
3. optional GG-CORE local bridge;
4. metered direct APIs only as advanced opt-in integrations.

This priority is product policy, not a permanent vendor ranking.

## Functional requirements

### Availability

B.O.B. must detect whether a configured bridge is installed/available and report failure without blocking core application use.

### Cost visibility

The selected bridge's billing class must be visible in settings and available to the policy engine before invocation.

### No silent metered fallback

If a subscription bridge is unavailable or its allowance is exhausted, B.O.B. may offer another enabled subscription/local bridge or a wait state. It may not invoke a metered provider unless metered inference is enabled.

### Provider interface

All bridges must normalize capability, availability, request, result, and error behavior sufficiently for B.O.B. to remain provider-neutral.

### Authentication ownership

Where a vendor CLI owns subscription authentication, B.O.B. should prefer the vendor-supported authentication path rather than duplicating credential lifecycle logic.

### Local inference

Local inference is optional. B.O.B. must not require a local model to start or use deterministic features.

## Acceptance criteria

- selected provider and billing class are inspectable;
- metered bridges are off by default;
- no bridge can invoke a metered endpoint while metered usage is disabled;
- bridge failure produces an understandable state rather than a crash;
- at least one subscription-backed bridge supports machine-consumable invocation;
- switching allowed bridges does not change canonical task/plan ownership;
- provider logs do not expose protected credentials through B.O.B. logging.

## Non-goals

- cheapest-model auto-routing;
- token-by-token budget optimization in the first release;
- reselling inference;
- bypassing vendor terms or authentication controls;
- reverse engineering unsupported desktop-app protocols.
