//! MCP (Model Context Protocol) Commands
//!
//! Integration with AI agents for enhanced OSINT capabilities.
//! The MCP server provides Claude-powered sub-agents with specialized skills.

use crate::mcp::{self, Agent, AgentSkill, AgentInvocation, AgentResponse};
use serde::{Deserialize, Serialize};
use tracing::{info, debug};

/// Result type for MCP operations
pub type McpResult<T> = Result<T, String>;

/// Get all available agents
#[tauri::command]
pub async fn get_agents() -> McpResult<Vec<Agent>> {
    info!("Fetching available MCP agents");

    let agents = vec![
        Agent {
            id: "analyst".to_string(),
            name: "Analyst Agent".to_string(),
            description: "Interprets page content and suggests investigation paths".to_string(),
            status: crate::mcp::AgentStatus::Ready,
            skills: vec![
                "content_analysis".to_string(),
                "path_suggestion".to_string(),
                "threat_assessment".to_string(),
                "sentiment_analysis".to_string(),
                "credibility_scoring".to_string(),
            ],
            icon: "brain".to_string(),
        },
        Agent {
            id: "gatherer".to_string(),
            name: "Gatherer Agent".to_string(),
            description: "Automated entity extraction and categorization".to_string(),
            status: crate::mcp::AgentStatus::Ready,
            skills: vec![
                "entity_extraction".to_string(),
                "data_categorization".to_string(),
                "source_validation".to_string(),
                "deep_scraping".to_string(),
                "archive_search".to_string(),
            ],
            icon: "search".to_string(),
        },
        Agent {
            id: "correlator".to_string(),
            name: "Correlator Agent".to_string(),
            description: "Finds relationships between entities across sources".to_string(),
            status: crate::mcp::AgentStatus::Ready,
            skills: vec![
                "relationship_mapping".to_string(),
                "pattern_detection".to_string(),
                "timeline_analysis".to_string(),
                "network_visualization".to_string(),
                "anomaly_detection".to_string(),
            ],
            icon: "network".to_string(),
        },
        Agent {
            id: "reporter".to_string(),
            name: "Reporter Agent".to_string(),
            description: "Generates comprehensive investigation reports".to_string(),
            status: crate::mcp::AgentStatus::Ready,
            skills: vec![
                "report_generation".to_string(),
                "evidence_compilation".to_string(),
                "executive_summary".to_string(),
                "export_pdf".to_string(),
                "export_json".to_string(),
            ],
            icon: "file-text".to_string(),
        },
        Agent {
            id: "opsec".to_string(),
            name: "OPSEC Agent".to_string(),
            description: "Monitors for privacy leaks and operational security".to_string(),
            status: crate::mcp::AgentStatus::Ready,
            skills: vec![
                "leak_detection".to_string(),
                "fingerprint_analysis".to_string(),
                "exposure_assessment".to_string(),
                "identity_correlation".to_string(),
                "countermeasures".to_string(),
            ],
            icon: "shield".to_string(),
        },
        Agent {
            id: "social".to_string(),
            name: "Social Intel Agent".to_string(),
            description: "Deep social media intelligence and profile analysis".to_string(),
            status: crate::mcp::AgentStatus::Ready,
            skills: vec![
                "profile_analysis".to_string(),
                "connection_mapping".to_string(),
                "activity_timeline".to_string(),
                "username_search".to_string(),
                "cross_platform".to_string(),
            ],
            icon: "users".to_string(),
        },
        Agent {
            id: "darkweb".to_string(),
            name: "Dark Web Agent".to_string(),
            description: "Tor/dark web intelligence gathering and monitoring".to_string(),
            status: crate::mcp::AgentStatus::Ready,
            skills: vec![
                "onion_crawl".to_string(),
                "market_monitoring".to_string(),
                "paste_search".to_string(),
                "breach_lookup".to_string(),
                "forum_intel".to_string(),
            ],
            icon: "ghost".to_string(),
        },
        Agent {
            id: "crypto".to_string(),
            name: "Crypto Tracer Agent".to_string(),
            description: "Cryptocurrency wallet and transaction analysis".to_string(),
            status: crate::mcp::AgentStatus::Ready,
            skills: vec![
                "wallet_analysis".to_string(),
                "transaction_trace".to_string(),
                "exchange_detection".to_string(),
                "mixer_detection".to_string(),
                "address_clustering".to_string(),
            ],
            icon: "currency-bitcoin".to_string(),
        },
    ];

    Ok(agents)
}

