/**
 * CONSTANTINE Browser - AI Intelligence Module
 * Version: 4.1.1 - The Exorcist's Edge
 *
 * AI-driven features for human OSINT researchers:
 * 1. Intelligent Research Assistant
 * 2. Predictive Privacy Shield
 * 3. Research Augmentation Tools
 * 4. Cognitive Load Reduction
 *
 * "Between Heaven and Hell, intelligence prevails."
 */

// ============================================
// 1. INTELLIGENT RESEARCH ASSISTANT
// ============================================

/**
 * Smart Tab Grouping - Auto-cluster tabs by investigation topic
 */
class SmartTabGrouper {
  constructor() {
    this.groups = new Map();
    this.tabTopics = new Map();

    // Topic detection patterns
    this.topicPatterns = {
      social: {
        name: 'Social Media',
        icon: '👥',
        patterns: [/facebook|twitter|instagram|linkedin|tiktok|reddit|discord|telegram/i],
        color: '#1DA1F2'
      },
      financial: {
        name: 'Financial',
        icon: '💰',
        patterns: [/bank|crypto|bitcoin|wallet|payment|paypal|venmo|finance/i],
        color: '#85BB65'
      },
      identity: {
        name: 'Identity Research',
        icon: '🔍',
        patterns: [/whitepages|spokeo|pipl|beenverified|truepeoplesearch|fastpeoplesearch/i],
        color: '#9B59B6'
      },
      domain: {
        name: 'Domain/IP Intel',
        icon: '🌐',
        patterns: [/whois|shodan|censys|virustotal|urlscan|domaintools/i],
        color: '#3498DB'
      },
      news: {
        name: 'News & Media',
        icon: '📰',
        patterns: [/news|cnn|bbc|reuters|guardian|nytimes|washingtonpost/i],
        color: '#E74C3C'
      },
      government: {
        name: 'Government Records',
        icon: '🏛️',
        patterns: [/\.gov|court|pacer|foia|public.record/i],
        color: '#2C3E50'
      },
      maps: {
        name: 'Geolocation',
        icon: '📍',
        patterns: [/maps|earth|street.?view|geolocation|coordinates/i],
        color: '#27AE60'
      },
      images: {
        name: 'Image Analysis',
        icon: '🖼️',
        patterns: [/tineye|yandex.*image|google.*image|pimeyes|facecheck/i],
        color: '#F39C12'
      },
      darkweb: {
        name: 'Dark Web',
        icon: '🕸️',
        patterns: [/\.onion|tor2web|ahmia/i],
        color: '#8E44AD'
      },
      archive: {
        name: 'Archives',
        icon: '📚',
        patterns: [/archive\.org|wayback|cached|webcitation/i],
        color: '#95A5A6'
      }
    };
  }

  /**
   * Analyze a URL and determine its topic group
   */
  analyzeUrl(url, title = '') {
    const combined = `${url} ${title}`.toLowerCase();

    for (const [topicId, topic] of Object.entries(this.topicPatterns)) {
      for (const pattern of topic.patterns) {
        if (pattern.test(combined)) {
          return {
            topicId,
            ...topic
          };
        }
      }
    }

    // Default: General Research
    return {
      topicId: 'general',
      name: 'General Research',
      icon: '🔎',
      color: '#7F8C8D'
    };
  }

  /**
   * Add a tab to appropriate group
   */
  addTab(tabId, url, title) {
    const topic = this.analyzeUrl(url, title);
    this.tabTopics.set(tabId, topic);

    if (!this.groups.has(topic.topicId)) {
      this.groups.set(topic.topicId, {
        ...topic,
        tabs: new Set()
      });
    }

    this.groups.get(topic.topicId).tabs.add(tabId);
    return topic;
  }

  /**
   * Remove tab from groups
   */
  removeTab(tabId) {
    const topic = this.tabTopics.get(tabId);
    if (topic && this.groups.has(topic.topicId)) {
      this.groups.get(topic.topicId).tabs.delete(tabId);

      // Clean up empty groups
      if (this.groups.get(topic.topicId).tabs.size === 0) {
        this.groups.delete(topic.topicId);
      }
    }
    this.tabTopics.delete(tabId);
  }

