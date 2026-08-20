# Wayfinder Scheduler Liveness Protocol

## Purpose

The recurring Wayfinder automation must be observable without creating one GitHub comment or commit per scheduled run.

This protocol distinguishes four materially different states:

1. the scheduler never invoked the cycle;
2. the scheduler invoked the cycle but it did not complete;
3. the cycle completed correctly with no autonomous change available;
4. the cycle completed and materially advanced or reconciled the Wayfinder route.

The canonical rolling telemetry surface is the GitHub issue titled **`Wayfinder operations | Scheduler liveness heartbeat`**.

That issue is an operations record. It is not a decision ticket, is not part of the Wayfinder frontier, and must not be treated as product or architecture authority.

## Low-noise rule

Update the heartbeat issue **in place**. Do not append one comment per run and do not create repository commits solely to record hourly heartbeat timestamps.

The issue body is rolling operational state. GitHub history provides edit history when deeper inspection is needed.

## Required fields

Every scheduled cycle maintains these fields:

- `Last trigger observed`: timestamp when execution actually began;
- `Last completed cycle`: timestamp when the governed cycle reached a terminal outcome;
- `Outcome`: `ADVANCED`, `WAITING_NO_CHANGE`, `BLOCKED_PROCESS`, or `FAILED`;
- `Active owner gate`: descriptive ticket title or `none`;
- `Autonomous work performed`: concise description or `none`;
- `Failure/blocker`: concise description or `none`;
- `Default-branch head observed`: commit SHA when available.

Use an unambiguous timestamp with timezone. UTC ISO-8601 is preferred for machine comparison; a local-time rendering may also be included for readability.

## Start-of-run heartbeat

Immediately after repository access is confirmed and before substantive Wayfinder work:

1. read the current heartbeat issue;
2. set `Last trigger observed` to the current execution time;
3. preserve the prior `Last completed cycle` until this run actually completes;
4. set `Outcome` to `RUNNING` only transiently if the tool surface supports a safe in-place update;
5. do not claim a completed cycle at startup.

If the cycle later disappears or fails before completion, the differing trigger/completion timestamps expose that interruption.

## End-of-run heartbeat

After the governed cycle reaches its terminal outcome, update the same issue body again:

- advance `Last completed cycle`;
- record the final outcome;
- record the live active owner gate;
- state any autonomous work performed;
- state any failure or blocker;
- record the observed default-branch head.

Heartbeat updates are operational telemetry and do not count as Wayfinder decision progress by themselves.

## Outcome semantics

### `ADVANCED`

Use when the run materially changed the route or improved executable readiness, for example:

- resolved eligible AFK research;
- reconciled stale map/document state;
- removed a real process blocker;
- claimed and opened a newly eligible HITL grilling round;
- completed convergence/spec/ticket handoff work after the route cleared.

### `WAITING_NO_CHANGE`

Use when the scheduler ran successfully, recomputed live state, completed the blocker sweep, and correctly found no autonomous mutation available because the active frontier is waiting on owner input or another legitimate dependency.

This is a healthy scheduled run, not a failure.

### `BLOCKED_PROCESS`

Use when the scheduler invoked successfully but a tooling, access, repository, authentication, or governance-process problem prevented the governed cycle from reaching the work it otherwise should have performed.

Record the exact blocker. Do not conflate a normal HITL wait with a process blocker.

### `FAILED`

Use when the cycle began but encountered an execution failure that prevented a trustworthy governed outcome.

Do not claim successful reconciliation or a completed Wayfinder cycle when the evidence is incomplete.

## Liveness interpretation

For an hourly automation:

- if `Last trigger observed` is materially older than one expected interval, suspect missed scheduler invocation;
- if `Last trigger observed` advances but `Last completed cycle` remains older, suspect an interrupted or failed run;
- if both advance with `WAITING_NO_CHANGE`, scheduling and Wayfinder evaluation are healthy even though no repository change occurred;
- if both advance with `ADVANCED`, scheduling and route progression are healthy.

Allow modest scheduler latency. Do not diagnose a missed invocation from a few minutes of drift alone.

## Progress protection

Liveness must support progress, not replace it.

Every scheduled cycle still follows `WAYFINDER.md` and must:

- recompute live state;
- calculate the real frontier;
- obey claim and HITL/AFK discipline;
- run the blocker sweep;
- reconcile stale state when justified;
- avoid speculative work;
- preserve implementation gating until convergence passes.

A fresh heartbeat with no corresponding governed work evaluation is not success.

## Scheduler configuration checks

When diagnosing cadence problems, verify all observable scheduler state available through the automation system:

- automation enabled state;
- recurrence rule;
- timezone;
- last-run metadata;
- next-run metadata when exposed;
- whether other automations show the same scheduler symptom.

Do not invent infrastructure causes when scheduler logs or skipped-trigger reasons are not exposed.

## Escalation threshold

If two or more consecutive expected hourly invocations are absent from the heartbeat while the automation remains enabled and correctly scheduled:

1. treat it as a scheduler-liveness incident rather than Wayfinder inactivity;
2. verify automation configuration immediately;
3. run one manual governed Wayfinder cycle so project progress does not depend on the missing trigger;
4. preserve the observed gap in the heartbeat issue's blocker field until a later healthy run demonstrates recovery;
5. avoid changing the product roadmap merely to compensate for scheduling infrastructure.

The purpose of this escalation is continuity of progress, not noisy incident ceremony.