# Requirements and Decision Traceability

This document provides a concise map from product promise to governing records.

| Product concern | PRD | RFC | ADR | Primary design |
| --- | --- | --- | --- | --- |
| Multi-agent personal workspace | PRD-0001 | RFC-0002 | ADR-0001 | `PRODUCT.md`, `ARCHITECTURE.md` |
| ADHD-friendly planning | PRD-0002 | RFC-0003 | ADR-0004 | `DESIGN.md` |
| Subscription-first AI cost | PRD-0003 | RFC-0002 | ADR-0003 | governance cost policy |
| Desktop runtime | PRD-0001 | RFC-0001 | ADR-0002 | `ARCHITECTURE.md` |
| Canonical local state | PRD-0001, PRD-0002 | RFC-0003 | ADR-0004 | `ARCHITECTURE.md` |
| Agent authority | PRD-0001 | RFC-0002 | ADR-0005 | `SECURITY.md`, `ARCHITECTURE.md` |
| Optional local inference | PRD-0003 | RFC-0002 | ADR-0003 | `ROADMAP.md` |

## Implementation traceability

Implementation pull requests should list the governing records they satisfy. Acceptance criteria should be converted into tests or explicit manual validation where automation is not practical.

If code cannot be traced to an accepted requirement and meaningfully expands behavior, stop and determine whether the requirement is missing or the code is out of scope.
