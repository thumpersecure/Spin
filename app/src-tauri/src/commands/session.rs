//! Session Cloning Commands
//!
//! IPC handlers for secure session cloning between identities.

use crate::session::{
    self, CloneOptions, CloneResult, SessionCookie, SessionData, SessionExport,
    HistoryEntry, TabState,
};
use crate::storage;
use chrono::Utc;
use std::collections::HashMap;
use tracing::info;

pub type SessionResult<T> = Result<T, String>;

/// Clone a session from one identity to another
#[tauri::command]
pub async fn clone_session(
    app_handle: tauri::AppHandle,
    source_identity_id: String,
    target_identity_id: String,
    options: Option<CloneOptions>,
) -> SessionResult<CloneResult> {
    info!(
        "Cloning session from '{}' to '{}'",
        source_identity_id, target_identity_id
    );

    let store = storage::get_store(&app_handle)
        .map_err(|e| format!("Storage error: {}", e))?;

    // Verify both identities exist
    store
        .get_identity(&source_identity_id)
        .map_err(|e| format!("Source identity error: {}", e))?
        .ok_or_else(|| {
            format!(
                "Source identity '{}' not found",
                source_identity_id
            )
        })?;

    store
        .get_identity(&target_identity_id)
        .map_err(|e| format!("Target identity error: {}", e))?
        .ok_or_else(|| {
            format!(
                "Target identity '{}' not found",
                target_identity_id
            )
        })?;

    // Get source session data from storage
    let source_session = get_or_create_session(&store, &source_identity_id)?;

    let clone_options = options.unwrap_or_default();

    let (cloned_session, result) =
        session::clone_session(&source_session, &target_identity_id, &clone_options)?;

    // Save the cloned session
    let session_json = serde_json::to_vec(&cloned_session)
        .map_err(|e| format!("Failed to serialize session: {}", e))?;

    store
        .save_session(&target_identity_id, &session_json)
        .map_err(|e| format!("Failed to save cloned session: {}", e))?;

    info!(
        "Session cloned: {} cookies, {} localStorage entries, {} history entries",
        result.cookies_cloned, result.local_storage_entries, result.history_entries
    );

    Ok(result)
}

/// Get session data for an identity
#[tauri::command]
pub async fn get_session_data(
    app_handle: tauri::AppHandle,
    identity_id: String,
) -> SessionResult<SessionData> {
    let store = storage::get_store(&app_handle)
        .map_err(|e| format!("Storage error: {}", e))?;

    get_or_create_session(&store, &identity_id)
}

/// Export a session for secure transfer
#[tauri::command]
pub async fn export_session(
    app_handle: tauri::AppHandle,
    identity_id: String,
) -> SessionResult<SessionExport> {
    let store = storage::get_store(&app_handle)
        .map_err(|e| format!("Storage error: {}", e))?;

    let session_data = get_or_create_session(&store, &identity_id)?;
    session::export_session(&session_data)
}

/// Import a session from an export
#[tauri::command]
pub async fn import_session(
    app_handle: tauri::AppHandle,
    export_data: SessionExport,
    target_identity_id: String,
) -> SessionResult<SessionData> {
    info!("Importing session to identity '{}'", target_identity_id);

    let store = storage::get_store(&app_handle)
        .map_err(|e| format!("Storage error: {}", e))?;

    // Verify target identity exists
    store
        .get_identity(&target_identity_id)
        .map_err(|e| format!("Target identity error: {}", e))?
        .ok_or_else(|| format!("Target identity '{}' not found", target_identity_id))?;

    let imported = session::import_session(&export_data, &target_identity_id)?;

    // Save imported session
    let session_json = serde_json::to_vec(&imported)
        .map_err(|e| format!("Failed to serialize session: {}", e))?;

    store
        .save_session(&target_identity_id, &session_json)
        .map_err(|e| format!("Failed to save imported session: {}", e))?;

    Ok(imported)
}

/// Clear session data for an identity
#[tauri::command]
pub async fn clear_session(
    app_handle: tauri::AppHandle,
    identity_id: String,
) -> SessionResult<()> {
    info!("Clearing session for identity '{}'", identity_id);

    let store = storage::get_store(&app_handle)
        .map_err(|e| format!("Storage error: {}", e))?;

    store
        .clear_session(&identity_id)
        .map_err(|e| format!("Failed to clear session: {}", e))?;

    Ok(())
}

/// Get or create a default session for an identity
fn get_or_create_session(
    store: &std::sync::Arc<crate::storage::SledStore>,
    identity_id: &str,
) -> Result<SessionData, String> {
    match store
        .get_session(identity_id)
        .map_err(|e| format!("Failed to get session: {}", e))?
    {
        Some(bytes) => serde_json::from_slice(&bytes)
            .map_err(|e| format!("Failed to deserialize session: {}", e)),
        None => {
            // Create empty session
            Ok(SessionData {
                id: format!("session-{}", uuid::Uuid::new_v4()),
                identity_id: identity_id.to_string(),
                cookies: vec![],
                local_storage: HashMap::new(),
                session_storage: HashMap::new(),
                history: vec![],
                tabs: vec![],
                created_at: Utc::now(),
                last_modified: Utc::now(),
                size_bytes: 0,
                version: 1,
            })
        }
    }
}
