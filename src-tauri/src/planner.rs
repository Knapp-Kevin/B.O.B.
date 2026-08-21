use crate::state::{Store, WorkState};
use serde::Serialize;
use tauri::State;

const MAX_FOCUS_ITEMS: usize = 3;

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlanProjection {
    pub next_id: Option<String>,
    pub focus_ids: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReplanResult {
    pub work_state: WorkState,
    pub plan: PlanProjection,
}

pub fn project_remaining_work(state: &WorkState) -> PlanProjection {
    let active_id = state.active_id.as_deref();
    let mut candidates = state
        .items
        .iter()
        .enumerate()
        .filter(|(_, item)| matches!(item.status.as_str(), "doing" | "planned"))
        .collect::<Vec<_>>();

    candidates.sort_by_key(|(index, item)| {
        let active_rank = if active_id == Some(item.id.as_str()) { 0 } else { 1 };
        let status_rank = if item.status == "doing" { 0 } else { 1 };
        let today_rank = if item
            .due
            .as_deref()
            .is_some_and(|due| due.eq_ignore_ascii_case("today"))
        {
            0
        } else {
            1
        };
        let priority_rank = match item.priority.as_str() {
            "high" => 0,
            "normal" => 1,
            "low" => 2,
            _ => 3,
        };
        (active_rank, status_rank, today_rank, priority_rank, *index)
    });

    let focus_ids = candidates
        .iter()
        .take(MAX_FOCUS_ITEMS)
        .map(|(_, item)| item.id.clone())
        .collect::<Vec<_>>();

    PlanProjection {
        next_id: focus_ids.first().cloned(),
        focus_ids,
    }
}

#[tauri::command]
pub fn plan_remaining_work(store: State<'_, Store>) -> std::result::Result<PlanProjection, String> {
    let state = store.load().map_err(|error| error.to_string())?;
    Ok(project_remaining_work(&state))
}

#[tauri::command]
pub fn replan_remaining_work(store: State<'_, Store>) -> std::result::Result<ReplanResult, String> {
    let mut state = store.load().map_err(|error| error.to_string())?;
    let plan = project_remaining_work(&state);
    state.active_id = plan.next_id.clone();
    store.save(&state).map_err(|error| error.to_string())?;

    Ok(ReplanResult {
        work_state: state,
        plan,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::state::{HandoffSnapshot, WorkItem};

    fn item(id: &str, status: &str, priority: &str, due: Option<&str>) -> WorkItem {
        WorkItem {
            id: id.into(),
            kind: "task".into(),
            title: format!("Task {id}"),
            estimate: Some(15),
            priority: priority.into(),
            due: due.map(str::to_owned),
            status: status.into(),
        }
    }

    fn state(active_id: Option<&str>, items: Vec<WorkItem>) -> WorkState {
        WorkState {
            active_id: active_id.map(str::to_owned),
            items,
            handoff: Some(HandoffSnapshot {
                objective: "Existing objective".into(),
                state: "Ready".into(),
                next: "Continue existing work".into(),
            }),
        }
    }

    #[test]
    fn preserves_current_eligible_active_item_first() {
        let state = state(
            Some("current"),
            vec![
                item("urgent", "planned", "high", Some("Today")),
                item("current", "planned", "low", None),
            ],
        );

        let plan = project_remaining_work(&state);

        assert_eq!(plan.next_id.as_deref(), Some("current"));
        assert_eq!(plan.focus_ids, vec!["current", "urgent"]);
    }

    #[test]
    fn excludes_completed_deferred_and_inbox_work_and_caps_focus() {
        let state = state(
            Some("done"),
            vec![
                item("done", "done", "high", Some("Today")),
                item("deferred", "deferred", "high", Some("Today")),
                item("inbox", "inbox", "high", Some("Today")),
                item("doing", "doing", "normal", None),
                item("today", "planned", "high", Some("Today")),
                item("normal", "planned", "normal", None),
                item("low", "planned", "low", None),
            ],
        );

        let plan = project_remaining_work(&state);

        assert_eq!(plan.next_id.as_deref(), Some("doing"));
        assert_eq!(plan.focus_ids, vec!["doing", "today", "normal"]);
    }

    #[test]
    fn projection_does_not_mutate_canonical_work() {
        let state = state(
            None,
            vec![
                item("first", "planned", "high", Some("Today")),
                item("second", "planned", "normal", None),
            ],
        );
        let before = state.clone();

        let _ = project_remaining_work(&state);

        assert_eq!(state, before);
    }
}
