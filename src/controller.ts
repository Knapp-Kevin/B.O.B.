import { activeItem, escapeHtml, showToast, state, type ItemKind, type Route, type SetupStep } from "./model";
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

function pushConversation(text: string) {
  state.chat.push({ author: "user", text }, { author: "bob", text: replyFor(text) });
}

function openSetup(step: SetupStep = state.geminiStaged ? 3 : 1) {
  state.setupStep = step;
  state.setupOpen = true;
  render();
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
    showToast("Captured to Inbox. Your next action did not change.");
    render();
  });

  document.querySelector("#start")?.addEventListener("click", () => {
    activeItem().status = "doing";
    showToast("Started. Everything else can wait for now.");
    render();
  });
  document.querySelector("#defer")?.addEventListener("click", () => {
    activeItem().status = "deferred";
    const next = state.items.find((item) => item.status === "planned" && item.id !== state.activeId);
    if (next) state.activeId = next.id;
    showToast("Deferred without losing it.");
    render();
  });
  document.querySelector("#replan")?.addEventListener("click", () => {
    showToast("Prototype replan keeps completed work and reshapes only what remains.");
    render();
  });

  document.querySelectorAll<HTMLElement>("[data-complete]").forEach((element) => element.addEventListener("click", () => {
    const item = state.items.find((candidate) => candidate.id === element.dataset.complete);
    if (item) item.status = item.status === "done" ? "planned" : "done";
    render();
  }));
  document.querySelectorAll<HTMLElement>("[data-active]").forEach((element) => element.addEventListener("click", () => {
    const item = state.items.find((candidate) => candidate.id === element.dataset.active);
    if (item && item.status === "inbox") item.status = "planned";
    state.activeId = element.dataset.active!;
    state.route = "today";
    render();
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
    showToast("Session handoff preview created.");
    render();
  });
  document.querySelector("#clear-handoff")?.addEventListener("click", () => { state.handoff = undefined; render(); });

  document.querySelector("#apply-proposal")?.addEventListener("click", () => {
    const proposal = state.pendingProposal;
    if (!proposal) return;
    const target = state.items.find((item) => item.id === proposal.targetId);
    if (target) {
      target.status = "planned";
      state.activeId = target.id;
    }
    state.pendingProposal = undefined;
    state.route = "today";
    showToast("Applied the previewed change. Everything else stayed put.");
    render();
  });
  document.querySelector("#dismiss-proposal")?.addEventListener("click", () => {
    state.pendingProposal = undefined;
    showToast("Proposal dismissed. Nothing changed.");
    render();
  });

  document.querySelector("#setup")?.addEventListener("click", () => openSetup());
  document.querySelector("#replace-key")?.addEventListener("click", () => openSetup(2));
  document.querySelector("#close-setup")?.addEventListener("click", () => { state.setupOpen = false; render(); });
  document.querySelector("#setup-have-key")?.addEventListener("click", () => { state.setupStep = 2; render(); });
  document.querySelector("#setup-back")?.addEventListener("click", () => { state.setupStep = Math.max(1, state.setupStep - 1) as SetupStep; render(); });
  document.querySelector("#stage-key")?.addEventListener("click", () => {
    const input = document.querySelector<HTMLInputElement>("#gemini-key");
    const value = input?.value.trim() ?? "";
    if (input) input.value = "";
    if (value.length < 20) {
      showToast("That does not look like a complete key. Nothing was stored.");
      render();
      return;
    }
    state.geminiStaged = true;
    state.setupStep = 3;
    showToast("Key cleared from the form. Prototype validation state only.");
    render();
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
