# Wayfinder Operating Guide

## Purpose

Wayfinder is B.O.B.'s governed design-resolution process for moving from product intent to build-ready implementation without forcing coding agents to invent architecture, product behavior, or acceptance criteria.

It exists to answer one question at a time until the implementation route is clear.

The current canonical map for the first runnable alpha is the GitHub issue titled `Wayfinder map: first runnable B.O.B. alpha`.

## Core principles

1. **The map is an index, not the decision store.**
   - Decisions live in their owning tickets.
   - The map carries only concise state, a one-line gist, and links.
2. **Resolve only the current frontier.**
   - Do not pre-slice vague fog into speculative tickets.
   - A decision becomes a ticket only when the question can be stated precisely enough to resolve.
3. **Research facts; ask humans for judgment.**
   - Agents research current technical, provider, standards, and repository facts independently.
   - Owner input is reserved for product, architecture, risk, experience, and priority decisions that genuinely require owner judgment.
4. **One user-facing B.O.B. agent.**
   - Models, runtimes, provider CLIs, and tools remain capabilities behind B.O.B.
5. **Smallest sufficient product.**
   - Prefer the smallest decision and implementation boundary that proves useful behavior without creating avoidable platform, provider, or operational scope.
6. **No implementation through unresolved fog.**
   - Production implementation begins only after the in-scope decision route is clear and the convergence audit passes.

## Artifact roles

### Map

The map owns:

- destination;
- settled-decision pointers;
- current frontier;
- in-scope fog that is not yet precise enough to ticket;
- explicit out-of-scope boundaries;
- handoff rules for the build-ready specification.

The map must not duplicate full ticket resolutions.

### Decision ticket

A decision ticket owns one precise question. It should contain enough context that a fresh agent can understand the decision without reconstructing the whole repository.

Decision tickets are either:

- **HITL grilling:** requires owner disposition;
- **HITL prototype:** requires owner review of a bounded decision aid;
- **AFK research:** factual question that can be resolved autonomously from authoritative evidence.

### Fog

Fog is an unresolved area whose exact decision question is not yet known.

Do not create a ticket merely because an area is incomplete. Graduate fog into a ticket only when the question, consequence, and completion condition are precise.

## Live-state recomputation

Every Wayfinder run begins from live repository state.

Read:

1. current default branch;
2. this operating guide;
3. the canonical Wayfinder map;
4. every open Wayfinder-labelled ticket;
5. recently resolved Wayfinder tickets relevant to the current frontier;
6. new comments and owner dispositions;
7. current assignees/claims;
8. relevant pull-request and accepted/proposed record state when it affects the decision graph.

Never trust a hardcoded previous frontier, scheduler handoff, old comment, or stale status summary over current GitHub state.

## Authority precedence during an active Wayfinder map

For the planning effort governed by a Wayfinder map:

1. explicit owner dispositions in resolved Wayfinder tickets govern the current map destination;
2. accepted ADRs, RFCs, PRDs, governance documents, and product documents remain binding except where a resolved Wayfinder decision intentionally changes the destination-specific requirement;
3. contradictions created by a newer resolved Wayfinder decision are **stale-document debt**, not grounds to silently reopen the settled decision;
4. stale binding documentation must be reconciled before the convergence audit can pass and before the final build-ready specification becomes authoritative.

A Wayfinder ticket does not silently rewrite unrelated long-term policy. Reconciliation must make the intended scope explicit.

## Frontier calculation

The frontier is the set of open decision tickets that are:

- in scope for the map destination;
- precise enough to resolve;
- not blocked by an unresolved prerequisite;
- not already claimed by another active resolver;
- not invalidated by a newer decision.

Choose work only after recomputing this set.

If several tickets are technically eligible, prefer the one whose resolution most directly constrains the others or removes the most downstream ambiguity.

## Claim discipline

Before resolving a selected decision ticket, claim it by assignment.

Per run:

- claim at most one HITL decision ticket;
- eligible AFK research may also be completed within the same run when it directly supports the frontier or removes a future blocker;
- do not claim another HITL ticket merely because the active one is waiting for the owner.

A claimed HITL ticket remains the active owner gate until the owner responds or the ticket is otherwise invalidated.

## Grilling protocol

A grilling ticket should ask the entire currently answerable decision frontier for that one question in a single round.

For each decision item:

1. state the decision plainly;
2. provide the recommended answer;
3. explain the consequences and relevant tradeoffs;
4. distinguish verified repository/external facts from judgment;
5. avoid asking the owner to research facts the agent can obtain independently.

End with one proposed resolution block concise enough that the owner can respond with `accept as proposed` or amend specific numbered items.

