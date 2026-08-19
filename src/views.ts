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
    ${state.toast ? `<div class="toast" role="status" aria-live="polite">${escapeHtml(state.toast)}</div>` : ""}
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
  const recent = state.items.filter((item) => item.id !== next.id && item.status !== "done" && item.status !== "deferred").slice(0, 3);
  return `${header("Today", "Good afternoon. Let’s make the next move obvious.")}
  <section class="grid top-grid">
    <article class="panel next"><small>NEXT ACTION</small><div class="next-body"><span class="star">★</span><div><h2>${escapeHtml(next.title)}</h2><p>${next.estimate ? `~${next.estimate} min` : "Small step"} · ${next.priority === "high" ? "High impact" : "Useful progress"}</p><div class="actions"><button class="primary" id="start" ${next.status === "doing" ? "disabled" : ""}>${next.status === "doing" ? "In progress" : "Do it now"}</button><button class="plain" id="defer">◷ Not now</button></div></div></div></article>
    <article class="panel focus" data-secondary><div class="panel-title"><small>WHAT MATTERS TODAY</small><span>Up to three</span></div>${focusItems().map((item, index) => `<button data-complete="${item.id}" aria-pressed="${item.status === "done"}"><i>${index + 1}</i><strong class="${item.status === "done" ? "done" : ""}">${escapeHtml(item.title)}</strong><span>${item.estimate ?? ""}${item.estimate ? " min" : ""}</span><em>${item.status === "done" ? "✓" : ""}</em></button>`).join("")}</article>
  </section>
  ${capture()}
  <section class="grid bottom-grid" data-secondary>
    <article class="panel day"><div class="panel-title"><div><small>PLAN MY DAY</small><h3>Today’s shape</h3></div><button class="ghost small" id="replan">Replan</button></div>${timeline.map(([start,end,title,tone]) => `<div class="time-row"><span>${start}<small>${end}</small></span><div class="block ${tone}">${title}</div></div>`).join("")}</article>
    <div class="stack"><article class="panel resume"><small>RESUME WHERE I LEFT OFF</small>${recent.map((item) => `<button data-active="${item.id}"><span>↗</span><strong>${escapeHtml(item.title)}</strong><b>›</b></button>`).join("")}</article><article class="encourage"><div><h3>You’ve got this.</h3><p>Progress beats perfection. B.O.B. keeps the rest recoverable.</p></div><img src="/bob-icon.png" alt=""></article></div>
  </section>${state.reduced ? `<div class="reduced-note"><b>Reduced-information mode is on.</b> Only the next action and capture are competing for attention.</div>` : ""}`;
}

function renderInbox() {
  const kinds: ("all" | ItemKind)[] = ["all", "task", "idea", "note", "reminder"];
  const visible = state.items.filter((item) => item.status === "inbox" && (state.filter === "all" || item.kind === state.filter));
  const icon = (kind: ItemKind) => kind === "task" ? "✓" : kind === "idea" ? "✦" : kind === "note" ? "≡" : "◷";
  return `${header("Inbox", "Capture first. Decide what it is later.")}${capture()}<section class="inbox-grid"><article class="panel inbox-list"><div class="filters">${kinds.map((kind) => `<button class="${state.filter === kind ? "active" : ""}" data-filter="${kind}">${kind === "all" ? "All items" : `${kind}s`}</button>`).join("")}</div>${visible.length ? visible.map((item) => `<div class="item"><i class="kind ${item.kind}">${icon(item.kind)}</i><div><small>${item.kind.toUpperCase()}</small><strong>${escapeHtml(item.title)}</strong><p>${item.due ? `<span>${escapeHtml(item.due)}</span>` : ""}${item.estimate ? `<span>${item.estimate} min</span>` : ""}<span class="${item.priority}">${item.priority}</span></p></div><button title="Make next action" aria-label="Make ${escapeHtml(item.title)} the next action" data-active="${item.id}">›</button></div>`).join("") : `<div class="empty"><b>Nothing waiting in this view.</b><span>Capture first. B.O.B. can help organize later.</span></div>`}</article><aside data-secondary><article class="panel side"><small>INBOX SNAPSHOT</small><h3>${visible.length} things waiting</h3><p><span>High priority</span><b>${visible.filter((item) => item.priority === "high").length}</b></p><p><span>Needs a decision</span><b>${visible.filter((item) => item.kind !== "task").length}</b></p><button class="primary" id="organize" ${visible.length ? "" : "disabled"}>Organize with B.O.B.</button></article><article class="panel side"><small>CAPTURE RULE</small><h3>Do not make yourself classify it yet.</h3><p>Get it out of your head first. Structure can come later.</p></article></aside></section>`;
}

