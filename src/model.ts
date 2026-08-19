export type Route = "today" | "inbox" | "chat" | "settings";
export type ItemKind = "task" | "idea" | "note" | "reminder";
export type ItemStatus = "inbox" | "planned" | "doing" | "done" | "deferred";

export interface WorkItem {
  id: string;
  kind: ItemKind;
  title: string;
  estimate?: number;
  priority: "low" | "normal" | "high";
  due?: string;
  status: ItemStatus;
}

export interface ChatMessage {
  author: "user" | "bob";
  text: string;
}

export interface AppState {
  route: Route;
  reduced: boolean;
  activeId: string;
  filter: "all" | ItemKind;
  items: WorkItem[];
  chat: ChatMessage[];
  setupOpen: boolean;
  geminiStaged: boolean;
  largerText: boolean;
  reducedMotion: boolean;
  toast: string;
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
  geminiStaged: false,
  largerText: false,
  reducedMotion: false,
  toast: ""
};

export const activeItem = () => state.items.find((item) => item.id === state.activeId) ?? state.items[0]!;
export const focusItems = () => ["outline", "client", "workout"].map((id) => state.items.find((item) => item.id === id)).filter((item): item is WorkItem => Boolean(item));
export const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" })[character]!);
export const showToast = (message: string) => {
  state.toast = message;
  window.setTimeout(() => {
    if (state.toast === message) state.toast = "";
  }, 2400);
};
