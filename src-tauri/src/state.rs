use anyhow::{anyhow, bail, Context, Result};
use rusqlite::{params, Connection, OptionalExtension, TransactionBehavior};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashSet,
    fs,
    path::{Path, PathBuf},
    sync::Mutex,
    time::Duration,
};
use tauri::State;

const SCHEMA_VERSION: i64 = 1;
const DATABASE_NAME: &str = "bob.sqlite3";

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkItem {
    pub id: String,
    pub kind: String,
    pub title: String,
    pub estimate: Option<i64>,
    pub priority: String,
    pub due: Option<String>,
    pub status: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkState {
    pub active_id: Option<String>,
    pub items: Vec<WorkItem>,
}

pub struct Store {
    connection: Mutex<Connection>,
}

impl Store {
    pub fn open(app_data_dir: &Path) -> Result<Self> {
        fs::create_dir_all(app_data_dir)
            .with_context(|| format!("create B.O.B. app-data directory at {}", app_data_dir.display()))?;

        let db_path = app_data_dir.join(DATABASE_NAME);
        let existed_before_open = db_path.exists();
        let mut connection = Connection::open(&db_path)
            .with_context(|| format!("open canonical B.O.B. database at {}", db_path.display()))?;

        connection
            .busy_timeout(Duration::from_secs(5))
            .context("configure SQLite busy timeout")?;
        connection
            .pragma_update(None, "foreign_keys", "ON")
            .context("enable SQLite foreign keys")?;

        run_migrations(&mut connection, &db_path, existed_before_open)?;

        Ok(Self {
            connection: Mutex::new(connection),
        })
    }

    pub fn load(&self) -> Result<WorkState> {
        let connection = self
            .connection
            .lock()
            .map_err(|_| anyhow!("canonical state lock is poisoned"))?;

        let active_id = connection
            .query_row(
                "SELECT active_item_id FROM app_state WHERE singleton = 1",
                [],
                |row| row.get::<_, Option<String>>(0),
            )
            .optional()
            .context("load active B.O.B. item")?
            .flatten();

        let mut statement = connection
            .prepare(
                "SELECT id, kind, title, estimate, priority, due, status
                 FROM work_items
                 ORDER BY sort_order ASC, id ASC",
            )
            .context("prepare canonical work-state query")?;

        let rows = statement
            .query_map([], |row| {
                Ok(WorkItem {
                    id: row.get(0)?,
                    kind: row.get(1)?,
                    title: row.get(2)?,
                    estimate: row.get(3)?,
                    priority: row.get(4)?,
                    due: row.get(5)?,
                    status: row.get(6)?,
                })
            })
            .context("read canonical work-state rows")?;

        let items = rows
            .collect::<std::result::Result<Vec<_>, _>>()
            .context("decode canonical work-state rows")?;
        let state = WorkState { active_id, items };
        validate_work_state(&state)?;
        Ok(state)
    }

    pub fn save(&self, state: &WorkState) -> Result<()> {
        validate_work_state(state)?;

        let mut connection = self
            .connection
            .lock()
            .map_err(|_| anyhow!("canonical state lock is poisoned"))?;
        let transaction = connection
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .context("begin canonical work-state transaction")?;

        transaction
            .execute("DELETE FROM work_items", [])
            .context("replace canonical work items")?;

        for (sort_order, item) in state.items.iter().enumerate() {
            transaction
                .execute(
                    "INSERT INTO work_items
                        (id, kind, title, estimate, priority, due, status, sort_order)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                    params![
                        item.id,
                        item.kind,
                        item.title,
                        item.estimate,
                        item.priority,
                        item.due,
                        item.status,
                        sort_order as i64,
                    ],
                )
                .with_context(|| format!("persist work item {}", item.id))?;
        }

        transaction
            .execute(
                "INSERT INTO app_state (singleton, active_item_id)
                 VALUES (1, ?1)
                 ON CONFLICT(singleton) DO UPDATE SET active_item_id = excluded.active_item_id",
                params![state.active_id.as_deref()],
            )
            .context("persist active B.O.B. item")?;

        transaction
            .commit()
            .context("commit canonical work-state transaction")?;
        Ok(())
    }
}

#[tauri::command]
pub fn load_work_state(store: State<'_, Store>) -> std::result::Result<WorkState, String> {
    store.load().map_err(|error| error.to_string())
}

#[tauri::command]
pub fn save_work_state(
    store: State<'_, Store>,
    work_state: WorkState,
) -> std::result::Result<WorkState, String> {
    store.save(&work_state).map_err(|error| error.to_string())?;
    store.load().map_err(|error| error.to_string())
}

fn validate_work_state(state: &WorkState) -> Result<()> {
    let mut ids = HashSet::new();

    for item in &state.items {
        if item.id.trim().is_empty() || item.id.len() > 128 {
            bail!("work item id is missing or too long");
        }
        if !ids.insert(item.id.as_str()) {
            bail!("duplicate work item id: {}", item.id);
        }
        if item.title.trim().is_empty() || item.title.len() > 500 {
            bail!("work item {} has an invalid title", item.id);
        }
        if !matches!(item.kind.as_str(), "task" | "idea" | "note" | "reminder") {
            bail!("work item {} has an invalid kind", item.id);
        }
        if !matches!(item.priority.as_str(), "low" | "normal" | "high") {
            bail!("work item {} has an invalid priority", item.id);
        }
        if !matches!(
            item.status.as_str(),
            "inbox" | "planned" | "doing" | "done" | "deferred"
        ) {
            bail!("work item {} has an invalid status", item.id);
        }
        if item.estimate.is_some_and(|estimate| estimate <= 0 || estimate > 10_080) {
            bail!("work item {} has an invalid estimate", item.id);
        }
        if item.due.as_ref().is_some_and(|due| due.len() > 200) {
            bail!("work item {} has an invalid due value", item.id);
        }
    }

    if let Some(active_id) = &state.active_id {
        if !ids.contains(active_id.as_str()) {
            bail!("active work item does not exist in canonical state");
        }
    }

    Ok(())
}

fn run_migrations(connection: &mut Connection, db_path: &Path, existed_before_open: bool) -> Result<()> {
    let version = user_version(connection)?;
    if version > SCHEMA_VERSION {
        bail!(
            "canonical state schema {} is newer than supported schema {}; refusing destructive downgrade",
            version,
            SCHEMA_VERSION
        );
    }

    if version == SCHEMA_VERSION {
        quick_check(connection)?;
        return Ok(());
    }

    if existed_before_open && fs::metadata(db_path).map(|meta| meta.len()).unwrap_or(0) > 0 {
        quick_check(connection)?;
        create_pre_migration_safety_copy(connection, db_path)?;
    }

    let transaction = connection
        .transaction_with_behavior(TransactionBehavior::Immediate)
        .context("begin schema migration transaction")?;

    match version {
        0 => transaction
            .execute_batch(
                "CREATE TABLE IF NOT EXISTS work_items (
                    id TEXT PRIMARY KEY NOT NULL,
                    kind TEXT NOT NULL,
                    title TEXT NOT NULL,
                    estimate INTEGER,
                    priority TEXT NOT NULL,
                    due TEXT,
                    status TEXT NOT NULL,
                    sort_order INTEGER NOT NULL
                );

                CREATE TABLE IF NOT EXISTS app_state (
                    singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
                    active_item_id TEXT REFERENCES work_items(id) ON DELETE SET NULL
                );

                INSERT OR IGNORE INTO app_state (singleton, active_item_id) VALUES (1, NULL);
                PRAGMA user_version = 1;",
            )
            .context("apply schema migration 1")?,
        other => bail!("no migration path exists from schema version {}", other),
    }

    transaction.commit().context("commit schema migration")?;

    let resulting_version = user_version(connection)?;
    if resulting_version != SCHEMA_VERSION {
        bail!(
            "schema migration ended at version {}, expected {}",
            resulting_version,
            SCHEMA_VERSION
        );
    }
    quick_check(connection)?;
    Ok(())
}

