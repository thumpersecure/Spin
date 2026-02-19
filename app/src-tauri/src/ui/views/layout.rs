//! Main application layout.
//!
//! Structure:
//!   ┌─────────────────────────────────────────┐
//!   │  TitleBar (custom, frameless)           │
//!   ├──────────┬──────────────────────────────┤
//!   │ SidePanel│  TabBar                      │
//!   │          ├──────────────────────────────┤
//!   │  (icons +│  NavBar (URL bar + controls)  │
//!   │   panel  ├──────────────────────────────┤
//!   │  content)│  BrowserView (wry WebView)   │
//!   │          │                              │
//!   └──────────┴──────────────────────────────┘

use iced::{
    widget::{column, container, row},
    Element, Fill, Length,
};

use crate::ui::messages::Message;
use crate::ui::state::AppState;
use crate::ui::views::{browser_view, nav_bar, side_panel, tab_bar, title_bar};
use crate::ui::theme::colors;

pub fn main_layout(state: &AppState) -> Element<Message> {
    let sidebar_width = if state.sidebar_collapsed { 48.0 } else { 280.0 };

    let chrome = column![
        // Custom title bar (frameless window drag area)
        title_bar::title_bar(state),
        // Main content area
        row![
            // Left sidebar: nav icons + active panel
            side_panel::side_panel(state),
            // Right area: tabs + URL bar + browser view
            column![
                tab_bar::tab_bar(state),
                nav_bar::nav_bar(state),
                browser_view::browser_view(state),
            ]
            .width(Fill),
        ]
        .height(Fill),
    ];

    container(chrome)
        .width(Fill)
        .height(Fill)
        .style(|_theme| iced::widget::container::Style {
            background: Some(iced::Background::Color(colors::BG)),
            ..Default::default()
        })
        .into()
}
