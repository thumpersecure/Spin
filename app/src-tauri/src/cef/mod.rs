//! CEF (Chromium Embedded Framework) Integration Module
//!
//! Provides embedded Chromium browser instances with full fingerprint control.
//! Each identity gets its own isolated browser context with unique fingerprints,
//! separate cookie stores, cache directories, and session storage.
//!
//! Jessica Jones v12.0.3 - "Every case needs a fresh identity."

pub mod browser_context;
pub mod fingerprint_injector;
pub mod cdp_client;

use crate::core::fingerprint::Fingerprint;
use crate::core::identity::Identity;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::RwLock;

/// Global CEF manager instance
static CEF_MANAGER: RwLock<Option<CefManager>> = RwLock::new(None);

/// CEF browser process status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum BrowserStatus {
    /// Browser context is ready
    Ready,
    /// Browser is loading a page
    Loading,
    /// Browser encountered an error
    Error(String),
    /// Browser context is being initialized
    Initializing,
    /// Browser context has been destroyed
    Destroyed,
}

/// Configuration for a CEF browser instance
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CefBrowserConfig {
    /// Identity this browser belongs to
    pub identity_id: String,
    /// User data directory for this context (cookies, cache, storage)
    pub user_data_dir: PathBuf,
    /// Whether to run headless
    pub headless: bool,
    /// Custom Chromium flags
    pub chromium_flags: Vec<String>,
    /// Proxy configuration
    pub proxy: Option<ProxySettings>,
    /// Fingerprint to inject
    pub fingerprint: Fingerprint,
    /// Whether to enable DevTools
    pub devtools_enabled: bool,
    /// Remote debugging port (0 = auto-assign)
    pub remote_debugging_port: u16,
}

/// Proxy settings for CEF
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProxySettings {
    pub proxy_type: ProxyType,
    pub host: String,
    pub port: u16,
    pub username: Option<String>,
    pub password: Option<String>,
}

/// Supported proxy types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ProxyType {
    Http,
    Https,
    Socks4,
    Socks5,
    Tor,
}

/// Represents an active CEF browser instance tied to an identity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CefBrowserInstance {
    /// Unique instance ID
    pub instance_id: String,
    /// Identity this browser belongs to
    pub identity_id: String,
    /// Current status
    pub status: BrowserStatus,
    /// Current URL
    pub current_url: Option<String>,
    /// Page title
    pub page_title: Option<String>,
    /// Whether the page is loading
    pub is_loading: bool,
    /// Whether we can go back
    pub can_go_back: bool,
    /// Whether we can go forward
    pub can_go_forward: bool,
    /// Remote debugging port assigned
    pub debug_port: u16,
    /// Creation timestamp
    pub created_at: DateTime<Utc>,
    /// Applied fingerprint ID
    pub fingerprint_id: String,
    /// Navigation history
    pub history: Vec<NavigationEntry>,
}

/// A navigation history entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavigationEntry {
    pub url: String,
    pub title: Option<String>,
    pub timestamp: DateTime<Utc>,
    pub identity_id: String,
}

/// CEF Manager - orchestrates all browser instances
#[derive(Debug)]
pub struct CefManager {
    /// Active browser instances keyed by identity_id
    instances: HashMap<String, CefBrowserInstance>,
    /// Base directory for user data
    base_data_dir: PathBuf,
    /// Next available debugging port
    next_debug_port: u16,
    /// CEF initialization status
    initialized: bool,
    /// Chromium version string
    chromium_version: String,
}

impl CefManager {
    /// Create a new CEF manager
    pub fn new(base_data_dir: PathBuf) -> Self {
        Self {
            instances: HashMap::new(),
            base_data_dir,
            next_debug_port: 9222,
            initialized: false,
            chromium_version: "131.0.6778.265".to_string(),
        }
    }

