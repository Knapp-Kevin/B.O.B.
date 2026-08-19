# Pre-Alpha UI Test Launch Brief

**Status:** Wayfinder prototype reference  
**Purpose:** define the interaction surface used to validate B.O.B.'s first-alpha UX before production implementation hardens unresolved architecture

## Governance

This document is a prototype brief, not independent implementation authority.

The canonical planning surface is the Wayfinder map in issue #30. Decisions live in their owning Wayfinder tickets. When this brief conflicts with a resolved Wayfinder decision, accepted PRD/RFC/ADR, or current implementation truth, the governing source wins.

The application currently on `master` is the concrete prototype artifact for Wayfinder ticket #36, **Validate the first-alpha interaction shell**. It may be iterated to answer that ticket's UX questions. Production alpha implementation, implementation-ticket slicing, persistence hardening, live Gemini wiring, credential storage, runtime contracts, and packaging remain gated by their Wayfinder decisions.

## Goal

Provide a coherent runnable B.O.B. desktop prototype that lets the owner evaluate the product as a whole rather than reviewing disconnected components.

The prototype should make it possible to judge whether:

- Today is the obvious starting point;
- one next action dominates secondary choices;
- quick capture is cheaper than organization;
- Inbox is recoverable rather than punitive;
- B.O.B. Chat feels like one assistant, not a provider switchboard;
- reduced-information behavior removes cognitive load;
- Gemini onboarding can plausibly be completed in 2–3 conceptual steps;
- provider/runtime details remain secondary to B.O.B.;
- the accepted first-alpha productivity behaviors feel natural rather than like a visible skill catalog.

## Governing product principles

- **B.O.B. is the agent. Models, runtimes, and tools are capabilities.**
- **Only the things that matter should compete for attention.**
- Capture before organization.
- One obvious next action.
- Progressive disclosure over dashboard sprawl.
- Cheap interruption recovery and replanning.
- Accessibility and low cognitive load are product requirements.
- Deterministic planning remains useful when inference is unavailable.
- No silent transition into paid inference.

## Reference order

Prototype work should consult, in order:

1. `README.md`
2. `AGENTS.md`
3. the active Wayfinder map and resolved decision tickets
4. `docs/PRODUCT.md`
5. `docs/ARCHITECTURE.md`
6. `docs/DESIGN.md`
7. governing PRDs/RFCs/ADRs
8. `docs/inspiration/README.md`
9. the PNG artifacts in `docs/inspiration/`

The images guide hierarchy and visual tone. They are not pixel-perfect specifications.

## Accepted first-alpha boundary relevant to the prototype

Owner-approved alpha behaviors include:

- B.O.B.-owned conversational continuity;
- bounded context over current work;
- breakdown and organization help;
- plain-language reorientation;
- preview-before-apply for proposed state changes;
- resume/handoff as an ordinary B.O.B. behavior;
- lightweight decision facilitation as an ordinary B.O.B. behavior.

Deferred beyond first alpha:

- Delegate/tool execution;
- a second inference backend;
- local inference;
- cloud sync and multi-user behavior;
- generalized RAG;
- a plugin or skill marketplace;
- dedicated questionnaire lifecycle;
- teaching/coaching workspace;
- advanced analytics;
- broad cross-platform packaging;
- silent metered fallback.

Natural question drafting remains allowed without becoming a dedicated questionnaire product surface.

## Surface 1: Application shell

The prototype should provide:

- persistent navigation for Today, Inbox, B.O.B. Chat, and Settings;
- coherent B.O.B. branding using repository assets;
- responsive desktop layout with a sensible minimum window size;
- visible keyboard focus;
- reduced-motion compatibility;
- provider status only as a secondary indicator;
- no direct frontend filesystem, shell, or secret authority.

## Surface 2: Today

Today should communicate B.O.B.'s purpose within seconds.

Interaction hierarchy:

1. one dominant next action;
2. up to three focus items;
3. quick capture;
4. a realistic day shape or timeline;
5. resume/re-entry context;
6. secondary replanning controls.

Reduced-information / overwhelmed mode should hide nonessential information and narrow the surface toward one manageable action. It should not create another workflow the user must manage.

## Surface 3: Inbox

Inbox is the low-friction capture queue.

Prototype expectations:

- capture from Today and Inbox;
- mixed item types such as task, idea, note, and reminder;
- no forced classification before capture;
- lightweight filters only where they reduce noise;
- clear affordances for choosing the next useful action;
- no guilt mechanics, punitive overdue language, or productivity scoring.

