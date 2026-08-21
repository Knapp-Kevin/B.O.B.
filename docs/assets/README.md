# B.O.B. Brand Assets

These files support the public repository and future application identity. Keep them together so documentation does not accumulate loose binary assets at the `docs/` root.

| File | Purpose |
| --- | --- |
| `bob-readme-hero.png` | Primary README hero/banner artwork |
| `bob-social-preview.png` | Canonical source for the GitHub repository social preview / Open Graph artwork |
| `bob-mascot-transparent.png` | **Canonical in-application branding.** Transparent mascot for surfaces that must composite over an existing background, including the sidebar identity, B.O.B. chat avatar, and in-app cards |
| `bob-app-icon.png` | **Canonical application icon.** Framed mark for OS/application surfaces: Tauri/Windows title bar, taskbar, shortcuts, packaged installer icons, and the favicon |
| `bob-mascot.png` | Earlier full square mascot. Retained for documentation use; superseded by `bob-mascot-transparent.png` for in-application branding |
| `bob-icon.png` | Earlier simplified square icon. Retained for documentation use; superseded by `bob-app-icon.png` for application-icon work |

## Role separation

The two roles are deliberately different assets and are not interchangeable.

**In-application branding** renders inside B.O.B.'s own UI, where the surrounding background is already designed — the dark navy sidebar, a light card, a chat row. It must therefore have a real alpha channel so no square tile appears behind it. Use `bob-mascot-transparent.png`.

**Application icons** render on surfaces B.O.B. does not control — the Windows title bar, taskbar, Start menu, desktop shortcuts, the installer, and a browser tab. They composite against unpredictable backgrounds and want a self-contained framed mark. Use `bob-app-icon.png`.

Generate application icon sizes and formats with the standard Tauri pipeline:

```powershell
npx tauri icon docs/assets/bob-app-icon.png
```

Do not hand-author individual icon sizes; divergent variants are how an application ends up with several subtly different marks. `src-tauri/icons/` and `public/favicon.png` are both generated from `bob-app-icon.png` this way. `public/bob-mascot-transparent.png` is a verbatim copy of the canonical transparent mascot.

## Identity rule

B.O.B. is one user-facing agent. Visual material should reinforce a single approachable B.O.B. identity rather than depict multiple peer agents. Multiple LLMs, inference runtimes, and tools belong behind B.O.B. as capabilities.

## Usage

Prefer repository-relative paths from Markdown. Do not duplicate these files elsewhere merely to satisfy another document.

GitHub's README image proxy can continue serving a cached image after a binary is replaced at the same repository path. When intentionally replacing `bob-readme-hero.png` in place, update the README image revision query so the rendered README requests the new asset.

The repository social preview is separate from Markdown rendering. Keeping `bob-social-preview.png` in this directory does **not** automatically configure the repository's social preview. Upload this canonical file through the repository **Settings → Social preview** control after asset changes.

For GitHub social preview compatibility, keep `bob-social-preview.png` at **1280 × 640** where practical and **below 1,000,000 bytes** so it safely satisfies GitHub's documented “under 1 MB” upload limit without depending on MiB/MB interpretation.
