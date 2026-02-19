//! Custom title bar (frameless window).
//!
//! Replaces TitleBar.tsx from the React frontend.

use iced::{
    widget::{container, horizontal_space, row, text},
    Element, Fill, Padding,
};

use crate::ui::messages::Message;
use crate::ui::state::AppState;
use crate::ui::theme::colors;

pub fn title_bar(state: &AppState) -> Element<Message> {
    let identity_label = state
        .active_identity
        .as_ref()
        .map(|i| format!(" — {}", i.name))
        .unwrap_or_default();

    let title = text(format!("Spin{}", identity_label))
        .size(13)
        .color(colors::TEXT);

    let status = text(state.status.as_str())
        .size(11)
        .color(colors::TEXT_MUTED);

    let bar = row![
        // Drag region (interactive area for moving window)
        container(
            row![
                title,
                horizontal_space(),
                status,
            ]
            .spacing(8)
        )
        .padding(Padding::new(0.0).left(16.0))
        .width(Fill),
    ]
    .height(32)
    .align_y(iced::Alignment::Center);

    container(bar)
        .width(Fill)
        .style(|_theme| iced::widget::container::Style {
            background: Some(iced::Background::Color(colors::BG_PANEL)),
            border: iced::Border {
                color: colors::BORDER,
                width: 1.0,
                radius: 0.0.into(),
            },
            ..Default::default()
        })
        .into()
}
