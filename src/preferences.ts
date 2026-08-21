import { applyAccessibilityPreferences, currentAccessibilityPreferences, showToast, type AccessibilityPreferences } from "./model";
import { setAccessibilityPreferences } from "./native";

let installed = false;
let writeQueue = Promise.resolve();
let durablePreferences: AccessibilityPreferences = { largerText: false, reducedMotion: false };

export function installAccessibilityPreferencePersistence() {
  if (installed) return;
  installed = true;
  durablePreferences = currentAccessibilityPreferences();

  document.addEventListener("change", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (input.id !== "larger-text" && input.id !== "reduced-motion") return;

    const requested = currentAccessibilityPreferences();
    writeQueue = writeQueue.then(async () => {
      try {
        const persisted = await setAccessibilityPreferences(requested);
        durablePreferences = persisted ?? requested;
        if (persisted) applyAccessibilityPreferences(persisted);
      } catch (error) {
        console.error("Failed to persist B.O.B. accessibility preferences", error);
        applyAccessibilityPreferences(durablePreferences);
        showToast("B.O.B. could not save that accessibility preference. The last durable setting was restored.");
        window.dispatchEvent(new Event("bob:render"));
      }
    });
  });
}
