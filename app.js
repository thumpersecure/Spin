/* ════════════════════════════════════════════════════════
   Spin Web - OSINT Mini Toolkit
   Client-side JavaScript - All analysis runs locally
   ════════════════════════════════════════════════════════ */

/* ─── OSINT Detective Jokes ────────────────────────────── */
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
    punchline: "Interesting... Tell me more about your background, Dr. Williams. I see you graduated from Ohio State in 2003."
  },
  {
    setup: "What does an OSINT analyst say on a first date?",
    punchline: "\"Tell me something about yourself that isn't on your Facebook, Instagram, LinkedIn, voter registration, or property records.\""
  },
  {
    setup: "Why do OSINT analysts make terrible poker players?",
    punchline: "They already Googled everyone's tells before the game started."
  },
  {
    setup: "How many OSINT analysts does it take to change a lightbulb?",
    punchline: "None. They already found the manufacturer's internal maintenance schedule on an exposed S3 bucket."
  },
  {
    setup: "My OPSEC is so good...",
    punchline: "Even I can't find myself on the internet. Wait, that's not OPSEC. That's just loneliness."
  },
  {
    setup: "What's an OSINT investigator's favorite pickup line?",
    punchline: "\"I'd ask for your number, but I already pulled it from the data breach.\""
  },
  {
    setup: "Why did Jessica Jones switch to digital investigations?",
    punchline: "Because you can drink whiskey while doing WHOIS lookups and nobody judges you."
  },
  {
    setup: "An OSINT analyst, a pentester, and a social engineer walk into a bar.",
    punchline: "The OSINT analyst already knew about the bar from the bartender's Instagram. The pentester found the back door was unlocked. The social engineer convinced everyone it was a company event."
  },
  {
    setup: "What's the scariest thing an OSINT investigator can say?",
    punchline: "\"I found your old MySpace page.\""
  },
  {
    setup: "Why did the detective use Shodan instead of Google?",
    punchline: "Because Google finds websites, but Shodan finds the guy who forgot to put a password on his security camera."
  },
  {
    setup: "OSINT Rule #1: Everything is findable. OSINT Rule #2:",
    punchline: "You probably shouldn't have posted that."
  },
  {
    setup: "What did the metadata say to the photo?",
    punchline: "\"You might look anonymous, but I know exactly where and when you were taken.\""
  },
  {
    setup: "How does an OSINT analyst introduce themselves at parties?",
    punchline: "\"Oh we've already met. I just read your guest list, LinkedIn, and the host's public Venmo transactions.\""
  },
  {
    setup: "Why do OSINT investigators love the Wayback Machine?",
    punchline: "Because the internet never forgets... even when you desperately want it to."
  },
  {
    setup: "Roses are red, violets are blue,",
    punchline: "Your EXIF data told me the GPS coordinates of you."
  },
  {
    setup: "What's the OSINT analyst's version of a bedtime story?",
    punchline: "\"Once upon a time, someone used the same username everywhere. The end.\""
  },
  {
    setup: "A detective asked me: \"What's your alibi?\"",
    punchline: "I said: \"My alibi is an investigation. My alias is an identity.\" He said: \"Sir this is a Wendy's.\""
  },
  {
    setup: "Why did the OSINT analyst get kicked out of the library?",
    punchline: "They kept trying to do a WHOIS lookup on the librarian."
  },
  {
    setup: "What do you call an OSINT analyst on vacation?",
    punchline: "A person who just happens to be analyzing everyone's Wi-Fi networks at the resort. For fun."
  },
  {
    setup: "The OSINT analyst's motto:",
    punchline: "\"I'm not paranoid. I'm just well-informed about how much of your data is publicly available.\""
  },
  {
    setup: "How did the OSINT analyst catch the suspect?",
    punchline: "The suspect's operational security was perfect. Except for the dog's Instagram account. The dog has 400 followers."
  },
  {
    setup: "What's worse than finding out your data was in a breach?",
    punchline: "Finding out your password was literally 'password123' and even the hackers were disappointed in you."
  }
];

/* ─── OSINT Tips & Field Notes ─────────────────────────── */
const TIPS = [
  "Google dorking is not an insult. Try: site:target.com filetype:pdf",
  "The Wayback Machine never forgets, even if they deleted it.",
  "92% of all OSINT investigations start with 'Let me just check one more thing...'",
  "EXIF data: Because your photos are snitches.",
  "Always check if the username is the same across platforms. People are creatures of habit.",
  "Pro tip: The best OSINT tool is patience and a search engine.",
  "Reverse image search isn't just for catfishing. It's for justice.",
  "A disposable email address is nature's way of saying 'I have something to hide.'",
  "crt.sh reveals all SSL certificates ever issued. Subdomains love to gossip.",
  "When in doubt, check the DNS. It knows things.",
  "LinkedIn is basically voluntary corporate surveillance.",
  "Shodan: The search engine that makes IoT manufacturers nervous.",
  "Fun fact: Metadata is the digital equivalent of accidentally leaving your name tag on.",
  "Public records are public. That's not a bug, that's a feature.",
  "The average person has 100+ online accounts. That's 100+ OSINT opportunities.",
  "Browser fingerprinting: Because cookies were too obvious.",
  "If their profile picture is the same everywhere, reverse image search is your friend.",
  "Remember: OSINT is about finding what's already public, not making things public.",
  "Cached pages: Because someone always forgets about Google's memory.",
  "The best investigators know when to stop. Just kidding, we never stop."
];

const TAGLINES = [
  "Investigating the internet, one query at a time...",
  "All your OSINT are belong to us.",
  "Privacy is a feature, not a bug.",
  "Jessica Jones would approve of this toolkit.",
  "Who needs a magnifying glass when you have Google dorks?",
  "Making metadata nervous since 2024.",
  "Your friendly neighborhood OSINT toolkit.",
  "We find things. It's kind of our whole deal.",
  "Powered by curiosity and too much caffeine.",
  "The internet remembers. We help you search it.",
  "Open source intelligence, closed source paranoia.",
  "Because every investigation starts with a question.",
];

