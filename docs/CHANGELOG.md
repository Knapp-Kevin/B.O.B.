# Changelog

All notable changes to the revived B.O.B. project are recorded here. This file describes the active revival line, not every historical prototype experiment.

## Unreleased

### Public repository readiness

- added a community code of conduct and support-routing policy;
- hardened issue intake against accidental public disclosure of credentials, private data, and vulnerability details;
- documented GitHub Private Vulnerability Reporting as the required public security-reporting path;
- added a binding public-release gate covering history sanitization, secret/privacy review, third-party licensing, repository settings, and first-public-view validation;
- made an explicit open-source license a hard gate before accepting external implementation contributions;
- documented that the clean active tree does not by itself make older reachable Git history safe for publication.

### Repository reset

- established B.O.B. as Better Organized Brain, a vendor-neutral personal AI workbench;
- established the Today, Inbox, B.O.B. Chat, and Settings product surfaces;
- documented B.O.B.-owned canonical state and multi-agent bridge boundaries;
- documented subscription-first inference cost policy and explicit metered opt-in;
- documented Assist versus Delegate authority;
- added PRDs, RFCs, ADRs, governance, security, contribution, design, roadmap, and traceability documentation;
- retired the Electron/Ollama/RAG-era implementation from the active tree;
- removed the legacy npm dependency graph, generated directory inventory, duplicate scripts, checked-in embedding model, Python skeleton, historical version directories, and other prototype artifacts from `master`;
- preserved the complete pre-cleanup tree on `archive/pre-revival-cleanup-2026-08-19`;
- closed obsolete Dependabot pull requests targeting the retired dependency graph.

## Legacy alpha history

The original alpha changelog is preserved as [`legacy/ALPHA_CHANGELOG.md`](legacy/ALPHA_CHANGELOG.md). The complete historical implementation remains available on the named archive branch and in Git history until the public-history sanitization decision is executed.