  /**
   * Get all groups with their tabs
   */
  getGroups() {
    const result = [];
    for (const [topicId, group] of this.groups) {
      result.push({
        topicId,
        name: group.name,
        icon: group.icon,
        color: group.color,
        tabCount: group.tabs.size,
        tabIds: Array.from(group.tabs)
      });
    }
    return result.sort((a, b) => b.tabCount - a.tabCount);
  }
}

/**
 * Session Context Memory - Remember research context across sessions
 */
class SessionContextMemory {
  constructor(store) {
    this.store = store;
    this.currentSession = {
      id: `session-${Date.now()}`,
      startTime: Date.now(),
      topic: null,
      notes: [],
      entities: new Set(),
      timeline: []
    };
  }

  /**
   * Set the current investigation topic
   */
  setTopic(topic) {
    this.currentSession.topic = topic;
    this.addTimelineEvent('topic_set', { topic });
    this._save();
  }

  /**
   * Add a note to current session
   */
  addNote(note) {
    this.currentSession.notes.push({
      text: note,
      timestamp: Date.now()
    });
    this.addTimelineEvent('note_added', { preview: note.substring(0, 50) });
    this._save();
  }

  /**
   * Track an entity found during research
   */
  trackEntity(entity) {
    this.currentSession.entities.add(JSON.stringify(entity));
    this.addTimelineEvent('entity_found', entity);
    this._save();
  }

  /**
   * Add event to timeline
   */
  addTimelineEvent(type, data) {
    this.currentSession.timeline.push({
      type,
      data,
      timestamp: Date.now()
    });

    // Keep timeline manageable
    if (this.currentSession.timeline.length > 500) {
      this.currentSession.timeline = this.currentSession.timeline.slice(-400);
    }
  }

  /**
   * Get session summary
   */
  getSummary() {
    const duration = Date.now() - this.currentSession.startTime;
    return {
      id: this.currentSession.id,
      topic: this.currentSession.topic,
      duration: this._formatDuration(duration),
      noteCount: this.currentSession.notes.length,
      entityCount: this.currentSession.entities.size,
      eventCount: this.currentSession.timeline.length
    };
  }

  /**
   * Get recent sessions from storage
   */
  getRecentSessions() {
    return this.store.get('ai.recentSessions', []).slice(0, 10);
  }

  /**
   * Save current session
   */
  _save() {
    const sessions = this.store.get('ai.recentSessions', []);
    const sessionData = {
      ...this.currentSession,
      entities: Array.from(this.currentSession.entities).map(e => JSON.parse(e))
    };

    // Update or add current session
    const existingIdx = sessions.findIndex(s => s.id === this.currentSession.id);
    if (existingIdx >= 0) {
      sessions[existingIdx] = sessionData;
    } else {
      sessions.unshift(sessionData);
    }

    // Keep only last 20 sessions
    this.store.set('ai.recentSessions', sessions.slice(0, 20));
  }

  _formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  }
}

/**
 * Related Link Suggestions - Suggest OSINT resources based on current page
 */
