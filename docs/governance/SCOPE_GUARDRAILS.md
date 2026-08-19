# Scope Guardrails

## Core scope

B.O.B. exists to combine personal executive-function support with a vendor-neutral multi-agent workbench.

A feature belongs naturally when it directly improves one or more of:

- capture;
- task organization;
- daily planning and replanning;
- next-action clarity;
- continuity across supported agents;
- safe bounded delegation;
- accessibility and information-density control;
- predictable AI cost;
- local ownership, export, and recovery of personal state.

## Scope test

A proposed feature should answer all four questions:

1. What friction in the core B.O.B. workflow does this remove?
2. Why should B.O.B. own it rather than delegate it to an existing agent/vendor application?
3. What is the smallest implementation that provides the value?
4. What can be removed or deliberately omitted to keep the resulting product simple?

## Presumptively out of scope

The following require an explicit PRD with unusually strong justification:

- full document-management or knowledge-base systems;
- generalized RAG infrastructure;
- custom model training;
- model benchmark dashboards;
- provider marketplaces;
- multi-user enterprise collaboration;
- social features;
- autonomous background goal pursuit;
- generalized workflow automation platform behavior;
- cognitive profiling or inferred mental-health state;
- productivity scoring/gamification;
- unrelated developer tooling already supplied by Claude Code, Codex, or similar agents;
- a second implementation stack kept alive solely for historical compatibility.

## Top-level navigation budget

Today, Inbox, Chat, and Settings are the default top-level surfaces.

A new top-level navigation destination requires an accepted PRD explaining why the capability cannot fit coherently inside an existing surface. This rule exists because navigation itself consumes attention.

## Infrastructure budget

New background services, daemons, databases, language runtimes, model managers, or network servers require an RFC that compares them against a simpler alternative.

## Local inference boundary

Local inference is a bridge capability, not B.O.B.'s identity. B.O.B. must not become primarily a model-downloading, quantization, GPU-management, or inference-server product.

## Agent boundary

B.O.B. may invoke supported agent surfaces. It should not reproduce every feature of those vendor applications. If a capability is already excellent inside the agent, B.O.B. should prefer delegation and continuity integration over cloning it.
