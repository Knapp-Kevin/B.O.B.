# Product Definition

**Status:** Accepted  
**Product:** B.O.B. | Better Organized Brain

## Product statement

B.O.B. is a local-first personal AI workbench with **one user-facing agent identity: B.O.B.** Behind that single point of contact, B.O.B. can use multiple LLMs, inference runtimes, and tools while keeping the user's tasks, plans, preferences, and continuity independent of any one vendor or model.

B.O.B. adds value in two places that vendor applications do not share:

1. a unified B.O.B. agent that can draw on different intelligence and execution backends without fragmenting the user experience;
2. an ADHD-friendly executive-function interface designed around low-friction capture, realistic planning, reduced cognitive load, and one useful next action.

The governing principle is:

> **B.O.B. is the agent. Models, runtimes, and tools are capabilities.**

## Problem

AI vendors provide increasingly capable chat, coding, and agentic applications, but each vendor owns a separate session model, interface, cost structure, and execution surface. Requiring the user to manage those same distinctions inside B.O.B. would simply reproduce the complexity the product exists to remove.

Generic productivity software stores tasks but lacks an intelligent interaction layer. Generic AI chat reasons well but does not provide durable personal planning and executive-function structure.

B.O.B. occupies the layer between them while presenting only one coherent assistant to the user.

## Product invariant

The user talks to **B.O.B.**

B.O.B. may use Claude-backed inference, Codex-backed inference, local models, future LLMs, or approved tools. Those systems are internal capabilities, not peer user-facing agents.

Provider/runtime identity may be visible when it matters for cost, privacy, capability, troubleshooting, or explicit user choice, but it must not become the primary interaction model.

## Target user experience

A user opens one application and sees what matters today, not an empty prompt and not a roster of AI providers.

They can capture a thought without deciding its final category, ask B.O.B. to organize it, plan a realistic day, replan after disruption, or ask B.O.B. to perform bounded external work. B.O.B. can change the underlying model/runtime without moving canonical tasks or forcing the user into a different conversational identity.

The user should be able to ask:

- What should I do next?
- Plan my day.
- I have 25 minutes. What can I finish?
- Break this task down.
- I am overwhelmed. Show me one thing.
- Turn this brain dump into tasks.
- Move unfinished work to tomorrow.
- Use Codex for this coding work.
- Use Claude for this writing task.
- Keep this local.

The last three are optional backend preferences, not separate agents the user must manage.

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

### B.O.B. Chat

Chat is the conversational surface for the B.O.B. agent. It is not a vendor-session selector and is not the canonical store itself.

B.O.B. Chat can:

- explain the current plan;
- organize captured material;
- propose priorities;
- break work into smaller steps;
- answer questions using bounded B.O.B. context;
- propose state changes;
- honor explicit inference preferences when relevant;
- perform bounded external work when the user intentionally delegates authority to B.O.B.

### Settings

Settings owns:

- inference/runtime availability and defaults;
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

## AI and inference role

Inference is a capability of B.O.B., not the application backbone and not the user-facing identity.

Without an available LLM/runtime, B.O.B. must still support capture, task state, manual planning, scheduling, completion, deferral, and local persistence.

Model output may inform or propose application changes, but application state changes are executed by B.O.B. after validation and according to the user's authority settings.

## Authority modes

### Assist

B.O.B. reasons, summarizes, organizes, transforms, and proposes using an allowed inference runtime. Assist does not implicitly grant filesystem, shell, repository, or external-workspace authority.

### Delegate

The user explicitly grants **B.O.B.** bounded authority for a defined task. B.O.B. may then use an execution-capable runtime or approved tool inside that grant. The user is not delegating to a separate peer agent.

## Cost model

The default policy is:

1. subscription-backed inference/runtime integrations;
2. local inference;
3. metered API inference only when explicitly enabled.

B.O.B. must not silently fail over to a metered provider.

## Canonical state

B.O.B. owns:

- tasks and inbox items;
- day plans and schedule blocks;
- user preferences;
- runtime and cost-policy configuration;
- compact working continuity;
- B.O.B. conversation continuity;
- action and delegation history required for understandable behavior.

Vendor/runtime session state may be referenced as an implementation detail but is not the canonical product state.

## Explicit non-goals

The revival does not initially include:

- a visible multi-agent swarm, agent roster, or peer-agent orchestration model;
- cognitive trait profiling;
- diagnosis, treatment, or mental-health assessment;
- ambient autonomous execution making open-ended changes;
- vector databases or general RAG knowledge centers;
- document-management platforms;
- cloud sync or multi-user collaboration;
- opaque automatic model scoring as a required first-release feature;
- general plugin marketplaces;
- vendor-specific clones of ChatGPT, Claude, or Codex;
- silent metered API fallback;
- gamified productivity scoring or shame-oriented analytics.

## Product success criteria

The first revived release is successful when a user can reliably capture work, plan a day, recover from interruption, converse with B.O.B. through at least one subscription-backed inference runtime, use a second runtime without losing B.O.B.'s identity or canonical state, and understand what B.O.B. will do before it changes important state or incurs metered cost.
