# PRD-0001: Multi-Agent Personal Workbench

**Status:** Proposed  
**Owner:** Repository owner  
**Related:** PRD-0002, PRD-0003, RFC-0002, ADR-0001, ADR-0004

## Summary

B.O.B. shall provide one personal workspace through which a user can interact with multiple supported AI agent surfaces while retaining canonical tasks, plans, preferences, and continuity inside B.O.B.

## Problem

Vendor applications provide strong model-specific experiences but fragment work across separate interfaces and session histories. The user must repeatedly decide which application to open, rebuild context, and reconcile outputs with an independent planning system.

The product opportunity is not another chatbot. It is a stable personal control plane above multiple agent providers.

## Goals

B.O.B. shall:

- provide one consistent desktop workspace;
- maintain canonical personal work state independently of agent providers;
- allow explicit switching between supported agent bridges;
- package relevant B.O.B. context for an invoked agent;
- return agent output to the same workspace;
- allow structured proposed actions to be reviewed and applied;
- support both assistive reasoning and explicit bounded delegation;
- remain useful when no agent is available.

## User stories

As a user, I want to ask Claude to help organize a messy thought, then use Codex for a coding task without rebuilding my task context.

As a user, I want B.O.B. to remember what I am trying to accomplish even when I switch agents.

As a user, I want an agent to propose changes to my plan without silently rewriting it.

As a user, I want normal chat to remain safe and bounded while still being able to explicitly delegate real work when I choose.

## Functional requirements

### Workspace continuity

B.O.B. must own tasks, inbox items, day plans, preferences, agent selection settings, and compact working continuity.

### Agent selection

The user must be able to select among available supported bridges. Automatic routing is not required for the initial release.

### Context broker

B.O.B. must construct a bounded context package relevant to the current request. It should not indiscriminately expose all stored user data to every agent.

### Structured proposals

Agent responses may include proposed B.O.B. actions. Proposed actions must be validated by the application core and surfaced distinctly from already-applied state.

### Assist mode

Assist is the default. It may reason and propose but does not implicitly gain filesystem, shell, or external workspace authority.

### Delegate mode

Delegation must be explicit, task-scoped, and bounded by declared capabilities and workspace access.

### Availability

Bridge failure must not prevent access to existing B.O.B. state or deterministic planning functionality.

## Acceptance criteria

The requirement is satisfied when:

1. a user can create and plan work without AI;
2. at least two supported agent bridges can operate against the same canonical B.O.B. state;
3. switching bridges does not duplicate or discard tasks/plans;
4. agent proposals can be previewed before state mutation when confirmation is required;
5. ordinary Assist mode cannot silently become Delegate mode;
6. bridge failure leaves canonical data intact;
7. the user can identify which bridge handled a response.

## Non-goals

- cloning vendor chat applications;
- importing every vendor conversation transcript;
- model benchmarking as a user-facing product;
- opaque automatic routing in the first multi-agent release;
- generalized multi-user agent orchestration;
- plugin marketplace infrastructure.

## Success measure

B.O.B. demonstrates its unique value when one personal workflow can move between multiple agent providers without moving the user's canonical work state out of B.O.B.