const FOOTER_JOKES = [
  "Remember: It's not stalking if it's public data.",
  "No EXIF data was harmed in the making of this toolkit.",
  "This page is being monitored. Just kidding. Or are we?",
  "Fun fact: You're the 1,337th visitor. Trust us.",
  "Disclaimer: Spin is not responsible for what you find about yourself.",
  "Side effects may include: paranoia about your own digital footprint.",
  "Powered by JavaScript, caffeine, and a healthy distrust of metadata.",
  "Jessica Jones says: \"The truth is always out there. Usually on page 2 of Google.\"",
  "If you can read this, your OPSEC needs work. We know your screen resolution.",
  "No servers were contacted during this session. Pinky promise.",
];

const LOADING_MESSAGES = [
  "Booting surveillance systems...",
  "Calibrating search algorithms...",
  "Establishing secure connection...",
  "Loading OSINT databases...",
  "Warming up regex engines...",
  "Polishing magnifying glass...",
  "Checking the Wayback Machine... for fun...",
  "Systems nominal. Coffee levels: critical.",
];

/* ─── State ────────────────────────────────────────────── */
let currentJokeIndex = -1;
let tipPopupTimer = null;

/* ─── Navigation ───────────────────────────────────────── */
function switchPanel(panelId) {
  document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
  document.querySelectorAll('.nav-tab').forEach(function(t) { t.classList.remove('active'); });

  var panel = document.getElementById(panelId);
  var tab = document.querySelector('[data-panel="' + panelId + '"]');

  if (panel) panel.classList.add('active');
  if (tab) tab.classList.add('active');

  // Render hivemind table when switching to it
  if (panelId === 'hivemind') {
    renderEntityTable();
  }
}

/* ─── Toast Notification ─────────────────────────────────  */
function showToast(message) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 3000);
}

/* ─── Clipboard ──────────────────────────────────────────  */
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      showToast('Copied to clipboard');
    }).catch(function() {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (e) { /* ignore */ }
  document.body.removeChild(ta);
  showToast('Copied to clipboard');
}

/* ─── Entity Storage (localStorage) ──────────────────── */
var STORAGE_KEY = 'spin_entities';

function getEntities() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function saveEntity(type, value, source) {
  var entities = getEntities();
  var existing = null;
  for (var i = 0; i < entities.length; i++) {
    if (entities[i].type === type && entities[i].value === value) {
      existing = entities[i];
      break;
    }
  }

  if (existing) {
    existing.count = (existing.count || 1) + 1;
    existing.lastSeen = new Date().toISOString();
    if (source && existing.sources.indexOf(source) === -1) {
      existing.sources.push(source);
    }
  } else {
    entities.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      type: type,
      value: value,
      sources: source ? [source] : [],
      count: 1,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(entities));
  updateEntityCount();
  return entities;
}

function clearEntities() {
  if (confirm('Clear all saved entities? This cannot be undone.')) {
    localStorage.removeItem(STORAGE_KEY);
    renderEntityTable();
    updateEntityCount();
    showToast('All entities cleared. Fresh start, detective.');
  }
}

function deleteEntity(id) {
  var entities = getEntities().filter(function(e) { return e.id !== id; });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entities));
  renderEntityTable();
  updateEntityCount();
}

function updateEntityCount() {
  var entities = getEntities();
  var countEl = document.getElementById('entity-count');
  if (countEl) countEl.textContent = entities.length;

  var types = {};
  entities.forEach(function(e) {
    types[e.type] = (types[e.type] || 0) + 1;
  });
  var typeEl = document.getElementById('entity-types-count');
  if (typeEl) typeEl.textContent = Object.keys(types).length;
}

/* ─── Joke System ────────────────────────────────────────  */
function nextJoke() {
  currentJokeIndex = (currentJokeIndex + 1) % JOKES.length;
  displayJoke(JOKES[currentJokeIndex]);
}

function randomJoke() {
  var idx = Math.floor(Math.random() * JOKES.length);
  // Avoid repeating the same joke
  while (idx === currentJokeIndex && JOKES.length > 1) {
    idx = Math.floor(Math.random() * JOKES.length);
  }
  currentJokeIndex = idx;
  displayJoke(JOKES[idx]);
}

function displayJoke(joke) {
  var textEl = document.getElementById('joke-text');
  var punchEl = document.getElementById('joke-punchline');
  if (!textEl || !punchEl) return;

  textEl.textContent = joke.setup;
  punchEl.textContent = '';
  punchEl.style.opacity = '0';

  // Reveal punchline after a beat
  setTimeout(function() {
    punchEl.textContent = joke.punchline;
    punchEl.style.opacity = '1';
    punchEl.style.transition = 'opacity 0.4s ease';
  }, 1500);
}

/* ─── Tip System ─────────────────────────────────────────  */
function showRandomTip() {
  var popup = document.getElementById('tip-popup');
  var textEl = document.getElementById('tip-popup-text');
  if (!popup || !textEl) return;

  var tip = TIPS[Math.floor(Math.random() * TIPS.length)];
  textEl.textContent = tip;
  popup.classList.add('show');

  // Auto-dismiss after 8 seconds
  if (tipPopupTimer) clearTimeout(tipPopupTimer);
  tipPopupTimer = setTimeout(function() {
    closeTipPopup();
  }, 8000);
}

function closeTipPopup() {
  var popup = document.getElementById('tip-popup');
  if (popup) popup.classList.remove('show');
  if (tipPopupTimer) {
    clearTimeout(tipPopupTimer);
    tipPopupTimer = null;
  }
}

