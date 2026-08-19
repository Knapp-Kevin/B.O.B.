# PRD-0003: Inference Runtimes and Cost Control

**Status:** Accepted  
**Related:** RFC-0002, ADR-0003, ADR-0005

## Summary

B.O.B. shall support multiple inference runtimes behind one agent identity while enforcing an explicit cost policy that prefers subscription-backed usage, then local inference, and permits metered APIs only through deliberate user enablement.

## Product invariant

The selected model/runtime is a B.O.B. capability, not a second user-facing agent.

## Problem

The same AI vendor may expose subscription-backed applications and separately billed APIs. Authentication method alone does not establish billing class. A personal productivity application must not accidentally convert ordinary assistance into open-ended token charges.

At the same time, users should not have to micromanage infrastructure every time they ask B.O.B. a question. Cost and privacy policy should be explicit and enforceable while ordinary interaction remains simple.

## Required billing classes

Each runtime adapter declares one of:

- `subscription`
- `local`
- `metered`
- `unknown`

`unknown` is blocked until safely classified.

## Initial runtime priorities

1. Claude subscription-backed runtime path;
2. Codex subscription-backed runtime path;
3. optional GG-CORE/local runtime path;
4. metered direct APIs only as advanced opt-in integrations.

This priority is product policy, not a permanent vendor ranking.

## Functional requirements

### Availability

B.O.B. must detect whether a configured runtime is available and report failure without blocking core application use.

### Runtime identity

The runtime/model used for a request must be inspectable when useful, but B.O.B. remains the conversational identity presented to the user.

### Cost visibility

A runtime's billing class must be available to the policy engine before invocation and visible in Settings.

### No silent metered fallback

If a subscription runtime is unavailable or its allowance is exhausted, B.O.B. may offer another enabled subscription/local runtime or continue without inference. It may not invoke a metered provider unless metered inference is explicitly enabled.

### Runtime interface

All runtime adapters must normalize capability, availability, request, result, cancellation, and error behavior sufficiently for B.O.B. to remain backend-neutral.

### Authentication ownership

Where a vendor-supported runtime/CLI owns subscription authentication, B.O.B. should prefer that supported authentication path rather than duplicating credential lifecycle logic unnecessarily.

### Local inference

Local inference is optional. B.O.B. must not require a local model to start or use deterministic features.

### User choice versus automatic routing

The user may select a runtime when cost, privacy, or capability matters. The initial release does not require opaque automatic model scoring or autonomous optimization.

## Acceptance criteria

- B.O.B. remains the single user-facing agent regardless of runtime;
- selected runtime and billing class are inspectable;
- metered runtimes are off by default;
- no adapter can invoke a metered endpoint while metered usage is disabled;
- runtime failure produces an understandable state rather than a crash;
- at least one subscription-backed runtime supports machine-consumable invocation;
- a second runtime can be used without changing canonical B.O.B. state or identity;
- runtime logs do not expose protected credentials through B.O.B. logging.

## Non-goals

- cheapest-model auto-routing in the first release;
- token-by-token budget optimization;
- user-facing multi-agent orchestration;
- reselling inference;
- bypassing vendor terms or authentication controls;
- reverse engineering unsupported desktop-app protocols.
