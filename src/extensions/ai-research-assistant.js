/**
 * CONSTANTINE Browser - AI Research Assistant Extension
 * Version: 4.2.0 - The Exorcist's Edge
 *
 * Intelligent Research Assistant providing:
 * - Smart Tab Grouping: Auto-cluster tabs by investigation topic
 * - Session Context Memory: Remember research context across sessions
 * - Related Link Suggestions: OSINT-relevant resource recommendations
 *
 * "Between Heaven and Hell, intelligence prevails."
 */

// ============================================
// Topic Classification Engine
// ============================================

const TOPIC_PATTERNS = {
  'Person Investigation': {
    patterns: [
      /people\s*search/i, /facebook\.com/i, /linkedin\.com/i, /twitter\.com|x\.com/i,
      /instagram\.com/i, /pipl\./i, /whitepages/i, /thatsthem/i, /beenverified/i,
      /spokeo/i, /intelius/i, /zabasearch/i, /truepeoplesearch/i, /namechk/i,
      /whatsmyname/i, /sherlock/i, /social-searcher/i, /person|people|name|identity/i
    ],
    keywords: ['person', 'name', 'identity', 'people', 'who is', 'find person', 'background check'],
    icon: '👤',
    color: '#4A90D9'
  },
  'Email Investigation': {
    patterns: [
      /hunter\.io/i, /emailrep/i, /epieos/i, /haveibeenpwned/i, /verify-?email/i,
      /email.*search/i, /holehe/i, /email/i
    ],
    keywords: ['email', 'mail', '@', 'inbox', 'gmail', 'outlook'],
    icon: '📧',
    color: '#E74C3C'
  },
  'Phone Investigation': {
    patterns: [
      /phone.*lookup/i, /truecaller/i, /numverify/i, /phoneinfoga/i,
      /carrier.*lookup/i, /phone|tel|mobile|cell/i
    ],
    keywords: ['phone', 'number', 'call', 'mobile', 'cell', 'telephone'],
    icon: '📞',
    color: '#27AE60'
  },
  'Domain & IP Analysis': {
    patterns: [
      /shodan\.io/i, /censys\.io/i, /dnsdumpster/i, /securitytrails/i,
      /whois/i, /domaintools/i, /mxtoolbox/i, /viewdns/i, /robtex/i,
      /dns.*lookup/i, /ip.*lookup/i, /crt\.sh/i, /virustotal/i,
      /abuseipdb/i, /domain|dns|ip\s+address|whois|subdomain/i
    ],
    keywords: ['domain', 'dns', 'ip', 'whois', 'nameserver', 'subdomain', 'hosting'],
    icon: '🌐',
    color: '#9B59B6'
  },
  'Image Analysis': {
    patterns: [
      /tineye/i, /pimeyes/i, /yandex.*image/i, /google.*image/i,
      /fotoforensics/i, /exif/i, /reverse.*image/i, /image.*search/i
    ],
    keywords: ['image', 'photo', 'picture', 'face', 'reverse image', 'exif'],
    icon: '🖼️',
    color: '#F39C12'
  },
  'Social Media': {
    patterns: [
      /facebook\.com/i, /twitter\.com|x\.com/i, /instagram\.com/i, /linkedin\.com/i,
      /tiktok\.com/i, /reddit\.com/i, /youtube\.com/i, /snapchat/i,
      /social.*blade/i, /social.*searcher/i
    ],
    keywords: ['social', 'profile', 'post', 'follower', 'handle', 'username'],
    icon: '💬',
    color: '#1DA1F2'
  },
  'Threat Intelligence': {
    patterns: [
      /virustotal/i, /hybrid-analysis/i, /any\.run/i, /malwarebazaar/i,
      /threatcrowd/i, /otx\.alienvault/i, /abuse.*ch/i, /malware/i,
      /ransomware/i, /threat.*intel/i
    ],
    keywords: ['malware', 'threat', 'ioc', 'hash', 'c2', 'ransomware', 'exploit'],
    icon: '🛡️',
    color: '#C0392B'
  },
  'Financial Investigation': {
    patterns: [
      /blockchain\.com/i, /etherscan/i, /bitcoin/i, /crypto/i,
      /wallet.*lookup/i, /opencorporates/i, /edgar/i, /sec\.gov/i
    ],
    keywords: ['bitcoin', 'crypto', 'wallet', 'transaction', 'company', 'corporate', 'financial'],
    icon: '💰',
    color: '#F1C40F'
  },
  'Geolocation': {
    patterns: [
      /google.*maps/i, /openstreetmap/i, /earth\.google/i, /wikimapia/i,
      /geolocation/i, /coordinates/i, /geoip/i, /maxmind/i
    ],
    keywords: ['location', 'map', 'coordinates', 'geo', 'address', 'latitude', 'longitude'],
    icon: '📍',
    color: '#2ECC71'
  },
  'Archives & History': {
    patterns: [
      /archive\.org/i, /wayback/i, /cached/i, /cachedview/i,
      /web\.archive/i, /archive\.is/i, /archive\.today/i
    ],
    keywords: ['archive', 'wayback', 'cached', 'snapshot', 'historical'],
    icon: '📜',
    color: '#7F8C8D'
  },
  'Dark Web': {
    patterns: [
      /\.onion/i, /tor/i, /dark.*web/i, /ahmia/i, /onionscan/i
    ],
    keywords: ['onion', 'tor', 'dark web', 'hidden service'],
    icon: '🕳️',
    color: '#2C3E50'
  }
};

