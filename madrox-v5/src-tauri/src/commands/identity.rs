//! Identity (Dupe) Management Commands
//!
//! Like Jamie Madrox, MADROX can spawn multiple identities (dupes),
//! each with unique fingerprints and isolated sessions.

use crate::core::identity::{Identity, IdentityStatus};
use crate::storage;
use serde::{Deserialize, Serialize};
use tracing::{info, warn};
use uuid::Uuid;

/// Result type for identity operations
pub type IdentityResult<T> = Result<T, String>;

/// Request to create a new identity
#[derive(Debug, Deserialize)]
pub struct CreateIdentityRequest {
    pub name: String,
    pub description: Option<String>,
    pub proxy_config: Option<ProxyConfig>,
}

/// Proxy configuration for an identity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProxyConfig {
    pub enabled: bool,
    pub proxy_type: String, // "http", "socks5", "tor"
    pub host: Option<String>,
    pub port: Option<u16>,
}

/// Get all identities
#[tauri::command]
pub async fn get_all_identities(
    app_handle: tauri::AppHandle,
) -> IdentityResult<Vec<Identity>> {
    info!("Fetching all identities");

    let store = storage::get_store(&app_handle)
        .map_err(|e| format!("Storage error: {}", e))?;

    let identities = store
        .get_all_identities()
        .map_err(|e| format!("Failed to get identities: {}", e))?;

    Ok(identities)
}

/// Create a new identity (dupe)
#[tauri::command]
pub async fn create_identity(
    app_handle: tauri::AppHandle,
    request: CreateIdentityRequest,
) -> IdentityResult<Identity> {
    info!("Creating new identity: {}", request.name);

    let store = storage::get_store(&app_handle)
        .map_err(|e| format!("Storage error: {}", e))?;

    // Generate unique fingerprint
    let fingerprint = crate::core::fingerprint::generate_fingerprint();

    let identity = Identity {
        id: Uuid::new_v4().to_string(),
        name: request.name,
        description: request.description,
        fingerprint,
        status: IdentityStatus::Active,
        proxy_config: request.proxy_config,
        created_at: chrono::Utc::now(),
        last_used: chrono::Utc::now(),
        tab_count: 0,
        entities_found: 0,
    };

    store
        .save_identity(&identity)
        .map_err(|e| format!("Failed to save identity: {}", e))?;

    info!("Created identity {} with fingerprint {}", identity.id, identity.fingerprint.id);
    Ok(identity)
}

/// Delete an identity
#[tauri::command]
pub async fn delete_identity(
    app_handle: tauri::AppHandle,
    identity_id: String,
) -> IdentityResult<()> {
    info!("Deleting identity: {}", identity_id);

    // Don't allow deleting Prime
    if identity_id == "prime" {
        return Err("Cannot delete Prime identity".to_string());
    }

    let store = storage::get_store(&app_handle)
        .map_err(|e| format!("Storage error: {}", e))?;

    store
        .delete_identity(&identity_id)
        .map_err(|e| format!("Failed to delete identity: {}", e))?;

    info!("Identity {} deleted and absorbed", identity_id);
    Ok(())
}

/// Switch to a different identity
#[tauri::command]
pub async fn switch_identity(
    app_handle: tauri::AppHandle,
    identity_id: String,
) -> IdentityResult<Identity> {
    info!("Switching to identity: {}", identity_id);

    let store = storage::get_store(&app_handle)
        .map_err(|e| format!("Storage error: {}", e))?;

    // Get the identity
    let identity = store
        .get_identity(&identity_id)
        .map_err(|e| format!("Failed to get identity: {}", e))?
        .ok_or_else(|| format!("Identity {} not found", identity_id))?;

    // Set as active
    store
        .set_active_identity(&identity_id)
        .map_err(|e| format!("Failed to switch identity: {}", e))?;

    info!("Now operating as: {} ({})", identity.name, identity.fingerprint.id);
    Ok(identity)
}

/// Get the currently active identity
#[tauri::command]
pub async fn get_active_identity(
    app_handle: tauri::AppHandle,
) -> IdentityResult<Identity> {
    let store = storage::get_store(&app_handle)
        .map_err(|e| format!("Storage error: {}", e))?;

    let identity = store
        .get_active_identity()
        .map_err(|e| format!("Failed to get active identity: {}", e))?;

    Ok(identity)
}

/// Update an identity's properties
#[tauri::command]
pub async fn update_identity(
    app_handle: tauri::AppHandle,
    identity: Identity,
) -> IdentityResult<Identity> {
    info!("Updating identity: {}", identity.id);

    let store = storage::get_store(&app_handle)
        .map_err(|e| format!("Storage error: {}", e))?;

    store
        .save_identity(&identity)
        .map_err(|e| format!("Failed to update identity: {}", e))?;

    Ok(identity)
}
