/* Spin Web - OSINT Mini Toolkit (client-side only) */

const JOKES = [
  {
    setup: "Why did the OSINT analyst break up with Google?",
    punchline: "Because Google was tracking them back."
  },
  {
    setup: "What's the difference between an OSINT investigator and a stalker?",
    punchline: "A LinkedIn premium subscription."
  },
  {
    setup: "My therapist says I need to stop investigating people online.",
    punchline: "Interesting... Tell me more about your background, Dr. Williams."
  },
  {
    setup: "Why do OSINT analysts make terrible poker players?",
    punchline: "They already Googled everyone's tells before the game started."
  },
  {
    setup: "How many OSINT analysts does it take to change a lightbulb?",
    punchline: "None. They found the maintenance schedule in an exposed bucket."
  },
  {
    setup: "What did the metadata say to the photo?",
    punchline: "\"You look anonymous, but I know exactly where and when you were taken.\""
  },
  {
    setup: "Why do OSINT investigators love the Wayback Machine?",
    punchline: "Because the internet never forgets."
  },
  {
    setup: "What's the OSINT analyst's bedtime story?",
    punchline: "\"Once upon a time, someone reused the same username everywhere. The end.\""
  },
  {
    setup: "What's the scariest thing an investigator can say?",
    punchline: "\"I found your old MySpace page.\""
  },
  {
    setup: "OSINT Rule #1: Everything is findable. Rule #2:",
    punchline: "You probably should not have posted that."
  },
  {
    setup: "Why did Jessica Jones switch to digital investigations?",
    punchline: "Because you can drink whiskey during WHOIS lookups and nobody judges."
  },
  {
    setup: "What's worse than getting breached?",
    punchline: "Finding out your password was \"password123\"."
  }
];

const TIPS = [
  "Google dorking is not an insult. Try: site:target.com filetype:pdf",
  "The Wayback Machine never forgets, even if they deleted it.",
  "EXIF data: because your photos are snitches.",
  "Reuse of usernames is one of the fastest pivots in OSINT.",
  "Reverse image search is often the shortest path to identity correlation.",
  "Public records are public. Treat findings responsibly and lawfully.",
  "crt.sh can reveal overlooked subdomains via certificate history.",
  "DNS records are often more honest than marketing pages.",
  "OSINT is about discovering what is already public, not exposing private data.",
  "Track your pivots. Investigations fail when context gets lost.",
  "Use multiple search engines. Indexes differ.",
  "Confidence scoring beats guesswork in long investigations."
];

const TAGLINES = [
  "Investigating the internet, one query at a time...",
  "Privacy is a feature, not a bug.",
  "Powered by curiosity and too much caffeine.",
  "Open source intelligence, closed source paranoia.",
  "Because every investigation starts with a question."
];

const FOOTER_JOKES = [
  "Remember: It's not stalking if it's public data.",
  "No EXIF data was harmed in the making of this toolkit.",
  "This app has trust issues. Correctly.",
  "No servers were contacted unless you explicitly asked for it.",
  "Operational security is a mindset, not a toggle."
];

const LOADING_MESSAGES = [
  "Booting surveillance systems...",
  "Calibrating search algorithms...",
  "Warming up regex engines...",
  "Loading field notes...",
  "Preparing secure local workspace..."
];

const STORAGE_KEYS = {
  entities: "spin_entities",
  activePanel: "spin_active_panel",
  theme: "spin_theme",
  installDismissed: "spin_install_dismissed"
};

const BOOKMARKS = {
  "Search Engines": [
    { name: "Google", url: "https://google.com", desc: "Web search with advanced operators" },
    { name: "DuckDuckGo", url: "https://duckduckgo.com", desc: "Privacy-focused search" },
    { name: "Bing", url: "https://bing.com", desc: "Microsoft search engine" },
    { name: "Yandex", url: "https://yandex.com", desc: "Useful for reverse image searches" }
  ],
  "People Search": [
    { name: "Pipl", url: "https://pipl.com", desc: "People search engine" },
    { name: "WhitePages", url: "https://whitepages.com", desc: "Phone and address lookup" },
    { name: "TruePeopleSearch", url: "https://truepeoplesearch.com", desc: "Free people search" }
  ],
  "Social Media": [
    { name: "Namechk", url: "https://namechk.com", desc: "Username availability checker" },
    { name: "KnowEm", url: "https://knowem.com", desc: "Username search across many sites" },
    { name: "Social Blade", url: "https://socialblade.com", desc: "Social media analytics" }
  ],
  "Domain & IP": [
    { name: "Shodan", url: "https://shodan.io", desc: "Internet-connected device search" },
    { name: "Censys", url: "https://search.censys.io", desc: "Internet scanning intelligence" },
    { name: "VirusTotal", url: "https://virustotal.com", desc: "File, URL, IP analysis" },
    { name: "crt.sh", url: "https://crt.sh", desc: "Certificate transparency search" },
    { name: "Wayback Machine", url: "https://web.archive.org", desc: "Historical web snapshots" }
  ],
  "Image & Media": [
    { name: "TinEye", url: "https://tineye.com", desc: "Reverse image search" },
    { name: "Google Images", url: "https://images.google.com", desc: "Image search and reverse lookup" },
    { name: "FotoForensics", url: "https://fotoforensics.com", desc: "Image forensics and metadata" }
  ],
  "Email & Phone": [
    { name: "Have I Been Pwned", url: "https://haveibeenpwned.com", desc: "Breach exposure checks" },
    { name: "Epieos", url: "https://epieos.com", desc: "Email OSINT helper" },
    { name: "NumLookup", url: "https://numlookup.com", desc: "Phone lookup utility" }
  ],
  Geolocation: [
    { name: "Google Maps", url: "https://maps.google.com", desc: "Maps and Street View" },
    { name: "SunCalc", url: "https://suncalc.org", desc: "Sun position and shadow analysis" },
    { name: "Wikimapia", url: "https://wikimapia.org", desc: "Collaborative mapping" }
  ]
};

const USERNAME_PLATFORMS = [
  {
    key: "github",
    name: "GitHub",
    icon: "GH",
    profileUrl: (u) => `https://github.com/${encodeURIComponent(u)}`,
    check: async (username) => {
      const response = await fetchWithTimeout(
        `https://api.github.com/users/${encodeURIComponent(username)}`,
        {},
        8000
      );
      if (response.status === 200) return { status: "exists", message: "Profile found" };
      if (response.status === 404) return { status: "missing", message: "Profile not found" };
      return { status: "error", message: `HTTP ${response.status}` };
    }
  },
  {
    key: "gitlab",
    name: "GitLab",
    icon: "GL",
    profileUrl: (u) => `https://gitlab.com/${encodeURIComponent(u)}`,
    check: async (username) => {
      const response = await fetchWithTimeout(
        `https://gitlab.com/api/v4/users?username=${encodeURIComponent(username)}`,
        {},
        8000
      );
      if (!response.ok) return { status: "error", message: `HTTP ${response.status}` };
      const data = await response.json();
      return Array.isArray(data) && data.length
        ? { status: "exists", message: "Profile found" }
        : { status: "missing", message: "Profile not found" };
    }
  },
  {
    key: "reddit",
    name: "Reddit",
    icon: "RD",
    profileUrl: (u) => `https://reddit.com/user/${encodeURIComponent(u)}`,
    check: async (username) => {
      const response = await fetchWithTimeout(
        `https://www.reddit.com/user/${encodeURIComponent(username)}/about.json`,
        { headers: { Accept: "application/json" } },
        9000
      );
      if (response.status === 200) return { status: "exists", message: "Profile found" };
      if (response.status === 404) return { status: "missing", message: "Profile not found" };
      return { status: "error", message: `HTTP ${response.status}` };
    }
  },
  {
    key: "keybase",
    name: "Keybase",
    icon: "KB",
    profileUrl: (u) => `https://keybase.io/${encodeURIComponent(u)}`,
    check: async (username) => {
      const response = await fetchWithTimeout(
        `https://keybase.io/_/api/1.0/user/lookup.json?usernames=${encodeURIComponent(username)}`,
        {},
        9000
      );
      if (!response.ok) return { status: "error", message: `HTTP ${response.status}` };
      const data = await response.json();
      const users = data?.them || [];
      return users.length
        ? { status: "exists", message: "Profile found" }
        : { status: "missing", message: "Profile not found" };
    }
  },
  {
    key: "devto",
    name: "Dev.to",
    icon: "DV",
    profileUrl: (u) => `https://dev.to/${encodeURIComponent(u)}`,
    check: async (username) => {
      const response = await fetchWithTimeout(
        `https://dev.to/api/users/by_username?url=${encodeURIComponent(username)}`,
        {},
        9000
      );
      if (response.status === 200) return { status: "exists", message: "Profile found" };
      if (response.status === 404) return { status: "missing", message: "Profile not found" };
      return { status: "error", message: `HTTP ${response.status}` };
    }
  },
  {
    key: "docker",
    name: "Docker Hub",
    icon: "DK",
    profileUrl: (u) => `https://hub.docker.com/u/${encodeURIComponent(u)}`,
    check: async (username) => {
      const response = await fetchWithTimeout(
        `https://hub.docker.com/v2/users/${encodeURIComponent(username)}`,
        {},
        9000
      );
      if (response.status === 200) return { status: "exists", message: "Profile found" };
      if (response.status === 404) return { status: "missing", message: "Profile not found" };
      return { status: "error", message: `HTTP ${response.status}` };
    }
  },
  {
    key: "x",
    name: "Twitter/X",
    icon: "X",
    profileUrl: (u) => `https://x.com/${encodeURIComponent(u)}`
  },
  {
    key: "instagram",
    name: "Instagram",
    icon: "IG",
    profileUrl: (u) => `https://instagram.com/${encodeURIComponent(u)}`
  },
  {
    key: "linkedin",
    name: "LinkedIn",
    icon: "LI",
    profileUrl: (u) => `https://linkedin.com/in/${encodeURIComponent(u)}`
  },
  {
    key: "tiktok",
    name: "TikTok",
    icon: "TT",
    profileUrl: (u) => `https://www.tiktok.com/@${encodeURIComponent(u)}`
  },
  {
    key: "youtube",
    name: "YouTube",
    icon: "YT",
    profileUrl: (u) => `https://youtube.com/@${encodeURIComponent(u)}`
  },
  {
    key: "telegram",
    name: "Telegram",
    icon: "TG",
    profileUrl: (u) => `https://t.me/${encodeURIComponent(u)}`
  }
];

