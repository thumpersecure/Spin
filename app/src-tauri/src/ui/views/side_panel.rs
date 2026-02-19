//! Sidebar — icon nav strip + active panel content.
//!
//! Replaces SidePanel.tsx + the panel-routing in App.tsx.

use iced::{
    widget::{button, column, container, row, text, vertical_rule},
    Element, Fill, Padding,
};

use crate::ui::messages::Message;
use crate::ui::state::{ActivePanel, AppState};
use crate::ui::theme::colors;
use crate::ui::views;

pub fn side_panel(state: &AppState) -> Element<Message> {
    // Icon strip (always visible)
    let icon_strip = nav_icons(state);

    if state.sidebar_collapsed {
        return container(icon_strip)
            .width(48)
            .height(Fill)
            .style(panel_style)
            .into();
    }

    // Panel content
    let content: Element<Message> = match &state.active_panel {
        ActivePanel::Identity => views::identity::identity_panel(state),
        ActivePanel::Hivemind => views::hivemind::hivemind_panel(state),
        ActivePanel::Mcp => views::mcp::mcp_panel(state),
        ActivePanel::Osint => views::osint::osint_panel(state),
        ActivePanel::Privacy => views::privacy::privacy_panel(state),
        ActivePanel::Investigation => views::investigation::investigation_panel(state),
        ActivePanel::Settings => views::settings::settings_panel(state),
    };

    let sidebar = row![
        icon_strip,
        container(vertical_rule(1)).style(|_| iced::widget::container::Style {
            background: Some(iced::Background::Color(colors::BORDER)),
            ..Default::default()
        }),
        container(content).width(Fill).height(Fill),
    ]
    .height(Fill);

    container(sidebar)
        .width(280)
        .height(Fill)
        .style(panel_style)
        .into()
}

fn nav_icons<'a>(state: &AppState) -> Element<'a, Message> {
    let icons: &[(&str, ActivePanel, &str)] = &[
        ("ID", ActivePanel::Identity, "Identities"),
        ("HM", ActivePanel::Hivemind, "Hivemind"),
        ("AI", ActivePanel::Mcp, "MCP Agents"),
        ("OS", ActivePanel::Osint, "OSINT"),
        ("PR", ActivePanel::Privacy, "Privacy"),
        ("IN", ActivePanel::Investigation, "Investigation"),
        ("ST", ActivePanel::Settings, "Settings"),
    ];

    let mut col = column![].spacing(2).padding(Padding::new(4.0));

    for (label, panel, _tooltip) in icons {
        let is_active = state.active_panel == *panel;
        let btn = button(
            text(*label)
                .size(10)
                .color(if is_active { colors::PURPLE } else { colors::TEXT_MUTED }),
        )
        .on_press(Message::ShowPanel(panel.clone()))
        .padding(Padding::new(8.0))
        .width(40)
        .style(move |_theme, _status| button::Style {
            background: Some(iced::Background::Color(if is_active {
                colors::BG_INPUT
            } else {
                iced::Color::TRANSPARENT
            })),
            border: iced::Border {
                radius: 4.0.into(),
                ..Default::default()
            },
            ..Default::default()
        });
        col = col.push(btn);
    }

    container(col).width(48).height(Fill).into()
}

fn panel_style(_theme: &iced::Theme) -> iced::widget::container::Style {
    iced::widget::container::Style {
        background: Some(iced::Background::Color(colors::BG_PANEL)),
        border: iced::Border {
            color: colors::BORDER,
            width: 1.0,
            radius: 0.0.into(),
        },
        ..Default::default()
    }
}
