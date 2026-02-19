//! Settings panel — API keys, preferences.
//!
//! Replaces SettingsPanel.tsx from the React frontend.

use iced::{
    widget::{button, column, container, row, rule, text, text_input},
    Alignment, Element, Fill, Padding,
};

use crate::ui::messages::Message;
use crate::ui::state::AppState;
use crate::ui::theme::colors;
use crate::ui::views::identity::{active_btn_style, input_style, panel_header};

pub fn settings_panel(state: &AppState) -> Element<Message> {
    let header = panel_header("Settings");

    // Claude API key section
    let api_label = text("Claude API Key").size(12).color(colors::TEXT_MUTED);

    let api_input = text_input("sk-ant-…", &state.claude_api_key)
        .on_input(Message::ApiKeyChanged)
        .secure(!state.api_key_visible)
        .size(12)
        .padding(Padding::new(8.0))
        .style(input_style);

    let toggle_visibility = button(
        text(if state.api_key_visible { "Hide" } else { "Show" })
            .size(11)
            .color(colors::TEXT_MUTED),
    )
    .on_press(Message::ToggleApiKeyVisibility)
    .padding(Padding::new(8.0))
    .style(|_theme, _status| button::Style {
        background: Some(iced::Background::Color(colors::BG_INPUT)),
        border: iced::Border {
            color: colors::BORDER,
            width: 1.0,
            radius: 4.0.into(),
        },
        ..Default::default()
    });

    let save_btn = button(text("Save").size(12))
        .on_press(Message::SaveApiKey)
        .padding(Padding::new(8.0).left(16.0).right(16.0))
        .style(active_btn_style);

    let api_row = row![api_input.width(Fill), toggle_visibility, save_btn]
        .spacing(6)
        .align_y(Alignment::Center);

    // Version info
    let version = text("Spin v12.1.3 — Jessica Jones Edition")
        .size(11)
        .color(colors::TEXT_MUTED);

    let tagline = text("\"Every case starts with a question.\"")
        .size(11)
        .color(colors::PURPLE_LIGHT);

    let no_npm_badge = container(
        text("Zero NPM · Pure Rust · iced 0.13 · wry")
            .size(10)
            .color(colors::SUCCESS),
    )
    .padding(Padding::new(4.0).left(8.0).right(8.0))
    .style(|_| iced::widget::container::Style {
        background: Some(iced::Background::Color(iced::Color {
            a: 0.1,
            ..colors::SUCCESS
        })),
        border: iced::Border {
            color: colors::SUCCESS,
            width: 1.0,
            radius: 4.0.into(),
        },
        ..Default::default()
    });

    column![
        container(
            column![
                header,
                rule::Rule::horizontal(1),
                column![api_label, api_row].spacing(6),
                rule::Rule::horizontal(1),
                column![version, tagline, no_npm_badge].spacing(6),
            ]
            .spacing(12)
        )
        .padding(Padding::new(12.0)),
    ]
    .height(Fill)
    .into()
}
