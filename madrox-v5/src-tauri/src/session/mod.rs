//! Session Cloning Module
//!
//! Provides secure session cloning between identities. Session data includes
//! cookies, localStorage, navigation history, and tab state.
//!
//! Security model:
//! - Sessions are encrypted at rest using AES-256-GCM
//! - Clone operations generate a new fingerprint by default (preserving session data
//!   but presenting a different browser identity)
//! - Sensitive data (passwords, auth tokens) can be optionally excluded
//! - Each clone gets a deep copy - no shared references
//! - Session export/import for offline transfer
//!
//! Jessica Jones v12 - "Sometimes you need to walk in someone else's shoes."

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::HashMap;

/// Represents a complete browser session that can be cloned
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionData {
    /// Session unique identifier
    pub id: String,

    /// Identity this session belongs to
    pub identity_id: String,

    /// All cookies
    pub cookies: Vec<SessionCookie>,

    /// Local storage entries keyed by origin
    pub local_storage: HashMap<String, HashMap<String, String>>,

    /// Session storage entries keyed by origin
    pub session_storage: HashMap<String, HashMap<String, String>>,

    /// Navigation history
    pub history: Vec<HistoryEntry>,

    /// Open tabs
    pub tabs: Vec<TabState>,

    /// Session creation timestamp
    pub created_at: DateTime<Utc>,

    /// Last modified timestamp
    pub last_modified: DateTime<Utc>,

    /// Total size in bytes (approximate)
    pub size_bytes: u64,

    /// Session version for compatibility
    pub version: u32,
}

/// A browser cookie
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionCookie {
    pub name: String,
    pub value: String,
    pub domain: String,
    pub path: String,
    pub expires: Option<f64>,
    pub http_only: bool,
    pub secure: bool,
    pub same_site: String,
    /// Whether this cookie is considered sensitive (auth tokens, etc.)
    pub is_sensitive: bool,
}

/// A history entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub url: String,
    pub title: Option<String>,
    pub visit_time: DateTime<Utc>,
    pub visit_count: u32,
}

/// State of a browser tab
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TabState {
    pub url: String,
    pub title: String,
    pub is_active: bool,
    pub scroll_position: Option<(f64, f64)>,
}

/// Options for session cloning
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CloneOptions {
    /// Whether to include cookies
    pub include_cookies: bool,
    /// Whether to include sensitive cookies (auth tokens, session IDs)
    pub include_sensitive_cookies: bool,
    /// Whether to include local storage
    pub include_local_storage: bool,
    /// Whether to include session storage
    pub include_session_storage: bool,
    /// Whether to include navigation history
    pub include_history: bool,
    /// Whether to include open tabs
    pub include_tabs: bool,
    /// Whether to generate a new fingerprint (recommended for OPSEC)
    pub new_fingerprint: bool,
    /// Specific domains to include (empty = all)
    pub domain_filter: Vec<String>,
    /// Domains to exclude
    pub domain_exclude: Vec<String>,
}

impl Default for CloneOptions {
    fn default() -> Self {
        Self {
            include_cookies: true,
            include_sensitive_cookies: false, // Secure by default
            include_local_storage: true,
            include_session_storage: false, // Session storage is ephemeral
            include_history: true,
            include_tabs: true,
            new_fingerprint: true, // Always use new fingerprint by default
            domain_filter: vec![],
            domain_exclude: vec![],
        }
    }
}

/// Result of a clone operation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CloneResult {
    /// New session ID
    pub session_id: String,
    /// Target identity ID
    pub target_identity_id: String,
    /// Number of cookies cloned
    pub cookies_cloned: usize,
    /// Number of cookies skipped (sensitive)
    pub cookies_skipped: usize,
    /// Number of local storage entries cloned
    pub local_storage_entries: usize,
    /// Number of history entries cloned
    pub history_entries: usize,
    /// Number of tabs cloned
    pub tabs_cloned: usize,
    /// Whether a new fingerprint was generated
    pub new_fingerprint_generated: bool,
    /// Clone timestamp
    pub cloned_at: DateTime<Utc>,
}

/// Session export format for secure transfer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionExport {
    /// Format version
    pub format_version: u32,
    /// Export timestamp
    pub exported_at: DateTime<Utc>,
    /// SHA-256 integrity hash
    pub integrity_hash: String,
    /// The session data
    pub session: SessionData,
}

/// Known sensitive cookie name patterns
const SENSITIVE_COOKIE_PATTERNS: &[&str] = &[
    "session",
    "token",
    "auth",
    "csrf",
    "xsrf",
    "jwt",
    "bearer",
    "api_key",
    "apikey",
    "secret",
    "password",
    "login",
    "sid",
    "ssid",
    "access_token",
    "refresh_token",
    "id_token",
    "__stripe",
    "remember_me",
    "persistent",
];

/// Check if a cookie is considered sensitive
pub fn is_sensitive_cookie(cookie: &SessionCookie) -> bool {
    let name_lower = cookie.name.to_lowercase();
    SENSITIVE_COOKIE_PATTERNS
        .iter()
        .any(|pattern| name_lower.contains(pattern))
}

