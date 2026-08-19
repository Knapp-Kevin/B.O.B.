# Public Repository Maintenance

B.O.B. is a public, MIT-licensed repository. This document preserves the small set of public-repository hygiene checks that matter without turning the project into an administrative hobby.

## Public baseline

The repository should maintain:

- a truthful README that distinguishes implemented capabilities from planned work;
- an explicit open-source license;
- contribution, conduct, support, and security guidance;
- structured issue and pull-request intake;
- a clear private route for vulnerability reports;
- a deliberately small active tree;
- no committed secrets, private user data, generated model weights, or unexplained third-party binaries;
- minimal CI, with implementation-time validation owned by the developer or coding agent.

## Before a supported release

Before publishing the first supported release candidate:

1. verify install/build instructions on the supported platform;
2. define the supported-version statement in `.github/SECURITY.md`;
3. review active dependencies and bundled assets for license and provenance requirements;
4. verify the private vulnerability-reporting path;
5. ensure release artifacts contain no credentials, personal data, debug logs, or unintended local state;
6. verify README status, screenshots, badges, and architecture match what actually ships.

## Repository history

The public repository contains historical pre-revival material in older Git history and the named archive branch. That includes retired prototype code and artifacts that are not part of the active product.

Historical material is not supported software and is not an architectural authority. If a secret, private document, or asset with incompatible redistribution terms is identified in history, treat that as a remediation task rather than assuming deletion from `master` was sufficient.

## GitHub settings

Keep repository settings proportionate to the project:

- Issues enabled;
- Wiki and Discussions only if there is a real use for them;
- private vulnerability reporting enabled when available;
- secret scanning or push protection enabled when available;
- Dependabot security alerts enabled once the revived dependency graph exists;
- default-branch safeguards without mandatory expensive CI;
- GitHub Actions limited to checks that provide enough value to justify their cost.

## Principle

Public-repository hygiene should help people understand, use, contribute to, and safely report problems with B.O.B. It should not become a second product that needs its own project manager.
