import { activeItem, escapeHtml, focusItems, state, type ItemKind, type Route } from "./model";

const navButton = (route: Route, icon: string, label: string) => `<button class="nav ${state.route === route ? "active" : ""}" data-route="${route}"><span>${icon}</span><strong>${label}</strong></button>`;
const header = (title: string, subtitle: string) => `<header><div><h1>${title}</h1><p>${subtitle}</p></div><button class="ghost" id="header-reduce">${state.reduced ? "Show full view" : "Reduce information"}</button></header>`;
const capture = () => `<form class="panel capture" id="capture-form"><span class="capture-icon">↓</span><label><b>QUICK CAPTURE</b><input id="capture-input" placeholder="Dump a thought, task, or reminder…" autocomplete="off"></label><kbd>Ctrl K</kbd><button class="teal">Capture</button></form>`;

export function renderShell() {
  document.documentElement.classList.toggle("large-text", state.largerText);
  document.documentElement.classList.toggle("reduce-motion", state.reducedMotion);
  return `<div class="shell ${state.reduced ? "reduced" : ""}">
    <aside class="sidebar">
      <div class="brand"><img src="/bob-icon.png" alt="B.O.B. mascot"><b>B.O.B.</b><small>Better Organized Brain</small></div>
      <nav>${navButton("today", "⌂", "Today")}${navButton("inbox", "▱", "Inbox")}${navButton("chat", "◫", "Chat")}${navButton("settings", "⚙", "Settings")}</nav>
      <button class="overwhelmed" id="reduce"><span>◉</span><div><b>${state.reduced ? "Show full view" : "Overwhelmed mode"}</b><small>${state.reduced ? "Bring the rest back." : "Reduce noise. One thing at a time."}</small></div></button>
      <button class="provider" data-route="settings"><i class="dot ${state.geminiStaged ? "ok" : ""}"></i>${state.geminiStaged ? "Gemini setup staged" : "Gemini Free · setup needed"}</button>
    </aside>
    <main>${renderRoute()}</main>
    ${state.toast ? `<div class="toast" role="status">${escapeHtml(state.toast)}</div>` : ""}
    ${state.setupOpen ? renderSetup() : ""}
  </div>`;
}

function renderRoute() {
  if (state.route === "today") return renderToday();
  if (state.route === "inbox") return renderInbox();
  if (state.route === "chat") return renderChat();
  return renderSettings();
}

function renderToday() {
  const next = activeItem();
  const timeline = [["9:00","11:00","Deep work: Q2 project outline","green"],["11:15","12:00","Client check-in","blue"],["12:00","1:00","Lunch / reset","amber"],["1:00","3:00","Focus block","purple"],["3:15","4:15","Admin & email","neutral"],["4:30","5:15","Workout","purple"]];
  return `${header("Today", "Good afternoon. Let’s make the next move obvious.")}
  <section class="grid top-grid">
    <article class="panel next"><small>NEXT ACTION</small><div class="next-body"><span class="star">★</span><div><h2>${escapeHtml(next.title)}</h2><p>${next.estimate ? `~${next.estimate} min` : "Small step"} · ${next.priority === "high" ? "High impact" : "Useful progress"}</p><div class="actions"><button class="primary" id="start">${next.status === "doing" ? "In progress" : "Do it now"}</button><button class="plain" id="defer">◷ Not now</button></div></div></div></article>
    <article class="panel focus" data-secondary><div class="panel-title"><small>WHAT MATTERS TODAY</small><span>Up to three</span></div>${focusItems().map((item, index) => `<button data-complete="${item.id}"><i>${index + 1}</i><strong>${escapeHtml(item.title)}</strong><span>${item.estimate ?? ""}${item.estimate ? " min" : ""}</span><em>${item.status === "done" ? "✓" : ""}</em></button>`).join("")}</article>
  </section>
  ${capture()}
  <section class="grid bottom-grid" data-secondary>
    <article class="panel day"><div class="panel-title"><div><small>PLAN MY DAY</small><h3>Today’s shape</h3></div><button class="ghost small" id="replan">Replan</button></div>${timeline.map(([start,end,title,tone]) => `<div class="time-row"><span>${start}<small>${end}</small></span><div class="block ${tone}">${title}</div></div>`).join("")}</article>
    <div class="stack"><article class="panel resume"><small>RESUME WHERE I LEFT OFF</small>${state.items.filter((item) => item.id !== next.id).slice(0,3).map((item) => `<button data-active="${item.id}"><span>✓</span><strong>${escapeHtml(item.title)}</strong><b>›</b></button>`).join("")}</article><article class="encourage"><div><h3>You’ve got this.</h3><p>Progress beats perfection. B.O.B. keeps the rest recoverable.</p></div><img src="/bob-icon.png" alt=""></article></div>
  </section>${state.reduced ? `<div class="reduced-note"><b>Reduced-information mode is on.</b> Only the next action and capture are competing for attention.</div>` : ""}`;
}