function proposalCard() {
  if (!state.pendingProposal) return "";
  return `<article class="proposal-card"><small>PREVIEW BEFORE APPLY</small><h3>${escapeHtml(state.pendingProposal.title)}</h3><p>${escapeHtml(state.pendingProposal.summary)}</p><div class="actions"><button class="primary" id="apply-proposal">Apply this change</button><button class="plain" id="dismiss-proposal">Keep things as they are</button></div></article>`;
}

function handoffCard() {
  if (!state.handoff) return "";
  return `<article class="handoff-card"><div class="panel-title"><small>SESSION HANDOFF PREVIEW</small><button class="ghost small" id="clear-handoff">Clear</button></div><dl><div><dt>Objective</dt><dd>${escapeHtml(state.handoff.objective)}</dd></div><div><dt>State</dt><dd>${escapeHtml(state.handoff.state)}</dd></div><div><dt>Next</dt><dd>${escapeHtml(state.handoff.next)}</dd></div></dl><p>This demonstrates the handoff shape only. Cross-restart continuity remains behind the persistence decision.</p></article>`;
}

function renderChat() {
  return `${header("B.O.B. Chat", "One assistant, with the current work close at hand.")}<section class="chat-grid"><div class="conversation"><div class="messages">${state.chat.map((message) => `<div class="message ${message.author}">${message.author === "bob" ? `<img src="/bob-icon.png" alt="B.O.B.">` : ""}<p>${escapeHtml(message.text)}</p></div>`).join("")}${proposalCard()}${handoffCard()}</div><form class="composer" id="chat-form"><input id="chat-input" placeholder="Tell B.O.B. what is messy, blocked, or unclear…" autocomplete="off"><button aria-label="Send">↑</button></form><p class="fixture-note">Prototype responses are deterministic. Live Gemini inference remains gated by Wayfinder.</p></div><aside class="panel frontier" data-secondary><small>CURRENT CONTEXT</small><h2>${escapeHtml(activeItem().title)}</h2><p>B.O.B. can reduce, break down, reorient, or help decide while remaining one assistant.</p><div class="frontier-actions"><button data-prompt="I’m overwhelmed. Show me one thing."><b>Reduce this</b><span>Hide everything that is not immediately useful.</span></button><button data-prompt="Break this into the smallest useful first step."><b>Break it down</b><span>Find a smaller starting move.</span></button><button data-prompt="Wait, what? Reorient me in plain language."><b>Reorient me</b><span>Restate the plan without adding new complexity.</span></button><button data-prompt="Help me decide what matters most here."><b>Help me decide</b><span>Separate facts from the decision I own.</span></button><button id="create-handoff"><b>Save my place</b><span>Preview a compact handoff for later resumption.</span></button></div></aside></section>`;
}

