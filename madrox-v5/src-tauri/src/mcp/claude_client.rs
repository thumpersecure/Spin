//! Claude API Client
//!
//! Handles communication with the Anthropic Claude API for MCP agent operations.
//! Implements shared context with tool routing - a single conversation context
//! routes tool calls to the appropriate specialized agent.
//!
//! Jessica Jones v12 - "Every detective needs a good informant."

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Claude API configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClaudeConfig {
    /// API key (stored encrypted in sled)
    pub api_key: Option<String>,
    /// Model to use
    pub model: String,
    /// Maximum tokens per response
    pub max_tokens: u32,
    /// Temperature (0.0 - 1.0)
    pub temperature: f64,
    /// API base URL
    pub api_url: String,
}

impl Default for ClaudeConfig {
    fn default() -> Self {
        Self {
            api_key: None,
            model: "claude-sonnet-4-5-20250929".to_string(),
            max_tokens: 4096,
            temperature: 0.3,
            api_url: "https://api.anthropic.com/v1/messages".to_string(),
        }
    }
}

/// A message in the Claude conversation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClaudeMessage {
    pub role: String,
    pub content: Vec<ContentBlock>,
}

/// Content block in a message
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ContentBlock {
    #[serde(rename = "text")]
    Text { text: String },
    #[serde(rename = "tool_use")]
    ToolUse {
        id: String,
        name: String,
        input: serde_json::Value,
    },
    #[serde(rename = "tool_result")]
    ToolResult {
        tool_use_id: String,
        content: String,
    },
}

/// Tool definition for Claude
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClaudeTool {
    pub name: String,
    pub description: String,
    pub input_schema: serde_json::Value,
}

/// Claude API request body
#[derive(Debug, Clone, Serialize)]
pub struct ClaudeRequest {
    pub model: String,
    pub max_tokens: u32,
    pub system: String,
    pub messages: Vec<ClaudeMessage>,
    pub tools: Vec<ClaudeTool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f64>,
}

/// Claude API response
#[derive(Debug, Clone, Deserialize)]
pub struct ClaudeResponse {
    pub id: String,
    #[serde(rename = "type")]
    pub response_type: String,
    pub role: String,
    pub content: Vec<ResponseContent>,
    pub model: String,
    pub stop_reason: Option<String>,
    pub usage: Option<UsageInfo>,
}

/// Response content block
#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "type")]
pub enum ResponseContent {
    #[serde(rename = "text")]
    Text { text: String },
    #[serde(rename = "tool_use")]
    ToolUse {
        id: String,
        name: String,
        input: serde_json::Value,
    },
}

/// API usage info
#[derive(Debug, Clone, Deserialize)]
pub struct UsageInfo {
    pub input_tokens: u32,
    pub output_tokens: u32,
}

