# Documentation Standard

## Objective

Documentation should let a technically competent reader understand B.O.B.'s product intent, architecture, trust boundaries, active decisions, and implementation status without reverse engineering the repository.

Platinum-grade does not mean maximum word count. It means accurate, navigable, traceable, visually clear, and maintained with the code.

## Required qualities

### Accurate

Do not document planned behavior as implemented behavior. Status labels such as Proposed, Accepted, Implemented, Experimental, and Legacy should be used deliberately.

### Authoritative

Each major question should have one primary source. Supporting documents should link rather than restating slightly different rules.

### Traceable

Material requirements should link to PRDs. Implementation contracts should link to RFCs. Durable choices should link to ADRs.

### Visual where useful

Use Mermaid for:

- architecture;
- data flow;
- authority boundaries;
- state transitions;
- sequences;
- user flows.

Use ASCII for compact layouts, trust boundaries, and directory structures where Mermaid adds little value.

### Concise

Prefer a diagram plus precise prose over several pages of repeated narrative. Avoid documentation that exists only to imitate enterprise ceremony.

## Required repository documents

Before the first revived release candidate, maintain:

- root `README.md`;
- `GOVERNANCE.md`;
- `SECURITY.md`;
- `CONTRIBUTING.md`;
- `AGENTS.md`;
- product definition;
- architecture;
- interaction design;
- implementation plan;
- roadmap;
- accepted PRDs/RFCs/ADRs;
- user-facing setup/configuration instructions once implementation exists;
- development/build/test instructions once implementation exists;
- data/export/recovery instructions once implementation exists.

Do not create setup instructions for software that has not been implemented yet merely to make the documentation set appear complete.

## Diagram rule

A diagram must have a clear purpose and nearby explanation. Decorative diagrams are not evidence of architectural quality.

## Change rule

A PR that changes a documented contract must update the authoritative document in the same change. A reviewer should not have to infer whether code or prose is newer.

## Link hygiene

Prefer repository-relative links for repository documents. External technical claims that affect architecture should be re-verifiable and should not use tracking parameters.

## Legacy content

Historical documentation should be labeled Legacy or moved to an explicitly historical location. Do not allow old architecture descriptions to compete with current authoritative documentation.
