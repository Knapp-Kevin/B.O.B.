# Contributing to B.O.B.

B.O.B. is currently a private revival project. Contributions should make the product clearer, smaller, safer, and easier to use under real executive-function load.

## Start with the contract

Before implementation, read:

1. [`README.md`](../README.md)
2. [`docs/governance/GOVERNANCE.md`](../docs/governance/GOVERNANCE.md)
3. [`AGENTS.md`](../AGENTS.md)
4. [`docs/PRODUCT.md`](../docs/PRODUCT.md)
5. [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md)
6. the relevant PRD, RFC, ADR, and implementation-plan sections

Do not infer current requirements from the archived Electron/Ollama implementation.

## Contribution standard

A good change has one coherent reason to exist. It identifies the user problem, keeps scope bounded, respects canonical-state and authority boundaries, includes the smallest useful test surface, and updates documentation when behavior changes.

Material pull requests should make the following reviewable without archaeology:

- **Intent:** what problem is solved and for whom;
- **Scope:** what changes and what explicitly does not;
- **Authority:** what the application, agent, user, or external process may now do;
- **Data:** what is read, written, persisted, exported, or migrated;
- **Cost:** whether AI cost classification or provider behavior changes;
- **Accessibility:** whether cognitive load, keyboard use, motion, contrast, density, or readable hierarchy changes;
- **Evidence:** tests, manual validation, screenshots where appropriate, and failure-path verification;
- **Traceability:** PRD, RFC, ADR, issue, or explicit explanation when none is required.

## Definition of done

A change is complete when its behavior satisfies the governing acceptance criteria, deterministic logic has appropriate tests, security and authority boundaries remain explicit, metered inference cannot occur unexpectedly, accessibility has not regressed, documentation matches the shipped behavior, and no dead parallel path is left behind without a documented reason.

## Design bias

Prefer a smaller product with strong boundaries over a larger product with impressive nouns. B.O.B. should integrate specialized agents rather than reimplement them, own personal work state rather than vendor sessions, and remove obsolete paths rather than preserve them indefinitely in the active tree.

## Historical code

The pre-revival repository is preserved on `archive/pre-revival-cleanup-2026-08-19`. It is historical evidence, not a supported branch and not an architectural authority.
