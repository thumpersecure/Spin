/**
 * CONSTANTINE Browser - AI Cognitive Load Reduction Tools
 * Version: 4.2.0 - The Exorcist's Edge
 *
 * Cognitive Load Reduction Tools providing:
 * - Focus Mode: Distraction-free research with session timers
 * - Smart Bookmarks: Auto-tag and categorize saved pages
 * - Investigation Timeline: Visual history of research path
 *
 * "Between Heaven and Hell, intelligence prevails."
 */

// ============================================
// Focus Mode States & Timers
// ============================================

const FOCUS_PRESETS = {
  QUICK: {
    name: 'Quick Session',
    duration: 15 * 60 * 1000, // 15 minutes
    breakDuration: 3 * 60 * 1000, // 3 minutes
    icon: '⚡',
    color: '#27AE60'
  },
  STANDARD: {
    name: 'Standard Session',
    duration: 25 * 60 * 1000, // 25 minutes (Pomodoro)
    breakDuration: 5 * 60 * 1000, // 5 minutes
    icon: '🎯',
    color: '#3498DB'
  },
  DEEP: {
    name: 'Deep Work',
    duration: 50 * 60 * 1000, // 50 minutes
    breakDuration: 10 * 60 * 1000, // 10 minutes
    icon: '🧠',
    color: '#9B59B6'
  },
  MARATHON: {
    name: 'Marathon Session',
    duration: 90 * 60 * 1000, // 90 minutes
    breakDuration: 15 * 60 * 1000, // 15 minutes
    icon: '🏃',
    color: '#E74C3C'
  },
  CUSTOM: {
    name: 'Custom',
    duration: null,
    breakDuration: null,
    icon: '⚙️',
    color: '#F1C40F'
  }
};

const DISTRACTION_PATTERNS = [
  // Social media
  /facebook\.com/i, /twitter\.com/i, /x\.com/i, /instagram\.com/i,
  /tiktok\.com/i, /reddit\.com/i, /pinterest\.com/i, /tumblr\.com/i,
  // Entertainment
  /youtube\.com/i, /netflix\.com/i, /twitch\.tv/i, /spotify\.com/i,
  /hulu\.com/i, /disneyplus\.com/i,
  // News (can be distracting)
  /news\.ycombinator\.com/i, /buzzfeed\.com/i,
  // Shopping
  /amazon\.com/i, /ebay\.com/i, /etsy\.com/i,
  // Gaming
  /steam\.com/i, /epicgames\.com/i
];

// ============================================
// Focus Mode Controller
// ============================================

class FocusModeController {
  constructor() {
    this.isActive = false;
    this.currentSession = null;
    this.sessions = [];
    this.maxSessions = 100;
    this.distractionAttempts = [];
    this.listeners = {
      onStart: [],
      onEnd: [],
      onBreak: [],
      onDistraction: [],
      onTick: []
    };
    this.tickInterval = null;
  }

  startSession(preset = 'STANDARD', customDuration = null, customBreak = null) {
    if (this.isActive) {
      return { success: false, error: 'Session already active' };
    }

    const config = FOCUS_PRESETS[preset] || FOCUS_PRESETS.STANDARD;
    const duration = preset === 'CUSTOM' ? customDuration : config.duration;
    const breakDuration = preset === 'CUSTOM' ? customBreak : config.breakDuration;

    if (!duration || duration < 60000) {
      return { success: false, error: 'Duration must be at least 1 minute' };
    }

    this.currentSession = {
      id: `focus-${Date.now()}`,
      preset,
      presetName: config.name,
      icon: config.icon,
      color: config.color,
      duration,
      breakDuration,
      startedAt: Date.now(),
      endsAt: Date.now() + duration,
      remainingTime: duration,
      distractionAttempts: 0,
      blockedUrls: [],
      pagesVisited: [],
      status: 'active',
      notes: []
    };

    this.isActive = true;
    this.distractionAttempts = [];

    // Start tick interval
    this.tickInterval = setInterval(() => this._tick(), 1000);

    // Notify listeners
    this._emit('onStart', this.currentSession);

    return {
      success: true,
      session: this.currentSession
    };
  }

