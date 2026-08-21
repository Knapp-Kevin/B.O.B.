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

    let stamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .context("system clock is before Unix epoch")?
        .as_nanos();
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

fn quick_check_path(path: &Path) -> Result<()> {
    let connection = Connection::open_with_flags(path, OpenFlags::SQLITE_OPEN_READ_ONLY)
        .with_context(|| format!("open SQLite snapshot read-only at {}", path.display()))?;
    let result: String = connection
        .query_row("PRAGMA quick_check", [], |row| row.get(0))
        .context("run SQLite quick_check")?;
    if result != "ok" {
        bail!("SQLite integrity check failed: {result}");
    }
    Ok(())
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

    #[test]
    fn creates_verified_sqlite_consistent_user_backup() -> Result<()> {
        let directory = tempfile::tempdir()?;
        let source_path = directory.path().join(DATABASE_NAME);
        let source = Connection::open(&source_path)?;
        source.execute("CREATE TABLE marker (value TEXT NOT NULL)", [])?;
        source.execute("INSERT INTO marker (value) VALUES ('preserved')", [])?;
        source.pragma_update(None, "user_version", 3)?;
        drop(source);

        let backup_path = create_user_backup(directory.path())?;
        let expected_dir = directory.path().join(USER_BACKUP_DIR);

        assert!(backup_path.is_file());
        assert_eq!(backup_path.parent(), Some(expected_dir.as_path()));
        assert!(!backup_path
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or_default()
            .contains("pending"));

        let backup = Connection::open(&backup_path)?;
        let marker: String = backup.query_row("SELECT value FROM marker", [], |row| row.get(0))?;
        let version: i64 = backup.pragma_query_value(None, "user_version", |row| row.get(0))?;
        assert_eq!(marker, "preserved");
        assert_eq!(version, 3);
        quick_check_path(&backup_path)?;
        Ok(())
    }
}
