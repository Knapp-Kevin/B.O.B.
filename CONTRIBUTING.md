# Contributing to B.O.B.

B.O.B. is currently a private revival project. Contributions should optimize for clarity, bounded scope, testability, and a low cognitive burden for the eventual user.

## Before starting

Read `GOVERNANCE.md`, `AGENTS.md`, `docs/PRODUCT.md`, and `docs/ARCHITECTURE.md`. Then identify the accepted PRD, RFC, or ADR governing the proposed change.

## Branch and pull request discipline

Use a focused branch and keep unrelated work separate. Pull requests should be reviewable as one coherent change.

Material PRs should include:

- the user problem;
- scope and non-goals;
- governing PRD/RFC/ADR references;
- architecture or data-flow impact;
- inference-cost impact;
- validation performed;
- documentation updates.

## Definition of done

A change is complete when:

1. behavior satisfies its acceptance criteria;
2. deterministic logic has relevant tests;
3. trust and authority boundaries remain intact;
4. no unexpected metered AI usage can occur;
5. accessibility behavior has not regressed;
6. documentation describes the behavior that actually ships;
7. no dead implementation path is left behind without an explicit reason.

## Design bias

Prefer deletion and simplification over parallel implementations. Git history is the archive. The active tree should represent the current product, not every experiment that preceded it.
