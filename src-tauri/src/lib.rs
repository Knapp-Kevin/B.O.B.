mod gemini;
mod planner;
mod secrets;
mod state;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let data_dir = app.path().app_data_dir()?;
            let store = state::Store::open(&data_dir)
                .map_err(|error| std::io::Error::other(error.to_string()))?;
            let gemini = gemini::GeminiCredentials::new()
                .map_err(|error| std::io::Error::other(error.to_string()))?;
            app.manage(store);
            app.manage(gemini);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            state::load_work_state,
            state::save_work_state,
            planner::plan_remaining_work,
            planner::replan_remaining_work,
            gemini::gemini_credential_status,
            gemini::configure_gemini_credential,
            gemini::remove_gemini_credential
        ])
        .run(tauri::generate_context!())
        .expect("error while running B.O.B.");
}
