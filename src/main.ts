import "./styles.css";
import { render } from "./controller";
import { hydratePersistentWorkState, persistentWorkState } from "./model";
import { loadPersistentWorkState, savePersistentWorkState } from "./native";

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
}

void bootstrap();
