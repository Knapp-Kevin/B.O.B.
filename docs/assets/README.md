# B.O.B. Brand Assets

These files support the public repository and future application identity. Keep them together so documentation does not accumulate loose binary assets at the `docs/` root.

| File | Purpose |
| --- | --- |
| `bob-readme-hero.png` | Primary README hero/banner artwork |
| `bob-social-preview.png` | Canonical source for the GitHub repository social preview / Open Graph artwork |
| `bob-mascot.png` | Full square B.O.B. mascot asset for documentation and product surfaces |
| `bob-icon.png` | Simplified square icon for compact UI and future application icon work |

## Identity rule

B.O.B. is one user-facing agent. Visual material should reinforce a single approachable B.O.B. identity rather than depict multiple peer agents. Multiple LLMs, inference runtimes, and tools belong behind B.O.B. as capabilities.

## Usage

Prefer repository-relative paths from Markdown. Do not duplicate these files elsewhere merely to satisfy another document.

GitHub's README image proxy can continue serving a cached image after a binary is replaced at the same repository path. When intentionally replacing `bob-readme-hero.png` in place, update the README image revision query so the rendered README requests the new asset.

The repository social preview is separate from Markdown rendering. Keeping `bob-social-preview.png` in this directory does **not** automatically configure the repository's social preview. Upload this canonical file through the repository **Settings → Social preview** control after asset changes.

For GitHub social preview compatibility, keep `bob-social-preview.png` at **1280 × 640** where practical and **below 1,000,000 bytes** so it safely satisfies GitHub's documented “under 1 MB” upload limit without depending on MiB/MB interpretation.
