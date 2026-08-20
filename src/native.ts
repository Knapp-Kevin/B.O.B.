import { invoke } from "@tauri-apps/api/core";
import type { GeminiCredentialStatus, PersistentWorkState } from "./model";

const isTauriRuntime = () => "__TAURI_INTERNALS__" in window;
const browserGeminiStatus: GeminiCredentialStatus = { configured: false, validation: "notConfigured" };

export async function loadPersistentWorkState(): Promise<PersistentWorkState | null> {
  if (!isTauriRuntime()) return null;
  return invoke<PersistentWorkState>("load_work_state");
}

export async function savePersistentWorkState(workState: PersistentWorkState): Promise<PersistentWorkState | null> {
  if (!isTauriRuntime()) return null;
  return invoke<PersistentWorkState>("save_work_state", { workState });
}

export async function loadGeminiCredentialStatus(): Promise<GeminiCredentialStatus> {
  if (!isTauriRuntime()) return browserGeminiStatus;
  return invoke<GeminiCredentialStatus>("gemini_credential_status");
}

export async function configureGeminiCredential(apiKey: string): Promise<GeminiCredentialStatus> {
  if (!isTauriRuntime()) return browserGeminiStatus;
  return invoke<GeminiCredentialStatus>("configure_gemini_credential", { apiKey });
}

export async function removeGeminiCredential(): Promise<GeminiCredentialStatus> {
  if (!isTauriRuntime()) return browserGeminiStatus;
  return invoke<GeminiCredentialStatus>("remove_gemini_credential");
}
