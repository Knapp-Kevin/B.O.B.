use crate::state::{HandoffSnapshot, Store, WorkItem, WorkState};
use anyhow::{Context, Result};
use serde::Serialize;
use tauri::State;

const EXPORT_SCHEMA: &str = "bob.portable-export";
const EXPORT_VERSION: u32 = 1;

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
struct PortableWorkState {
    active_item_id: Option<String>,
    items: Vec<WorkItem>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
struct PortableContinuity {
    handoff: Option<HandoffSnapshot>,
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
            items: state.items,
        },
        continuity: PortableContinuity {
            handoff: state.handoff,
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
    fn export_is_versioned_and_uses_product_terms() -> Result<()> {
        let json = export_json(sample_state())?;
        let parsed: Value = serde_json::from_str(&json)?;

        assert_eq!(parsed["schema"], EXPORT_SCHEMA);
        assert_eq!(parsed["version"], EXPORT_VERSION);
        assert_eq!(parsed["work"]["activeItemId"], "one");
        assert_eq!(parsed["work"]["items"][0]["title"], "Export this task");
        assert_eq!(
            parsed["continuity"]["handoff"]["objective"],
            "Export this task"
        );
        Ok(())
    }

    #[test]
    fn export_surface_contains_no_secret_store_fields() -> Result<()> {
        let json = export_json(sample_state())?.to_lowercase();
        assert!(!json.contains("api_key"));
        assert!(!json.contains("apikey"));
        assert!(!json.contains("credential"));
        assert!(!json.contains("secret"));
        Ok(())
    }
}