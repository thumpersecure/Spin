/**
 * CONSTANTINE Browser - AI Predictive Privacy Shield
 * Version: 4.2.0 - The Exorcist's Edge
 *
 * Predictive Privacy Shield providing:
 * - Site Risk Scoring: Real-time threat/privacy assessment of URLs
 * - Fingerprint Exposure Meter: Visual indicator of privacy leakage
 * - Auto-OPSEC Mode: Automatic privacy escalation based on risk
 *
 * "Between Heaven and Hell, intelligence prevails."
 */

// ============================================
// Risk Categories & Weights
// ============================================

const RISK_CATEGORIES = {
  TRACKER_HEAVY: { weight: 3, label: 'Tracker Heavy', icon: '👁️' },
  FINGERPRINTING: { weight: 4, label: 'Fingerprinting Risk', icon: '🔍' },
  DATA_COLLECTION: { weight: 3, label: 'Data Collection', icon: '📊' },
  THIRD_PARTY_SCRIPTS: { weight: 2, label: 'Third-party Scripts', icon: '📜' },
  INSECURE_CONNECTION: { weight: 5, label: 'Insecure Connection', icon: '🔓' },
  KNOWN_MALICIOUS: { weight: 10, label: 'Known Malicious', icon: '⚠️' },
  PHISHING_SUSPECTED: { weight: 9, label: 'Phishing Suspected', icon: '🎣' },
  PRIVACY_HOSTILE: { weight: 4, label: 'Privacy Hostile', icon: '🚫' },
  SOCIAL_TRACKING: { weight: 3, label: 'Social Tracking', icon: '👥' },
  AD_NETWORK: { weight: 2, label: 'Ad Network', icon: '📢' }
};

// Known high-risk domains and patterns
const HIGH_RISK_DOMAINS = new Set([
  // Tracker domains
  'google-analytics.com', 'googletagmanager.com', 'doubleclick.net',
  'facebook.net', 'connect.facebook.net', 'pixel.facebook.com',
  'analytics.twitter.com', 'ads.twitter.com', 'bat.bing.com',
  'clarity.ms', 'hotjar.com', 'mouseflow.com', 'fullstory.com',
  'mixpanel.com', 'amplitude.com', 'segment.io', 'heap.io',
  'newrelic.com', 'sentry.io', 'bugsnag.com',
  // Ad networks
  'adroll.com', 'criteo.com', 'outbrain.com', 'taboola.com',
  'scorecardresearch.com', 'quantserve.com', 'comscore.com',
  'rubiconproject.com', 'pubmatic.com', 'openx.net',
  'demdex.net', 'krxd.net', 'bluekai.com', 'exelator.com'
]);

// Privacy-hostile domain patterns
const PRIVACY_HOSTILE_PATTERNS = [
  /google\.(com|co\.\w+)$/i,
  /facebook\.com$/i,
  /instagram\.com$/i,
  /tiktok\.com$/i,
  /amazon\.(com|co\.\w+)$/i,
  /microsoft\.com$/i,
  /linkedin\.com$/i
];

// Known safe/OSINT domains
const SAFE_OSINT_DOMAINS = new Set([
  'duckduckgo.com', 'startpage.com', 'searx.me',
  'shodan.io', 'censys.io', 'virustotal.com',
  'haveibeenpwned.com', 'archive.org', 'web.archive.org',
  'osintframework.com', 'securitytrails.com', 'dnsdumpster.com',
  'whois.domaintools.com', 'robtex.com', 'mxtoolbox.com',
  'hunter.io', 'epieos.com', 'emailrep.io',
  'tineye.com', 'fotoforensics.com', 'exif.regex.info',
  'namechk.com', 'whatsmyname.app', 'usersearch.org',
  'abuseipdb.com', 'hybrid-analysis.com', 'any.run'
]);

// Suspicious TLDs
const SUSPICIOUS_TLDS = new Set([
  '.tk', '.ml', '.ga', '.cf', '.gq', '.top', '.xyz', '.pw',
  '.cc', '.ws', '.icu', '.buzz', '.monster', '.surf'
]);

