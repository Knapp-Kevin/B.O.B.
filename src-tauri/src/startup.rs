use serde::Serialize;
use std::{fs, path::Path};
use tauri::State;

const USER_BACKUP_DIR: &str = "backups";

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StartupStatus {
    mode: StartupMode,
    managed_backup_count: usize,
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
            managed_backup_count: 0,
        })
    }

    pub fn recovery_required(app_data_dir: &Path) -> Self {
        Self(StartupStatus {
            mode: StartupMode::RecoveryRequired,
            managed_backup_count: managed_backup_count(app_data_dir),
        })
    }
}

fn managed_backup_count(app_data_dir: &Path) -> usize {
    let backup_dir = app_data_dir.join(USER_BACKUP_DIR);
    let Ok(entries) = fs::read_dir(backup_dir) else {
        return 0;
    };

    entries
        .filter_map(Result::ok)
        .filter(|entry| {
            let Ok(file_type) = entry.file_type() else {
                return false;
            };
            if !file_type.is_file() {
                return false;
            }

            let name = entry.file_name();
            let Some(name) = name.to_str() else {
                return false;
            };
            name.starts_with("bob-backup-") && name.ends_with(".sqlite3")
        })
        .count()
}

#[tauri::command]
pub fn startup_status(state: State<'_, StartupState>) -> StartupStatus {
    state.0.clone()
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
        assert_eq!(state.0.managed_backup_count, 2);
        assert!(matches!(state.0.mode, StartupMode::RecoveryRequired));
        Ok(())
    }
}
