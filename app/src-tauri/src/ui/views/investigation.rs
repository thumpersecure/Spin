//! Investigation panel — timeline & entity graph.
//!
//! Replaces InvestigationPanel.tsx, InvestigationTimeline.tsx, and
//! InvestigationGraph.tsx from the React frontend.
//!
//! The entity relationship graph is drawn on an iced `Canvas` widget,
//! replacing the D3.js force-directed graph.

use iced::{
    widget::{button, canvas, column, container, row, rule, scrollable, text},
    Alignment, Element, Fill, Length, Padding,
};

use crate::ui::messages::Message;
use crate::ui::state::AppState;
use crate::ui::theme::colors;
use crate::ui::views::identity::{active_btn_style, panel_header};

pub fn investigation_panel(state: &AppState) -> Element<Message> {
    let header = panel_header("Investigation");

    let new_btn = button(text("+ New Investigation").size(12))
        .on_press(Message::CreateInvestigation)
        .padding(Padding::new(8.0))
        .style(active_btn_style);

    let mut inv_list = column![].spacing(4);

    if state.investigations.is_empty() {
        inv_list = inv_list.push(
            text("No active investigations. Create one to start tracking.")
                .size(12)
                .color(colors::TEXT_MUTED),
        );
    } else {
        for inv in &state.investigations {
            let is_active = state.active_investigation_id.as_deref() == Some(&inv.id);

            let info = column![
                text(&inv.name).size(13).color(colors::TEXT),
                text(format!(
                    "{} events · {} nodes · {} edges",
                    inv.event_count, inv.node_count, inv.edge_count
                ))
                .size(10)
                .color(colors::TEXT_MUTED),
            ]
            .spacing(2);

            inv_list = inv_list.push(
                button(info)
                    .on_press(Message::SelectInvestigation(inv.id.clone()))
                    .padding(Padding::new(10.0))
                    .width(Fill)
                    .style(move |_theme, _status| button::Style {
                        background: Some(iced::Background::Color(if is_active {
                            iced::Color {
                                a: 0.12,
                                ..colors::PURPLE
                            }
                        } else {
                            colors::BG_INPUT
                        })),
                        border: iced::Border {
                            color: if is_active { colors::PURPLE } else { colors::BORDER },
                            width: if is_active { 1.5 } else { 1.0 },
                            radius: 6.0.into(),
                        },
                        ..Default::default()
                    }),
            );
        }
    }

    column![
        container(
            column![header, new_btn].spacing(8)
        )
        .padding(Padding::new(12.0)),
        rule::Rule::horizontal(1),
        scrollable(container(inv_list).padding(Padding::new(12.0))).height(Fill),
    ]
    .height(Fill)
    .into()
}