## Surface 4: B.O.B. Chat

Chat should feel like one B.O.B. identity with the current work close at hand.

Prototype these accepted behaviors through ordinary conversation:

- breakdown and organization help;
- plain-language reorientation when the user says the equivalent of "wait, what?";
- lightweight decision facilitation that exposes only the current decision frontier;
- compact resume/handoff behavior;
- state-change proposals shown for review before application.

Do not expose a named skill catalog or peer-agent roster.

Fixture-backed responses are acceptable while live inference remains gated. Fixture behavior must be clearly isolated and must not become accidental production architecture.

## Surface 5: Gemini onboarding

Gemini Developer API Free is the settled first-alpha inference path.

Prototype the ordinary happy path as 2–3 conceptual steps:

1. briefly explain the Gemini Free path and relevant privacy/data-use consideration, then provide one direct **Get Gemini key** action;
2. open the user directly to the Google AI Studio API-key surface, where Google handles sign-in/key creation;
3. return to B.O.B., provide the key once, receive validation/connected-state feedback, and enter the product.

The ordinary path should not require Google OAuth, manual Google Cloud Console navigation, billing setup, or a credit card.

The prototype should visibly account for:

- missing key;
- invalid or revoked key;
- masked credential presentation;
- replacement/removal;
- free-quota exhaustion;
- provider outage/degraded inference;
- local planning remaining usable when inference is unavailable.

### Credential boundary

Do not fake production security.

Until the credential-policy decision authorizes implementation:

- do not persist a real key in frontend state;
- do not put keys in source, fixtures, logs, screenshots, or ordinary application state;
- do not claim native validation or protected storage exists when it does not;
- keep the UI seam ready for the accepted native credential mechanism once the Wayfinder route reaches it.

## Surface 6: Settings

Settings should expose only configuration that has a real job in the current prototype:

- Gemini connection/setup state;
- free-tier/provider context;
- accessibility controls used by the UI;
- clear indication of fixture/prototype boundaries where necessary.

Do not create empty categories for hypothetical providers or future features.

## Visual direction

The inspiration set points toward:

- a calm, light primary workspace;
- dark-blue navigation;
- restrained blue/teal accents;
- strong action hierarchy;
- breathing room rather than dense dashboard packing;
- friendly mascot presence without turning the interface into a cartoon;
- modest depth and rounded surfaces without decorative excess;
- color as support, never the only signal.

The implementation should improve on generated-image artifacts where readability, accessibility, spacing, or realistic interaction require it.

## Prototype review checklist

A reviewer should be able to:

- launch the current prototype surface;
- understand immediately that Today is home;
- navigate Today, Inbox, Chat, and Settings;
- identify one obvious next action;
- capture an item without categorizing it first;
- enter and leave reduced-information mode;
- inspect a plausible day shape;
- use Chat to see breakdown, reorientation, decision support, and resume/handoff patterns;
- walk through Gemini setup in 2–3 conceptual steps without account-console scavenger hunting;
- see provider state without the UI becoming provider-centric;
- use primary controls with visible keyboard focus;
- resize within the intended desktop range without major layout failure.

## Explicit non-goals for prototype iteration

Do not use this brief to authorize:

- canonical persistence or migrations;
- live Gemini inference;
- protected credential storage implementation;
- runtime-routing architecture;
- Delegate/tool execution;
- additional inference providers;
- local inference;
- Google OAuth;
- Calendar/Gmail/Drive integrations;
- cloud sync or multi-user behavior;
- generalized browser or shell automation;
- broad platform packaging;
- a plugin/skill marketplace.

Those move only when their Wayfinder decisions are resolved.

## Validation evidence for prototype iterations

Record whatever the execution environment can truthfully provide:

- type/build/test results;
- local launch evidence when available;
- screenshots for Today, Inbox, Chat, Settings, and Gemini setup when browser/native rendering is available;
- keyboard-navigation observations;
- reduced-information-mode observations;
- responsiveness observations;
- known fixture-only behavior;
- exact behaviors still blocked by unresolved Wayfinder decisions.

Unavailable dependencies or tooling are not passing evidence.

## Exit from prototype work

This brief stops governing once Wayfinder ticket #36 has enough owner evidence to resolve its interaction questions.

After the full Wayfinder route is clear:

1. synthesize the resolved decisions into the build-ready first-alpha specification;
2. convert that specification into tracer-bullet implementation tickets;
3. begin production implementation only from the unblocked build frontier.
