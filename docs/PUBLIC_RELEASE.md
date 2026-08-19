# Public Repository Release Gate

B.O.B. is intended to become a public repository, but visibility must not be changed until the repository is safe, legally clear, and pleasant for a first-time visitor to use.

This document is the release gate for changing the repository from private to public.

## Hard gates

Every item in this section must be complete before visibility changes.

### 1. Sanitize repository history

The current active tree is clean, but older reachable history contains artifacts that should not automatically become public:

- a large downloaded embedding-model weight;
- generated repository inventory output;
- historical dependency and runtime trees that are no longer part of the product;
- a test DOCX whose provenance and contents must be reviewed before publication;
- bundled third-party fonts, including files whose redistribution terms must be verified;
- commit metadata containing a personal email address.

Before publication, perform a full-history secret and privacy scan and choose one of these strategies:

1. rewrite the existing repository history to retain only intentionally publishable material; or
2. establish a new clean public root/history and preserve the old history in a separate private archive repository.

Deleting files from the current branch is not sufficient. Public visibility exposes reachable Git history and refs.

The pre-revival archive branch must not remain as a public ref unless every object reachable from it has been reviewed and approved for publication.

### 2. Choose and add an open-source license

The repository currently has no license. Do not make it public as an open-source project until a license has been selected and committed as `LICENSE`.

The license choice is an owner decision. For a permissive software project, MIT and Apache-2.0 are reasonable candidates; Apache-2.0 additionally provides an explicit patent grant. The chosen license must be compatible with every third-party file intentionally distributed by the project.

Until `LICENSE` exists, outside contributors should not be told that B.O.B. is open source.

### 3. Establish private vulnerability reporting

Before publication:

- enable GitHub Private Vulnerability Reporting for the repository;
- verify that the **Security** tab offers a private vulnerability-reporting path;
- update `.github/SECURITY.md` if GitHub changes the route or wording;
- confirm that normal issue templates direct security reports away from public issues.

### 4. Run a final secret and privacy review

Review the complete publishable history, branches, tags, issue/PR text, release assets, workflow logs, and repository metadata for:

- API keys, access tokens, passwords, private keys, cookies, connection strings, or credentials;
- personal addresses, phone numbers, private email addresses, or other unnecessary personal information;
- private documents, screenshots, exports, logs, or fixture data;
- internal URLs or identifiers that were never intended for public distribution.

Any exposed credential must be rotated even if it is removed from Git afterward.

### 5. Verify third-party licensing

For every vendored asset, font, model, icon, dataset, example document, and copied source file that remains in publishable history:

- identify its upstream source;
- verify redistribution rights;
- retain required copyright/license notices;
- remove anything whose provenance cannot be established confidently.

Prefer fetching build-time dependencies from their authoritative package/model source rather than committing large third-party binaries into this repository.

## Community surface

These files should exist and agree before publication:

| Surface | Purpose |
| --- | --- |
| `README.md` | Product promise, current status, architecture, and entry point |
| `.github/CONTRIBUTING.md` | Contribution workflow and quality bar |
| `.github/CODE_OF_CONDUCT.md` | Community behavior and enforcement expectations |
| `.github/SUPPORT.md` | Where bugs, questions, security reports, and support requests belong |
| `.github/SECURITY.md` | Security model and vulnerability-reporting path |
| `.github/ISSUE_TEMPLATE/` | Structured bug and feature intake |
| `.github/PULL_REQUEST_TEMPLATE.md` | Reviewable contribution contract |
| `LICENSE` | Legal permission to use, modify, and redistribute the project |

## Repository settings before publication

Set and verify the following in GitHub repository settings:

- **Description:** concise one-sentence explanation of B.O.B.;
- **Topics:** `adhd`, `productivity`, `ai-assistant`, `local-first`, `tauri`, `rust`, `agent`, `task-management` or the closest accurate set once implementation exists;
- **Issues:** enabled;
- **Discussions:** optional, enable only if there is a real intent to moderate and use them;
- **Wiki:** keep disabled unless documentation intentionally moves there;
- **Private vulnerability reporting:** enabled;
- **Secret scanning / push protection:** enabled wherever the account/repository plan supports them;
- **Dependabot alerts and security updates:** enabled once an active dependency graph exists;
- **Default branch protection:** prevent accidental destructive pushes once outside contribution begins;
- **Delete head branches after merge:** enable unless a workflow specifically requires retained branches;
- **Actions permissions:** restrict to the minimum required permissions and trusted actions;
- **Fork pull-request workflow permissions:** review before accepting untrusted code execution in CI.

## First-public-view check

Before changing visibility, open the repository as if you have never seen it before and verify:

1. the README explains what B.O.B. is in the first screenful;
2. the status clearly distinguishes implemented behavior from planned behavior;
3. installation instructions are absent until there is something installable, then are complete and tested;
4. contribution and security links are easy to find;
5. no private/internal language assumes access to unpublished systems;
6. links and Mermaid diagrams render correctly on GitHub;
7. no archive branch, release, artifact, or tag exposes material excluded from the public history;
8. the license is visible in GitHub's repository header;
9. a new contributor can determine how to report a bug without reading governance documents;
10. a security researcher can determine how to report a vulnerability without opening a public issue.

## Publication decision

The visibility switch is an explicit owner action. Completion of this checklist means the repository is ready to be considered for publication; it does not itself authorize changing visibility.

After publication, treat public-facing documentation, issue hygiene, release notes, and security reporting as part of the product experience rather than administrative residue.