//! Message enum — the single source of UI events.
//!
//! Replaces all Redux Toolkit actions, action creators, and async thunks.
//! Every state change flows through here.

use crate::core::entity::Entity;
use crate::core::identity::Identity;
use crate::investigation::InvestigationSummary;
use crate::mcp::Agent;
use crate::ui::state::{ActivePanel, ChatEntry, OpsecLevel, OsintDisplay, OsintMode, Tab};

#[derive(Debug, Clone)]
pub enum Message {
    // ── Bootstrap ──────────────────────────────────────────────────────────
    /// All startup data fetched
    StartupLoaded {
        identities: Vec<Identity>,
        entities: Vec<Entity>,
        agents: Vec<Agent>,
    },
    StartupError(String),

    // ── Navigation ─────────────────────────────────────────────────────────
    UrlBarChanged(String),
    Navigate,
    GoBack,
    GoForward,
    Reload,

    // ── Tabs ───────────────────────────────────────────────────────────────
    NewTab,
    CloseTab(usize),
    SelectTab(usize),
    TabUpdated { index: usize, title: String, url: String },

    // ── UI layout ──────────────────────────────────────────────────────────
    ShowPanel(ActivePanel),
    ToggleSidebar,

    // ── Identity ───────────────────────────────────────────────────────────
    IdentitiesLoaded(Vec<Identity>),
    NewIdentityNameChanged(String),
    CreateIdentity,
    IdentityCreated(Identity),
    DeleteIdentity(String),
    SwitchIdentity(String),
    IdentitySwitched(Identity),

    // ── Hivemind ───────────────────────────────────────────────────────────
    EntitiesLoaded(Vec<Entity>),
    ExtractEntities,
    ClearEntities,

    // ── MCP ────────────────────────────────────────────────────────────────
    AgentsLoaded(Vec<Agent>),
    SelectAgent(String),
    ChatInputChanged(String),
    SendMessage,
    MessageReceived(String),
    McpError(String),

    // ── Privacy ────────────────────────────────────────────────────────────
    SetOpsecLevel(OpsecLevel),

    // ── OSINT ──────────────────────────────────────────────────────────────
    OsintModeChanged(OsintMode),
    OsintQueryChanged(String),
    RunOsint,
    OsintResult(OsintDisplay),
    OsintError(String),

    // ── Investigation ──────────────────────────────────────────────────────
    InvestigationsLoaded(Vec<InvestigationSummary>),
    CreateInvestigation,
    SelectInvestigation(String),

    // ── Settings ───────────────────────────────────────────────────────────
    ApiKeyChanged(String),
    ToggleApiKeyVisibility,
    SaveApiKey,

    // ── Status ─────────────────────────────────────────────────────────────
    SetStatus(String),
    ClearError,
}