// Phishing keywords in URLs
const PHISHING_KEYWORDS = [
  'login', 'signin', 'account', 'verify', 'secure', 'update',
  'confirm', 'password', 'credential', 'authenticate', 'banking',
  'paypal', 'apple-id', 'microsoft-login', 'google-verify'
];

// ============================================
// Fingerprint Exposure Categories
// ============================================

const FINGERPRINT_VECTORS = {
  CANVAS: {
    name: 'Canvas Fingerprinting',
    description: 'Canvas API can uniquely identify your browser',
    severity: 'high',
    weight: 3
  },
  WEBGL: {
    name: 'WebGL Fingerprinting',
    description: 'WebGL reveals GPU and driver information',
    severity: 'high',
    weight: 3
  },
  AUDIO: {
    name: 'Audio Fingerprinting',
    description: 'AudioContext API creates unique audio signatures',
    severity: 'medium',
    weight: 2
  },
  FONTS: {
    name: 'Font Enumeration',
    description: 'Installed fonts can identify your system',
    severity: 'medium',
    weight: 2
  },
  SCREEN: {
    name: 'Screen Properties',
    description: 'Screen resolution and color depth reveal device info',
    severity: 'low',
    weight: 1
  },
  TIMEZONE: {
    name: 'Timezone Detection',
    description: 'Timezone can narrow down your location',
    severity: 'low',
    weight: 1
  },
  PLUGINS: {
    name: 'Plugin Detection',
    description: 'Browser plugins create a unique profile',
    severity: 'medium',
    weight: 2
  },
  WEBRTC: {
    name: 'WebRTC Leak',
    description: 'WebRTC can reveal your real IP address',
    severity: 'critical',
    weight: 5
  },
  USER_AGENT: {
    name: 'User Agent String',
    description: 'User agent reveals browser and OS details',
    severity: 'medium',
    weight: 2
  },
  HARDWARE: {
    name: 'Hardware Concurrency',
    description: 'CPU core count identifies your device',
    severity: 'low',
    weight: 1
  },
  MEMORY: {
    name: 'Device Memory',
    description: 'RAM amount helps identify your device',
    severity: 'low',
    weight: 1
  },
  BATTERY: {
    name: 'Battery Status',
    description: 'Battery API provides tracking data',
    severity: 'low',
    weight: 1
  }
};

// ============================================
// OPSEC Levels
// ============================================

const OPSEC_LEVELS = {
  STANDARD: {
    level: 1,
    name: 'Standard',
    description: 'Basic privacy protections enabled',
    color: '#27AE60',
    settings: {
      blockTrackers: true,
      blockFingerprinting: false,
      blockThirdPartyCookies: true,
      blockWebRTC: false,
      spoofUserAgent: false,
      torEnabled: false
    }
  },
  ENHANCED: {
    level: 2,
    name: 'Enhanced',
    description: 'Additional fingerprinting protections',
    color: '#F39C12',
    settings: {
      blockTrackers: true,
      blockFingerprinting: true,
      blockThirdPartyCookies: true,
      blockWebRTC: true,
      spoofUserAgent: true,
      torEnabled: false
    }
  },
  MAXIMUM: {
    level: 3,
    name: 'Maximum',
    description: 'Full anonymity with Tor routing',
    color: '#E74C3C',
    settings: {
      blockTrackers: true,
      blockFingerprinting: true,
      blockThirdPartyCookies: true,
      blockWebRTC: true,
      spoofUserAgent: true,
      torEnabled: true
    }
  }
};

// ============================================
// Site Risk Scorer
// ============================================

class SiteRiskScorer {
  constructor() {
    this.riskCache = new Map();
    this.cacheMaxAge = 10 * 60 * 1000; // 10 minutes
    this.domainReputations = new Map();
  }

