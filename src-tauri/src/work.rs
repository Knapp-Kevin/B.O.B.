use crate::{
    planner::{project_remaining_work, ReplanResult},
    state::{HandoffSnapshot, Store, WorkItem, WorkState},
};
use anyhow::{bail, Context, Result};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::State;

fn persist_normalized(store: &Store, mut state: WorkState) -> Result<ReplanResult> {
    let plan = project_remaining_work(&state);
    state.active_id = plan.next_id.clone();
    store.save(&state)?;
    let persisted = store.load()?;
    let plan = project_remaining_work(&persisted);
    Ok(ReplanResult {
        work_state: persisted,
        plan,
    })
}

pub fn normalize_store(store: &Store) -> Result<()> {
    let state = store.load()?;
    let expected = project_remaining_work(&state).next_id;
    if state.active_id == expected {
        return Ok(());
    }
    persist_normalized(store, state)?;
    Ok(())
}

fn next_capture_id(state: &WorkState) -> Result<String> {
    let millis = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .context("system clock is before Unix epoch")?
        .as_millis();
    let base = format!("capture-{millis}");
    if !state.items.iter().any(|item| item.id == base) {
        return Ok(base);
    }
    for suffix in 2..=10_000 {
        let candidate = format!("{base}-{suffix}");
        if !state.items.iter().any(|item| item.id == candidate) {
            return Ok(candidate);
        }
    }
    bail!("could not allocate a unique capture id")
}

fn current_planned_id(state: &WorkState) -> Option<String> {
    project_remaining_work(state).next_id
}

fn valid_item_kind(kind: &str) -> bool {
    matches!(kind, "task" | "idea" | "note" | "reminder")
}

