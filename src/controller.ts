import { activeItem, escapeHtml, showToast, state, type ItemKind, type Route } from "./model";
import { renderShell } from "./views";

const root = document.querySelector<HTMLDivElement>("#app")!;
if (!root) throw new Error("Missing app root");

const replyFor = (input: string) => {
  const lower = input.toLowerCase();
  if (lower.includes("overwhelm") || lower.includes("too much")) return `Keep only this: ${activeItem().title}. Everything else can wait.`;
  if (lower.includes("wait") || lower.includes("confus") || lower.includes("what?")) return `Short version: ${activeItem().title} is the next useful move. You do not need to solve the rest right now.`;
  if (lower.includes("decid") || lower.includes("priorit")) return "I can research facts, but I should not invent your preference. The decision in front of you is: what outcome matters most today?";
  if (lower.includes("break")) return `Start smaller: open the material for “${activeItem().title}” and spend five minutes identifying the first concrete change.`;
  if (lower.includes("organize") || lower.includes("inbox")) return "I would separate the inbox into: act today, schedule later, reference, and needs a decision. I would preview that before changing state.";
  return `The next useful move still looks like “${activeItem().title}.” If that is wrong, tell me what changed and I’ll reorient.`;
};

export function render() {
  root.innerHTML = renderShell();
  bindEvents();
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
    state.activeId = id;
    showToast("Captured. You can organize it later.");
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
  document.querySelector("#replan")?.addEventListener("click", () => { showToast("Pre-alpha replan preserves completed work and reshapes the remaining fixture day."); render(); });

  document.querySelectorAll<HTMLElement>("[data-complete]").forEach((element) => element.addEventListener("click", () => {
    const item = state.items.find((candidate) => candidate.id === element.dataset.complete);
    if (item) item.status = item.status === "done" ? "planned" : "done";
    render();
  }));
  document.querySelectorAll<HTMLElement>("[data-active]").forEach((element) => element.addEventListener("click", () => {
    state.activeId = element.dataset.active!;
    state.route = "today";
    render();
  }));
  document.querySelectorAll<HTMLElement>("[data-filter]").forEach((element) => element.addEventListener("click", () => {
    state.filter = element.dataset.filter as "all" | ItemKind;
    render();
  }));

  document.querySelector("#organize")?.addEventListener("click", () => {
    state.route = "chat";
    state.chat.push({ author: "user", text: "Help me organize what is in my inbox." }, { author: "bob", text: replyFor("organize inbox") });
    render();
  });

  document.querySelectorAll<HTMLElement>("[data-prompt]").forEach((element) => element.addEventListener("click", () => {
    const text = element.dataset.prompt!;
    state.chat.push({ author: "user", text }, { author: "bob", text: replyFor(text) });
    render();
  }));
  document.querySelector("#chat-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.querySelector<HTMLInputElement>("#chat-input");
    const text = input?.value.trim();
    if (!text) return;
    state.chat.push({ author: "user", text }, { author: "bob", text: replyFor(text) });
    render();
  });

  document.querySelector("#setup")?.addEventListener("click", () => { state.setupOpen = true; render(); });
  document.querySelector("#close-setup")?.addEventListener("click", () => { state.setupOpen = false; render(); });
  document.querySelector("#stage-key")?.addEventListener("click", () => {
    const input = document.querySelector<HTMLInputElement>("#gemini-key");
    const value = input?.value.trim() ?? "";
    if (input) input.value = "";
    if (value.length < 20) { showToast("That does not look like a complete key."); render(); return; }
    state.geminiStaged = true;
    showToast("Key cleared from the form. Native validation is the next seam.");
    render();
  });
  document.querySelector("#continue-setup")?.addEventListener("click", () => { state.setupOpen = false; state.route = "today"; render(); });

  document.querySelector<HTMLInputElement>("#larger-text")?.addEventListener("change", (event) => { state.largerText = (event.target as HTMLInputElement).checked; render(); });
  document.querySelector<HTMLInputElement>("#reduced-motion")?.addEventListener("change", (event) => { state.reducedMotion = (event.target as HTMLInputElement).checked; render(); });
}

window.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    state.route = state.route === "chat" ? "chat" : "today";
    render();
    requestAnimationFrame(() => document.querySelector<HTMLInputElement>("#capture-input")?.focus());
  }
  if (event.key === "Escape" && state.setupOpen) { state.setupOpen = false; render(); }
});

export const debugState = () => escapeHtml(JSON.stringify(state));
