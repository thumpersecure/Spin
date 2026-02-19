//! OSINT panel — phone / email / username / domain analysis.
//!
//! Replaces OsintPanel.tsx from the React frontend.

use iced::{
    widget::{button, column, container, row, rule, scrollable, text, text_input},
    Alignment, Element, Fill, Length, Padding,
};

use crate::ui::messages::Message;
use crate::ui::state::{AppState, OsintMode};
use crate::ui::theme::colors;
use crate::ui::views::identity::{active_btn_style, ghost_btn_style, input_style, panel_header};

pub fn osint_panel(state: &AppState) -> Element<Message> {
    let header = panel_header("OSINT Tools");

    // Mode tabs
    let modes = [OsintMode::Phone, OsintMode::Email, OsintMode::Username, OsintMode::Domain];
    let mut mode_row = row![].spacing(4);
    for mode in &modes {
        let is_active = state.osint_mode == *mode;
        mode_row = mode_row.push(
            button(text(mode.label()).size(11).color(if is_active {
                colors::TEXT
            } else {
                colors::TEXT_MUTED
            }))
            .on_press(Message::OsintModeChanged(mode.clone()))
            .padding(Padding::new(4.0).left(10.0).right(10.0))
            .style(move |_theme, _status| button::Style {
                background: Some(iced::Background::Color(if is_active {
                    colors::PURPLE
                } else {
                    colors::BG_INPUT
                })),
                text_color: colors::TEXT,
                border: iced::Border {
                    color: colors::BORDER,
                    width: 1.0,
                    radius: 4.0.into(),
                },
                ..Default::default()
            }),
        );
    }

    // Search input + run button
    let placeholder = match state.osint_mode {
        OsintMode::Phone => "+1 555 123 4567",
        OsintMode::Email => "user@example.com",
        OsintMode::Username => "johndoe",
        OsintMode::Domain => "example.com",
    };

    let input = text_input(placeholder, &state.osint_query)
        .on_input(Message::OsintQueryChanged)
        .on_submit(Message::RunOsint)
        .size(12)
        .padding(Padding::new(8.0))
        .style(input_style);

    let run_btn = button(text("Analyze").size(12))
        .on_press(Message::RunOsint)
        .padding(Padding::new(8.0).left(14.0).right(14.0))
        .style(active_btn_style);

    let search_row = row![input.width(Fill), run_btn]
        .spacing(6)
        .align_y(Alignment::Center);

    // Results
    let results: Element<Message> = if state.osint_loading {
        text("Analyzing…").size(12).color(colors::TEXT_MUTED).into()
    } else if let Some(result) = &state.osint_result {
        let mut col = column![].spacing(8);

        // Summary rows
        let mut summary_col = column![].spacing(4);
        for (label, value) in &result.summary {
            summary_col = summary_col.push(
                row![
                    text(label.as_str()).size(11).color(colors::TEXT_MUTED).width(120),
                    text(value.as_str()).size(12).color(colors::TEXT),
                ]
                .spacing(8),
            );
        }
        col = col.push(container(summary_col).padding(Padding::new(12.0)).style(|_| {
            iced::widget::container::Style {
                background: Some(iced::Background::Color(colors::BG_INPUT)),
                border: iced::Border {
                    color: colors::BORDER,
                    width: 1.0,
                    radius: 6.0.into(),
                },
                ..Default::default()
            }
        }));

        // Search links
        if !result.search_links.is_empty() {
            col = col.push(text("Search Links").size(11).color(colors::TEXT_MUTED));
            for (platform, url) in &result.search_links {
                col = col.push(
                    row![
                        text("→").size(11).color(colors::PURPLE),
                        text(platform.as_str()).size(11).color(colors::TEXT).width(120),
                        text(truncate(url, 30)).size(10).color(colors::TEXT_MUTED),
                    ]
                    .spacing(6)
                    .align_y(Alignment::Center),
                );
            }
        }

        scrollable(container(col).padding(Padding::new(12.0)))
            .height(Fill)
            .into()
    } else {
        container(
            text("Enter a query and click Analyze.")
                .size(12)
                .color(colors::TEXT_MUTED),
        )
        .padding(Padding::new(12.0))
        .into()
    };

    column![
        container(
            column![header, mode_row, search_row].spacing(8)
        )
        .padding(Padding::new(12.0)),
        rule::Rule::horizontal(1),
        results,
    ]
    .height(Fill)
    .into()
}

fn truncate(s: &str, max: usize) -> String {
    if s.len() > max {
        format!("{}…", &s[..max])
    } else {
        s.to_string()
    }
}