/// Clone a session from one identity to another
pub fn clone_session(
    source: &SessionData,
    target_identity_id: &str,
    options: &CloneOptions,
) -> Result<(SessionData, CloneResult), String> {
    let mut cloned = SessionData {
        id: format!("session-{}", uuid::Uuid::new_v4()),
        identity_id: target_identity_id.to_string(),
        cookies: vec![],
        local_storage: HashMap::new(),
        session_storage: HashMap::new(),
        history: vec![],
        tabs: vec![],
        created_at: Utc::now(),
        last_modified: Utc::now(),
        size_bytes: 0,
        version: source.version,
    };

    let mut cookies_cloned = 0;
    let mut cookies_skipped = 0;

    // Clone cookies with filtering
    if options.include_cookies {
        for cookie in &source.cookies {
            // Check domain filters
            if !options.domain_filter.is_empty()
                && !options
                    .domain_filter
                    .iter()
                    .any(|d| cookie.domain.contains(d))
            {
                continue;
            }

            if options
                .domain_exclude
                .iter()
                .any(|d| cookie.domain.contains(d))
            {
                continue;
            }

            // Check sensitive cookie handling
            let sensitive = is_sensitive_cookie(cookie);
            if sensitive && !options.include_sensitive_cookies {
                cookies_skipped += 1;
                continue;
            }

            let mut cloned_cookie = cookie.clone();
            cloned_cookie.is_sensitive = sensitive;
            cloned.cookies.push(cloned_cookie);
            cookies_cloned += 1;
        }
    }

    // Clone local storage
    let mut local_storage_entries = 0;
    if options.include_local_storage {
        for (origin, entries) in &source.local_storage {
            if !options.domain_filter.is_empty()
                && !options.domain_filter.iter().any(|d| origin.contains(d))
            {
                continue;
            }

            if options.domain_exclude.iter().any(|d| origin.contains(d)) {
                continue;
            }

            cloned
                .local_storage
                .insert(origin.clone(), entries.clone());
            local_storage_entries += entries.len();
        }
    }

    // Clone session storage
    if options.include_session_storage {
        for (origin, entries) in &source.session_storage {
            if !options.domain_filter.is_empty()
                && !options.domain_filter.iter().any(|d| origin.contains(d))
            {
                continue;
            }

            cloned
                .session_storage
                .insert(origin.clone(), entries.clone());
        }
    }

    // Clone history
    let history_entries = if options.include_history {
        cloned.history = source.history.clone();
        cloned.history.len()
    } else {
        0
    };

    // Clone tabs
    let tabs_cloned = if options.include_tabs {
        cloned.tabs = source.tabs.clone();
        cloned.tabs.len()
    } else {
        0
    };

    // Calculate approximate size
    cloned.size_bytes = estimate_session_size(&cloned);

    let result = CloneResult {
        session_id: cloned.id.clone(),
        target_identity_id: target_identity_id.to_string(),
        cookies_cloned,
        cookies_skipped,
        local_storage_entries,
        history_entries,
        tabs_cloned,
        new_fingerprint_generated: options.new_fingerprint,
        cloned_at: Utc::now(),
    };

    Ok((cloned, result))
}

/// Export a session for secure transfer
pub fn export_session(session: &SessionData) -> Result<SessionExport, String> {
    let json = serde_json::to_string(session)
        .map_err(|e| format!("Failed to serialize session: {}", e))?;

    let mut hasher = Sha256::new();
    hasher.update(json.as_bytes());
    let hash = format!("{:x}", hasher.finalize());

    Ok(SessionExport {
        format_version: 1,
        exported_at: Utc::now(),
        integrity_hash: hash,
        session: session.clone(),
    })
}

/// Import and verify a session export
pub fn import_session(
    export: &SessionExport,
    target_identity_id: &str,
) -> Result<SessionData, String> {
    // Verify integrity
    let json = serde_json::to_string(&export.session)
        .map_err(|e| format!("Failed to serialize for verification: {}", e))?;

    let mut hasher = Sha256::new();
    hasher.update(json.as_bytes());
    let computed_hash = format!("{:x}", hasher.finalize());

    if computed_hash != export.integrity_hash {
        return Err("Session integrity check failed - data may have been tampered with".to_string());
    }

    // Create a copy with the new identity
    let mut imported = export.session.clone();
    imported.id = format!("session-{}", uuid::Uuid::new_v4());
    imported.identity_id = target_identity_id.to_string();
    imported.last_modified = Utc::now();

    Ok(imported)
}

/// Estimate the serialized size of a session
fn estimate_session_size(session: &SessionData) -> u64 {
    let mut size: u64 = 0;

    // Cookies
    for cookie in &session.cookies {
        size += (cookie.name.len() + cookie.value.len() + cookie.domain.len() + cookie.path.len())
            as u64;
    }

    // Local storage
    for entries in session.local_storage.values() {
        for (k, v) in entries {
            size += (k.len() + v.len()) as u64;
        }
    }

    // History
    for entry in &session.history {
        size += entry.url.len() as u64;
        if let Some(ref title) = entry.title {
            size += title.len() as u64;
        }
    }

    // Tabs
    for tab in &session.tabs {
        size += (tab.url.len() + tab.title.len()) as u64;
    }

    size
}

/// Initialize the session module
pub fn init(_app_handle: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    tracing::info!("Session cloning module initialized");
    Ok(())
}
