# ADR-0003: Subscription-First Inference

**Status:** Rejected  
**Date:** 2026-08-19  
**Disposition:** Rejected by the first-alpha Wayfinder route before acceptance.

## Context

Personal AI usage can become expensive when every interaction uses a separately metered API. Existing user subscriptions may include substantial agent usage through supported vendor applications or CLIs. Local inference can also avoid per-request vendor charges.

Authentication method does not prove billing class.

The original proposal assumed subscription-backed bridges should be B.O.B.'s universal first preference. Subsequent Wayfinder research and owner decisions established a stronger product rule: prefer an appropriate supported zero-cost or already-included path for the active product boundary, while never silently transitioning to separately metered inference.

For the first runnable alpha, Gemini Developer API Free is the sole required inference backend. Subscription-backed and local adapters are deferred expansion paths.

## Rejected proposal

The original proposed ordering was:

1. subscription-backed supported agent bridges;
2. local inference;
3. metered API providers only when explicitly enabled.

This fixed ordering is rejected because it unnecessarily excludes a supported direct API path that is genuinely free for the alpha and would make the durable policy depend on one historical integration strategy.

## Governing replacement

The durable cost behavior is now recorded in `docs/governance/AI_COST_AND_PROVIDER_POLICY.md`:

- classify the actual billing behavior of each supported adapter;
- prefer configured zero-cost or already-included non-metered paths appropriate to the active product boundary;
- keep metered inference disabled unless explicitly enabled;
- never silently change backend when privacy, billing, or user intent would materially change;
- continue deterministic B.O.B. behavior when inference is unavailable.

## Consequence

This rejected ADR remains as decision history. It must not be cited as authority for implementation ordering.
