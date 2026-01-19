/**
 * CONSTANTINE Browser - Theme Manager
 * Version: 4.2.0 - The Exorcist's Edge
 *
 * Manages theme switching, light/dark mode preferences,
 * and accessibility settings.
 *
 * "Between Heaven and Hell, intelligence prevails."
 */

const fs = require('fs');
const path = require('path');

/**
 * Theme Manager Class
 * Handles theme loading, switching, and persistence
 */
class ThemeManager {
  constructor(store) {
    this.store = store;
    this.themes = null;
    this.currentTheme = null;
    this.currentMode = 'dark';
    this.listeners = [];

    this._loadThemes();
    this._loadPreferences();
  }

  /**
   * Load themes from JSON file
   */
  _loadThemes() {
    try {
      const themesPath = path.join(__dirname, '../data/themes.json');
      const data = fs.readFileSync(themesPath, 'utf8');
      this.themes = JSON.parse(data);
    } catch (error) {
      console.error('[ThemeManager] Failed to load themes:', error);
      this.themes = { themes: {}, modes: {}, accessibility: {} };
    }
  }

  /**
   * Load user preferences from store
   */
  _loadPreferences() {
    this.currentTheme = this.store?.get('theme.active') || this.themes.activeTheme || 'constantine';
    this.currentMode = this.store?.get('theme.mode') || 'dark';
    this.accessibility = this.store?.get('theme.accessibility') || this.themes.accessibility || {};
  }

  /**
   * Get all available themes
   */
  getAllThemes() {
    return Object.values(this.themes.themes || {}).map(theme => ({
      id: theme.id,
      name: theme.name,
      codename: theme.codename,
      description: theme.description,
      mode: theme.mode || 'dark',
      colors: theme.colors
    }));
  }

  /**
   * Get themes for a specific mode (light/dark)
   */
  getThemesForMode(mode) {
    return this.getAllThemes().filter(theme => {
      if (mode === 'light') {
        return theme.mode === 'light' || theme.id.includes('-light');
      }
      return theme.mode !== 'light' && !theme.id.includes('-light');
    });
  }

  /**
   * Get current theme data
   */
  getCurrentTheme() {
    return this.themes.themes?.[this.currentTheme] || this.themes.themes?.constantine;
  }

  /**
   * Get current theme ID
   */
  getCurrentThemeId() {
    return this.currentTheme;
  }

  /**
   * Get current mode (light/dark/auto)
   */
  getCurrentMode() {
    return this.currentMode;
  }

  /**
   * Set the active theme
   */
  setTheme(themeId) {
    if (!this.themes.themes?.[themeId]) {
      console.warn(`[ThemeManager] Theme '${themeId}' not found`);
      return false;
    }

    const previousTheme = this.currentTheme;
    this.currentTheme = themeId;
    this.store?.set('theme.active', themeId);

    // Update mode based on theme
    const theme = this.themes.themes[themeId];
    if (theme.mode === 'light' || themeId.includes('-light')) {
      this.currentMode = 'light';
    } else {
      this.currentMode = 'dark';
    }
    this.store?.set('theme.mode', this.currentMode);

    // Notify listeners
    this._notifyListeners('themeChanged', {
      previous: previousTheme,
      current: themeId,
      theme: this.getCurrentTheme(),
      mode: this.currentMode
    });

    return true;
  }

  /**
   * Set the mode (light/dark/auto)
   */
  setMode(mode) {
    if (!['light', 'dark', 'auto'].includes(mode)) {
      console.warn(`[ThemeManager] Invalid mode: ${mode}`);
      return false;
    }

    this.currentMode = mode;
    this.store?.set('theme.mode', mode);

    // If mode is auto, determine based on system preference
    if (mode === 'auto') {
      this._applyAutoMode();
    } else {
      // Switch to appropriate theme for the mode
      this._switchToModeTheme(mode);
    }

    this._notifyListeners('modeChanged', { mode });
    return true;
  }

  /**
   * Apply automatic mode based on system preference or time
   */
  _applyAutoMode() {
    const autoConfig = this.themes.modes?.auto || {};

    if (autoConfig.followSystem) {
      // In Electron, we could use nativeTheme.shouldUseDarkColors
      // For now, default to dark
      const systemPrefersDark = true; // Would check system preference
      this._switchToModeTheme(systemPrefersDark ? 'dark' : 'light');
    } else if (autoConfig.timeBasedSwitch?.enabled) {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const lightStart = autoConfig.timeBasedSwitch.lightStart || '06:00';
      const lightEnd = autoConfig.timeBasedSwitch.lightEnd || '18:00';

      if (currentTime >= lightStart && currentTime < lightEnd) {
        this._switchToModeTheme('light');
      } else {
        this._switchToModeTheme('dark');
      }
    }
  }