// OSINT resource suggestions by topic
const OSINT_SUGGESTIONS = {
  'Person Investigation': [
    { name: 'Namechk', url: 'https://namechk.com/', desc: 'Username availability checker' },
    { name: 'WhatsMyName', url: 'https://whatsmyname.app/', desc: 'Username OSINT tool' },
    { name: 'Pipl', url: 'https://pipl.com/', desc: 'People search engine' },
    { name: 'ThatsThem', url: 'https://thatsthem.com/', desc: 'Free people search' },
    { name: 'Social Searcher', url: 'https://social-searcher.com/', desc: 'Social media search' }
  ],
  'Email Investigation': [
    { name: 'Hunter.io', url: 'https://hunter.io/', desc: 'Email finder & verifier' },
    { name: 'Epieos', url: 'https://epieos.com/', desc: 'Email OSINT tool' },
    { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com/', desc: 'Breach checker' },
    { name: 'EmailRep', url: 'https://emailrep.io/', desc: 'Email reputation' }
  ],
  'Phone Investigation': [
    { name: 'NumVerify', url: 'https://numverify.com/', desc: 'Phone validation API' },
    { name: 'TrueCaller', url: 'https://www.truecaller.com/', desc: 'Caller ID lookup' },
    { name: 'Sync.ME', url: 'https://sync.me/', desc: 'Phone lookup' }
  ],
  'Domain & IP Analysis': [
    { name: 'Shodan', url: 'https://www.shodan.io/', desc: 'IoT search engine' },
    { name: 'Censys', url: 'https://censys.io/', desc: 'Internet asset discovery' },
    { name: 'SecurityTrails', url: 'https://securitytrails.com/', desc: 'Historical DNS' },
    { name: 'DNSDumpster', url: 'https://dnsdumpster.com/', desc: 'DNS recon' },
    { name: 'crt.sh', url: 'https://crt.sh/', desc: 'Certificate transparency' },
    { name: 'VirusTotal', url: 'https://virustotal.com/', desc: 'Multi-scanner' }
  ],
  'Image Analysis': [
    { name: 'TinEye', url: 'https://tineye.com/', desc: 'Reverse image search' },
    { name: 'PimEyes', url: 'https://pimeyes.com/', desc: 'Face recognition search' },
    { name: 'FotoForensics', url: 'https://fotoforensics.com/', desc: 'Image analysis' },
    { name: 'Yandex Images', url: 'https://yandex.com/images/', desc: 'Reverse image search' }
  ],
  'Social Media': [
    { name: 'Social Blade', url: 'https://socialblade.com/', desc: 'Stats & analytics' },
    { name: 'Social Searcher', url: 'https://social-searcher.com/', desc: 'Social media search' },
    { name: 'Followerwonk', url: 'https://followerwonk.com/', desc: 'Twitter analytics' }
  ],
  'Threat Intelligence': [
    { name: 'VirusTotal', url: 'https://virustotal.com/', desc: 'Malware analysis' },
    { name: 'Hybrid Analysis', url: 'https://hybrid-analysis.com/', desc: 'Sandbox analysis' },
    { name: 'Any.run', url: 'https://any.run/', desc: 'Interactive sandbox' },
    { name: 'AbuseIPDB', url: 'https://abuseipdb.com/', desc: 'IP reputation' },
    { name: 'AlienVault OTX', url: 'https://otx.alienvault.com/', desc: 'Threat intel' }
  ],
  'Financial Investigation': [
    { name: 'Blockchain.com', url: 'https://blockchain.com/', desc: 'Bitcoin explorer' },
    { name: 'Etherscan', url: 'https://etherscan.io/', desc: 'Ethereum explorer' },
    { name: 'OpenCorporates', url: 'https://opencorporates.com/', desc: 'Company data' }
  ],
  'Geolocation': [
    { name: 'Google Maps', url: 'https://maps.google.com/', desc: 'Mapping' },
    { name: 'OpenStreetMap', url: 'https://openstreetmap.org/', desc: 'Open map data' },
    { name: 'GeoGuessr', url: 'https://geoguessr.com/', desc: 'Location verification' }
  ],
  'Archives & History': [
    { name: 'Wayback Machine', url: 'https://web.archive.org/', desc: 'Web archive' },
    { name: 'Archive.today', url: 'https://archive.today/', desc: 'Page snapshots' },
    { name: 'CachedView', url: 'https://cachedview.com/', desc: 'Cache lookup' }
  ]
};

// ============================================
// Tab Grouping Manager
// ============================================

class TabGroupingManager {
  constructor() {
    this.groups = new Map();
    this.tabTopics = new Map();
    this.groupCounter = 0;
  }

  classifyUrl(url) {
    if (!url || typeof url !== 'string') return null;

    try {
      const urlObj = new URL(url);
      const fullUrl = url.toLowerCase();
      const hostname = urlObj.hostname.toLowerCase();

      // Check each topic pattern
      for (const [topic, config] of Object.entries(TOPIC_PATTERNS)) {
        for (const pattern of config.patterns) {
          if (pattern.test(fullUrl) || pattern.test(hostname)) {
            return {
              topic,
              icon: config.icon,
              color: config.color,
              confidence: 0.9
            };
          }
        }
      }

      return null;
    } catch (_e) {
      return null;
    }
  }

  classifyContent(title, url, pageContent = '') {
    const text = `${title} ${url} ${pageContent}`.toLowerCase();

    let bestMatch = null;
    let bestScore = 0;

    for (const [topic, config] of Object.entries(TOPIC_PATTERNS)) {
      let score = 0;

      // Check patterns
      for (const pattern of config.patterns) {
        if (pattern.test(text)) {
          score += 2;
        }
      }

      // Check keywords
      for (const keyword of config.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          topic,
          icon: config.icon,
          color: config.color,
          confidence: Math.min(score / 10, 1)
        };
      }
    }

    return bestMatch;
  }

  assignTabToGroup(tabId, url, title = '') {
    // First try URL-based classification
    let classification = this.classifyUrl(url);

    // Fall back to content-based if URL doesn't match
    if (!classification || classification.confidence < 0.5) {
      classification = this.classifyContent(title, url);
    }

    if (!classification) {
      classification = {
        topic: 'General Research',
        icon: '🔍',
        color: '#95A5A6',
        confidence: 0.3
      };
    }

    this.tabTopics.set(tabId, classification);

    // Find or create group
    let groupId = null;
    for (const [gId, group] of this.groups.entries()) {
      if (group.topic === classification.topic) {
        groupId = gId;
        break;
      }
    }

    if (!groupId) {
      groupId = `group-${++this.groupCounter}`;
      this.groups.set(groupId, {
        id: groupId,
        topic: classification.topic,
        icon: classification.icon,
        color: classification.color,
        tabs: new Set(),
        createdAt: Date.now()
      });
    }

    const group = this.groups.get(groupId);
    group.tabs.add(tabId);

    return { groupId, classification };
  }

  removeTabFromGroups(tabId) {
    this.tabTopics.delete(tabId);

    for (const [groupId, group] of this.groups.entries()) {
      group.tabs.delete(tabId);
      if (group.tabs.size === 0) {
        this.groups.delete(groupId);
      }
    }
  }

  getGroups() {
    const result = [];
    for (const [groupId, group] of this.groups.entries()) {
      result.push({
        id: groupId,
        topic: group.topic,
        icon: group.icon,
        color: group.color,
        tabCount: group.tabs.size,
        tabs: Array.from(group.tabs)
      });
    }
    return result.sort((a, b) => b.tabCount - a.tabCount);
  }

  getTabTopic(tabId) {
    return this.tabTopics.get(tabId) || null;
  }

  getSuggestions(tabId) {
    const topic = this.tabTopics.get(tabId);
    if (!topic) return [];

    return OSINT_SUGGESTIONS[topic.topic] || OSINT_SUGGESTIONS['General Research'] || [];
  }

  exportState() {
    const groups = [];
    for (const [groupId, group] of this.groups.entries()) {
      groups.push({
        id: groupId,
        topic: group.topic,
        icon: group.icon,
        color: group.color,
        tabs: Array.from(group.tabs),
        createdAt: group.createdAt
      });
    }

    const tabTopics = {};
    for (const [tabId, topic] of this.tabTopics.entries()) {
      tabTopics[tabId] = topic;
    }

    return { groups, tabTopics, groupCounter: this.groupCounter };
  }

  importState(state) {
    if (!state) return;

    this.groups.clear();
    this.tabTopics.clear();
    this.groupCounter = state.groupCounter || 0;

    if (state.groups) {
      for (const group of state.groups) {
        this.groups.set(group.id, {
          ...group,
          tabs: new Set(group.tabs)
        });
      }
    }

    if (state.tabTopics) {
      for (const [tabId, topic] of Object.entries(state.tabTopics)) {
        this.tabTopics.set(tabId, topic);
      }
    }
  }
}