  async analyzeUrl(url) {
    if (!url || typeof url !== 'string') {
      return this._createEmptyRisk();
    }

    try {
      const urlObj = new URL(url);
      const cacheKey = urlObj.hostname;

      // Check cache
      const cached = this.riskCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < this.cacheMaxAge) {
        return cached.risk;
      }

      const risk = await this._analyzeUrlInternal(urlObj);

      this.riskCache.set(cacheKey, {
        risk,
        timestamp: Date.now()
      });

      return risk;
    } catch (e) {
      return this._createEmptyRisk();
    }
  }

  async _analyzeUrlInternal(urlObj) {
    const hostname = urlObj.hostname.toLowerCase();
    const fullUrl = urlObj.href.toLowerCase();
    const protocol = urlObj.protocol;

    const risks = [];
    let totalScore = 0;

    // Check protocol security
    if (protocol === 'http:') {
      risks.push({
        category: RISK_CATEGORIES.INSECURE_CONNECTION,
        reason: 'Connection is not encrypted (HTTP)'
      });
      totalScore += RISK_CATEGORIES.INSECURE_CONNECTION.weight * 10;
    }

    // Check if it's a known tracker/ad domain
    if (HIGH_RISK_DOMAINS.has(hostname) || this._matchesDomainSet(hostname, HIGH_RISK_DOMAINS)) {
      risks.push({
        category: RISK_CATEGORIES.TRACKER_HEAVY,
        reason: 'Known tracking or advertising domain'
      });
      totalScore += RISK_CATEGORIES.TRACKER_HEAVY.weight * 10;
    }

    // Check privacy-hostile patterns
    for (const pattern of PRIVACY_HOSTILE_PATTERNS) {
      if (pattern.test(hostname)) {
        risks.push({
          category: RISK_CATEGORIES.PRIVACY_HOSTILE,
          reason: 'Privacy-hostile platform with extensive tracking'
        });
        totalScore += RISK_CATEGORIES.PRIVACY_HOSTILE.weight * 8;
        break;
      }
    }

    // Check suspicious TLDs
    for (const tld of SUSPICIOUS_TLDS) {
      if (hostname.endsWith(tld)) {
        risks.push({
          category: RISK_CATEGORIES.PHISHING_SUSPECTED,
          reason: `Suspicious TLD: ${tld}`
        });
        totalScore += RISK_CATEGORIES.PHISHING_SUSPECTED.weight * 5;
        break;
      }
    }

    // Check for phishing keywords
    const phishingMatches = PHISHING_KEYWORDS.filter(kw => fullUrl.includes(kw));
    if (phishingMatches.length > 1) {
      risks.push({
        category: RISK_CATEGORIES.PHISHING_SUSPECTED,
        reason: `Multiple suspicious keywords: ${phishingMatches.join(', ')}`
      });
      totalScore += RISK_CATEGORIES.PHISHING_SUSPECTED.weight * phishingMatches.length;
    }

    // Check for random-looking domains (potential malware/phishing)
    if (this._looksRandom(hostname)) {
      risks.push({
        category: RISK_CATEGORIES.KNOWN_MALICIOUS,
        reason: 'Domain appears randomly generated (possible DGA)'
      });
      totalScore += RISK_CATEGORIES.KNOWN_MALICIOUS.weight * 5;
    }

    // Check if it's a safe OSINT domain
    const isSafe = SAFE_OSINT_DOMAINS.has(hostname);
    if (isSafe) {
      totalScore = Math.max(0, totalScore - 30);
    }

    // Calculate final score (0-100)
    const finalScore = Math.min(100, Math.max(0, totalScore));

    return {
      url: urlObj.href,
      hostname,
      score: finalScore,
      level: this._scoreToLevel(finalScore),
      risks,
      isSafeOsint: isSafe,
      isSecure: protocol === 'https:',
      recommendations: this._generateRecommendations(risks, finalScore),
      analyzedAt: Date.now()
    };
  }

  _matchesDomainSet(hostname, domainSet) {
    for (const domain of domainSet) {
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        return true;
      }
    }
    return false;
  }

  _looksRandom(hostname) {
    // Remove TLD and check the rest
    const parts = hostname.split('.');
    if (parts.length < 2) return false;

    const mainPart = parts.slice(0, -1).join('');

    // Check for patterns that suggest DGA
    const consonantRatio = (mainPart.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []).length / mainPart.length;
    const hasNoVowels = !/[aeiou]/i.test(mainPart);
    const tooManyNumbers = (mainPart.match(/\d/g) || []).length > mainPart.length * 0.4;
    const veryLong = mainPart.length > 20;

    return (consonantRatio > 0.8 && veryLong) || (hasNoVowels && mainPart.length > 8) || tooManyNumbers;
  }

  _scoreToLevel(score) {
    if (score >= 70) return { level: 'critical', label: 'Critical Risk', color: '#C0392B' };
    if (score >= 50) return { level: 'high', label: 'High Risk', color: '#E74C3C' };
    if (score >= 30) return { level: 'medium', label: 'Medium Risk', color: '#F39C12' };
    if (score >= 10) return { level: 'low', label: 'Low Risk', color: '#F1C40F' };
    return { level: 'safe', label: 'Low Risk', color: '#27AE60' };
  }

  _generateRecommendations(risks, score) {
    const recommendations = [];

    if (score >= 50) {
      recommendations.push({
        priority: 'high',
        action: 'Enable Tor routing for this site',
        reason: 'High risk score detected'
      });
    }

    if (risks.some(r => r.category === RISK_CATEGORIES.INSECURE_CONNECTION)) {
      recommendations.push({
        priority: 'critical',
        action: 'Do not enter sensitive information',
        reason: 'Connection is not encrypted'
      });
    }

    if (risks.some(r => r.category === RISK_CATEGORIES.TRACKER_HEAVY)) {
      recommendations.push({
        priority: 'medium',
        action: 'Enable tracker blocking',
        reason: 'Site contains heavy tracking'
      });
    }

    if (risks.some(r => r.category === RISK_CATEGORIES.PHISHING_SUSPECTED)) {
      recommendations.push({
        priority: 'critical',
        action: 'Verify site authenticity before proceeding',
        reason: 'Potential phishing indicators detected'
      });
    }

    if (risks.some(r => r.category === RISK_CATEGORIES.FINGERPRINTING)) {
      recommendations.push({
        priority: 'medium',
        action: 'Enable fingerprint protection',
        reason: 'Site may be fingerprinting your browser'
      });
    }

    return recommendations;
  }

  _createEmptyRisk() {
    return {
      url: null,
      hostname: null,
      score: 0,
      level: { level: 'unknown', label: 'Unknown', color: '#95A5A6' },
      risks: [],
      isSafeOsint: false,
      isSecure: false,
      recommendations: [],
      analyzedAt: Date.now()
    };
  }

  clearCache() {
    this.riskCache.clear();
  }
}

