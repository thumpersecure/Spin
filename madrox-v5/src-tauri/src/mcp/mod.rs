//! MCP (Model Context Protocol) Module
//!
//! Integration with AI agents for enhanced OSINT capabilities.
//! The MCP server provides Claude-powered sub-agents with specialized skills.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
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

/// Initialize the MCP system
pub fn init(_app_handle: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    tracing::info!("Initializing MCP (Model Context Protocol) system");

    // Mark as initialized
    MCP_INITIALIZED.store(true, std::sync::atomic::Ordering::SeqCst);

    // In a full implementation, this would:
    // 1. Start the MCP server
    // 2. Register available tools/skills
    // 3. Connect to Claude API if configured

    tracing::info!("MCP system ready with {} agents", 5);

    Ok(())
}

/// Check if MCP is initialized
pub fn is_initialized() -> bool {
    MCP_INITIALIZED.load(std::sync::atomic::Ordering::SeqCst)
}

/// MCP configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpConfig {
    pub enabled: bool,
    pub api_key: Option<String>,
    pub server_port: u16,
    pub max_concurrent_agents: usize,
}

impl Default for McpConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            api_key: None,
            server_port: 3100,
            max_concurrent_agents: 5,
        }
    }
}