// ============================================
// Session Context Memory
// ============================================

class SessionContextMemory {
  constructor() {
    this.sessions = [];
    this.currentSession = null;
    this.maxSessions = 50;
    this.maxNotesPerSession = 100;
  }

  startSession(name = null) {
    this.currentSession = {
      id: `session-${Date.now()}`,
      name: name || `Investigation ${new Date().toLocaleDateString()}`,
      startedAt: Date.now(),
      endedAt: null,
      purpose: null,
      notes: [],
      entities: new Set(),
      urls: [],
      findings: [],
      tabGroups: [],
      status: 'active'
    };
    return this.currentSession;
  }

  endSession(summary = null) {
    if (!this.currentSession) return null;

    this.currentSession.endedAt = Date.now();
    this.currentSession.status = 'completed';
    this.currentSession.summary = summary;
    this.currentSession.entities = Array.from(this.currentSession.entities);

    this.sessions.unshift({ ...this.currentSession });
    if (this.sessions.length > this.maxSessions) {
      this.sessions = this.sessions.slice(0, this.maxSessions);
    }

    const completed = this.currentSession;
    this.currentSession = null;
    return completed;
  }

  setSessionPurpose(purpose) {
    if (this.currentSession) {
      this.currentSession.purpose = purpose;
    }
  }

