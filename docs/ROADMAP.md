# B.O.B. Roadmap

**Status:** Accepted

The roadmap is capability-oriented rather than calendar-oriented. A release advances when its acceptance criteria are satisfied, not because a date arrived and demanded tribute.

The first runnable alpha is a waypoint, not the end of development. Current Wayfinder maps and accepted repository authority determine the next build frontier.

## Landed foundation

The revived desktop architecture and core planning product are now implemented on `master`:

- Tauri 2 desktop shell with Rust privileged core;
- framework-free TypeScript + Vite frontend;
- Windows-first packaging/validation authority;
- Rust-owned SQLite canonical state, migrations, recovery, backup/restore, and portable non-secret export;
- Today, Inbox, quick capture, item lifecycle, focus and deterministic planning/replanning;
- durable handoff/restart continuity;
- B.O.B. Assist core and preview-before-apply proposal authority;
- accessibility preferences and visible keyboard-focus corrections;
- OS-backed secret storage;
- advanced optional Gemini API credential/context capability behind fail-closed cost/privacy/provider-use policy.

These are current product surfaces, not future milestones.

## Current priority: calm primary workflow

**Goal:** Make B.O.B. feel like one calm prioritized assistant at normal information density.

Governed by Wayfinder #86.

Current bounded slices:

- Settings/provider-positioning cleanup under #82;
- Today hierarchy/density convergence under #87;
- Inbox and Chat density/empty-state refinement under #88;
- rendered desktop/accessibility evidence after each material UI slice.

Reduced-information mode is additive simplification, not a rescue mechanism for a cluttered default experience.

## Current priority: provider-independent inference

**Goal:** Make inference replaceable without making provider plumbing B.O.B.'s product identity.

Governed by Wayfinder #79.

Direction:

- B.O.B. remains the single user-facing agent and owns state, continuity, deterministic services, routing, authority, privacy, and billing policy;
- Gemini Developer API remains a supported advanced optional adapter and first-alpha proof point;
- prefer simple account-backed or local normal-user paths where officially supported and accepted;
- evaluate provider-specific account/runtime and local-runtime options without making any one proprietary client mandatory;
- preserve deterministic useful operation with no inference configured;
- preserve no-surprise billing and no silent provider/model fallback;
- normalize only the runtime/auth/capability fields B.O.B. actually needs.

Unresolved factual/provider questions remain governed by their Wayfinder research owners. Do not invent unsupported Google OAuth, Claude/Codex, Ollama/LM Studio, or first-party local-runtime behavior merely to fill Settings.

## Current priority: executable readiness

**Goal:** Turn landed source into repeatable, native, reviewable product evidence.

Includes:

- locked/reproducible npm and Cargo dependency state;
- frontend production build/type validation;
- Rust fmt/clippy/tests and Tauri build on capable environments;
- Windows persistence/restart/recovery exercises;
- Windows Credential Manager behavior;
- rendered desktop/accessibility regression at supported sizes;
- provider-boundary validation where live inference is exercised;
- NSIS package install/launch/uninstall smoke;
- exact-head evidence after merges or rebases that invalidate prior validation.

Small CI remains a safety net. Native/rendered/recovery/provider evidence is not replaced by green hosted checks.

## Next capability candidates

These are directional and require accepted product/architecture authority before implementation where not already governed:

### Additional supported inference paths

- officially supported account-backed runtimes;
- local inference through a smallest-sufficient provider-independent seam;
- compatibility with user-owned local runtime installations where accepted;
- runtime switching while preserving one B.O.B. identity and continuity.

### Bounded delegated work

Potential future scope:

- explicit Assist versus Delegate authority;
- bounded workspace/capability grants;
- execution lifecycle/cancellation where supported;
- result/evidence capture without granting ordinary chat broad tool authority.

### Broader personal-work continuity

Potential later work must earn a PRD or governing Wayfinder destination, including:

- calendar integration;
- recurring routines;
- notification scheduling;
- richer continuity summaries;
- selective document context;
- mobile companion or additional surfaces;
- encrypted/shared continuity where an explicit sync/trust model is accepted.

## Explicit non-goals without later authority

- peer-agent or multi-agent swarm UX;
- generalized RAG/knowledge-center infrastructure;
- cognitive profiling or diagnostic behavior;
- broad plugin marketplaces;
- cloud sync or multi-user state by implication;
- mandatory dependency on Google, Anthropic, OpenAI, Ollama, LM Studio, or another provider client;
- silent metered fallback;
- decorative dashboard expansion that increases cognitive load without improving the primary workflow.

The project should remain smaller than the problem space around it.