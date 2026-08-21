export type Route = "today" | "inbox" | "chat" | "settings";
export type ItemKind = "task" | "idea" | "note" | "reminder";
export type ItemStatus = "inbox" | "planned" | "doing" | "done" | "deferred";
export type SetupStep = 1 | 2 | 3;
export type GeminiValidationState = "notConfigured" | "ready" | "invalidCredential" | "quotaLimited" | "unavailable";

export interface WorkItem {
  id: string;
  kind: ItemKind;
  title: string;
  estimate?: number;
  priority: "low" | "normal" | "high";
  due?: string;
  status: ItemStatus;
}

export interface PersistentWorkState {
  activeId: string | null;
  items: WorkItem[];
}

export interface GeminiCredentialStatus {
  configured: boolean;
  validation: GeminiValidationState;
}

export interface ChatMessage {
  author: "user" | "bob";
  text: string;
}

export interface StateChangeProposal {
  title: string;
  summary: string;
  targetId: string;
}

export interface HandoffSnapshot {
  objective: string;
  state: string;
  next: string;
}

export interface AppState {
  route: Route;
  reduced: boolean;
  activeId: string;
  filter: "all" | ItemKind;
  items: WorkItem[];
  chat: ChatMessage[];
  setupOpen: boolean;
  setupStep: SetupStep;
  gemini: GeminiCredentialStatus;
  geminiStaged: boolean;
  geminiBusy: boolean;
  largerText: boolean;
  reducedMotion: boolean;
  toast: string;
  pendingProposal?: StateChangeProposal;
  handoff?: HandoffSnapshot;
}

const seedItems: WorkItem[] = [
  { id: "reply", kind: "task", title: "Reply to Jamie about the project brief", estimate: 10, priority: "high", due: "Today", status: "planned" },
  { id: "outline", kind: "task", title: "Finish Q2 project outline", estimate: 90, priority: "high", due: "Friday", status: "planned" },
  { id: "client", kind: "task", title: "Client check-in", estimate: 45, priority: "normal", due: "11:15 AM", status: "planned" },
  { id: "workout", kind: "task", title: "Workout", estimate: 45, priority: "normal", due: "4:30 PM", status: "planned" },
  { id: "habit", kind: "idea", title: "Habit tracker for focus sprints", estimate: 15, priority: "normal", status: "inbox" },
  { id: "dentist", kind: "reminder", title: "Book dentist appointment", estimate: 5, priority: "low", due: "Tomorrow", status: "inbox" },
  { id: "followup", kind: "task", title: "Follow up with Alex on design feedback", estimate: 20, priority: "high", status: "inbox" },
  { id: "notes", kind: "note", title: "Ideas for productivity system", priority: "normal", status: "inbox" }
];

export const state: AppState = {
  route: "today",
  reduced: false,
  activeId: "reply",
  filter: "all",
  items: seedItems,
  chat: [{ author: "bob", text: "Give me the messy version. I’ll help you find the next useful move." }],
  setupOpen: false,
  setupStep: 1,
  gemini: { configured: false, validation: "notConfigured" },
  geminiStaged: false,
  geminiBusy: false,
  largerText: false,
  reducedMotion: false,
  toast: ""
};

export const persistentWorkState = (): PersistentWorkState => ({
  activeId: state.activeId || null,
  items: state.items.map((item) => ({ ...item }))
});

export const hydratePersistentWorkState = (snapshot: PersistentWorkState) => {
  if (snapshot.items.length === 0) return false;
  state.items = snapshot.items.map((item) => ({ ...item }));
  const requested = snapshot.activeId ? state.items.find((item) => item.id === snapshot.activeId) : undefined;
  state.activeId = requested?.id ?? state.items.find((item) => item.status === "planned")?.id ?? state.items[0]!.id;
  return true;
};

export const activeItem = () => state.items.find((item) => item.id === state.activeId) ?? state.items.find((item) => item.status === "planned") ?? state.items[0]!;
export const focusItems = () => ["outline", "client", "workout"].map((id) => state.items.find((item) => item.id === id)).filter((item): item is WorkItem => Boolean(item));
export const escapeHtml = (value: string) => value.replace(/[&<>'\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '\"': "&quot;" })[character]!);

let toastTimer: number | undefined;
export const showToast = (message: string) => {
  state.toast = message;
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    if (state.toast === message) {
      state.toast = "";
      window.dispatchEvent(new Event("bob:render"));
    }
  }, 2400);
};