// ============================================
// Fingerprint Exposure Meter
// ============================================

class FingerprintExposureMeter {
  constructor() {
    this.protections = new Map();
    this.currentExposure = 100; // Start at 100% exposed
  }

  setProtection(vector, enabled) {
    if (FINGERPRINT_VECTORS[vector]) {
      this.protections.set(vector, enabled);
      this._recalculateExposure();
    }
  }

  setProtections(protectionSettings) {
    // Map privacy settings to fingerprint vectors
    const mappings = {
      blockFingerprinting: ['CANVAS', 'WEBGL', 'AUDIO', 'FONTS'],
      blockWebRTC: ['WEBRTC'],
      spoofUserAgent: ['USER_AGENT'],
      blockThirdPartyCookies: ['PLUGINS']
    };

    for (const [setting, vectors] of Object.entries(mappings)) {
      if (protectionSettings[setting]) {
        for (const vector of vectors) {
          this.protections.set(vector, true);
        }
      }
    }

    // Additional protections from CONSTANTINE defaults
    if (protectionSettings.blockFingerprinting) {
      this.protections.set('SCREEN', true);
      this.protections.set('HARDWARE', true);
      this.protections.set('MEMORY', true);
      this.protections.set('TIMEZONE', true);
      this.protections.set('BATTERY', true);
    }

    this._recalculateExposure();
  }

