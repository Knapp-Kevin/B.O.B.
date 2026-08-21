mod state;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let data_dir = app.path().app_data_dir()?;
            let store = state::Store::open(&data_dir)
                .map_err(|error| std::io::Error::other(error.to_string()))?;
            app.manage(store);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            state::load_work_state,
            state::save_work_state
        ])
        .run(tauri::generate_context!())
        .expect("error while running B.O.B.");
}
