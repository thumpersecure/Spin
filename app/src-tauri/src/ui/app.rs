//! SpinApp — the root iced Application struct.
//!
//! Replaces the React root component tree and all 9 Redux slices.
//! Every UI event flows through `update()` as a typed `Message`.

use iced::{Element, Subscription, Task, Theme};

use crate::commands;
use crate::mcp::Agent;
use crate::ui::messages::Message;
use crate::ui::state::{AppState, ActivePanel, ChatEntry, ChatRole, OpsecLevel, OsintDisplay, Tab};
use crate::ui::theme;
use crate::ui::views;

pub struct SpinApp {
    pub state: AppState,
}

impl SpinApp {
    // ── Constructor ────────────────────────────────────────────────────────

    pub fn new() -> (Self, Task<Message>) {
        let app = Self {
            state: AppState::default(),
        };

        // Load startup data in parallel via Task::perform chains.
        // Maps to what the React app did on mount with initializeApp thunks.
        let bootstrap = Task::perform(
            async {
                let identities = commands::identity::get_all_identities()
                    .await
                    .unwrap_or_default();
                let entities = commands::hivemind::get_all_entities()
                    .await
                    .unwrap_or_default();
                let agents = commands::mcp::get_agents().await.unwrap_or_default();
                (identities, entities, agents)
            },
            |(identities, entities, agents)| Message::StartupLoaded {
                identities,
                entities,
                agents,
            },
        );

        (app, bootstrap)
    }

    // ── Title ──────────────────────────────────────────────────────────────

    pub fn title(&self) -> String {
        "Spin — Jessica Jones".to_string()
    }

    // ── Theme ──────────────────────────────────────────────────────────────

    pub fn theme(&self) -> Theme {
        theme::spin_theme()
    }

    // ── Subscription ───────────────────────────────────────────────────────

    pub fn subscription(&self) -> Subscription<Message> {
        Subscription::none()
    }

    // ── Update ─────────────────────────────────────────────────────────────