class RelatedLinkSuggester {
  constructor() {
    this.osintResources = {
      phone: [
        { name: 'NumLookup', url: 'https://numlookup.com/', desc: 'Free reverse phone lookup' },
        { name: 'TrueCaller', url: 'https://www.truecaller.com/', desc: 'Caller ID & spam blocking' },
        { name: 'Sync.ME', url: 'https://sync.me/', desc: 'Phone number search' }
      ],
      email: [
        { name: 'Hunter.io', url: 'https://hunter.io/', desc: 'Email finder & verifier' },
        { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com/', desc: 'Breach checker' },
        { name: 'EmailRep', url: 'https://emailrep.io/', desc: 'Email reputation' }
      ],
      username: [
        { name: 'Namechk', url: 'https://namechk.com/', desc: 'Username availability' },
        { name: 'WhatsMyName', url: 'https://whatsmyname.app/', desc: 'Username OSINT' },
        { name: 'Sherlock', url: 'https://github.com/sherlock-project/sherlock', desc: 'Hunt usernames' }
      ],
      domain: [
        { name: 'VirusTotal', url: 'https://www.virustotal.com/', desc: 'URL/domain analysis' },
        { name: 'URLScan', url: 'https://urlscan.io/', desc: 'Website scanner' },
        { name: 'Shodan', url: 'https://www.shodan.io/', desc: 'IoT search engine' },
        { name: 'Censys', url: 'https://search.censys.io/', desc: 'Internet intelligence' }
      ],
      image: [
        { name: 'TinEye', url: 'https://tineye.com/', desc: 'Reverse image search' },
        { name: 'PimEyes', url: 'https://pimeyes.com/', desc: 'Face recognition search' },
        { name: 'Yandex Images', url: 'https://yandex.com/images/', desc: 'Image search' }
      ],
      social: [
        { name: 'Social Searcher', url: 'https://www.social-searcher.com/', desc: 'Social media search' },
        { name: 'Followerwonk', url: 'https://followerwonk.com/', desc: 'Twitter analytics' }
      ],
      person: [
        { name: 'Pipl', url: 'https://pipl.com/', desc: 'People search engine' },
        { name: 'ThatsThem', url: 'https://thatsthem.com/', desc: 'Reverse lookup' },
        { name: 'FamilyTreeNow', url: 'https://www.familytreenow.com/', desc: 'Public records' }
      ]
    };
  }

  /**
   * Get suggestions based on URL and detected entities
   */
  getSuggestions(url, entities = []) {
    const suggestions = [];
    const categories = new Set();

    // Analyze URL for context
    const urlLower = url.toLowerCase();

    if (/phone|tel|call|mobile/i.test(urlLower)) categories.add('phone');
    if (/email|mail|@/i.test(urlLower)) categories.add('email');
    if (/user|profile|account/i.test(urlLower)) categories.add('username');
    if (/domain|whois|dns/i.test(urlLower)) categories.add('domain');
    if (/image|photo|picture/i.test(urlLower)) categories.add('image');
    if (/facebook|twitter|instagram|linkedin/i.test(urlLower)) categories.add('social');
    if (/people|person|name|search/i.test(urlLower)) categories.add('person');

    // Analyze entities
    for (const entity of entities) {
      if (entity.type === 'phone') categories.add('phone');
      if (entity.type === 'email') categories.add('email');
      if (entity.type === 'url') categories.add('domain');
    }

    // Default to general if nothing detected
    if (categories.size === 0) {
      categories.add('person');
      categories.add('domain');
    }

    // Collect suggestions
    for (const category of categories) {
      if (this.osintResources[category]) {
        suggestions.push(...this.osintResources[category].map(r => ({
          ...r,
          category
        })));
      }
    }

    // Deduplicate and limit
    const seen = new Set();
    return suggestions.filter(s => {
      if (seen.has(s.url)) return false;
      seen.add(s.url);
      return true;
    }).slice(0, 8);
  }
}

// ============================================
// 2. PREDICTIVE PRIVACY SHIELD
// ============================================

/**
 * Site Risk Scoring - Real-time threat assessment
 */
class SiteRiskScorer {
  constructor() {
    this.riskFactors = {
      // High risk indicators
      highRisk: {
        patterns: [
          /\.ru\/?$/i, /\.cn\/?$/i,  // High-risk TLDs
          /free.*download/i,
          /crack|keygen|warez/i,
          /casino|gambling|bet\d/i,
          /\.onion/i  // Tor sites (high risk, but expected for OSINT)
        ],
        score: 30
      },
      // Medium risk
      mediumRisk: {
        patterns: [
          /tracking|analytics|pixel/i,
          /ad[sv]?\.|\bad\b/i,
          /popup|clickbait/i
        ],
        score: 15
      },
      // Privacy concerns
      privacyConcerns: {
        patterns: [
          /facebook\.com|google\.com|amazon\.com/i,  // Heavy trackers
          /login|signin|account/i
        ],
        score: 10
      },
      // Safe indicators (reduce score)
      safeIndicators: {
        patterns: [
          /\.gov($|\/)/i,
          /\.edu($|\/)/i,
          /wikipedia\.org/i,
          /archive\.org/i
        ],
        score: -20
      }
    };

    // Known safe OSINT tools
    this.trustedDomains = new Set([
      'shodan.io', 'censys.io', 'virustotal.com', 'urlscan.io',
      'haveibeenpwned.com', 'hunter.io', 'tineye.com',
      'archive.org', 'whois.com', 'mxtoolbox.com'
    ]);
  }

