use crate::{planner::{project_remaining_work, ReplanResult}, state::{Store, WorkState}};
use anyhow::{bail, Result};
use tauri::State;

pub fn apply_next_action(state: &mut WorkState, target_id: &str) -> Result<()> {
    let target_id = target_id.trim();
    if target_id.is_empty() || target_id.len() > 128 {
        bail!("proposal target id is missing or too long");
    }

    let target = state
        .items
        .iter_mut()
        .find(|item| item.id == target_id)
        .ok_or_else(|| anyhow::anyhow!("proposal target does not exist in canonical state"))?;

    if target.kind != "task" {
        bail!("only task items can become the next action");
    }
    if matches!(target.status.as_str(), "done" | "deferred") {
        bail!("completed or deferred work cannot become the next action without an explicit lifecycle change");
    }
    if !matches!(target.status.as_str(), "inbox" | "planned" | "doing") {
        bail!("proposal target is not eligible for next-action selection");
    }

    if target.status == "inbox" {
        target.status = "planned".into();
    }
    state.active_id = Some(target_id.to_owned());
    Ok(())
}

#[tauri::command]
pub fn apply_next_action_proposal(
    store: State<'_, Store>,
    target_id: String,
) -> std::result::Result<ReplanResult, String> {
    let mut state = store.load().map_err(|error| error.to_string())?;
    apply_next_action(&mut state, &target_id).map_err(|error| error.to_string())?;
    store.save(&state).map_err(|error| error.to_string())?;
    let persisted = store.load().map_err(|error| error.to_string())?;
    let plan = project_remaining_work(&persisted);
    Ok(ReplanResult {
        work_state: persisted,
        plan,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::state::{HandoffSnapshot, WorkItem};

    fn item(id: &str, kind: &str, status: &str) -> WorkItem {
        WorkItem {
            id: id.into(),
            kind: kind.into(),
            title: format!("Item {id}"),
            estimate: Some(15),
            priority: "normal".into(),
            due: None,
            status: status.into(),
        }
    }

    fn state(items: Vec<WorkItem>) -> WorkState {
        WorkState {
            active_id: Some("current".into()),
            items,
            handoff: Some(HandoffSnapshot {
                objective: "Current work".into(),
                state: "Ready".into(),
                next: "Continue current work".into(),
            }),
        }
    }

    #[test]
    fn applies_inbox_task_as_planned_next_action() -> Result<()> {
        let mut state = state(vec![
            item("current", "task", "planned"),
            item("target", "task", "inbox"),
        ]);

        apply_next_action(&mut state, "target")?;

        assert_eq!(state.active_id.as_deref(), Some("target"));
        assert_eq!(
            state.items.iter().find(|item| item.id == "target").unwrap().status,
            "planned"
        );
        assert_eq!(
            state.items.iter().find(|item| item.id == "current").unwrap().status,
            "planned"
        );
        Ok(())
    }

    #[test]
    fn rejects_missing_completed_and_non_task_targets() {
        let mut missing = state(vec![item("current", "task", "planned")]);
        assert!(apply_next_action(&mut missing, "missing").is_err());

        let mut completed = state(vec![
            item("current", "task", "planned"),
            item("target", "task", "done"),
        ]);
        assert!(apply_next_action(&mut completed, "target").is_err());
        assert_eq!(completed.active_id.as_deref(), Some("current"));

        let mut note = state(vec![
            item("current", "task", "planned"),
            item("target", "note", "inbox"),
        ]);
        assert!(apply_next_action(&mut note, "target").is_err());
        assert_eq!(note.active_id.as_deref(), Some("current"));
    }
}