# PRD-0001: Single-Agent, Multi-LLM Personal Workbench

**Status:** Accepted  
**Owner:** Repository owner  
**Related:** PRD-0002, PRD-0003, RFC-0002, ADR-0001, ADR-0004

## Summary

B.O.B. shall present **one agent, one identity, one point of contact, and one durable personal workspace** while using multiple supported LLMs, inference runtimes, and tools behind that single surface.

The user interacts with B.O.B. They do not manage a visible collection of peer agents.

## Product invariant

> **B.O.B. is the agent. Models, inference runtimes, and tools are capabilities behind him.**

B.O.B. owns the conversation identity, tasks, plans, preferences, continuity, application state, routing intent, and user-facing explanation of what happened.

An underlying Claude, Codex, local-model, or future runtime may itself expose agentic capabilities internally. That does not make it a peer user-facing agent in B.O.B.'s product model.

## Problem

Vendor AI applications are increasingly capable but fragment work across separate interfaces, sessions, models, billing systems, and tool conventions. Requiring a user to think in those same infrastructure terms recreates the cognitive burden B.O.B. exists to reduce.

The opportunity is therefore not "many agents in one window." It is **one coherent assistant that can use different intelligence and execution backends without making the user carry that complexity.**

## Goals

B.O.B. shall:

- provide one consistent agent identity and desktop workspace;
- maintain canonical personal work state independently of inference providers;
- support multiple LLMs and inference runtimes through internal adapters;
- preserve the same B.O.B. context and task state when the underlying runtime changes;
- make runtime/provider selection available when the user cares, but not require it for ordinary use;
- package only relevant B.O.B. context for each inference request;
- validate structured proposed actions before they affect canonical state;
- support both safe assistance and explicitly bounded external execution;
- remain useful when no inference runtime is available.

## User stories

As a user, I want to talk to B.O.B. rather than decide which AI application I should open first.

As a user, I want B.O.B. to use Claude, Codex, or local inference when appropriate without making me rebuild context or move my tasks.

As a user, I want to choose a model/runtime explicitly when I care about cost, privacy, or capability.

As a user, I want B.O.B. to keep ordinary planning simple even when the back end is technically complex.

As a user, I want B.O.B. to propose changes to my plan without silently rewriting it.

## Functional requirements

### Single agent identity

All ordinary user-facing conversation is with B.O.B. Provider names may be shown as execution metadata, settings, or advanced controls, but must not replace B.O.B. as the conversational identity.

### Canonical continuity

B.O.B. owns tasks, inbox items, day plans, preferences, compact working context, and user-facing conversation continuity. Switching inference backends must not create a separate product state.

### Inference selection

B.O.B. may use a user-selected or policy-selected inference backend. Initial releases do not require opaque automatic model ranking. A simple default plus explicit selection is sufficient.

### Context broker

B.O.B. constructs a bounded context package relevant to the current request. It must not indiscriminately expose all stored user data to every provider/runtime.

### Structured proposals

Inference results may contain proposed B.O.B. actions. Proposed actions are validated by the application core and surfaced distinctly from already-applied state.

### Assist authority

Assist is the default. B.O.B. may reason, organize, transform, and propose using an inference backend without implicitly granting shell, filesystem, repository, or external-workspace authority.

### Delegate authority

When the user explicitly asks B.O.B. to perform bounded external work, B.O.B. may invoke an execution-capable backend or tool with a declared workspace and capability grant. The user still delegates to **B.O.B.**, not to a separate peer agent.

### Availability

Inference failure must not prevent access to existing B.O.B. state or deterministic planning functionality.

## Acceptance criteria

The requirement is satisfied when:

1. the UI presents B.O.B. as the single conversational agent;
2. a user can create and plan work without AI;
3. at least two inference backends can operate against the same canonical B.O.B. state;
4. switching backends does not duplicate or discard tasks, plans, or conversation identity;
5. provider/runtime identity is inspectable without becoming the primary interaction model;
6. proposed state changes can be previewed and validated;
7. ordinary Assist behavior cannot silently gain external execution authority;
8. backend failure leaves canonical data intact.

## Non-goals

- presenting a multi-agent swarm or agent roster to the user;
- cloning vendor chat applications;
- importing every vendor transcript;
- model benchmarking as a primary user-facing product;
- generalized multi-agent orchestration;
- plugin marketplace infrastructure;
- requiring users to understand routing internals for normal daily use.

## Success measure

B.O.B. proves its value when a user can stay in one calm, coherent personal workflow while B.O.B. changes the underlying intelligence or execution mechanism without changing who the user is talking to or where the work lives.