  /**
   * Calculate risk score for a URL (0-100, higher = riskier)
   */
  calculateRisk(url) {
    let score = 25; // Base score
    const factors = [];

    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      const fullUrl = url.toLowerCase();

      // Check trusted domains
      for (const trusted of this.trustedDomains) {
        if (domain.includes(trusted)) {
          return {
            score: 5,
            level: 'low',
            factors: ['Trusted OSINT resource'],
            recommendation: 'Safe to browse'
          };
        }
      }

      // Check HTTPS
      if (urlObj.protocol !== 'https:') {
        score += 20;
        factors.push('No HTTPS encryption');
      }

      // Apply risk factors
      for (const [factorName, factor] of Object.entries(this.riskFactors)) {
        for (const pattern of factor.patterns) {
          if (pattern.test(fullUrl) || pattern.test(domain)) {
            score += factor.score;
            factors.push(factorName.replace(/([A-Z])/g, ' $1').trim());
            break;
          }
        }
      }

      // Normalize score
      score = Math.max(0, Math.min(100, score));

      // Determine level
      let level, recommendation;
      if (score >= 70) {
        level = 'critical';
        recommendation = 'High risk - Enable maximum privacy protections';
      } else if (score >= 50) {
        level = 'high';
        recommendation = 'Elevated risk - Consider using Tor';
      } else if (score >= 30) {
        level = 'medium';
        recommendation = 'Moderate risk - Standard protections sufficient';
      } else {
        level = 'low';
        recommendation = 'Low risk - Safe to browse';
      }

      return { score, level, factors: [...new Set(factors)], recommendation };
    } catch (e) {
      return {
        score: 50,
        level: 'medium',
        factors: ['Unable to analyze URL'],
        recommendation: 'Proceed with caution'
      };
    }
  }
}

/**
 * Fingerprint Exposure Meter - Track what's being leaked
 */
class FingerprintMeter {
  constructor() {
    this.exposurePoints = {
      canvas: { weight: 15, desc: 'Canvas fingerprinting possible' },
      webgl: { weight: 15, desc: 'WebGL fingerprinting possible' },
      audio: { weight: 10, desc: 'Audio context fingerprinting' },
      fonts: { weight: 10, desc: 'Font enumeration possible' },
      screen: { weight: 8, desc: 'Screen resolution exposed' },
      timezone: { weight: 5, desc: 'Timezone visible' },
      language: { weight: 5, desc: 'Language preferences exposed' },
      plugins: { weight: 8, desc: 'Plugin list exposed' },
      webrtc: { weight: 20, desc: 'WebRTC may leak real IP' },
      cookies: { weight: 5, desc: 'Cookies enabled' }
    };
  }

  /**
   * Calculate exposure based on current privacy settings
   */
  calculateExposure(privacySettings) {
    let exposure = 0;
    const exposedFactors = [];

    // Check each factor against privacy settings
    if (!privacySettings.blockCanvas) {
      exposure += this.exposurePoints.canvas.weight;
      exposedFactors.push(this.exposurePoints.canvas);
    }
    if (!privacySettings.blockWebGL) {
      exposure += this.exposurePoints.webgl.weight;
      exposedFactors.push(this.exposurePoints.webgl);
    }
    if (!privacySettings.blockWebRTC) {
      exposure += this.exposurePoints.webrtc.weight;
      exposedFactors.push(this.exposurePoints.webrtc);
    }
    if (!privacySettings.useTor) {
      exposure += 15; // IP exposure
      exposedFactors.push({ weight: 15, desc: 'Real IP address visible' });
    }
    if (privacySettings.cookiesEnabled !== false) {
      exposure += this.exposurePoints.cookies.weight;
      exposedFactors.push(this.exposurePoints.cookies);
    }

    // Always exposed (without advanced spoofing)
    exposure += this.exposurePoints.screen.weight;
    exposure += this.exposurePoints.timezone.weight;
    exposure += this.exposurePoints.language.weight;

    return {
      score: Math.min(100, exposure),
      level: exposure >= 70 ? 'high' : exposure >= 40 ? 'medium' : 'low',
      factors: exposedFactors,
      protected: 100 - Math.min(100, exposure)
    };
  }
}