/// Invoke an agent with a task (routes through Claude API shared context)
#[tauri::command]
pub async fn invoke_agent(
    invocation: AgentInvocation,
) -> McpResult<AgentResponse> {
    info!("Invoking agent {} with task: {}", invocation.agent_id, invocation.task);

    // Try Claude API if configured
    if mcp::is_claude_configured() {
        let prompt = format!(
            "[Agent: {}] Task: {}\n\nContext: {}",
            invocation.agent_id,
            invocation.task,
            invocation
                .context
                .as_ref()
                .map(|c| serde_json::to_string(c).unwrap_or_default())
                .unwrap_or_else(|| "No additional context".to_string())
        );

        match mcp::with_claude_client(|client| {
            let rt = tokio::runtime::Handle::current();
            rt.block_on(async { client.send_message(&prompt).await })
        }) {
            Ok(response) => {
                return Ok(AgentResponse {
                    agent_id: invocation.agent_id,
                    task: invocation.task,
                    result: response,
                    confidence: 0.85,
                    suggestions: vec![
                        "Review the analysis results".to_string(),
                        "Cross-reference with other sources".to_string(),
                    ],
                    entities_found: vec![],
                    timestamp: chrono::Utc::now(),
                });
            }
            Err(e) => {
                info!("Claude API call failed, using fallback: {}", e);
            }
        }
    }

    // Fallback response when Claude API is not available
    Ok(AgentResponse {
        agent_id: invocation.agent_id,
        task: invocation.task,
        result: "Configure your Claude API key in Settings to enable AI-powered agent analysis. Go to the Settings panel and enter your Anthropic API key.".to_string(),
        confidence: 0.0,
        suggestions: vec![
            "Set up Claude API key in Settings".to_string(),
            "Get an API key at console.anthropic.com".to_string(),
        ],
        entities_found: vec![],
        timestamp: chrono::Utc::now(),
    })
}