  _tick() {
    if (!this.currentSession || !this.isActive) return;

    const now = Date.now();
    this.currentSession.remainingTime = Math.max(0, this.currentSession.endsAt - now);

    this._emit('onTick', {
      remainingTime: this.currentSession.remainingTime,
      elapsed: now - this.currentSession.startedAt,
      progress: ((now - this.currentSession.startedAt) / this.currentSession.duration) * 100
    });

    if (this.currentSession.remainingTime <= 0) {
      this._completeSession();
    }
  }

  _completeSession() {
    if (!this.currentSession) return;

    clearInterval(this.tickInterval);
    this.tickInterval = null;

    this.currentSession.status = 'completed';
    this.currentSession.completedAt = Date.now();
    this.currentSession.actualDuration = this.currentSession.completedAt - this.currentSession.startedAt;

    this.sessions.unshift({ ...this.currentSession });
    if (this.sessions.length > this.maxSessions) {
      this.sessions = this.sessions.slice(0, this.maxSessions);
    }

    this._emit('onBreak', {
      session: this.currentSession,
      breakDuration: this.currentSession.breakDuration
    });

    this.isActive = false;
    this.currentSession = null;
  }

  endSession(force = false) {
    if (!this.currentSession) {
      return { success: false, error: 'No active session' };
    }

    clearInterval(this.tickInterval);
    this.tickInterval = null;

    this.currentSession.status = force ? 'cancelled' : 'ended';
    this.currentSession.completedAt = Date.now();
    this.currentSession.actualDuration = this.currentSession.completedAt - this.currentSession.startedAt;

    const session = { ...this.currentSession };
    this.sessions.unshift(session);

    this._emit('onEnd', session);

    this.isActive = false;
    this.currentSession = null;

    return { success: true, session };
  }

  pauseSession() {
    if (!this.currentSession || this.currentSession.status !== 'active') {
      return { success: false, error: 'No active session to pause' };
    }

    clearInterval(this.tickInterval);
    this.tickInterval = null;

    this.currentSession.status = 'paused';
    this.currentSession.pausedAt = Date.now();
    this.currentSession.remainingTime = this.currentSession.endsAt - Date.now();

    return { success: true, session: this.currentSession };
  }

  resumeSession() {
    if (!this.currentSession || this.currentSession.status !== 'paused') {
      return { success: false, error: 'No paused session to resume' };
    }

    this.currentSession.status = 'active';
    this.currentSession.endsAt = Date.now() + this.currentSession.remainingTime;
    delete this.currentSession.pausedAt;

    this.tickInterval = setInterval(() => this._tick(), 1000);

    return { success: true, session: this.currentSession };
  }

  checkUrl(url) {
    if (!this.isActive || !this.currentSession) {
      return { blocked: false };
    }

    for (const pattern of DISTRACTION_PATTERNS) {
      if (pattern.test(url)) {
        this.currentSession.distractionAttempts++;
        this.currentSession.blockedUrls.push({
          url,
          attemptedAt: Date.now()
        });

        this._emit('onDistraction', {
          url,
          pattern: pattern.toString(),
          totalAttempts: this.currentSession.distractionAttempts
        });

        return {
          blocked: true,
          reason: 'Distraction detected during focus session',
          totalAttempts: this.currentSession.distractionAttempts
        };
      }
    }

    // Track visited pages
    this.currentSession.pagesVisited.push({
      url,
      visitedAt: Date.now()
    });

    return { blocked: false };
  }

  addNote(note) {
    if (!this.currentSession) {
      return { success: false, error: 'No active session' };
    }

    this.currentSession.notes.push({
      id: `note-${Date.now()}`,
      content: note,
      addedAt: Date.now()
    });

    return { success: true };
  }

