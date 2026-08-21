import "./styles.css";
import { render } from "./controller";
import { applyPlanProjection, hydratePersistentWorkState, state } from "./model";
import { loadGeminiCredentialStatus, loadPersistentWorkState, planRemainingWork } from "./native";

async function bootstrap() {
  try {
    const durable = await loadPersistentWorkState();
    if (durable) hydratePersistentWorkState(durable);
  } catch (error) {
    console.error("Failed to load durable B.O.B. work state", error);
  }

  render();

  void planRemainingWork()
    .then((plan) => {
      if (!plan) return;
      applyPlanProjection(plan);
      render();
    })
    .catch((error) => console.error("Failed to load deterministic B.O.B. plan projection", error));

  void loadGeminiCredentialStatus()
    .then((status) => {
      state.gemini = status;
      state.geminiStaged = status.validation === "ready";
      render();
    })
    .catch((error) => console.error("Failed to refresh Gemini credential status", error));
}

void bootstrap();
