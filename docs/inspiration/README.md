# UI Inspiration Artifacts

This directory holds visual inspiration for the B.O.B. pre-alpha interface.

These images are **directional design references, not normative specifications**. They exist to anchor visual hierarchy, information density, onboarding flow, and interaction tone while the runnable pre-alpha surface is built. When an image conflicts with accepted product, architecture, design, RFC, ADR, or Wayfinder decisions, the governing text wins.

## Expected artifacts

| File | Purpose |
| --- | --- |
| `bob-today-ui.png` | Today surface: next action, bounded focus, quick capture, day planning, resume context, and reduced-information access. |
| `bob-inbox-ui.png` | Inbox surface: frictionless capture, lightweight organization, attention cues, and easy re-entry. |
| `bob-chat-ui.png` | B.O.B. Chat: one user-facing agent, decision support, clear next action, and provider/runtime complexity kept secondary. |
| `bob-gemini-setup-ui.png` | First-run Gemini setup: direct path to Google AI Studio, 2–3 step credential onboarding, immediate validation, and clear free-tier/privacy context. |

## Design intent

The artifacts should reinforce the existing B.O.B. product principles:

- **B.O.B. is the agent. Models, runtimes, and tools are capabilities.**
- Today is the obvious starting surface.
- One useful next action should dominate secondary choices.
- Capture should be cheaper than organization.
- Reduced-information behavior should remove cognitive load rather than create another workflow.
- Chat should remain connected to current work and feel like B.O.B., not a provider switchboard.
- Setup is part of the product. A new user should not have to discover provider-specific configuration by wandering through unrelated account and cloud-console surfaces.
- Accessibility, readable hierarchy, and user-controllable information density are first-class requirements.

## How to use these images

Use the artifacts to inform:

- layout hierarchy;
- spatial relationships;
- information density;
- interaction priorities;
- onboarding flow shape;
- visual tone and affordances;
- the balance between calmness and actionable emphasis.

Do **not** copy incidental generated details blindly. Generated text, timestamps, labels, icons, model/provider names, task examples, or individual controls may be inaccurate or superseded. Validate behavior against the repository's governing product and design documents.

## Governing references

Start with:

- [`../PRODUCT.md`](../PRODUCT.md)
- [`../ARCHITECTURE.md`](../ARCHITECTURE.md)
- [`../DESIGN.md`](../DESIGN.md)
- [`../IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md)
- the active Wayfinder map and resolved decision tickets

The intended implementation relationship is simple:

```text
accepted product/design decisions
            |
            v
   visual inspiration artifacts
            |
            v
    pre-alpha runnable UI
            |
            v
       owner UX review
```

The pre-alpha should converge through rendered review and real interaction, not through pixel-for-pixel imitation of generated concept art.