  /**
   * Switch to appropriate theme for the given mode
   */
  _switchToModeTheme(mode) {
    const modeConfig = this.themes.modes?.[mode];
    if (!modeConfig) return;

    // Check if current theme is compatible with the mode
    const currentTheme = this.themes.themes?.[this.currentTheme];
    const isCurrentThemeLight = currentTheme?.mode === 'light' || this.currentTheme.includes('-light');
    const needsLight = mode === 'light';

    if (isCurrentThemeLight !== needsLight) {
      // Need to switch theme
      let newThemeId;

      if (needsLight) {
        // Try to find light version of current theme
        newThemeId = `${this.currentTheme}-light`;
        if (!this.themes.themes?.[newThemeId]) {
          newThemeId = modeConfig.defaultTheme;
        }
      } else {
        // Remove -light suffix if present
        newThemeId = this.currentTheme.replace('-light', '');
        if (!this.themes.themes?.[newThemeId]) {
          newThemeId = modeConfig.defaultTheme;
        }
      }

      if (this.themes.themes?.[newThemeId]) {
        this.currentTheme = newThemeId;
        this.store?.set('theme.active', newThemeId);

        this._notifyListeners('themeChanged', {
          previous: this.currentTheme,
          current: newThemeId,
          theme: this.getCurrentTheme(),
          mode: this.currentMode
        });
      }
    }
  }

  /**
   * Toggle between light and dark mode
   */
  toggleMode() {
    const newMode = this.currentMode === 'light' ? 'dark' : 'light';
    return this.setMode(newMode);
  }

  /**
   * Get accessibility settings
   */
  getAccessibility() {
    return { ...this.accessibility };
  }

  /**
   * Set accessibility option
   */
  setAccessibility(option, value) {
    if (Object.hasOwn(this.accessibility, option)) {
      this.accessibility[option] = value;
      this.store?.set(`theme.accessibility.${option}`, value);
      this._notifyListeners('accessibilityChanged', { option, value });
      return true;
    }
    return false;
  }

  /**
   * Set reduce motion preference
   */
  setReduceMotion(enabled) {
    return this.setAccessibility('reduceMotion', enabled);
  }

  /**
   * Set high contrast preference
   */
  setHighContrast(enabled) {
    return this.setAccessibility('highContrast', enabled);
  }

  /**
   * Get CSS variables for current theme
   */
  getCSSVariables() {
    const theme = this.getCurrentTheme();
    if (!theme) return {};

    const vars = {};
    const colors = theme.colors || {};

    // Primary colors
    if (colors.primary) {
      vars['--primary'] = colors.primary.main;
      vars['--primary-dark'] = colors.primary.dark;
      vars['--primary-light'] = colors.primary.light;
      vars['--primary-glow'] = colors.primary.glow;
    }

    // Accent colors
    if (colors.accent) {
      Object.entries(colors.accent).forEach(([key, value]) => {
        vars[`--accent-${key}`] = value;
      });
    }

    // Background colors
    if (colors.background) {
      vars['--bg-base'] = colors.background.base;
      vars['--bg-elevated'] = colors.background.elevated;
      vars['--bg-surface'] = colors.background.surface;
      vars['--bg-overlay'] = colors.background.overlay;
      vars['--bg-hover'] = colors.background.hover;
      vars['--bg-active'] = colors.background.active;
    }

    // Text colors
    if (colors.text) {
      vars['--text-primary'] = colors.text.primary;
      vars['--text-secondary'] = colors.text.secondary;
      vars['--text-tertiary'] = colors.text.tertiary;
      vars['--text-disabled'] = colors.text.disabled;
    }

    // Semantic colors
    if (colors.semantic) {
      vars['--success'] = colors.semantic.success;
      vars['--warning'] = colors.semantic.warning;
      vars['--info'] = colors.semantic.info;
      vars['--danger'] = colors.semantic.danger;
    }

    return vars;
  }

  /**
   * Generate CSS string from current theme
   */
  generateCSS() {
    const vars = this.getCSSVariables();
    const lines = [':root {'];

    Object.entries(vars).forEach(([key, value]) => {
      lines.push(`  ${key}: ${value};`);
    });

    // Add accessibility overrides
    if (this.accessibility.reduceMotion) {
      lines.push('  --animation-duration: 0s;');
      lines.push('  --transition-duration: 0s;');
    }

    if (this.accessibility.highContrast) {
      lines.push('  --border-width: 2px;');
    }

    lines.push('}');

    // Add reduce motion media query
    if (this.accessibility.reduceMotion) {
      lines.push('@media (prefers-reduced-motion: reduce) {');
      lines.push('  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }');
      lines.push('}');
    }

    return lines.join('\n');
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    this.listeners.push({ event, callback });
    return () => this.off(event, callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    this.listeners = this.listeners.filter(
      l => !(l.event === event && l.callback === callback)
    );
  }

  /**
   * Notify all listeners of an event
   */
  _notifyListeners(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => {
        try {
          l.callback(data);
        } catch (error) {
          console.error(`[ThemeManager] Listener error for ${event}:`, error);
        }
      });
  }

  /**
   * Get report style for current theme
   */
  getReportStyle() {
    return this.themes.reportStyles?.[this.currentTheme] ||
           this.themes.reportStyles?.constantine ||
           {};
  }

  /**
   * Export current settings
   */
  exportSettings() {
    return {
      theme: this.currentTheme,
      mode: this.currentMode,
      accessibility: { ...this.accessibility }
    };
  }

  /**
   * Import settings
   */
  importSettings(settings) {
    if (settings.theme) {
      this.setTheme(settings.theme);
    }
    if (settings.mode) {
      this.setMode(settings.mode);
    }
    if (settings.accessibility) {
      Object.entries(settings.accessibility).forEach(([key, value]) => {
        this.setAccessibility(key, value);
      });
    }
  }
}

module.exports = ThemeManager;
