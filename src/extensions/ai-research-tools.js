/**
 * CONSTANTINE Browser - AI Research Augmentation Tools
 * Version: 4.2.0 - The Exorcist's Edge
 *
 * Research Augmentation Tools providing:
 * - Entity Extraction Panel: Auto-detect phone numbers, emails, addresses, names
 * - Quick Intel Snapshot: One-click capture of page + metadata for reports
 * - Cross-Reference Alerts: Detect when same entity appears across tabs
 *
 * "Between Heaven and Hell, intelligence prevails."
 */

// ============================================
// Entity Types & Patterns
// ============================================

const ENTITY_TYPES = {
  PHONE: {
    name: 'Phone Number',
    icon: '📞',
    color: '#27AE60',
    patterns: [
      // International format
      /\+?1?[-.\s]?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
      // E.164 format
      /\+[1-9]\d{6,14}/g,
      // Various international formats
      /\+\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
      // UK format
      /(?:\+44|0)\s?[1-9]\d{1,4}\s?\d{3,4}\s?\d{3,4}/g
    ]
  },
  EMAIL: {
    name: 'Email Address',
    icon: '📧',
    color: '#E74C3C',
    patterns: [
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    ]
  },
  USERNAME: {
    name: 'Username/Handle',
    icon: '👤',
    color: '#4A90D9',
    patterns: [
      /@([a-zA-Z0-9_]{3,30})\b/g,
      /(?:user|username|handle|screen[\s_-]?name)[\s:]+([a-zA-Z0-9_.-]{3,30})/gi
    ]
  },
  IP_ADDRESS: {
    name: 'IP Address',
    icon: '🌐',
    color: '#9B59B6',
    patterns: [
      // IPv4
      /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
      // IPv6
      /(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}/g
    ]
  },
  DOMAIN: {
    name: 'Domain',
    icon: '🔗',
    color: '#3498DB',
    patterns: [
      /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?)/gi
    ]
  },
  CRYPTO_WALLET: {
    name: 'Crypto Wallet',
    icon: '💰',
    color: '#F1C40F',
    patterns: [
      // Bitcoin
      /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/g,
      // Ethereum
      /\b0x[a-fA-F0-9]{40}\b/g,
      // Bitcoin Bech32
      /\bbc1[a-z0-9]{39,59}\b/g
    ]
  },
  HASH: {
    name: 'Hash/Checksum',
    icon: '🔐',
    color: '#8E44AD',
    patterns: [
      // MD5
      /\b[a-fA-F0-9]{32}\b/g,
      // SHA-1
      /\b[a-fA-F0-9]{40}\b/g,
      // SHA-256
      /\b[a-fA-F0-9]{64}\b/g
    ]
  },
  SSN: {
    name: 'SSN (Potential)',
    icon: '⚠️',
    color: '#C0392B',
    patterns: [
      /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g
    ],
    sensitive: true
  },
  CREDIT_CARD: {
    name: 'Credit Card (Potential)',
    icon: '💳',
    color: '#C0392B',
    patterns: [
      /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g
    ],
    sensitive: true
  },
  COORDINATES: {
    name: 'GPS Coordinates',
    icon: '📍',
    color: '#2ECC71',
    patterns: [
      /[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)[,\s]+[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)/g
    ]
  },
  DATE: {
    name: 'Date',
    icon: '📅',
    color: '#16A085',
    patterns: [
      // Various date formats (in character class: / and . don't need escaping, - at end)
      /\b\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\b/g,
      /\b\d{4}[/.-]\d{1,2}[/.-]\d{1,2}\b/g,
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}\b/gi
    ]
  },
  SOCIAL_URL: {
    name: 'Social Media URL',
    icon: '💬',
    color: '#1DA1F2',
    patterns: [
      /https?:\/\/(?:www\.)?(?:facebook|fb)\.com\/[a-zA-Z0-9.]+/gi,
      /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[a-zA-Z0-9_]+/gi,
      /https?:\/\/(?:www\.)?instagram\.com\/[a-zA-Z0-9_.]+/gi,
      /https?:\/\/(?:www\.)?linkedin\.com\/(?:in|company)\/[a-zA-Z0-9-]+/gi,
      /https?:\/\/(?:www\.)?tiktok\.com\/@?[a-zA-Z0-9_.]+/gi
    ]
  },
  NAME: {
    name: 'Potential Name',
    icon: '🏷️',
    color: '#9B59B6',
    patterns: [
      /\b[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g
    ]
  }
};

