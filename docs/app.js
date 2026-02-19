/* Spin Web - OSINT Mini Toolkit - Client-side JavaScript */

// ─── Navigation ─────────────────────────────────────────
function switchPanel(panelId) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(panelId).classList.add('active');
  document.querySelector(`[data-panel="${panelId}"]`).classList.add('active');
}

// ─── Toast Notification ─────────────────────────────────
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── Clipboard ──────────────────────────────────────────
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard');
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Copied to clipboard');
  });
}

// ─── Entity Storage (localStorage) ─────────────────────
const STORAGE_KEY = 'spin_entities';

function getEntities() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveEntity(type, value, source) {
  const entities = getEntities();
  const existing = entities.find(e => e.type === type && e.value === value);
  if (existing) {
    existing.count = (existing.count || 1) + 1;
    existing.lastSeen = new Date().toISOString();
    if (source && !existing.sources.includes(source)) {
      existing.sources.push(source);
    }
  } else {
    entities.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      type,
      value,
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
    showToast('All entities cleared');
  }
}

function deleteEntity(id) {
  const entities = getEntities().filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entities));
  renderEntityTable();
  updateEntityCount();
}

function updateEntityCount() {
  const entities = getEntities();
  const el = document.getElementById('entity-count');
  if (el) el.textContent = entities.length;

  const types = {};
  entities.forEach(e => {
    types[e.type] = (types[e.type] || 0) + 1;
  });
  const typeEl = document.getElementById('entity-types-count');
  if (typeEl) typeEl.textContent = Object.keys(types).length;
}

// ─── Phone Intelligence ─────────────────────────────────
function analyzePhone() {
  const input = document.getElementById('phone-input').value.trim();
  if (!input) return;

  const results = document.getElementById('phone-results');
  const cleaned = input.replace(/[\s\-\.\(\)]/g, '');

  // Detect country code
  let countryCode = '';
  let national = cleaned;
  let country = 'Unknown';

  const countryCodes = {
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
    '39': { name: 'Italy', format: 'XXX XXX XXXX' },
  };

  const phoneDigits = cleaned.replace(/^\+/, '');

  for (const [code, info] of Object.entries(countryCodes).sort((a, b) => b[0].length - a[0].length)) {
    if (phoneDigits.startsWith(code)) {
      countryCode = '+' + code;
      national = phoneDigits.slice(code.length);
      country = info.name;
      break;
    }
  }

  const e164 = countryCode ? `${countryCode}${national}` : `+${phoneDigits}`;

  // Carrier detection for US numbers
  let carrier = 'Unknown';
  if (countryCode === '+1' && national.length === 10) {
    const npa = national.slice(0, 3);
    // Common US area code ranges (simplified)
    const npas = {
      '800': 'Toll-Free', '888': 'Toll-Free', '877': 'Toll-Free', '866': 'Toll-Free',
      '855': 'Toll-Free', '844': 'Toll-Free', '833': 'Toll-Free',
      '900': 'Premium Rate',
    };
    carrier = npas[npa] || 'Standard Line';
  }

  // Generate search queries
  const searchQueries = [
    { name: 'Google', url: `https://www.google.com/search?q="${encodeURIComponent(input)}"` },
    { name: 'DuckDuckGo', url: `https://duckduckgo.com/?q="${encodeURIComponent(input)}"` },
    { name: 'TrueCaller', url: `https://www.truecaller.com/search/${encodeURIComponent(cleaned)}` },
    { name: 'NumLookup', url: `https://www.numlookup.com/search?phone=${encodeURIComponent(cleaned)}` },
  ];

  let html = `
    <div class="result-item"><span class="result-label">Input</span><span class="result-value">${escapeHtml(input)}</span></div>
    <div class="result-item"><span class="result-label">E.164 Format</span><span class="result-value">${escapeHtml(e164)} <button class="copy-btn" onclick="copyToClipboard('${escapeHtml(e164)}')">copy</button></span></div>
    <div class="result-item"><span class="result-label">Country</span><span class="result-value">${escapeHtml(country)}</span></div>
    <div class="result-item"><span class="result-label">Country Code</span><span class="result-value">${escapeHtml(countryCode || 'Not detected')}</span></div>
    <div class="result-item"><span class="result-label">National #</span><span class="result-value">${escapeHtml(national)}</span></div>
    <div class="result-item"><span class="result-label">Digits</span><span class="result-value">${national.length}</span></div>
    <div class="result-item"><span class="result-label">Line Type</span><span class="result-value">${escapeHtml(carrier)}</span></div>
    <div class="result-item"><span class="result-label">Search Links</span><span class="result-value">
      ${searchQueries.map(q => `<a href="${q.url}" target="_blank" rel="noopener">${q.name}</a>`).join(' &middot; ')}
    </span></div>
  `;
  results.innerHTML = html;

  saveEntity('phone', input, 'Phone Analysis');
  showToast('Phone analyzed & saved to Hivemind');
}

