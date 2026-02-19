//! Spin v12.0.3 "Jessica Jones" — OSINT Investigation Browser
//!
//! Zero NPM, zero JavaScript. Pure Rust frontend via iced 0.13.
//! Browser pane backed by wry (WebView). Business logic unchanged.
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
pub mod ui;

use std::path::PathBuf;
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

/// Launch the Spin application (called from `main.rs`).
///
/// 1. Initialises logging.
/// 2. Resolves the platform data directory (replaces `AppHandle::path()`).
/// 3. Boots all backend modules (storage → CEF → session → hivemind → investigation → MCP).
/// 4. Runs the iced GUI event loop.
pub fn run() -> iced::Result {
    // ── Tracing ────────────────────────────────────────────────────────────
    tracing_subscriber::registry()
        .with(tracing_subscriber::fmt::layer())
        .with(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    info!("Initialising Spin v12.0.3 — Jessica Jones");

    // ── Platform data directory ────────────────────────────────────────────
    // Replaces tauri::AppHandle::path().app_data_dir()
    let data_dir: PathBuf = dirs::data_local_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("spin");

    std::fs::create_dir_all(&data_dir)
        .expect("Failed to create Spin data directory");

    info!("Data directory: {:?}", data_dir);

    // ── Storage (sled) ─────────────────────────────────────────────────────
    storage::init(&data_dir).expect("Failed to initialise storage");

    // ── CEF (Chromium Embedded Framework) ──────────────────────────────────
    cef::init(&data_dir).expect("Failed to initialise CEF");

    // ── Session cloning ────────────────────────────────────────────────────
    session::init().expect("Failed to initialise session module");

    // ── Hivemind (entity sync) ─────────────────────────────────────────────
    hivemind::init().expect("Failed to initialise Hivemind");

    // ── Investigation timeline ─────────────────────────────────────────────
    investigation::init().expect("Failed to initialise investigation module");

    // ── MCP / Claude API ───────────────────────────────────────────────────
    mcp::init().expect("Failed to initialise MCP");

    info!("All modules ready. Case file open.");

    // ── iced GUI ───────────────────────────────────────────────────────────
    iced::application(
        ui::app::SpinApp::title,
        ui::app::SpinApp::update,
        ui::app::SpinApp::view,
    )
    .theme(ui::app::SpinApp::theme)
    .subscription(ui::app::SpinApp::subscription)
    .window(iced::window::Settings {
        size: iced::Size::new(1400.0, 900.0),
        min_size: Some(iced::Size::new(1000.0, 700.0)),
        decorations: false,
        transparent: false,
        ..Default::default()
    })
    .run_with(ui::app::SpinApp::new)
}
