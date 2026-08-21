use crate::state::{HandoffSnapshot, Store, WorkItem, WorkState};
use anyhow::{Context, Result};
use serde::Serialize;
use tauri::State;

const EXPORT_SCHEMA: &str = "bob.portable-export";
const EXPORT_VERSION: u32 = 1;

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
struct PortableWorkItem {
    id: String,
    kind: String,
    title: String,
    estimate: Option<u32>,
    priority: String,
    due: Option<String>,
    status: String,
}

impl From<WorkItem> for PortableWorkItem {
    fn from(item: WorkItem) -> Self {
        Self {
            id: item.id,
            kind: item.kind,
            title: item.title,
            estimate: item.estimate,
            priority: item.priority,
            due: item.due,
            status: item.status,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
struct PortableWorkState {
    active_item_id: Option<String>,
    items: Vec<PortableWorkItem>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
struct PortableHandoff {
    objective: String,
    state: String,
    next: String,
}

impl From<HandoffSnapshot> for PortableHandoff {
    fn from(handoff: HandoffSnapshot) -> Self {
        Self {
            objective: handoff.objective,
            state: handoff.state,
            next: handoff.next,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
struct PortableContinuity {
    handoff: Option<PortableHandoff>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
struct PortableExport {
    schema: &'static str,
    version: u32,
    work: PortableWorkState,
    continuity: PortableContinuity,
}

fn build_export(state: WorkState) -> PortableExport {
    PortableExport {
        schema: EXPORT_SCHEMA,
        version: EXPORT_VERSION,
        work: PortableWorkState {
            active_item_id: state.active_id,
            items: state.items.into_iter().map(PortableWorkItem::from).collect(),
        },
        continuity: PortableContinuity {
            handoff: state.handoff.map(PortableHandoff::from),
        },
    }
}

pub fn export_json(state: WorkState) -> Result<String> {
    serde_json::to_string_pretty(&build_export(state)).context("serialize B.O.B. portable export")
}

#[tauri::command]
pub fn export_portable_state(store: State<'_, Store>) -> std::result::Result<String, String> {
    let state = store.load().map_err(|error| error.to_string())?;
    export_json(state).map_err(|error| error.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::Value;

    fn sample_state() -> WorkState {
        WorkState {
            active_id: Some("one".into()),
            items: vec![WorkItem {
                id: "one".into(),
                kind: "task".into(),
                title: "Export this task".into(),
                estimate: Some(20),
                priority: "high".into(),
                due: Some("Today".into()),
                status: "planned".into(),
            }],
            handoff: Some(HandoffSnapshot {
                objective: "Export this task".into(),
                state: "Ready".into(),
                next: "Continue from the exported handoff".into(),
            }),
        }
    }

    #[test]
    fn export_is_versioned_and_uses_explicit_product_terms() -> Result<()> {
        let json = export_json(sample_state())?;
        let parsed: Value = serde_json::from_str(&json)?;

        assert_eq!(parsed["schema"], EXPORT_SCHEMA);
        assert_eq!(parsed["version"], EXPORT_VERSION);
        assert_eq!(parsed["work"]["activeItemId"], "one");
        assert_eq!(parsed["work"]["items"][0]["id"], "one");
        assert_eq!(parsed["work"]["items"][0]["kind"], "task");
        assert_eq!(parsed["work"]["items"][0]["title"], "Export this task");
        assert_eq!(parsed["work"]["items"][0]["estimate"], 20);
        assert_eq!(parsed["work"]["items"][0]["priority"], "high");
        assert_eq!(parsed["work"]["items"][0]["due"], "Today");
        assert_eq!(parsed["work"]["items"][0]["status"], "planned");
        assert_eq!(
            parsed["continuity"]["handoff"]["objective"],
            "Export this task"
        );
        assert_eq!(parsed["continuity"]["handoff"]["state"], "Ready");
        assert_eq!(
            parsed["continuity"]["handoff"]["next"],
            "Continue from the exported handoff"
        );
        Ok(())
    }

    fn assert_no_secret_schema_keys(value: &Value) {
        match value {
            Value::Object(object) => {
                for (key, nested) in object {
                    let normalized = key.to_lowercase();
                    assert!(!normalized.contains("api_key"));
                    assert!(!normalized.contains("apikey"));
                    assert!(!normalized.contains("credential"));
                    assert!(!normalized.contains("secret"));
                    assert_no_secret_schema_keys(nested);
                }
            }
            Value::Array(values) => {
                for nested in values {
                    assert_no_secret_schema_keys(nested);
                }
            }
            _ => {}
        }
    }

    #[test]
    fn export_schema_contains_no_secret_store_fields() -> Result<()> {
        let parsed: Value = serde_json::from_str(&export_json(sample_state())?)?;
        assert_no_secret_schema_keys(&parsed);
        Ok(())
    }

    #[test]
    fn user_content_is_not_mistaken_for_secret_schema() -> Result<()> {
        let mut state = sample_state();
        state.items[0].title = "Rotate credential for secret project".into();
        state.handoff.as_mut().unwrap().objective = "Review API key handling".into();

        let json = export_json(state)?;
        let parsed: Value = serde_json::from_str(&json)?;
        assert_eq!(
            parsed["work"]["items"][0]["title"],
            "Rotate credential for secret project"
        );
        assert_no_secret_schema_keys(&parsed);
        Ok(())
    }
}