// ─── Email Intelligence ─────────────────────────────────
function analyzeEmail() {
  const input = document.getElementById('email-input').value.trim();
  if (!input) return;

  const results = document.getElementById('email-results');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(input)) {
    results.innerHTML = '<div class="result-item"><span class="result-value" style="color:var(--spin-red)">Invalid email format</span></div>';
    return;
  }

  const [localPart, domain] = input.split('@');
  const tld = domain.split('.').pop().toLowerCase();

  // Provider detection
  const providers = {
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
    '10minutemail.com': { name: '10 Minute Mail', type: 'Disposable', disposable: true },
  };

  const provider = providers[domain.toLowerCase()] || { name: 'Custom/Business', type: 'Business/Unknown', disposable: false };

  // Pattern analysis
  const patterns = [];
  if (/^\d+$/.test(localPart)) patterns.push('Numeric only');
  if (/^[a-z]+\.[a-z]+$/i.test(localPart)) patterns.push('First.Last format');
  if (/^[a-z]+[._][a-z]+\d*$/i.test(localPart)) patterns.push('Name+separator pattern');
  if (localPart.length < 4) patterns.push('Very short local part');
  if (localPart.length > 30) patterns.push('Unusually long local part');
  if (/\+/.test(localPart)) patterns.push('Uses + alias (Gmail trick)');
  if (/^[a-z]{1,3}\d{4,}$/i.test(localPart)) patterns.push('Possibly auto-generated');

  const searchQueries = [
    { name: 'Google', url: `https://www.google.com/search?q="${encodeURIComponent(input)}"` },
    { name: 'DuckDuckGo', url: `https://duckduckgo.com/?q="${encodeURIComponent(input)}"` },
    { name: 'Have I Been Pwned', url: `https://haveibeenpwned.com/account/${encodeURIComponent(input)}` },
    { name: 'Epieos', url: `https://epieos.com/?q=${encodeURIComponent(input)}` },
  ];

  let html = `
    <div class="result-item"><span class="result-label">Email</span><span class="result-value">${escapeHtml(input)} <button class="copy-btn" onclick="copyToClipboard('${escapeHtml(input)}')">copy</button></span></div>
    <div class="result-item"><span class="result-label">Local Part</span><span class="result-value">${escapeHtml(localPart)}</span></div>
    <div class="result-item"><span class="result-label">Domain</span><span class="result-value">${escapeHtml(domain)}</span></div>
    <div class="result-item"><span class="result-label">TLD</span><span class="result-value">.${escapeHtml(tld)}</span></div>
    <div class="result-item"><span class="result-label">Provider</span><span class="result-value">${escapeHtml(provider.name)} <span class="tag ${provider.disposable ? 'red' : 'green'}">${provider.type}</span></span></div>
    <div class="result-item"><span class="result-label">Disposable?</span><span class="result-value">${provider.disposable ? '<span class="tag red">YES - Likely disposable</span>' : '<span class="tag green">No</span>'}</span></div>
    <div class="result-item"><span class="result-label">Patterns</span><span class="result-value">${patterns.length ? patterns.map(p => `<span class="tag blue">${p}</span>`).join(' ') : 'No notable patterns'}</span></div>
    <div class="result-item"><span class="result-label">Search Links</span><span class="result-value">
      ${searchQueries.map(q => `<a href="${q.url}" target="_blank" rel="noopener">${q.name}</a>`).join(' &middot; ')}
    </span></div>
  `;
  results.innerHTML = html;

  saveEntity('email', input, 'Email Analysis');
  showToast('Email analyzed & saved to Hivemind');
}