// ============================================
// Entity Extractor
// ============================================

// Maximum entries to prevent memory exhaustion
const MAX_EXTRACTED_ENTITIES = 5000;
const MAX_SNAPSHOTS = 500;
const MAX_ENTITY_TABS = 1000;

class EntityExtractor {
  constructor() {
    this.extractedEntities = new Map();
    this.entityCounter = 0;
  }

  // Prevent unbounded Map growth
  _enforceEntityLimit() {
    if (this.extractedEntities.size > MAX_EXTRACTED_ENTITIES) {
      // Remove oldest entries (first inserted)
      const entriesToRemove = this.extractedEntities.size - MAX_EXTRACTED_ENTITIES + 100;
      const keys = Array.from(this.extractedEntities.keys()).slice(0, entriesToRemove);
      for (const key of keys) {
        this.extractedEntities.delete(key);
      }
    }
  }

  extractFromText(text, sourceInfo = {}) {
    if (!text || typeof text !== 'string') {
      return { entities: [], counts: {} };
    }

    const entities = [];
    const counts = {};
    const seen = new Set();

    for (const [type, config] of Object.entries(ENTITY_TYPES)) {
      counts[type] = 0;

      for (const pattern of config.patterns) {
        // Reset pattern lastIndex
        pattern.lastIndex = 0;

        let match;
        while ((match = pattern.exec(text)) !== null) {
          const value = match[1] || match[0];
          const normalizedValue = this._normalizeEntity(value, type);

          // Skip duplicates
          const key = `${type}:${normalizedValue}`;
          if (seen.has(key)) continue;
          seen.add(key);

          // Validate entity
          if (!this._validateEntity(normalizedValue, type)) continue;

          const entity = {
            id: `entity-${++this.entityCounter}`,
            type,
            value: normalizedValue,
            originalValue: value,
            displayName: config.name,
            icon: config.icon,
            color: config.color,
            sensitive: config.sensitive || false,
            position: match.index,
            context: this._extractContext(text, match.index, value.length),
            source: sourceInfo,
            extractedAt: Date.now()
          };

          entities.push(entity);
          counts[type]++;

          // Store for cross-referencing
          if (!this.extractedEntities.has(normalizedValue)) {
            this.extractedEntities.set(normalizedValue, []);
          }
          this.extractedEntities.get(normalizedValue).push(entity);
        }
      }
    }

    // Prevent memory exhaustion from unbounded growth
    this._enforceEntityLimit();

    return {
      entities: entities.sort((a, b) => a.position - b.position),
      counts,
      totalCount: entities.length
    };
  }

  _normalizeEntity(value, type) {
    switch (type) {
      case 'PHONE':
        return value.replace(/[^\d+]/g, '');
      case 'EMAIL':
        return value.toLowerCase().trim();
      case 'USERNAME':
        return value.replace(/^@/, '').toLowerCase().trim();
      case 'IP_ADDRESS':
        return value.trim();
      case 'DOMAIN':
        return value.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').toLowerCase().trim();
      case 'CRYPTO_WALLET':
        return value.trim();
      case 'HASH':
        return value.toLowerCase().trim();
      default:
        return value.trim();
    }
  }

  _validateEntity(value, type) {
    switch (type) {
      case 'PHONE':
        // Must have at least 7 digits
        return value.replace(/\D/g, '').length >= 7;
      case 'EMAIL':
        // Basic email validation
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'USERNAME':
        // Must be 3-30 characters
        return value.length >= 3 && value.length <= 30;
      case 'IP_ADDRESS': {
        // Validate IP format
        const parts = value.split('.');
        if (parts.length !== 4) return false;
        return parts.every(p => {
          const num = parseInt(p, 10);
          return num >= 0 && num <= 255;
        });
      }
      case 'HASH':
        // Only accept common hash lengths
        return [32, 40, 64].includes(value.length);
      case 'SSN':
      case 'CREDIT_CARD':
        // Be conservative with sensitive data
        return true;
      case 'NAME': {
        // Filter out common false positives
        const commonWords = ['The', 'This', 'That', 'With', 'From', 'About', 'More'];
        return !commonWords.some(w => value.startsWith(w));
      }
      default:
        return value.length > 0;
    }
  }

  _extractContext(text, position, length, contextLength = 50) {
    const start = Math.max(0, position - contextLength);
    const end = Math.min(text.length, position + length + contextLength);

    let context = text.substring(start, end);

    if (start > 0) context = '...' + context;
    if (end < text.length) context = context + '...';

    return context.replace(/\s+/g, ' ').trim();
  }