  addNote(note) {
    if (!this.currentSession) return;
    if (this.currentSession.notes.length >= this.maxNotesPerSession) {
      this.currentSession.notes.shift();
    }
    this.currentSession.notes.push({
      id: `note-${Date.now()}`,
      content: note,
      timestamp: Date.now()
    });
  }

  addEntity(entity, type) {
    if (!this.currentSession) return;
    this.currentSession.entities.add(JSON.stringify({ value: entity, type }));
  }

  trackUrl(url, title, topic = null) {
    if (!this.currentSession) return;
    this.currentSession.urls.push({
      url,
      title,
      topic,
      visitedAt: Date.now()
    });
  }

  addFinding(finding) {
    if (!this.currentSession) return;
    this.currentSession.findings.push({
      id: `finding-${Date.now()}`,
      ...finding,
      timestamp: Date.now()
    });
  }

  getCurrentSession() {
    return this.currentSession;
  }

  getSessions(limit = 10) {
    return this.sessions.slice(0, limit);
  }

  getSession(sessionId) {
    if (this.currentSession?.id === sessionId) {
      return {
        ...this.currentSession,
        entities: Array.from(this.currentSession.entities)
      };
    }
    return this.sessions.find(s => s.id === sessionId) || null;
  }

  searchSessions(query) {
    const q = query.toLowerCase();
    return this.sessions.filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.purpose?.toLowerCase().includes(q) ||
      s.notes?.some(n => n.content.toLowerCase().includes(q)) ||
      s.urls?.some(u => u.url.toLowerCase().includes(q) || u.title?.toLowerCase().includes(q))
    );
  }

  exportState() {
    return {
      sessions: this.sessions,
      currentSession: this.currentSession ? {
        ...this.currentSession,
        entities: Array.from(this.currentSession.entities)
      } : null
    };
  }

  importState(state) {
    if (!state) return;
    this.sessions = state.sessions || [];
    if (state.currentSession) {
      this.currentSession = {
        ...state.currentSession,
        entities: new Set(state.currentSession.entities || [])
      };
    }
  }
}

// ============================================
// Related Link Suggester
// ============================================

class RelatedLinkSuggester {
  constructor(tabGroupingManager) {
    this.tabGrouping = tabGroupingManager;
    this.recentSuggestions = new Map();
    this.maxCacheAge = 5 * 60 * 1000; // 5 minutes
  }