/**
 * Auto-OPSEC Mode - Automatically escalate privacy based on risk
 */
class AutoOpsec {
  constructor() {
    this.modes = {
      stealth: {
        name: 'Stealth Mode',
        icon: '🥷',
        settings: {
          useTor: true,
          blockCanvas: true,
          blockWebGL: true,
          blockWebRTC: true,
          spoofUserAgent: true,
          clearOnExit: true
        }
      },
      elevated: {
        name: 'Elevated Security',
        icon: '🛡️',
        settings: {
          blockCanvas: true,
          blockWebGL: true,
          blockWebRTC: true,
          spoofUserAgent: true
        }
      },
      standard: {
        name: 'Standard',
        icon: '✓',
        settings: {
          blockWebRTC: true
        }
      }
    };
  }

  /**
   * Get recommended mode based on risk score
   */
  getRecommendedMode(riskScore) {
    if (riskScore >= 70) return 'stealth';
    if (riskScore >= 40) return 'elevated';
    return 'standard';
  }

  /**
   * Get settings for a mode
   */
  getModeSettings(modeName) {
    return this.modes[modeName] || this.modes.standard;
  }
}

// ============================================
// 3. RESEARCH AUGMENTATION TOOLS
// ============================================

/**
 * Entity Extraction - Auto-detect entities on pages
 */