function renderInbox() {
  const kinds: ("all" | ItemKind)[] = ["all", "task", "idea", "note", "reminder"];
  const visible = state.items.filter((item) => item.status !== "done" && (state.filter === "all" || item.kind === state.filter));
  const icon = (kind: ItemKind) => kind === "task" ? "✓" : kind === "idea" ? "✦" : kind === "note" ? "≡" : "◷";
  return `${header("Inbox", "Capture first. Decide what it is later.")}${capture()}<section class="inbox-grid"><article class="panel inbox-list"><div class="filters">${kinds.map((kind) => `<button class="${state.filter === kind ? "active" : ""}" data-filter="${kind}">${kind === "all" ? "All items" : `${kind}s`}</button>`).join("")}</div>${visible.map((item) => `<div class="item"><i class="kind ${item.kind}">${icon(item.kind)}</i><div><small>${item.kind.toUpperCase()}</small><strong>${escapeHtml(item.title)}</strong><p>${item.due ? `<span>${escapeHtml(item.due)}</span>` : ""}${item.estimate ? `<span>${item.estimate} min</span>` : ""}<span class="${item.priority}">${item.priority}</span></p></div><button title="Make next action" data-active="${item.id}">›</button></div>`).join("")}</article><aside data-secondary><article class="panel side"><small>INBOX HEALTH</small><h3>${visible.length} things waiting</h3><p><span>High priority</span><b>${visible.filter((item) => item.priority === "high").length}</b></p><p><span>Needs a decision</span><b>${visible.filter((item) => item.kind !== "task").length}</b></p><button class="primary" id="organize">Organize with B.O.B.</button></article><article class="panel side"><small>CAPTURE RULE</small><h3>Do not make yourself classify it yet.</h3><p>Get it out of your head first. Structure can come later.</p></article></aside></section>`;
}

function renderChat() {
  return `${header("B.O.B. Chat", "One assistant, with the current work close at hand.")}<section class="chat-grid"><div class="conversation"><div class="messages">${state.chat.map((message) => `<div class="message ${message.author}">${message.author === "bob" ? `<img src="/bob-icon.png" alt="B.O.B.">` : ""}<p>${escapeHtml(message.text)}</p></div>`).join("")}</div><form class="composer" id="chat-form"><input id="chat-input" placeholder="Tell B.O.B. what is messy, blocked, or unclear…" autocomplete="off"><button aria-label="Send">↑</button></form><p class="fixture-note">Pre-alpha uses deterministic responses. Live Gemini inference is intentionally not wired until the credential boundary is ready.</p></div><aside class="panel frontier" data-secondary><small>CURRENT CONTEXT</small><h2>${escapeHtml(activeItem().title)}</h2><p>B.O.B. can help you reduce, break down, or decide without changing who the assistant is.</p><div class="frontier-actions"><button data-prompt="I’m overwhelmed. Show me one thing."><b>Reduce this</b><span>Hide everything that is not immediately useful.</span></button><button data-prompt="Break this into the smallest useful first step."><b>Break it down</b><span>Find a smaller starting move.</span></button><button data-prompt="Help me decide what matters most here."><b>Help me decide</b><span>Separate facts from the decision I own.</span></button></div></aside></section>`;
}

function renderSettings() {
  return `${header("Settings", "Keep configuration out of the way until it matters.")}<section class="settings-grid"><article class="panel gemini"><div class="gemini-icon">✦</div><div><small>ALPHA INFERENCE</small><h2>Gemini Developer API Free</h2><p>${state.geminiStaged ? "Setup flow staged. Native validation and protected storage are the next implementation seam." : "Connect a free Gemini key in a short guided flow. No Google OAuth or billing setup is required for the alpha path."}</p></div><button class="primary" id="setup">${state.geminiStaged ? "Review setup" : "Connect Gemini"}</button></article><article class="panel prefs"><small>ACCESSIBILITY</small><h2>Make B.O.B. easier to read</h2><label><span><b>Larger interface text</b><small>Increase the base UI scale.</small></span><input id="larger-text" type="checkbox" ${state.largerText ? "checked" : ""}></label><label><span><b>Reduced motion</b><small>Suppress nonessential transitions.</small></span><input id="reduced-motion" type="checkbox" ${state.reducedMotion ? "checked" : ""}></label></article><article class="panel prefs"><small>PRE-ALPHA BOUNDARY</small><h2>What is real today</h2><ul><li>Working navigation and in-memory item interactions</li><li>Quick capture and next-action selection</li><li>Reduced-information mode</li><li>Fixture-backed B.O.B. conversation patterns</li><li>Gemini onboarding UX without insecure key persistence</li></ul></article></section>`;
}

function renderSetup() {
  return `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="setup-title"><section><button class="close" id="close-setup" aria-label="Close">×</button><div class="setup-head"><img src="/bob-icon.png" alt=""><div><small>2–3 STEP SETUP</small><h2 id="setup-title">Connect Gemini Free</h2><p>B.O.B. takes you directly to the one Google surface you need.</p></div></div><div class="steps"><article><b>1</b><h3>Get a Gemini key</h3><p>Open Google AI Studio directly. Sign in and create or copy your Gemini API key.</p><a class="primary link" href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Open Google AI Studio ↗</a></article><article><b>2</b><h3>Bring it back to B.O.B.</h3><p>Paste the key once. This pre-alpha clears the field immediately and does not persist the secret.</p><label for="gemini-key">Gemini API key</label><input id="gemini-key" type="password" placeholder="Paste key here" autocomplete="off"><button class="teal" id="stage-key">Stage secure validation</button><p class="tiny">Native protected storage is intentionally not faked in frontend code.</p></article><article><b>3</b><h3>Use B.O.B.</h3>${state.geminiStaged ? `<p class="success">✓ Setup UX is staged for native validation.</p>` : `<p>Once native validation succeeds, B.O.B. will show connected/free-tier state and move on.</p>`}<button class="plain" id="continue-setup" ${state.geminiStaged ? "" : "disabled"}>Continue to Today</button></article></div><div class="privacy"><b>Free-tier privacy note</b><br>Before live inference is enabled, B.O.B. will clearly disclose the provider’s free-tier data-use terms and minimize the context it sends.</div></section></div>`;
}
