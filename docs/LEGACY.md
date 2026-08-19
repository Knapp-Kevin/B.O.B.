# Legacy Alpha Architecture

## Purpose

This document identifies which parts of the current repository represent historical experiments rather than revival requirements.

The old code remains valuable as evidence of product ideas and prior exploration. It is not automatically authoritative architecture.

## Historical implementation themes

The legacy tree includes experiments around:

- Electron desktop UI;
- privileged renderer/native integration;
- local Ollama inference;
- separate local AI server processes and watchdog lifecycle;
- vector/RAG and document-processing dependencies;
- adaptive behavior and cognitive-profile concepts;
- task and idea management;
- accessibility controls;
- Python placeholder structures;
- modular/plugin-like organization;
- multiple version directories and generated repository structure dumps.

## Preserve as product concepts

The revival should intentionally evaluate and preserve useful behavior such as:

- Better Organized Brain identity;
- quick task/idea capture;
- task priority, estimates, tags, and status concepts;
- task suggestions and breakdown;
- accessibility settings;
- concise, supportive interaction style;
- reducing cognitive load;
- organization, prioritization, and time-management goals.

## Do not inherit automatically

The following are not current requirements merely because code exists:

- Electron;
- Ollama;
- local HTTP inference server;
- vector database;
- document ingestion/RAG;
- cognitive trait scoring;
- machine-learning trait recognition;
- Python runtime;
- generalized module system;
- detached watchdog processes;
- every historical top-level tab.

## Cleanup approach

Before the structural rewrite:

1. create an easy-to-find legacy tag at the final alpha state;
2. identify any behavior required by accepted PRDs;
3. port required behavior intentionally into the new architecture;
4. remove superseded implementation from the active tree;
5. rely on Git history and the legacy tag rather than keeping duplicate runtimes alive.

The active repository should become easier to understand after revival, not a museum in which every failed experiment receives permanent office space.