  getStatus() {
    if (!this.currentSession) {
      return { active: false };
    }

    return {
      active: true,
      session: this.currentSession,
      remainingTime: this.currentSession.remainingTime,
      progress: ((Date.now() - this.currentSession.startedAt) / this.currentSession.duration) * 100
    };
  }

  getPresets() {
    return Object.entries(FOCUS_PRESETS).map(([key, value]) => ({
      id: key,
      ...value
    }));
  }

  getSessionHistory(limit = 20) {
    return this.sessions.slice(0, limit);
  }

  getStats() {
    const totalSessions = this.sessions.length;
    const completedSessions = this.sessions.filter(s => s.status === 'completed').length;
    const totalFocusTime = this.sessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0);
    const avgSessionLength = totalSessions > 0 ? totalFocusTime / totalSessions : 0;
    const totalDistractions = this.sessions.reduce((sum, s) => sum + (s.distractionAttempts || 0), 0);

    return {
      totalSessions,
      completedSessions,
      completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
      totalFocusTime,
      totalFocusTimeFormatted: this._formatDuration(totalFocusTime),
      avgSessionLength,
      avgSessionLengthFormatted: this._formatDuration(avgSessionLength),
      totalDistractions,
      avgDistractionsPerSession: totalSessions > 0 ? totalDistractions / totalSessions : 0
    };
  }

  _formatDuration(ms) {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
    return () => {
      if (this.listeners[event]) {
        const index = this.listeners[event].indexOf(callback);
        if (index !== -1) {
          this.listeners[event].splice(index, 1);
        }
      }
    };
  }

  _emit(event, data) {
    if (this.listeners[event]) {
      for (const callback of this.listeners[event]) {
        try {
          callback(data);
        } catch (e) {
          console.error(`Focus mode event error (${event}):`, e);
        }
      }
    }
  }
}

// ============================================
// Smart Bookmark Categories
// ============================================

const BOOKMARK_CATEGORIES = {
  OSINT_TOOLS: {
    name: 'OSINT Tools',
    icon: '🔍',
    color: '#3498DB',
    patterns: [
      /osintframework/i, /shodan/i, /censys/i, /maltego/i,
      /spiderfoot/i, /recon-ng/i, /theHarvester/i
    ]
  },
  PEOPLE_SEARCH: {
    name: 'People Search',
    icon: '👤',
    color: '#9B59B6',
    patterns: [
      /pipl/i, /whitepages/i, /spokeo/i, /beenverified/i,
      /truepeoplesearch/i, /thatsthem/i, /namechk/i, /whatsmyname/i
    ]
  },
  EMAIL_TOOLS: {
    name: 'Email Tools',
    icon: '📧',
    color: '#E74C3C',
    patterns: [
      /hunter\.io/i, /emailrep/i, /epieos/i, /haveibeenpwned/i,
      /verify-email/i, /holehe/i
    ]
  },
  DOMAIN_IP: {
    name: 'Domain & IP',
    icon: '🌐',
    color: '#27AE60',
    patterns: [
      /shodan/i, /censys/i, /securitytrails/i, /dnsdumpster/i,
      /whois/i, /domaintools/i, /mxtoolbox/i, /robtex/i
    ]
  },
  SOCIAL_MEDIA: {
    name: 'Social Media',
    icon: '💬',
    color: '#1DA1F2',
    patterns: [
      /facebook/i, /twitter/i, /instagram/i, /linkedin/i,
      /tiktok/i, /social-searcher/i, /socialblade/i
    ]
  },
  THREAT_INTEL: {
    name: 'Threat Intel',
    icon: '🛡️',
    color: '#C0392B',
    patterns: [
      /virustotal/i, /hybrid-analysis/i, /any\.run/i,
      /abuseipdb/i, /otx\.alienvault/i, /threatcrowd/i
    ]
  },
  ARCHIVES: {
    name: 'Archives',
    icon: '📜',
    color: '#7F8C8D',
    patterns: [
      /archive\.org/i, /wayback/i, /cachedview/i, /archive\.today/i
    ]
  },
  IMAGE_ANALYSIS: {
    name: 'Image Analysis',
    icon: '🖼️',
    color: '#F39C12',
    patterns: [
      /tineye/i, /pimeyes/i, /yandex.*image/i, /fotoforensics/i
    ]
  },
  DOCUMENTATION: {
    name: 'Documentation',
    icon: '📚',
    color: '#2ECC71',
    patterns: [
      /github\.com/i, /docs\./i, /wiki/i, /readme/i, /manual/i
    ]
  },
  RESEARCH: {
    name: 'Research',
    icon: '📖',
    color: '#8E44AD',
    patterns: [
      /scholar\.google/i, /arxiv/i, /researchgate/i, /academia\.edu/i
    ]
  }
};

