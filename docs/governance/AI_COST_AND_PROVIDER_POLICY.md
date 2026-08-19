# AI Cost and Provider Policy

## Objective

Make B.O.B. safe for sustained personal use without surprise usage charges or hidden provider changes.

## Billing classes

Every inference/runtime adapter must expose a billing class before invocation:

| Class | Meaning | Default policy |
| --- | --- | --- |
| `free` | Provider-supported use is available without direct metered billing for the configured path, subject to provider quota/terms | Allowed when configured |
| `subscription` | Invocation is expected to consume an included vendor subscription allowance rather than direct per-token API billing | Allowed when configured |
| `local` | Inference runs on user-controlled local compute without vendor inference fees | Allowed when configured |
| `metered` | Invocation may generate separately billed usage | Disabled by default |
| `unknown` | Billing behavior cannot be classified with confidence | Blocked |

OAuth, API keys, CLI login, and browser login are authentication mechanisms. They do not determine billing class by themselves.

A `free` classification is not a promise of permanent availability. Provider quota, eligibility, data-use terms, and product policy must be verified for the supported integration surface and surfaced where materially relevant.

## Default ordering

The active product boundary decides which configured adapters exist. Within that boundary, B.O.B. should prefer the least surprising allowed path rather than preserving a historical provider ordering for its own sake.

General default preference:

1. an explicit user-selected allowed adapter;
2. an enabled `free` path appropriate to the requested capability;
3. an enabled already-included `subscription` path;
4. an enabled `local` path;
5. an explicitly enabled `metered` path;
6. otherwise continue without inference and explain the available next step.

For the first runnable alpha, the resolved Wayfinder route selects **Gemini Developer API Free** as the sole required inference backend. Subscription-backed and local adapters are later expansion paths, not alpha prerequisites.

## No silent fallback

A provider failure, authentication failure, rate limit, free-quota exhaustion, subscription allowance exhaustion, local-runtime failure, or provider outage must not silently cause metered API traffic.

Valid outcomes include:

- continue without AI while deterministic B.O.B. planning remains available;
- use another enabled non-metered path only when the active product boundary and user policy permit it;
- wait for allowance or quota reset;
- explicitly enable a metered provider.

Backend changes that materially affect privacy, billing, or user intent must not occur silently.

## Metered enablement

Metered inference requires an explicit settings action. The UI must identify that the provider is metered. Later implementations may add budget ceilings, but absence of a budget feature does not weaken the default-disabled rule.

## Provider verification

Adapter documentation must identify the supported vendor surface being used and the basis for its billing classification. When vendor terms, quota, eligibility, privacy/data-use policy, or product behavior changes, the classification must be re-verified before documentation continues to claim free, subscription-backed, or otherwise included use.

## Terms and support boundaries

B.O.B. should integrate supported programmatic, CLI, or runtime interfaces. Do not rely on reverse-engineered private app protocols, credential scraping, or mechanisms intended to bypass vendor billing or usage controls.

## Local inference

Local inference is considered no-vendor-inference-fee, not zero-cost. Compute, power, hardware, and setup costs still exist. The UI need not monetize those costs but should describe them accurately.

## Logging

Do not log secrets, raw authentication tokens, API keys, or unnecessary billing metadata. Operational status should use non-sensitive adapter identifiers and normalized error classes.
