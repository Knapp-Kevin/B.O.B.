import "./styles.css";
import { render } from "./controller";
import { hydratePersistentWorkState, persistentWorkState, state } from "./model";
import { loadGeminiCredentialStatus, loadPersistentWorkState, savePersistentWorkState } from "./native";

async function bootstrap() {
  const workState = loadPersistentWorkState()
    .then(async (durable) => {
      if (durable && !hydratePersistentWorkState(durable)) {
        await savePersistentWorkState(persistentWorkState());
      }
    })
    .catch((error) => console.error("Failed to load durable B.O.B. work state", error));

  const geminiStatus = loadGeminiCredentialStatus()
    .then((status) => {
      state.gemini = status;
      state.geminiStaged = status.validation === "ready";
    })
    .catch((error) => console.error("Failed to load Gemini credential status", error));

  await Promise.all([workState, geminiStatus]);
  render();
}

void bootstrap();
