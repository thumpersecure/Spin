/**
 * CONSTANTINE Browser - AI Plugin System
 * Version: 4.2.0 - The Exorcist's Edge
 *
 * This module wraps the AI Intelligence Suite as optional plugins that can be
 * enabled or disabled via configuration. Each AI module is loaded on-demand
 * to reduce memory footprint when not needed.
 *
 * "Between Heaven and Hell, intelligence prevails."
 */

// Default configuration for AI modules
const DEFAULT_AI_CONFIG = {
  enabled: true,
  modules: {
    researchAssistant: {
      enabled: true,
      autoGroupTabs: true,
      persistSessions: true
    },
    privacyShield: {
      enabled: true,
      autoEscalate: true,
      riskThreshold: 60
    },
    researchTools: {
      enabled: true,
      autoExtract: false,
      maxSnapshots: 100
    },
    cognitiveTools: {
      enabled: true,
      defaultFocusPreset: 'standard'
    }
  }
};

/**
 * AI Plugin Loader
 * Loads AI modules on-demand based on configuration
 */
class AIPluginLoader {
  constructor(store) {
    this.store = store;
    this.loadedModules = new Map();
    this.config = this._loadConfig();
  }

  /**
   * Load configuration from store or use defaults
   */
  _loadConfig() {
    const storedConfig = this.store?.get('ai') || {};
    return { ...DEFAULT_AI_CONFIG, ...storedConfig };
  }

  /**
   * Check if AI suite is globally enabled
   */
  isEnabled() {
    return this.config.enabled !== false;
  }

  /**
   * Check if a specific module is enabled
   */
  isModuleEnabled(moduleName) {
    if (!this.isEnabled()) return false;
    return this.config.modules?.[moduleName]?.enabled !== false;
  }

  /**
   * Get module configuration
   */
  getModuleConfig(moduleName) {
    return this.config.modules?.[moduleName] || {};
  }

  /**
   * Load a module on-demand
   */
  loadModule(moduleName) {
    if (this.loadedModules.has(moduleName)) {
      return this.loadedModules.get(moduleName);
    }

    if (!this.isModuleEnabled(moduleName)) {
      console.log(`[AI Plugin] Module '${moduleName}' is disabled`);
      return null;
    }

    try {
      let module = null;

      switch (moduleName) {
        case 'researchAssistant': {
          const { AIResearchAssistant } = require('../extensions/ai-research-assistant');
          module = new AIResearchAssistant();
          break;
        }
        case 'privacyShield': {
          const { AIPrivacyShield } = require('../extensions/ai-privacy-shield');
          module = new AIPrivacyShield();
          break;
        }
        case 'researchTools': {
          const { AIResearchTools } = require('../extensions/ai-research-tools');
          module = new AIResearchTools();
          break;
        }
        case 'cognitiveTools': {
          const { AICognitiveTools } = require('../extensions/ai-cognitive-tools');
          module = new AICognitiveTools();
          break;
        }
        default:
          console.warn(`[AI Plugin] Unknown module: ${moduleName}`);
          return null;
      }

      if (module) {
        // Apply configuration
        const moduleConfig = this.getModuleConfig(moduleName);
        if (module.configure && typeof module.configure === 'function') {
          module.configure(moduleConfig);
        }

        this.loadedModules.set(moduleName, module);
        console.log(`[AI Plugin] Loaded module: ${moduleName}`);
      }

      return module;
    } catch (error) {
      console.error(`[AI Plugin] Failed to load module '${moduleName}':`, error);
      return null;
    }
  }

  /**
   * Get a loaded module (load if not already loaded)
   */
  getModule(moduleName) {
    if (!this.loadedModules.has(moduleName)) {
      return this.loadModule(moduleName);
    }
    return this.loadedModules.get(moduleName);
  }

  /**
   * Initialize all enabled modules
   */
  initializeAll() {
    const results = {};

    if (!this.isEnabled()) {
      console.log('[AI Plugin] AI suite is disabled globally');
      return results;
    }

    const moduleNames = ['researchAssistant', 'privacyShield', 'researchTools', 'cognitiveTools'];

    for (const name of moduleNames) {
      if (this.isModuleEnabled(name)) {
        const module = this.loadModule(name);
        if (module && typeof module.initialize === 'function') {
          try {
            results[name] = module.initialize();
          } catch (error) {
            console.error(`[AI Plugin] Failed to initialize ${name}:`, error);
            results[name] = { success: false, error: error.message };
          }
        }
      }
    }

    return results;
  }