    pub fn update(&mut self, message: Message) -> Task<Message> {
        let s = &mut self.state;

        match message {
            // ── Bootstrap ─────────────────────────────────────────────────
            Message::StartupLoaded {
                identities,
                entities,
                agents,
            } => {
                s.identities = identities;
                s.entities = entities;
                s.agents = agents;
                s.status = "Ready.".to_string();
                s.loading = false;

                // Ensure a Prime identity exists
                if s.identities.is_empty() {
                    return Task::perform(
                        commands::identity::create_identity(
                            commands::identity::CreateIdentityRequest {
                                name: "Prime".to_string(),
                                description: Some("The original identity".to_string()),
                                proxy_config: None,
                            },
                        ),
                        |res| match res {
                            Ok(id) => Message::IdentityCreated(id),
                            Err(e) => Message::StartupError(e),
                        },
                    );
                }

                // Set active identity to first one
                s.active_identity = s.identities.first().cloned();
                Task::none()
            }

            Message::StartupError(e) => {
                s.error = Some(e);
                s.loading = false;
                Task::none()
            }

            // ── Navigation ────────────────────────────────────────────────
            Message::UrlBarChanged(url) => {
                s.url_bar = url;
                Task::none()
            }

            Message::Navigate => {
                let url = normalize_url(&s.url_bar);
                if let Some(tab) = s.tabs.get_mut(s.active_tab) {
                    tab.url = url.clone();
                    tab.title = "Loading…".to_string();
                    tab.loading = true;
                }
                let identity_id = s
                    .active_identity
                    .as_ref()
                    .map(|i| i.id.clone())
                    .unwrap_or_default();

                Task::perform(
                    commands::cef::cef_navigate(identity_id, url.clone()),
                    move |_| Message::TabUpdated {
                        index: 0, // resolved in update
                        title: url.clone(),
                        url: url.clone(),
                    },
                )
            }

            Message::GoBack => {
                let identity_id = s
                    .active_identity
                    .as_ref()
                    .map(|i| i.id.clone())
                    .unwrap_or_default();
                Task::perform(
                    commands::cef::cef_go_back(identity_id),
                    |res| match res {
                        Ok(Some(url)) => Message::UrlBarChanged(url),
                        _ => Message::SetStatus("At beginning of history".to_string()),
                    },
                )
            }

            Message::GoForward => {
                let identity_id = s
                    .active_identity
                    .as_ref()
                    .map(|i| i.id.clone())
                    .unwrap_or_default();
                Task::perform(
                    commands::cef::cef_go_forward(identity_id),
                    |res| match res {
                        Ok(Some(url)) => Message::UrlBarChanged(url),
                        _ => Message::SetStatus("At end of history".to_string()),
                    },
                )
            }

            Message::Reload => {
                let identity_id = s
                    .active_identity
                    .as_ref()
                    .map(|i| i.id.clone())
                    .unwrap_or_default();
                Task::perform(
                    commands::cef::cef_reload(identity_id),
                    |_| Message::SetStatus("Reloaded.".to_string()),
                )
            }

            // ── Tabs ──────────────────────────────────────────────────────
            Message::NewTab => {
                s.tabs.push(Tab::new_tab());
                s.active_tab = s.tabs.len() - 1;
                s.url_bar = String::new();
                Task::none()
            }

            Message::CloseTab(i) => {
                if s.tabs.len() > 1 {
                    s.tabs.remove(i);
                    if s.active_tab >= s.tabs.len() {
                        s.active_tab = s.tabs.len() - 1;
                    }
                }
                Task::none()
            }

            Message::SelectTab(i) => {
                s.active_tab = i;
                if let Some(tab) = s.tabs.get(i) {
                    s.url_bar = tab.url.clone();
                }
                Task::none()
            }

            Message::TabUpdated { index, title, url } => {
                let idx = if index == 0 { s.active_tab } else { index };
                if let Some(tab) = s.tabs.get_mut(idx) {
                    tab.title = title;
                    tab.url = url.clone();
                    tab.loading = false;
                }
                s.url_bar = url;
                Task::none()
            }

            // ── UI layout ─────────────────────────────────────────────────
            Message::ShowPanel(panel) => {
                s.active_panel = panel;
                Task::none()
            }

            Message::ToggleSidebar => {
                s.sidebar_collapsed = !s.sidebar_collapsed;
                Task::none()
            }

            // ── Identity ──────────────────────────────────────────────────
            Message::IdentitiesLoaded(ids) => {
                s.active_identity = ids.first().cloned();
                s.identities = ids;
                Task::none()
            }

            Message::NewIdentityNameChanged(name) => {
                s.new_identity_name = name;
                Task::none()
            }

            Message::CreateIdentity => {
                let name = s.new_identity_name.trim().to_string();
                if name.is_empty() {
                    return Task::none();
                }
                s.new_identity_name.clear();
                Task::perform(
                    commands::identity::create_identity(
                        commands::identity::CreateIdentityRequest {
                            name,
                            description: None,
                            proxy_config: None,
                        },
                    ),
                    |res| match res {
                        Ok(id) => Message::IdentityCreated(id),
                        Err(e) => Message::SetStatus(format!("Error: {}", e)),
                    },
                )
            }

            Message::IdentityCreated(identity) => {
                s.identities.push(identity.clone());
                if s.active_identity.is_none() {
                    s.active_identity = Some(identity);
                }
                Task::none()
            }

            Message::DeleteIdentity(id) => Task::perform(
                commands::identity::delete_identity(id),
                |res| match res {
                    Ok(()) => Message::SetStatus("Identity destroyed.".to_string()),
                    Err(e) => Message::SetStatus(format!("Error: {}", e)),
                },
            ),

            Message::SwitchIdentity(id) => Task::perform(
                commands::identity::switch_identity(id),
                |res| match res {
                    Ok(identity) => Message::IdentitySwitched(identity),
                    Err(e) => Message::SetStatus(format!("Switch failed: {}", e)),
                },
            ),

            Message::IdentitySwitched(identity) => {
                s.active_identity = Some(identity);
                Task::none()
            }

            // ── Hivemind ──────────────────────────────────────────────────
            Message::EntitiesLoaded(entities) => {
                s.entities = entities;
                Task::none()
            }

            Message::ExtractEntities => {
                let url = s.url_bar.clone();
                let identity_id = s
                    .active_identity
                    .as_ref()
                    .map(|i| i.id.clone())
                    .unwrap_or_default();
                Task::perform(
                    commands::hivemind::extract_entities_from_text(
                        format!("Page: {}", url),
                        identity_id,
                        Some(url),
                    ),
                    |res| match res {
                        Ok(entities) => Message::EntitiesLoaded(entities),
                        Err(e) => Message::SetStatus(format!("Extraction error: {}", e)),
                    },
                )
            }

            Message::ClearEntities => Task::perform(
                commands::hivemind::clear_entities(true),
                |res| match res {
                    Ok(()) => Message::EntitiesLoaded(vec![]),
                    Err(e) => Message::SetStatus(format!("Error: {}", e)),
                },
            ),

            // ── MCP ───────────────────────────────────────────────────────
            Message::AgentsLoaded(agents) => {
                s.agents = agents;
                Task::none()
            }

            Message::SelectAgent(id) => {
                s.selected_agent = Some(id);
                Task::none()
            }

            Message::ChatInputChanged(text) => {
                s.chat_input = text;
                Task::none()
            }

            Message::SendMessage => {
                let input = s.chat_input.trim().to_string();
                if input.is_empty() {
                    return Task::none();
                }
                let agent_id = match &s.selected_agent {
                    Some(id) => id.clone(),
                    None => return Task::none(),
                };

                s.chat_history.push(ChatEntry {
                    role: ChatRole::User,
                    content: input.clone(),
                    agent_name: None,
                });
                s.chat_input.clear();
                s.mcp_loading = true;

                Task::perform(
                    commands::mcp::invoke_agent(
                        crate::mcp::AgentInvocation {
                            agent_id,
                            task: input,
                            context: None,
                            parameters: None,
                        },
                    ),
                    |res| match res {
                        Ok(response) => Message::MessageReceived(response.result),
                        Err(e) => Message::McpError(e),
                    },
                )
            }

            Message::MessageReceived(text) => {
                s.mcp_loading = false;
                let agent_name = s
                    .selected_agent
                    .as_ref()
                    .and_then(|id| s.agents.iter().find(|a| &a.id == id))
                    .map(|a| a.name.clone());
                s.chat_history.push(ChatEntry {
                    role: ChatRole::Agent,
                    content: text,
                    agent_name,
                });
                Task::none()
            }

            Message::McpError(e) => {
                s.mcp_loading = false;
                s.chat_history.push(ChatEntry {
                    role: ChatRole::System,
                    content: format!("Error: {}", e),
                    agent_name: None,
                });
                Task::none()
            }

            // ── Privacy ───────────────────────────────────────────────────
            Message::SetOpsecLevel(level) => {
                s.opsec_level = level;
                Task::none()
            }

            // ── OSINT ─────────────────────────────────────────────────────
            Message::OsintModeChanged(mode) => {
                s.osint_mode = mode;
                s.osint_query.clear();
                s.osint_result = None;
                Task::none()
            }

            Message::OsintQueryChanged(q) => {
                s.osint_query = q;
                Task::none()
            }

            Message::RunOsint => {
                let query = s.osint_query.trim().to_string();
                if query.is_empty() {
                    return Task::none();
                }
                s.osint_loading = true;
                let mode = s.osint_mode.clone();

                Task::perform(
                    run_osint(mode.clone(), query.clone()),
                    move |res| match res {
                        Ok(display) => Message::OsintResult(display),
                        Err(e) => Message::OsintError(e),
                    },
                )
            }

            Message::OsintResult(display) => {
                s.osint_loading = false;
                s.osint_result = Some(display);
                Task::none()
            }

            Message::OsintError(e) => {
                s.osint_loading = false;
                s.error = Some(e);
                Task::none()
            }

            // ── Investigation ─────────────────────────────────────────────
            Message::InvestigationsLoaded(investigations) => {
                s.investigations = investigations;
                Task::none()
            }

            Message::CreateInvestigation => {
                let name = format!("Investigation {}", s.investigations.len() + 1);
                Task::perform(
                    commands::investigation::create_investigation(name, String::new()),
                    |res| match res {
                        Ok(inv) => Message::InvestigationsLoaded(vec![inv.to_summary()]),
                        Err(e) => Message::SetStatus(format!("Error: {}", e)),
                    },
                )
            }

            Message::SelectInvestigation(id) => {
                s.active_investigation_id = Some(id);
                Task::none()
            }

            // ── Settings ──────────────────────────────────────────────────
            Message::ApiKeyChanged(key) => {
                s.claude_api_key = key;
                Task::none()
            }

            Message::ToggleApiKeyVisibility => {
                s.api_key_visible = !s.api_key_visible;
                Task::none()
            }

            Message::SaveApiKey => {
                let key = s.claude_api_key.trim().to_string();
                Task::perform(
                    commands::mcp::set_claude_api_key(key),
                    |res| match res {
                        Ok(_) => Message::SetStatus("Claude API key saved.".to_string()),
                        Err(e) => Message::SetStatus(format!("Error: {}", e)),
                    },
                )
            }

            // ── Status ────────────────────────────────────────────────────
            Message::SetStatus(msg) => {
                s.status = msg;
                Task::none()
            }

            Message::ClearError => {
                s.error = None;
                Task::none()
            }
        }
    }

