# B.O.B. Governance

## Purpose

Governance exists to keep B.O.B. coherent, reviewable, inexpensive to operate, and small enough to remain useful. It should prevent accidental architectural drift without creating ceremony for its own sake.

## Authority

The repository owner is the final product and technical authority unless that authority is explicitly delegated.

Repository changes should be proposed through pull requests. Material product or architecture changes require an associated PRD, RFC, or ADR as defined below.

## Change classes

| Change | Required record |
| --- | --- |
| User-facing capability or material behavior | PRD update or new PRD |
| New integration, protocol, storage strategy, or implementation mechanism | RFC |
| Durable architectural choice or principle | ADR |
| Routine bug fix, copy edit, dependency update, or test improvement | PR only |

One change may require more than one record when product intent and architecture both change.

## Decision rule

A decision is accepted when the repository owner approves the governing pull request. Approval means the written record, code, and documented consequences agree.

No implementation should silently redefine an accepted requirement or architecture decision.

## Scope rule

B.O.B. is a personal AI workbench with ADHD-friendly interaction design. Scope must remain anchored to:

- personal task and planning continuity;
- low-friction capture and organization;
- multi-agent access through supported bridges;
- explicit cost and authority controls;
- local-first user state.

Features outside those boundaries require explicit justification in a PRD and must explain why they belong in B.O.B. rather than another project.

## Review expectations

A material pull request should answer:

- What user problem does this solve?
- Which accepted requirement or decision authorizes it?
- What new authority or data access does it introduce?
- Does it increase recurring inference cost?
- Does it make B.O.B. dependent on a single vendor?
- Does it increase cognitive load?
- How is it tested?
- Which documentation changed with the implementation?

## No silent fallback rule

B.O.B. must not silently switch from subscription-backed or local inference to a metered API path. Any metered provider requires explicit user enablement and visible cost-policy state.

## Documentation is part of the product

A feature is not complete when its architecture, data ownership, cost implications, or user behavior are materially undocumented. Documentation changes should ship with the implementation that makes them true.

See [`docs/governance/`](docs/governance/) for the detailed governance policies.
