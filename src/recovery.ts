import { restartApplication, type StartupStatus } from "./native";

function bindRetry(root: HTMLElement) {
  const retry = root.querySelector<HTMLButtonElement>("[data-retry-startup]");
  const note = root.querySelector<HTMLElement>("[data-recovery-note]");
  retry?.addEventListener("click", () => {
    retry.disabled = true;
    retry.textContent = "Restarting…";

    void restartApplication().catch(() => {
      retry.disabled = false;
      retry.textContent = "Try again";
      if (note) {
        note.textContent = "B.O.B. could not restart automatically. Close and reopen B.O.B. to try again.";
      }
    });
  });
}

export function renderStartupRecovery(status: StartupStatus) {
  const root = document.querySelector<HTMLElement>("#app");
  if (!root) return;

  const backupCopy = status.managedBackupCount > 0
    ? `B.O.B. found ${status.managedBackupCount} managed backup file${status.managedBackupCount === 1 ? "" : "s"} to evaluate for recovery.`
    : "B.O.B. did not find a managed backup file to evaluate for recovery.";

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
        <p class="startup-recovery__note" data-recovery-note>
          Recovery is fail-closed. B.O.B. will not choose or restore a backup automatically.
        </p>
      </section>
    </main>
  `;

  bindRetry(root);
}

export function renderStartupStatusUnavailable() {
  const root = document.querySelector<HTMLElement>("#app");
  if (!root) return;

  root.innerHTML = `
    <main class="startup-recovery" aria-labelledby="startup-recovery-title">
      <section class="startup-recovery__card" role="alert">
        <p class="startup-recovery__eyebrow">B.O.B. stopped startup safely</p>
        <h1 id="startup-recovery-title">B.O.B. could not confirm your saved-work status.</h1>
        <p class="startup-recovery__lead">
          Normal work loading was stopped because B.O.B. could not verify whether canonical state was ready to use.
        </p>
        <p class="startup-recovery__backup">
          Backup availability could not be checked in this state. B.O.B. will not guess or restore anything automatically.
        </p>
        <div class="startup-recovery__actions">
          <button class="button primary" type="button" data-retry-startup>Try again</button>
        </div>
        <p class="startup-recovery__note" data-recovery-note>
          If automatic restart is unavailable, close and reopen B.O.B. Normal loading will be attempted again from the beginning.
        </p>
      </section>
    </main>
  `;

  bindRetry(root);
}
