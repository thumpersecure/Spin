//! Navigation bar — URL input + back/forward/reload.
//!
//! Replaces NavBar.tsx from the React frontend.

use iced::{
    widget::{button, container, row, text, text_input},
    Element, Fill, Padding,
};

use crate::ui::messages::Message;
use crate::ui::state::AppState;
use crate::ui::theme::colors;

pub fn nav_bar(state: &AppState) -> Element<Message> {
    let btn_style = |_theme: &iced::Theme, _status: button::Status| button::Style {
        background: None,
        text_color: colors::TEXT_MUTED,
        border: iced::Border {
            radius: 4.0.into(),
            ..Default::default()
        },
        ..Default::default()
    };

    let back = button(text("←").size(16).color(colors::TEXT_MUTED))
        .on_press(Message::GoBack)
        .padding(Padding::new(6.0).left(10.0).right(10.0))
        .style(btn_style);

    let forward = button(text("→").size(16).color(colors::TEXT_MUTED))
        .on_press(Message::GoForward)
        .padding(Padding::new(6.0).left(10.0).right(10.0))
        .style(btn_style);

    let reload = button(text("↺").size(16).color(colors::TEXT_MUTED))
        .on_press(Message::Reload)
        .padding(Padding::new(6.0).left(10.0).right(10.0))
        .style(btn_style);

    // OPSEC level indicator
    let opsec_color = opsec_color(&state.opsec_level);
    let opsec_label = text(format!(
        "[{}]",
        crate::ui::views::privacy::opsec_name(&state.opsec_level)
    ))
    .size(11)
    .color(opsec_color);

    let url_input = text_input("Enter URL or search…", &state.url_bar)
        .on_input(Message::UrlBarChanged)
        .on_submit(Message::Navigate)
        .size(13)
        .padding(Padding::new(6.0).left(12.0))
        .style(|_theme, _status| text_input::Style {
            background: iced::Background::Color(colors::BG_INPUT),
            border: iced::Border {
                color: colors::BORDER,
                width: 1.0,
                radius: 4.0.into(),
            },
            icon: colors::TEXT_MUTED,
            placeholder: colors::TEXT_MUTED,
            value: colors::TEXT,
            selection: colors::PURPLE,
        });

    let go = button(text("Go").size(12).color(colors::TEXT))
        .on_press(Message::Navigate)
        .padding(Padding::new(6.0).left(14.0).right(14.0))
        .style(|_theme, _status| button::Style {
            background: Some(iced::Background::Color(colors::PURPLE)),
            text_color: colors::TEXT,
            border: iced::Border {
                radius: 4.0.into(),
                ..Default::default()
            },
            ..Default::default()
        });

    let bar = row![
        back,
        forward,
        reload,
        url_input.width(Fill),
        opsec_label,
        go,
    ]
    .spacing(4)
    .padding(Padding::new(6.0))
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

fn opsec_color(level: &crate::ui::state::OpsecLevel) -> iced::Color {
    use crate::core::privacy_engine::OpsecLevel;
    match level {
        OpsecLevel::Minimal => iced::Color::from_rgb(0.4, 0.4, 0.4),
        OpsecLevel::Standard => iced::Color::from_rgb(0.063, 0.725, 0.506),
        OpsecLevel::Enhanced => iced::Color::from_rgb(0.961, 0.620, 0.044),
        OpsecLevel::Maximum => iced::Color::from_rgb(0.937, 0.400, 0.267),
        OpsecLevel::Paranoid => iced::Color::from_rgb(0.937, 0.267, 0.267),
    }
}