  getSuggestionsForUrl(url, title = '') {
    const cacheKey = url;
    const cached = this.recentSuggestions.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < this.maxCacheAge) {
      return cached.suggestions;
    }

    // Classify the URL
    let classification = this.tabGrouping.classifyUrl(url);
    if (!classification) {
      classification = this.tabGrouping.classifyContent(title, url);
    }

    if (!classification) {
      return [];
    }

    const suggestions = OSINT_SUGGESTIONS[classification.topic] || [];

    // Filter out the current URL
    const filtered = suggestions.filter(s => {
      try {
        const suggestionHost = new URL(s.url).hostname;
        const currentHost = new URL(url).hostname;
        return suggestionHost !== currentHost;
      } catch (_e) {
        return true;
      }
    });

    this.recentSuggestions.set(cacheKey, {
      suggestions: filtered,
      timestamp: Date.now()
    });

    return filtered;
  }

  getSuggestionsForTopic(topic) {
    return OSINT_SUGGESTIONS[topic] || [];
  }

  getAllTopics() {
    return Object.keys(TOPIC_PATTERNS).map(topic => ({
      topic,
      icon: TOPIC_PATTERNS[topic].icon,
      color: TOPIC_PATTERNS[topic].color,
      suggestionCount: (OSINT_SUGGESTIONS[topic] || []).length
    }));
  }

  clearCache() {
    this.recentSuggestions.clear();
  }
}

// ============================================
// AI Research Assistant Main Class
// ============================================

class AIResearchAssistant {
  constructor() {
    this.tabGrouping = new TabGroupingManager();
    this.sessionMemory = new SessionContextMemory();
    this.linkSuggester = new RelatedLinkSuggester(this.tabGrouping);
    this.isActive = false;
  }

  initialize() {
    this.isActive = true;
    this.sessionMemory.startSession();
    return {
      success: true,
      message: 'AI Research Assistant initialized',
      sessionId: this.sessionMemory.getCurrentSession()?.id
    };
  }

  shutdown() {
    this.isActive = false;
    const session = this.sessionMemory.endSession();
    return {
      success: true,
      session
    };
  }

  // Tab grouping methods
  classifyTab(tabId, url, title = '') {
    return this.tabGrouping.assignTabToGroup(tabId, url, title);
  }

  removeTab(tabId) {
    this.tabGrouping.removeTabFromGroups(tabId);
  }

  getTabGroups() {
    return this.tabGrouping.getGroups();
  }

  getTabTopic(tabId) {
    return this.tabGrouping.getTabTopic(tabId);
  }

  // Session memory methods
  startNewSession(name) {
    return this.sessionMemory.startSession(name);
  }

  setSessionPurpose(purpose) {
    this.sessionMemory.setSessionPurpose(purpose);
  }

  addSessionNote(note) {
    this.sessionMemory.addNote(note);
  }

  addEntity(entity, type) {
    this.sessionMemory.addEntity(entity, type);
  }

  trackPageVisit(url, title, topic) {
    this.sessionMemory.trackUrl(url, title, topic);
  }

  addFinding(finding) {
    this.sessionMemory.addFinding(finding);
  }

  getCurrentSession() {
    return this.sessionMemory.getCurrentSession();
  }

  getPastSessions(limit) {
    return this.sessionMemory.getSessions(limit);
  }

  searchSessions(query) {
    return this.sessionMemory.searchSessions(query);
  }

  // Suggestions
  getSuggestions(url, title) {
    return this.linkSuggester.getSuggestionsForUrl(url, title);
  }

  getSuggestionsForTopic(topic) {
    return this.linkSuggester.getSuggestionsForTopic(topic);
  }

  getAllTopics() {
    return this.linkSuggester.getAllTopics();
  }

  // State persistence
  exportState() {
    return {
      tabGrouping: this.tabGrouping.exportState(),
      sessionMemory: this.sessionMemory.exportState(),
      isActive: this.isActive,
      exportedAt: Date.now()
    };
  }

  importState(state) {
    if (!state) return false;

    try {
      this.tabGrouping.importState(state.tabGrouping);
      this.sessionMemory.importState(state.sessionMemory);
      this.isActive = state.isActive || false;
      return true;
    } catch (e) {
      console.error('Failed to import AI Research Assistant state:', e);
      return false;
    }
  }
}

// ============================================
// Export Module
// ============================================

module.exports = {
  AIResearchAssistant,
  TabGroupingManager,
  SessionContextMemory,
  RelatedLinkSuggester,
  TOPIC_PATTERNS,
  OSINT_SUGGESTIONS
};
