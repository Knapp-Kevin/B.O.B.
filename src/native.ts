import { invoke } from "@tauri-apps/api/core";
import type { PersistentWorkState } from "./model";

const isTauriRuntime = () => "__TAURI_INTERNALS__" in window;

export async function loadPersistentWorkState(): Promise<PersistentWorkState | null> {
  if (!isTauriRuntime()) return null;
  return invoke<PersistentWorkState>("load_work_state");
}

export async function savePersistentWorkState(workState: PersistentWorkState): Promise<PersistentWorkState | null> {
  if (!isTauriRuntime()) return null;
  return invoke<PersistentWorkState>("save_work_state", { workState });
}
