import type { StartupStatus } from "./native";

export function renderStartupRecovery(status: StartupStatus) {
  const root = document.querySelector<HTMLElement>("#app");
  if (!root) return;

  const backupCopy = status.managedBackupCount > 0
    ? `${status.managedBackupCount} managed backup${status.managedBackupCount === 1 ? " is" : "s are"} available for recovery.`
    : "No managed backup is currently available.";

  root.innerHTML = `
    <main class="startup-recovery" aria-labelledby="startup-recovery-title">
      <section class="startup-recovery__card" role="alert">
        <p class="startup-recovery__eyebrow">B.O.B. protected your data</p>
        <h1 id="startup-recovery-title">B.O.B. could not open your saved work.</h1>
        <p class="startup-recovery__lead">
          Your existing data has not been reset or replaced. B.O.B. stopped normal startup so the original can stay intact.
        </p>
        <p class="startup-recovery__backup">${backupCopy}</p>
        <div class="startup-recovery__actions">
          <button class="button primary" type="button" data-retry-startup>Try again</button>
        </div>
        <p class="startup-recovery__note">
          Recovery is fail-closed. B.O.B. will not choose or restore a backup automatically.
        </p>
      </section>
    </main>
  `;

  root.querySelector<HTMLButtonElement>("[data-retry-startup]")?.addEventListener("click", () => {
    window.location.reload();
  });
}
