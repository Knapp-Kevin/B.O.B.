use crate::state::Store;
use anyhow::{anyhow, bail, Context, Result};
use rusqlite::{Connection, OpenFlags, MAIN_DB};
use std::{
    fs,
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};
use tauri::{AppHandle, Manager};

const DATABASE_NAME: &str = "bob.sqlite3";
const USER_BACKUP_DIR: &str = "backups";
const RESTORE_VALIDATION_DIR: &str = "restore-validation";

pub fn create_user_backup(app_data_dir: &Path) -> Result<PathBuf> {
    let source_path = app_data_dir.join(DATABASE_NAME);
    if !source_path.is_file() {
        bail!(
            "canonical B.O.B. database does not exist at {}",
            source_path.display()
        );
    }

    let backup_dir = app_data_dir.join(USER_BACKUP_DIR);
    fs::create_dir_all(&backup_dir)
        .with_context(|| format!("create user-backup directory at {}", backup_dir.display()))?;

    let stamp = unique_stamp()?;
    let pending = backup_dir.join(format!(".bob-backup-{stamp}.pending.sqlite3"));
    let completed = backup_dir.join(format!("bob-backup-{stamp}.sqlite3"));

    let result = (|| {
        let source = Connection::open_with_flags(&source_path, OpenFlags::SQLITE_OPEN_READ_ONLY)
            .with_context(|| format!("open canonical B.O.B. database read-only at {}", source_path.display()))?;
        source
            .backup(MAIN_DB, &pending, None)
            .context("create SQLite-consistent user backup")?;
        quick_check_path(&pending).context("verify completed user backup")?;
        fs::rename(&pending, &completed).context("promote verified user backup")?;
        Ok(completed.clone())
    })();

    if result.is_err() && pending.exists() {
        let _ = fs::remove_file(&pending);
    }

    result
}

/// Validate a candidate user backup without mutating canonical state.
///
/// The candidate is opened read-only, integrity checked, required B.O.B. tables are verified,
/// then copied through SQLite's backup API into an app-owned disposable staging directory.
/// `Store::open` performs the real schema compatibility/migration checks against the staging
/// copy, and normal state loads prove that the migrated snapshot is decodable by this build.
pub fn validate_user_backup_candidate(app_data_dir: &Path, candidate: &Path) -> Result<()> {
    if !candidate.is_file() {
        bail!("restore candidate does not exist at {}", candidate.display());
    }

    let source = Connection::open_with_flags(candidate, OpenFlags::SQLITE_OPEN_READ_ONLY)
        .with_context(|| format!("open restore candidate read-only at {}", candidate.display()))?;
    quick_check(&source).context("verify restore-candidate SQLite integrity")?;

    if !table_exists(&source, "work_items")? || !table_exists(&source, "app_state")? {
        bail!("restore candidate is not a recognized B.O.B. canonical-state backup");
    }

    let validation_root = app_data_dir.join(RESTORE_VALIDATION_DIR);
    fs::create_dir_all(&validation_root).with_context(|| {
        format!(
            "create restore-validation directory at {}",
            validation_root.display()
        )
    })?;

    let validation_dir = validation_root.join(format!("candidate-{}", unique_stamp()?));
    fs::create_dir(&validation_dir).context("create isolated restore-validation workspace")?;
    let staged_database = validation_dir.join(DATABASE_NAME);

    let result = (|| {
        source
            .backup(MAIN_DB, &staged_database, None)
            .context("stage restore candidate through SQLite backup API")?;
        quick_check_path(&staged_database).context("verify staged restore candidate")?;

        let store = Store::open(&validation_dir)
            .context("validate restore candidate schema and migrations")?;
        store
            .load()
            .context("validate restored canonical work state")?;
        store
            .load_accessibility_preferences()
            .context("validate restored accessibility preferences")?;
        Ok(())
    })();

    // The validation workspace is disposable. A cleanup failure is relevant only when validation
    // otherwise succeeded; it must never hide the actual candidate-validation error.
    match fs::remove_dir_all(&validation_dir) {
        Ok(()) => result,
        Err(error) if result.is_ok() => Err(error).context("remove restore-validation workspace"),
        Err(_) => result,
    }
}

fn table_exists(connection: &Connection, table: &str) -> Result<bool> {
    let count: i64 = connection
        .query_row(
            "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = ?1",
            [table],
            |row| row.get(0),
        )
        .context("inspect restore-candidate schema")?;
    Ok(count == 1)
}

fn unique_stamp() -> Result<u128> {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .context("system clock is before Unix epoch")
        .map(|duration| duration.as_nanos())
}

