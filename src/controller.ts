import { activeItem, applyPlanProjection, escapeHtml, focusItems, hydratePersistentWorkState, persistentWorkState, showToast, state, type ItemKind, type Route, type SetupStep } from "./model";
import { applyNextActionProposal, configureGeminiCredential, loadPersistentWorkState, planRemainingWork, removeGeminiCredential, replanRemainingWork, savePersistentWorkState } from "./native";
import { renderShell } from "./views";

const root = document.querySelector<HTMLDivElement>("#app")!;
if (!root) throw new Error("Missing app root");

const replyFor = (input: string) => {
  const lower = input.toLowerCase();
  if (lower.includes("handoff") || lower.includes("resume later") || lower.includes("save my place")) return `Handoff: ${activeItem().title}. Current state: ${activeItem().status}. Next: spend five minutes reopening the context and identifying the first concrete change.`;
  if (lower.includes("overwhelm") || lower.includes("too much")) return `Keep only this: ${activeItem().title}. Everything else can wait.`;
  if (lower.includes("wait") || lower.includes("confus") || lower.includes("reorient") || lower.includes("what?")) return `Short version: ${activeItem().title} is the next useful move. You do not need to solve the rest right now.`;
  if (lower.includes("decid") || lower.includes("priorit")) return "I can research facts, but I should not invent your preference. The decision in front of you is: what outcome matters most today?";
  if (lower.includes("break")) return `Start smaller: open the material for “${activeItem().title}” and spend five minutes identifying the first concrete change.`;
  if (lower.includes("organize") || lower.includes("inbox")) return "I found one likely next action in the inbox. I’ll preview the change before touching your work state.";
  return `The next useful move still looks like “${activeItem().title}.” If that is wrong, tell me what changed and I’ll reorient.`;
};

const queueRender = () => render();
window.addEventListener("bob:render", queueRender);

export function render() {
  root.innerHTML = renderShell();
  bindEvents();
}

function applyBrowserFallbackPlan() {
  state.focusIds = [];
  const focus = focusItems();
  state.focusIds = focus.map((item) => item.id);
  const current = state.items.find((item) => item.id === state.activeId);
  if ((!current || !["doing", "planned"].includes(current.status)) && focus[0]) state.activeId = focus[0].id;
}

async function refreshPlanProjection() {
  try {
    const plan = await planRemainingWork();
    if (plan) applyPlanProjection(plan);
    else applyBrowserFallbackPlan();
  } catch (error) {
    console.error("Failed to refresh deterministic B.O.B. plan projection", error);
  }
}

async function commitWorkState(successMessage?: string) {
  try {
    const durable = await savePersistentWorkState(persistentWorkState());
    if (durable) hydratePersistentWorkState(durable);
    await refreshPlanProjection();
    if (successMessage) showToast(successMessage);
  } catch (error) {
    console.error("Failed to persist B.O.B. work state", error);
    try {
      const durable = await loadPersistentWorkState();
      if (durable) hydratePersistentWorkState(durable);
      await refreshPlanProjection();
    } catch (reloadError) {
      console.error("Failed to restore last durable B.O.B. work state", reloadError);
    }
    showToast("Could not save that change. B.O.B. kept the last durable work state where possible.");
  }
  render();
}

function pushConversation(text: string) {
  state.chat.push({ author: "user", text }, { author: "bob", text: replyFor(text) });
}

function openSetup(step: SetupStep = state.geminiStaged ? 3 : 1) {
  state.setupStep = step;
  state.setupOpen = true;
  render();
}

function geminiFailureMessage(validation: typeof state.gemini.validation) {
  if (validation === "invalidCredential") return "Google did not accept that key. The existing credential was left unchanged.";
  if (validation === "quotaLimited") return "Gemini is currently rate or quota limited. B.O.B. did not replace the stored credential.";
  if (validation === "unavailable") return "Gemini could not be verified right now. B.O.B. did not replace the stored credential.";
  return "Gemini is not configured.";
}

