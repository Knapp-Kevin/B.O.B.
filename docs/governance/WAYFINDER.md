# Wayfinder Operating Guide

## Purpose

Wayfinder is B.O.B.'s governed design-resolution process for turning product intent into executable decisions without forcing implementation agents to invent consequential product or architecture behavior.

The current canonical map for the first runnable alpha is the GitHub issue titled `Wayfinder map: first runnable B.O.B. alpha`.

The first runnable alpha is a waypoint, not a terminal execution boundary. Wayfinder protects unresolved decision boundaries while already-settled, disjoint implementation may continue toward a runnable, coherent, validated product.

## Core principles

1. **The map is an index, not the decision store.** Decisions live in their owning tickets; the map carries concise state and pointers.
2. **Resolve only consequential uncertainty.** Routine implementation details that are safely derivable from accepted product, architecture, governance, ADR/RFC, UX, security, and prior owner decisions do not require a new HITL ticket.
3. **Research facts; ask humans for judgment.** Agents research technical/provider facts independently. Escalate only genuinely consequential unresolved owner choices.
4. **One user-facing B.O.B. agent.** Models, runtimes, provider CLIs, and tools remain capabilities behind B.O.B.
5. **Smallest sufficient product.** Prefer narrow tracer bullets and explicit seams over speculative frameworks.
6. **No implementation through unresolved authority.** Work that depends on an unresolved consequential decision remains blocked. Safe disjoint work authorized by settled repository authority may proceed.
7. **Continuous governed progression.** Do not stop the development loop merely because another planning or `wayfinder:grilling` ticket exists. Keep advancing executable, non-conflicting scope.

## Artifact roles

### Map

The map owns the destination, settled-decision pointers, current consequential decision frontier, in-scope fog, explicit out-of-scope boundaries, and handoff context. It must not duplicate full ticket resolutions.

### Decision ticket

A decision ticket owns one precise consequential question. Tickets are:

- **HITL grilling:** requires owner judgment;
- **HITL prototype:** requires owner review of a bounded decision aid;
- **AFK research:** factual question that can be resolved autonomously.

Do not create a decision ticket for ordinary engineering choices that are already constrained by accepted authority.

### Fog

Fog is an unresolved area whose exact consequential question is not yet known. Do not manufacture tickets from vague possibility.

## Live-state recomputation

Every governed run begins from live repository state. Read the current default branch, this guide, the canonical map, relevant open/recent Wayfinder tickets and comments, active implementation claims, PR state, and governing record lifecycle state.

Never trust a hardcoded scheduler frontier or stale handoff over current GitHub evidence.

## Authority precedence

1. Explicit owner directions and dispositions recorded in the repository govern the affected destination.
2. Accepted ADRs, RFCs, PRDs, governance, product, architecture, and design documents remain binding except where a newer explicit owner decision supersedes a destination-specific assumption.
3. Contradictions created by newer owner direction are stale-document debt and should be reconciled promptly through normal review.
4. Stale text does not freeze unrelated implementation that is already authorized by settled authority.
5. A Wayfinder ticket does not silently rewrite unrelated long-term policy.

## Decision frontier

The decision frontier is the set of consequential open questions that are in scope, precise enough to resolve, not blocked by prerequisites, and not invalidated by newer authority.

The **build frontier** is separate: it consists of bounded implementation/review/validation work whose required decisions are already settled and whose ownership does not conflict with active work.

A governed cycle may advance the build frontier while a decision ticket remains open, provided the work does not depend on that unresolved decision.

## Claim and concurrency discipline

Before taking an implementation slice, inspect current issue/map comments and open PRs for active ownership.

- Do not duplicate an actively claimed implementation slice.
- Prefer disjoint implementation, adversarial review, validation, stale-document reconciliation, security/privacy hardening, or blocker removal.
- Claim at most one new HITL decision per cycle when a genuinely consequential owner choice is unavoidable.
- AFK research may proceed when it directly supports an active decision or removes a concrete blocker.

## Grilling protocol

For a genuinely consequential owner decision, ask the entire currently answerable frontier for that question in one round. State each decision plainly, recommend an answer, explain consequences, separate verified facts from judgment, and end with a concise proposed resolution that can be accepted or amended by numbered item.

Do not infer the owner's side of an unresolved consequential decision. Conversely, do not turn routine engineering details into owner homework.

## Prototype protocol

A prototype is a bounded decision aid. Owner approval resolves the UX/product question demonstrated by the artifact, not unrelated architecture.

## Research protocol

AFK research may be resolved autonomously using authoritative evidence. Record the question, evidence, finding, consequence, and any newly precise consequential decision.

## Blocker sweep

Every run checks for blockers and next safe work. Look for:

- stale scheduler/map/document handoffs;
- contradictory binding documentation;
- active overlapping implementation claims;
- unresolved factual prerequisites;
- obsolete or superseded tickets;
- invalid blocker assumptions;
- already-resolved owner questions that remain open elsewhere;
- tool, credential, platform, repository-access, test, packaging, or deployment limitations;
- hidden choices that would force a coding agent to invent consequential behavior.

Resolve researchable/process blockers autonomously when safe. A normal open planning ticket is not a portfolio-wide blocker unless the selected work actually depends on it.

## Waiting behavior

A HITL wait blocks only work that depends on that owner decision.

While waiting:

- do not repeat waiting comments;
- do not pause the recurring development automation solely because owner input is pending;
- continue safe disjoint implementation, review, tests, validation, documentation reconciliation, security/privacy hardening, packaging/readiness work, or blocker removal;
- surface any unavoidable consequential owner gate explicitly rather than silently returning repeated no-change cycles.

## Documentation reconciliation

When a newer owner direction or resolved decision makes binding documentation stale, reconcile it through normal repository governance. Preserve long-term policy distinctions when a change is waypoint-specific.

Documentation debt should be fixed promptly, but it does not prohibit unrelated already-authorized implementation.

## Convergence audit

A convergence audit is still required before claiming the Wayfinder map itself is complete or presenting its final build-ready specification as fully reconciled authority.

The audit passes when no unresolved in-scope consequential decision/fog remains, binding documents agree with the destination, record lifecycle states are unambiguous, obsolete blockers are removed, required factual research is complete, and the remaining implementation can proceed without inventing consequential product/architecture/persistence/provider/authority/validation policy.

Failure of map convergence does **not** invalidate already-settled disjoint tracer bullets.

## Handoff and continuous build

As decisions settle, convert them into narrow end-to-end tracer bullets when useful. Each implementation slice should be independently demoable or verifiable, sized for one fresh coding-agent context, explicit about real blockers, and tied to accepted authority.

After full map convergence, synthesize the complete waypoint specification and reconcile its implementation ticket set. Continue building beyond that waypoint according to the next repository-authorized frontier rather than treating alpha completion as a stop condition.

## Validation and CI

Keep GitHub Actions deliberately small unless a stronger gate is justified by risk. Minimal CI does not mean minimal verification.

Implementation agents must provide truthful evidence for the strongest relevant checks available: build, format/lint/type checks, unit/integration tests, restart/recovery, packaging, and rendered/manual UX checks. Missing tooling or unavailable dependencies are not passing evidence.

Only merged default-branch implementation counts as landed product progress.

## Scheduler contract

A scheduled governed development task should be thin and repository-led. It should recompute live state, perform a blocker/next-work sweep, respect active ownership, preserve consequential authority gates, and seek one bounded substantive advancement per run.

Do not encode mutable frontier state in the scheduler prompt as repository truth. Repository state owns project truth; scheduling owns cadence.