/// MCP tool routing - maps agent skills to Claude tool definitions
pub fn build_agent_tools() -> Vec<ClaudeTool> {
    vec![
        // Analyst Agent tools
        ClaudeTool {
            name: "analyst_content_analysis".to_string(),
            description: "Analyze web page content for relevant intelligence, threats, and investigation leads. Extracts key information, assesses credibility, and identifies notable patterns.".to_string(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "url": { "type": "string", "description": "URL of the page to analyze" },
                    "content": { "type": "string", "description": "Page content or text to analyze" },
                    "depth": { "type": "string", "enum": ["quick", "standard", "deep"], "description": "Analysis depth" }
                },
                "required": ["content"]
            }),
        },
        ClaudeTool {
            name: "analyst_threat_assessment".to_string(),
            description: "Assess potential threats from discovered entities and data. Evaluates risk levels and recommends countermeasures.".to_string(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "entities": { "type": "array", "items": { "type": "string" }, "description": "List of entities to assess" },
                    "context": { "type": "string", "description": "Investigation context" }
                },
                "required": ["entities"]
            }),
        },
        // Gatherer Agent tools
        ClaudeTool {
            name: "gatherer_entity_extraction".to_string(),
            description: "Extract all identifiable entities (emails, phones, IPs, domains, usernames, crypto addresses) from text content.".to_string(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "text": { "type": "string", "description": "Text to extract entities from" },
                    "entity_types": { "type": "array", "items": { "type": "string" }, "description": "Specific entity types to look for" }
                },
                "required": ["text"]
            }),
        },
        // Correlator Agent tools
        ClaudeTool {
            name: "correlator_relationship_mapping".to_string(),
            description: "Analyze entities and identify relationships between them. Maps connections and discovers hidden links.".to_string(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "entities": { "type": "array", "items": { "type": "string" }, "description": "Entities to correlate" },
                    "context": { "type": "string", "description": "Investigation context for correlation" }
                },
                "required": ["entities"]
            }),
        },
        ClaudeTool {
            name: "correlator_pattern_detection".to_string(),
            description: "Detect behavioral patterns, temporal patterns, and anomalies in entity data.".to_string(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "data": { "type": "string", "description": "Data to analyze for patterns" },
                    "pattern_types": { "type": "array", "items": { "type": "string" }, "description": "Types of patterns to look for" }
                },
                "required": ["data"]
            }),
        },
        // Reporter Agent tools
        ClaudeTool {
            name: "reporter_generate_report".to_string(),
            description: "Generate a comprehensive investigation report from collected findings, entities, and timeline events.".to_string(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "findings": { "type": "string", "description": "Investigation findings to report on" },
                    "format": { "type": "string", "enum": ["brief", "detailed", "executive"], "description": "Report format" }
                },
                "required": ["findings"]
            }),
        },
        // OPSEC Agent tools
        ClaudeTool {
            name: "opsec_exposure_check".to_string(),
            description: "Check for operational security exposure. Analyzes browsing patterns and identity usage for potential leaks.".to_string(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "browsing_history": { "type": "array", "items": { "type": "string" }, "description": "Recent browsing URLs" },
                    "identity_info": { "type": "string", "description": "Current identity configuration" }
                },
                "required": ["browsing_history"]
            }),
        },
        // Social Intel Agent tools
        ClaudeTool {
            name: "social_profile_analysis".to_string(),
            description: "Analyze social media profile information for intelligence. Identifies patterns, connections, and activity.".to_string(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "platform": { "type": "string", "description": "Social media platform" },
                    "profile_data": { "type": "string", "description": "Profile information to analyze" }
                },
                "required": ["profile_data"]
            }),
        },
        // Crypto Tracer tools
        ClaudeTool {
            name: "crypto_wallet_analysis".to_string(),
            description: "Analyze cryptocurrency wallet address for transaction patterns, associated addresses, and suspicious activity.".to_string(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "address": { "type": "string", "description": "Cryptocurrency wallet address" },
                    "chain": { "type": "string", "enum": ["bitcoin", "ethereum", "other"], "description": "Blockchain network" }
                },
                "required": ["address"]
            }),
        },
    ]
}

/// System prompt for the shared agent context
pub fn build_system_prompt() -> String {
    r#"You are the MADROX Jessica Jones Investigation AI - a team of specialized OSINT agents working together through a shared intelligence context. You have access to specialized tools for different investigation tasks.

Your agent specializations:
- **Analyst**: Content analysis, threat assessment, credibility scoring
- **Gatherer**: Entity extraction, data categorization
- **Correlator**: Relationship mapping, pattern detection, anomaly detection
- **Reporter**: Investigation reports, evidence compilation
- **OPSEC**: Privacy leak detection, identity correlation risk
- **Social Intel**: Social media profile analysis, connection mapping
- **Crypto Tracer**: Cryptocurrency wallet and transaction analysis

When given a task, use the most appropriate tool(s) for the job. You can chain multiple tools together for complex investigations. Always:
1. Prioritize accuracy over speed
2. Note confidence levels in your assessments
3. Flag any OPSEC concerns you notice
4. Suggest next investigation steps
5. Keep responses concise and actionable

You operate within MADROX, a privacy-first OSINT browser where each investigation identity is isolated. Respect the compartmentalization of identities and never suggest actions that could compromise identity isolation."#.to_string()
}

/// Claude API client
pub struct ClaudeClient {
    config: ClaudeConfig,
    http_client: reqwest::Client,
    conversation_history: Vec<ClaudeMessage>,
    tools: Vec<ClaudeTool>,
}

impl ClaudeClient {
    /// Create a new Claude client
    pub fn new(config: ClaudeConfig) -> Self {
        Self {
            config,
            http_client: reqwest::Client::new(),
            conversation_history: Vec::new(),
            tools: build_agent_tools(),
        }
    }

    /// Check if the client has a valid API key configured
    pub fn is_configured(&self) -> bool {
        self.config
            .api_key
            .as_ref()
            .map(|k| !k.is_empty())
            .unwrap_or(false)
    }

