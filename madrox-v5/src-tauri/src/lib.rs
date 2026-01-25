//! MADROX v5.0 - The Multiple Man OSINT Browser
//!
//! Like Jamie Madrox, this browser can spawn multiple identities (dupes)
//! that work independently while sharing intelligence through the Hivemind.

pub mod commands;
pub mod core;
pub mod hivemind;
pub mod mcp;
pub mod storage;

use tauri::Manager;
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

/// Initialize the MADROX application
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::fmt::layer())
        .with(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    info!("Initializing MADROX v5.0 - The Multiple Man");

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            info!("Setting up MADROX...");

            // Initialize storage
            let app_handle = app.handle().clone();
            storage::init(&app_handle)?;

            // Initialize Hivemind sync
            hivemind::init(&app_handle)?;

            // Initialize MCP server
            mcp::init(&app_handle)?;

            info!("MADROX ready. Prime identity active.");
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

            // Browser commands
            commands::browser::navigate,
            commands::browser::go_back,
            commands::browser::go_forward,
            commands::browser::reload,
            commands::browser::get_page_content,

            // MCP commands
            commands::mcp::get_agents,
            commands::mcp::invoke_agent,
            commands::mcp::get_agent_skills,
            commands::mcp::execute_skill,

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
