# ADR-0004: Local B.O.B. State Is Canonical

**Status:** Accepted  
**Date:** 2026-08-19  
**Accepted:** 2026-08-20  
**Wayfinder:** #33

## Context

B.O.B. cannot provide durable continuity if an inference-provider session owns the user's tasks, plans, preferences, or working state. The first alpha also needs explicit transactional, migration, backup, recovery, and export behavior without inventing a second memory architecture.

## Decision

B.O.B. alpha uses a single local SQLite database owned exclusively by the Rust application core as canonical ordinary application state.

- Logical state changes are transactional.
- Rust owns immutable monotonic schema migrations and startup compatibility checks.
- Schema-changing migrations use SQLite-consistent pre-migration safety copies and fail closed on migration/open failure.
- B.O.B. retains two bounded pre-migration known-good safety copies.
- Ordinary crash consistency relies on SQLite rather than a custom shadow-file protocol.
- User backup/restore uses a SQLite-consistent snapshot.
- Portable export is a documented, versioned JSON representation of user-owned non-secret product state, not a dump of internal tables.
- Credentials remain in the OS secret store. SQLite may hold only non-secret credential references/status.
- Corruption or migration failure never silently replaces user data with an empty store.

This decision establishes the alpha persistence baseline. It does not freeze richer future memory architecture into the SQLite schema. Advanced governed-memory behavior should preferentially reuse the existing `MythologIQ-Labs-LLC/agent-memory` project through a later explicit integration contract rather than B.O.B. independently inventing a competing memory system.

## Consequences

Positive:

- provider-independent canonical work state;
- transactional integrity for linked task/plan/continuity changes;
- explicit migration and recovery ownership;
- deterministic operation without inference;
- portable user-owned export without exposing credentials;
- a clear boundary between ordinary alpha state and later governed-memory integration.

Costs:

- B.O.B. owns SQLite schema evolution, backup, migration, integrity, and recovery behavior;
- implementation and tests must distinguish crash recovery from application/schema safety-copy recovery;
- future Agent Memory integration requires a deliberate contract rather than silent schema growth.

## Rejected alternatives

- Versioned JSON/YAML as canonical state: insufficient benefit for relational task/plan/continuity data and would require B.O.B. to recreate transaction, indexing, and migration behavior in filesystem code.
- Provider-owned canonical state: would bind continuity to one inference provider and weaken deterministic/offline behavior.
- A new B.O.B.-specific advanced memory architecture in the alpha: unnecessary scope and duplicates an existing governed-memory project.