function renderSettings() {
  return `${header("Settings", "Keep configuration out of the way until it matters.")}<section class="settings-grid"><article class="panel gemini"><div class="gemini-icon">✦</div><div><small>ALPHA INFERENCE</small><h2>Gemini Developer API Free</h2><p>${state.geminiStaged ? "Prototype setup flow completed. Live validation and protected storage remain gated by Wayfinder." : "Connect a free Gemini key in a short guided flow. No Google OAuth or billing setup is required for the ordinary alpha path."}</p></div><button class="primary" id="setup">${state.geminiStaged ? "Review setup" : "Connect Gemini"}</button>${state.geminiStaged ? `<button class="plain" id="replace-key">Replace key</button>` : ""}</article><article class="panel prefs"><small>ACCESSIBILITY</small><h2>Make B.O.B. easier to read</h2><label><span><b>Larger interface text</b><small>Increase the base UI scale.</small></span><input id="larger-text" type="checkbox" ${state.largerText ? "checked" : ""}></label><label><span><b>Reduced motion</b><small>Suppress nonessential transitions.</small></span><input id="reduced-motion" type="checkbox" ${state.reducedMotion ? "checked" : ""}></label></article><article class="panel prefs"><small>PROTOTYPE BOUNDARY</small><h2>What is real today</h2><ul><li>Working navigation and in-memory item interactions</li><li>Capture that leaves the current next action intact</li><li>Reduced-information mode</li><li>Fixture-backed B.O.B. productivity behaviors</li><li>Preview-before-apply interaction</li><li>Guided Gemini onboarding without insecure persistence</li></ul></article></section>`;
}

function setupProgress() {
  return `<div class="setup-progress" aria-label="Gemini setup progress">${[1,2,3].map((step) => `<span class="${state.setupStep === step ? "active" : state.setupStep > step ? "done" : ""}"><b>${step}</b><small>${step === 1 ? "Get key" : step === 2 ? "Bring it back" : "Ready"}</small></span>`).join("")}</div>`;
}

function renderSetupStep() {
  if (state.setupStep === 1) return `<article class="setup-step"><div class="step-number">1</div><small>GET YOUR KEY</small><h3>Go straight to Google AI Studio</h3><p>Use Gemini Developer API Free for the alpha prototype. The ordinary happy path does not require Google OAuth, Cloud Console navigation, billing setup, or a credit card.</p><div class="setup-callout"><b>Before you continue</b><span>B.O.B. will keep provider details secondary and will disclose the Free-tier data-use terms before live inference is enabled.</span></div><div class="setup-actions"><a class="primary link" href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Get Gemini key ↗</a><button class="plain" id="setup-have-key">I have my key</button></div></article>`;
  if (state.setupStep === 2) return `<article class="setup-step"><div class="step-number">2</div><small>BRING IT BACK</small><h3>Paste it once</h3><p>This prototype checks only that the field looks complete, immediately clears it, and never persists the value. Native validation and protected storage are still a governed implementation seam.</p><label for="gemini-key">Gemini API key</label><input id="gemini-key" type="password" placeholder="Paste key here" autocomplete="off" spellcheck="false"><div class="setup-actions"><button class="ghost" id="setup-back">Back</button><button class="teal" id="stage-key">Check prototype flow</button></div><p class="tiny">Nothing typed here is written to ordinary application state.</p></article>`;
  return `<article class="setup-step complete-step"><div class="step-number success-number">✓</div><small>PROTOTYPE COMPLETE</small><h3>The setup path is clear</h3><p>B.O.B. now shows the connected-state shape without claiming live Gemini access. Production validation and secure storage remain blocked until their Wayfinder decisions authorize them.</p><div class="connected-state"><i class="dot ok"></i><div><b>Gemini Free setup staged</b><span>Prototype state only</span></div></div><div class="setup-actions"><button class="ghost" id="setup-back">Back</button><button class="primary" id="continue-setup">Continue to Today</button></div></article>`;
}

function renderSetup() {
  return `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="setup-title"><section class="setup-modal"><button class="close" id="close-setup" aria-label="Close">×</button><div class="setup-head"><img src="/bob-icon.png" alt=""><div><small>GUIDED GEMINI SETUP</small><h2 id="setup-title">Connect B.O.B. to Gemini</h2><p>One clear step at a time. Provider plumbing stays out of your daily workflow.</p></div></div>${setupProgress()}${renderSetupStep()}<div class="privacy"><b>Free-tier privacy note</b><br>Before live inference is enabled, B.O.B. will surface the provider’s current data-use terms and minimize the context it sends.</div></section></div>`;
}
