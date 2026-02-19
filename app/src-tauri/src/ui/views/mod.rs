//! View functions — one per major UI region.
//!
//! Each module exposes a single public function that takes `&AppState`
//! (or relevant slice of it) and returns `Element<Message>`.

pub mod browser_view;
pub mod identity;
pub mod hivemind;
pub mod investigation;
pub mod layout;
pub mod mcp;
pub mod nav_bar;
pub mod osint;
pub mod privacy;
pub mod settings;
pub mod side_panel;
pub mod tab_bar;
pub mod title_bar;