// ─── Username Reconnaissance ────────────────────────────
function analyzeUsername() {
  const input = document.getElementById('username-input').value.trim();
  if (!input) return;

  const results = document.getElementById('username-results');
  const encoded = encodeURIComponent(input);

  const platforms = [
    { name: 'GitHub', url: `https://github.com/${encoded}`, icon: 'GH' },
    { name: 'Twitter/X', url: `https://x.com/${encoded}`, icon: 'X' },
    { name: 'Instagram', url: `https://instagram.com/${encoded}`, icon: 'IG' },
    { name: 'Reddit', url: `https://reddit.com/user/${encoded}`, icon: 'RD' },
    { name: 'LinkedIn', url: `https://linkedin.com/in/${encoded}`, icon: 'LI' },
    { name: 'Facebook', url: `https://facebook.com/${encoded}`, icon: 'FB' },
    { name: 'TikTok', url: `https://tiktok.com/@${encoded}`, icon: 'TT' },
    { name: 'YouTube', url: `https://youtube.com/@${encoded}`, icon: 'YT' },
    { name: 'Pinterest', url: `https://pinterest.com/${encoded}`, icon: 'PN' },
    { name: 'Twitch', url: `https://twitch.tv/${encoded}`, icon: 'TW' },
    { name: 'Steam', url: `https://steamcommunity.com/id/${encoded}`, icon: 'ST' },
    { name: 'Keybase', url: `https://keybase.io/${encoded}`, icon: 'KB' },
    { name: 'HackerOne', url: `https://hackerone.com/${encoded}`, icon: 'H1' },
    { name: 'Medium', url: `https://medium.com/@${encoded}`, icon: 'MD' },
    { name: 'Mastodon (social)', url: `https://mastodon.social/@${encoded}`, icon: 'MA' },
    { name: 'Telegram', url: `https://t.me/${encoded}`, icon: 'TG' },
  ];

  // Username analysis
  const analysis = [];
  if (input.length < 4) analysis.push('Very short username');
  if (input.length > 20) analysis.push('Long username');
  if (/^\d+$/.test(input)) analysis.push('Numeric only');
  if (/^[a-z]+$/i.test(input)) analysis.push('Letters only');
  if (/[._-]/.test(input)) analysis.push('Contains separators');
  if (/\d{4}$/.test(input)) analysis.push('Ends with year-like number');
  if (/^[a-z]+\d{1,3}$/i.test(input)) analysis.push('Name+number pattern');

  let html = `
    <div class="result-item"><span class="result-label">Username</span><span class="result-value">${escapeHtml(input)} <button class="copy-btn" onclick="copyToClipboard('${escapeHtml(input)}')">copy</button></span></div>
    <div class="result-item"><span class="result-label">Length</span><span class="result-value">${input.length} characters</span></div>
    <div class="result-item"><span class="result-label">Patterns</span><span class="result-value">${analysis.length ? analysis.map(a => `<span class="tag blue">${a}</span>`).join(' ') : 'Standard format'}</span></div>
    <div class="result-item"><span class="result-label">Search</span><span class="result-value">
      <a href="https://www.google.com/search?q=%22${encoded}%22" target="_blank" rel="noopener">Google</a> &middot;
      <a href="https://duckduckgo.com/?q=%22${encoded}%22" target="_blank" rel="noopener">DDG</a>
    </span></div>
  `;

  html += '<div style="margin-top:1rem"><strong style="font-size:0.85rem;color:var(--text-bright)">Check Platforms:</strong></div>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px;margin-top:8px">';
  platforms.forEach(p => {
    html += `<a href="${p.url}" target="_blank" rel="noopener" class="bookmark-item" style="text-decoration:none">
      <span style="font-weight:600;color:var(--spin-blue)">${p.icon}</span>
      <span style="margin-left:6px;color:var(--text)">${p.name}</span>
    </a>`;
  });
  html += '</div>';

  results.innerHTML = html;

  saveEntity('username', input, 'Username Recon');
  showToast('Username analyzed & saved to Hivemind');
}

