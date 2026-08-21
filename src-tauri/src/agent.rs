use crate::state::{Store, WorkState};
use anyhow::{bail, Result};
use tauri::State;

const MAX_ASSIST_INPUT: usize = 4_000;

pub fn deterministic_assist(input: &str, state: &WorkState) -> Result<String> {
    let input = input.trim();
    if input.is_empty() {
        bail!("assist input is empty");
    }
    if input.len() > MAX_ASSIST_INPUT {
        bail!("assist input is too long");
    }

    let current = state
        .active_id
        .as_deref()
        .and_then(|id| state.items.iter().find(|item| item.id == id))
        .or_else(|| {
            state
                .items
                .iter()
                .find(|item| matches!(item.status.as_str(), "doing" | "planned"))
        });

    let Some(current) = current else {
        return Ok("Nothing is currently planned. Capture the messy version first, and B.O.B. will help turn it into one useful next move.".into());
    };

    let lower = input.to_lowercase();
    let title = &current.title;

    if lower.contains("handoff") || lower.contains("resume later") || lower.contains("save my place") {
        return Ok(format!(
            "Handoff: {title}. Current state: {}. Next: reopen the context and spend five minutes identifying the first concrete change.",
            current.status
        ));
    }
    if lower.contains("overwhelm") || lower.contains("too much") {
        return Ok(format!("Keep only this: {title}. Everything else can wait."));
    }
    if lower.contains("wait")
        || lower.contains("confus")
        || lower.contains("reorient")
        || lower.contains("what?")
    {
        return Ok(format!(
            "Short version: {title} is the next useful move. You do not need to solve the rest right now."
        ));
    }
    if lower.contains("decid") || lower.contains("priorit") {
        return Ok("I can organize the facts and constraints, but I should not invent your preference. The decision in front of you is: what outcome matters most right now?".into());
    }
    if lower.contains("break") {
        return Ok(format!(
            "Start smaller: reopen “{title}” and spend five minutes identifying the first concrete change."
        ));
    }
    if lower.contains("organize") || lower.contains("inbox") {
        return Ok("I can identify a likely next action from the inbox, but I will preview the change before canonical work state is touched.".into());
    }

    Ok(format!(
        "The next useful move still looks like “{title}.” If that is wrong, tell me what changed and I’ll reorient."
    ))
}

#[tauri::command]
pub fn bob_assist(
    store: State<'_, Store>,
    input: String,
) -> std::result::Result<String, String> {
    let state = store.load().map_err(|error| error.to_string())?;
    deterministic_assist(&input, &state).map_err(|error| error.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::state::WorkItem;

    fn item(id: &str, title: &str, status: &str) -> WorkItem {
        WorkItem {
            id: id.into(),
            kind: "task".into(),
            title: title.into(),
            estimate: Some(15),
            priority: "normal".into(),
            due: None,
            status: status.into(),
        }
    }

    fn state() -> WorkState {
        WorkState {
            active_id: Some("one".into()),
            items: vec![
                item("one", "Write the project outline", "doing"),
                item("two", "Reply to the client", "planned"),
            ],
            handoff: None,
        }
    }

    #[test]
    fn reduces_overwhelm_to_the_current_action() -> Result<()> {
        let response = deterministic_assist("I am overwhelmed", &state())?;
        assert!(response.contains("Write the project outline"));
        assert!(response.contains("Everything else can wait"));
        Ok(())
    }

    #[test]
    fn breakdown_is_bounded_and_deterministic() -> Result<()> {
        let response = deterministic_assist("Break this down", &state())?;
        assert!(response.contains("five minutes"));
        assert!(response.contains("Write the project outline"));
        Ok(())
    }

    #[test]
    fn empty_state_still_returns_useful_local_guidance() -> Result<()> {
        let empty = WorkState {
            active_id: None,
            items: vec![],
            handoff: None,
        };
        let response = deterministic_assist("What next?", &empty)?;
        assert!(response.contains("Capture"));
        Ok(())
    }

    #[test]
    fn rejects_empty_or_oversized_input() {
        assert!(deterministic_assist("   ", &state()).is_err());
        assert!(deterministic_assist(&"x".repeat(MAX_ASSIST_INPUT + 1), &state()).is_err());
    }
}