    // ── View ───────────────────────────────────────────────────────────────

    pub fn view(&self) -> Element<Message> {
        views::layout::main_layout(&self.state)
    }
}

// ── Helpers ────────────────────────────────────────────────────────────────

fn normalize_url(input: &str) -> String {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return "about:blank".to_string();
    }
    let lower = trimmed.to_lowercase();
    if lower.starts_with("http://") || lower.starts_with("https://") || lower == "about:blank" {
        trimmed.to_string()
    } else if trimmed.contains('.') && !trimmed.contains(' ') {
        format!("https://{}", trimmed)
    } else {
        format!(
            "https://www.google.com/search?q={}",
            urlencoding_simple(trimmed)
        )
    }
}

fn urlencoding_simple(s: &str) -> String {
    s.replace(' ', "+")
        .replace('&', "%26")
        .replace('=', "%3D")
        .replace('#', "%23")
}

/// Run an OSINT analysis and map results to the display format
async fn run_osint(
    mode: crate::ui::state::OsintMode,
    query: String,
) -> Result<OsintDisplay, String> {
    use crate::ui::state::OsintMode;

    match mode {
        OsintMode::Phone => {
            let analysis = commands::osint::analyze_phone(query.clone()).await?;
            let mut summary = vec![
                ("Original".to_string(), analysis.original),
            ];
            if let Some(e164) = analysis.e164 {
                summary.push(("E.164".to_string(), e164));
            }
            if let Some(country) = analysis.country_name {
                summary.push(("Country".to_string(), country));
            }
            if let Some(carrier) = analysis.carrier {
                summary.push(("Carrier".to_string(), carrier));
            }
            if let Some(lt) = analysis.line_type {
                summary.push(("Line type".to_string(), lt));
            }
            let links = analysis
                .search_queries
                .into_iter()
                .map(|sq| (sq.platform, sq.url))
                .collect();
            Ok(OsintDisplay {
                mode: OsintMode::Phone,
                query,
                summary,
                search_links: links,
            })
        }

        OsintMode::Email => {
            let analysis = commands::osint::analyze_email(query.clone()).await?;
            let summary = vec![
                ("Original".to_string(), analysis.original),
                ("Local part".to_string(), analysis.local_part),
                ("Domain".to_string(), analysis.domain),
                (
                    "Provider".to_string(),
                    analysis.provider_name.unwrap_or_else(|| "Unknown".to_string()),
                ),
                (
                    "Free".to_string(),
                    if analysis.is_free { "Yes".to_string() } else { "No".to_string() },
                ),
                (
                    "Disposable".to_string(),
                    if analysis.is_disposable {
                        "Yes".to_string()
                    } else {
                        "No".to_string()
                    },
                ),
            ];
            let links = analysis
                .search_queries
                .into_iter()
                .map(|sq| (sq.platform, sq.url))
                .collect();
            Ok(OsintDisplay {
                mode: OsintMode::Email,
                query,
                summary,
                search_links: links,
            })
        }

        OsintMode::Username => {
            let analysis = commands::osint::analyze_username(query.clone()).await?;
            let summary = vec![
                ("Username".to_string(), analysis.username),
                (
                    "Platforms checked".to_string(),
                    analysis.platforms.len().to_string(),
                ),
            ];
            let mut links: Vec<(String, String)> = analysis
                .platforms
                .into_iter()
                .map(|p| (p.platform, p.url))
                .collect();
            links.extend(
                analysis
                    .search_queries
                    .into_iter()
                    .map(|sq| (sq.platform, sq.url)),
            );
            Ok(OsintDisplay {
                mode: OsintMode::Username,
                query,
                summary,
                search_links: links,
            })
        }

        OsintMode::Domain => {
            let analysis = commands::osint::analyze_domain(query.clone()).await?;
            let summary = vec![
                ("Domain".to_string(), analysis.domain.clone()),
                ("WHOIS".to_string(), analysis.whois_url.clone()),
                ("DNS".to_string(), analysis.dns_url.clone()),
            ];
            let links = analysis
                .search_queries
                .into_iter()
                .map(|sq| (sq.platform, sq.url))
                .collect();
            Ok(OsintDisplay {
                mode: OsintMode::Domain,
                query,
                summary,
                search_links: links,
            })
        }
    }
}
