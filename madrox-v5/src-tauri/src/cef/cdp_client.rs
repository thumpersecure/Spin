//! Chrome DevTools Protocol (CDP) Client
//!
//! Communicates with embedded Chromium instances via the Chrome DevTools Protocol.
//! Used for:
//! - Injecting fingerprint scripts before page load
//! - Controlling navigation
//! - Extracting page content
//! - Managing cookies and storage
//! - Intercepting network requests for privacy enforcement

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// CDP command message
#[derive(Debug, Clone, Serialize)]
pub struct CdpCommand {
    pub id: u64,
    pub method: String,
    pub params: serde_json::Value,
}

/// CDP response
#[derive(Debug, Clone, Deserialize)]
pub struct CdpResponse {
    pub id: Option<u64>,
    pub result: Option<serde_json::Value>,
    pub error: Option<CdpError>,
}

/// CDP error
#[derive(Debug, Clone, Deserialize)]
pub struct CdpError {
    pub code: i64,
    pub message: String,
}

/// CDP event
#[derive(Debug, Clone, Deserialize)]
pub struct CdpEvent {
    pub method: String,
    pub params: Option<serde_json::Value>,
}

/// Cookie from CDP
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CdpCookie {
    pub name: String,
    pub value: String,
    pub domain: String,
    pub path: String,
    pub expires: f64,
    pub http_only: bool,
    pub secure: bool,
    pub same_site: String,
}

/// CDP client for controlling a Chromium instance
#[derive(Debug)]
pub struct CdpClient {
    /// WebSocket URL for CDP connection
    ws_url: String,
    /// Next message ID
    next_id: u64,
    /// Whether connected
    connected: bool,
    /// Debug port
    port: u16,
}

impl CdpClient {
    /// Create a new CDP client for a specific debug port
    pub fn new(port: u16) -> Self {
        Self {
            ws_url: format!("ws://127.0.0.1:{}/devtools/browser", port),
            next_id: 1,
            connected: false,
            port,
        }
    }

    /// Connect to the Chromium instance
    pub async fn connect(&mut self) -> Result<(), String> {
        tracing::info!("CDP: Connecting to Chromium on port {}", self.port);
        self.connected = true;
        Ok(())
    }

    /// Inject a script to run before any page JavaScript
    /// Uses Page.addScriptToEvaluateOnNewDocument
    pub fn inject_on_new_document(&mut self, script: &str) -> CdpCommand {
        let id = self.next_id;
        self.next_id += 1;

        CdpCommand {
            id,
            method: "Page.addScriptToEvaluateOnNewDocument".to_string(),
            params: serde_json::json!({
                "source": script,
            }),
        }
    }

    /// Navigate to a URL
    pub fn navigate(&mut self, url: &str) -> CdpCommand {
        let id = self.next_id;
        self.next_id += 1;

        CdpCommand {
            id,
            method: "Page.navigate".to_string(),
            params: serde_json::json!({
                "url": url,
            }),
        }
    }

    /// Go back in history
    pub fn go_back(&mut self) -> CdpCommand {
        let id = self.next_id;
        self.next_id += 1;

        CdpCommand {
            id,
            method: "Page.navigateToHistoryEntry".to_string(),
            params: serde_json::json!({
                "entryId": -1,
            }),
        }
    }

    /// Reload the page
    pub fn reload(&mut self, ignore_cache: bool) -> CdpCommand {
        let id = self.next_id;
        self.next_id += 1;

        CdpCommand {
            id,
            method: "Page.reload".to_string(),
            params: serde_json::json!({
                "ignoreCache": ignore_cache,
            }),
        }
    }

    /// Get all cookies for the current context
    pub fn get_cookies(&mut self) -> CdpCommand {
        let id = self.next_id;
        self.next_id += 1;

        CdpCommand {
            id,
            method: "Network.getAllCookies".to_string(),
            params: serde_json::json!({}),
        }
    }

    /// Set cookies (used for session cloning)
    pub fn set_cookies(&mut self, cookies: &[CdpCookie]) -> CdpCommand {
        let id = self.next_id;
        self.next_id += 1;

        CdpCommand {
            id,
            method: "Network.setCookies".to_string(),
            params: serde_json::json!({
                "cookies": cookies,
            }),
        }
    }