// ============================================
// Smart Bookmark Manager
// ============================================

class SmartBookmarkManager {
  constructor() {
    this.bookmarks = [];
    this.tags = new Map();
    this.categories = new Map();
    this.searchIndex = new Map();
  }

  addBookmark(bookmark) {
    const { url, title, description = '', tags = [] } = bookmark;

    if (!url) {
      return { success: false, error: 'URL is required' };
    }

    // Check for duplicates
    if (this.bookmarks.some(b => b.url === url)) {
      return { success: false, error: 'Bookmark already exists' };
    }

    // Auto-categorize
    const category = this._categorize(url, title);

    // Auto-generate tags
    const autoTags = this._generateTags(url, title, description);
    const allTags = [...new Set([...tags, ...autoTags])];

    const newBookmark = {
      id: `bm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url,
      title: title || url,
      description,
      category: category?.name || 'Uncategorized',
      categoryId: category?.id || 'UNCATEGORIZED',
      categoryIcon: category?.icon || '📌',
      categoryColor: category?.color || '#95A5A6',
      tags: allTags,
      createdAt: Date.now(),
      lastVisited: null,
      visitCount: 0,
      notes: [],
      isFavorite: false
    };

    this.bookmarks.push(newBookmark);

    // Update tag index
    for (const tag of allTags) {
      if (!this.tags.has(tag)) {
        this.tags.set(tag, new Set());
      }
      this.tags.get(tag).add(newBookmark.id);
    }

    // Update category index
    if (!this.categories.has(newBookmark.categoryId)) {
      this.categories.set(newBookmark.categoryId, new Set());
    }
    this.categories.get(newBookmark.categoryId).add(newBookmark.id);

    // Update search index
    this._indexBookmark(newBookmark);

    return { success: true, bookmark: newBookmark };
  }

  _categorize(url, title) {
    const text = `${url} ${title}`.toLowerCase();

    for (const [id, config] of Object.entries(BOOKMARK_CATEGORIES)) {
      for (const pattern of config.patterns) {
        if (pattern.test(text)) {
          return { id, ...config };
        }
      }
    }

    return null;
  }

  _generateTags(url, title, description) {
    const tags = [];
    const text = `${url} ${title} ${description}`.toLowerCase();

    // Extract hostname as tag
    try {
      const hostname = new URL(url).hostname.replace('www.', '');
      tags.push(hostname);
    } catch (e) {}

    // Common keyword detection
    const keywords = [
      { word: 'osint', tag: 'osint' },
      { word: 'investigation', tag: 'investigation' },
      { word: 'search', tag: 'search' },
      { word: 'lookup', tag: 'lookup' },
      { word: 'analysis', tag: 'analysis' },
      { word: 'security', tag: 'security' },
      { word: 'threat', tag: 'threat' },
      { word: 'malware', tag: 'malware' },
      { word: 'phishing', tag: 'phishing' },
      { word: 'email', tag: 'email' },
      { word: 'phone', tag: 'phone' },
      { word: 'social', tag: 'social-media' },
      { word: 'domain', tag: 'domain' },
      { word: 'ip', tag: 'ip-address' }
    ];

    for (const { word, tag } of keywords) {
      if (text.includes(word)) {
        tags.push(tag);
      }
    }

    // Add date tag
    tags.push(new Date().toISOString().split('T')[0]);

    return tags;
  }

  _indexBookmark(bookmark) {
    const words = `${bookmark.title} ${bookmark.description} ${bookmark.tags.join(' ')}`.toLowerCase().split(/\s+/);

    for (const word of words) {
      if (word.length < 2) continue;
      if (!this.searchIndex.has(word)) {
        this.searchIndex.set(word, new Set());
      }
      this.searchIndex.get(word).add(bookmark.id);
    }
  }

  removeBookmark(id) {
    const index = this.bookmarks.findIndex(b => b.id === id);
    if (index === -1) {
      return { success: false, error: 'Bookmark not found' };
    }

    const bookmark = this.bookmarks[index];

    // Remove from tag index
    for (const tag of bookmark.tags) {
      const tagSet = this.tags.get(tag);
      if (tagSet) {
        tagSet.delete(id);
        if (tagSet.size === 0) {
          this.tags.delete(tag);
        }
      }
    }

    // Remove from category index
    const categorySet = this.categories.get(bookmark.categoryId);
    if (categorySet) {
      categorySet.delete(id);
    }

    this.bookmarks.splice(index, 1);

    return { success: true };
  }

  updateBookmark(id, updates) {
    const bookmark = this.bookmarks.find(b => b.id === id);
    if (!bookmark) {
      return { success: false, error: 'Bookmark not found' };
    }

    // Update allowed fields
    const allowedFields = ['title', 'description', 'tags', 'isFavorite', 'notes'];
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        if (field === 'tags') {
          // Update tag index
          for (const oldTag of bookmark.tags) {
            const tagSet = this.tags.get(oldTag);
            if (tagSet) tagSet.delete(id);
          }
          for (const newTag of updates.tags) {
            if (!this.tags.has(newTag)) {
              this.tags.set(newTag, new Set());
            }
            this.tags.get(newTag).add(id);
          }
        }
        bookmark[field] = updates[field];
      }
    }

    bookmark.updatedAt = Date.now();

    return { success: true, bookmark };
  }

  recordVisit(id) {
    const bookmark = this.bookmarks.find(b => b.id === id);
    if (bookmark) {
      bookmark.lastVisited = Date.now();
      bookmark.visitCount++;
    }
  }

  getBookmark(id) {
    return this.bookmarks.find(b => b.id === id) || null;
  }

  getBookmarks(options = {}) {
    let results = [...this.bookmarks];

    // Filter by category
    if (options.category) {
      results = results.filter(b => b.categoryId === options.category);
    }

    // Filter by tag
    if (options.tag) {
      const bookmarkIds = this.tags.get(options.tag);
      if (bookmarkIds) {
        results = results.filter(b => bookmarkIds.has(b.id));
      } else {
        results = [];
      }
    }

    // Filter favorites only
    if (options.favoritesOnly) {
      results = results.filter(b => b.isFavorite);
    }

    // Sort
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    results.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'visitCount':
          comparison = a.visitCount - b.visitCount;
          break;
        case 'lastVisited':
          comparison = (a.lastVisited || 0) - (b.lastVisited || 0);
          break;
        case 'createdAt':
        default:
          comparison = a.createdAt - b.createdAt;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Limit
    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  searchBookmarks(query) {
    const words = query.toLowerCase().split(/\s+/).filter(w => w.length >= 2);

    if (words.length === 0) {
      return this.bookmarks;
    }

    const matchCounts = new Map();

    for (const word of words) {
      const bookmarkIds = this.searchIndex.get(word) || new Set();
      for (const id of bookmarkIds) {
        matchCounts.set(id, (matchCounts.get(id) || 0) + 1);
      }
    }

    // Sort by match count
    const sorted = Array.from(matchCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    return sorted.map(id => this.bookmarks.find(b => b.id === id)).filter(Boolean);
  }

  getCategories() {
    const categories = [];

    for (const [id, config] of Object.entries(BOOKMARK_CATEGORIES)) {
      const bookmarkIds = this.categories.get(id);
      categories.push({
        id,
        ...config,
        count: bookmarkIds?.size || 0
      });
    }

    // Add uncategorized
    const uncategorizedIds = this.categories.get('UNCATEGORIZED');
    categories.push({
      id: 'UNCATEGORIZED',
      name: 'Uncategorized',
      icon: '📌',
      color: '#95A5A6',
      count: uncategorizedIds?.size || 0
    });

    return categories.sort((a, b) => b.count - a.count);
  }

  getAllTags() {
    return Array.from(this.tags.entries())
      .map(([tag, ids]) => ({ tag, count: ids.size }))
      .sort((a, b) => b.count - a.count);
  }

  exportState() {
    return {
      bookmarks: this.bookmarks,
      exportedAt: Date.now()
    };
  }

  importState(state) {
    if (!state || !state.bookmarks) return false;

    this.bookmarks = [];
    this.tags.clear();
    this.categories.clear();
    this.searchIndex.clear();

    for (const bookmark of state.bookmarks) {
      this.bookmarks.push(bookmark);

      // Rebuild indexes
      for (const tag of bookmark.tags || []) {
        if (!this.tags.has(tag)) {
          this.tags.set(tag, new Set());
        }
        this.tags.get(tag).add(bookmark.id);
      }

      if (!this.categories.has(bookmark.categoryId)) {
        this.categories.set(bookmark.categoryId, new Set());
      }
      this.categories.get(bookmark.categoryId).add(bookmark.id);

      this._indexBookmark(bookmark);
    }

    return true;
  }
}

// ============================================
// Investigation Timeline
// ============================================

class InvestigationTimeline {
  constructor() {
    this.events = [];
    this.maxEvents = 1000;
    this.currentInvestigation = null;
  }

  startInvestigation(name, description = '') {
    if (this.currentInvestigation) {
      this.endInvestigation();
    }

    this.currentInvestigation = {
      id: `inv-${Date.now()}`,
      name,
      description,
      startedAt: Date.now(),
      events: [],
      status: 'active'
    };

    this.addEvent({
      type: 'investigation_started',
      title: `Started: ${name}`,
      description
    });

    return this.currentInvestigation;
  }

  endInvestigation(summary = '') {
    if (!this.currentInvestigation) {
      return null;
    }

    this.currentInvestigation.endedAt = Date.now();
    this.currentInvestigation.duration = this.currentInvestigation.endedAt - this.currentInvestigation.startedAt;
    this.currentInvestigation.status = 'completed';
    this.currentInvestigation.summary = summary;

    this.addEvent({
      type: 'investigation_ended',
      title: `Ended: ${this.currentInvestigation.name}`,
      description: summary
    });

    const completed = this.currentInvestigation;
    this.currentInvestigation = null;
    return completed;
  }

  addEvent(eventData) {
    const event = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: eventData.type || 'generic',
      title: eventData.title,
      description: eventData.description || '',
      url: eventData.url || null,
      tabId: eventData.tabId || null,
      entities: eventData.entities || [],
      metadata: eventData.metadata || {},
      timestamp: Date.now(),
      investigationId: this.currentInvestigation?.id || null
    };

    this.events.unshift(event);
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }

    if (this.currentInvestigation) {
      this.currentInvestigation.events.push(event.id);
    }

    return event;
  }

  // Event type helpers
  trackPageVisit(url, title, tabId) {
    return this.addEvent({
      type: 'page_visit',
      title: `Visited: ${title || url}`,
      url,
      tabId
    });
  }

  trackSearch(query, engine) {
    return this.addEvent({
      type: 'search',
      title: `Searched: "${query}"`,
      description: `Using ${engine}`,
      metadata: { query, engine }
    });
  }

  trackEntityFound(entity, url) {
    return this.addEvent({
      type: 'entity_found',
      title: `Found: ${entity.displayName}`,
      description: entity.value,
      url,
      entities: [entity]
    });
  }

  trackBookmarkAdded(bookmark) {
    return this.addEvent({
      type: 'bookmark_added',
      title: `Bookmarked: ${bookmark.title}`,
      url: bookmark.url
    });
  }

  trackSnapshotCaptured(snapshot) {
    return this.addEvent({
      type: 'snapshot_captured',
      title: `Snapshot: ${snapshot.title}`,
      url: snapshot.url,
      metadata: { snapshotId: snapshot.id }
    });
  }

  trackNote(note) {
    return this.addEvent({
      type: 'note_added',
      title: 'Added note',
      description: note
    });
  }

  trackPrivacyChange(setting, value) {
    return this.addEvent({
      type: 'privacy_change',
      title: `Privacy: ${setting}`,
      description: value ? 'Enabled' : 'Disabled',
      metadata: { setting, value }
    });
  }

  getEvents(options = {}) {
    let results = [...this.events];

    // Filter by type
    if (options.type) {
      results = results.filter(e => e.type === options.type);
    }

    // Filter by investigation
    if (options.investigationId) {
      results = results.filter(e => e.investigationId === options.investigationId);
    }

    // Filter by date range
    if (options.since) {
      results = results.filter(e => e.timestamp >= options.since);
    }
    if (options.until) {
      results = results.filter(e => e.timestamp <= options.until);
    }

    // Limit
    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  getCurrentInvestigation() {
    return this.currentInvestigation;
  }

  getTimelineVisualization(limit = 50) {
    const events = this.events.slice(0, limit);

    // Group by hour for visualization
    const grouped = new Map();

    for (const event of events) {
      const hour = new Date(event.timestamp);
      hour.setMinutes(0, 0, 0);
      const key = hour.getTime();

      if (!grouped.has(key)) {
        grouped.set(key, {
          hour: hour.toISOString(),
          events: [],
          types: new Set()
        });
      }

      grouped.get(key).events.push(event);
      grouped.get(key).types.add(event.type);
    }

    return Array.from(grouped.values()).map(g => ({
      ...g,
      types: Array.from(g.types),
      eventCount: g.events.length
    }));
  }

  exportTimeline(investigationId = null) {
    const events = investigationId
      ? this.events.filter(e => e.investigationId === investigationId)
      : this.events;

    return {
      investigation: investigationId ? this.currentInvestigation : null,
      events,
      exportedAt: Date.now()
    };
  }

  exportState() {
    return {
      events: this.events,
      currentInvestigation: this.currentInvestigation,
      exportedAt: Date.now()
    };
  }

  importState(state) {
    if (!state) return false;

    this.events = state.events || [];
    this.currentInvestigation = state.currentInvestigation || null;
    return true;
  }
}

// ============================================
// AI Cognitive Tools Main Class
// ============================================

class AICognitiveTools {
  constructor() {
    this.focusMode = new FocusModeController();
    this.smartBookmarks = new SmartBookmarkManager();
    this.timeline = new InvestigationTimeline();
    this.isActive = false;
  }

  initialize() {
    this.isActive = true;
    return {
      success: true,
      message: 'AI Cognitive Tools initialized'
    };
  }

  shutdown() {
    this.isActive = false;
    if (this.focusMode.isActive) {
      this.focusMode.endSession(true);
    }
    return { success: true };
  }

  // Focus Mode methods
  startFocusSession(preset, customDuration, customBreak) {
    return this.focusMode.startSession(preset, customDuration, customBreak);
  }

  endFocusSession(force) {
    return this.focusMode.endSession(force);
  }

  pauseFocusSession() {
    return this.focusMode.pauseSession();
  }

  resumeFocusSession() {
    return this.focusMode.resumeSession();
  }

  checkFocusUrl(url) {
    return this.focusMode.checkUrl(url);
  }

  getFocusStatus() {
    return this.focusMode.getStatus();
  }

  getFocusPresets() {
    return this.focusMode.getPresets();
  }

  getFocusHistory(limit) {
    return this.focusMode.getSessionHistory(limit);
  }

  getFocusStats() {
    return this.focusMode.getStats();
  }

  addFocusNote(note) {
    return this.focusMode.addNote(note);
  }

  onFocusEvent(event, callback) {
    return this.focusMode.on(event, callback);
  }

  // Smart Bookmark methods
  addSmartBookmark(bookmark) {
    const result = this.smartBookmarks.addBookmark(bookmark);
    if (result.success) {
      this.timeline.trackBookmarkAdded(result.bookmark);
    }
    return result;
  }

  removeSmartBookmark(id) {
    return this.smartBookmarks.removeBookmark(id);
  }

  updateSmartBookmark(id, updates) {
    return this.smartBookmarks.updateBookmark(id, updates);
  }

  getSmartBookmarks(options) {
    return this.smartBookmarks.getBookmarks(options);
  }

  searchSmartBookmarks(query) {
    return this.smartBookmarks.searchBookmarks(query);
  }

  getBookmarkCategories() {
    return this.smartBookmarks.getCategories();
  }

  getBookmarkTags() {
    return this.smartBookmarks.getAllTags();
  }

  recordBookmarkVisit(id) {
    this.smartBookmarks.recordVisit(id);
  }

  // Timeline methods
  startInvestigation(name, description) {
    return this.timeline.startInvestigation(name, description);
  }

  endInvestigation(summary) {
    return this.timeline.endInvestigation(summary);
  }

  trackTimelineEvent(eventData) {
    return this.timeline.addEvent(eventData);
  }

  trackPageVisit(url, title, tabId) {
    return this.timeline.trackPageVisit(url, title, tabId);
  }

  trackSearch(query, engine) {
    return this.timeline.trackSearch(query, engine);
  }

  trackEntityFound(entity, url) {
    return this.timeline.trackEntityFound(entity, url);
  }

  trackNote(note) {
    return this.timeline.trackNote(note);
  }

  getTimelineEvents(options) {
    return this.timeline.getEvents(options);
  }

  getCurrentInvestigation() {
    return this.timeline.getCurrentInvestigation();
  }

  getTimelineVisualization(limit) {
    return this.timeline.getTimelineVisualization(limit);
  }

  exportTimeline(investigationId) {
    return this.timeline.exportTimeline(investigationId);
  }

  // Export/Import
  exportState() {
    return {
      focusMode: {
        sessions: this.focusMode.sessions
      },
      smartBookmarks: this.smartBookmarks.exportState(),
      timeline: this.timeline.exportState(),
      isActive: this.isActive,
      exportedAt: Date.now()
    };
  }

  importState(state) {
    if (!state) return false;

    try {
      if (state.focusMode?.sessions) {
        this.focusMode.sessions = state.focusMode.sessions;
      }
      if (state.smartBookmarks) {
        this.smartBookmarks.importState(state.smartBookmarks);
      }
      if (state.timeline) {
        this.timeline.importState(state.timeline);
      }
      this.isActive = state.isActive || false;
      return true;
    } catch (e) {
      console.error('Failed to import AI Cognitive Tools state:', e);
      return false;
    }
  }
}

// ============================================
// Export Module
// ============================================

module.exports = {
  AICognitiveTools,
  FocusModeController,
  SmartBookmarkManager,
  InvestigationTimeline,
  FOCUS_PRESETS,
  BOOKMARK_CATEGORIES,
  DISTRACTION_PATTERNS
};