fn quick_check(connection: &Connection) -> Result<()> {
    let result: String = connection
        .query_row("PRAGMA quick_check", [], |row| row.get(0))
        .context("run SQLite quick_check")?;
    if result != "ok" {
        bail!("SQLite integrity check failed: {result}");
    }
    Ok(())
}

fn quick_check_path(path: &Path) -> Result<()> {
    let connection = Connection::open_with_flags(path, OpenFlags::SQLITE_OPEN_READ_ONLY)
        .with_context(|| format!("open SQLite snapshot read-only at {}", path.display()))?;
    quick_check(&connection)
}

#[tauri::command]
pub fn create_user_backup_command(app: AppHandle) -> std::result::Result<String, String> {
    let app_data_dir = app.path().app_data_dir().map_err(|error| error.to_string())?;
    create_user_backup(&app_data_dir)
        .and_then(|path| {
            path.to_str()
                .map(ToOwned::to_owned)
                .ok_or_else(|| anyhow!("user backup path is not valid Unicode"))
        })
        .map_err(|error| error.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_bob_v3_database(path: &Path) -> Result<()> {
        let connection = Connection::open(path)?;
        connection.execute_batch(
            "CREATE TABLE work_items (
                id TEXT PRIMARY KEY NOT NULL,
                kind TEXT NOT NULL,
                title TEXT NOT NULL,
                estimate INTEGER,
                priority TEXT NOT NULL,
                due TEXT,
                status TEXT NOT NULL,
                sort_order INTEGER NOT NULL
             );
             CREATE TABLE app_state (
                singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
                active_item_id TEXT REFERENCES work_items(id) ON DELETE SET NULL,
                handoff_objective TEXT,
                handoff_state TEXT,
                handoff_next TEXT,
                larger_text INTEGER NOT NULL DEFAULT 0 CHECK (larger_text IN (0, 1)),
                reduced_motion INTEGER NOT NULL DEFAULT 0 CHECK (reduced_motion IN (0, 1))
             );
             INSERT INTO work_items
                (id, kind, title, estimate, priority, due, status, sort_order)
             VALUES ('one', 'task', 'Preserved task', 15, 'high', 'Today', 'planned', 0);
             INSERT INTO app_state
                (singleton, active_item_id, handoff_objective, handoff_state, handoff_next, larger_text, reduced_motion)
             VALUES (1, 'one', 'Preserved objective', 'In progress', 'Continue safely', 1, 1);
             PRAGMA user_version = 3;",
        )?;
        Ok(())
    }

    #[test]
    fn creates_and_validates_bob_user_backup() -> Result<()> {
        let directory = tempfile::tempdir()?;
        let source_path = directory.path().join(DATABASE_NAME);
        create_bob_v3_database(&source_path)?;

        let backup_path = create_user_backup(directory.path())?;
        let expected_dir = directory.path().join(USER_BACKUP_DIR);

        assert!(backup_path.is_file());
        assert_eq!(backup_path.parent(), Some(expected_dir.as_path()));
        assert!(!backup_path
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or_default()
            .contains("pending"));
        validate_user_backup_candidate(directory.path(), &backup_path)?;
        Ok(())
    }

    #[test]
    fn rejects_non_bob_sqlite_without_mutating_canonical_state() -> Result<()> {
        let directory = tempfile::tempdir()?;
        let canonical = directory.path().join(DATABASE_NAME);
        create_bob_v3_database(&canonical)?;

        let candidate = directory.path().join("foreign.sqlite3");
        let foreign = Connection::open(&candidate)?;
        foreign.execute("CREATE TABLE unrelated (value TEXT NOT NULL)", [])?;
        drop(foreign);

        assert!(validate_user_backup_candidate(directory.path(), &candidate).is_err());

        let store = Store::open(directory.path())?;
        let state = store.load()?;
        assert_eq!(state.active_id.as_deref(), Some("one"));
        assert_eq!(state.items[0].title, "Preserved task");
        Ok(())
    }

    #[test]
    fn rejects_newer_schema_without_mutating_canonical_state() -> Result<()> {
        let directory = tempfile::tempdir()?;
        let canonical = directory.path().join(DATABASE_NAME);
        create_bob_v3_database(&canonical)?;

        let candidate = directory.path().join("future.sqlite3");
        create_bob_v3_database(&candidate)?;
        let future = Connection::open(&candidate)?;
        future.pragma_update(None, "user_version", 999)?;
        drop(future);

        assert!(validate_user_backup_candidate(directory.path(), &candidate).is_err());

        let store = Store::open(directory.path())?;
        let state = store.load()?;
        assert_eq!(state.active_id.as_deref(), Some("one"));
        assert_eq!(state.items[0].title, "Preserved task");
        Ok(())
    }
}