//! MCP (Model Context Protocol) Module
//!
//! Integration with AI agents for enhanced OSINT capabilities.
//! The MCP server provides Claude-powered sub-agents with specialized skills.
//! Uses shared context with tool routing - a single Claude conversation
//! context routes to specialized agent skills via Claude's tool-use API.
//!
//! Jessica Jones v12 - "Everybody's got a tell."

pub mod claude_client;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::sync::RwLock;
use tauri::AppHandle;

/// Agent status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum AgentStatus {
    Ready,
    Busy,
    Offline,
    Error,
}

/// An MCP agent
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Agent {
    pub id: String,
    pub name: String,
    pub description: String,
    pub status: AgentStatus,
    pub skills: Vec<String>,
    pub icon: String,
}

/// Agent skill definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentSkill {
    pub id: String,
    pub name: String,
    pub description: String,
    pub parameters: Vec<String>,
}

/// Request to invoke an agent
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentInvocation {
    pub agent_id: String,
    pub task: String,
    pub context: Option<serde_json::Value>,
    pub parameters: Option<serde_json::Value>,
}

/// Response from an agent
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentResponse {
    pub agent_id: String,
    pub task: String,
    pub result: String,
    pub confidence: f32,
    pub suggestions: Vec<String>,
    pub entities_found: Vec<String>,
    pub timestamp: DateTime<Utc>,
}

/// MCP server state
static MCP_INITIALIZED: std::sync::atomic::AtomicBool =
    std::sync::atomic::AtomicBool::new(false);

/// Global Claude client (shared context with tool routing)
static CLAUDE_CLIENT: RwLock<Option<claude_client::ClaudeClient>> = RwLock::new(None);

/// Initialize the MCP system with Claude API integration
pub fn init(_app_handle: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    tracing::info!("Initializing MCP (Model Context Protocol) system with Claude API");

    // Mark as initialized
    MCP_INITIALIZED.store(true, std::sync::atomic::Ordering::SeqCst);

    // Initialize Claude client with default config
    let config = claude_client::ClaudeConfig::default();
    let client = claude_client::ClaudeClient::new(config);

    let mut global_client = CLAUDE_CLIENT
        .write()
        .map_err(|e| format!("MCP lock poisoned: {}", e))?;
    *global_client = Some(client);

    let default_config = McpConfig::default();
    tracing::info!(
        "MCP system ready: model={}, max_agents={}",
        default_config.model,
        default_config.max_concurrent_agents
    );

    Ok(())
}

/// Check if MCP is initialized
pub fn is_initialized() -> bool {
    MCP_INITIALIZED.load(std::sync::atomic::Ordering::SeqCst)
}

/// Access Claude client with write lock
pub fn with_claude_client<F, R>(f: F) -> Result<R, String>
where
    F: FnOnce(&mut claude_client::ClaudeClient) -> Result<R, String>,
{
    let mut guard = CLAUDE_CLIENT
        .write()
        .map_err(|e| format!("MCP lock poisoned: {}", e))?;
    let client = guard.as_mut().ok_or("Claude client not initialized")?;
    f(client)
}

/// Check if Claude API is configured
pub fn is_claude_configured() -> bool {
    CLAUDE_CLIENT
        .read()
        .ok()
        .and_then(|guard| guard.as_ref().map(|c| c.is_configured()))
        .unwrap_or(false)
}

/// MCP configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpConfig {
    pub enabled: bool,
    pub api_key: Option<String>,
    pub model: String,
    pub server_port: u16,
    pub max_concurrent_agents: usize,
    pub max_tokens: u32,
    pub temperature: f64,
}

impl Default for McpConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            api_key: None,
            model: "claude-sonnet-4-5-20250929".to_string(),
            server_port: 3100,
            max_concurrent_agents: 5,
            max_tokens: 4096,
            temperature: 0.3,
        }
    }
}
