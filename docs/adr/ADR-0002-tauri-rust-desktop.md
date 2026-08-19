# ADR-0002: Use Tauri + Rust for the Revived Desktop Architecture

**Status:** Proposed  
**Date:** 2026-08-19  
**Related:** RFC-0001

## Context

The legacy prototype uses Electron with privileged renderer configuration, separate local AI server processes, and Node-centric infrastructure. B.O.B.'s revived scope requires a desktop UI, local state, secure native boundaries, controlled vendor CLI execution, and a future option to integrate a Rust local-inference runtime.

## Decision

Adopt Tauri 2 as the desktop shell, Rust as the privileged application core, and a lightweight TypeScript frontend.

## Consequences

Positive:

- narrow native command boundary;
- lower runtime footprint than the legacy Electron architecture;
- direct compatibility with future Rust-native GG-CORE integration;
- preservation of productive web UI technologies;
- native process and persistence control in one core language.

Costs:

- Rust/Tauri build tooling becomes required;
- legacy Electron code is not directly reusable as runtime code;
- platform WebView differences require testing.

## Rejected alternatives

- Electron: viable but heavier and requires substantial modernization with no compensating product advantage.
- native Rust GUI: unnecessarily increases UI implementation burden.
- Wails/Go: viable, but adds a different native ecosystem and weakens the GG-CORE integration path.
- browser-only: poor fit for secure local agent CLI integration.