  _recalculateExposure() {
    let totalWeight = 0;
    let protectedWeight = 0;

    for (const [vector, config] of Object.entries(FINGERPRINT_VECTORS)) {
      totalWeight += config.weight;
      if (this.protections.get(vector)) {
        protectedWeight += config.weight;
      }
    }

    this.currentExposure = Math.round(((totalWeight - protectedWeight) / totalWeight) * 100);
  }

  getExposure() {
    return {
      percentage: this.currentExposure,
      level: this._exposureLevel(),
      vectors: this._getVectorStatus(),
      recommendations: this._getRecommendations()
    };
  }

  _exposureLevel() {
    if (this.currentExposure >= 70) {
      return { level: 'critical', label: 'High Exposure', color: '#E74C3C' };
    }
    if (this.currentExposure >= 40) {
      return { level: 'medium', label: 'Moderate Exposure', color: '#F39C12' };
    }
    if (this.currentExposure >= 20) {
      return { level: 'low', label: 'Low Exposure', color: '#F1C40F' };
    }
    return { level: 'minimal', label: 'Minimal Exposure', color: '#27AE60' };
  }

  _getVectorStatus() {
    const status = [];
    for (const [vector, config] of Object.entries(FINGERPRINT_VECTORS)) {
      status.push({
        id: vector,
        ...config,
        protected: this.protections.get(vector) || false
      });
    }
    return status.sort((a, b) => b.weight - a.weight);
  }

  _getRecommendations() {
    const recommendations = [];
    const unprotected = [];

    for (const [vector, config] of Object.entries(FINGERPRINT_VECTORS)) {
      if (!this.protections.get(vector)) {
        unprotected.push({ vector, ...config });
      }
    }

    // Sort by weight (severity)
    unprotected.sort((a, b) => b.weight - a.weight);

    // Generate recommendations for top unprotected vectors
    for (const item of unprotected.slice(0, 3)) {
      recommendations.push({
        vector: item.vector,
        action: `Enable protection against ${item.name}`,
        impact: `Would reduce exposure by ~${Math.round(item.weight / 24 * 100)}%`,
        severity: item.severity
      });
    }

    return recommendations;
  }
}

// ============================================
// Auto-OPSEC Controller
// ============================================

class AutoOpsecController {
  constructor(riskScorer, fingerprintMeter) {
    this.riskScorer = riskScorer;
    this.fingerprintMeter = fingerprintMeter;
    this.currentLevel = OPSEC_LEVELS.STANDARD;
    this.autoMode = false;
    this.escalationHistory = [];
    this.maxHistorySize = 50;
  }

  setAutoMode(enabled) {
    this.autoMode = enabled;
    return { autoMode: this.autoMode, currentLevel: this.currentLevel };
  }

  isAutoModeEnabled() {
    return this.autoMode;
  }

  getCurrentLevel() {
    return this.currentLevel;
  }

  setLevel(levelName) {
    const level = OPSEC_LEVELS[levelName.toUpperCase()];
    if (level) {
      this.currentLevel = level;
      this.fingerprintMeter.setProtections(level.settings);
      return { success: true, level: this.currentLevel };
    }
    return { success: false, error: 'Invalid OPSEC level' };
  }

  async evaluateAndAdjust(url) {
    if (!this.autoMode) {
      return { adjusted: false, level: this.currentLevel };
    }

    const risk = await this.riskScorer.analyzeUrl(url);
    const requiredLevel = this._determineRequiredLevel(risk);

    if (requiredLevel.level > this.currentLevel.level) {
      const previousLevel = this.currentLevel;
      this.currentLevel = requiredLevel;
      this.fingerprintMeter.setProtections(requiredLevel.settings);

      this.escalationHistory.push({
        url,
        previousLevel: previousLevel.name,
        newLevel: requiredLevel.name,
        reason: risk.level.label,
        timestamp: Date.now()
      });

      if (this.escalationHistory.length > this.maxHistorySize) {
        this.escalationHistory.shift();
      }

      return {
        adjusted: true,
        previousLevel,
        newLevel: requiredLevel,
        risk,
        reason: `Risk level ${risk.level.label} requires ${requiredLevel.name} OPSEC`
      };
    }

    return { adjusted: false, level: this.currentLevel, risk };
  }

