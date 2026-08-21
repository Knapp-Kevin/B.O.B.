import { invoke } from "@tauri-apps/api/core";
import type { GeminiCredentialStatus, PersistentWorkState, PlanProjection, ReplanResult } from "./model";

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

export async function planRemainingWork(): Promise<PlanProjection | null> {
  if (!isTauriRuntime()) return null;
  return invoke<PlanProjection>("plan_remaining_work");
}

export async function replanRemainingWork(): Promise<ReplanResult | null> {
  if (!isTauriRuntime()) return null;
  return invoke<ReplanResult>("replan_remaining_work");
}

export async function applyNextActionProposal(targetId: string): Promise<ReplanResult | null> {
  if (!isTauriRuntime()) return null;
  return invoke<ReplanResult>("apply_next_action_proposal", { targetId });
}

export async function assistWithBob(input: string): Promise<string | null> {
  if (!isTauriRuntime()) return null;
  return invoke<string>("bob_assist", { input });
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
