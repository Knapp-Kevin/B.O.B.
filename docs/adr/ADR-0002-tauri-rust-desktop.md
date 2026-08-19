# ADR-0002: Use Tauri + Rust for the Revived Desktop Architecture

**Status:** Accepted  
**Date:** 2026-08-19  
**Related:** RFC-0001, Wayfinder map `first runnable B.O.B. alpha`

## Context

The legacy prototype uses Electron with privileged renderer configuration, separate local AI server processes, and Node-centric infrastructure. B.O.B.'s revived scope requires a desktop UI, local canonical state, secure credential handling, a narrow native security boundary, controlled inference/network adapters, lifecycle/recovery behavior, and straightforward desktop packaging.

The first runnable alpha has since been narrowed through Wayfinder: Gemini Developer API Free is the first inference backend, local inference is deferred, and vendor CLI bridges are future expansion seams rather than foundation requirements.

## Decision

Adopt Tauri 2 as the desktop shell, Rust as the privileged application core, and a framework-free TypeScript + Vite frontend for the first alpha.

The frontend communicates with Rust only through narrow typed Tauri commands/events. Windows 11 x64 is the first supported alpha platform. macOS and Linux compatibility should not be needlessly precluded, but they are not alpha acceptance blockers.

A frontend framework may be adopted later only when demonstrated state/rendering complexity creates a concrete maintenance need.

## Consequences

Positive:

- narrow native security and capability boundary;
- Rust owns persistence/recovery, credential access, inference/network adapter boundaries, and other privileged native behavior;
- lower runtime footprint than the legacy Electron architecture;
- productive HTML/CSS/TypeScript UI without paying framework complexity prematurely;
- straightforward Windows desktop packaging path;
- future provider CLI and local-runtime adapters remain possible without defining the alpha architecture around them.

Costs:

- Rust/Tauri build tooling becomes required;
- legacy Electron code is not directly reusable as runtime code;
- platform WebView differences require testing when additional platforms become supported;
- framework-free frontend organization must remain disciplined as interaction complexity grows.

## Rejected alternatives

- Electron: viable but heavier and requires substantial modernization with no compensating first-alpha product advantage.
- native Rust GUI: unnecessarily increases UI implementation burden.
- Wails/Go: viable, but adds a different native ecosystem without a current requirement.
- browser-only: poor fit for local-first persistence, native secret storage, recovery, and desktop packaging.
- React by default: no demonstrated first-alpha complexity currently justifies the additional framework layer.

## Wayfinder disposition

Accepted by owner disposition in `Wayfinder: grilling | Confirm desktop foundation and frontend strategy`. This amendment intentionally removes vendor CLI and GG-CORE integration as primary justification for the first-alpha foundation and records Windows 11 x64 plus framework-free TypeScript/Vite as the initial implementation boundary.
