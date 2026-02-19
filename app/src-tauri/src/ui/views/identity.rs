//! Identity panel — manage dupes.
//!
//! Replaces IdentityPanel.tsx from the React frontend.

use iced::{
    widget::{button, column, container, row, rule, scrollable, text, text_input},
    Alignment, Element, Fill, Length, Padding,
};

use crate::ui::messages::Message;
use crate::ui::state::AppState;
use crate::ui::theme::colors;

pub fn identity_panel(state: &AppState) -> Element<Message> {
    let header = panel_header("Identities");

    // List of identities
    let mut list = column![].spacing(4);

    if state.identities.is_empty() {
        list = list.push(
            text("No identities yet. Create one below.")
                .size(12)
                .color(colors::TEXT_MUTED),
        );
    } else {
        for identity in &state.identities {
            let is_active = state
                .active_identity
                .as_ref()
                .map(|a| a.id == identity.id)
                .unwrap_or(false);

            let status_dot = text(if is_active { "●" } else { "○" })
                .size(10)
                .color(if is_active { colors::SUCCESS } else { colors::TEXT_MUTED });

            let name = text(&identity.name)
                .size(13)
                .color(if is_active { colors::TEXT } else { colors::TEXT_MUTED });

            let fingerprint_hint = text(format!("fp:{}", &identity.fingerprint.id[..8]))
                .size(10)
                .color(colors::TEXT_MUTED);

            let switch_btn = button(text("Use").size(11))
                .on_press(Message::SwitchIdentity(identity.id.clone()))
                .padding(Padding::new(4.0).left(8.0).right(8.0))
                .style(active_btn_style);

            let delete_btn = if !identity.is_prime() {
                Some(
                    button(text("✕").size(11).color(colors::DANGER))
                        .on_press(Message::DeleteIdentity(identity.id.clone()))
                        .padding(Padding::new(4.0))
                        .style(ghost_btn_style),
                )
            } else {
                None
            };

            let mut row_content = row![
                status_dot,
                column![name, fingerprint_hint].spacing(2).width(Fill),
                switch_btn,
            ]
            .spacing(6)
            .align_y(Alignment::Center);

            if let Some(del) = delete_btn {
                row_content = row_content.push(del);
            }

            list = list.push(
                container(row_content)
                    .padding(Padding::new(8.0))
                    .style(card_style),
            );
        }
    }

    // Create new identity
    let new_input = text_input("New identity name…", &state.new_identity_name)
        .on_input(Message::NewIdentityNameChanged)
        .on_submit(Message::CreateIdentity)
        .size(12)
        .padding(Padding::new(8.0))
        .style(input_style);

    let create_btn = button(text("+ Create Dupe").size(12).color(colors::TEXT))
        .on_press(Message::CreateIdentity)
        .padding(Padding::new(8.0))
        .width(Fill)
        .style(active_btn_style);

    column![
        header,
        rule::Rule::horizontal(1),
        scrollable(list).height(Fill),
        rule::Rule::horizontal(1),
        column![new_input, create_btn].spacing(6).padding(Padding::new(8.0)),
    ]
    .height(Fill)
    .into()
}

// ── Shared widget helpers ──────────────────────────────────────────────────

pub fn panel_header(title: &str) -> iced::widget::Text {
    text(title)
        .size(13)
        .color(colors::TEXT)
}

fn card_style(_theme: &iced::Theme) -> iced::widget::container::Style {
    iced::widget::container::Style {
        background: Some(iced::Background::Color(colors::BG_INPUT)),
        border: iced::Border {
            color: colors::BORDER,
            width: 1.0,
            radius: 6.0.into(),
        },
        ..Default::default()
    }
}

pub fn active_btn_style(_theme: &iced::Theme, _status: button::Status) -> button::Style {
    button::Style {
        background: Some(iced::Background::Color(colors::PURPLE)),
        text_color: colors::TEXT,
        border: iced::Border {
            radius: 4.0.into(),
            ..Default::default()
        },
        ..Default::default()
    }
}

pub fn ghost_btn_style(_theme: &iced::Theme, _status: button::Status) -> button::Style {
    button::Style {
        background: None,
        text_color: colors::TEXT_MUTED,
        ..Default::default()
    }
}

pub fn input_style(_theme: &iced::Theme, _status: text_input::Status) -> text_input::Style {
    text_input::Style {
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
    }
}
