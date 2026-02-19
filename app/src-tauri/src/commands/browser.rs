//! Browser Commands
//!
//! Core browser functionality for navigation and page interaction.

use serde::{Deserialize, Serialize};
use tracing::info;

/// Result type for browser operations
pub type BrowserResult<T> = Result<T, String>;

/// Navigation request
#[derive(Debug, Deserialize)]
pub struct NavigateRequest {
    pub url: String,
    pub identity_id: Option<String>,
}

/// Page content response
#[derive(Debug, Serialize)]
pub struct PageContent {
    pub url: String,
    pub title: String,
    pub html: String,
    pub text: String,
}

/// Navigate to a URL
#[tauri::command]
pub async fn navigate(
    request: NavigateRequest,
) -> BrowserResult<String> {
    let trimmed = request.url.trim();

    // Reject empty URLs
    if trimmed.is_empty() {
        return Err("URL cannot be empty".to_string());
    }

    // Block dangerous protocols
    let lower = trimmed.to_lowercase();
    for protocol in &["javascript:", "data:", "file:", "vbscript:", "blob:"] {
        if lower.starts_with(protocol) {
            return Err(format!("Blocked dangerous protocol: {}", protocol.trim_end_matches(':')));
        }
    }

    info!("Navigating to: {}", trimmed);

    // Normalize URL: add https:// if no scheme is present
    let url = if !lower.starts_with("http://") && !lower.starts_with("https://") {
        format!("https://{}", trimmed)
    } else {
        trimmed.to_string()
    };

    // In a real implementation, this would control the webview
    // For now, we return the validated URL
    Ok(url)
}

/// Go back in history
#[tauri::command]
pub async fn go_back(identity_id: Option<String>) -> BrowserResult<String> {
    let id_label = identity_id.as_deref().unwrap_or("default");
    info!("Go back requested for identity: {}", id_label);
    // TODO: Integrate with Tauri webview history API once multi-webview support is wired up.
    // This stub acknowledges the request so the frontend can handle the pending state.
    Ok(format!(
        "Go back requested for identity '{}'. Webview history integration pending.",
        id_label
    ))
}

/// Go forward in history
#[tauri::command]
pub async fn go_forward(identity_id: Option<String>) -> BrowserResult<String> {
    let id_label = identity_id.as_deref().unwrap_or("default");
    info!("Go forward requested for identity: {}", id_label);
    // TODO: Integrate with Tauri webview history API once multi-webview support is wired up.
    Ok(format!(
        "Go forward requested for identity '{}'. Webview history integration pending.",
        id_label
    ))
}

/// Reload current page
#[tauri::command]
pub async fn reload(identity_id: Option<String>) -> BrowserResult<String> {
    let id_label = identity_id.as_deref().unwrap_or("default");
    info!("Reload requested for identity: {}", id_label);
    // TODO: Integrate with Tauri webview reload API once multi-webview support is wired up.
    Ok(format!(
        "Reload requested for identity '{}'. Webview integration pending.",
        id_label
    ))
}

/// Get current page content
#[tauri::command]
pub async fn get_page_content(identity_id: Option<String>) -> BrowserResult<PageContent> {
    let id_label = identity_id.as_deref().unwrap_or("default");
    info!("Getting page content for identity: {}", id_label);

    // TODO: Extract real content from the webview once multi-webview support is wired up.
    // Returns a blank page placeholder so callers can distinguish "no content yet"
    // from an actual error.
    Ok(PageContent {
        url: "about:blank".to_string(),
        title: format!("New Tab ({})", id_label),
        html: String::new(),
        text: String::new(),
    })
}
