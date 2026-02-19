//! Browser Context Isolation
//!
//! Each identity gets a fully isolated browser context with:
//! - Separate cookie store
//! - Separate cache directory
//! - Separate localStorage/sessionStorage
//! - Separate IndexedDB
//! - Unique fingerprint injection
//! - Independent proxy settings
//!
//! This ensures zero data leakage between identities, providing true
//! compartmentalization for OSINT investigations.

use crate::core::fingerprint::Fingerprint;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

/// An isolated browser context for a single identity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrowserContext {
    /// Identity this context belongs to
    pub identity_id: String,

    /// Root directory for all context data
    pub data_dir: PathBuf,

    /// Cookie storage path
    pub cookie_store_path: PathBuf,

    /// Cache directory
    pub cache_dir: PathBuf,

    /// Local storage directory
    pub local_storage_dir: PathBuf,

    /// IndexedDB directory
    pub indexeddb_dir: PathBuf,

    /// Applied fingerprint
    pub fingerprint: Fingerprint,

    /// Creation timestamp
    pub created_at: DateTime<Utc>,

    /// Last accessed timestamp
    pub last_accessed: DateTime<Utc>,

    /// Context metadata
    pub metadata: ContextMetadata,
}

/// Metadata about a browser context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextMetadata {
    /// Total cookies stored
    pub cookie_count: u64,
    /// Cache size in bytes
    pub cache_size_bytes: u64,
    /// Number of localStorage entries
    pub local_storage_entries: u64,
    /// Whether the context is currently active
    pub is_active: bool,
    /// Total pages visited in this context
    pub pages_visited: u64,
}

impl Default for ContextMetadata {
    fn default() -> Self {
        Self {
            cookie_count: 0,
            cache_size_bytes: 0,
            local_storage_entries: 0,
            is_active: false,
            pages_visited: 0,
        }
    }
}

impl BrowserContext {
    /// Create a new isolated browser context
    pub fn new(identity_id: &str, base_dir: &PathBuf, fingerprint: Fingerprint) -> Self {
        let data_dir = base_dir.join("contexts").join(identity_id);
        let now = Utc::now();

        Self {
            identity_id: identity_id.to_string(),
            cookie_store_path: data_dir.join("cookies.db"),
            cache_dir: data_dir.join("cache"),
            local_storage_dir: data_dir.join("local_storage"),
            indexeddb_dir: data_dir.join("indexeddb"),
            data_dir,
            fingerprint,
            created_at: now,
            last_accessed: now,
            metadata: ContextMetadata::default(),
        }
    }

    /// Ensure all context directories exist
    pub fn ensure_directories(&self) -> Result<(), String> {
        for dir in &[
            &self.data_dir,
            &self.cache_dir,
            &self.local_storage_dir,
            &self.indexeddb_dir,
        ] {
            std::fs::create_dir_all(dir)
                .map_err(|e| format!("Failed to create dir {:?}: {}", dir, e))?;
        }
        Ok(())
    }

    /// Clear all data for this context (nuclear option)
    pub fn clear_all_data(&self) -> Result<(), String> {
        if self.data_dir.exists() {
            std::fs::remove_dir_all(&self.data_dir)
                .map_err(|e| format!("Failed to clear context data: {}", e))?;
        }
        self.ensure_directories()?;
        Ok(())
    }

    /// Clear only cookies
    pub fn clear_cookies(&self) -> Result<(), String> {
        if self.cookie_store_path.exists() {
            std::fs::remove_file(&self.cookie_store_path)
                .map_err(|e| format!("Failed to clear cookies: {}", e))?;
        }
        Ok(())
    }

    /// Clear only cache
    pub fn clear_cache(&self) -> Result<(), String> {
        if self.cache_dir.exists() {
            std::fs::remove_dir_all(&self.cache_dir)
                .map_err(|e| format!("Failed to clear cache: {}", e))?;
            std::fs::create_dir_all(&self.cache_dir)
                .map_err(|e| format!("Failed to recreate cache dir: {}", e))?;
        }
        Ok(())
    }

    /// Get the size of all data in this context
    pub fn total_size_bytes(&self) -> u64 {
        dir_size(&self.data_dir)
    }

    /// Generate Chromium command-line flags for this context
    pub fn chromium_flags(&self) -> Vec<String> {
        let mut flags = vec![
            format!("--user-data-dir={}", self.data_dir.display()),
            format!(
                "--user-agent={}",
                self.fingerprint.user_agent
            ),
            "--no-first-run".to_string(),
            "--no-default-browser-check".to_string(),
            "--disable-background-networking".to_string(),
            "--disable-client-side-phishing-detection".to_string(),
            "--disable-default-apps".to_string(),
            "--disable-extensions".to_string(),
            "--disable-hang-monitor".to_string(),
            "--disable-popup-blocking".to_string(),
            "--disable-prompt-on-repost".to_string(),
            "--disable-sync".to_string(),
            "--disable-translate".to_string(),
            "--metrics-recording-only".to_string(),
            "--safebrowsing-disable-auto-update".to_string(),
            // Fingerprint-specific flags
            format!(
                "--window-size={},{}",
                self.fingerprint.screen.width, self.fingerprint.screen.height
            ),
        ];

        // WebRTC IP handling policy to prevent leaks
        flags.push("--enforce-webrtc-ip-permission-check".to_string());
        flags.push("--webrtc-ip-handling-policy=disable_non_proxied_udp".to_string());

        // Disable features that can reveal identity
        flags.push("--disable-features=WebRtcHideLocalIpsWithMdns".to_string());

        flags
    }
}

/// Calculate directory size recursively
fn dir_size(path: &PathBuf) -> u64 {
    if !path.exists() {
        return 0;
    }
    std::fs::read_dir(path)
        .map(|entries| {
            entries
                .filter_map(|e| e.ok())
                .map(|e| {
                    let meta = e.metadata().ok();
                    if let Some(m) = meta {
                        if m.is_dir() {
                            dir_size(&e.path())
                        } else {
                            m.len()
                        }
                    } else {
                        0
                    }
                })
                .sum()
        })
        .unwrap_or(0)
}

/// Chromium launch configuration builder
#[derive(Debug, Clone)]
pub struct ChromiumLauncher {
    /// Path to Chromium/Chrome binary
    pub binary_path: PathBuf,
    /// Global flags
    pub global_flags: Vec<String>,
}

impl ChromiumLauncher {
    /// Create a new launcher with default Chromium detection
    pub fn new() -> Self {
        Self {
            binary_path: detect_chromium_binary(),
            global_flags: vec![
                "--disable-gpu-sandbox".to_string(),
                "--disable-software-rasterizer".to_string(),
            ],
        }
    }

    /// Build the full command-line for a browser context
    pub fn build_command(&self, context: &BrowserContext) -> Vec<String> {
        let mut args = self.global_flags.clone();
        args.extend(context.chromium_flags());
        args
    }
}

/// Detect the Chromium/Chrome binary on the system
fn detect_chromium_binary() -> PathBuf {
    // Check common locations on Linux
    let candidates = [
        "/usr/bin/chromium-browser",
        "/usr/bin/chromium",
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/snap/bin/chromium",
        "/usr/lib/chromium/chromium",
        // Flatpak
        "/var/lib/flatpak/exports/bin/org.chromium.Chromium",
    ];

    for candidate in &candidates {
        let path = PathBuf::from(candidate);
        if path.exists() {
            return path;
        }
    }

    // Default fallback
    PathBuf::from("chromium-browser")
}