class EntityExtractor {
  constructor() {
    this.patterns = {
      phone: {
        regex: /(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
        icon: '📞',
        type: 'phone'
      },
      email: {
        regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        icon: '📧',
        type: 'email'
      },
      ipv4: {
        regex: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
        icon: '🌐',
        type: 'ip'
      },
      ssn: {
        regex: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
        icon: '🔒',
        type: 'ssn',
        sensitive: true
      },
      creditCard: {
        regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b/g,
        icon: '💳',
        type: 'credit_card',
        sensitive: true
      },
      btcAddress: {
        regex: /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/g,
        icon: '₿',
        type: 'bitcoin'
      },
      coordinates: {
        regex: /[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)/g,
        icon: '📍',
        type: 'coordinates'
      },
      url: {
        regex: /https?:\/\/[^\s<>"{}|\\^`[\]]+/g,
        icon: '🔗',
        type: 'url'
      },
      username: {
        regex: /@[a-zA-Z0-9_]{1,15}\b/g,
        icon: '👤',
        type: 'username'
      }
    };
  }

  /**
   * Extract all entities from text
   */
  extract(text) {
    const entities = [];
    const seen = new Set();

    for (const [name, pattern] of Object.entries(this.patterns)) {
      const matches = text.match(pattern.regex) || [];

      for (const match of matches) {
        const normalized = match.trim().toLowerCase();
        if (!seen.has(normalized)) {
          seen.add(normalized);
          entities.push({
            value: match.trim(),
            type: pattern.type,
            icon: pattern.icon,
            sensitive: pattern.sensitive || false
          });
        }
      }
    }

    return entities;
  }

  /**
   * Get entity statistics
   */
  getStats(entities) {
    const stats = {};
    for (const entity of entities) {
      stats[entity.type] = (stats[entity.type] || 0) + 1;
    }
    return stats;
  }
}

/**
 * Quick Intel Snapshot - Capture page intel
 */
class IntelSnapshot {
  /**
   * Create a snapshot of current page
   */
  createSnapshot(pageData) {
    return {
      id: `snapshot-${Date.now()}`,
      timestamp: new Date().toISOString(),
      url: pageData.url,
      title: pageData.title,
      domain: new URL(pageData.url).hostname,
      entities: pageData.entities || [],
      notes: pageData.notes || '',
      screenshot: pageData.screenshot || null,
      metadata: {
        capturedAt: Date.now(),
        userAgent: pageData.userAgent,
        cookies: pageData.cookieCount || 0
      }
    };
  }

  /**
   * Export snapshot to various formats
   */
  export(snapshot, format = 'json') {
    switch (format) {
      case 'json':
        return JSON.stringify(snapshot, null, 2);

      case 'markdown':
        return this._toMarkdown(snapshot);

      case 'csv':
        return this._toCsv(snapshot);

      default:
        return JSON.stringify(snapshot);
    }
  }

  _toMarkdown(snapshot) {
    let md = `# Intel Snapshot: ${snapshot.title}\n\n`;
    md += `**URL:** ${snapshot.url}\n`;
    md += `**Captured:** ${snapshot.timestamp}\n`;
    md += `**Domain:** ${snapshot.domain}\n\n`;

    if (snapshot.entities.length > 0) {
      md += `## Extracted Entities\n\n`;
      md += `| Type | Value |\n|------|-------|\n`;
      for (const entity of snapshot.entities) {
        md += `| ${entity.icon} ${entity.type} | \`${entity.value}\` |\n`;
      }
      md += '\n';
    }

    if (snapshot.notes) {
      md += `## Notes\n\n${snapshot.notes}\n`;
    }

    return md;
  }

  _toCsv(snapshot) {
    const rows = [['Type', 'Value', 'URL', 'Timestamp']];
    for (const entity of snapshot.entities) {
      rows.push([entity.type, entity.value, snapshot.url, snapshot.timestamp]);
    }
    return rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  }
}

/**
 * Cross-Reference Alerts - Detect same entity across tabs
 */
class CrossReferenceTracker {
  constructor() {
    this.entityIndex = new Map(); // entity -> Set of tabIds
    this.tabEntities = new Map(); // tabId -> Set of entities
  }

  /**
   * Index entities from a tab
   */
  indexTab(tabId, entities) {
    // Clear previous entries for this tab
    this.clearTab(tabId);

    const tabEntitySet = new Set();
    this.tabEntities.set(tabId, tabEntitySet);

    const crossRefs = [];

    for (const entity of entities) {
      const key = `${entity.type}:${entity.value.toLowerCase()}`;
      tabEntitySet.add(key);

      if (!this.entityIndex.has(key)) {
        this.entityIndex.set(key, new Set());
      }

      const existingTabs = this.entityIndex.get(key);

      // Check for cross-references (entity exists in other tabs)
      if (existingTabs.size > 0) {
        crossRefs.push({
          entity,
          foundInTabs: Array.from(existingTabs)
        });
      }

      existingTabs.add(tabId);
    }

    return crossRefs;
  }

  /**
   * Clear a tab's entries
   */
  clearTab(tabId) {
    const entities = this.tabEntities.get(tabId);
    if (entities) {
      for (const key of entities) {
        const tabs = this.entityIndex.get(key);
        if (tabs) {
          tabs.delete(tabId);
          if (tabs.size === 0) {
            this.entityIndex.delete(key);
          }
        }
      }
    }
    this.tabEntities.delete(tabId);
  }

  /**
   * Get all cross-referenced entities
   */
  getCrossReferences() {
    const results = [];
    for (const [key, tabs] of this.entityIndex) {
      if (tabs.size > 1) {
        const [type, value] = key.split(':');
        results.push({
          type,
          value,
          tabCount: tabs.size,
          tabIds: Array.from(tabs)
        });
      }
    }
    return results.sort((a, b) => b.tabCount - a.tabCount);
  }
}

// ============================================
// 4. COGNITIVE LOAD REDUCTION
// ============================================

/**
 * Focus Mode - Distraction-free research
 */
class FocusMode {
  constructor(store) {
    this.store = store;
    this.active = false;
    this.startTime = null;
    this.duration = 25 * 60 * 1000; // 25 minutes default (Pomodoro)
    this.breakDuration = 5 * 60 * 1000; // 5 minute break
    this.sessionsCompleted = 0;
  }

  /**
   * Start focus session
   */
  start(durationMinutes = 25) {
    this.active = true;
    this.startTime = Date.now();
    this.duration = durationMinutes * 60 * 1000;

    return {
      active: true,
      startTime: this.startTime,
      endTime: this.startTime + this.duration,
      duration: durationMinutes
    };
  }

  /**
   * Stop focus session
   */
  stop() {
    if (this.active) {
      const elapsed = Date.now() - this.startTime;
      if (elapsed >= this.duration * 0.8) {
        this.sessionsCompleted++;
      }
    }

    this.active = false;
    this.startTime = null;

    return {
      active: false,
      sessionsCompleted: this.sessionsCompleted
    };
  }

  /**
   * Get current status
   */
  getStatus() {
    if (!this.active) {
      return { active: false, sessionsCompleted: this.sessionsCompleted };
    }

    const elapsed = Date.now() - this.startTime;
    const remaining = Math.max(0, this.duration - elapsed);
    const progress = Math.min(100, (elapsed / this.duration) * 100);

    return {
      active: true,
      elapsed,
      remaining,
      progress,
      remainingFormatted: this._formatTime(remaining),
      sessionsCompleted: this.sessionsCompleted,
      shouldBreak: remaining === 0
    };
  }

  _formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

/**
 * Smart Bookmarks - Auto-tag and categorize
 */
class SmartBookmarks {
  constructor(store) {
    this.store = store;
    this.tagPatterns = {
      'social-media': /facebook|twitter|instagram|linkedin|tiktok/i,
      'news': /news|bbc|cnn|reuters|guardian/i,
      'government': /\.gov|court|pacer/i,
      'osint-tool': /shodan|censys|virustotal|hunter\.io/i,
      'archive': /archive\.org|wayback/i,
      'search': /google|bing|duckduckgo|yandex/i,
      'financial': /bank|crypto|bitcoin|payment/i,
      'research': /wikipedia|scholar|arxiv/i
    };
  }

  /**
   * Auto-generate tags for a bookmark
   */
  generateTags(url, title) {
    const tags = new Set();
    const combined = `${url} ${title}`.toLowerCase();

    for (const [tag, pattern] of Object.entries(this.tagPatterns)) {
      if (pattern.test(combined)) {
        tags.add(tag);
      }
    }

    // Add domain as tag
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      tags.add(domain);
    } catch (e) {}

    return Array.from(tags);
  }

  /**
   * Save bookmark with auto-tags
   */
  save(bookmark) {
    const bookmarks = this.store.get('ai.smartBookmarks', []);

    const smartBookmark = {
      id: `bm-${Date.now()}`,
      url: bookmark.url,
      title: bookmark.title,
      tags: bookmark.tags || this.generateTags(bookmark.url, bookmark.title),
      notes: bookmark.notes || '',
      createdAt: Date.now(),
      lastVisited: Date.now()
    };

    bookmarks.unshift(smartBookmark);
    this.store.set('ai.smartBookmarks', bookmarks.slice(0, 500));

    return smartBookmark;
  }

  /**
   * Search bookmarks
   */
  search(query) {
    const bookmarks = this.store.get('ai.smartBookmarks', []);
    const queryLower = query.toLowerCase();

    return bookmarks.filter(bm =>
      bm.title.toLowerCase().includes(queryLower) ||
      bm.url.toLowerCase().includes(queryLower) ||
      bm.tags.some(t => t.includes(queryLower)) ||
      (bm.notes && bm.notes.toLowerCase().includes(queryLower))
    );
  }

  /**
   * Get bookmarks by tag
   */
  getByTag(tag) {
    const bookmarks = this.store.get('ai.smartBookmarks', []);
    return bookmarks.filter(bm => bm.tags.includes(tag));
  }

  /**
   * Get all tags with counts
   */
  getTagCloud() {
    const bookmarks = this.store.get('ai.smartBookmarks', []);
    const tagCounts = {};

    for (const bm of bookmarks) {
      for (const tag of bm.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }
}

/**
 * Investigation Timeline - Visual history of research
 */
class InvestigationTimeline {
  constructor(store) {
    this.store = store;
    this.events = [];
  }

  /**
   * Add event to timeline
   */
  addEvent(type, data) {
    const event = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      data,
      timestamp: Date.now()
    };

    this.events.push(event);

    // Keep manageable
    if (this.events.length > 1000) {
      this.events = this.events.slice(-800);
    }

    this._save();
    return event;
  }

  /**
   * Get timeline for display
   */
  getTimeline(limit = 50) {
    return this.events.slice(-limit).reverse().map(evt => ({
      ...evt,
      timeAgo: this._timeAgo(evt.timestamp)
    }));
  }

  /**
   * Get activity summary
   */
  getSummary() {
    const now = Date.now();
    const hourAgo = now - 3600000;
    const dayAgo = now - 86400000;

    const lastHour = this.events.filter(e => e.timestamp > hourAgo).length;
    const lastDay = this.events.filter(e => e.timestamp > dayAgo).length;

    const typeCounts = {};
    for (const evt of this.events) {
      typeCounts[evt.type] = (typeCounts[evt.type] || 0) + 1;
    }

    return {
      totalEvents: this.events.length,
      lastHour,
      lastDay,
      byType: typeCounts
    };
  }

  _save() {
    // Only save last 200 events to storage
    this.store.set('ai.timeline', this.events.slice(-200));
  }

  _load() {
    this.events = this.store.get('ai.timeline', []);
  }

  _timeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}

// ============================================
// MAIN AI INTELLIGENCE CLASS
// ============================================

class AIIntelligence {
  constructor(store) {
    this.store = store;

    // Initialize all components
    this.tabGrouper = new SmartTabGrouper();
    this.sessionMemory = new SessionContextMemory(store);
    this.linkSuggester = new RelatedLinkSuggester();
    this.riskScorer = new SiteRiskScorer();
    this.fingerprintMeter = new FingerprintMeter();
    this.autoOpsec = new AutoOpsec();
    this.entityExtractor = new EntityExtractor();
    this.intelSnapshot = new IntelSnapshot();
    this.crossRef = new CrossReferenceTracker();
    this.focusMode = new FocusMode(store);
    this.smartBookmarks = new SmartBookmarks(store);
    this.timeline = new InvestigationTimeline(store);

    // Load saved state
    this.timeline._load();
  }

  /**
   * Process a new page load
   */
  onPageLoad(tabId, url, title) {
    // Group the tab
    const group = this.tabGrouper.addTab(tabId, url, title);

    // Score the risk
    const risk = this.riskScorer.calculateRisk(url);

    // Get suggestions
    const suggestions = this.linkSuggester.getSuggestions(url);

    // Add to timeline
    this.timeline.addEvent('page_load', { tabId, url, title: title.substring(0, 100) });

    return {
      group,
      risk,
      suggestions,
      autoOpsecMode: this.autoOpsec.getRecommendedMode(risk.score)
    };
  }

  /**
   * Process extracted entities from a page
   */
  onEntitiesExtracted(tabId, entities) {
    // Track cross-references
    const crossRefs = this.crossRef.indexTab(tabId, entities);

    // Track in session
    for (const entity of entities) {
      this.sessionMemory.trackEntity(entity);
    }

    // Add to timeline if significant
    if (entities.length > 0) {
      this.timeline.addEvent('entities_found', {
        tabId,
        count: entities.length,
        types: [...new Set(entities.map(e => e.type))]
      });
    }

    return { crossRefs, stats: this.entityExtractor.getStats(entities) };
  }

  /**
   * Handle tab close
   */
  onTabClose(tabId) {
    this.tabGrouper.removeTab(tabId);
    this.crossRef.clearTab(tabId);
  }

  /**
   * Get AI dashboard data
   */
  getDashboard(privacySettings) {
    return {
      groups: this.tabGrouper.getGroups(),
      session: this.sessionMemory.getSummary(),
      fingerprint: this.fingerprintMeter.calculateExposure(privacySettings),
      crossRefs: this.crossRef.getCrossReferences(),
      focus: this.focusMode.getStatus(),
      timeline: this.timeline.getSummary(),
      tagCloud: this.smartBookmarks.getTagCloud().slice(0, 15)
    };
  }
}

// Export all classes
module.exports = {
  AIIntelligence,
  SmartTabGrouper,
  SessionContextMemory,
  RelatedLinkSuggester,
  SiteRiskScorer,
  FingerprintMeter,
  AutoOpsec,
  EntityExtractor,
  IntelSnapshot,
  CrossReferenceTracker,
  FocusMode,
  SmartBookmarks,
  InvestigationTimeline
};