#[tauri::command]
pub fn capture_item(
    store: State<'_, Store>,
    title: String,
) -> std::result::Result<ReplanResult, String> {
    let title = title.trim();
    if title.is_empty() || title.len() > 500 {
        return Err("capture content is missing or too long".into());
    }

    let mut state = store.load().map_err(|error| error.to_string())?;
    let id = next_capture_id(&state).map_err(|error| error.to_string())?;
    state.items.insert(
        0,
        WorkItem {
            id,
            kind: "note".into(),
            title: title.into(),
            estimate: None,
            priority: "normal".into(),
            due: None,
            status: "inbox".into(),
        },
    );
    persist_normalized(&store, state).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn classify_inbox_item(
    store: State<'_, Store>,
    item_id: String,
    kind: String,
) -> std::result::Result<ReplanResult, String> {
    let kind = kind.trim().to_ascii_lowercase();
    if !valid_item_kind(&kind) {
        return Err("item classification is not supported".into());
    }

    let mut state = store.load().map_err(|error| error.to_string())?;
    let target = state
        .items
        .iter_mut()
        .find(|item| item.id == item_id)
        .ok_or_else(|| "Inbox item does not exist in canonical state".to_string())?;
    if target.status != "inbox" {
        return Err("only Inbox items can be reclassified".into());
    }
    target.kind = kind;
    persist_normalized(&store, state).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn start_current_work(
    store: State<'_, Store>,
) -> std::result::Result<ReplanResult, String> {
    let mut state = store.load().map_err(|error| error.to_string())?;
    let target_id = current_planned_id(&state).ok_or_else(|| "no planned task is available to start".to_string())?;
    let target = state
        .items
        .iter_mut()
        .find(|item| item.id == target_id)
        .ok_or_else(|| "planned task disappeared from canonical state".to_string())?;
    if target.kind != "task" {
        return Err("only tasks can be started".into());
    }
    target.status = "doing".into();
    state.active_id = Some(target_id);
    persist_normalized(&store, state).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn defer_current_work(
    store: State<'_, Store>,
) -> std::result::Result<ReplanResult, String> {
    let mut state = store.load().map_err(|error| error.to_string())?;
    let target_id = current_planned_id(&state).ok_or_else(|| "no planned task is available to defer".to_string())?;
    let target = state
        .items
        .iter_mut()
        .find(|item| item.id == target_id)
        .ok_or_else(|| "planned task disappeared from canonical state".to_string())?;
    if target.kind != "task" {
        return Err("only tasks can be deferred from the active plan".into());
    }
    target.status = "deferred".into();
    persist_normalized(&store, state).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn toggle_task_completed(
    store: State<'_, Store>,
    item_id: String,
) -> std::result::Result<ReplanResult, String> {
    let mut state = store.load().map_err(|error| error.to_string())?;
    let target = state
        .items
        .iter_mut()
        .find(|item| item.id == item_id)
        .ok_or_else(|| "task does not exist in canonical state".to_string())?;
    if target.kind != "task" {
        return Err("only tasks can be completed".into());
    }
    target.status = match target.status.as_str() {
        "doing" | "planned" => "done".into(),
        "done" => "planned".into(),
        _ => return Err("task is not in a completable state".into()),
    };
    persist_normalized(&store, state).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn select_next_task(
    store: State<'_, Store>,
    item_id: String,
) -> std::result::Result<ReplanResult, String> {
    let mut state = store.load().map_err(|error| error.to_string())?;
    let target = state
        .items
        .iter_mut()
        .find(|item| item.id == item_id)
        .ok_or_else(|| "task does not exist in canonical state".to_string())?;
    if target.kind != "task" {
        return Err("only tasks can become the next action".into());
    }
    match target.status.as_str() {
        "inbox" => target.status = "planned".into(),
        "planned" | "doing" => {}
        "done" | "deferred" => return Err("completed or deferred work requires an explicit lifecycle change first".into()),
        _ => return Err("task is not eligible for next-action selection".into()),
    }
    state.active_id = Some(item_id);
    persist_normalized(&store, state).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn save_current_handoff(
    store: State<'_, Store>,
) -> std::result::Result<ReplanResult, String> {
    let mut state = store.load().map_err(|error| error.to_string())?;
    let target_id = current_planned_id(&state).ok_or_else(|| "no current task is available to save".to_string())?;
    let target = state
        .items
        .iter()
        .find(|item| item.id == target_id)
        .ok_or_else(|| "current task disappeared from canonical state".to_string())?;
    let state_label = if target.status == "doing" {
        "In progress"
    } else {
        "Ready to start"
    };
    state.handoff = Some(HandoffSnapshot {
        objective: target.title.clone(),
        state: state_label.into(),
        next: format!(
            "Reopen the context for “{}” and spend five minutes on the first concrete change.",
            target.title
        ),
    });
    state.active_id = Some(target_id);
    persist_normalized(&store, state).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn clear_handoff(
    store: State<'_, Store>,
) -> std::result::Result<ReplanResult, String> {
    let mut state = store.load().map_err(|error| error.to_string())?;
    state.handoff = None;
    persist_normalized(&store, state).map_err(|error| error.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn item(id: &str, kind: &str, status: &str) -> WorkItem {
        WorkItem {
            id: id.into(),
            kind: kind.into(),
            title: format!("Item {id}"),
            estimate: Some(10),
            priority: "normal".into(),
            due: None,
            status: status.into(),
        }
    }

    #[test]
    fn normalization_preserves_a_genuinely_empty_first_run() -> Result<()> {
        let directory = tempfile::tempdir()?;
        let store = Store::open(directory.path())?;

        normalize_store(&store)?;

        let state = store.load()?;
        assert!(state.items.is_empty());
        assert_eq!(state.active_id, None);
        Ok(())
    }

    #[test]
    fn planner_normalization_clears_stale_completed_active_item() -> Result<()> {
        let directory = tempfile::tempdir()?;
        let store = Store::open(directory.path())?;
        store.save(&WorkState {
            active_id: Some("done".into()),
            items: vec![item("done", "task", "done")],
            handoff: None,
        })?;

        normalize_store(&store)?;

        assert_eq!(store.load()?.active_id, None);
        Ok(())
    }

    #[test]
    fn normalization_selects_remaining_task_and_ignores_non_tasks() -> Result<()> {
        let directory = tempfile::tempdir()?;
        let store = Store::open(directory.path())?;
        store.save(&WorkState {
            active_id: Some("note".into()),
            items: vec![
                item("note", "note", "planned"),
                item("task", "task", "planned"),
            ],
            handoff: None,
        })?;

        normalize_store(&store)?;

        assert_eq!(store.load()?.active_id.as_deref(), Some("task"));
        Ok(())
    }

    #[test]
    fn reclassifying_inbox_item_changes_only_kind() -> Result<()> {
        let directory = tempfile::tempdir()?;
        let store = Store::open(directory.path())?;
        store.save(&WorkState {
            active_id: None,
            items: vec![item("captured", "note", "inbox")],
            handoff: None,
        })?;

        let mut state = store.load()?;
        let target = state.items.iter_mut().find(|item| item.id == "captured").unwrap();
        target.kind = "task".into();
        persist_normalized(&store, state)?;

        let persisted = store.load()?;
        let target = persisted.items.iter().find(|item| item.id == "captured").unwrap();
        assert_eq!(target.kind, "task");
        assert_eq!(target.status, "inbox");
        assert_eq!(persisted.active_id, None);
        Ok(())
    }

    #[test]
    fn supported_item_kind_set_is_closed() {
        assert!(valid_item_kind("task"));
        assert!(valid_item_kind("idea"));
        assert!(valid_item_kind("note"));
        assert!(valid_item_kind("reminder"));
        assert!(!valid_item_kind("calendar"));
    }
}
