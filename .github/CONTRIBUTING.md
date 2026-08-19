# Contributing to B.O.B.

B.O.B. is an MIT-licensed open-source project in active revival. Contributions should make the product clearer, smaller, safer, and easier to use under real executive-function load.

## Start with the contract

Before implementation, read:

1. [`README.md`](../README.md)
2. [`docs/governance/GOVERNANCE.md`](../docs/governance/GOVERNANCE.md)
3. [`AGENTS.md`](../AGENTS.md)
4. [`docs/PRODUCT.md`](../docs/PRODUCT.md)
5. [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md)
6. the relevant PRD, RFC, ADR, and implementation-plan sections

Do not infer current requirements from the archived Electron/Ollama implementation.

## Before opening work

Search existing issues and pull requests first. For a meaningful feature, prefer opening or joining an issue before investing heavily in implementation. Small documentation fixes and narrowly obvious bug fixes do not need a ceremony committee.

Never include credentials, tokens, private files, personal data, or vulnerability details in issues, pull requests, screenshots, fixtures, or logs. Security reports follow [`SECURITY.md`](SECURITY.md).

Participation is governed by [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).

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

## Validation and CI

B.O.B. intentionally keeps GitHub Actions and required CI gates minimal. The implementing developer or coding agent owns validation before requesting review.

Run the checks relevant to the change, such as builds, unit tests, linting, type checks, targeted integration tests, and manual UI validation. The pull request should state exactly what was run, what passed, and what was not run.

CI, when present, is a safety net rather than a substitute for implementation-time validation.

## Pull request expectations

Keep pull requests focused enough that a reviewer can understand the change without reconstructing several unrelated intentions. Use the repository pull-request template. Include screenshots for meaningful UI changes and concrete validation for behavior, persistence, authority, or cost changes.

Maintainers may close superseded, duplicate, out-of-scope, or abandoned contributions. Closing a proposal is a scope decision, not a judgment on the person who submitted it.

## Definition of done

A change is complete when its behavior satisfies the governing acceptance criteria, deterministic logic has appropriate tests, security and authority boundaries remain explicit, metered inference cannot occur unexpectedly, accessibility has not regressed, documentation matches the shipped behavior, and no dead parallel path is left behind without a documented reason.

## Design bias

Prefer a smaller product with strong boundaries over a larger product with impressive nouns. B.O.B. should integrate specialized agents rather than reimplement them, own personal work state rather than vendor sessions, and remove obsolete paths rather than preserve them indefinitely in the active tree.

## Support and community

Read [`SUPPORT.md`](SUPPORT.md) for bug, question, and support routing. Read [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) for participation expectations.

## License

By contributing to B.O.B., you agree that your contribution may be distributed under the repository's [MIT License](../LICENSE).

## Historical code

The pre-revival implementation remains historical evidence in Git history and the named archive branch. It is not a supported release line and not an architectural authority.
