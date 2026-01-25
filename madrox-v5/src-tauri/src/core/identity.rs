//! Identity Management
//!
//! Each identity (dupe) represents a unique browser persona with isolated
//! fingerprint, cookies, and session data.

use crate::core::fingerprint::Fingerprint;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// Status of an identity
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum IdentityStatus {
    Active,
    Dormant,
    Destroyed,
}

/// Proxy configuration for an identity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProxyConfig {
    pub enabled: bool,
    pub proxy_type: String,
    pub host: Option<String>,
    pub port: Option<u16>,
}

impl Default for ProxyConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            proxy_type: "none".to_string(),
            host: None,
            port: None,
        }
    }
}

/// A MADROX identity (dupe)
///
/// Like Jamie Madrox's duplicates, each identity operates independently
/// but shares intelligence through the Hivemind.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Identity {
    /// Unique identifier
    pub id: String,

    /// Display name (e.g., "Prime", "Dupe-1", "Analyst")
    pub name: String,

    /// Optional description
    pub description: Option<String>,

    /// Unique browser fingerprint
    pub fingerprint: Fingerprint,

    /// Current status
    pub status: IdentityStatus,

    /// Proxy configuration
    pub proxy_config: Option<ProxyConfig>,

    /// Creation timestamp
    pub created_at: DateTime<Utc>,

    /// Last activity timestamp
    pub last_used: DateTime<Utc>,

    /// Number of open tabs
    pub tab_count: u32,

    /// Number of entities discovered
    pub entities_found: u32,
}

impl Identity {
    /// Create the Prime identity (the original)
    pub fn prime() -> Self {
        Self {
            id: "prime".to_string(),
            name: "Prime".to_string(),
            description: Some("The original identity".to_string()),
            fingerprint: crate::core::fingerprint::generate_fingerprint(),
            status: IdentityStatus::Active,
            proxy_config: None,
            created_at: Utc::now(),
            last_used: Utc::now(),
            tab_count: 0,
            entities_found: 0,
        }
    }

    /// Check if this is the Prime identity
    pub fn is_prime(&self) -> bool {
        self.id == "prime"
    }

    /// Mark the identity as dormant
    pub fn set_dormant(&mut self) {
        self.status = IdentityStatus::Dormant;
    }

    /// Mark the identity as active
    pub fn set_active(&mut self) {
        self.status = IdentityStatus::Active;
        self.last_used = Utc::now();
    }

    /// Destroy the identity (cannot be undone)
    pub fn destroy(&mut self) {
        self.status = IdentityStatus::Destroyed;
    }
}
