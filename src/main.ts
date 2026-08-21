import "./styles.css";
import { render } from "./controller";
import { hydratePersistentWorkState, persistentWorkState, state } from "./model";
import { loadGeminiCredentialStatus, loadPersistentWorkState, savePersistentWorkState } from "./native";

async function bootstrap() {
  try {
    const durable = await loadPersistentWorkState();
    if (durable && !hydratePersistentWorkState(durable)) {
      await savePersistentWorkState(persistentWorkState());
    }
  } catch (error) {
    console.error("Failed to load durable B.O.B. work state", error);
  }

  render();

  void loadGeminiCredentialStatus()
    .then((status) => {
      state.gemini = status;
      state.geminiStaged = status.validation === "ready";
      render();
    })
    .catch((error) => console.error("Failed to refresh Gemini credential status", error));
}

void bootstrap();