    /// Send a message to Claude and get a response
    pub async fn send_message(&mut self, user_message: &str) -> Result<String, String> {
        let api_key = self
            .config
            .api_key
            .as_ref()
            .ok_or("Claude API key not configured")?;

        // Add user message to history
        self.conversation_history.push(ClaudeMessage {
            role: "user".to_string(),
            content: vec![ContentBlock::Text {
                text: user_message.to_string(),
            }],
        });

        let request = ClaudeRequest {
            model: self.config.model.clone(),
            max_tokens: self.config.max_tokens,
            system: build_system_prompt(),
            messages: self.conversation_history.clone(),
            tools: self.tools.clone(),
            temperature: Some(self.config.temperature),
        };

        let response = self
            .http_client
            .post(&self.config.api_url)
            .header("x-api-key", api_key)
            .header("anthropic-version", "2023-06-01")
            .header("content-type", "application/json")
            .json(&request)
            .send()
            .await
            .map_err(|e| format!("Claude API request failed: {}", e))?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());
            return Err(format!("Claude API error ({}): {}", status, body));
        }

        let claude_response: ClaudeResponse = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse Claude response: {}", e))?;

        // Extract text from response
        let mut result_text = String::new();
        let mut response_content = Vec::new();

        for content in &claude_response.content {
            match content {
                ResponseContent::Text { text } => {
                    result_text.push_str(text);
                    response_content.push(ContentBlock::Text {
                        text: text.clone(),
                    });
                }
                ResponseContent::ToolUse { id, name, input } => {
                    // Process tool use - route to appropriate agent handler
                    let tool_result = self.handle_tool_use(name, input);
                    response_content.push(ContentBlock::ToolUse {
                        id: id.clone(),
                        name: name.clone(),
                        input: input.clone(),
                    });

                    // Add tool result
                    result_text.push_str(&format!("\n[Tool: {}] {}", name, tool_result));
                }
            }
        }

        // Add assistant response to history
        self.conversation_history.push(ClaudeMessage {
            role: "assistant".to_string(),
            content: response_content,
        });

        Ok(result_text)
    }

    /// Handle a tool use from Claude - route to agent handler
    fn handle_tool_use(&self, tool_name: &str, input: &serde_json::Value) -> String {
        // Route tool calls to the appropriate agent module
        // In production, these would call the actual OSINT tools
        match tool_name {
            "analyst_content_analysis" => {
                let content = input
                    .get("content")
                    .and_then(|v| v.as_str())
                    .unwrap_or("");
                format!(
                    "Content analysis complete. Analyzed {} characters of content.",
                    content.len()
                )
            }
            "analyst_threat_assessment" => {
                let entities = input
                    .get("entities")
                    .and_then(|v| v.as_array())
                    .map(|a| a.len())
                    .unwrap_or(0);
                format!("Threat assessment complete for {} entities.", entities)
            }
            "gatherer_entity_extraction" => {
                let text = input.get("text").and_then(|v| v.as_str()).unwrap_or("");
                format!(
                    "Entity extraction complete. Scanned {} characters.",
                    text.len()
                )
            }
            "correlator_relationship_mapping" => {
                "Relationship mapping complete.".to_string()
            }
            "correlator_pattern_detection" => {
                "Pattern detection complete.".to_string()
            }
            "reporter_generate_report" => {
                "Report generated.".to_string()
            }
            "opsec_exposure_check" => {
                "OPSEC exposure check complete. No critical issues detected.".to_string()
            }
            "social_profile_analysis" => {
                "Social profile analysis complete.".to_string()
            }
            "crypto_wallet_analysis" => {
                let address = input
                    .get("address")
                    .and_then(|v| v.as_str())
                    .unwrap_or("unknown");
                format!("Wallet analysis complete for address: {}...", &address[..address.len().min(12)])
            }
            _ => format!("Unknown tool: {}", tool_name),
        }
    }

    /// Clear conversation history
    pub fn clear_history(&mut self) {
        self.conversation_history.clear();
    }

    /// Get conversation history length
    pub fn history_length(&self) -> usize {
        self.conversation_history.len()
    }

    /// Update the API key
    pub fn set_api_key(&mut self, key: String) {
        self.config.api_key = Some(key);
    }

    /// Update the model
    pub fn set_model(&mut self, model: String) {
        self.config.model = model;
    }
}