  getEntityById(id) {
    for (const entities of this.extractedEntities.values()) {
      const found = entities.find(e => e.id === id);
      if (found) return found;
    }
    return null;
  }

  findRelatedEntities(value) {
    const normalized = value.toLowerCase().trim();
    return this.extractedEntities.get(normalized) || [];
  }

  clearEntities() {
    this.extractedEntities.clear();
    this.entityCounter = 0;
  }

  getEntityStats() {
    const stats = {};
    let total = 0;

    for (const [value, entities] of this.extractedEntities.entries()) {
      for (const entity of entities) {
        if (!stats[entity.type]) {
          stats[entity.type] = {
            count: 0,
            unique: new Set(),
            displayName: entity.displayName,
            icon: entity.icon
          };
        }
        stats[entity.type].count++;
        stats[entity.type].unique.add(value);
        total++;
      }
    }

    // Convert Sets to counts
    for (const type of Object.keys(stats)) {
      stats[type].uniqueCount = stats[type].unique.size;
      delete stats[type].unique;
    }

    return { stats, total };
  }
}

// ============================================
// Quick Intel Snapshot
// ============================================

class QuickIntelSnapshot {
  constructor(entityExtractor) {
    this.entityExtractor = entityExtractor;
    this.snapshots = [];
    this.maxSnapshots = 100;
  }