fn user_version(connection: &Connection) -> Result<i64> {
    connection
        .pragma_query_value(None, "user_version", |row| row.get(0))
        .context("read SQLite schema version")
}

fn quick_check(connection: &Connection) -> Result<()> {
    let result: String = connection
        .query_row("PRAGMA quick_check", [], |row| row.get(0))
        .context("run SQLite quick_check")?;
    if result != "ok" {
        bail!("SQLite integrity check failed: {}", result);
    }
    Ok(())
}

fn create_pre_migration_safety_copy(connection: &Connection, db_path: &Path) -> Result<()> {
    let parent = db_path
        .parent()
        .ok_or_else(|| anyhow!("canonical database path has no parent directory"))?;
    let recovery_dir = parent.join("recovery");
    fs::create_dir_all(&recovery_dir).context("create recovery directory")?;

    let newest = recovery_dir.join("bob-pre-migration-1.sqlite3");
    let older = recovery_dir.join("bob-pre-migration-2.sqlite3");

    if older.exists() {
        fs::remove_file(&older).context("remove oldest pre-migration safety copy")?;
    }
    if newest.exists() {
        fs::rename(&newest, &older).context("rotate pre-migration safety copies")?;
    }

    let target = path_for_sqlite(&newest)?;
    connection
        .execute("VACUUM INTO ?1", params![target])
        .context("create SQLite-consistent pre-migration safety copy")?;
    Ok(())
}

