//! MCP panel — Claude AI agent chat.
//!
//! Replaces McpPanel.tsx from the React frontend.

use iced::{
    widget::{button, column, container, row, rule, scrollable, text, text_input},
    Alignment, Element, Fill, Length, Padding,
};

use crate::ui::messages::Message;
use crate::ui::state::{AppState, ChatRole};
use crate::ui::theme::colors;
use crate::ui::views::identity::{active_btn_style, ghost_btn_style, input_style, panel_header};

pub fn mcp_panel(state: &AppState) -> Element<Message> {
    let header = panel_header("MCP Agents");

    // Agent selector
    let agent_btns: Element<Message> = if state.agents.is_empty() {
        text("No agents available. Configure Claude API key in Settings.")
            .size(11)
            .color(colors::TEXT_MUTED)
            .into()
    } else {
        let mut btns = row![].spacing(4).wrap();
        for agent in &state.agents {
            let is_selected = state.selected_agent.as_deref() == Some(&agent.id);
            btns = btns.push(
                button(text(&agent.name).size(11).color(if is_selected {
                    colors::TEXT
                } else {
                    colors::TEXT_MUTED
                }))
                .on_press(Message::SelectAgent(agent.id.clone()))
                .padding(Padding::new(4.0).left(10.0).right(10.0))
                .style(move |_theme, _status| button::Style {
                    background: Some(iced::Background::Color(if is_selected {
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
        btns.into()
    };

    // Chat history
    let mut chat_col = column![].spacing(8);

    if state.chat_history.is_empty() {
        chat_col = chat_col.push(
            text("Select an agent and start investigating.")
                .size(12)
                .color(colors::TEXT_MUTED),
        );
    } else {
        for entry in &state.chat_history {
            let (role_label, role_color, bg_color) = match entry.role {
                ChatRole::User => ("You", colors::PURPLE_LIGHT, colors::BG_INPUT),
                ChatRole::Agent => {
                    let name = entry.agent_name.as_deref().unwrap_or("Agent");
                    (name, colors::SUCCESS, colors::BG_PANEL)
                }
                ChatRole::System => ("System", colors::TEXT_MUTED, colors::BG),
            };

            let bubble = column![
                text(role_label).size(10).color(role_color),
                text(&entry.content).size(12).color(colors::TEXT),
            ]
            .spacing(2);

            chat_col = chat_col.push(
                container(bubble)
                    .padding(Padding::new(10.0))
                    .width(Fill)
                    .style(move |_| iced::widget::container::Style {
                        background: Some(iced::Background::Color(bg_color)),
                        border: iced::Border {
                            color: colors::BORDER,
                            width: 1.0,
                            radius: 6.0.into(),
                        },
                        ..Default::default()
                    }),
            );
        }

        if state.mcp_loading {
            chat_col = chat_col.push(
                text("Agent is thinking…").size(11).color(colors::TEXT_MUTED),
            );
        }
    }

    // Input row
    let chat_input = text_input("Message the agent…", &state.chat_input)
        .on_input(Message::ChatInputChanged)
        .on_submit(Message::SendMessage)
        .size(12)
        .padding(Padding::new(8.0))
        .style(input_style);

    let send_btn = button(text("Send").size(12))
        .on_press(Message::SendMessage)
        .padding(Padding::new(8.0).left(14.0).right(14.0))
        .style(active_btn_style);

    let input_row = row![chat_input.width(Fill), send_btn]
        .spacing(6)
        .align_y(Alignment::Center);

    column![
        container(column![header, agent_btns].spacing(8)).padding(Padding::new(12.0)),
        rule::Rule::horizontal(1),
        scrollable(container(chat_col).padding(Padding::new(12.0))).height(Fill),
        rule::Rule::horizontal(1),
        container(input_row).padding(Padding::new(8.0)),
    ]
    .height(Fill)
    .into()
}

// Allow row to wrap (iced 0.13)
trait RowWrap {
    fn wrap(self) -> Self;
}
impl<'a, Message: Clone + 'a> RowWrap for iced::widget::Row<'a, Message> {
    fn wrap(self) -> Self {
        self // iced 0.13: wrapping rows via Flex are WIP; this is a no-op for now
    }
}
