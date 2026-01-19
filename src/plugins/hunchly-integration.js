/**
 * Hunchly Integration Plugin
 *
 * Hunchly is a web capture tool for online investigations.
 * This plugin provides similar functionality and can optionally
 * export data in Hunchly-compatible formats.
 *
 * Features:
 * - Automatic page capture on navigation
 * - Screenshot capture with metadata
 * - Case-based organization
 * - Export to Hunchly format
 * - Timeline generation
 */

const fs = require('fs');
const path = require('path');

const HunchlyIntegration = {
  id: 'hunchly-integration',
  name: 'Hunchly Integration',
  version: '1.0.0',
  description: 'Web capture and case management similar to Hunchly',
  author: 'SPIN OSINT Team',
  defaultEnabled: false,

  defaultSettings: {
    autoCapture: true,
    captureScreenshots: true,
    captureMetadata: true,
    captureSelectors: true,
    caseName: 'Default Case',
    exportPath: '',
    captureInterval: 0, // 0 = every page, >0 = every N seconds
    excludePatterns: [
      '*://*.google.com/recaptcha/*',
      '*://*.gstatic.com/*',
      '*://*.doubleclick.net/*'
    ]
  },

  // Storage for captured pages
  captures: [],
  currentCase: null,
  lastCaptureTime: 0,

  /**
   * Called when plugin is enabled
   */
  onEnable(context) {
    context.log('Hunchly Integration enabled - capture mode active');
    this.currentCase = {
      id: Date.now(),
      name: context.settings.caseName || 'Default Case',
      created: new Date().toISOString(),
      captures: []
    };
  },

  /**
   * Called when plugin is disabled
   */
  onDisable(context) {
    context.log('Hunchly Integration disabled');
    // Optionally save current case
    if (this.currentCase && this.currentCase.captures.length > 0) {
      this.saveCase(context);
    }
  },

  /**
   * Plugin hooks
   */
  hooks: {
    /**
     * Capture page on navigation
     */
    onPageLoad: function(context, data) {
      const settings = context.settings;

      if (!settings.autoCapture) return;

      // Check capture interval
      const now = Date.now();
      if (settings.captureInterval > 0) {
        if (now - HunchlyIntegration.lastCaptureTime < settings.captureInterval * 1000) {
          return;
        }
      }
      HunchlyIntegration.lastCaptureTime = now;

      // Check exclude patterns
      const url = data.url;
      if (settings.excludePatterns.some(pattern => {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(url);
      })) {
        return;
      }

      // Create capture entry
      const capture = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        url: data.url,
        title: data.title,
        metadata: settings.captureMetadata ? data.metadata : null,
        screenshot: null,
        selectors: null,
        notes: '',
        tags: []
      };

      // Capture screenshot if enabled
      if (settings.captureScreenshots && data.screenshot) {
        capture.screenshot = data.screenshot;
      }

      // Store capture
      HunchlyIntegration.captures.push(capture);
      if (HunchlyIntegration.currentCase) {
        HunchlyIntegration.currentCase.captures.push(capture);
      }

      context.log(`Captured: ${data.title} (${data.url})`);

      return capture;
    },

    /**
     * Handle screenshot events
     */
    onScreenshot: function(context, data) {
      if (!context.settings.captureScreenshots) return;

      const capture = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        url: data.url,
        title: data.title,
        screenshot: data.screenshot,
        type: 'manual_screenshot',
        notes: data.notes || ''
      };

      HunchlyIntegration.captures.push(capture);
      context.log(`Screenshot captured: ${data.title}`);

      return capture;
    }
  },

  /**
   * Create a new case
   */
  newCase(context, caseName) {
    // Save existing case first
    if (this.currentCase && this.currentCase.captures.length > 0) {
      this.saveCase(context);
    }

    this.currentCase = {
      id: Date.now(),
      name: caseName,
      created: new Date().toISOString(),
      captures: []
    };

    context.log(`New case created: ${caseName}`);
    return this.currentCase;
  },

  /**
   * Save current case to disk
   */
  saveCase(context) {
    if (!this.currentCase) return null;

    const exportPath = context.settings.exportPath || require('os').homedir();
    const filename = `spin-case-${this.currentCase.id}-${this.currentCase.name.replace(/[^a-z0-9]/gi, '_')}.json`;
    const filepath = path.join(exportPath, filename);

    try {
      fs.writeFileSync(filepath, JSON.stringify(this.currentCase, null, 2));
      context.log(`Case saved: ${filepath}`);
      return filepath;
    } catch (error) {
      context.log(`Error saving case: ${error.message}`);
      return null;
    }
  },

  /**
   * Export in Hunchly-compatible format
   */
  exportHunchlyFormat(context) {
    if (!this.currentCase) return null;

    const hunchlyData = {
      version: '1.0',
      case: {
        name: this.currentCase.name,
        created: this.currentCase.created,
        exportedAt: new Date().toISOString()
      },
      pages: this.currentCase.captures.map(capture => ({
        url: capture.url,
        title: capture.title,
        timestamp: capture.timestamp,
        screenshot: capture.screenshot ? 'included' : 'none',
        metadata: capture.metadata,
        notes: capture.notes,
        tags: capture.tags
      })),
      timeline: this.generateTimeline()
    };

    const exportPath = context.settings.exportPath || require('os').homedir();
    const filename = `spin-hunchly-export-${Date.now()}.json`;
    const filepath = path.join(exportPath, filename);

    try {
      fs.writeFileSync(filepath, JSON.stringify(hunchlyData, null, 2));
      context.log(`Hunchly export saved: ${filepath}`);
      return filepath;
    } catch (error) {
      context.log(`Error exporting: ${error.message}`);
      return null;
    }
  },

  /**
   * Generate timeline from captures
   */
  generateTimeline() {
    return this.captures
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(capture => ({
        time: capture.timestamp,
        type: capture.type || 'page_visit',
        url: capture.url,
        title: capture.title
      }));
  },

  /**
   * Generate HTML report
   */
  generateReport(context) {
    if (!this.currentCase) return null;

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>SPIN Investigation Report - ${this.currentCase.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
    .header { background: linear-gradient(135deg, #1a1a2e, #16213e); color: white; padding: 40px; }
    .header h1 { color: #00ff88; margin-bottom: 10px; }
    .header .meta { color: #8b949e; font-size: 14px; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
    .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
    .stat-card .number { font-size: 32px; font-weight: bold; color: #00ff88; }
    .stat-card .label { color: #666; font-size: 12px; text-transform: uppercase; }
    .timeline { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .timeline h2 { margin-bottom: 20px; color: #333; }
    .timeline-item { display: flex; padding: 15px 0; border-bottom: 1px solid #eee; }
    .timeline-time { width: 180px; color: #666; font-size: 12px; }
    .timeline-content { flex: 1; }
    .timeline-title { font-weight: 600; color: #333; margin-bottom: 5px; }
    .timeline-url { color: #0066cc; font-size: 12px; word-break: break-all; }
    .captures { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    .capture-card { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .capture-screenshot { width: 100%; height: 200px; object-fit: cover; background: #eee; }
    .capture-content { padding: 15px; }
    .capture-title { font-weight: 600; margin-bottom: 5px; }
    .capture-url { color: #0066cc; font-size: 12px; word-break: break-all; margin-bottom: 10px; }
    .capture-time { color: #666; font-size: 11px; }
    .capture-tags { margin-top: 10px; }
    .tag { display: inline-block; background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-right: 5px; }
    footer { text-align: center; padding: 40px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Investigation Report</h1>
    <div class="meta">
      <strong>Case:</strong> ${this.currentCase.name}<br>
      <strong>Created:</strong> ${new Date(this.currentCase.created).toLocaleString()}<br>
      <strong>Generated:</strong> ${new Date().toLocaleString()}
    </div>
  </div>

  <div class="container">
    <div class="stats">
      <div class="stat-card">
        <div class="number">${this.currentCase.captures.length}</div>
        <div class="label">Pages Captured</div>
      </div>
      <div class="stat-card">
        <div class="number">${this.currentCase.captures.filter(c => c.screenshot).length}</div>
        <div class="label">Screenshots</div>
      </div>
      <div class="stat-card">
        <div class="number">${new Set(this.currentCase.captures.map(c => new URL(c.url).hostname)).size}</div>
        <div class="label">Unique Domains</div>
      </div>
      <div class="stat-card">
        <div class="number">${Math.round((new Date() - new Date(this.currentCase.created)) / (1000 * 60))}</div>
        <div class="label">Minutes Active</div>
      </div>
    </div>

    <div class="timeline">
      <h2>Timeline</h2>
      ${this.currentCase.captures.slice(0, 20).map(c => `
        <div class="timeline-item">
          <div class="timeline-time">${new Date(c.timestamp).toLocaleString()}</div>
          <div class="timeline-content">
            <div class="timeline-title">${c.title || 'Untitled'}</div>
            <div class="timeline-url">${c.url}</div>
          </div>
        </div>
      `).join('')}
    </div>

    <h2 style="margin: 20px 0;">Captured Pages</h2>
    <div class="captures">
      ${this.currentCase.captures.map(c => `
        <div class="capture-card">
          ${c.screenshot ? `<img class="capture-screenshot" src="${c.screenshot}" alt="Screenshot">` : '<div class="capture-screenshot"></div>'}
          <div class="capture-content">
            <div class="capture-title">${c.title || 'Untitled'}</div>
            <div class="capture-url">${c.url}</div>
            <div class="capture-time">${new Date(c.timestamp).toLocaleString()}</div>
            ${c.tags && c.tags.length > 0 ? `<div class="capture-tags">${c.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  </div>

  <footer>
    Generated by SPIN OSINT Browser with Hunchly Integration Plugin
  </footer>
</body>
</html>`;

    const exportPath = context.settings.exportPath || require('os').homedir();
    const filename = `spin-report-${Date.now()}.html`;
    const filepath = path.join(exportPath, filename);

    try {
      fs.writeFileSync(filepath, html);
      context.log(`Report generated: ${filepath}`);
      return filepath;
    } catch (error) {
      context.log(`Error generating report: ${error.message}`);
      return null;
    }
  },

  /**
   * Get statistics
   */
  getStats() {
    const captures = this.currentCase?.captures || [];
    const domains = new Set(captures.map(c => {
      try { return new URL(c.url).hostname; } catch { return 'unknown'; }
    }));

    return {
      totalCaptures: captures.length,
      screenshots: captures.filter(c => c.screenshot).length,
      uniqueDomains: domains.size,
      domains: Array.from(domains),
      caseName: this.currentCase?.name || 'No active case',
      caseCreated: this.currentCase?.created
    };
  }
};

module.exports = HunchlyIntegration;
