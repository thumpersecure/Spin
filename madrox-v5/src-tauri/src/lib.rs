//! MADROX v12.0.0 "Jessica Jones" - OSINT Investigation Browser
//!
//! A privacy-first OSINT browser with embedded Chromium (CEF), multi-identity
//! session isolation, investigation timeline/graph visualization, and
//! Claude-powered MCP agents.
//!
//! "Every case starts with a question. Every answer leads to another."

pub mod cef;
pub mod commands;
pub mod core;
pub mod hivemind;
pub mod investigation;
pub mod mcp;
pub mod session;
pub mod storage;

use tauri::Manager;
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

/// Initialize the MADROX Jessica Jones application
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::fmt::layer())
        .with(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    info!("Initializing MADROX v12.0.0 - Jessica Jones");

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            info!("Setting up MADROX Jessica Jones...");

            let app_handle = app.handle().clone();

            // Initialize storage
            storage::init(&app_handle)?;

            // Initialize CEF (Chromium Embedded Framework)
            cef::init(&app_handle)?;

            // Initialize session cloning module
            session::init(&app_handle)?;

            // Initialize Hivemind sync
            hivemind::init(&app_handle)?;

            // Initialize investigation timeline module
            investigation::init(&app_handle)?;

            // Initialize MCP server with Claude API
            mcp::init(&app_handle)?;

            info!("MADROX Jessica Jones ready. Case file open.");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Identity commands
            commands::identity::get_all_identities,
            commands::identity::create_identity,
            commands::identity::delete_identity,
            commands::identity::switch_identity,
            commands::identity::get_active_identity,
            commands::identity::update_identity,

            // Hivemind commands
            commands::hivemind::get_all_entities,
            commands::hivemind::add_entity,
            commands::hivemind::get_entity_sources,
            commands::hivemind::get_cross_references,
            commands::hivemind::extract_entities_from_text,
            commands::hivemind::clear_entities,

            // Browser commands (legacy fallback)
            commands::browser::navigate,
            commands::browser::go_back,
            commands::browser::go_forward,
            commands::browser::reload,
            commands::browser::get_page_content,

            // CEF browser commands (Chromium)
            commands::cef::create_browser_context,
            commands::cef::cef_navigate,
            commands::cef::cef_go_back,
            commands::cef::cef_go_forward,
            commands::cef::cef_reload,
            commands::cef::get_browser_instance,
            commands::cef::get_navigation_history,
            commands::cef::destroy_browser_context,
            commands::cef::get_fingerprint_script,

            // Session cloning commands
            commands::session::clone_session,
            commands::session::get_session_data,
            commands::session::export_session,
            commands::session::import_session,
            commands::session::clear_session,

            // Investigation timeline & graph commands
            commands::investigation::create_investigation,
            commands::investigation::get_all_investigations,
            commands::investigation::get_investigation,
            commands::investigation::add_timeline_event,
            commands::investigation::add_graph_node,
            commands::investigation::add_graph_edge,
            commands::investigation::get_investigation_graph,
            commands::investigation::get_investigation_timeline,
            commands::investigation::update_investigation_status,
            commands::investigation::delete_investigation,
            commands::investigation::export_investigation,

            // MCP commands (with Claude API)
            commands::mcp::get_agents,
            commands::mcp::invoke_agent,
            commands::mcp::get_agent_skills,
            commands::mcp::execute_skill,
            commands::mcp::set_claude_api_key,
            commands::mcp::get_claude_status,
            commands::mcp::clear_claude_history,
            commands::mcp::set_claude_model,

            // OSINT commands
            commands::osint::analyze_phone,
            commands::osint::analyze_email,
            commands::osint::analyze_username,
            commands::osint::analyze_domain,
            commands::osint::get_osint_bookmarks,

            // Privacy commands
            commands::privacy::get_privacy_settings,
            commands::privacy::set_privacy_settings,
            commands::privacy::set_opsec_level,
            commands::privacy::get_opsec_level,
            commands::privacy::assess_site_risk,
            commands::privacy::auto_adjust_privacy,
            commands::privacy::get_privacy_stats,
            commands::privacy::record_blocked_tracker,
            commands::privacy::record_blocked_fingerprint,
            commands::privacy::get_site_assessments,
            commands::privacy::clear_privacy_stats,
        ])
        .run(tauri::generate_context!())
        .expect("error while running MADROX");
}
