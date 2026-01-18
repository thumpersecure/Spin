/**
 * SPIN OSINT Browser Plugin Manager
 * Handles loading, managing, and executing plugins
 */

const fs = require('fs');
const path = require('path');

class PluginManager {
  constructor(store, mainWindow) {
    this.store = store;
    this.mainWindow = mainWindow;
    this.plugins = new Map();
    this.hooks = {
      onNavigate: [],
      onPageLoad: [],
      onScreenshot: [],
      onBookmark: [],
      onSearch: [],
      beforeRequest: [],
      afterResponse: []
    };
  }

  /**
   * Register a plugin
   */
  register(plugin) {
    if (!plugin.id || !plugin.name) {
      throw new Error('Plugin must have id and name');
    }

    this.plugins.set(plugin.id, {
      ...plugin,
      enabled: this.store.get(`plugins.${plugin.id}.enabled`, plugin.defaultEnabled || false),
      settings: this.store.get(`plugins.${plugin.id}.settings`, plugin.defaultSettings || {})
    });

    // Register hooks
    if (plugin.hooks) {
      Object.entries(plugin.hooks).forEach(([hookName, handler]) => {
        if (this.hooks[hookName]) {
          this.hooks[hookName].push({ pluginId: plugin.id, handler });
        }
      });
    }

    console.log(`Plugin registered: ${plugin.name} (${plugin.id})`);
    return this;
  }

  /**
   * Enable/disable a plugin
   */
  setEnabled(pluginId, enabled) {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.enabled = enabled;
      this.store.set(`plugins.${pluginId}.enabled`, enabled);

      if (enabled && plugin.onEnable) {
        plugin.onEnable(this.getPluginContext(pluginId));
      } else if (!enabled && plugin.onDisable) {
        plugin.onDisable(this.getPluginContext(pluginId));
      }
    }
  }

  /**
   * Update plugin settings
   */
  updateSettings(pluginId, settings) {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.settings = { ...plugin.settings, ...settings };
      this.store.set(`plugins.${pluginId}.settings`, plugin.settings);

      if (plugin.onSettingsChange) {
        plugin.onSettingsChange(this.getPluginContext(pluginId), settings);
      }
    }
  }

  /**
   * Get plugin context for callbacks
   */
  getPluginContext(pluginId) {
    const plugin = this.plugins.get(pluginId);
    return {
      settings: plugin?.settings || {},
      store: this.store,
      mainWindow: this.mainWindow,
      log: (message) => this.log(pluginId, message),
      notify: (title, body) => this.notify(pluginId, title, body)
    };
  }

  /**
   * Execute hooks
   */
  async executeHook(hookName, data) {
    const handlers = this.hooks[hookName] || [];
    const results = [];

    for (const { pluginId, handler } of handlers) {
      const plugin = this.plugins.get(pluginId);
      if (plugin && plugin.enabled) {
        try {
          const result = await handler(this.getPluginContext(pluginId), data);
          results.push({ pluginId, result });
        } catch (error) {
          console.error(`Plugin ${pluginId} hook ${hookName} error:`, error);
        }
      }
    }

    return results;
  }

  /**
   * Log message from plugin
   */
  log(pluginId, message) {
    console.log(`[Plugin:${pluginId}] ${message}`);
    if (this.mainWindow) {
      this.mainWindow.webContents.send('plugin-log', { pluginId, message, timestamp: Date.now() });
    }
  }

  /**
   * Show notification from plugin
   */
  notify(pluginId, title, body) {
    const { Notification } = require('electron');
    new Notification({ title: `[${pluginId}] ${title}`, body }).show();
  }

  /**
   * Get all plugins
   */
  getAll() {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugin by ID
   */
  get(pluginId) {
    return this.plugins.get(pluginId);
  }
}

module.exports = PluginManager;