  /**
   * Shutdown all loaded modules
   */
  shutdownAll() {
    for (const [name, module] of this.loadedModules) {
      if (module && typeof module.shutdown === 'function') {
        try {
          module.shutdown();
          console.log(`[AI Plugin] Shutdown module: ${name}`);
        } catch (error) {
          console.error(`[AI Plugin] Failed to shutdown ${name}:`, error);
        }
      }
    }
    this.loadedModules.clear();
  }

  /**
   * Enable a module at runtime
   */
  enableModule(moduleName) {
    if (!this.config.modules[moduleName]) {
      this.config.modules[moduleName] = {};
    }
    this.config.modules[moduleName].enabled = true;
    this.store?.set(`ai.modules.${moduleName}.enabled`, true);

    // Load and initialize the module
    const module = this.loadModule(moduleName);
    if (module && typeof module.initialize === 'function') {
      return module.initialize();
    }
    return { success: !!module };
  }

  /**
   * Disable a module at runtime
   */
  disableModule(moduleName) {
    // Shutdown the module if loaded
    const module = this.loadedModules.get(moduleName);
    if (module && typeof module.shutdown === 'function') {
      module.shutdown();
    }
    this.loadedModules.delete(moduleName);

    // Update config
    if (this.config.modules[moduleName]) {
      this.config.modules[moduleName].enabled = false;
    }
    this.store?.set(`ai.modules.${moduleName}.enabled`, false);

    return { success: true };
  }

  /**
   * Get status of all modules
   */
  getStatus() {
    const status = {
      globalEnabled: this.isEnabled(),
      modules: {}
    };

    const moduleNames = ['researchAssistant', 'privacyShield', 'researchTools', 'cognitiveTools'];

    for (const name of moduleNames) {
      status.modules[name] = {
        enabled: this.isModuleEnabled(name),
        loaded: this.loadedModules.has(name),
        config: this.getModuleConfig(name)
      };
    }

    return status;
  }

  /**
   * Export state from all loaded modules
   */
  exportAllState() {
    const state = {};

    for (const [name, module] of this.loadedModules) {
      if (module && typeof module.exportState === 'function') {
        state[name] = module.exportState();
      }
    }

    return state;
  }

  /**
   * Import state to loaded modules
   */
  importAllState(state) {
    if (!state) return;

    for (const [name, moduleState] of Object.entries(state)) {
      const module = this.getModule(name);
      if (module && typeof module.importState === 'function') {
        module.importState(moduleState);
      }
    }
  }
}

/**
 * AI Plugin Registry
 * Manages plugin metadata for UI display
 */
const AI_PLUGINS = {
  researchAssistant: {
    id: 'researchAssistant',
    name: 'Research Assistant',
    description: 'Smart tab grouping, session context memory, and related link suggestions',
    icon: '🔍',
    version: '4.2.0',
    features: [
      'Auto-cluster tabs by investigation topic',
      'Remember research context across sessions',
      'Suggest relevant OSINT resources'
    ]
  },
  privacyShield: {
    id: 'privacyShield',
    name: 'Privacy Shield',
    description: 'Predictive risk scoring, fingerprint tracking, and automatic OPSEC escalation',
    icon: '🛡️',
    version: '4.2.0',
    features: [
      'Real-time site risk scoring (0-100)',
      'Track fingerprint exposure vectors',
      'Auto-escalate privacy protections'
    ]
  },
  researchTools: {
    id: 'researchTools',
    name: 'Research Tools',
    description: 'Entity extraction, quick intel snapshots, and cross-reference alerts',
    icon: '🔧',
    version: '4.2.0',
    features: [
      'Extract 12+ entity types automatically',
      'Capture page snapshots with metadata',
      'Alert when same entity appears in multiple tabs'
    ]
  },
  cognitiveTools: {
    id: 'cognitiveTools',
    name: 'Cognitive Tools',
    description: 'Focus mode, smart bookmarks, and investigation timeline',
    icon: '🧠',
    version: '4.2.0',
    features: [
      'Pomodoro-style focus sessions',
      'AI-categorized smart bookmarks',
      'Visual investigation timeline'
    ]
  }
};

/**
 * Get plugin metadata for UI
 */
function getPluginMetadata(pluginId) {
  return AI_PLUGINS[pluginId] || null;
}

/**
 * Get all plugin metadata
 */
function getAllPluginMetadata() {
  return Object.values(AI_PLUGINS);
}

module.exports = {
  AIPluginLoader,
  AI_PLUGINS,
  getPluginMetadata,
  getAllPluginMetadata,
  DEFAULT_AI_CONFIG
};
