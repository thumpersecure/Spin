//! Identity (Dupe) Management Commands
//!
//! Spin can spawn multiple identities (dupes),
//! each with unique fingerprints and isolated sessions.

use crate::core::identity::{Identity, IdentityStatus, ProxyConfig};
use crate::storage;
use serde::Deserialize;
use tracing::info;
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

/// Get all identities
pub async fn get_all_identities() -> IdentityResult<Vec<Identity>> {
    info!("Fetching all identities");
    let store = storage::get_store().map_err(|e| format!("Storage error: {}", e))?;
    store
        .get_all_identities()
        .map_err(|e| format!("Failed to get identities: {}", e))
}

/// Create a new identity (dupe)
pub async fn create_identity(request: CreateIdentityRequest) -> IdentityResult<Identity> {
    info!("Creating new identity: {}", request.name);

    let store = storage::get_store().map_err(|e| format!("Storage error: {}", e))?;
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

    info!(
        "Created identity {} with fingerprint {}",
        identity.id, identity.fingerprint.id
    );
    Ok(identity)
}

/// Delete an identity
pub async fn delete_identity(identity_id: String) -> IdentityResult<()> {
    info!("Deleting identity: {}", identity_id);

    if identity_id == "prime" {
        return Err("Cannot delete Prime identity".to_string());
    }

    let store = storage::get_store().map_err(|e| format!("Storage error: {}", e))?;
    store
        .delete_identity(&identity_id)
        .map_err(|e| format!("Failed to delete identity: {}", e))?;

    info!("Identity {} deleted and absorbed", identity_id);
    Ok(())
}

/// Switch to a different identity
pub async fn switch_identity(identity_id: String) -> IdentityResult<Identity> {
    info!("Switching to identity: {}", identity_id);

    let store = storage::get_store().map_err(|e| format!("Storage error: {}", e))?;

    let identity = store
        .get_identity(&identity_id)
        .map_err(|e| format!("Failed to get identity: {}", e))?
        .ok_or_else(|| format!("Identity {} not found", identity_id))?;

    store
        .set_active_identity(&identity_id)
        .map_err(|e| format!("Failed to switch identity: {}", e))?;

    info!(
        "Now operating as: {} ({})",
        identity.name, identity.fingerprint.id
    );
    Ok(identity)
}

/// Get the currently active identity
pub async fn get_active_identity() -> IdentityResult<Identity> {
    let store = storage::get_store().map_err(|e| format!("Storage error: {}", e))?;
    store
        .get_active_identity()
        .map_err(|e| format!("Failed to get active identity: {}", e))
}

/// Update an identity's properties
pub async fn update_identity(identity: Identity) -> IdentityResult<Identity> {
    info!("Updating identity: {}", identity.id);

    let store = storage::get_store().map_err(|e| format!("Storage error: {}", e))?;
    store
        .save_identity(&identity)
        .map_err(|e| format!("Failed to update identity: {}", e))?;

    Ok(identity)
}