function bindEvents() {
  document.querySelectorAll<HTMLElement>("[data-route]").forEach((element) => element.addEventListener("click", () => {
    state.route = element.dataset.route as Route;
    render();
  }));

  const toggleReduced = () => { state.reduced = !state.reduced; render(); };
  document.querySelector("#reduce")?.addEventListener("click", toggleReduced);
  document.querySelector("#header-reduce")?.addEventListener("click", toggleReduced);

  document.querySelector("#capture-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.querySelector<HTMLInputElement>("#capture-input");
    const title = input?.value.trim();
    if (!title) return;
    const id = `capture-${Date.now()}`;
    state.items.unshift({ id, kind: "note", title, priority: "normal", status: "inbox" });
    void commitWorkState("Captured to Inbox. Your next action did not change.");
  });

  document.querySelector("#start")?.addEventListener("click", () => {
    activeItem().status = "doing";
    void commitWorkState("Started. Everything else can wait for now.");
  });
  document.querySelector("#defer")?.addEventListener("click", () => {
    activeItem().status = "deferred";
    void commitWorkState("Deferred without losing it.");
  });
  document.querySelector("#replan")?.addEventListener("click", () => {
    void replanRemainingWork()
      .then((result) => {
        if (result) {
          hydratePersistentWorkState(result.workState);
          applyPlanProjection(result.plan);
        } else {
          applyBrowserFallbackPlan();
        }
        showToast("Replanned remaining work. Completed and deferred items stayed untouched.");
      })
      .catch((error) => {
        console.error("Failed to replan remaining B.O.B. work", error);
        showToast("B.O.B. could not replan right now. Your current work state was left unchanged.");
      })
      .finally(render);
  });

  document.querySelectorAll<HTMLElement>("[data-complete]").forEach((element) => element.addEventListener("click", () => {
    const item = state.items.find((candidate) => candidate.id === element.dataset.complete);
    if (!item) return;
    item.status = item.status === "done" ? "planned" : "done";
    void commitWorkState();
  }));
  document.querySelectorAll<HTMLElement>("[data-active]").forEach((element) => element.addEventListener("click", () => {
    const item = state.items.find((candidate) => candidate.id === element.dataset.active);
    if (!item) return;
    if (item.status === "inbox") item.status = "planned";
    state.activeId = item.id;
    state.route = "today";
    void commitWorkState();
  }));
  document.querySelectorAll<HTMLElement>("[data-filter]").forEach((element) => element.addEventListener("click", () => {
    state.filter = element.dataset.filter as "all" | ItemKind;
    render();
  }));

  document.querySelector("#organize")?.addEventListener("click", () => {
    const target = state.items.find((item) => item.status === "inbox" && item.kind === "task" && item.priority === "high");
    if (target) {
      state.pendingProposal = {
        title: "Make one inbox item the next action",
        summary: `Move “${target.title}” into planned work and make it the next action. Leave every other inbox item untouched.`,
        targetId: target.id
      };
    }
    state.route = "chat";
    pushConversation("Help me organize what is in my inbox.");
    render();
  });

  document.querySelectorAll<HTMLElement>("[data-prompt]").forEach((element) => element.addEventListener("click", () => {
    const text = element.dataset.prompt!;
    pushConversation(text);
    render();
  }));
  document.querySelector("#chat-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.querySelector<HTMLInputElement>("#chat-input");
    const text = input?.value.trim();
    if (!text) return;
    pushConversation(text);
    render();
  });

  document.querySelector("#create-handoff")?.addEventListener("click", () => {
    const item = activeItem();
    state.handoff = {
      objective: item.title,
      state: item.status === "doing" ? "In progress" : item.status === "planned" ? "Ready to start" : item.status,
      next: `Reopen the context for “${item.title}” and spend five minutes on the first concrete change.`
    };
    pushConversation("Save my place so I can resume later.");
    void commitWorkState("Session handoff saved locally for restart recovery.");
  });
  document.querySelector("#clear-handoff")?.addEventListener("click", () => {
    state.handoff = undefined;
    void commitWorkState("Saved handoff cleared.");
  });

  document.querySelector("#apply-proposal")?.addEventListener("click", () => {
    const proposal = state.pendingProposal;
    if (!proposal) return;

    void applyNextActionProposal(proposal.targetId)
      .then((result) => {
        if (result) {
          hydratePersistentWorkState(result.workState);
          applyPlanProjection(result.plan);
        } else {
          const target = state.items.find((item) => item.id === proposal.targetId);
          if (!target || target.kind !== "task" || ["done", "deferred"].includes(target.status)) {
            showToast("That proposal is stale or no longer safe to apply. Nothing changed.");
            return;
          }
          if (target.status === "inbox") target.status = "planned";
          state.activeId = target.id;
          applyBrowserFallbackPlan();
        }
        state.pendingProposal = undefined;
        state.route = "today";
        showToast("Applied the previewed change. Everything else stayed put.");
      })
      .catch((error) => {
        console.error("B.O.B. rejected a previewed state-change proposal", error);
        showToast("That proposal is stale or no longer safe to apply. Nothing changed.");
      })
      .finally(render);
  });
  document.querySelector("#dismiss-proposal")?.addEventListener("click", () => {
    state.pendingProposal = undefined;
    showToast("Proposal dismissed. Nothing changed.");
    render();
  });

  document.querySelector("#setup")?.addEventListener("click", () => openSetup());
  document.querySelector("#replace-key")?.addEventListener("click", () => openSetup(2));
  document.querySelector("#remove-key")?.addEventListener("click", () => {
    if (state.geminiBusy) return;
    state.geminiBusy = true;
    render();
    void removeGeminiCredential()
      .then((status) => {
        state.gemini = status;
        state.geminiStaged = false;
        state.setupOpen = false;
        showToast("Gemini credential removed. Deterministic B.O.B. remains available.");
      })
      .catch((error) => {
        console.error("Failed to remove Gemini credential", error);
        showToast("B.O.B. could not remove the credential from protected storage.");
      })
      .finally(() => {
        state.geminiBusy = false;
        render();
      });
  });
  document.querySelector("#close-setup")?.addEventListener("click", () => { state.setupOpen = false; render(); });
  document.querySelector("#setup-have-key")?.addEventListener("click", () => { state.setupStep = 2; render(); });
  document.querySelector("#setup-back")?.addEventListener("click", () => { state.setupStep = Math.max(1, state.setupStep - 1) as SetupStep; render(); });
  document.querySelector("#stage-key")?.addEventListener("click", () => {
    if (state.geminiBusy) return;
    const input = document.querySelector<HTMLInputElement>("#gemini-key");
    const value = input?.value ?? "";
    if (input) input.value = "";
    if (value.trim().length < 20) {
      showToast("That does not look like a complete key. Nothing was stored.");
      render();
      return;
    }

    state.geminiBusy = true;
    render();
    void configureGeminiCredential(value)
      .then((status) => {
        state.gemini = status;
        state.geminiStaged = status.validation === "ready";
        if (status.validation === "ready") {
          state.setupStep = 3;
          showToast("Gemini key validated and stored in protected OS credential storage.");
        } else {
          showToast(geminiFailureMessage(status.validation));
        }
      })
      .catch((error) => {
        console.error("Gemini credential setup failed", error);
        showToast("B.O.B. could not validate or store that credential. Nothing was replaced.");
      })
      .finally(() => {
        state.geminiBusy = false;
        render();
      });
  });
  document.querySelector("#continue-setup")?.addEventListener("click", () => {
    state.setupOpen = false;
    state.route = "today";
    render();
  });

  document.querySelector<HTMLInputElement>("#larger-text")?.addEventListener("change", (event) => { state.largerText = (event.target as HTMLInputElement).checked; render(); });
  document.querySelector<HTMLInputElement>("#reduced-motion")?.addEventListener("change", (event) => { state.reducedMotion = (event.target as HTMLInputElement).checked; render(); });
}

window.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    state.route = "today";
    render();
    requestAnimationFrame(() => document.querySelector<HTMLInputElement>("#capture-input")?.focus());
  }
  if (event.key === "Escape" && state.setupOpen) {
    state.setupOpen = false;
    render();
  }
});

export const debugState = () => escapeHtml(JSON.stringify(state));