# B.O.B. Documentation

This directory is the authoritative design and decision record for the B.O.B. revival.

## Reading order

1. [`PRODUCT.md`](PRODUCT.md) defines what B.O.B. is and is not.
2. [`ARCHITECTURE.md`](ARCHITECTURE.md) defines system boundaries and ownership.
3. [`DESIGN.md`](DESIGN.md) defines the user experience and information architecture.
4. [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) defines how the revival should be executed.
5. [`ROADMAP.md`](ROADMAP.md) defines release sequencing.
6. `prd/` contains approved product requirements.
7. `rfc/` contains implementation proposals requiring review.
8. `adr/` contains durable architecture decisions.
9. `governance/` defines decision, scope, documentation, and provider-cost policies.

## Authority order

When documents conflict, use this order:

1. accepted ADRs for architectural decisions;
2. accepted PRDs for product requirements;
3. accepted RFCs for implementation contracts;
4. `PRODUCT.md` and `ARCHITECTURE.md` for current system intent;
5. implementation plans and roadmap documents;
6. historical changelogs and legacy code comments.

A later accepted ADR may supersede an earlier ADR only when it explicitly names the superseded record.

## Document states

Decision-bearing documents use one of these states:

- **Draft**: under active design.
- **Proposed**: ready for review.
- **Accepted**: authoritative until superseded.
- **Superseded**: replaced by a named later decision.
- **Rejected**: considered and intentionally not adopted.

## Visual standard

Architecture, state flow, authority, or user-flow documents should include Mermaid diagrams when a diagram materially improves comprehension. ASCII diagrams are acceptable for compact trust-boundary or directory-layout representations.

Diagrams are explanatory. The normative prose immediately surrounding them remains authoritative if rendering differs across tools.