  async captureSnapshot(pageData) {
    const {
      url,
      title,
      content,
      screenshot,
      metadata = {}
    } = pageData;

    // Extract entities from content
    const extraction = this.entityExtractor.extractFromText(content, {
      url,
      title,
      capturedAt: Date.now()
    });

    const snapshot = {
      id: `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url,
      title,
      metadata: {
        ...metadata,
        capturedAt: Date.now(),
        contentLength: content?.length || 0
      },
      entities: extraction.entities,
      entityCounts: extraction.counts,
      screenshot: screenshot || null,
      notes: [],
      tags: this._autoGenerateTags(url, title, extraction.entities),
      status: 'captured'
    };

    this.snapshots.unshift(snapshot);
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots = this.snapshots.slice(0, this.maxSnapshots);
    }

    return snapshot;
  }

  _autoGenerateTags(url, title, entities) {
    const tags = new Set();

    try {
      const urlObj = new URL(url);
      tags.add(urlObj.hostname);
    } catch (e) {
      // Invalid URL - skip hostname tag
    }

    // Add entity type tags
    const entityTypes = new Set(entities.map(e => e.type));
    for (const type of entityTypes) {
      tags.add(type.toLowerCase().replace('_', '-'));
    }

    // Add date tag
    tags.add(new Date().toISOString().split('T')[0]);

    return Array.from(tags);
  }

  addNote(snapshotId, note) {
    const snapshot = this.snapshots.find(s => s.id === snapshotId);
    if (snapshot) {
      snapshot.notes.push({
        id: `note-${Date.now()}`,
        content: note,
        addedAt: Date.now()
      });
      return true;
    }
    return false;
  }

  addTag(snapshotId, tag) {
    const snapshot = this.snapshots.find(s => s.id === snapshotId);
    if (snapshot && !snapshot.tags.includes(tag)) {
      snapshot.tags.push(tag);
      return true;
    }
    return false;
  }

  getSnapshot(id) {
    return this.snapshots.find(s => s.id === id) || null;
  }

  getSnapshots(limit = 20, offset = 0) {
    return this.snapshots.slice(offset, offset + limit);
  }

  searchSnapshots(query) {
    const q = query.toLowerCase();
    return this.snapshots.filter(s =>
      s.url.toLowerCase().includes(q) ||
      s.title?.toLowerCase().includes(q) ||
      s.tags.some(t => t.toLowerCase().includes(q)) ||
      s.notes.some(n => n.content.toLowerCase().includes(q)) ||
      s.entities.some(e => e.value.toLowerCase().includes(q))
    );
  }

  deleteSnapshot(id) {
    const index = this.snapshots.findIndex(s => s.id === id);
    if (index !== -1) {
      this.snapshots.splice(index, 1);
      return true;
    }
    return false;
  }

  exportSnapshot(id, format = 'json') {
    const snapshot = this.getSnapshot(id);
    if (!snapshot) return null;

    switch (format) {
      case 'json':
        return JSON.stringify(snapshot, null, 2);
      case 'markdown':
        return this._toMarkdown(snapshot);
      case 'html':
        return this._toHTML(snapshot);
      case 'text':
        return this._toText(snapshot);
      default:
        return JSON.stringify(snapshot, null, 2);
    }
  }

  _toMarkdown(snapshot) {
    let md = `# Intel Snapshot: ${snapshot.title || 'Untitled'}\n\n`;
    md += `**URL:** ${snapshot.url}\n`;
    md += `**Captured:** ${new Date(snapshot.metadata.capturedAt).toLocaleString()}\n`;
    md += `**Tags:** ${snapshot.tags.join(', ')}\n\n`;

    if (snapshot.entities.length > 0) {
      md += `## Extracted Entities (${snapshot.entities.length})\n\n`;

      const grouped = {};
      for (const entity of snapshot.entities) {
        if (!grouped[entity.type]) grouped[entity.type] = [];
        grouped[entity.type].push(entity);
      }

      for (const [type, entities] of Object.entries(grouped)) {
        md += `### ${entities[0].displayName} (${entities.length})\n\n`;
        for (const entity of entities) {
          md += `- \`${entity.value}\`\n`;
        }
        md += '\n';
      }
    }

    if (snapshot.notes.length > 0) {
      md += `## Notes\n\n`;
      for (const note of snapshot.notes) {
        md += `- ${note.content} _(${new Date(note.addedAt).toLocaleString()})_\n`;
      }
    }

    md += `\n---\n_Generated by CONSTANTINE Browser v4.2.0_\n`;

    return md;
  }

  _toHTML(snapshot) {
    const escapeHtml = (text) => {
      if (!text) return '';
      const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
      return String(text).replace(/[&<>"']/g, m => map[m]);
    };

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Intel Snapshot: ${escapeHtml(snapshot.title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #1a1a1e; color: #e8e6e3; padding: 40px; max-width: 900px; margin: 0 auto; }
    h1 { color: #D4A32D; border-bottom: 2px solid #D4A32D; padding-bottom: 10px; }
    h2 { color: #D4A32D; margin-top: 30px; }
    .meta { color: #9d9d9d; margin-bottom: 20px; }
    .tag { display: inline-block; background: #2a2a2e; padding: 4px 10px; border-radius: 4px; margin: 2px; }
    .entity { padding: 8px 12px; margin: 4px 0; background: #2a2a2e; border-left: 3px solid #D4A32D; }
    .entity-value { font-family: monospace; color: #00CED1; }
    .note { padding: 10px; margin: 5px 0; background: #2a2a2e; border-radius: 4px; }
    .footer { margin-top: 40px; text-align: center; color: #666; font-style: italic; }
  </style>
</head>
<body>
  <h1>${escapeHtml(snapshot.title || 'Intel Snapshot')}</h1>
  <div class="meta">
    <p><strong>URL:</strong> <a href="${escapeHtml(snapshot.url)}" style="color:#00CED1">${escapeHtml(snapshot.url)}</a></p>
    <p><strong>Captured:</strong> ${new Date(snapshot.metadata.capturedAt).toLocaleString()}</p>
    <p><strong>Tags:</strong> ${snapshot.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join(' ')}</p>
  </div>`;

    if (snapshot.entities.length > 0) {
      html += `<h2>Extracted Entities (${snapshot.entities.length})</h2>`;

      const grouped = {};
      for (const entity of snapshot.entities) {
        if (!grouped[entity.type]) grouped[entity.type] = [];
        grouped[entity.type].push(entity);
      }

      for (const [type, entities] of Object.entries(grouped)) {
        html += `<h3>${entities[0].icon} ${escapeHtml(entities[0].displayName)} (${entities.length})</h3>`;
        for (const entity of entities) {
          html += `<div class="entity"><span class="entity-value">${escapeHtml(entity.value)}</span></div>`;
        }
      }
    }

    if (snapshot.notes.length > 0) {
      html += `<h2>Notes</h2>`;
      for (const note of snapshot.notes) {
        html += `<div class="note">${escapeHtml(note.content)}<br><small style="color:#666">${new Date(note.addedAt).toLocaleString()}</small></div>`;
      }
    }

    html += `<div class="footer">Generated by CONSTANTINE Browser v4.2.0</div></body></html>`;

    return html;
  }

  _toText(snapshot) {
    let text = `INTEL SNAPSHOT\n${'='.repeat(50)}\n\n`;
    text += `Title: ${snapshot.title || 'Untitled'}\n`;
    text += `URL: ${snapshot.url}\n`;
    text += `Captured: ${new Date(snapshot.metadata.capturedAt).toLocaleString()}\n`;
    text += `Tags: ${snapshot.tags.join(', ')}\n\n`;

    if (snapshot.entities.length > 0) {
      text += `EXTRACTED ENTITIES (${snapshot.entities.length})\n${'-'.repeat(30)}\n\n`;

      const grouped = {};
      for (const entity of snapshot.entities) {
        if (!grouped[entity.type]) grouped[entity.type] = [];
        grouped[entity.type].push(entity);
      }

      for (const [type, entities] of Object.entries(grouped)) {
        text += `${entities[0].displayName} (${entities.length}):\n`;
        for (const entity of entities) {
          text += `  - ${entity.value}\n`;
        }
        text += '\n';
      }
    }

    if (snapshot.notes.length > 0) {
      text += `NOTES\n${'-'.repeat(30)}\n\n`;
      for (const note of snapshot.notes) {
        text += `- ${note.content}\n  (${new Date(note.addedAt).toLocaleString()})\n\n`;
      }
    }

    text += `\n${'='.repeat(50)}\nGenerated by CONSTANTINE Browser v4.2.0\n`;

    return text;
  }

  exportState() {
    return {
      snapshots: this.snapshots,
      exportedAt: Date.now()
    };
  }

  importState(state) {
    if (state && state.snapshots) {
      this.snapshots = state.snapshots;
    }
  }
}

// ============================================
// Cross-Reference Alert System
// ============================================

class CrossReferenceAlert {
  constructor(entityExtractor) {
    this.entityExtractor = entityExtractor;
    this.tabEntities = new Map(); // tabId -> Set of entity values
    this.entityToTabs = new Map(); // entity value -> Set of tabIds
    this.alerts = [];
    this.maxAlerts = 100;
    this.alertListeners = [];
  }

  // Prevent unbounded Map growth
  _enforceTabLimits() {
    if (this.entityToTabs.size > MAX_ENTITY_TABS) {
      // Remove oldest entries
      const entriesToRemove = this.entityToTabs.size - MAX_ENTITY_TABS + 50;
      const keys = Array.from(this.entityToTabs.keys()).slice(0, entriesToRemove);
      for (const key of keys) {
        this.entityToTabs.delete(key);
      }
    }
  }

  registerTab(tabId, entities) {
    // Clear previous entities for this tab
    this.unregisterTab(tabId);

    const entitySet = new Set();
    for (const entity of entities) {
      const key = `${entity.type}:${entity.value}`;
      entitySet.add(key);

      if (!this.entityToTabs.has(key)) {
        this.entityToTabs.set(key, new Set());
      }

      const tabs = this.entityToTabs.get(key);

      // Check for cross-reference before adding
      if (tabs.size > 0 && !tabs.has(tabId)) {
        this._createAlert(entity, Array.from(tabs), tabId);
      }

      tabs.add(tabId);
    }

    this.tabEntities.set(tabId, entitySet);

    // Prevent memory exhaustion
    this._enforceTabLimits();
  }

  unregisterTab(tabId) {
    const entities = this.tabEntities.get(tabId);
    if (entities) {
      for (const key of entities) {
        const tabs = this.entityToTabs.get(key);
        if (tabs) {
          tabs.delete(tabId);
          if (tabs.size === 0) {
            this.entityToTabs.delete(key);
          }
        }
      }
      this.tabEntities.delete(tabId);
    }
  }

  _createAlert(entity, existingTabs, newTabId) {
    const alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entityType: entity.type,
      entityValue: entity.value,
      displayName: entity.displayName,
      icon: entity.icon,
      color: entity.color,
      existingTabs,
      newTabId,
      createdAt: Date.now(),
      acknowledged: false
    };

    this.alerts.unshift(alert);
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(0, this.maxAlerts);
    }

    // Notify listeners
    for (const listener of this.alertListeners) {
      try {
        listener(alert);
      } catch (e) {
        console.error('Alert listener error:', e);
      }
    }

    return alert;
  }

  onAlert(callback) {
    this.alertListeners.push(callback);
    return () => {
      const index = this.alertListeners.indexOf(callback);
      if (index !== -1) {
        this.alertListeners.splice(index, 1);
      }
    };
  }

  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  dismissAlert(alertId) {
    const index = this.alerts.findIndex(a => a.id === alertId);
    if (index !== -1) {
      this.alerts.splice(index, 1);
      return true;
    }
    return false;
  }

  getAlerts(includeAcknowledged = false) {
    if (includeAcknowledged) {
      return [...this.alerts];
    }
    return this.alerts.filter(a => !a.acknowledged);
  }

  getUnacknowledgedCount() {
    return this.alerts.filter(a => !a.acknowledged).length;
  }

  getEntityOccurrences(entityValue, entityType) {
    const key = `${entityType}:${entityValue}`;
    const tabs = this.entityToTabs.get(key);
    return tabs ? Array.from(tabs) : [];
  }

  getCrossReferenceReport() {
    const report = [];

    for (const [key, tabs] of this.entityToTabs.entries()) {
      if (tabs.size > 1) {
        const [type, value] = key.split(':');
        const config = ENTITY_TYPES[type];
        report.push({
          type,
          value,
          displayName: config?.name || type,
          icon: config?.icon || '❓',
          tabCount: tabs.size,
          tabs: Array.from(tabs)
        });
      }
    }

    return report.sort((a, b) => b.tabCount - a.tabCount);
  }

  clearAlerts() {
    this.alerts = [];
  }

  clearAll() {
    this.tabEntities.clear();
    this.entityToTabs.clear();
    this.alerts = [];
  }
}

// ============================================
// AI Research Tools Main Class
// ============================================

class AIResearchTools {
  constructor() {
    this.entityExtractor = new EntityExtractor();
    this.snapshotManager = new QuickIntelSnapshot(this.entityExtractor);
    this.crossReference = new CrossReferenceAlert(this.entityExtractor);
    this.isActive = false;
  }

  initialize() {
    this.isActive = true;
    return {
      success: true,
      message: 'AI Research Tools initialized'
    };
  }

  shutdown() {
    this.isActive = false;
    return { success: true };
  }

  // Entity extraction methods
  extractEntities(text, sourceInfo = {}) {
    return this.entityExtractor.extractFromText(text, sourceInfo);
  }

  getEntityStats() {
    return this.entityExtractor.getEntityStats();
  }

  findRelatedEntities(value) {
    return this.entityExtractor.findRelatedEntities(value);
  }

  // Snapshot methods
  async captureSnapshot(pageData) {
    return this.snapshotManager.captureSnapshot(pageData);
  }

  getSnapshot(id) {
    return this.snapshotManager.getSnapshot(id);
  }

  getSnapshots(limit, offset) {
    return this.snapshotManager.getSnapshots(limit, offset);
  }

  searchSnapshots(query) {
    return this.snapshotManager.searchSnapshots(query);
  }

  deleteSnapshot(id) {
    return this.snapshotManager.deleteSnapshot(id);
  }

  exportSnapshot(id, format) {
    return this.snapshotManager.exportSnapshot(id, format);
  }

  addSnapshotNote(snapshotId, note) {
    return this.snapshotManager.addNote(snapshotId, note);
  }

  addSnapshotTag(snapshotId, tag) {
    return this.snapshotManager.addTag(snapshotId, tag);
  }

  // Cross-reference methods
  registerTabEntities(tabId, entities) {
    this.crossReference.registerTab(tabId, entities);
  }

  unregisterTab(tabId) {
    this.crossReference.unregisterTab(tabId);
  }

  onCrossReferenceAlert(callback) {
    return this.crossReference.onAlert(callback);
  }

  getAlerts(includeAcknowledged) {
    return this.crossReference.getAlerts(includeAcknowledged);
  }

  acknowledgeAlert(alertId) {
    return this.crossReference.acknowledgeAlert(alertId);
  }

  dismissAlert(alertId) {
    return this.crossReference.dismissAlert(alertId);
  }

  getUnacknowledgedAlertCount() {
    return this.crossReference.getUnacknowledgedCount();
  }

  getCrossReferenceReport() {
    return this.crossReference.getCrossReferenceReport();
  }

  // Export/Import
  exportState() {
    return {
      snapshots: this.snapshotManager.exportState(),
      isActive: this.isActive,
      exportedAt: Date.now()
    };
  }

  importState(state) {
    if (!state) return false;

    try {
      if (state.snapshots) {
        this.snapshotManager.importState(state.snapshots);
      }
      this.isActive = state.isActive || false;
      return true;
    } catch (e) {
      console.error('Failed to import AI Research Tools state:', e);
      return false;
    }
  }
}

// ============================================
// Export Module
// ============================================

module.exports = {
  AIResearchTools,
  EntityExtractor,
  QuickIntelSnapshot,
  CrossReferenceAlert,
  ENTITY_TYPES
};
