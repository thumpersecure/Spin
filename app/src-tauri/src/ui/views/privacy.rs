//! Privacy dashboard — OPSEC level selector + stats.
//!
//! Replaces PrivacyDashboard.tsx from the React frontend.

use iced::{
    widget::{button, column, container, row, rule, text},
    Alignment, Element, Fill, Padding,
};

use crate::core::privacy_engine::OpsecLevel;
use crate::ui::messages::Message;
use crate::ui::state::AppState;
use crate::ui::theme::colors;
use crate::ui::views::identity::panel_header;

pub fn privacy_panel(state: &AppState) -> Element<Message> {
    let header = panel_header("Privacy Dashboard");

    let levels = [
        OpsecLevel::Minimal,
        OpsecLevel::Standard,
        OpsecLevel::Enhanced,
        OpsecLevel::Maximum,
        OpsecLevel::Paranoid,
    ];

    let mut level_col = column![].spacing(6);

    for level in &levels {
        let is_active = state.opsec_level == *level;
        let color = level_color(level);
        let name = opsec_name(level);

        let indicator = container(text("")).width(4).height(40).style(move |_| {
            iced::widget::container::Style {
                background: Some(iced::Background::Color(color)),
                ..Default::default()
            }
        });

        let info = column![
            text(name).size(13).color(if is_active { color } else { colors::TEXT }),
            text(level.description()).size(10).color(colors::TEXT_MUTED),
        ]
        .spacing(2)
        .width(Fill);

        let card = button(row![indicator, info].spacing(10).align_y(Alignment::Center))
            .on_press(Message::SetOpsecLevel(level.clone()))
            .padding(Padding::new(10.0))
            .width(Fill)
            .style(move |_theme, _status| button::Style {
                background: Some(iced::Background::Color(if is_active {
                    iced::Color { a: 0.12, ..color }
                } else {
                    colors::BG_INPUT
                })),
                border: iced::Border {
                    color: if is_active { color } else { colors::BORDER },
                    width: if is_active { 1.5 } else { 1.0 },
                    radius: 6.0.into(),
                },
                ..Default::default()
            });

        level_col = level_col.push(card);
    }

    let active_summary = column![
        text("Active level").size(10).color(colors::TEXT_MUTED),
        text(opsec_name(&state.opsec_level))
            .size(16)
            .color(level_color(&state.opsec_level)),
        text(state.opsec_level.description())
            .size(11)
            .color(colors::TEXT_MUTED),
    ]
    .spacing(4);

    column![
        container(column![header, active_summary].spacing(10)).padding(Padding::new(12.0)),
        rule::Rule::horizontal(1),
        container(level_col).padding(Padding::new(12.0)),
    ]
    .height(Fill)
    .into()
}

pub fn opsec_name(level: &OpsecLevel) -> &'static str {
    match level {
        OpsecLevel::Minimal => "Minimal",
        OpsecLevel::Standard => "Standard",
        OpsecLevel::Enhanced => "Enhanced",
        OpsecLevel::Maximum => "Maximum",
        OpsecLevel::Paranoid => "Paranoid",
    }
}

fn level_color(level: &OpsecLevel) -> iced::Color {
    match level {
        OpsecLevel::Minimal => colors::TEXT_MUTED,
        OpsecLevel::Standard => colors::SUCCESS,
        OpsecLevel::Enhanced => iced::Color::from_rgb(0.961, 0.620, 0.044),
        OpsecLevel::Maximum => iced::Color::from_rgb(0.937, 0.400, 0.267),
        OpsecLevel::Paranoid => colors::DANGER,
    }
}