/// Get available skills for an agent
#[tauri::command]
pub async fn get_agent_skills(agent_id: String) -> McpResult<Vec<AgentSkill>> {
    debug!("Getting skills for agent: {}", agent_id);

    let skills = match agent_id.as_str() {
        "analyst" => vec![
            AgentSkill {
                id: "content_analysis".to_string(),
                name: "Content Analysis".to_string(),
                description: "Analyze page content for relevant intelligence".to_string(),
                parameters: vec!["url".to_string(), "depth".to_string()],
            },
            AgentSkill {
                id: "path_suggestion".to_string(),
                name: "Path Suggestion".to_string(),
                description: "Suggest next steps in the investigation".to_string(),
                parameters: vec!["current_findings".to_string()],
            },
            AgentSkill {
                id: "threat_assessment".to_string(),
                name: "Threat Assessment".to_string(),
                description: "Assess potential threats from discovered entities".to_string(),
                parameters: vec!["entities".to_string()],
            },
            AgentSkill {
                id: "sentiment_analysis".to_string(),
                name: "Sentiment Analysis".to_string(),
                description: "Analyze emotional tone and intent in content".to_string(),
                parameters: vec!["text".to_string()],
            },
            AgentSkill {
                id: "credibility_scoring".to_string(),
                name: "Credibility Scoring".to_string(),
                description: "Score source credibility based on multiple factors".to_string(),
                parameters: vec!["source_url".to_string(), "content".to_string()],
            },
        ],
        "gatherer" => vec![
            AgentSkill {
                id: "entity_extraction".to_string(),
                name: "Entity Extraction".to_string(),
                description: "Extract entities from text content".to_string(),
                parameters: vec!["text".to_string(), "entity_types".to_string()],
            },
            AgentSkill {
                id: "data_categorization".to_string(),
                name: "Data Categorization".to_string(),
                description: "Categorize extracted data by type and relevance".to_string(),
                parameters: vec!["data".to_string()],
            },
            AgentSkill {
                id: "deep_scraping".to_string(),
                name: "Deep Scraping".to_string(),
                description: "Recursively scrape linked pages for intelligence".to_string(),
                parameters: vec!["url".to_string(), "max_depth".to_string(), "filters".to_string()],
            },
            AgentSkill {
                id: "archive_search".to_string(),
                name: "Archive Search".to_string(),
                description: "Search internet archives for historical versions".to_string(),
                parameters: vec!["url".to_string(), "date_range".to_string()],
            },
        ],
        "correlator" => vec![
            AgentSkill {
                id: "relationship_mapping".to_string(),
                name: "Relationship Mapping".to_string(),
                description: "Map relationships between entities".to_string(),
                parameters: vec!["entities".to_string()],
            },
            AgentSkill {
                id: "pattern_detection".to_string(),
                name: "Pattern Detection".to_string(),
                description: "Detect patterns in entity occurrences".to_string(),
                parameters: vec!["entity_history".to_string()],
            },
            AgentSkill {
                id: "network_visualization".to_string(),
                name: "Network Visualization".to_string(),
                description: "Generate visual network graphs of relationships".to_string(),
                parameters: vec!["entities".to_string(), "layout".to_string()],
            },
            AgentSkill {
                id: "anomaly_detection".to_string(),
                name: "Anomaly Detection".to_string(),
                description: "Identify unusual patterns or outliers in data".to_string(),
                parameters: vec!["dataset".to_string(), "threshold".to_string()],
            },
        ],
        "reporter" => vec![
            AgentSkill {
                id: "report_generation".to_string(),
                name: "Report Generation".to_string(),
                description: "Generate a comprehensive investigation report".to_string(),
                parameters: vec!["investigation_id".to_string(), "format".to_string()],
            },
            AgentSkill {
                id: "evidence_compilation".to_string(),
                name: "Evidence Compilation".to_string(),
                description: "Compile and organize all evidence with citations".to_string(),
                parameters: vec!["investigation_id".to_string()],
            },
            AgentSkill {
                id: "executive_summary".to_string(),
                name: "Executive Summary".to_string(),
                description: "Generate concise executive summary for stakeholders".to_string(),
                parameters: vec!["investigation_id".to_string(), "max_length".to_string()],
            },
            AgentSkill {
                id: "export_pdf".to_string(),
                name: "Export to PDF".to_string(),
                description: "Export investigation report as PDF document".to_string(),
                parameters: vec!["report_id".to_string()],
            },
            AgentSkill {
                id: "export_json".to_string(),
                name: "Export to JSON".to_string(),
                description: "Export investigation data as structured JSON".to_string(),
                parameters: vec!["investigation_id".to_string()],
            },
        ],
        "opsec" => vec![
            AgentSkill {
                id: "leak_detection".to_string(),
                name: "Leak Detection".to_string(),
                description: "Detect potential information leaks".to_string(),
                parameters: vec!["session_data".to_string()],
            },
            AgentSkill {
                id: "fingerprint_analysis".to_string(),
                name: "Fingerprint Analysis".to_string(),
                description: "Analyze browser fingerprint exposure".to_string(),
                parameters: vec!["fingerprint".to_string()],
            },
            AgentSkill {
                id: "exposure_assessment".to_string(),
                name: "Exposure Assessment".to_string(),
                description: "Assess overall identity exposure risk".to_string(),
                parameters: vec!["identity_id".to_string()],
            },
            AgentSkill {
                id: "identity_correlation".to_string(),
                name: "Identity Correlation Risk".to_string(),
                description: "Detect if identities can be linked together".to_string(),
                parameters: vec!["identity_ids".to_string()],
            },
            AgentSkill {
                id: "countermeasures".to_string(),
                name: "Countermeasures".to_string(),
                description: "Suggest privacy countermeasures based on threats".to_string(),
                parameters: vec!["threats".to_string()],
            },
        ],
        "social" => vec![
            AgentSkill {
                id: "profile_analysis".to_string(),
                name: "Profile Analysis".to_string(),
                description: "Deep analysis of social media profile".to_string(),
                parameters: vec!["platform".to_string(), "username".to_string()],
            },
            AgentSkill {
                id: "connection_mapping".to_string(),
                name: "Connection Mapping".to_string(),
                description: "Map social connections and network".to_string(),
                parameters: vec!["profile_url".to_string(), "depth".to_string()],
            },
            AgentSkill {
                id: "activity_timeline".to_string(),
                name: "Activity Timeline".to_string(),
                description: "Generate timeline of public activity".to_string(),
                parameters: vec!["profile_url".to_string(), "date_range".to_string()],
            },
            AgentSkill {
                id: "username_search".to_string(),
                name: "Username Search".to_string(),
                description: "Search for username across 500+ platforms".to_string(),
                parameters: vec!["username".to_string()],
            },
            AgentSkill {
                id: "cross_platform".to_string(),
                name: "Cross-Platform Intel".to_string(),
                description: "Correlate identities across platforms".to_string(),
                parameters: vec!["identifiers".to_string()],
            },
        ],
        "darkweb" => vec![
            AgentSkill {
                id: "onion_crawl".to_string(),
                name: "Onion Crawl".to_string(),
                description: "Crawl .onion sites for intelligence".to_string(),
                parameters: vec!["onion_url".to_string(), "keywords".to_string()],
            },
            AgentSkill {
                id: "market_monitoring".to_string(),
                name: "Market Monitoring".to_string(),
                description: "Monitor dark web marketplaces for keywords".to_string(),
                parameters: vec!["keywords".to_string(), "markets".to_string()],
            },
            AgentSkill {
                id: "paste_search".to_string(),
                name: "Paste Site Search".to_string(),
                description: "Search paste sites for leaked data".to_string(),
                parameters: vec!["query".to_string(), "sites".to_string()],
            },
            AgentSkill {
                id: "breach_lookup".to_string(),
                name: "Breach Lookup".to_string(),
                description: "Check if credentials appear in known breaches".to_string(),
                parameters: vec!["email".to_string()],
            },
            AgentSkill {
                id: "forum_intel".to_string(),
                name: "Forum Intelligence".to_string(),
                description: "Gather intelligence from dark web forums".to_string(),
                parameters: vec!["forum_url".to_string(), "topic".to_string()],
            },
        ],
        "crypto" => vec![
            AgentSkill {
                id: "wallet_analysis".to_string(),
                name: "Wallet Analysis".to_string(),
                description: "Analyze cryptocurrency wallet activity".to_string(),
                parameters: vec!["address".to_string(), "chain".to_string()],
            },
            AgentSkill {
                id: "transaction_trace".to_string(),
                name: "Transaction Trace".to_string(),
                description: "Trace transaction flow through blockchain".to_string(),
                parameters: vec!["tx_hash".to_string(), "hops".to_string()],
            },
            AgentSkill {
                id: "exchange_detection".to_string(),
                name: "Exchange Detection".to_string(),
                description: "Detect if address belongs to known exchange".to_string(),
                parameters: vec!["address".to_string()],
            },
            AgentSkill {
                id: "mixer_detection".to_string(),
                name: "Mixer Detection".to_string(),
                description: "Detect usage of coin mixing services".to_string(),
                parameters: vec!["address".to_string()],
            },
            AgentSkill {
                id: "address_clustering".to_string(),
                name: "Address Clustering".to_string(),
                description: "Cluster addresses likely owned by same entity".to_string(),
                parameters: vec!["address".to_string()],
            },
        ],
        _ => vec![],
    };

    Ok(skills)
}

