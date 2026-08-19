# Product Definition

**Status:** Proposed revival baseline  
**Product:** B.O.B. | Better Organized Brain

## Product statement

B.O.B. is a vendor-neutral personal AI workbench that brings multiple supported AI agent surfaces into one consistent workspace while keeping the user's tasks, plans, preferences, and continuity independent of any single model vendor.

B.O.B. adds value in two places that vendor applications do not share:

1. a common personal control plane across agent providers;
2. an ADHD-friendly executive-function interface designed around low-friction capture, realistic planning, reduced cognitive load, and one useful next action.

The governing principle is:

> **B.O.B. owns the work. Agents provide the intelligence.**

## Problem

AI vendors provide increasingly capable chat and agent applications, but each vendor owns a separate session model, interface, cost structure, and work surface. A user who prefers different agents for different tasks must repeatedly switch applications, rebuild context, reconcile outputs, and independently maintain tasks or plans.

Generic productivity software solves task storage but does not provide a common AI interaction layer. Generic AI chat solves reasoning but does not provide durable personal planning and executive-function structure.

B.O.B. occupies the layer between them.

## Target user experience

A user opens one application and sees what matters today, not an empty prompt.

They can capture a thought without deciding its final category, ask B.O.B. to organize it, plan a realistic day, replan after disruption, or delegate a bounded task to a preferred agent. They can switch from Claude Code to Codex or local inference without moving their canonical tasks and planning state.

The user should be able to ask:

- What should I do next?
- Plan my day.
- I have 25 minutes. What can I finish?
- Break this task down.
- I am overwhelmed. Show me one thing.
- Turn this brain dump into tasks.
- Move unfinished work to tomorrow.
- Give this coding task to Codex.
- Use Claude for this writing task.

## Product surfaces

### Today

Today is the default surface. It contains:

- up to three focus items;
- a simple time-oriented plan;
- the next recommended action;
- fixed commitments and flexible work blocks;
- quick capture;
- start, complete, defer, and replan actions;
- a low-stimulation overwhelmed state that hides nonessential backlog information.

### Inbox

Inbox is the single capture queue for unprocessed material. Items may be tasks, ideas, notes, reminders, or undetermined brain dumps. Categorization can happen later.

Inbox supports:

- instant text capture;
- optional natural-language interpretation;
- convert to task, idea, note, or reminder;
- plan, defer, archive, or delete;
- batch organization with a preview before changes are applied.

### B.O.B. Chat

Chat is a conversational control surface over B.O.B. state and agent bridges. It is not the canonical store itself.

Chat can:

- explain the current plan;
- organize captured material;
- propose priorities;
- break work into smaller steps;
- answer questions using bounded B.O.B. context;
- propose state changes;
- delegate bounded external work when the user explicitly requests it.

### Settings

Settings owns:

- agent bridge availability and defaults;
- subscription and cost policy;
- local inference configuration;
- accessibility and visual preferences;
- local data location, export, backup, and reset;
- optional advanced controls.

## ADHD-friendly interaction requirements

ADHD-friendly means the product reduces executive-function friction through concrete interaction patterns. It does not infer or score neurological traits.

Required patterns include:

- one obvious next action;
- low-friction capture before categorization;
- progressive disclosure instead of showing the entire system at once;
- explicit time estimates where useful;
- support for re-entry after interruption;
- easy deferral without losing the item;
- realistic daily capacity rather than unlimited scheduling;
- direct language and short decision sets;
- visible distinction between suggestion and committed state;
- accessible typography, contrast, reduced motion, and keyboard operation.

## AI role

AI is a reasoning and transformation capability, not the application backbone.

Without an available agent, B.O.B. must still support capture, task state, manual planning, scheduling, completion, deferral, and local persistence.

Agent output may inform or propose application changes, but application state changes are executed by B.O.B. after validation and according to the user's authority settings.

## Agent modes

### Assist

The agent reasons, summarizes, organizes, and proposes. B.O.B. owns all state mutations and external authority.

### Delegate

The user explicitly grants an agent a bounded workspace and capability set for a defined task. Delegate mode is not implied by ordinary chat.

## Cost model

The default policy is:

1. subscription-backed agent integrations;
2. local inference;
3. metered API inference only when explicitly enabled.

B.O.B. must not silently fail over to a metered provider.

## Canonical state

B.O.B. owns:

- tasks and inbox items;
- day plans and schedule blocks;
- user preferences;
- provider and cost-policy configuration;
- compact working continuity needed to move between agents;
- action and delegation history required for understandable behavior.

Vendor conversation history may be referenced as an integration detail but is not the canonical state of the product.

## Explicit non-goals

The revival does not initially include:

- cognitive trait profiling;
- diagnosis, treatment, or mental-health assessment;
- autonomous background agents making open-ended changes;
- vector databases or general RAG knowledge centers;
- document-management platforms;
- cloud sync or multi-user collaboration;
- automatic provider routing based on opaque model scoring;
- general plugin marketplaces;
- vendor-specific clones of ChatGPT, Claude, or Cowork;
- silent metered API fallback;
- gamified productivity scoring or shame-oriented analytics.

## Product success criteria

The first revived release is successful when a user can reliably capture work, plan a day, recover from interruption, converse with at least one subscription-backed agent through B.O.B., switch agent bridges without losing canonical state, and understand what B.O.B. will do before it changes important state or incurs metered cost.
