//! CEF Browser Commands
//!
//! IPC command handlers for the embedded Chromium browser.

use crate::cef::{self, CefBrowserInstance, NavigationEntry};
use crate::core::identity::Identity;
use crate::storage;
use serde::{Deserialize, Serialize};
use tracing::info;

pub type CefResult<T> = Result<T, String>;

/// Create a browser context for an identity
#[tauri::command]
pub async fn create_browser_context(
    app_handle: tauri::AppHandle,
    identity_id: String,
) -> CefResult<CefBrowserInstance> {
    info!("Creating CEF browser context for identity: {}", identity_id);

    let store = storage::get_store(&app_handle)
        .map_err(|e| format!("Storage error: {}", e))?;

    let identity = store
        .get_identity(&identity_id)
        .map_err(|e| format!("Failed to get identity: {}", e))?
        .ok_or_else(|| format!("Identity '{}' not found", identity_id))?;

    cef::with_manager_mut(|mgr| mgr.create_browser_context(&identity))
}

/// Navigate with CEF
#[tauri::command]
pub async fn cef_navigate(
    identity_id: String,
    url: String,
) -> CefResult<NavigationEntry> {
    info!("CEF navigate: identity='{}' url='{}'", identity_id, url);
    cef::with_manager_mut(|mgr| mgr.navigate(&identity_id, &url))
}

/// Go back in CEF browser
#[tauri::command]
pub async fn cef_go_back(identity_id: String) -> CefResult<Option<String>> {
    info!("CEF go back: identity='{}'", identity_id);
    cef::with_manager_mut(|mgr| mgr.go_back(&identity_id))
}

/// Go forward in CEF browser
#[tauri::command]
pub async fn cef_go_forward(identity_id: String) -> CefResult<Option<String>> {
    info!("CEF go forward: identity='{}'", identity_id);
    cef::with_manager_mut(|mgr| mgr.go_forward(&identity_id))
}

/// Reload CEF browser
#[tauri::command]
pub async fn cef_reload(identity_id: String) -> CefResult<()> {
    info!("CEF reload: identity='{}'", identity_id);
    cef::with_manager_mut(|mgr| mgr.reload(&identity_id))
}

/// Get browser instance info
#[tauri::command]
pub async fn get_browser_instance(
    identity_id: String,
) -> CefResult<Option<CefBrowserInstance>> {
    cef::with_manager(|mgr| Ok(mgr.get_instance(&identity_id).cloned()))
}

/// Get navigation history for an identity
#[tauri::command]
pub async fn get_navigation_history(
    identity_id: String,
) -> CefResult<Vec<NavigationEntry>> {
    cef::with_manager(|mgr| Ok(mgr.get_history(&identity_id)))
}

/// Destroy a browser context
#[tauri::command]
pub async fn destroy_browser_context(
    identity_id: String,
) -> CefResult<()> {
    info!("Destroying CEF context for identity: {}", identity_id);
    cef::with_manager_mut(|mgr| mgr.destroy_context(&identity_id))
}

/// Generate fingerprint injection script for an identity
#[tauri::command]
pub async fn get_fingerprint_script(
    app_handle: tauri::AppHandle,
    identity_id: String,
) -> CefResult<String> {
    let store = storage::get_store(&app_handle)
        .map_err(|e| format!("Storage error: {}", e))?;

    let identity = store
        .get_identity(&identity_id)
        .map_err(|e| format!("Failed to get identity: {}", e))?
        .ok_or_else(|| format!("Identity '{}' not found", identity_id))?;

    let config = crate::cef::fingerprint_injector::InjectionConfig::default();
    let script =
        crate::cef::fingerprint_injector::generate_injection_script(&identity.fingerprint, &config);

    Ok(script)
}