const COUNTRY_CODES = {
  "1": { name: "United States/Canada", format: "(XXX) XXX-XXXX" },
  "44": { name: "United Kingdom", format: "0XXXX XXXXXX" },
  "33": { name: "France", format: "0X XX XX XX XX" },
  "49": { name: "Germany", format: "0XXX XXXXXXXX" },
  "61": { name: "Australia", format: "0X XXXX XXXX" },
  "81": { name: "Japan", format: "0XX-XXXX-XXXX" },
  "86": { name: "China", format: "0XXX-XXXX-XXXX" },
  "91": { name: "India", format: "0XXXXX XXXXX" },
  "7": { name: "Russia", format: "8 (XXX) XXX-XX-XX" },
  "55": { name: "Brazil", format: "(XX) XXXXX-XXXX" },
  "52": { name: "Mexico", format: "XX XXXX XXXX" },
  "34": { name: "Spain", format: "XXX XX XX XX" },
  "39": { name: "Italy", format: "XXX XXX XXXX" }
};

const appState = {
  activePanel: "dashboard",
  jokeOrder: [],
  jokeCursor: -1,
  currentJokeIndex: -1,
  tipOrder: [],
  tipCursor: -1,
  tipPopupTimer: null,
  tickerInterval: null,
  tickerPaused: false,
  deferredInstallPrompt: null,
  sessionStart: Date.now(),
  usernameChecksRunning: false,
  collectiveRunning: false,
  externalRequests: 0,
  robotsCache: new Map()
};

const byId = (id) => document.getElementById(id);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const shuffle = (items) => {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);

const createAsyncPool = ({ concurrency = 3, delayMs = 300 } = {}) => {
  let active = 0;
  const queue = [];

  const runNext = () => {
    if (active >= concurrency || queue.length === 0) return;
    const job = queue.shift();
    active += 1;

    Promise.resolve()
      .then(job.fn)
      .then(job.resolve, job.reject)
      .finally(() => {
        active -= 1;
        setTimeout(runNext, delayMs);
      });
  };

  return {
    add: (fn) =>
      new Promise((resolve, reject) => {
        queue.push({ fn, resolve, reject });
        runNext();
      })
  };
};

const safeJsonParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch (_err) {
    return fallback;
  }
};

const escapeHtml = (value) => {
  const div = document.createElement("div");
  div.textContent = String(value);
  return div.innerHTML;
};

const escapeAttr = (value) =>
  escapeHtml(value).replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const debounce = (fn, wait = 200) => {
  let timer = null;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
};

const formatDate = (isoString) => {
  if (!isoString) return "-";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const markExternalRequest = () => {
  appState.externalRequests += 1;
  updateSecurityStatus();
};

let toastTimer = null;
const showToast = (message, type = "success") => {
  const toast = byId("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.className = "toast";
    toastTimer = null;
  }, 3200);
};

const setHint = (id, message = "", type = "info") => {
  const hint = byId(id);
  if (!hint) return;
  hint.textContent = message;
  hint.className = `input-hint ${type}`.trim();
};

const renderLoading = (containerId, label = "Analyzing locally...") => {
  const container = byId(containerId);
  if (!container) return;
  container.innerHTML = `
    <div class="loading-skeleton">
      <span class="inline-spinner" aria-hidden="true"></span>
      <span>${escapeHtml(label)}</span>
    </div>
  `;
};

const copyToClipboard = async (value) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      const area = document.createElement("textarea");
      area.value = value;
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    showToast("Copied to clipboard.");
  } catch (_err) {
    showToast("Could not copy to clipboard.", "error");
  }
};

