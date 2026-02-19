//! Spin Command Handlers
//!
//! Service-layer functions called directly from the iced UI (no IPC needed).
//! Previously exposed over Tauri IPC to the React frontend.
//! Spin v12 - Jessica Jones

pub mod browser;
pub mod cef;
pub mod hivemind;
pub mod identity;
pub mod investigation;
pub mod mcp;
pub mod osint;
pub mod privacy;
pub mod session;
