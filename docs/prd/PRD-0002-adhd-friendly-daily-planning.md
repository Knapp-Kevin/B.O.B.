# PRD-0002: ADHD-Friendly Daily Planning

**Status:** Proposed  
**Related:** PRD-0001, ADR-0001, ADR-0004

## Summary

B.O.B. shall provide an executive-function-oriented planning experience that reduces friction between remembering work and starting useful work.

The product is ADHD-friendly through interaction design. It must not perform neurological inference, diagnostic scoring, or cognitive trait profiling.

## User problem

Traditional task managers often expose too much state at once and require categorization before capture. Generic AI chat begins with an empty prompt and does not own a realistic daily plan. Both patterns can impose additional executive-function work on the user.

## Goals

- capture first, organize later;
- show one useful next action prominently;
- constrain daily focus to a realistic number of items;
- make interruption and replanning cheap;
- preserve unfinished work without punitive language;
- expose time estimates and capacity where they reduce uncertainty;
- allow AI assistance without making planning dependent on AI;
- retain accessible typography, contrast, keyboard operation, and reduced-motion controls.

## Core workflows

### Quick capture

A user can save an unstructured thought in one action. Additional metadata is optional.

### Inbox organization

Captured items can remain unprocessed or later become tasks, ideas, notes, or reminders. AI may propose classifications or task breakdowns with a preview.

### Plan my day

B.O.B. creates a feasible plan using fixed commitments, available time, selected focus, estimates, due constraints, and completed state. AI may improve sequencing or explanation but may not create an impossible time plan that bypasses deterministic validation.

### Next action

Today displays one primary next action with a small decision set such as Start, Break it down, or Not now.

### Replan

Replanning preserves completed work and fixed commitments, recalculates remaining capacity, and moves or defers flexible work without framing disruption as failure.

### Overwhelmed mode

The user can intentionally reduce information density. B.O.B. hides nonessential backlog and analytics state and helps select one useful action.

## Functional requirements

- default startup surface is Today, not blank chat;
- maximum default focus list is three items;
- quick capture requires only content;
- the application distinguishes inbox, planned, doing, done, deferred, and archived states;
- planning works without AI;
- replanning operates on remaining work only unless the user intentionally resets the day;
- no productivity score is required;
- overdue state must be visible without punitive or shame-oriented language;
- keyboard navigation must cover primary workflows;
- visual state must not rely on color alone.

## Acceptance criteria

A user can:

1. capture a thought in one interaction;
2. convert or organize it later;
3. select up to three focus items;
4. build a feasible day from tasks and fixed blocks;
5. start and complete a task;
6. defer an item without losing it;
7. replan after interruption;
8. enter reduced-information overwhelmed mode;
9. complete these workflows without an AI bridge configured.

## Explicit exclusions

- inferred ADHD severity;
- executive-function scoring;
- emotional-state diagnosis;
- productivity shame mechanics;
- infinite customizable dashboard widgets;
- mandatory streaks, points, badges, or leaderboards.

## Design principle

B.O.B. should help answer `What should I do next?` more often than it asks the user to configure how they want to answer that question.