    /// Initialize the CEF subsystem
    pub fn initialize(&mut self) -> Result<(), String> {
        if self.initialized {
            return Ok(());
        }

        tracing::info!(
            "Initializing CEF subsystem (Chromium {})",
            self.chromium_version
        );

        // Create base data directory if it doesn't exist
        std::fs::create_dir_all(&self.base_data_dir)
            .map_err(|e| format!("Failed to create CEF data dir: {}", e))?;

        self.initialized = true;
        tracing::info!("CEF subsystem initialized successfully");
        Ok(())
    }

    /// Create an isolated browser context for an identity
    pub fn create_browser_context(
        &mut self,
        identity: &Identity,
    ) -> Result<CefBrowserInstance, String> {
        if !self.initialized {
            return Err("CEF not initialized".to_string());
        }

        // Check if instance already exists
        if let Some(existing) = self.instances.get(&identity.id) {
            if existing.status != BrowserStatus::Destroyed {
                return Ok(existing.clone());
            }
        }

        // Create isolated user data directory for this identity
        let user_data_dir = self
            .base_data_dir
            .join("contexts")
            .join(&identity.id);
        std::fs::create_dir_all(&user_data_dir)
            .map_err(|e| format!("Failed to create context dir: {}", e))?;

        let debug_port = self.next_debug_port;
        self.next_debug_port += 1;

        let instance = CefBrowserInstance {
            instance_id: format!("cef-{}-{}", identity.id, uuid::Uuid::new_v4()),
            identity_id: identity.id.clone(),
            status: BrowserStatus::Ready,
            current_url: None,
            page_title: None,
            is_loading: false,
            can_go_back: false,
            can_go_forward: false,
            debug_port,
            created_at: Utc::now(),
            fingerprint_id: identity.fingerprint.id.clone(),
            history: Vec::new(),
        };

        tracing::info!(
            "Created CEF browser context for identity '{}' on port {}",
            identity.id,
            debug_port
        );

        self.instances.insert(identity.id.clone(), instance.clone());
        Ok(instance)
    }

    /// Navigate a browser instance to a URL
    pub fn navigate(
        &mut self,
        identity_id: &str,
        url: &str,
    ) -> Result<NavigationEntry, String> {
        let instance = self
            .instances
            .get_mut(identity_id)
            .ok_or_else(|| format!("No browser context for identity '{}'", identity_id))?;

        // Validate URL
        let validated_url = validate_url(url)?;

        instance.status = BrowserStatus::Loading;
        instance.is_loading = true;
        instance.current_url = Some(validated_url.clone());

        let entry = NavigationEntry {
            url: validated_url,
            title: None,
            timestamp: Utc::now(),
            identity_id: identity_id.to_string(),
        };

        instance.history.push(entry.clone());
        instance.can_go_back = instance.history.len() > 1;

        // In production, this triggers actual CEF navigation via CDP
        // The fingerprint injector will intercept and apply the identity's
        // fingerprint before any page JavaScript runs
        instance.status = BrowserStatus::Ready;
        instance.is_loading = false;

        tracing::info!(
            "CEF navigate: identity='{}' url='{}'",
            identity_id,
            entry.url
        );

        Ok(entry)
    }

    /// Go back in history
    pub fn go_back(&mut self, identity_id: &str) -> Result<Option<String>, String> {
        let instance = self
            .instances
            .get_mut(identity_id)
            .ok_or_else(|| format!("No browser context for identity '{}'", identity_id))?;

        if instance.history.len() < 2 {
            return Ok(None);
        }

        // Remove current entry, return previous
        instance.history.pop();
        let prev = instance.history.last().cloned();
        if let Some(ref entry) = prev {
            instance.current_url = Some(entry.url.clone());
            instance.page_title = entry.title.clone();
        }
        instance.can_go_back = instance.history.len() > 1;

        Ok(prev.map(|e| e.url))
    }

    /// Go forward in history (simplified - would track forward stack in production)
    pub fn go_forward(&mut self, identity_id: &str) -> Result<Option<String>, String> {
        let instance = self
            .instances
            .get(identity_id)
            .ok_or_else(|| format!("No browser context for identity '{}'", identity_id))?;

        if !instance.can_go_forward {
            return Ok(None);
        }

        Ok(None) // Forward navigation requires a forward stack (CDP handles this)
    }