fn path_for_sqlite(path: &PathBuf) -> Result<String> {
    path.to_str()
        .map(ToOwned::to_owned)
        .ok_or_else(|| anyhow!("SQLite backup path is not valid Unicode"))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_state() -> WorkState {
        WorkState {
            active_id: Some("one".into()),
            items: vec![WorkItem {
                id: "one".into(),
                kind: "task".into(),
                title: "First durable task".into(),
                estimate: Some(15),
                priority: "high".into(),
                due: Some("Today".into()),
                status: "planned".into(),
            }],
        }
    }

    #[test]
    fn round_trips_work_state() -> Result<()> {
        let directory = tempfile::tempdir()?;
        let store = Store::open(directory.path())?;
        let expected = sample_state();

        store.save(&expected)?;

        assert_eq!(store.load()?, expected);
        Ok(())
    }

    #[test]
    fn rejects_unknown_active_item() -> Result<()> {
        let directory = tempfile::tempdir()?;
        let store = Store::open(directory.path())?;
        let mut invalid = sample_state();
        invalid.active_id = Some("missing".into());

        assert!(store.save(&invalid).is_err());
        assert!(store.load()?.items.is_empty());
        Ok(())
    }

    #[test]
    fn creates_consistent_safety_copy_before_migrating_existing_database() -> Result<()> {
        let directory = tempfile::tempdir()?;
        let db_path = directory.path().join(DATABASE_NAME);
        let legacy = Connection::open(&db_path)?;
        legacy.execute("CREATE TABLE legacy_marker (value TEXT NOT NULL)", [])?;
        legacy.execute("INSERT INTO legacy_marker (value) VALUES ('keep-me')", [])?;
        drop(legacy);

        let _store = Store::open(directory.path())?;

        let safety_copy = directory
            .path()
            .join("recovery")
            .join("bob-pre-migration-1.sqlite3");
        assert!(safety_copy.exists());
        let copy = Connection::open(safety_copy)?;
        let marker: String = copy.query_row("SELECT value FROM legacy_marker", [], |row| row.get(0))?;
        assert_eq!(marker, "keep-me");
        Ok(())
    }
}
