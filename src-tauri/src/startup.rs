use serde::Serialize;
use std::{fs, io::ErrorKind, path::Path};
use tauri::{AppHandle, State};

const USER_BACKUP_DIR: &str = "backups";

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StartupStatus {
    mode: StartupMode,
    managed_backup_count: Option<usize>,
}

#[derive(Clone, Copy, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
enum StartupMode {
    Ready,
    RecoveryRequired,
}

#[derive(Clone, Debug)]
pub struct StartupState(StartupStatus);

impl StartupState {
    pub fn ready() -> Self {
        Self(StartupStatus {
            mode: StartupMode::Ready,
            managed_backup_count: Some(0),
        })
    }

    pub fn recovery_required(app_data_dir: &Path) -> Self {
        Self(StartupStatus {
            mode: StartupMode::RecoveryRequired,
            managed_backup_count: managed_backup_count(app_data_dir),
        })
    }
}

fn managed_backup_count(app_data_dir: &Path) -> Option<usize> {
    let backup_dir = app_data_dir.join(USER_BACKUP_DIR);
    let entries = match fs::read_dir(backup_dir) {
        Ok(entries) => entries,
        Err(error) if error.kind() == ErrorKind::NotFound => return Some(0),
        Err(_) => return None,
    };

    let mut count = 0;
    for entry in entries {
        let Ok(entry) = entry else {
            return None;
        };
        let Ok(file_type) = entry.file_type() else {
            return None;
        };
        if !file_type.is_file() {
            continue;
        }

        let name = entry.file_name();
        let Some(name) = name.to_str() else {
            continue;
        };
        if name.starts_with("bob-backup-") && name.ends_with(".sqlite3") {
            count += 1;
        }
    }
    Some(count)
}

#[tauri::command]
pub fn startup_status(state: State<'_, StartupState>) -> StartupStatus {
    state.0.clone()
}

#[tauri::command]
pub fn restart_application(app: AppHandle) {
    // A webview reload would preserve the immutable StartupState created during Tauri setup and
    // could never recover from a transient Store-open failure. Restart the process so setup runs
    // again and canonical state is re-evaluated from disk.
    app.restart();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn recovery_status_counts_only_regular_managed_backup_files() -> anyhow::Result<()> {
        let directory = tempfile::tempdir()?;
        let backups = directory.path().join(USER_BACKUP_DIR);
        fs::create_dir_all(&backups)?;
        fs::write(backups.join("bob-backup-1.sqlite3"), b"one")?;
        fs::write(backups.join("bob-backup-2.sqlite3"), b"two")?;
        fs::write(backups.join("notes.txt"), b"ignore")?;
        fs::create_dir(backups.join("bob-backup-directory.sqlite3"))?;

        let state = StartupState::recovery_required(directory.path());
        assert_eq!(state.0.managed_backup_count, Some(2));
        assert!(matches!(state.0.mode, StartupMode::RecoveryRequired));
        Ok(())
    }

    #[test]
    fn recovery_status_reports_zero_when_backup_directory_does_not_exist() -> anyhow::Result<()> {
        let directory = tempfile::tempdir()?;
        let state = StartupState::recovery_required(directory.path());
        assert_eq!(state.0.managed_backup_count, Some(0));
        Ok(())
    }

    #[test]
    fn recovery_status_reports_unknown_when_backup_directory_cannot_be_read() -> anyhow::Result<()>
    {
        let directory = tempfile::tempdir()?;
        fs::write(directory.path().join(USER_BACKUP_DIR), b"not a directory")?;

        let state = StartupState::recovery_required(directory.path());
        assert_eq!(state.0.managed_backup_count, None);
        Ok(())
    }
}