    /// Reload current page
    pub fn reload(&mut self, identity_id: &str) -> Result<(), String> {
        let instance = self
            .instances
            .get_mut(identity_id)
            .ok_or_else(|| format!("No browser context for identity '{}'", identity_id))?;

        instance.status = BrowserStatus::Loading;
        instance.is_loading = true;

        // In production, sends Page.reload via CDP
        tracing::info!("CEF reload for identity '{}'", identity_id);

        instance.status = BrowserStatus::Ready;
        instance.is_loading = false;
        Ok(())
    }

    /// Destroy a browser context (cleanup)
    pub fn destroy_context(&mut self, identity_id: &str) -> Result<(), String> {
        if let Some(instance) = self.instances.get_mut(identity_id) {
            instance.status = BrowserStatus::Destroyed;
            tracing::info!("Destroyed CEF context for identity '{}'", identity_id);
        }
        Ok(())
    }

    /// Get browser instance for an identity
    pub fn get_instance(&self, identity_id: &str) -> Option<&CefBrowserInstance> {
        self.instances.get(identity_id)
    }

    /// Get all active browser instances
    pub fn get_all_instances(&self) -> Vec<&CefBrowserInstance> {
        self.instances
            .values()
            .filter(|i| i.status != BrowserStatus::Destroyed)
            .collect()
    }

    /// Get navigation history for an identity
    pub fn get_history(&self, identity_id: &str) -> Vec<NavigationEntry> {
        self.instances
            .get(identity_id)
            .map(|i| i.history.clone())
            .unwrap_or_default()
    }
}

/// Initialize the global CEF manager.
///
/// `data_dir` is the application data directory (e.g. `~/.local/share/spin`).
/// CEF context data is stored under `<data_dir>/cef/`.
pub fn init(data_dir: &std::path::Path) -> Result<(), Box<dyn std::error::Error>> {
    tracing::info!("Initializing CEF (Chromium Embedded Framework) module");

    let cef_data_dir = data_dir.join("cef");

    let mut manager = CefManager::new(cef_data_dir);
    manager.initialize()?;

    let mut global = CEF_MANAGER
        .write()
        .map_err(|e| format!("CEF lock poisoned: {}", e))?;
    *global = Some(manager);

    tracing::info!("CEF module ready");
    Ok(())
}

/// Get the CEF manager (read access)
pub fn with_manager<F, R>(f: F) -> Result<R, String>
where
    F: FnOnce(&CefManager) -> Result<R, String>,
{
    let guard = CEF_MANAGER
        .read()
        .map_err(|e| format!("CEF lock poisoned: {}", e))?;
    let manager = guard.as_ref().ok_or("CEF not initialized")?;
    f(manager)
}

/// Get the CEF manager (write access)
pub fn with_manager_mut<F, R>(f: F) -> Result<R, String>
where
    F: FnOnce(&mut CefManager) -> Result<R, String>,
{
    let mut guard = CEF_MANAGER
        .write()
        .map_err(|e| format!("CEF lock poisoned: {}", e))?;
    let manager = guard.as_mut().ok_or("CEF not initialized")?;
    f(manager)
}

/// Validate and normalize a URL
fn validate_url(url: &str) -> Result<String, String> {
    let trimmed = url.trim();

    if trimmed.is_empty() {
        return Err("URL cannot be empty".to_string());
    }

    // Block dangerous protocols
    let lower = trimmed.to_lowercase();
    for protocol in &["javascript:", "data:", "file:", "vbscript:", "blob:"] {
        if lower.starts_with(protocol) {
            return Err(format!(
                "Blocked dangerous protocol: {}",
                protocol.trim_end_matches(':')
            ));
        }
    }

    // Normalize URL
    if !lower.starts_with("http://") && !lower.starts_with("https://") {
        Ok(format!("https://{}", trimmed))
    } else {
        Ok(trimmed.to_string())
    }
}

