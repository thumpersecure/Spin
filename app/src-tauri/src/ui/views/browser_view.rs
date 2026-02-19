//! Browser content area.
//!
//! The actual page is rendered by a `wry` WebView that is created in
//! `browser::engine` and positioned to fill this region of the window.
//! This iced view renders the surrounding chrome and state overlay only.
//!
//! The WebView is a child-window positioned below the nav bar and beside
//! the sidebar. When the window resizes, `browser::engine` repositions
//! the WebView to match.

use iced::{
    widget::{center, column, container, text},
    Element, Fill, Length,
};

use crate::ui::messages::Message;
use crate::ui::state::AppState;
use crate::ui::theme::colors;

pub fn browser_view(state: &AppState) -> Element<Message> {
    let current_url = state
        .tabs
        .get(state.active_tab)
        .map(|t| t.url.as_str())
        .unwrap_or("about:blank");

    let is_loading = state
        .tabs
        .get(state.active_tab)
        .map(|t| t.loading)
        .unwrap_or(false);

    let overlay = if current_url == "about:blank" {
        column![
            text("Spin").size(48).color(colors::PURPLE),
            text("Jessica Jones Edition").size(16).color(colors::TEXT_MUTED),
            text("").size(8),
            text("Enter a URL or search query above.")
                .size(13)
                .color(colors::TEXT_MUTED),
        ]
        .spacing(4)
        .align_x(iced::Alignment::Center)
    } else if is_loading {
        column![
            text("Loading…").size(16).color(colors::TEXT_MUTED),
        ]
        .align_x(iced::Alignment::Center)
    } else {
        // Page is loaded — wry WebView fills this space natively.
        // This iced surface remains transparent / empty in that case.
        column![].into()
    };

    container(center(overlay))
        .width(Fill)
        .height(Fill)
        .style(|_theme| iced::widget::container::Style {
            background: Some(iced::Background::Color(colors::BG)),
            ..Default::default()
        })
        .into()
}