  _determineRequiredLevel(risk) {
    if (risk.score >= 60) {
      return OPSEC_LEVELS.MAXIMUM;
    }
    if (risk.score >= 30) {
      return OPSEC_LEVELS.ENHANCED;
    }
    return OPSEC_LEVELS.STANDARD;
  }

  getEscalationHistory() {
    return [...this.escalationHistory].reverse();
  }

  getStatus() {
    return {
      autoMode: this.autoMode,
      currentLevel: this.currentLevel,
      exposure: this.fingerprintMeter.getExposure(),
      recentEscalations: this.escalationHistory.slice(-5).reverse()
    };
  }

  getAllLevels() {
    return Object.values(OPSEC_LEVELS);
  }
}

// ============================================
// AI Privacy Shield Main Class
// ============================================

class AIPrivacyShield {
  constructor() {
    this.riskScorer = new SiteRiskScorer();
    this.fingerprintMeter = new FingerprintExposureMeter();
    this.opsecController = new AutoOpsecController(this.riskScorer, this.fingerprintMeter);
    this.isActive = false;
  }

  initialize(privacySettings = {}) {
    this.isActive = true;
    this.fingerprintMeter.setProtections(privacySettings);
    return {
      success: true,
      message: 'AI Privacy Shield initialized',
      exposure: this.fingerprintMeter.getExposure(),
      opsecLevel: this.opsecController.getCurrentLevel()
    };
  }

  shutdown() {
    this.isActive = false;
    return { success: true };
  }

  // Risk scoring methods
  async analyzeUrl(url) {
    return this.riskScorer.analyzeUrl(url);
  }

  // Fingerprint exposure methods
  getExposure() {
    return this.fingerprintMeter.getExposure();
  }

  updateProtections(settings) {
    this.fingerprintMeter.setProtections(settings);
    return this.fingerprintMeter.getExposure();
  }

  // OPSEC control methods
  setAutoOpsec(enabled) {
    return this.opsecController.setAutoMode(enabled);
  }

  isAutoOpsecEnabled() {
    return this.opsecController.isAutoModeEnabled();
  }

  setOpsecLevel(level) {
    return this.opsecController.setLevel(level);
  }

  getCurrentOpsecLevel() {
    return this.opsecController.getCurrentLevel();
  }

  getAllOpsecLevels() {
    return this.opsecController.getAllLevels();
  }

  async evaluateUrl(url) {
    const opsecResult = await this.opsecController.evaluateAndAdjust(url);
    return {
      ...opsecResult,
      exposure: this.fingerprintMeter.getExposure()
    };
  }

  getOpsecStatus() {
    return this.opsecController.getStatus();
  }

  getEscalationHistory() {
    return this.opsecController.getEscalationHistory();
  }

  // Export/Import state
  exportState() {
    return {
      isActive: this.isActive,
      autoOpsec: this.opsecController.isAutoModeEnabled(),
      opsecLevel: this.opsecController.getCurrentLevel().name,
      escalationHistory: this.opsecController.getEscalationHistory(),
      exportedAt: Date.now()
    };
  }

  importState(state) {
    if (!state) return false;

    try {
      this.isActive = state.isActive || false;
      if (state.autoOpsec) {
        this.opsecController.setAutoMode(true);
      }
      if (state.opsecLevel) {
        this.opsecController.setLevel(state.opsecLevel);
      }
      return true;
    } catch (e) {
      console.error('Failed to import AI Privacy Shield state:', e);
      return false;
    }
  }
}

// ============================================
// Export Module
// ============================================

module.exports = {
  AIPrivacyShield,
  SiteRiskScorer,
  FingerprintExposureMeter,
  AutoOpsecController,
  RISK_CATEGORIES,
  FINGERPRINT_VECTORS,
  OPSEC_LEVELS,
  HIGH_RISK_DOMAINS,
  SAFE_OSINT_DOMAINS
};
