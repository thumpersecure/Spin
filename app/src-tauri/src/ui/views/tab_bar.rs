//! Browser tab bar.
//!
//! Replaces TabBar.tsx from the React frontend.

use iced::{
    widget::{button, container, horizontal_space, row, scrollable, text},
    Element, Fill, Padding,
};

use crate::ui::messages::Message;
use crate::ui::state::AppState;
use crate::ui::theme::colors;

pub fn tab_bar(state: &AppState) -> Element<Message> {
    let mut tabs_row = row![].spacing(2).padding(Padding::new(0.0).left(4.0));

    for (i, tab) in state.tabs.iter().enumerate() {
        let is_active = i == state.active_tab;
        let label = if tab.title.len() > 22 {
            format!("{}…", &tab.title[..22])
        } else {
            tab.title.clone()
        };

        let tab_btn = button(
            row![
                text(label).size(12).color(if is_active {
                    colors::TEXT
                } else {
                    colors::TEXT_MUTED
                }),
            ]
            .spacing(4),
        )
        .on_press(Message::SelectTab(i))
        .padding(Padding::ZERO.top(6.0).bottom(6.0).left(10.0).right(4.0))
        .style(move |_theme, _status| {
            let base = button::Style {
                background: Some(iced::Background::Color(if is_active {
                    colors::BG_INPUT
                } else {
                    iced::Color::TRANSPARENT
                })),
                text_color: colors::TEXT,
                border: iced::Border {
                    radius: 4.0.into(),
                    ..Default::default()
                },
                ..Default::default()
            };
            base
        });

        let close_btn = button(text("×").size(11).color(colors::TEXT_MUTED))
            .on_press(Message::CloseTab(i))
            .padding(Padding::new(4.0))
            .style(|_theme, _status| button::Style {
                background: None,
                text_color: colors::TEXT_MUTED,
                ..Default::default()
            });

        tabs_row = tabs_row.push(row![tab_btn, close_btn].align_y(iced::Alignment::Center));
    }

    let new_tab = button(text("+").size(14).color(colors::TEXT_MUTED))
        .on_press(Message::NewTab)
        .padding(Padding::new(4.0).left(8.0).right(8.0))
        .style(|_theme, _status| button::Style {
            background: None,
            text_color: colors::TEXT_MUTED,
            ..Default::default()
        });

    let bar = row![
        scrollable(tabs_row).direction(scrollable::Direction::Horizontal(Default::default())),
        horizontal_space(),
        new_tab,
    ]
    .height(34)
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
