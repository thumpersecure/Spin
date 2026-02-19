//! Application state types
//!
//! Replaces the 9 Redux Toolkit slices from the former React frontend.

use crate::core::identity::Identity;
use crate::investigation::InvestigationSummary;
use crate::mcp::Agent;

// ─── Panel routing ─────────────────────────────────────────────────────────

/// Which side panel is currently visible (maps 1-to-1 with SidePanel tabs)
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub enum ActivePanel {
    #[default]
    Identity,
    Hivemind,
    Mcp,
    Osint,
    Privacy,
    Investigation,
    Settings,
}

// ─── Browser / tabs ────────────────────────────────────────────────────────

/// A single browser tab
#[derive(Debug, Clone)]
pub struct Tab {
    pub id: String,
    pub title: String,
    pub url: String,
    pub loading: bool,
    pub favicon: Option<String>,
}

impl Tab {
    pub fn new(url: impl Into<String>) -> Self {
        let url = url.into();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            title: "New Tab".to_string(),
            url: url.clone(),
            loading: false,
            favicon: None,
        }
    }

    pub fn new_tab() -> Self {
        Self::new("about:blank")
    }
}

// ─── OSINT ─────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub enum OsintMode {
    #[default]
    Phone,
    Email,
    Username,
    Domain,
}

impl OsintMode {
    pub fn label(&self) -> &'static str {
        match self {
            OsintMode::Phone => "Phone",
            OsintMode::Email => "Email",
            OsintMode::Username => "Username",
            OsintMode::Domain => "Domain",
        }
    }
}

/// Flattened OSINT result for display
#[derive(Debug, Clone)]
pub struct OsintDisplay {
    pub mode: OsintMode,
    pub query: String,
    pub summary: Vec<(String, String)>,          // label → value rows
    pub search_links: Vec<(String, String)>,      // platform → url
}

// ─── MCP chat ──────────────────────────────────────────────────────────────

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ChatRole {
    User,
    Agent,
    System,
}

#[derive(Debug, Clone)]
pub struct ChatEntry {
    pub role: ChatRole,
    pub content: String,
    pub agent_name: Option<String>,
}

// ─── Privacy ───────────────────────────────────────────────────────────────

// Re-export OpsecLevel for convenience
pub use crate::core::privacy_engine::OpsecLevel;

// ─── Full app state ────────────────────────────────────────────────────────

/// The complete application state (replaces 9 Redux slices)
pub struct AppState {
    // ── Tabs ───────────────────────────────────────────────────────────────
    pub tabs: Vec<Tab>,
    pub active_tab: usize,
    pub url_bar: String,

    // ── Identity ───────────────────────────────────────────────────────────
    pub identities: Vec<Identity>,
    pub active_identity: Option<Identity>,
    pub new_identity_name: String,

    // ── Hivemind ───────────────────────────────────────────────────────────
    pub entities: Vec<crate::core::entity::Entity>,

    // ── MCP ────────────────────────────────────────────────────────────────
    pub agents: Vec<Agent>,
    pub selected_agent: Option<String>,
    pub chat_input: String,
    pub chat_history: Vec<ChatEntry>,
    pub mcp_loading: bool,

    // ── Privacy ────────────────────────────────────────────────────────────
    pub opsec_level: OpsecLevel,
    pub privacy_stats: Option<crate::core::privacy_engine::PrivacyStats>,

    // ── OSINT ──────────────────────────────────────────────────────────────
    pub osint_mode: OsintMode,
    pub osint_query: String,
    pub osint_result: Option<OsintDisplay>,
    pub osint_loading: bool,

    // ── Investigation ──────────────────────────────────────────────────────
    pub investigations: Vec<InvestigationSummary>,
    pub active_investigation_id: Option<String>,

    // ── Settings ───────────────────────────────────────────────────────────
    pub claude_api_key: String,
    pub api_key_visible: bool,

    // ── UI ─────────────────────────────────────────────────────────────────
    pub active_panel: ActivePanel,
    pub sidebar_collapsed: bool,

    // ── Status ─────────────────────────────────────────────────────────────
    pub status: String,
    pub loading: bool,
    pub error: Option<String>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            tabs: vec![Tab::new_tab()],
            active_tab: 0,
            url_bar: String::new(),

            identities: Vec::new(),
            active_identity: None,
            new_identity_name: String::new(),

            entities: Vec::new(),

            agents: Vec::new(),
            selected_agent: None,
            chat_input: String::new(),
            chat_history: Vec::new(),
            mcp_loading: false,

            opsec_level: OpsecLevel::Standard,
            privacy_stats: None,

            osint_mode: OsintMode::default(),
            osint_query: String::new(),
            osint_result: None,
            osint_loading: false,

            investigations: Vec::new(),
            active_investigation_id: None,

            claude_api_key: String::new(),
            api_key_visible: false,

            active_panel: ActivePanel::default(),
            sidebar_collapsed: false,

            status: "Ready".to_string(),
            loading: false,
            error: None,
        }
    }
}