    /// Clear browser cookies
    pub fn clear_cookies(&mut self) -> CdpCommand {
        let id = self.next_id;
        self.next_id += 1;

        CdpCommand {
            id,
            method: "Network.clearBrowserCookies".to_string(),
            params: serde_json::json!({}),
        }
    }

    /// Clear browser cache
    pub fn clear_cache(&mut self) -> CdpCommand {
        let id = self.next_id;
        self.next_id += 1;

        CdpCommand {
            id,
            method: "Network.clearBrowserCache".to_string(),
            params: serde_json::json!({}),
        }
    }

    /// Evaluate JavaScript in the page context
    pub fn evaluate_js(&mut self, expression: &str) -> CdpCommand {
        let id = self.next_id;
        self.next_id += 1;

        CdpCommand {
            id,
            method: "Runtime.evaluate".to_string(),
            params: serde_json::json!({
                "expression": expression,
                "returnByValue": true,
            }),
        }
    }

    /// Get page content (DOM snapshot)
    pub fn get_page_content(&mut self) -> CdpCommand {
        self.evaluate_js("document.documentElement.outerHTML")
    }

    /// Get page title
    pub fn get_page_title(&mut self) -> CdpCommand {
        self.evaluate_js("document.title")
    }

    /// Enable network domain (required for cookie/request interception)
    pub fn enable_network(&mut self) -> CdpCommand {
        let id = self.next_id;
        self.next_id += 1;

        CdpCommand {
            id,
            method: "Network.enable".to_string(),
            params: serde_json::json!({}),
        }
    }

    /// Enable page domain (required for navigation events)
    pub fn enable_page(&mut self) -> CdpCommand {
        let id = self.next_id;
        self.next_id += 1;

        CdpCommand {
            id,
            method: "Page.enable".to_string(),
            params: serde_json::json!({}),
        }
    }

    /// Set user agent override (network level)
    pub fn set_user_agent(&mut self, user_agent: &str, platform: &str) -> CdpCommand {
        let id = self.next_id;
        self.next_id += 1;

        CdpCommand {
            id,
            method: "Network.setUserAgentOverride".to_string(),
            params: serde_json::json!({
                "userAgent": user_agent,
                "platform": platform,
            }),
        }
    }

    /// Set geolocation override
    pub fn set_geolocation(&mut self, latitude: f64, longitude: f64, accuracy: f64) -> CdpCommand {
        let id = self.next_id;
        self.next_id += 1;

        CdpCommand {
            id,
            method: "Emulation.setGeolocationOverride".to_string(),
            params: serde_json::json!({
                "latitude": latitude,
                "longitude": longitude,
                "accuracy": accuracy,
            }),
        }
    }

    /// Set timezone override
    pub fn set_timezone(&mut self, timezone_id: &str) -> CdpCommand {
        let id = self.next_id;
        self.next_id += 1;

        CdpCommand {
            id,
            method: "Emulation.setTimezoneOverride".to_string(),
            params: serde_json::json!({
                "timezoneId": timezone_id,
            }),
        }
    }

    /// Capture screenshot
    pub fn capture_screenshot(&mut self) -> CdpCommand {
        let id = self.next_id;
        self.next_id += 1;

        CdpCommand {
            id,
            method: "Page.captureScreenshot".to_string(),
            params: serde_json::json!({
                "format": "png",
                "quality": 80,
            }),
        }
    }

    /// Get local storage data for a domain
    pub fn get_local_storage(&mut self, security_origin: &str) -> CdpCommand {
        let id = self.next_id;
        self.next_id += 1;

        CdpCommand {
            id,
            method: "DOMStorage.getDOMStorageItems".to_string(),
            params: serde_json::json!({
                "storageId": {
                    "securityOrigin": security_origin,
                    "isLocalStorage": true,
                },
            }),
        }
    }

    /// Set local storage item
    pub fn set_local_storage_item(
        &mut self,
        security_origin: &str,
        key: &str,
        value: &str,
    ) -> CdpCommand {
        let id = self.next_id;
        self.next_id += 1;

        CdpCommand {
            id,
            method: "DOMStorage.setDOMStorageItem".to_string(),
            params: serde_json::json!({
                "storageId": {
                    "securityOrigin": security_origin,
                    "isLocalStorage": true,
                },
                "key": key,
                "value": value,
            }),
        }
    }
}