/* ─── Ticker ─────────────────────────────────────────────  */
function initTicker() {
  var tickerEl = document.getElementById('tip-ticker');
  if (!tickerEl) return;

  // Build a long string of tips separated by bullets
  var shuffled = TIPS.slice().sort(function() { return Math.random() - 0.5; });
  var tickerText = shuffled.join('  \u2022  ');
  // Duplicate for seamless loop
  tickerEl.textContent = tickerText + '  \u2022  ' + tickerText;
}

/* ─── Header Tagline Rotation ────────────────────────────  */
function rotateTagline() {
  var el = document.getElementById('header-tagline');
  if (!el) return;
  var tagline = TAGLINES[Math.floor(Math.random() * TAGLINES.length)];
  el.style.opacity = '0';
  setTimeout(function() {
    el.textContent = tagline;
    el.style.opacity = '1';
    el.style.transition = 'opacity 0.5s ease';
  }, 300);
}

/* ─── Footer Joke Rotation ───────────────────────────────  */
function rotateFooterJoke() {
  var el = document.getElementById('footer-joke');
  if (!el) return;
  var joke = FOOTER_JOKES[Math.floor(Math.random() * FOOTER_JOKES.length)];
  el.textContent = joke;
}

/* ─── Case Number Generator ──────────────────────────────  */
function generateCaseNumber() {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var caseNum = 'CASE #';
  for (var i = 0; i < 6; i++) {
    caseNum += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  var el = document.getElementById('case-number');
  if (el) el.textContent = caseNum;
}

/* ─── Session ID ─────────────────────────────────────────  */
function generateSessionId() {
  var id = 'SPN-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  var el = document.getElementById('session-id');
  if (el) el.textContent = id;
}

/* ─── Phone Intelligence ─────────────────────────────────  */
function analyzePhone() {
  var input = document.getElementById('phone-input').value.trim();
  if (!input) {
    showToast('Enter a phone number first, detective.');
    return;
  }

  var results = document.getElementById('phone-results');
  var cleaned = input.replace(/[\s\-\.\(\)]/g, '');

  var countryCode = '';
  var national = cleaned;
  var country = 'Unknown';

  var countryCodes = {
    '1': { name: 'United States/Canada', format: '(XXX) XXX-XXXX' },
    '44': { name: 'United Kingdom', format: '0XXXX XXXXXX' },
    '33': { name: 'France', format: '0X XX XX XX XX' },
    '49': { name: 'Germany', format: '0XXX XXXXXXXX' },
    '61': { name: 'Australia', format: '0X XXXX XXXX' },
    '81': { name: 'Japan', format: '0XX-XXXX-XXXX' },
    '86': { name: 'China', format: '0XXX-XXXX-XXXX' },
    '91': { name: 'India', format: '0XXXXX XXXXX' },
    '7': { name: 'Russia', format: '8 (XXX) XXX-XX-XX' },
    '55': { name: 'Brazil', format: '(XX) XXXXX-XXXX' },
    '52': { name: 'Mexico', format: 'XX XXXX XXXX' },
    '34': { name: 'Spain', format: 'XXX XX XX XX' },
    '39': { name: 'Italy', format: 'XXX XXX XXXX' }
  };

  var phoneDigits = cleaned.replace(/^\+/, '');

  // Sort by code length descending for correct matching
  var codes = Object.keys(countryCodes).sort(function(a, b) { return b.length - a.length; });
  for (var i = 0; i < codes.length; i++) {
    var code = codes[i];
    if (phoneDigits.indexOf(code) === 0) {
      countryCode = '+' + code;
      national = phoneDigits.slice(code.length);
      country = countryCodes[code].name;
      break;
    }
  }

  var e164 = countryCode ? (countryCode + national) : ('+' + phoneDigits);

  // Line type detection
  var carrier = 'Unknown';
  if (countryCode === '+1' && national.length === 10) {
    var npa = national.slice(0, 3);
    var tollFree = { '800':1, '888':1, '877':1, '866':1, '855':1, '844':1, '833':1 };
    if (tollFree[npa]) carrier = 'Toll-Free';
    else if (npa === '900') carrier = 'Premium Rate';
    else carrier = 'Standard Line';
  }

  var searchQueries = [
    { name: 'Google', url: 'https://www.google.com/search?q="' + encodeURIComponent(input) + '"' },
    { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q="' + encodeURIComponent(input) + '"' },
    { name: 'TrueCaller', url: 'https://www.truecaller.com/search/' + encodeURIComponent(cleaned) },
    { name: 'NumLookup', url: 'https://www.numlookup.com/search?phone=' + encodeURIComponent(cleaned) }
  ];

  var html = '' +
    '<div class="result-item"><span class="result-label">Input</span><span class="result-value">' + escapeHtml(input) + '</span></div>' +
    '<div class="result-item"><span class="result-label">E.164 Format</span><span class="result-value">' + escapeHtml(e164) + ' <button class="copy-btn" onclick="copyToClipboard(\'' + escapeJs(e164) + '\')">copy</button></span></div>' +
    '<div class="result-item"><span class="result-label">Country</span><span class="result-value">' + escapeHtml(country) + '</span></div>' +
    '<div class="result-item"><span class="result-label">Country Code</span><span class="result-value">' + escapeHtml(countryCode || 'Not detected') + '</span></div>' +
    '<div class="result-item"><span class="result-label">National #</span><span class="result-value">' + escapeHtml(national) + '</span></div>' +
    '<div class="result-item"><span class="result-label">Digits</span><span class="result-value">' + national.length + '</span></div>' +
    '<div class="result-item"><span class="result-label">Line Type</span><span class="result-value">' + escapeHtml(carrier) + '</span></div>' +
    '<div class="result-item"><span class="result-label">Search Links</span><span class="result-value">' +
      searchQueries.map(function(q) { return '<a href="' + q.url + '" target="_blank" rel="noopener">' + q.name + '</a>'; }).join(' &middot; ') +
    '</span></div>';

  results.innerHTML = html;
  saveEntity('phone', input, 'Phone Analysis');
  showToast('Phone analyzed & saved to Hivemind');
}

/* ─── Email Intelligence ─────────────────────────────────  */
function analyzeEmail() {
  var input = document.getElementById('email-input').value.trim();
  if (!input) {
    showToast('Enter an email address first.');
    return;
  }

  var results = document.getElementById('email-results');
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(input)) {
    results.innerHTML = '<div class="result-item"><span class="result-value" style="color:var(--spin-red)">Invalid email format. Even Jessica Jones knows that\'s not an email.</span></div>';
    return;
  }

  var parts = input.split('@');
  var localPart = parts[0];
  var domain = parts[1];
  var tld = domain.split('.').pop().toLowerCase();

  var providers = {
    'gmail.com': { name: 'Google Gmail', type: 'Free', disposable: false },
    'googlemail.com': { name: 'Google Gmail', type: 'Free', disposable: false },
    'yahoo.com': { name: 'Yahoo Mail', type: 'Free', disposable: false },
    'outlook.com': { name: 'Microsoft Outlook', type: 'Free', disposable: false },
    'hotmail.com': { name: 'Microsoft Hotmail', type: 'Free', disposable: false },
    'live.com': { name: 'Microsoft Live', type: 'Free', disposable: false },
    'protonmail.com': { name: 'ProtonMail', type: 'Encrypted', disposable: false },
    'proton.me': { name: 'ProtonMail', type: 'Encrypted', disposable: false },
    'tutanota.com': { name: 'Tutanota', type: 'Encrypted', disposable: false },
    'icloud.com': { name: 'Apple iCloud', type: 'Free', disposable: false },
    'me.com': { name: 'Apple', type: 'Free', disposable: false },
    'aol.com': { name: 'AOL', type: 'Free', disposable: false },
    'mail.com': { name: 'Mail.com', type: 'Free', disposable: false },
    'yandex.com': { name: 'Yandex', type: 'Free (Russian)', disposable: false },
    'tempmail.com': { name: 'TempMail', type: 'Disposable', disposable: true },
    'guerrillamail.com': { name: 'Guerrilla Mail', type: 'Disposable', disposable: true },
    'mailinator.com': { name: 'Mailinator', type: 'Disposable', disposable: true },
    'throwaway.email': { name: 'Throwaway', type: 'Disposable', disposable: true },
    'temp-mail.org': { name: 'Temp-Mail', type: 'Disposable', disposable: true },
    'sharklasers.com': { name: 'Guerrilla (alt)', type: 'Disposable', disposable: true },
    '10minutemail.com': { name: '10 Minute Mail', type: 'Disposable', disposable: true }
  };

  var provider = providers[domain.toLowerCase()] || { name: 'Custom/Business', type: 'Business/Unknown', disposable: false };

  var patterns = [];
  if (/^\d+$/.test(localPart)) patterns.push('Numeric only');
  if (/^[a-z]+\.[a-z]+$/i.test(localPart)) patterns.push('First.Last format');
  if (/^[a-z]+[._][a-z]+\d*$/i.test(localPart)) patterns.push('Name+separator pattern');
  if (localPart.length < 4) patterns.push('Very short local part');
  if (localPart.length > 30) patterns.push('Unusually long local part');
  if (/\+/.test(localPart)) patterns.push('Uses + alias (Gmail trick)');
  if (/^[a-z]{1,3}\d{4,}$/i.test(localPart)) patterns.push('Possibly auto-generated');

  var searchQueries = [
    { name: 'Google', url: 'https://www.google.com/search?q="' + encodeURIComponent(input) + '"' },
    { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q="' + encodeURIComponent(input) + '"' },
    { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com/account/' + encodeURIComponent(input) },
    { name: 'Epieos', url: 'https://epieos.com/?q=' + encodeURIComponent(input) }
  ];

  var html = '' +
    '<div class="result-item"><span class="result-label">Email</span><span class="result-value">' + escapeHtml(input) + ' <button class="copy-btn" onclick="copyToClipboard(\'' + escapeJs(input) + '\')">copy</button></span></div>' +
    '<div class="result-item"><span class="result-label">Local Part</span><span class="result-value">' + escapeHtml(localPart) + '</span></div>' +
    '<div class="result-item"><span class="result-label">Domain</span><span class="result-value">' + escapeHtml(domain) + '</span></div>' +
    '<div class="result-item"><span class="result-label">TLD</span><span class="result-value">.' + escapeHtml(tld) + '</span></div>' +
    '<div class="result-item"><span class="result-label">Provider</span><span class="result-value">' + escapeHtml(provider.name) + ' <span class="tag ' + (provider.disposable ? 'red' : 'green') + '">' + provider.type + '</span></span></div>' +
    '<div class="result-item"><span class="result-label">Disposable?</span><span class="result-value">' + (provider.disposable ? '<span class="tag red">YES - Likely disposable</span>' : '<span class="tag green">No</span>') + '</span></div>' +
    '<div class="result-item"><span class="result-label">Patterns</span><span class="result-value">' + (patterns.length ? patterns.map(function(p) { return '<span class="tag blue">' + p + '</span>'; }).join(' ') : 'No notable patterns') + '</span></div>' +
    '<div class="result-item"><span class="result-label">Search Links</span><span class="result-value">' +
      searchQueries.map(function(q) { return '<a href="' + q.url + '" target="_blank" rel="noopener">' + q.name + '</a>'; }).join(' &middot; ') +
    '</span></div>';

  results.innerHTML = html;
  saveEntity('email', input, 'Email Analysis');
  showToast('Email analyzed & saved to Hivemind');
}

/* ─── Username Reconnaissance ────────────────────────────  */
function analyzeUsername() {
  var input = document.getElementById('username-input').value.trim();
  if (!input) {
    showToast('Enter a username to investigate.');
    return;
  }

  var results = document.getElementById('username-results');
  var encoded = encodeURIComponent(input);

  var platforms = [
    { name: 'GitHub', url: 'https://github.com/' + encoded, icon: 'GH' },
    { name: 'Twitter/X', url: 'https://x.com/' + encoded, icon: 'X' },
    { name: 'Instagram', url: 'https://instagram.com/' + encoded, icon: 'IG' },
    { name: 'Reddit', url: 'https://reddit.com/user/' + encoded, icon: 'RD' },
    { name: 'LinkedIn', url: 'https://linkedin.com/in/' + encoded, icon: 'LI' },
    { name: 'Facebook', url: 'https://facebook.com/' + encoded, icon: 'FB' },
    { name: 'TikTok', url: 'https://tiktok.com/@' + encoded, icon: 'TT' },
    { name: 'YouTube', url: 'https://youtube.com/@' + encoded, icon: 'YT' },
    { name: 'Pinterest', url: 'https://pinterest.com/' + encoded, icon: 'PN' },
    { name: 'Twitch', url: 'https://twitch.tv/' + encoded, icon: 'TW' },
    { name: 'Steam', url: 'https://steamcommunity.com/id/' + encoded, icon: 'ST' },
    { name: 'Keybase', url: 'https://keybase.io/' + encoded, icon: 'KB' },
    { name: 'HackerOne', url: 'https://hackerone.com/' + encoded, icon: 'H1' },
    { name: 'Medium', url: 'https://medium.com/@' + encoded, icon: 'MD' },
    { name: 'Mastodon', url: 'https://mastodon.social/@' + encoded, icon: 'MA' },
    { name: 'Telegram', url: 'https://t.me/' + encoded, icon: 'TG' }
  ];

  var analysis = [];
  if (input.length < 4) analysis.push('Very short username');
  if (input.length > 20) analysis.push('Long username');
  if (/^\d+$/.test(input)) analysis.push('Numeric only');
  if (/^[a-z]+$/i.test(input)) analysis.push('Letters only');
  if (/[._\-]/.test(input)) analysis.push('Contains separators');
  if (/\d{4}$/.test(input)) analysis.push('Ends with year-like number');
  if (/^[a-z]+\d{1,3}$/i.test(input)) analysis.push('Name+number pattern');

  var html = '' +
    '<div class="result-item"><span class="result-label">Username</span><span class="result-value">' + escapeHtml(input) + ' <button class="copy-btn" onclick="copyToClipboard(\'' + escapeJs(input) + '\')">copy</button></span></div>' +
    '<div class="result-item"><span class="result-label">Length</span><span class="result-value">' + input.length + ' characters</span></div>' +
    '<div class="result-item"><span class="result-label">Patterns</span><span class="result-value">' + (analysis.length ? analysis.map(function(a) { return '<span class="tag blue">' + a + '</span>'; }).join(' ') : 'Standard format') + '</span></div>' +
    '<div class="result-item"><span class="result-label">Search</span><span class="result-value">' +
      '<a href="https://www.google.com/search?q=%22' + encoded + '%22" target="_blank" rel="noopener">Google</a> &middot; ' +
      '<a href="https://duckduckgo.com/?q=%22' + encoded + '%22" target="_blank" rel="noopener">DDG</a>' +
    '</span></div>';

  html += '<div style="margin-top:1rem"><strong style="font-size:0.85rem;color:var(--text-bright)">Check Platforms:</strong></div>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px;margin-top:8px">';
  platforms.forEach(function(p) {
    html += '<a href="' + p.url + '" target="_blank" rel="noopener" class="bookmark-item" style="text-decoration:none">' +
      '<span style="font-weight:600;color:var(--spin-blue)">' + p.icon + '</span>' +
      '<span style="margin-left:6px;color:var(--text)">' + p.name + '</span>' +
    '</a>';
  });
  html += '</div>';

  results.innerHTML = html;
  saveEntity('username', input, 'Username Recon');
  showToast('Username analyzed & saved to Hivemind');
}

/* ─── Domain Reconnaissance ──────────────────────────────  */
function analyzeDomain() {
  var raw = document.getElementById('domain-input').value.trim();
  var input = raw.replace(/^https?:\/\//, '').split('/')[0];
  if (!input) {
    showToast('Enter a domain to investigate.');
    return;
  }

  var results = document.getElementById('domain-results');
  var encoded = encodeURIComponent(input);

  var parts = input.split('.');
  var tld = parts[parts.length - 1];
  var sld = parts.length >= 2 ? parts[parts.length - 2] : '';
  var subdomain = parts.length > 2 ? parts.slice(0, -2).join('.') : '';

  var tldInfo = {
    'com': 'Commercial', 'org': 'Organization', 'net': 'Network', 'edu': 'Education',
    'gov': 'Government', 'mil': 'Military', 'io': 'Tech (Indian Ocean)', 'co': 'Colombia/Commercial',
    'ai': 'Anguilla/AI', 'dev': 'Developer', 'app': 'Application', 'me': 'Montenegro/Personal',
    'info': 'Information', 'biz': 'Business', 'xyz': 'Generic', 'tech': 'Technology',
    'online': 'Generic', 'ru': 'Russia', 'cn': 'China', 'uk': 'United Kingdom',
    'de': 'Germany', 'fr': 'France', 'jp': 'Japan', 'br': 'Brazil', 'in': 'India',
    'onion': 'Tor Hidden Service', 'i2p': 'I2P Network'
  };

  var reconLinks = [
    { name: 'WHOIS (who.is)', url: 'https://who.is/whois/' + encoded },
    { name: 'DNS Records', url: 'https://dnsdumpster.com/' },
    { name: 'Shodan', url: 'https://www.shodan.io/search?query=' + encoded },
    { name: 'Censys', url: 'https://search.censys.io/hosts?q=' + encoded },
    { name: 'crt.sh (SSL Certs)', url: 'https://crt.sh/?q=%25.' + encoded },
    { name: 'Wayback Machine', url: 'https://web.archive.org/web/*/' + encoded },
    { name: 'VirusTotal', url: 'https://www.virustotal.com/gui/domain/' + encoded },
    { name: 'SecurityTrails', url: 'https://securitytrails.com/domain/' + encoded + '/dns' },
    { name: 'BuiltWith', url: 'https://builtwith.com/' + encoded },
    { name: 'Netcraft', url: 'https://sitereport.netcraft.com/?url=' + encoded },
    { name: 'Google Dorks', url: 'https://www.google.com/search?q=site:' + encoded },
    { name: 'Subdomains', url: 'https://www.google.com/search?q=site:*.' + encoded + '+-www' }
  ];

  var html = '' +
    '<div class="result-item"><span class="result-label">Domain</span><span class="result-value">' + escapeHtml(input) + ' <button class="copy-btn" onclick="copyToClipboard(\'' + escapeJs(input) + '\')">copy</button></span></div>' +
    (subdomain ? '<div class="result-item"><span class="result-label">Subdomain</span><span class="result-value">' + escapeHtml(subdomain) + '</span></div>' : '') +
    '<div class="result-item"><span class="result-label">SLD</span><span class="result-value">' + escapeHtml(sld) + '</span></div>' +
    '<div class="result-item"><span class="result-label">TLD</span><span class="result-value">.' + escapeHtml(tld) + ' <span class="tag">' + (tldInfo[tld.toLowerCase()] || 'Unknown') + '</span></span></div>' +
    '<div class="result-item"><span class="result-label">Visit</span><span class="result-value"><a href="https://' + escapeHtml(input) + '" target="_blank" rel="noopener">https://' + escapeHtml(input) + '</a></span></div>';

  html += '<div style="margin-top:1rem"><strong style="font-size:0.85rem;color:var(--text-bright)">Reconnaissance Tools:</strong></div>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px;margin-top:8px">';
  reconLinks.forEach(function(link) {
    html += '<a href="' + link.url + '" target="_blank" rel="noopener" class="bookmark-item" style="text-decoration:none">' +
      '<span style="color:var(--spin-blue)">' + link.name + '</span>' +
    '</a>';
  });
  html += '</div>';

  results.innerHTML = html;
  saveEntity('domain', input, 'Domain Recon');
  showToast('Domain analyzed & saved to Hivemind');
}

/* ─── Entity Extractor ───────────────────────────────────  */
function extractEntities() {
  var text = document.getElementById('extract-input').value;
  if (!text.trim()) {
    showToast('Paste some text to extract entities from.');
    return;
  }

  var results = document.getElementById('extract-results');
  var found = [];

  // Email regex
  var emails = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [];
  emails.forEach(function(e) { found.push({ type: 'email', value: e }); });

  // Phone regex
  var phones = text.match(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || [];
  phones.forEach(function(p) { found.push({ type: 'phone', value: p.trim() }); });

  // IPv4
  var ipv4s = text.match(/\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g) || [];
  ipv4s.forEach(function(ip) { found.push({ type: 'ipv4', value: ip }); });

  // Domains (excluding email domains)
  var domains = text.match(/\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+(?:com|org|net|edu|gov|io|co|ai|dev|app|me|info|biz)\b/g) || [];
  var emailDomains = {};
  emails.forEach(function(e) { emailDomains[e.split('@')[1]] = true; });
  domains.forEach(function(d) {
    if (!emailDomains[d]) found.push({ type: 'domain', value: d });
  });

  // URLs
  var urls = text.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/g) || [];
  urls.forEach(function(u) { found.push({ type: 'url', value: u }); });

  // Bitcoin addresses
  var btc = text.match(/\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/g) || [];
  btc.forEach(function(b) { found.push({ type: 'bitcoin', value: b }); });

  // Ethereum addresses
  var eth = text.match(/\b0x[a-fA-F0-9]{40}\b/g) || [];
  eth.forEach(function(e) { found.push({ type: 'ethereum', value: e }); });

  // Hashtags
  var hashtags = text.match(/#[a-zA-Z]\w{1,50}/g) || [];
  hashtags.forEach(function(h) { found.push({ type: 'hashtag', value: h }); });

  // @mentions
  var mentions = text.match(/@[a-zA-Z]\w{1,30}/g) || [];
  mentions.forEach(function(m) { found.push({ type: 'username', value: m.slice(1) }); });

  // Deduplicate
  var unique = [];
  var seen = {};
  found.forEach(function(item) {
    var key = item.type + ':' + item.value;
    if (!seen[key]) {
      seen[key] = true;
      unique.push(item);
    }
  });

  if (unique.length === 0) {
    results.innerHTML = '<div class="empty-state"><p>No entities found in the provided text. Try pasting text with emails, phone numbers, or URLs.</p></div>';
    return;
  }

  var typeColors = {
    email: '', phone: 'green', ipv4: 'orange', domain: 'blue',
    url: 'blue', bitcoin: 'yellow', ethereum: 'yellow', hashtag: '',
    username: 'green'
  };

  var html = '<p style="margin-bottom:8px;color:var(--text-dim);font-size:0.85rem">Found <strong style="color:var(--spin-green)">' + unique.length + '</strong> entities:</p>';
  html += '<div class="extracted-list">';
  unique.forEach(function(item) {
    html += '<div class="extracted-item">' +
      '<span class="tag ' + (typeColors[item.type] || '') + '">' + item.type + '</span>' +
      '<span class="result-value" style="flex:1">' + escapeHtml(item.value) + '</span>' +
      '<button class="copy-btn" onclick="copyToClipboard(\'' + escapeJs(item.value) + '\')">copy</button>' +
      '<button class="btn btn-sm btn-green" onclick="saveEntity(\'' + item.type + '\',\'' + escapeJs(item.value) + '\',\'Text Extract\');renderEntityTable();showToast(\'Saved to Hivemind\')">save</button>' +
    '</div>';
  });
  html += '</div>';

  results.innerHTML = html;
  showToast('Extracted ' + unique.length + ' entities. Nice work, detective.');
}

/* ─── Hivemind Entity Table ──────────────────────────────  */
function renderEntityTable() {
  var container = document.getElementById('entity-table-body');
  if (!container) return;

  var entities = getEntities();
  var filterEl = document.getElementById('entity-filter');
  var searchEl = document.getElementById('entity-search');
  var filter = filterEl ? filterEl.value : 'all';
  var search = searchEl ? searchEl.value.toLowerCase() : '';

  var filtered = entities;
  if (filter !== 'all') {
    filtered = filtered.filter(function(e) { return e.type === filter; });
  }
  if (search) {
    filtered = filtered.filter(function(e) {
      return e.value.toLowerCase().indexOf(search) !== -1 || e.type.toLowerCase().indexOf(search) !== -1;
    });
  }

  if (filtered.length === 0) {
    var msg = entities.length === 0
      ? 'No entities yet. Use the OSINT tools to discover and save entities.'
      : 'No matching entities for this filter.';
    container.innerHTML = '<tr><td colspan="5" class="empty-state" style="padding:2rem"><p>' + msg + '</p></td></tr>';
    return;
  }

  var typeColors = {
    email: '', phone: 'green', ipv4: 'orange', domain: 'blue',
    url: 'blue', bitcoin: 'yellow', ethereum: 'yellow', hashtag: '',
    username: 'green'
  };

  container.innerHTML = filtered.map(function(e) {
    return '<tr>' +
      '<td><span class="tag ' + (typeColors[e.type] || '') + '">' + escapeHtml(e.type) + '</span></td>' +
      '<td class="mono">' + escapeHtml(e.value) + '</td>' +
      '<td>' + (e.sources ? e.sources.join(', ') : '-') + '</td>' +
      '<td>' + (e.count || 1) + '</td>' +
      '<td>' +
        '<button class="copy-btn" onclick="copyToClipboard(\'' + escapeJs(e.value) + '\')">copy</button> ' +
        '<button class="copy-btn" onclick="deleteEntity(\'' + e.id + '\')" style="color:var(--spin-red);border-color:var(--spin-red)">del</button>' +
      '</td>' +
    '</tr>';
  }).join('');
}

function exportEntities() {
  var entities = getEntities();
  if (entities.length === 0) {
    showToast('No entities to export. Go find some evidence first.');
    return;
  }

  var data = JSON.stringify(entities, null, 2);
  var blob = new Blob([data], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'spin-entities-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Entities exported. Guard that file with your life.');
}

function importEntities() {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      try {
        var imported = JSON.parse(ev.target.result);
        if (!Array.isArray(imported)) throw new Error('Invalid format');
        var existing = getEntities();
        var merged = existing.slice();
        var added = 0;
        imported.forEach(function(item) {
          if (item.type && item.value) {
            var exists = false;
            for (var i = 0; i < merged.length; i++) {
              if (merged[i].type === item.type && merged[i].value === item.value) {
                exists = true;
                break;
              }
            }
            if (!exists) {
              merged.push({
                id: item.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                type: item.type,
                value: item.value,
                sources: item.sources || [],
                count: item.count || 1,
                firstSeen: item.firstSeen || new Date().toISOString(),
                lastSeen: item.lastSeen || new Date().toISOString()
              });
              added++;
            }
          }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        renderEntityTable();
        updateEntityCount();
        showToast('Imported ' + added + ' new entities. Case files updated.');
      } catch (err) {
        showToast('Invalid file format. Are you sure that\'s a Spin export?');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

/* ─── OSINT Bookmarks ────────────────────────────────────  */
var BOOKMARKS = {
  'Search Engines': [
    { name: 'Google', url: 'https://google.com', desc: 'Web search with advanced operators' },
    { name: 'DuckDuckGo', url: 'https://duckduckgo.com', desc: 'Privacy-focused search' },
    { name: 'Bing', url: 'https://bing.com', desc: 'Microsoft search engine' },
    { name: 'Yandex', url: 'https://yandex.com', desc: 'Russian search engine, good for reverse image' },
    { name: 'Baidu', url: 'https://baidu.com', desc: 'Chinese search engine' }
  ],
  'People Search': [
    { name: 'Pipl', url: 'https://pipl.com', desc: 'People search engine' },
    { name: 'Spokeo', url: 'https://spokeo.com', desc: 'People search aggregator' },
    { name: 'ThatsThem', url: 'https://thatsthem.com', desc: 'Free people search' },
    { name: 'WhitePages', url: 'https://whitepages.com', desc: 'Phone & address lookup' },
    { name: 'TruePeopleSearch', url: 'https://truepeoplesearch.com', desc: 'Free people search' }
  ],
  'Social Media': [
    { name: 'Social Searcher', url: 'https://social-searcher.com', desc: 'Social media search engine' },
    { name: 'Namechk', url: 'https://namechk.com', desc: 'Username availability checker' },
    { name: 'KnowEm', url: 'https://knowem.com', desc: 'Username search across 500+ sites' },
    { name: 'Social Blade', url: 'https://socialblade.com', desc: 'Social media analytics' }
  ],
  'Domain & IP': [
    { name: 'Shodan', url: 'https://shodan.io', desc: 'Search engine for Internet-connected devices' },
    { name: 'Censys', url: 'https://censys.io', desc: 'Internet-wide scanning' },
    { name: 'VirusTotal', url: 'https://virustotal.com', desc: 'File/URL/IP analysis' },
    { name: 'SecurityTrails', url: 'https://securitytrails.com', desc: 'DNS & domain intelligence' },
    { name: 'crt.sh', url: 'https://crt.sh', desc: 'Certificate transparency search' },
    { name: 'DNSDumpster', url: 'https://dnsdumpster.com', desc: 'DNS recon & research' },
    { name: 'Wayback Machine', url: 'https://web.archive.org', desc: 'Historical website snapshots' }
  ],
  'Image & Media': [
    { name: 'TinEye', url: 'https://tineye.com', desc: 'Reverse image search' },
    { name: 'Google Images', url: 'https://images.google.com', desc: 'Image search & reverse search' },
    { name: 'FotoForensics', url: 'https://fotoforensics.com', desc: 'Image forensics & EXIF analysis' },
    { name: 'ExifTool Online', url: 'https://exif.tools', desc: 'Extract EXIF metadata from images' }
  ],
  'Email & Phone': [
    { name: 'Hunter.io', url: 'https://hunter.io', desc: 'Email finder & verifier' },
    { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com', desc: 'Check email breach status' },
    { name: 'Epieos', url: 'https://epieos.com', desc: 'Email OSINT tool' },
    { name: 'PhoneInfoga', url: 'https://github.com/sundowndev/phoneinfoga', desc: 'Phone number OSINT tool' },
    { name: 'NumLookup', url: 'https://numlookup.com', desc: 'Free phone number lookup' }
  ],
  'Geolocation': [
    { name: 'Google Maps', url: 'https://maps.google.com', desc: 'Maps & Street View' },
    { name: 'GeoGuessr', url: 'https://geoguessr.com', desc: 'Geolocation challenge game' },
    { name: 'SunCalc', url: 'https://suncalc.org', desc: 'Sun position & shadow analysis' },
    { name: 'Wikimapia', url: 'https://wikimapia.org', desc: 'Collaborative mapping' },
    { name: 'Mapillary', url: 'https://mapillary.com', desc: 'Street-level imagery' }
  ],
  'Frameworks & Guides': [
    { name: 'OSINT Framework', url: 'https://osintframework.com', desc: 'Collection of OSINT tools organized by category' },
    { name: 'IntelTechniques', url: 'https://inteltechniques.com/tools/', desc: 'Michael Bazzell OSINT tools' },
    { name: 'Awesome OSINT', url: 'https://github.com/jivoi/awesome-osint', desc: 'Curated list of OSINT tools' },
    { name: 'OSINT Dojo', url: 'https://www.yourdigitalshadow.com/', desc: 'OSINT training resources' }
  ]
};

function renderBookmarks() {
  var container = document.getElementById('bookmarks-container');
  if (!container) return;

  var searchEl = document.getElementById('bookmark-search');
  var search = searchEl ? searchEl.value.toLowerCase() : '';

  var html = '';
  var categories = Object.keys(BOOKMARKS);
  for (var c = 0; c < categories.length; c++) {
    var category = categories[c];
    var links = BOOKMARKS[category];
    var filtered = search
      ? links.filter(function(l) {
          return l.name.toLowerCase().indexOf(search) !== -1 ||
                 l.desc.toLowerCase().indexOf(search) !== -1 ||
                 category.toLowerCase().indexOf(search) !== -1;
        })
      : links;

    if (filtered.length === 0) continue;

    html += '<div class="bookmark-category">' + escapeHtml(category) + '</div>';
    html += '<div class="bookmark-grid">';
    filtered.forEach(function(link) {
      html += '<div class="bookmark-item">' +
        '<a href="' + link.url + '" target="_blank" rel="noopener">' + escapeHtml(link.name) + '</a>' +
        '<div class="bookmark-desc">' + escapeHtml(link.desc) + '</div>' +
      '</div>';
    });
    html += '</div>';
  }

  container.innerHTML = html || '<div class="empty-state"><p>No matching bookmarks.</p></div>';
}

/* ─── Utility Functions ──────────────────────────────────  */
function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeJs(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
}

/* ─── Loading Screen ─────────────────────────────────────  */
function runLoadingSequence() {
  var statusEl = document.getElementById('loading-status');
  var screen = document.getElementById('loading-screen');
  if (!statusEl || !screen) return;

  var messages = LOADING_MESSAGES.slice().sort(function() { return Math.random() - 0.5; });
  var idx = 0;

  var interval = setInterval(function() {
    if (idx < messages.length) {
      statusEl.textContent = messages[idx];
      idx++;
    }
  }, 350);

  setTimeout(function() {
    clearInterval(interval);
    statusEl.textContent = 'Systems online. Welcome, detective.';
    setTimeout(function() {
      screen.classList.add('hidden');
    }, 400);
  }, 2200);
}

/* ─── Initialize ─────────────────────────────────────────  */
document.addEventListener('DOMContentLoaded', function() {
  // Run loading screen
  runLoadingSequence();

  // Update entity counts
  updateEntityCount();

  // Render bookmarks
  renderBookmarks();

  // Generate case number and session ID
  generateCaseNumber();
  generateSessionId();

  // Show first joke
  randomJoke();

  // Initialize ticker
  initTicker();

  // Set initial tagline
  rotateTagline();

  // Set initial footer joke
  rotateFooterJoke();

  // Set up entity filter/search listeners
  var filter = document.getElementById('entity-filter');
  var search = document.getElementById('entity-search');
  if (filter) filter.addEventListener('change', renderEntityTable);
  if (search) search.addEventListener('input', renderEntityTable);

  // Set up bookmark search
  var bmSearch = document.getElementById('bookmark-search');
  if (bmSearch) bmSearch.addEventListener('input', renderBookmarks);

  // Enter key handlers for inputs
  var inputHandlers = [
    { id: 'phone-input', fn: analyzePhone },
    { id: 'email-input', fn: analyzeEmail },
    { id: 'username-input', fn: analyzeUsername },
    { id: 'domain-input', fn: analyzeDomain }
  ];

  inputHandlers.forEach(function(handler) {
    var el = document.getElementById(handler.id);
    if (el) {
      el.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') handler.fn();
      });
    }
  });

  // Render initial entity table
  renderEntityTable();

  // Rotate tagline every 10 seconds
  setInterval(rotateTagline, 10000);

  // Rotate footer joke every 15 seconds
  setInterval(rotateFooterJoke, 15000);

  // Show random tip popup every 45 seconds (first one after 20s)
  setTimeout(function() {
    showRandomTip();
    setInterval(showRandomTip, 45000);
  }, 20000);
});
