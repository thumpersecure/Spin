//! UI Module
//!
//! iced-based native GUI replacing the former React + Tauri WebView frontend.
//! Zero NPM, zero JavaScript — pure Rust from pixel to persistence.
//!
//! Architecture (Elm-like):
//!   SpinApp  ──update(Message)──▶  new state
//!   SpinApp  ──view()──────────▶  Element<Message>
//!   Task::perform(async fn)  ──▶  Message (async results from service layer)

pub mod app;
pub mod messages;
pub mod state;
pub mod theme;
pub mod views;
