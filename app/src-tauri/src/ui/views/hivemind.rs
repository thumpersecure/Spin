//! Hivemind panel — collective entity intelligence.
//!
//! Replaces HivemindPanel.tsx from the React frontend.

use iced::{
    widget::{button, column, container, row, rule, scrollable, text},
    Alignment, Element, Fill, Length, Padding,
};

use crate::core::entity::EntityType;
use crate::ui::messages::Message;
use crate::ui::state::AppState;
use crate::ui::theme::colors;
use crate::ui::views::identity::{active_btn_style, ghost_btn_style, panel_header};

pub fn hivemind_panel(state: &AppState) -> Element<Message> {
    let header = panel_header("Hivemind");

    let stats = text(format!(
        "{} entities | {} identities",
        state.entities.len(),
        state.identities.len()
    ))
    .size(11)
    .color(colors::TEXT_MUTED);

    let extract_btn = button(text("Extract from page").size(12))
        .on_press(Message::ExtractEntities)
        .padding(Padding::new(8.0))
        .style(active_btn_style);

    let clear_btn = button(text("Clear all").size(12).color(colors::DANGER))
        .on_press(Message::ClearEntities)
        .padding(Padding::new(8.0))
        .style(ghost_btn_style);

    let controls = row![extract_btn, clear_btn].spacing(8);

    let mut entity_list = column![].spacing(4);

    if state.entities.is_empty() {
        entity_list = entity_list.push(
            text("No entities yet. Browse pages and extract entities.")
                .size(12)
                .color(colors::TEXT_MUTED),
        );
    } else {
        for entity in &state.entities {
            let type_label = entity_type_label(&entity.entity_type);
            let type_color = entity_type_color(&entity.entity_type);

            let row_view = row![
                container(text(type_label).size(10).color(type_color))
                    .padding(Padding::new(2.0).left(6.0).right(6.0))
                    .style(|_| iced::widget::container::Style {
                        background: Some(iced::Background::Color(iced::Color {
                            a: 0.15,
                            ..type_color
                        })),
                        border: iced::Border {
                            color: type_color,
                            width: 1.0,
                            radius: 3.0.into(),
                        },
                        ..Default::default()
                    }),
                column![
                    text(&entity.value).size(12).color(colors::TEXT),
                    text(format!("×{}", entity.occurrence_count))
                        .size(10)
                        .color(colors::TEXT_MUTED),
                ]
                .spacing(2)
                .width(Fill),
            ]
            .spacing(8)
            .align_y(Alignment::Center);

            entity_list = entity_list.push(
                container(row_view)
                    .padding(Padding::new(8.0))
                    .style(|_| iced::widget::container::Style {
                        background: Some(iced::Background::Color(colors::BG_INPUT)),
                        border: iced::Border {
                            color: colors::BORDER,
                            width: 1.0,
                            radius: 6.0.into(),
                        },
                        ..Default::default()
                    }),
            );
        }
    }

    column![
        container(
            column![header, stats].spacing(4)
        )
        .padding(Padding::new(12.0)),
        container(controls).padding(Padding::new(0.0).left(12.0).bottom(8.0)),
        rule::Rule::horizontal(1),
        scrollable(
            container(entity_list).padding(Padding::new(12.0))
        )
        .height(Fill),
    ]
    .height(Fill)
    .into()
}

fn entity_type_label(et: &EntityType) -> &'static str {
    match et {
        EntityType::Email => "EMAIL",
        EntityType::Phone => "PHONE",
        EntityType::IpV4 => "IPv4",
        EntityType::IpV6 => "IPv6",
        EntityType::Domain => "DOMAIN",
        EntityType::Url => "URL",
        EntityType::Username => "USER",
        EntityType::BitcoinAddress => "BTC",
        EntityType::EthereumAddress => "ETH",
        EntityType::CreditCard => "CC",
        EntityType::Ssn => "SSN",
        EntityType::Date => "DATE",
        EntityType::Coordinates => "GEO",
        EntityType::MacAddress => "MAC",
        EntityType::Uuid => "UUID",
        EntityType::Hashtag => "#TAG",
        EntityType::SocialHandle => "@USER",
        EntityType::Custom(_) => "CUSTOM",
        _ => "OTHER",
    }
}

fn entity_type_color(et: &EntityType) -> iced::Color {
    match et {
        EntityType::Email => iced::Color::from_rgb(0.486, 0.227, 0.929),
        EntityType::Phone => iced::Color::from_rgb(0.063, 0.725, 0.506),
        EntityType::IpV4 | EntityType::IpV6 => iced::Color::from_rgb(0.961, 0.620, 0.044),
        EntityType::Domain | EntityType::Url => iced::Color::from_rgb(0.267, 0.565, 0.961),
        EntityType::BitcoinAddress | EntityType::EthereumAddress => {
            iced::Color::from_rgb(0.937, 0.780, 0.267)
        }
        _ => colors::TEXT_MUTED,
    }
}