/// Execute a specific skill
#[tauri::command]
pub async fn execute_skill(
    agent_id: String,
    skill_id: String,
    parameters: serde_json::Value,
) -> McpResult<serde_json::Value> {
    info!("Executing skill {} on agent {} with params: {:?}", skill_id, agent_id, parameters);

    // Route to Claude API if configured
    if mcp::is_claude_configured() {
        let prompt = format!(
            "Execute the '{}' skill from the '{}' agent with these parameters: {}",
            skill_id,
            agent_id,
            serde_json::to_string_pretty(&parameters).unwrap_or_default()
        );

        let result = mcp::with_claude_client(|client| {
            // Use tokio runtime for async
            let rt = tokio::runtime::Handle::current();
            rt.block_on(async { client.send_message(&prompt).await })
        });

        match result {
            Ok(response) => {
                return Ok(serde_json::json!({
                    "status": "executed",
                    "agent_id": agent_id,
                    "skill_id": skill_id,
                    "result": response,
                    "source": "claude_api"
                }));
            }
            Err(e) => {
                info!("Claude API unavailable, using fallback: {}", e);
            }
        }
    }

    // Fallback when Claude API is not configured
    Ok(serde_json::json!({
        "status": "executed",
        "agent_id": agent_id,
        "skill_id": skill_id,
        "result": "Configure Claude API key in settings to enable AI-powered agent responses.",
        "source": "fallback"
    }))
}

/// Set the Claude API key
#[tauri::command]
pub async fn set_claude_api_key(api_key: String) -> McpResult<bool> {
    info!("Setting Claude API key");

    if api_key.trim().is_empty() {
        return Err("API key cannot be empty".to_string());
    }

    mcp::with_claude_client(|client| {
        client.set_api_key(api_key);
        Ok(true)
    })
}

/// Get Claude API connection status
#[tauri::command]
pub async fn get_claude_status() -> McpResult<serde_json::Value> {
    let configured = mcp::is_claude_configured();
    let history_len = mcp::with_claude_client(|client| Ok(client.history_length()))
        .unwrap_or(0);

    Ok(serde_json::json!({
        "configured": configured,
        "model": "claude-sonnet-4-5-20250929",
        "conversation_history_length": history_len,
        "status": if configured { "ready" } else { "needs_api_key" }
    }))
}

/// Clear Claude conversation history
#[tauri::command]
pub async fn clear_claude_history() -> McpResult<()> {
    info!("Clearing Claude conversation history");
    mcp::with_claude_client(|client| {
        client.clear_history();
        Ok(())
    })
}

/// Set Claude model
#[tauri::command]
pub async fn set_claude_model(model: String) -> McpResult<()> {
    info!("Setting Claude model to: {}", model);
    mcp::with_claude_client(|client| {
        client.set_model(model);
        Ok(())
    })
}