Do not resolve the human side of a grilling ticket autonomously.

## Prototype protocol

A prototype is a bounded decision aid, not implementation authority.

Prototype only enough to answer the ticket's user-experience question. Record the exact reviewed artifact or commit when useful. Owner approval resolves the UX decision, not unrelated architecture.

## Research protocol

AFK research tickets may be resolved autonomously.

Use current authoritative or primary sources where external facts matter. Record:

- question answered;
- evidence;
- finding;
- consequence for the Wayfinder route;
- any newly precise decision surfaced by the research.

Close the research ticket only when its factual question is actually answered.

## Blocker sweep

Every run performs a blocker sweep after frontier recomputation.

Look for current or likely future blockers such as:

- stale scheduler handoffs;
- contradictory accepted/binding documentation;
- unresolved researchable facts;
- obsolete tickets preserved after a superseding decision;
- invalid or circular blocker assumptions;
- already-resolved owner questions that still appear open elsewhere;
- missing authority precedence;
- tool, credential, platform, or repository-access limitations;
- hidden implementation choices that a future coding agent would otherwise be forced to invent.

Resolve researchable or process blockers autonomously when within scope. Record remaining precise blockers in the owning ticket or map. Do not manufacture tickets from vague possibility alone.

## Waiting behavior

A HITL wait is not a process failure.

While waiting for owner disposition:

- do not create additional HITL questions merely to stay busy;
- do not repeat waiting comments;
- do not pause the recurring Wayfinder automation solely because an owner decision is pending;
- use available capacity for eligible AFK research, stale-state reconciliation, blocker removal, or a silent verified no-op.

The next run must reread the active owner ticket and immediately recognize a new owner response.

## Scope and invalidation

When a decision proves beyond the map destination:

- close it as not planned when appropriate;
- record it under out-of-scope or future direction, not `Decisions so far`.

When a resolution invalidates another open ticket, update or close the obsolete ticket rather than preserving contradictory work for historical decoration.

## Documentation reconciliation

Wayfinder may reveal that older accepted documentation no longer matches the resolved destination.

Before declaring the route clear:

1. identify every binding or high-authority document made stale by the resolved ticket set;
2. update those documents through normal repository governance;
3. preserve long-term policy distinctions when a change is alpha-specific;
4. ensure `AGENTS.md` gives fresh coding agents the same authority ordering as this guide;
5. ensure proposed/accepted ADR, RFC, and PRD status accurately reflects the final route.

Documentation is part of correctness, not post-handoff cleanup.

## Convergence audit

After the final in-scope decision is resolved, run a convergence audit before writing implementation tickets.

The audit passes only when all are true:

- no unresolved in-scope Wayfinder decision remains;
- no in-scope fog remains;
- no accepted or binding document contradicts the resolved destination;
- every ADR, RFC, or PRD needed by the alpha has an unambiguous lifecycle state;
- no open ticket is obsolete, superseded, or incorrectly blocking the route;
- no required factual research remains unresolved;
- a coding agent can implement without choosing product behavior, architecture, persistence semantics, provider/cost behavior, authority boundaries, or validation policy;
- out-of-scope work is explicitly excluded rather than merely forgotten.

If any condition fails, the map is not clear.

## Handoff to implementation

Only after the convergence audit passes:

1. synthesize one build-ready first-alpha specification using the established to-spec shape:
   - problem;
   - solution;
   - user stories;
   - implementation decisions;
   - testing/validation decisions;
   - explicit non-goals and deferred work;
2. convert the specification into tracer-bullet implementation tickets using the established to-tickets shape;
3. make each ticket a narrow end-to-end behavior that is independently demoable or verifiable, sized for one fresh coding-agent context, and explicit about real blockers;
4. begin implementation only from the unblocked build frontier.

## Validation and CI

Keep GitHub Actions deliberately small unless a stronger gate is justified by risk.

Implementation agents must provide truthful reproducible evidence for relevant local build, format, lint/type, unit, integration, restart/recovery, packaging, and manual UX checks. Missing tooling or unavailable dependencies are not passing evidence.

Only merged default-branch implementation counts as landed product progress.

## Scheduler contract

A scheduled Wayfinder task should be intentionally thin.

It should:

- point to this guide and the canonical map;
- require medium-depth-or-higher reasoning appropriate to product/architecture work;
- recompute live state every run;
- perform the blocker sweep;
- obey claim and HITL/AFK discipline;
- remain enabled during HITL waits;
- never contain mutable frontier state, current ticket IDs other than the permanent map pointer, or hardcoded claims about what decision comes next.

Repository state owns project truth. The scheduler owns cadence only.