const normalizeEntityValue = (type, value) => {
  const text = String(value).trim();
  switch (type) {
    case "email":
      return text.toLowerCase();
    case "domain":
      return text.toLowerCase().replace(/^https?:\/\//i, "").split("/")[0];
    case "phone":
      return text.replace(/[^\d+]/g, "");
    default:
      return text;
  }
};

const getEntities = () => safeJsonParse(localStorage.getItem(STORAGE_KEYS.entities) || "[]", []);

const setEntities = (entities) => {
  localStorage.setItem(STORAGE_KEYS.entities, JSON.stringify(entities));
};

const updateEntityCount = () => {
  const entities = getEntities();
  const countEl = byId("entity-count");
  const typeCountEl = byId("entity-types-count");
  if (countEl) countEl.textContent = `${entities.length}`;
  if (typeCountEl) {
    const types = new Set(entities.map((entry) => entry.type));
    typeCountEl.textContent = `${types.size}`;
  }
};

const saveEntity = (type, value, source = "Manual") => {
  const entities = getEntities();
  const normalized = normalizeEntityValue(type, value);
  const now = new Date().toISOString();
  const existing = entities.find((entry) => entry.type === type && entry.value === normalized);

  if (existing) {
    existing.count = (existing.count || 1) + 1;
    existing.lastSeen = now;
    if (source && !existing.sources.includes(source)) existing.sources.push(source);
  } else {
    entities.push({
      id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
      type,
      value: normalized,
      sources: source ? [source] : [],
      count: 1,
      firstSeen: now,
      lastSeen: now
    });
  }

  setEntities(entities);
  updateEntityCount();
  if (appState.activePanel === "hivemind") renderEntityTable();
};

const deleteEntity = (id) => {
  const entities = getEntities().filter((entry) => entry.id !== id);
  setEntities(entities);
  updateEntityCount();
  renderEntityTable();
  showToast("Entity deleted.");
};

const clearAllEntities = () => {
  if (!window.confirm("Clear all saved entities? This cannot be undone.")) return;
  localStorage.removeItem(STORAGE_KEYS.entities);
  updateEntityCount();
  renderEntityTable();
  showToast("All entities cleared.");
};

const exportEntitiesJson = () => {
  const entities = getEntities();
  if (!entities.length) {
    showToast("No entities to export.", "error");
    return;
  }
  const blob = new Blob([JSON.stringify(entities, null, 2)], { type: "application/json" });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `spin-entities-${formatDate(new Date().toISOString())}.json`;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
  showToast("Exported JSON.");
};

const toCsvCell = (value) => {
  const text = String(value ?? "");
  if (/[,"\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
};

const exportEntitiesCsv = () => {
  const entities = getEntities();
  if (!entities.length) {
    showToast("No entities to export.", "error");
    return;
  }
  const rows = [
    ["type", "value", "sources", "count", "firstSeen", "lastSeen"],
    ...entities.map((entry) => [
      entry.type,
      entry.value,
      (entry.sources || []).join(" | "),
      entry.count || 1,
      entry.firstSeen || "",
      entry.lastSeen || ""
    ])
  ];
  const csv = rows.map((row) => row.map(toCsvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `spin-entities-${formatDate(new Date().toISOString())}.csv`;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
  showToast("Exported CSV.");
};

const importEntities = () => {
  const picker = document.createElement("input");
  picker.type = "file";
  picker.accept = ".json";
  picker.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imported = safeJsonParse(reader.result, null);
      if (!Array.isArray(imported)) {
        showToast("Invalid import file format.", "error");
        return;
      }
      const current = getEntities();
      let added = 0;
      imported.forEach((item) => {
        if (!item?.type || !item?.value) return;
        const normalizedValue = normalizeEntityValue(item.type, item.value);
        const exists = current.some(
          (entry) => entry.type === item.type && entry.value === normalizedValue
        );
        if (exists) return;
        current.push({
          id: item.id || `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
          type: item.type,
          value: normalizedValue,
          sources: Array.isArray(item.sources) ? item.sources : [],
          count: Number(item.count) > 0 ? item.count : 1,
          firstSeen: item.firstSeen || new Date().toISOString(),
          lastSeen: item.lastSeen || new Date().toISOString()
        });
        added += 1;
      });
      setEntities(current);
      updateEntityCount();
      renderEntityTable();
      showToast(`Imported ${added} new entities.`);
    };
    reader.readAsText(file);
  });
  picker.click();
};

const switchPanel = (panelId) => {
  const panels = qsa(".panel");
  const tabs = qsa(".nav-tab");
  appState.activePanel = panelId;
  localStorage.setItem(STORAGE_KEYS.activePanel, panelId);

  panels.forEach((panel) => {
    const isActive = panel.id === panelId;
    panel.classList.toggle("active", isActive);
    panel.setAttribute("aria-hidden", String(!isActive));
    panel.toggleAttribute("hidden", !isActive);
  });

  tabs.forEach((tab) => {
    const isActive = tab.dataset.panel === panelId;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.setAttribute("tabindex", isActive ? "0" : "-1");
  });

  if (panelId === "hivemind") renderEntityTable();
};

const initNavigation = () => {
  const tabs = qsa(".nav-tab");
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => switchPanel(tab.dataset.panel));
    tab.addEventListener("keydown", (event) => {
      const key = event.key;
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      if (key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (key === "Home") nextIndex = 0;
      if (key === "End") nextIndex = tabs.length - 1;
      tabs[nextIndex].focus();
      switchPanel(tabs[nextIndex].dataset.panel);
    });
  });

  qsa("[data-open-panel]").forEach((card) => {
    const open = () => switchPanel(card.dataset.openPanel);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });

  const storedPanel = localStorage.getItem(STORAGE_KEYS.activePanel);
  if (storedPanel && byId(storedPanel)) switchPanel(storedPanel);
  else switchPanel("dashboard");
};

const applyTheme = (theme) => {
  const normalized = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = normalized;
  localStorage.setItem(STORAGE_KEYS.theme, normalized);
  const toggle = byId("theme-toggle");
  if (toggle) {
    const nextMode = normalized === "dark" ? "light" : "dark";
    toggle.innerHTML = `<span aria-hidden="true">${nextMode === "light" ? "Light" : "Dark"}</span>`;
    toggle.setAttribute("aria-label", `Switch to ${nextMode} mode`);
    toggle.title = `Switch to ${nextMode} mode`;
  }
};

const initTheme = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.theme);
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  applyTheme(stored || (prefersLight ? "light" : "dark"));
  byId("theme-toggle")?.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    applyTheme(current === "dark" ? "light" : "dark");
  });
};

const buildJokeOrder = (exclude = -1) => {
  const next = shuffle(JOKES.map((_, index) => index));
  if (next[0] === exclude && next.length > 1) [next[0], next[1]] = [next[1], next[0]];
  appState.jokeOrder = next;
  appState.jokeCursor = -1;
};

const getNextJokeIndex = () => {
  if (!appState.jokeOrder.length || appState.jokeCursor >= appState.jokeOrder.length - 1) {
    buildJokeOrder(appState.currentJokeIndex);
  }
  appState.jokeCursor += 1;
  appState.currentJokeIndex = appState.jokeOrder[appState.jokeCursor];
  return appState.currentJokeIndex;
};

const displayJoke = async ({ animate = true } = {}) => {
  const card = byId("joke-card");
  const text = byId("joke-text");
  const punchline = byId("joke-punchline");
  const reveal = byId("reveal-punchline-btn");
  if (!card || !text || !punchline || !reveal) return;

  if (animate) {
    card.classList.remove("joke-transition-in");
    card.classList.add("joke-transition-out");
    await delay(120);
  }

  const joke = JOKES[getNextJokeIndex()];
  text.textContent = joke.setup;
  punchline.textContent = joke.punchline;
  punchline.classList.add("is-hidden");
  reveal.textContent = "Reveal Punchline";
  reveal.setAttribute("aria-pressed", "false");

  if (animate) {
    card.classList.remove("joke-transition-out");
    card.classList.add("joke-transition-in");
    setTimeout(() => card.classList.remove("joke-transition-in"), 260);
  }
};

const revealPunchline = () => {
  const punchline = byId("joke-punchline");
  const reveal = byId("reveal-punchline-btn");
  if (!punchline || !reveal) return;
  punchline.classList.remove("is-hidden");
  reveal.textContent = "Punchline Revealed";
  reveal.setAttribute("aria-pressed", "true");
};

const initJokes = () => {
  byId("new-joke-btn")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    await displayJoke({ animate: true });
    button.disabled = false;
  });
  byId("reveal-punchline-btn")?.addEventListener("click", revealPunchline);
  displayJoke({ animate: false });
};

const buildTipOrder = (exclude = -1) => {
  const next = shuffle(TIPS.map((_, index) => index));
  if (next[0] === exclude && next.length > 1) [next[0], next[1]] = [next[1], next[0]];
  appState.tipOrder = next;
  appState.tipCursor = -1;
};

const getNextTipIndex = () => {
  if (!appState.tipOrder.length || appState.tipCursor >= appState.tipOrder.length - 1) {
    const currentIndex = appState.tipOrder[appState.tipCursor] ?? -1;
    buildTipOrder(currentIndex);
  }
  appState.tipCursor += 1;
  return appState.tipOrder[appState.tipCursor];
};

const getPreviousTipIndex = () => {
  if (!appState.tipOrder.length) {
    buildTipOrder();
    appState.tipCursor = 0;
    return appState.tipOrder[0];
  }
  appState.tipCursor -= 1;
  if (appState.tipCursor < 0) appState.tipCursor = appState.tipOrder.length - 1;
  return appState.tipOrder[appState.tipCursor];
};

const displayTip = (tipText) => {
  const ticker = byId("tip-ticker");
  if (!ticker) return;
  ticker.classList.add("tip-fade");
  setTimeout(() => {
    ticker.textContent = tipText;
    ticker.classList.remove("tip-fade");
  }, 120);
};

const nextTip = () => displayTip(TIPS[getNextTipIndex()]);
const previousTip = () => displayTip(TIPS[getPreviousTipIndex()]);

const setTickerPause = (paused) => {
  appState.tickerPaused = paused;
  const pauseButton = byId("tip-pause-btn");
  if (pauseButton) pauseButton.textContent = paused ? "Resume" : "Pause";
};

const startTicker = () => {
  if (appState.tickerInterval) clearInterval(appState.tickerInterval);
  if (appState.tickerPaused) return;
  appState.tickerInterval = setInterval(nextTip, 7000);
};

const initTicker = () => {
  nextTip();
  setTickerPause(false);
  startTicker();

  byId("tip-next-btn")?.addEventListener("click", () => {
    nextTip();
  });
  byId("tip-prev-btn")?.addEventListener("click", () => {
    previousTip();
  });
  byId("tip-pause-btn")?.addEventListener("click", () => {
    const paused = !appState.tickerPaused;
    setTickerPause(paused);
    startTicker();
  });
};

const showRandomTipPopup = () => {
  const popup = byId("tip-popup");
  const text = byId("tip-popup-text");
  if (!popup || !text) return;
  text.textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
  popup.classList.add("show");
  if (appState.tipPopupTimer) clearTimeout(appState.tipPopupTimer);
  appState.tipPopupTimer = setTimeout(() => popup.classList.remove("show"), 8000);
};

const closeTipPopup = () => {
  byId("tip-popup")?.classList.remove("show");
  if (appState.tipPopupTimer) {
    clearTimeout(appState.tipPopupTimer);
    appState.tipPopupTimer = null;
  }
};

const validators = {
  phone: (value) => {
    const input = value.trim();
    if (!input) return { valid: false, message: "Enter a phone number." };
    if (!/^\+?[0-9().\-\s]+$/.test(input)) {
      return { valid: false, message: "Use digits with optional +, spaces, (), -, or ." };
    }
    const digits = input.replace(/[^\d]/g, "");
    if (digits.length < 7 || digits.length > 15) {
      return { valid: false, message: "Phone numbers should contain 7 to 15 digits." };
    }
    return { valid: true, normalized: input.replace(/[\s().-]/g, "") };
  },
  email: (value) => {
    const input = value.trim();
    if (!input) return { valid: false, message: "Enter an email address." };
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(input)) return { valid: false, message: "Use format like user@example.com." };
    return { valid: true, normalized: input.toLowerCase() };
  },
  username: (value) => {
    const input = value.trim();
    if (!input) return { valid: false, message: "Enter a username." };
    if (!/^[a-zA-Z0-9._-]{3,30}$/.test(input)) {
      return {
        valid: false,
        message: "Use 3-30 characters: letters, numbers, dot, underscore, or hyphen."
      };
    }
    return { valid: true, normalized: input };
  },
  domain: (value) => {
    const raw = value.trim().replace(/^https?:\/\//i, "").split("/")[0];
    if (!raw) return { valid: false, message: "Enter a domain name." };
    const regex =
      /^(?=.{1,253}$)(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}$/;
    if (!regex.test(raw)) {
      return { valid: false, message: "Use a valid domain like example.com." };
    }
    return { valid: true, normalized: raw.toLowerCase() };
  }
};

const renderMessage = (message, type = "error") => `
  <div class="result-item result-message ${type}">
    <span class="result-value">${escapeHtml(message)}</span>
  </div>
`;

const maybeRenderHivemind = () => {
  if (appState.activePanel === "hivemind") renderEntityTable();
};

const analyzePhone = async (options = {}) => {
  const { silentToast = false, skipSave = false } = options;
  const inputEl = byId("phone-input");
  const results = byId("phone-results");
  if (!inputEl || !results) return { ok: false, reason: "missing-elements" };
  const validation = validators.phone(inputEl.value);
  if (!validation.valid) {
    setHint("phone-hint", validation.message, "error");
    results.innerHTML = renderMessage(validation.message);
    return { ok: false, reason: "validation", message: validation.message };
  }

  setHint("phone-hint", "Valid phone format. Running local analysis...", "success");
  renderLoading("phone-results", "Analyzing phone number locally...");
  await delay(320);

  const cleaned = validation.normalized;
  const digitsOnly = cleaned.replace(/^\+/, "");
  const codes = Object.keys(COUNTRY_CODES).sort((a, b) => b.length - a.length);
  let countryCode = "";
  let national = digitsOnly;
  let country = "Unknown";

  codes.some((code) => {
    if (!digitsOnly.startsWith(code)) return false;
    countryCode = `+${code}`;
    national = digitsOnly.slice(code.length);
    country = COUNTRY_CODES[code].name;
    return true;
  });

  const e164 = `${countryCode || "+"}${national}`;
  let lineType = "Unknown";
  if (countryCode === "+1" && national.length === 10) {
    const npa = national.slice(0, 3);
    const tollFree = new Set(["800", "888", "877", "866", "855", "844", "833"]);
    if (tollFree.has(npa)) lineType = "Toll-Free";
    else if (npa === "900") lineType = "Premium";
    else lineType = "Standard Line";
  }

  const links = [
    { name: "Google", url: `https://www.google.com/search?q="${encodeURIComponent(inputEl.value)}"` },
    { name: "DuckDuckGo", url: `https://duckduckgo.com/?q="${encodeURIComponent(inputEl.value)}"` },
    { name: "Truecaller", url: `https://www.truecaller.com/search/${encodeURIComponent(cleaned)}` }
  ];

  results.innerHTML = `
    <div class="result-item"><span class="result-label">Input</span><span class="result-value">${escapeHtml(inputEl.value.trim())}</span></div>
    <div class="result-item"><span class="result-label">E.164</span><span class="result-value">${escapeHtml(e164)} <button class="copy-btn" data-copy="${escapeAttr(e164)}">copy</button></span></div>
    <div class="result-item"><span class="result-label">Country</span><span class="result-value">${escapeHtml(country)}</span></div>
    <div class="result-item"><span class="result-label">Country Code</span><span class="result-value">${escapeHtml(countryCode || "Not detected")}</span></div>
    <div class="result-item"><span class="result-label">National</span><span class="result-value">${escapeHtml(national)}</span></div>
    <div class="result-item"><span class="result-label">Line Type</span><span class="result-value">${escapeHtml(lineType)}</span></div>
    <div class="result-item"><span class="result-label">Search</span><span class="result-value">${links
      .map((link) => `<a href="${link.url}" target="_blank" rel="noopener">${link.name}</a>`)
      .join(" &middot; ")}</span></div>
  `;

  if (!skipSave) {
    saveEntity("phone", inputEl.value, "Phone Analysis");
    maybeRenderHivemind();
  }
  if (!silentToast) showToast("Phone analyzed and saved to Hivemind.");
  return {
    ok: true,
    value: inputEl.value.trim(),
    normalized: e164,
    country,
    lineType
  };
};

const analyzeEmail = async (options = {}) => {
  const { silentToast = false, skipSave = false } = options;
  const inputEl = byId("email-input");
  const results = byId("email-results");
  if (!inputEl || !results) return { ok: false, reason: "missing-elements" };
  const validation = validators.email(inputEl.value);
  if (!validation.valid) {
    setHint("email-hint", validation.message, "error");
    results.innerHTML = renderMessage(validation.message);
    return { ok: false, reason: "validation", message: validation.message };
  }

  setHint("email-hint", "Valid email format. Running local analysis...", "success");
  renderLoading("email-results", "Analyzing email locally...");
  await delay(320);

  const input = validation.normalized;
  const [localPart, domain] = input.split("@");
  const tld = domain.split(".").pop();
  const providers = {
    "gmail.com": { name: "Google Gmail", type: "Free", disposable: false },
    "outlook.com": { name: "Microsoft Outlook", type: "Free", disposable: false },
    "hotmail.com": { name: "Microsoft Hotmail", type: "Free", disposable: false },
    "protonmail.com": { name: "ProtonMail", type: "Encrypted", disposable: false },
    "proton.me": { name: "ProtonMail", type: "Encrypted", disposable: false },
    "mailinator.com": { name: "Mailinator", type: "Disposable", disposable: true },
    "guerrillamail.com": { name: "Guerrilla Mail", type: "Disposable", disposable: true },
    "10minutemail.com": { name: "10 Minute Mail", type: "Disposable", disposable: true }
  };
  const provider = providers[domain] || {
    name: "Custom/Business",
    type: "Business/Unknown",
    disposable: false
  };

  const patterns = [];
  if (/^\d+$/.test(localPart)) patterns.push("Numeric local-part");
  if (/^[a-z]+\.[a-z]+$/i.test(localPart)) patterns.push("First.Last format");
  if (localPart.length < 4) patterns.push("Very short local-part");
  if (localPart.includes("+")) patterns.push("Uses plus alias");

  const links = [
    { name: "Google", url: `https://www.google.com/search?q="${encodeURIComponent(input)}"` },
    { name: "DuckDuckGo", url: `https://duckduckgo.com/?q="${encodeURIComponent(input)}"` },
    { name: "Have I Been Pwned", url: `https://haveibeenpwned.com/account/${encodeURIComponent(input)}` }
  ];

  results.innerHTML = `
    <div class="result-item"><span class="result-label">Email</span><span class="result-value">${escapeHtml(input)} <button class="copy-btn" data-copy="${escapeAttr(input)}">copy</button></span></div>
    <div class="result-item"><span class="result-label">Local Part</span><span class="result-value">${escapeHtml(localPart)}</span></div>
    <div class="result-item"><span class="result-label">Domain</span><span class="result-value">${escapeHtml(domain)}</span></div>
    <div class="result-item"><span class="result-label">TLD</span><span class="result-value">.${escapeHtml(tld)}</span></div>
    <div class="result-item"><span class="result-label">Provider</span><span class="result-value">${escapeHtml(provider.name)} <span class="tag ${provider.disposable ? "red" : "green"}">${escapeHtml(provider.type)}</span></span></div>
    <div class="result-item"><span class="result-label">Disposable</span><span class="result-value">${provider.disposable ? '<span class="tag red">Likely disposable</span>' : '<span class="tag green">No</span>'}</span></div>
    <div class="result-item"><span class="result-label">Patterns</span><span class="result-value">${patterns.length ? patterns.map((p) => `<span class="tag blue">${escapeHtml(p)}</span>`).join(" ") : "No notable patterns"}</span></div>
    <div class="result-item"><span class="result-label">Search</span><span class="result-value">${links
      .map((link) => `<a href="${link.url}" target="_blank" rel="noopener">${link.name}</a>`)
      .join(" &middot; ")}</span></div>
  `;

  if (!skipSave) {
    saveEntity("email", input, "Email Analysis");
    maybeRenderHivemind();
  }
  if (!silentToast) showToast("Email analyzed and saved to Hivemind.");
  return {
    ok: true,
    email: input,
    domain,
    tld,
    provider: provider.name
  };
};

const patternBadges = (input) => {
  const notes = [];
  if (/^\d+$/.test(input)) notes.push("Numeric only");
  if (input.length < 4) notes.push("Short username");
  if (input.length > 20) notes.push("Long username");
  if (/[._-]/.test(input)) notes.push("Contains separators");
  if (/\d{4}$/.test(input)) notes.push("Year-like suffix");
  return notes;
};

const updatePlatformStatus = (key, status, message) => {
  const badge = byId(`platform-status-${key}`);
  if (!badge) return;
  const icon = {
    pending: "…",
    exists: "✓",
    missing: "✕",
    error: "⚠"
  }[status] || "";
  badge.className = `platform-status ${status}`;
  badge.textContent = `${icon} ${message}`.trim();
};

const parseRobots = (text) => {
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  const rules = [];
  let applies = false;
  lines.forEach((line) => {
    if (!line || line.startsWith("#")) return;
    const [rawKey, ...rest] = line.split(":");
    if (!rawKey || !rest.length) return;
    const key = rawKey.trim().toLowerCase();
    const value = rest.join(":").trim();
    if (key === "user-agent") {
      applies = value === "*" || value.toLowerCase().includes("spin");
    } else if (key === "disallow" && applies) {
      if (value) rules.push(value);
    }
  });
  return rules;
};

const checkRobotsAllowed = async (url) => {
  try {
    const parsed = new URL(url);
    if (appState.robotsCache.has(parsed.origin)) {
      const cached = appState.robotsCache.get(parsed.origin);
      if (!cached.available) return { allowed: true };
      const blocked = cached.rules.some((rule) => parsed.pathname.startsWith(rule));
      return blocked
        ? { allowed: false, reason: "Blocked by robots.txt rules." }
        : { allowed: true };
    }

    markExternalRequest();
    const robotsResponse = await fetchWithTimeout(`${parsed.origin}/robots.txt`, {}, 5000);
    if (!robotsResponse.ok) {
      appState.robotsCache.set(parsed.origin, { available: false, rules: [] });
      return { allowed: true };
    }
    const text = await robotsResponse.text();
    const rules = parseRobots(text);
    appState.robotsCache.set(parsed.origin, { available: true, rules });
    const blocked = rules.some((rule) => parsed.pathname.startsWith(rule));
    return blocked ? { allowed: false, reason: "Blocked by robots.txt rules." } : { allowed: true };
  } catch (_err) {
    return { allowed: true };
  }
};

const profileFetchCheck = async (url) => {
  try {
    const response = await fetchWithTimeout(url, { method: "GET" }, 9000);
    if (response.status === 200) return { status: "exists", message: "Reachable (200)" };
    if (response.status === 404) return { status: "missing", message: "Not found (404)" };
    return { status: "error", message: `HTTP ${response.status}` };
  } catch (_err) {
    return {
      status: "error",
      message: "Unreachable from browser (CORS/network)"
    };
  }
};

const runUsernameChecks = async (username) => {
  if (appState.usernameChecksRunning) return;
  appState.usernameChecksRunning = true;
  const button = byId("username-live-check-btn");
  if (button) button.disabled = true;

  showToast(
    "Running live checks. This will send the username to selected public platforms.",
    "warn"
  );

  USERNAME_PLATFORMS.forEach((platform) =>
    updatePlatformStatus(platform.key, "pending", "Queued")
  );

  const pool = createAsyncPool({ concurrency: 3, delayMs: 350 });
  const jobs = USERNAME_PLATFORMS.map((platform) =>
    pool.add(async () => {
      updatePlatformStatus(platform.key, "pending", "Checking...");
      const profileUrl = platform.profileUrl(username);
      const robots = await checkRobotsAllowed(profileUrl);
      if (!robots.allowed) {
        updatePlatformStatus(platform.key, "error", robots.reason);
        return;
      }

      try {
        markExternalRequest();
        const result = platform.check
          ? await platform.check(username, profileUrl)
          : await profileFetchCheck(profileUrl);
        updatePlatformStatus(platform.key, result.status, result.message);
      } catch (error) {
        updatePlatformStatus(platform.key, "error", error?.message || "Check failed");
      }
    })
  );
  await Promise.allSettled(jobs);

  if (button) button.disabled = false;
  appState.usernameChecksRunning = false;
  showToast("Username checks completed.");
};

const analyzeUsername = async (options = {}) => {
  const { silentToast = false, skipSave = false } = options;
  const inputEl = byId("username-input");
  const results = byId("username-results");
  if (!inputEl || !results) return { ok: false, reason: "missing-elements" };
  const validation = validators.username(inputEl.value);
  if (!validation.valid) {
    setHint("username-hint", validation.message, "error");
    results.innerHTML = renderMessage(validation.message);
    return { ok: false, reason: "validation", message: validation.message };
  }

  setHint("username-hint", "Username format looks good.", "success");
  renderLoading("username-results", "Building platform matrix...");
  await delay(280);

  const username = validation.normalized;
  const localPatterns = patternBadges(username);
  const profileRows = USERNAME_PLATFORMS.map((platform) => {
    const profileUrl = platform.profileUrl(username);
    return `
      <div class="platform-check-card" id="platform-${platform.key}">
        <div class="platform-check-head">
          <span class="platform-icon">${escapeHtml(platform.icon)}</span>
          <span class="platform-name">${escapeHtml(platform.name)}</span>
        </div>
        <div class="platform-check-actions">
          <span class="platform-status pending" id="platform-status-${platform.key}">Queued</span>
          <a href="${profileUrl}" target="_blank" rel="noopener">Open</a>
        </div>
      </div>
    `;
  }).join("");

  results.innerHTML = `
    <div class="result-item"><span class="result-label">Username</span><span class="result-value">${escapeHtml(username)} <button class="copy-btn" data-copy="${escapeAttr(username)}">copy</button></span></div>
    <div class="result-item"><span class="result-label">Length</span><span class="result-value">${username.length} characters</span></div>
    <div class="result-item"><span class="result-label">Patterns</span><span class="result-value">${localPatterns.length ? localPatterns.map((item) => `<span class="tag blue">${escapeHtml(item)}</span>`).join(" ") : "Standard format"}</span></div>
    <div class="result-item"><span class="result-label">Search</span><span class="result-value"><a href="https://www.google.com/search?q=%22${encodeURIComponent(username)}%22" target="_blank" rel="noopener">Google</a> &middot; <a href="https://duckduckgo.com/?q=%22${encodeURIComponent(username)}%22" target="_blank" rel="noopener">DuckDuckGo</a></span></div>
    <div class="privacy-note">
      Live checks are optional. No external requests are made until you click <strong>Run Live Checks</strong>.
    </div>
    <div class="btn-group" style="margin-bottom:0.75rem">
      <button class="btn btn-sm" id="username-live-check-btn">Run Live Checks</button>
    </div>
    <div class="platform-check-grid">${profileRows}</div>
  `;

  byId("username-live-check-btn")?.addEventListener("click", () => runUsernameChecks(username));

  if (!skipSave) {
    saveEntity("username", username, "Username Recon");
    maybeRenderHivemind();
  }
  if (!silentToast) showToast("Username analyzed locally and saved to Hivemind.");
  return {
    ok: true,
    username,
    platforms: USERNAME_PLATFORMS.length
  };
};

const parseDomainParts = (domain) => {
  const parts = domain.split(".");
  return {
    tld: parts[parts.length - 1] || "",
    sld: parts.length >= 2 ? parts[parts.length - 2] : "",
    subdomain: parts.length > 2 ? parts.slice(0, -2).join(".") : ""
  };
};

const TLD_INFO = {
  com: "Commercial",
  org: "Organization",
  net: "Network",
  edu: "Education",
  gov: "Government",
  io: "Tech",
  ai: "AI / Anguilla",
  dev: "Developer",
  app: "Application",
  me: "Personal",
  info: "Information",
  xyz: "Generic",
  uk: "United Kingdom",
  de: "Germany",
  fr: "France",
  jp: "Japan",
  in: "India",
  onion: "Tor Hidden Service"
};

const runWhoisLookup = async (domain) => {
  const container = byId("domain-whois-live");
  if (!container) return;
  renderLoading("domain-whois-live", "Querying RDAP WHOIS...");
  try {
    markExternalRequest();
    const response = await fetchWithTimeout(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      headers: { Accept: "application/rdap+json, application/json" }
    });
    if (!response.ok) throw new Error(`WHOIS lookup failed (${response.status})`);
    const data = await response.json();

    const getEvent = (name) =>
      data?.events?.find((item) => item.eventAction === name)?.eventDate || "-";
    const registrarEntity = data?.entities?.find((entry) =>
      Array.isArray(entry.roles) && entry.roles.includes("registrar")
    );
    const registrarName = registrarEntity?.vcardArray?.[1]?.find((v) => v[0] === "fn")?.[3] || "-";
    const nameservers = (data?.nameservers || []).map((ns) => ns.ldhName).filter(Boolean);
    const statusTags = (data?.status || []).slice(0, 6);

    container.innerHTML = `
      <div class="subresult-card">
        <h4>WHOIS / RDAP</h4>
        <div class="result-item"><span class="result-label">Handle</span><span class="result-value">${escapeHtml(data?.handle || "-")}</span></div>
        <div class="result-item"><span class="result-label">Registrar</span><span class="result-value">${escapeHtml(registrarName)}</span></div>
        <div class="result-item"><span class="result-label">Created</span><span class="result-value">${escapeHtml(getEvent("registration"))}</span></div>
        <div class="result-item"><span class="result-label">Updated</span><span class="result-value">${escapeHtml(getEvent("last changed"))}</span></div>
        <div class="result-item"><span class="result-label">Expires</span><span class="result-value">${escapeHtml(getEvent("expiration"))}</span></div>
        <div class="result-item"><span class="result-label">Status</span><span class="result-value">${statusTags.length ? statusTags.map((s) => `<span class="tag">${escapeHtml(s)}</span>`).join(" ") : "-"}</span></div>
        <div class="result-item"><span class="result-label">Nameservers</span><span class="result-value">${nameservers.length ? nameservers.map(escapeHtml).join(", ") : "-"}</span></div>
      </div>
    `;
  } catch (error) {
    container.innerHTML = renderMessage(error?.message || "WHOIS lookup failed.", "error");
  }
};

const parseDnsAnswers = (answers = []) => {
  if (!Array.isArray(answers) || !answers.length) return ["No records"];
  return answers.map((record) => `${record?.name || ""} ${record?.TTL || ""} ${record?.data || ""}`.trim());
};

const runDnsLookup = async (domain) => {
  const container = byId("domain-dns-live");
  if (!container) return;
  renderLoading("domain-dns-live", "Querying DNS records...");
  const types = ["A", "AAAA", "MX", "NS", "TXT", "CNAME"];

  try {
    const lookups = await Promise.all(
      types.map(async (type) => {
        markExternalRequest();
        const response = await fetchWithTimeout(
          `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`,
          {},
          10000
        );
        if (!response.ok) return { type, records: [`Lookup failed (${response.status})`] };
        const data = await response.json();
        return { type, records: parseDnsAnswers(data?.Answer || []) };
      })
    );

    container.innerHTML = `
      <div class="subresult-card">
        <h4>DNS Records (Google DNS API)</h4>
        ${lookups
          .map(
            (lookup) => `
              <div class="result-item">
                <span class="result-label">${lookup.type}</span>
                <span class="result-value">${lookup.records.map((line) => `<div>${escapeHtml(line)}</div>`).join("")}</span>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  } catch (error) {
    container.innerHTML = renderMessage(error?.message || "DNS lookup failed.", "error");
  }
};

const analyzeDomain = async (options = {}) => {
  const { silentToast = false, skipSave = false } = options;
  const inputEl = byId("domain-input");
  const results = byId("domain-results");
  if (!inputEl || !results) return { ok: false, reason: "missing-elements" };
  const validation = validators.domain(inputEl.value);
  if (!validation.valid) {
    setHint("domain-hint", validation.message, "error");
    results.innerHTML = renderMessage(validation.message);
    return { ok: false, reason: "validation", message: validation.message };
  }

  setHint("domain-hint", "Domain format looks good.", "success");
  renderLoading("domain-results", "Analyzing domain locally...");
  await delay(320);

  const domain = validation.normalized;
  const parts = parseDomainParts(domain);
  const reconLinks = [
    { name: "WHOIS (who.is)", url: `https://who.is/whois/${encodeURIComponent(domain)}` },
    { name: "crt.sh", url: `https://crt.sh/?q=%25.${encodeURIComponent(domain)}` },
    { name: "Wayback", url: `https://web.archive.org/web/*/${encodeURIComponent(domain)}` },
    { name: "Shodan", url: `https://www.shodan.io/search?query=${encodeURIComponent(domain)}` },
    { name: "VirusTotal", url: `https://www.virustotal.com/gui/domain/${encodeURIComponent(domain)}` }
  ];

  results.innerHTML = `
    <div class="result-item"><span class="result-label">Domain</span><span class="result-value">${escapeHtml(domain)} <button class="copy-btn" data-copy="${escapeAttr(domain)}">copy</button></span></div>
    ${parts.subdomain ? `<div class="result-item"><span class="result-label">Subdomain</span><span class="result-value">${escapeHtml(parts.subdomain)}</span></div>` : ""}
    <div class="result-item"><span class="result-label">SLD</span><span class="result-value">${escapeHtml(parts.sld || "-")}</span></div>
    <div class="result-item"><span class="result-label">TLD</span><span class="result-value">.${escapeHtml(parts.tld)} <span class="tag">${escapeHtml(TLD_INFO[parts.tld] || "Unknown")}</span></span></div>
    <div class="result-item"><span class="result-label">Visit</span><span class="result-value"><a href="https://${escapeAttr(domain)}" target="_blank" rel="noopener">https://${escapeHtml(domain)}</a></span></div>
    <div class="result-item"><span class="result-label">Recon Links</span><span class="result-value">${reconLinks
      .map((link) => `<a href="${link.url}" target="_blank" rel="noopener">${link.name}</a>`)
      .join(" &middot; ")}</span></div>
    <div class="privacy-note">
      Local parsing completed. Live WHOIS/DNS lookups are optional and only run when you click below.
    </div>
    <div class="btn-group" style="margin-bottom:0.75rem">
      <button class="btn btn-sm" id="domain-whois-btn">Load WHOIS (live)</button>
      <button class="btn btn-sm" id="domain-dns-btn">Load DNS (live)</button>
    </div>
    <div id="domain-whois-live"></div>
    <div id="domain-dns-live"></div>
  `;

  byId("domain-whois-btn")?.addEventListener("click", () => runWhoisLookup(domain));
  byId("domain-dns-btn")?.addEventListener("click", () => runDnsLookup(domain));

  if (!skipSave) {
    saveEntity("domain", domain, "Domain Recon");
    maybeRenderHivemind();
  }
  if (!silentToast) showToast("Domain analyzed locally and saved to Hivemind.");
  return {
    ok: true,
    domain,
    tld: parts.tld,
    subdomain: parts.subdomain
  };
};

const collectEntitiesFromText = (text) => {
  const found = [];
  const pushMatches = (type, regex, transform = (value) => value) => {
    const matches = text.match(regex) || [];
    matches.forEach((match) => found.push({ type, value: transform(match) }));
  };

  pushMatches("email", /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g);
  pushMatches("phone", /(?:\+?\d[\d\s().-]{6,}\d)/g, (v) => v.trim());
  pushMatches(
    "ipv4",
    /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g
  );
  pushMatches(
    "domain",
    /\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(?:com|org|net|edu|gov|mil|io|co|ai|dev|app|me|info|biz|xyz|tech|online|uk|de|fr|ru|cn|jp|br|in|onion)\b/g
  );
  pushMatches("url", /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g);
  pushMatches("bitcoin", /\b(?:[13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{25,39})\b/g);
  pushMatches("ethereum", /\b0x[a-fA-F0-9]{40}\b/g);
  pushMatches("hashtag", /#[a-zA-Z]\w{1,50}/g);
  pushMatches("username", /@[a-zA-Z]\w{1,30}/g, (v) => v.slice(1));

  const uniqueMap = new Map();
  found.forEach((entry) => {
    const key = `${entry.type}:${entry.value}`;
    if (!uniqueMap.has(key)) uniqueMap.set(key, entry);
  });
  return Array.from(uniqueMap.values());
};

const extractEntities = () => {
  const input = byId("extract-input");
  const results = byId("extract-results");
  if (!input || !results) return;
  const text = input.value;
  if (!text.trim()) {
    results.innerHTML = renderMessage("Paste text to extract entities.", "error");
    return;
  }

  const unique = collectEntitiesFromText(text);

  if (!unique.length) {
    results.innerHTML = '<div class="empty-state"><p>No entities found in the provided text.</p></div>';
    return;
  }

  const colors = {
    email: "",
    phone: "green",
    ipv4: "orange",
    domain: "blue",
    url: "blue",
    bitcoin: "yellow",
    ethereum: "yellow",
    hashtag: "",
    username: "green"
  };

  results.innerHTML = `
    <p style="margin-bottom:8px;color:var(--text-dim);font-size:0.85rem">
      Found <strong style="color:var(--spin-green)">${unique.length}</strong> entities
    </p>
    <div class="extracted-list">
      ${unique
        .map(
          (entry) => `
            <div class="extracted-item">
              <span class="tag ${colors[entry.type] || ""}">${escapeHtml(entry.type)}</span>
              <span class="result-value" style="flex:1">${escapeHtml(entry.value)}</span>
              <button class="copy-btn" data-copy="${escapeAttr(entry.value)}">copy</button>
              <button class="btn btn-sm btn-green" data-save-type="${escapeAttr(entry.type)}" data-save-value="${escapeAttr(entry.value)}">save</button>
            </div>
          `
        )
        .join("")}
    </div>
  `;
  showToast(`Extracted ${unique.length} entities.`);
};

const extractFirstMatch = (text, type) => collectEntitiesFromText(text).find((entry) => entry.type === type);

const runCollectiveAnalysis = async () => {
  if (appState.collectiveRunning) return;

  const input = byId("collective-input");
  const results = byId("collective-results");
  const runBtn = byId("collective-run-btn");
  if (!input || !results || !runBtn) return;

  const briefing = input.value.trim();
  if (!briefing) {
    results.innerHTML = renderMessage("Paste a case briefing first.", "error");
    input.focus();
    return;
  }

  appState.collectiveRunning = true;
  runBtn.disabled = true;
  renderLoading("collective-results", "Coordinating all agents locally...");

  const extracted = collectEntitiesFromText(briefing);
  const counts = extracted.reduce((acc, entry) => {
    acc[entry.type] = (acc[entry.type] || 0) + 1;
    return acc;
  }, {});

  const firstPhone = extractFirstMatch(briefing, "phone")?.value || "";
  const firstEmail = extractFirstMatch(briefing, "email")?.value || "";
  const firstUsername = extractFirstMatch(briefing, "username")?.value || "";
  const firstDomain = extractFirstMatch(briefing, "domain")?.value || "";

  const agentStatus = [];
  const runAgent = async (label, fn) => {
    try {
      const result = await fn();
      if (result?.ok) {
        agentStatus.push({ label, ok: true, detail: "Completed" });
        return result;
      }
      agentStatus.push({
        label,
        ok: false,
        detail: result?.message || "Skipped or invalid input"
      });
      return result;
    } catch (error) {
      agentStatus.push({ label, ok: false, detail: error?.message || "Failed" });
      return null;
    }
  };

  if (firstPhone) byId("phone-input").value = firstPhone;
  if (firstEmail) byId("email-input").value = firstEmail;
  if (firstUsername) byId("username-input").value = firstUsername;
  if (firstDomain) byId("domain-input").value = firstDomain;
  byId("extract-input").value = briefing;

  const phoneResult = await runAgent("Phone Intel", () =>
    firstPhone ? analyzePhone({ silentToast: true, skipSave: true }) : Promise.resolve({ ok: false, message: "No phone found" })
  );
  const emailResult = await runAgent("Email Analysis", () =>
    firstEmail ? analyzeEmail({ silentToast: true, skipSave: true }) : Promise.resolve({ ok: false, message: "No email found" })
  );
  const usernameResult = await runAgent("Username Recon", () =>
    firstUsername ? analyzeUsername({ silentToast: true, skipSave: true }) : Promise.resolve({ ok: false, message: "No username found" })
  );
  const domainResult = await runAgent("Domain Recon", () =>
    firstDomain ? analyzeDomain({ silentToast: true, skipSave: true }) : Promise.resolve({ ok: false, message: "No domain found" })
  );
  const extractorResult = await runAgent("Entity Extractor", () => {
    extractEntities();
    return Promise.resolve({ ok: extracted.length > 0, message: extracted.length ? "Completed" : "No entities found" });
  });

  extracted.forEach((entry) => {
    if (["email", "phone", "domain", "username", "ipv4", "url", "bitcoin", "ethereum", "hashtag"].includes(entry.type)) {
      saveEntity(entry.type, entry.value, "Collective Orchestrator");
    }
  });
  maybeRenderHivemind();

  const completed = [phoneResult, emailResult, usernameResult, domainResult, extractorResult].filter(
    (entry) => entry?.ok
  ).length;

  results.innerHTML = `
    <div class="collective-summary-grid">
      <div class="collective-summary-item">
        <div class="collective-summary-label">Agents Completed</div>
        <div class="collective-summary-value">${completed}/5</div>
      </div>
      <div class="collective-summary-item">
        <div class="collective-summary-label">Entities Extracted</div>
        <div class="collective-summary-value">${extracted.length}</div>
      </div>
      <div class="collective-summary-item">
        <div class="collective-summary-label">Unique Types</div>
        <div class="collective-summary-value">${Object.keys(counts).length}</div>
      </div>
      <div class="collective-summary-item">
        <div class="collective-summary-label">Saved to Hivemind</div>
        <div class="collective-summary-value">${extracted.length}</div>
      </div>
    </div>
    <div class="result-item">
      <span class="result-label">Type Counts</span>
      <span class="result-value">${
        Object.keys(counts).length
          ? Object.entries(counts)
              .map(([type, count]) => `<span class="tag">${escapeHtml(type)}: ${count}</span>`)
              .join(" ")
          : "No entities"
      }</span>
    </div>
    <ul class="collective-agent-list">
      ${agentStatus
        .map(
          (agent) => `
          <li>
            <span>${agent.ok ? "✓" : "!"} ${escapeHtml(agent.label)}</span>
            <span class="collective-agent-tag">${escapeHtml(agent.detail)}</span>
          </li>
        `
        )
        .join("")}
    </ul>
    <div class="privacy-note" style="margin-top:0.7rem">
      Collective mode runs local analyzers only. Username platform checks and domain WHOIS/DNS live lookups remain manual.
    </div>
  `;

  showToast("Collective analysis complete. All local agents synchronized.");
  runBtn.disabled = false;
  appState.collectiveRunning = false;
};

const resetCollectiveAnalysis = () => {
  const input = byId("collective-input");
  const results = byId("collective-results");
  if (input) input.value = "";
  if (results) results.innerHTML = "";
  input?.focus();
};

const sortEntities = (entities, sortBy) => {
  const sorted = entities.slice();
  const compareAlpha = (a, b) => a.localeCompare(b, undefined, { sensitivity: "base" });
  switch (sortBy) {
    case "alpha-asc":
      return sorted.sort((a, b) => compareAlpha(a.value, b.value));
    case "alpha-desc":
      return sorted.sort((a, b) => compareAlpha(b.value, a.value));
    case "type-asc":
      return sorted.sort((a, b) => compareAlpha(a.type, b.type));
    case "type-desc":
      return sorted.sort((a, b) => compareAlpha(b.type, a.type));
    case "date-asc":
      return sorted.sort(
        (a, b) => new Date(a.firstSeen || a.lastSeen || 0).getTime() - new Date(b.firstSeen || b.lastSeen || 0).getTime()
      );
    case "date-desc":
    default:
      return sorted.sort(
        (a, b) => new Date(b.firstSeen || b.lastSeen || 0).getTime() - new Date(a.firstSeen || a.lastSeen || 0).getTime()
      );
  }
};

const renderEntityTable = () => {
  const body = byId("entity-table-body");
  if (!body) return;
  const filterType = byId("entity-filter")?.value || "all";
  const search = (byId("entity-search")?.value || "").toLowerCase().trim();
  const sourceFilter = (byId("entity-source-filter")?.value || "").toLowerCase().trim();
  const sortBy = byId("entity-sort")?.value || "date-desc";

  let entities = getEntities();
  if (filterType !== "all") entities = entities.filter((entry) => entry.type === filterType);
  if (search) {
    entities = entities.filter(
      (entry) =>
        entry.value.toLowerCase().includes(search) ||
        entry.type.toLowerCase().includes(search) ||
        (entry.sources || []).join(" ").toLowerCase().includes(search)
    );
  }
  if (sourceFilter) {
    entities = entities.filter((entry) =>
      (entry.sources || []).join(" ").toLowerCase().includes(sourceFilter)
    );
  }

  entities = sortEntities(entities, sortBy);

  if (!entities.length) {
    const total = getEntities().length;
    body.innerHTML = `<tr><td colspan="6" class="empty-state" style="padding:2rem"><p>${
      total ? "No matching entities for the selected filters." : "No entities yet. Use the tools to populate Hivemind."
    }</p></td></tr>`;
    return;
  }

  const colors = {
    email: "",
    phone: "green",
    ipv4: "orange",
    domain: "blue",
    url: "blue",
    bitcoin: "yellow",
    ethereum: "yellow",
    hashtag: "",
    username: "green"
  };

  body.innerHTML = entities
    .map(
      (entry) => `
        <tr>
          <td><span class="tag ${colors[entry.type] || ""}">${escapeHtml(entry.type)}</span></td>
          <td class="mono">${escapeHtml(entry.value)}</td>
          <td>${escapeHtml((entry.sources || []).join(", ") || "-")}</td>
          <td>${entry.count || 1}</td>
          <td>${escapeHtml(formatDate(entry.firstSeen || entry.lastSeen))}</td>
          <td>
            <button class="copy-btn" data-copy="${escapeAttr(entry.value)}">copy</button>
            <button class="copy-btn danger-btn" data-delete-entity="${escapeAttr(entry.id)}">del</button>
          </td>
        </tr>
      `
    )
    .join("");
};

const renderBookmarks = () => {
  const container = byId("bookmarks-container");
  if (!container) return;
  const search = (byId("bookmark-search")?.value || "").toLowerCase().trim();
  let html = "";

  Object.entries(BOOKMARKS).forEach(([category, links]) => {
    const filtered = search
      ? links.filter(
          (link) =>
            link.name.toLowerCase().includes(search) ||
            link.desc.toLowerCase().includes(search) ||
            category.toLowerCase().includes(search)
        )
      : links;
    if (!filtered.length) return;
    html += `<div class="bookmark-category">${escapeHtml(category)}</div><div class="bookmark-grid">`;
    filtered.forEach((link) => {
      html += `
        <div class="bookmark-item">
          <a href="${link.url}" target="_blank" rel="noopener">${escapeHtml(link.name)}</a>
          <div class="bookmark-desc">${escapeHtml(link.desc)}</div>
        </div>
      `;
    });
    html += "</div>";
  });

  container.innerHTML = html || '<div class="empty-state"><p>No matching bookmarks.</p></div>';
};

const rotateTagline = () => {
  const tagline = byId("header-tagline");
  if (!tagline) return;
  const next = TAGLINES[Math.floor(Math.random() * TAGLINES.length)];
  tagline.style.opacity = "0";
  setTimeout(() => {
    tagline.textContent = next;
    tagline.style.opacity = "1";
  }, 220);
};

const rotateFooterJoke = () => {
  const footer = byId("footer-joke");
  if (!footer) return;
  footer.textContent = FOOTER_JOKES[Math.floor(Math.random() * FOOTER_JOKES.length)];
};

const generateCaseNumber = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "CASE #";
  for (let i = 0; i < 6; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  byId("case-number").textContent = out;
};

const generateSessionId = () => {
  const id = `SPN-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
  byId("session-id").textContent = id;
};

const runLoadingSequence = () => {
  const status = byId("loading-status");
  const screen = byId("loading-screen");
  if (!status || !screen) return;
  const messages = shuffle(LOADING_MESSAGES);
  let index = 0;
  const interval = setInterval(() => {
    if (index >= messages.length) return;
    status.textContent = messages[index];
    index += 1;
  }, 320);
  setTimeout(() => {
    clearInterval(interval);
    status.textContent = "Systems online. Welcome, detective.";
    setTimeout(() => screen.classList.add("hidden"), 380);
  }, 2100);
};

const registerServiceWorker = () => {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("./sw.js").catch(() => {
    /* no-op */
  });
};

const canvasRoundRect = (ctx, x, y, w, h, r) => {
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const generateAppleTouchIcon = () => {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 180;
    canvas.height = 180;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#08080d";
    ctx.beginPath();
    canvasRoundRect(ctx, 0, 0, 180, 180, 36);
    ctx.fill();
    const grad = ctx.createLinearGradient(0, 0, 180, 180);
    grad.addColorStop(0, "rgba(123, 31, 235, 0.2)");
    grad.addColorStop(1, "rgba(28, 223, 102, 0.2)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    canvasRoundRect(ctx, 6, 6, 168, 168, 32);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 100px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("S", 90, 95);
    const link = document.createElement("link");
    link.rel = "apple-touch-icon";
    link.href = canvas.toDataURL("image/png");
    document.head.appendChild(link);
  } catch (_err) {
    /* no-op */
  }
};

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = () =>
  window.navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
const isInstallDismissed = () => localStorage.getItem(STORAGE_KEYS.installDismissed) === "1";

const setInstallBannerVisible = (visible) => {
  const banner = byId("install-banner");
  if (!banner) return;
  banner.classList.toggle("show", visible);
  document.body.classList.toggle("install-banner-visible", visible);
};

const dismissInstallBanner = () => {
  setInstallBannerVisible(false);
  localStorage.setItem(STORAGE_KEYS.installDismissed, "1");
};

const triggerInstall = async () => {
  if (!appState.deferredInstallPrompt) return;
  appState.deferredInstallPrompt.prompt();
  await appState.deferredInstallPrompt.userChoice;
  appState.deferredInstallPrompt = null;
};

const showInstallBannerIOS = () => {
  if (!isIOS() || isStandalone() || isInstallDismissed()) return;
  const steps = byId("install-steps");
  if (!steps) return;
  steps.innerHTML =
    '<div class="step"><span class="step-num">1</span> Tap the share button in Safari</div>' +
    '<div class="step"><span class="step-num">2</span> Tap <strong>Add to Home Screen</strong></div>' +
    '<div class="step"><span class="step-num">3</span> Tap <strong>Add</strong></div>';
  setTimeout(() => setInstallBannerVisible(true), 3500);
};

const initInstallBanner = () => {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    appState.deferredInstallPrompt = event;
    if (!isStandalone() && !isInstallDismissed()) {
      byId("install-btn").style.display = "";
      byId("install-steps").innerHTML =
        '<div class="step"><span class="step-num">&#10003;</span> Tap <strong>Install</strong> for a standalone, offline-friendly app.</div>';
      setTimeout(() => setInstallBannerVisible(true), 2000);
    }
  });

  window.addEventListener("appinstalled", () => {
    appState.deferredInstallPrompt = null;
    dismissInstallBanner();
    showToast("Spin Web installed.");
  });

  showInstallBannerIOS();
};

const updateSecurityStatus = () => {
  const connection = byId("sec-connection");
  const storage = byId("sec-storage");
  const dnt = byId("sec-dnt");
  const cookies = byId("sec-cookies");
  const dataOut = byId("sec-data-out");

  if (connection) {
    const secure = location.protocol === "https:";
    connection.querySelector(".sec-cell-indicator").className = `sec-cell-indicator ${
      secure ? "green" : "orange"
    }`;
    connection.querySelector(".sec-cell-value").textContent = secure ? "HTTPS" : "HTTP";
  }

  if (dataOut) {
    const hasExternal = appState.externalRequests > 0;
    dataOut.querySelector(".sec-cell-indicator").className = `sec-cell-indicator ${
      hasExternal ? "orange" : "green"
    }`;
    dataOut.querySelector(".sec-cell-value").textContent = hasExternal
      ? `OPT-IN (${appState.externalRequests})`
      : "ZERO";
  }

  if (storage) {
    let bytes = 0;
    try {
      Object.keys(localStorage).forEach((key) => {
        bytes += (localStorage.getItem(key) || "").length * 2;
      });
    } catch (_err) {
      bytes = 0;
    }
    const formatted =
      bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;
    storage.querySelector(".sec-cell-value").textContent = formatted;
    storage.querySelector(".sec-cell-indicator").className = `sec-cell-indicator ${
      bytes > 4 * 1024 * 1024 ? "orange" : "green"
    }`;
  }

  if (dnt) {
    const dntValue = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
    const enabled = dntValue === "1" || dntValue === "yes";
    dnt.querySelector(".sec-cell-indicator").className = `sec-cell-indicator ${
      enabled ? "green" : "orange"
    }`;
    dnt.querySelector(".sec-cell-value").textContent = enabled ? "ON" : "OFF";
  }

  if (cookies) {
    const enabled = navigator.cookieEnabled;
    cookies.querySelector(".sec-cell-indicator").className = `sec-cell-indicator ${
      enabled ? "orange" : "green"
    }`;
    cookies.querySelector(".sec-cell-value").textContent = enabled ? "ENABLED" : "BLOCKED";
  }
};

const updateSessionUptime = () => {
  const uptime = byId("sec-uptime");
  if (!uptime) return;
  const elapsed = Math.floor((Date.now() - appState.sessionStart) / 1000);
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;
  uptime.querySelector(".sec-cell-value").textContent =
    hours > 0 ? `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}` : `${pad2(minutes)}:${pad2(seconds)}`;
};

const initSecurityDashboard = () => {
  updateSecurityStatus();
  updateSessionUptime();
  setInterval(updateSessionUptime, 1000);
  setInterval(updateSecurityStatus, 30000);
};

const resetInputAndOutput = (inputId, resultId, hintId) => {
  const input = byId(inputId);
  const output = byId(resultId);
  if (input) input.value = "";
  if (output) output.innerHTML = "";
  if (hintId) setHint(hintId, "", "info");
  input?.focus();
};

const bindToolActions = () => {
  byId("phone-analyze-btn")?.addEventListener("click", analyzePhone);
  byId("email-analyze-btn")?.addEventListener("click", analyzeEmail);
  byId("username-analyze-btn")?.addEventListener("click", analyzeUsername);
  byId("domain-analyze-btn")?.addEventListener("click", analyzeDomain);
  byId("extract-btn")?.addEventListener("click", extractEntities);
  byId("collective-run-btn")?.addEventListener("click", runCollectiveAnalysis);
  byId("collective-reset-btn")?.addEventListener("click", resetCollectiveAnalysis);

  byId("phone-reset-btn")?.addEventListener("click", () =>
    resetInputAndOutput("phone-input", "phone-results", "phone-hint")
  );
  byId("email-reset-btn")?.addEventListener("click", () =>
    resetInputAndOutput("email-input", "email-results", "email-hint")
  );
  byId("username-reset-btn")?.addEventListener("click", () =>
    resetInputAndOutput("username-input", "username-results", "username-hint")
  );
  byId("domain-reset-btn")?.addEventListener("click", () =>
    resetInputAndOutput("domain-input", "domain-results", "domain-hint")
  );
  byId("extract-reset-btn")?.addEventListener("click", () =>
    resetInputAndOutput("extract-input", "extract-results")
  );

  const enterHandlers = [
    { id: "phone-input", fn: analyzePhone },
    { id: "email-input", fn: analyzeEmail },
    { id: "username-input", fn: analyzeUsername },
    { id: "domain-input", fn: analyzeDomain }
  ];
  enterHandlers.forEach(({ id, fn }) => {
    byId(id)?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") fn();
    });
  });

  byId("phone-input")?.addEventListener("input", () => {
    const value = byId("phone-input").value.trim();
    if (!value) return setHint("phone-hint", "Tip: include country code for best results.", "info");
    const validation = validators.phone(value);
    setHint("phone-hint", validation.message || "Looks good.", validation.valid ? "success" : "error");
  });
  byId("email-input")?.addEventListener("input", () => {
    const value = byId("email-input").value.trim();
    if (!value) return setHint("email-hint", "Tip: use a full address like user@example.com.", "info");
    const validation = validators.email(value);
    setHint("email-hint", validation.message || "Looks good.", validation.valid ? "success" : "error");
  });
  byId("username-input")?.addEventListener("input", () => {
    const value = byId("username-input").value.trim();
    if (!value) return setHint("username-hint", "Tip: 3-30 characters, letters/numbers/._-", "info");
    const validation = validators.username(value);
    setHint("username-hint", validation.message || "Looks good.", validation.valid ? "success" : "error");
  });
  byId("domain-input")?.addEventListener("input", () => {
    const value = byId("domain-input").value.trim();
    if (!value) return setHint("domain-hint", "Tip: use a domain like example.com.", "info");
    const validation = validators.domain(value);
    setHint("domain-hint", validation.message || "Looks good.", validation.valid ? "success" : "error");
  });
};

const bindHivemindActions = () => {
  byId("entity-import-btn")?.addEventListener("click", importEntities);
  byId("entity-export-json-btn")?.addEventListener("click", exportEntitiesJson);
  byId("entity-export-csv-btn")?.addEventListener("click", exportEntitiesCsv);
  byId("entity-clear-btn")?.addEventListener("click", clearAllEntities);

  const rerender = debounce(renderEntityTable, 120);
  ["entity-filter", "entity-sort"].forEach((id) =>
    byId(id)?.addEventListener("change", renderEntityTable)
  );
  ["entity-search", "entity-source-filter"].forEach((id) =>
    byId(id)?.addEventListener("input", rerender)
  );
};

const bindBookmarkSearch = () => {
  byId("bookmark-search")?.addEventListener("input", debounce(renderBookmarks, 150));
};

const bindDelegatedActions = () => {
  document.addEventListener("click", (event) => {
    const copyButton = event.target.closest("[data-copy]");
    if (copyButton) {
      copyToClipboard(copyButton.getAttribute("data-copy"));
      return;
    }

    const saveButton = event.target.closest("[data-save-type][data-save-value]");
    if (saveButton) {
      saveEntity(
        saveButton.getAttribute("data-save-type"),
        saveButton.getAttribute("data-save-value"),
        "Text Extract"
      );
      maybeRenderHivemind();
      showToast("Saved to Hivemind.");
      return;
    }

    const deleteButton = event.target.closest("[data-delete-entity]");
    if (deleteButton) {
      deleteEntity(deleteButton.getAttribute("data-delete-entity"));
    }
  });
};

const initRuntimeTimers = () => {
  rotateTagline();
  rotateFooterJoke();
  setInterval(rotateTagline, 10000);
  setInterval(rotateFooterJoke, 15000);
  setTimeout(() => {
    showRandomTipPopup();
    setInterval(showRandomTipPopup, 45000);
  }, 20000);
};

const initApp = () => {
  runLoadingSequence();
  registerServiceWorker();
  generateAppleTouchIcon();

  initTheme();
  initNavigation();
  initJokes();
  initTicker();
  initInstallBanner();
  initSecurityDashboard();
  initRuntimeTimers();

  bindToolActions();
  bindHivemindActions();
  bindBookmarkSearch();
  bindDelegatedActions();

  renderBookmarks();
  renderEntityTable();
  updateEntityCount();
  generateCaseNumber();
  generateSessionId();
};

window.closeTipPopup = closeTipPopup;
window.dismissInstallBanner = dismissInstallBanner;
window.triggerInstall = triggerInstall;
window.nextJoke = () => displayJoke({ animate: true });
window.switchPanel = switchPanel;

document.addEventListener("DOMContentLoaded", initApp);