// ─── Domain Reconnaissance ──────────────────────────────
function analyzeDomain() {
  const input = document.getElementById('domain-input').value.trim().replace(/^https?:\/\//, '').split('/')[0];
  if (!input) return;

  const results = document.getElementById('domain-results');
  const encoded = encodeURIComponent(input);

  // Parse domain parts
  const parts = input.split('.');
  const tld = parts[parts.length - 1];
  const sld = parts.length >= 2 ? parts[parts.length - 2] : '';
  const subdomain = parts.length > 2 ? parts.slice(0, -2).join('.') : '';

  // TLD classification
  const tldInfo = {
    'com': 'Commercial', 'org': 'Organization', 'net': 'Network', 'edu': 'Education',
    'gov': 'Government', 'mil': 'Military', 'io': 'Tech (Indian Ocean)', 'co': 'Colombia/Commercial',
    'ai': 'Anguilla/AI', 'dev': 'Developer', 'app': 'Application', 'me': 'Montenegro/Personal',
    'info': 'Information', 'biz': 'Business', 'xyz': 'Generic', 'tech': 'Technology',
    'online': 'Generic', 'ru': 'Russia', 'cn': 'China', 'uk': 'United Kingdom',
    'de': 'Germany', 'fr': 'France', 'jp': 'Japan', 'br': 'Brazil', 'in': 'India',
    'onion': 'Tor Hidden Service', 'i2p': 'I2P Network',
  };

  const reconLinks = [
    { name: 'WHOIS (who.is)', url: `https://who.is/whois/${encoded}` },
    { name: 'DNS Records', url: `https://dnsdumpster.com/` },
    { name: 'Shodan', url: `https://www.shodan.io/search?query=${encoded}` },
    { name: 'Censys', url: `https://search.censys.io/hosts?q=${encoded}` },
    { name: 'crt.sh (SSL Certs)', url: `https://crt.sh/?q=%25.${encoded}` },
    { name: 'Wayback Machine', url: `https://web.archive.org/web/*/${encoded}` },
    { name: 'VirusTotal', url: `https://www.virustotal.com/gui/domain/${encoded}` },
    { name: 'SecurityTrails', url: `https://securitytrails.com/domain/${encoded}/dns` },
    { name: 'BuiltWith', url: `https://builtwith.com/${encoded}` },
    { name: 'Netcraft', url: `https://sitereport.netcraft.com/?url=${encoded}` },
    { name: 'Google Dorks', url: `https://www.google.com/search?q=site:${encoded}` },
    { name: 'Subdomains (Google)', url: `https://www.google.com/search?q=site:*.${encoded}+-www` },
  ];

  let html = `
    <div class="result-item"><span class="result-label">Domain</span><span class="result-value">${escapeHtml(input)} <button class="copy-btn" onclick="copyToClipboard('${escapeHtml(input)}')">copy</button></span></div>
    ${subdomain ? `<div class="result-item"><span class="result-label">Subdomain</span><span class="result-value">${escapeHtml(subdomain)}</span></div>` : ''}
    <div class="result-item"><span class="result-label">SLD</span><span class="result-value">${escapeHtml(sld)}</span></div>
    <div class="result-item"><span class="result-label">TLD</span><span class="result-value">.${escapeHtml(tld)} <span class="tag">${tldInfo[tld.toLowerCase()] || 'Unknown'}</span></span></div>
    <div class="result-item"><span class="result-label">Visit</span><span class="result-value"><a href="https://${escapeHtml(input)}" target="_blank" rel="noopener">https://${escapeHtml(input)}</a></span></div>
  `;

  html += '<div style="margin-top:1rem"><strong style="font-size:0.85rem;color:var(--text-bright)">Reconnaissance Tools:</strong></div>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px;margin-top:8px">';
  reconLinks.forEach(link => {
    html += `<a href="${link.url}" target="_blank" rel="noopener" class="bookmark-item" style="text-decoration:none">
      <span style="color:var(--spin-blue)">${link.name}</span>
    </a>`;
  });
  html += '</div>';

  results.innerHTML = html;

  saveEntity('domain', input, 'Domain Recon');
  showToast('Domain analyzed & saved to Hivemind');
}

// ─── Entity Extractor ───────────────────────────────────
function extractEntities() {
  const text = document.getElementById('extract-input').value;
  if (!text.trim()) return;

  const results = document.getElementById('extract-results');
  const found = [];

  // Email regex
  const emails = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [];
  emails.forEach(e => found.push({ type: 'email', value: e }));

  // Phone regex (various formats)
  const phones = text.match(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || [];
  phones.forEach(p => found.push({ type: 'phone', value: p.trim() }));

  // IPv4
  const ipv4s = text.match(/\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g) || [];
  ipv4s.forEach(ip => found.push({ type: 'ipv4', value: ip }));

  // Domain-like patterns (excluding emails)
  const domains = text.match(/\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+(?:com|org|net|edu|gov|io|co|ai|dev|app|me|info|biz)\b/g) || [];
  const emailDomains = new Set(emails.map(e => e.split('@')[1]));
  domains.forEach(d => {
    if (!emailDomains.has(d)) found.push({ type: 'domain', value: d });
  });

  // URLs
  const urls = text.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/g) || [];
  urls.forEach(u => found.push({ type: 'url', value: u }));

  // Bitcoin addresses
  const btc = text.match(/\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/g) || [];
  btc.forEach(b => found.push({ type: 'bitcoin', value: b }));

  // Ethereum addresses
  const eth = text.match(/\b0x[a-fA-F0-9]{40}\b/g) || [];
  eth.forEach(e => found.push({ type: 'ethereum', value: e }));

  // Hashtags
  const hashtags = text.match(/#[a-zA-Z]\w{1,50}/g) || [];
  hashtags.forEach(h => found.push({ type: 'hashtag', value: h }));

  // @mentions
  const mentions = text.match(/@[a-zA-Z]\w{1,30}/g) || [];
  mentions.forEach(m => found.push({ type: 'username', value: m.slice(1) }));

  // Deduplicate
  const unique = [];
  const seen = new Set();
  found.forEach(item => {
    const key = item.type + ':' + item.value;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  });

  if (unique.length === 0) {
    results.innerHTML = '<div class="empty-state"><p>No entities found in the provided text.</p></div>';
    return;
  }

  const typeColors = {
    email: '', phone: 'green', ipv4: 'orange', domain: 'blue',
    url: 'blue', bitcoin: 'yellow', ethereum: 'yellow', hashtag: '',
    username: 'green'
  };

  let html = `<p style="margin-bottom:8px;color:var(--text-dim);font-size:0.85rem">Found ${unique.length} entities:</p>`;
  html += '<div class="extracted-list">';
  unique.forEach(item => {
    html += `<div class="extracted-item">
      <span class="tag ${typeColors[item.type] || ''}">${item.type}</span>
      <span class="result-value" style="flex:1">${escapeHtml(item.value)}</span>
      <button class="copy-btn" onclick="copyToClipboard('${escapeJs(item.value)}')">copy</button>
      <button class="btn btn-sm btn-green" onclick="saveEntity('${item.type}','${escapeJs(item.value)}','Text Extract');renderEntityTable();showToast('Saved to Hivemind')">save</button>
    </div>`;
  });
  html += '</div>';

  results.innerHTML = html;
  showToast(`Extracted ${unique.length} entities`);
}

// ─── Hivemind Entity Table ──────────────────────────────
function renderEntityTable() {
  const container = document.getElementById('entity-table-body');
  if (!container) return;

  const entities = getEntities();
  const filter = document.getElementById('entity-filter')?.value || 'all';
  const search = (document.getElementById('entity-search')?.value || '').toLowerCase();

  let filtered = entities;
  if (filter !== 'all') {
    filtered = filtered.filter(e => e.type === filter);
  }
  if (search) {
    filtered = filtered.filter(e => e.value.toLowerCase().includes(search) || e.type.toLowerCase().includes(search));
  }

  if (filtered.length === 0) {
    container.innerHTML = `<tr><td colspan="5" class="empty-state" style="padding:2rem">
      <p>${entities.length === 0 ? 'No entities yet. Use the OSINT tools to discover and save entities.' : 'No matching entities.'}</p>
    </td></tr>`;
    return;
  }

  const typeColors = {
    email: '', phone: 'green', ipv4: 'orange', domain: 'blue',
    url: 'blue', bitcoin: 'yellow', ethereum: 'yellow', hashtag: '',
    username: 'green'
  };

  container.innerHTML = filtered.map(e => `
    <tr>
      <td><span class="tag ${typeColors[e.type] || ''}">${escapeHtml(e.type)}</span></td>
      <td class="mono">${escapeHtml(e.value)}</td>
      <td>${e.sources?.join(', ') || '-'}</td>
      <td>${e.count || 1}</td>
      <td>
        <button class="copy-btn" onclick="copyToClipboard('${escapeJs(e.value)}')">copy</button>
        <button class="copy-btn" onclick="deleteEntity('${e.id}')" style="color:var(--spin-red);border-color:var(--spin-red)">del</button>
      </td>
    </tr>
  `).join('');
}

function exportEntities() {
  const entities = getEntities();
  if (entities.length === 0) {
    showToast('No entities to export');
    return;
  }

  const data = JSON.stringify(entities, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `spin-entities-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Entities exported');
}

function importEntities() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (!Array.isArray(imported)) throw new Error('Invalid format');
        const existing = getEntities();
        const merged = [...existing];
        let added = 0;
        imported.forEach(item => {
          if (item.type && item.value) {
            const exists = merged.find(e => e.type === item.type && e.value === item.value);
            if (!exists) {
              merged.push({
                ...item,
                id: item.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
              });
              added++;
            }
          }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        renderEntityTable();
        updateEntityCount();
        showToast(`Imported ${added} new entities`);
      } catch {
        showToast('Invalid file format');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// ─── OSINT Bookmarks ────────────────────────────────────
const BOOKMARKS = {
  'Search Engines': [
    { name: 'Google', url: 'https://google.com', desc: 'Web search with advanced operators' },
    { name: 'DuckDuckGo', url: 'https://duckduckgo.com', desc: 'Privacy-focused search' },
    { name: 'Bing', url: 'https://bing.com', desc: 'Microsoft search engine' },
    { name: 'Yandex', url: 'https://yandex.com', desc: 'Russian search engine, good for reverse image' },
    { name: 'Baidu', url: 'https://baidu.com', desc: 'Chinese search engine' },
  ],
  'People Search': [
    { name: 'Pipl', url: 'https://pipl.com', desc: 'People search engine' },
    { name: 'Spokeo', url: 'https://spokeo.com', desc: 'People search aggregator' },
    { name: 'ThatsThem', url: 'https://thatsthem.com', desc: 'Free people search' },
    { name: 'WhitePages', url: 'https://whitepages.com', desc: 'Phone & address lookup' },
    { name: 'TruePeopleSearch', url: 'https://truepeoplesearch.com', desc: 'Free people search' },
  ],
  'Social Media': [
    { name: 'Social Searcher', url: 'https://social-searcher.com', desc: 'Social media search engine' },
    { name: 'Namechk', url: 'https://namechk.com', desc: 'Username availability checker' },
    { name: 'KnowEm', url: 'https://knowem.com', desc: 'Username search across 500+ sites' },
    { name: 'Social Blade', url: 'https://socialblade.com', desc: 'Social media analytics' },
  ],
  'Domain & IP': [
    { name: 'Shodan', url: 'https://shodan.io', desc: 'Search engine for Internet-connected devices' },
    { name: 'Censys', url: 'https://censys.io', desc: 'Internet-wide scanning' },
    { name: 'VirusTotal', url: 'https://virustotal.com', desc: 'File/URL/IP analysis' },
    { name: 'SecurityTrails', url: 'https://securitytrails.com', desc: 'DNS & domain intelligence' },
    { name: 'crt.sh', url: 'https://crt.sh', desc: 'Certificate transparency search' },
    { name: 'DNSDumpster', url: 'https://dnsdumpster.com', desc: 'DNS recon & research' },
    { name: 'Wayback Machine', url: 'https://web.archive.org', desc: 'Historical website snapshots' },
  ],
  'Image & Media': [
    { name: 'TinEye', url: 'https://tineye.com', desc: 'Reverse image search' },
    { name: 'Google Images', url: 'https://images.google.com', desc: 'Image search & reverse search' },
    { name: 'FotoForensics', url: 'https://fotoforensics.com', desc: 'Image forensics & EXIF analysis' },
    { name: 'ExifTool Online', url: 'https://exif.tools', desc: 'Extract EXIF metadata from images' },
  ],
  'Email & Phone': [
    { name: 'Hunter.io', url: 'https://hunter.io', desc: 'Email finder & verifier' },
    { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com', desc: 'Check email breach status' },
    { name: 'Epieos', url: 'https://epieos.com', desc: 'Email OSINT tool' },
    { name: 'PhoneInfoga', url: 'https://github.com/sundowndev/phoneinfoga', desc: 'Phone number OSINT tool' },
    { name: 'NumLookup', url: 'https://numlookup.com', desc: 'Free phone number lookup' },
  ],
  'Geolocation': [
    { name: 'Google Maps', url: 'https://maps.google.com', desc: 'Maps & Street View' },
    { name: 'GeoGuessr', url: 'https://geoguessr.com', desc: 'Geolocation challenge game' },
    { name: 'SunCalc', url: 'https://suncalc.org', desc: 'Sun position & shadow analysis' },
    { name: 'Wikimapia', url: 'https://wikimapia.org', desc: 'Collaborative mapping' },
    { name: 'Mapillary', url: 'https://mapillary.com', desc: 'Street-level imagery' },
  ],
  'Frameworks & Guides': [
    { name: 'OSINT Framework', url: 'https://osintframework.com', desc: 'Collection of OSINT tools organized by category' },
    { name: 'IntelTechniques', url: 'https://inteltechniques.com/tools/', desc: 'Michael Bazzell OSINT tools' },
    { name: 'Awesome OSINT', url: 'https://github.com/jivoi/awesome-osint', desc: 'Curated list of OSINT tools' },
    { name: 'OSINT Dojo', url: 'https://www.yourdigitalshadow.com/', desc: 'OSINT training resources' },
  ],
};

function renderBookmarks() {
  const container = document.getElementById('bookmarks-container');
  if (!container) return;

  const search = (document.getElementById('bookmark-search')?.value || '').toLowerCase();

  let html = '';
  for (const [category, links] of Object.entries(BOOKMARKS)) {
    const filtered = search
      ? links.filter(l => l.name.toLowerCase().includes(search) || l.desc.toLowerCase().includes(search) || category.toLowerCase().includes(search))
      : links;
    if (filtered.length === 0) continue;

    html += `<div class="bookmark-category">${escapeHtml(category)}</div>`;
    html += '<div class="bookmark-grid">';
    filtered.forEach(link => {
      html += `<div class="bookmark-item">
        <a href="${link.url}" target="_blank" rel="noopener">${escapeHtml(link.name)}</a>
        <div class="bookmark-desc">${escapeHtml(link.desc)}</div>
      </div>`;
    });
    html += '</div>';
  }

  container.innerHTML = html || '<div class="empty-state"><p>No matching bookmarks.</p></div>';
}

// ─── Utility Functions ──────────────────────────────────
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeJs(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// ─── Initialize ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateEntityCount();
  renderBookmarks();

  // Set up entity filter/search listeners
  const filter = document.getElementById('entity-filter');
  const search = document.getElementById('entity-search');
  if (filter) filter.addEventListener('change', renderEntityTable);
  if (search) search.addEventListener('input', renderEntityTable);

  // Set up bookmark search
  const bmSearch = document.getElementById('bookmark-search');
  if (bmSearch) bmSearch.addEventListener('input', renderBookmarks);

  // Enter key handlers
  document.getElementById('phone-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') analyzePhone(); });
  document.getElementById('email-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') analyzeEmail(); });
  document.getElementById('username-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') analyzeUsername(); });
  document.getElementById('domain-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') analyzeDomain(); });

  // Load initial panel
  renderEntityTable();
});
