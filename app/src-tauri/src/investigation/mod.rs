//! Investigation Timeline & Graph Module
//!
//! Provides persistent investigation tracking with:
//! - Timeline of all investigation actions (navigation, entity discovery, analysis)
//! - Entity relationship graph (nodes = entities, edges = relationships)
//! - Per-investigation isolation (multiple concurrent investigations)
//! - Export to JSON for external visualization
//!
//! Jessica Jones v12 - "Every PI keeps a case file."

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::RwLock;

/// Global investigation store
static INVESTIGATIONS: RwLock<Option<HashMap<String, Investigation>>> = RwLock::new(None);

// ─── Investigation ───────────────────────────────────────────────────

/// An investigation case
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Investigation {
    pub id: String,
    pub name: String,
    pub description: String,
    pub status: InvestigationStatus,
    pub timeline: Vec<TimelineEvent>,
    pub graph: InvestigationGraph,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Graph sub-structure within an investigation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InvestigationGraph {
    pub nodes: Vec<GraphNode>,
    pub edges: Vec<GraphEdge>,
}

/// Investigation status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum InvestigationStatus {
    Active,
    Paused,
    Closed,
    Archived,
}

// ─── Timeline ────────────────────────────────────────────────────────

/// A timeline event in an investigation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineEvent {
    pub id: String,
    pub investigation_id: String,
    pub event_type: TimelineEventType,
    pub title: String,
    pub description: String,
    pub identity_id: String,
    pub url: Option<String>,
    pub entity_hash: Option<String>,
    pub importance: u8,
    pub metadata: Option<HashMap<String, serde_json::Value>>,
    pub created_at: DateTime<Utc>,
}

/// Types of timeline events (matches frontend TimelineEventType)
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum TimelineEventType {
    PageVisit,
    EntityDiscovered,
    IdentitySwitch,
    SearchQuery,
    Screenshot,
    Note,
    Bookmark,
    Export,
    Alert,
    ConnectionFound,
    EvidenceCollected,
    Hypothesis,
    Custom,
}

// ─── Graph ───────────────────────────────────────────────────────────

/// A node in the investigation graph
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphNode {
    pub id: String,
    pub node_type: String,
    pub label: String,
    pub value: String,
    pub entity_type: Option<String>,
    pub color: Option<String>,
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}

/// An edge in the investigation graph
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphEdge {
    pub id: String,
    pub source: String,
    pub target: String,
    pub relationship: String,
    pub label: String,
    pub weight: f64,
    pub discovered_by: String,
    pub context: Option<String>,
}

// ─── Summary & Export ────────────────────────────────────────────────

/// Investigation summary for list views
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InvestigationSummary {
    pub id: String,
    pub name: String,
    pub description: String,
    pub status: InvestigationStatus,
    pub event_count: usize,
    pub node_count: usize,
    pub edge_count: usize,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Export container
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InvestigationExport {
    pub investigation: Investigation,
    pub format: String,
    pub exported_at: DateTime<Utc>,
    pub data: String,
}

// ─── Implementation ──────────────────────────────────────────────────

impl Investigation {
    /// Create a new investigation
    pub fn new(name: String, description: String) -> Self {
        let now = Utc::now();
        Self {
            id: format!("inv-{}", uuid::Uuid::new_v4()),
            name,
            description,
            status: InvestigationStatus::Active,
            timeline: Vec::new(),
            graph: InvestigationGraph {
                nodes: Vec::new(),
                edges: Vec::new(),
            },
            created_at: now,
            updated_at: now,
        }
    }

    /// Add a timeline event
    pub fn add_event(&mut self, event: TimelineEvent) {
        self.timeline.push(event);
        self.updated_at = Utc::now();
    }

    /// Add a node to the graph. Returns false if duplicate.
    pub fn add_node(&mut self, node: GraphNode) -> bool {
        if self.graph.nodes.iter().any(|n| n.id == node.id) {
            return false;
        }
        self.graph.nodes.push(node);
        self.updated_at = Utc::now();
        true
    }

    /// Add an edge to the graph. Returns false if duplicate.
    pub fn add_edge(&mut self, edge: GraphEdge) -> bool {
        if self
            .graph
            .edges
            .iter()
            .any(|e| e.source == edge.source && e.target == edge.target)
        {
            return false;
        }
        self.graph.edges.push(edge);
        self.updated_at = Utc::now();
        true
    }

    /// Get timeline events filtered by type
    pub fn events_by_type(&self, event_type: &TimelineEventType) -> Vec<&TimelineEvent> {
        self.timeline
            .iter()
            .filter(|e| &e.event_type == event_type)
            .collect()
    }

    /// Generate summary
    pub fn to_summary(&self) -> InvestigationSummary {
        InvestigationSummary {
            id: self.id.clone(),
            name: self.name.clone(),
            description: self.description.clone(),
            status: self.status.clone(),
            event_count: self.timeline.len(),
            node_count: self.graph.nodes.len(),
            edge_count: self.graph.edges.len(),
            created_at: self.created_at,
            updated_at: self.updated_at,
        }
    }

    /// Export investigation to JSON
    pub fn export_json(&self) -> Result<InvestigationExport, String> {
        let data = serde_json::to_string_pretty(self)
            .map_err(|e| format!("Failed to serialize investigation: {}", e))?;
        Ok(InvestigationExport {
            investigation: self.clone(),
            format: "json".to_string(),
            exported_at: Utc::now(),
            data,
        })
    }
}

// ─── Helper: parse event type from string ────────────────────────────

pub fn parse_event_type(s: &str) -> TimelineEventType {
    match s {
        "page_visit" => TimelineEventType::PageVisit,
        "entity_discovered" => TimelineEventType::EntityDiscovered,
        "identity_switch" => TimelineEventType::IdentitySwitch,
        "search_query" => TimelineEventType::SearchQuery,
        "screenshot" => TimelineEventType::Screenshot,
        "note" => TimelineEventType::Note,
        "bookmark" => TimelineEventType::Bookmark,
        "export" => TimelineEventType::Export,
        "alert" => TimelineEventType::Alert,
        "connection_found" => TimelineEventType::ConnectionFound,
        "evidence_collected" => TimelineEventType::EvidenceCollected,
        "hypothesis" => TimelineEventType::Hypothesis,
        _ => TimelineEventType::Custom,
    }
}

/// Parse investigation status from string
pub fn parse_status(s: &str) -> Result<InvestigationStatus, String> {
    match s {
        "active" => Ok(InvestigationStatus::Active),
        "paused" => Ok(InvestigationStatus::Paused),
        "closed" => Ok(InvestigationStatus::Closed),
        "archived" => Ok(InvestigationStatus::Archived),
        _ => Err(format!("Unknown investigation status: {}", s)),
    }
}

// ─── Module Init & Global Access ─────────────────────────────────────

/// Initialize the investigation module
pub fn init() -> Result<(), Box<dyn std::error::Error>> {
    tracing::info!("Investigation timeline module initialized");

    let mut store = INVESTIGATIONS
        .write()
        .map_err(|e| format!("Investigation lock poisoned: {}", e))?;
    *store = Some(HashMap::new());

    Ok(())
}

/// Access investigations with read lock
pub fn with_investigations<F, R>(f: F) -> Result<R, String>
where
    F: FnOnce(&HashMap<String, Investigation>) -> Result<R, String>,
{
    let guard = INVESTIGATIONS
        .read()
        .map_err(|e| format!("Investigation lock poisoned: {}", e))?;
    let store = guard.as_ref().ok_or("Investigations not initialized")?;
    f(store)
}

/// Access investigations with write lock
pub fn with_investigations_mut<F, R>(f: F) -> Result<R, String>
where
    F: FnOnce(&mut HashMap<String, Investigation>) -> Result<R, String>,
{
    let mut guard = INVESTIGATIONS
        .write()
        .map_err(|e| format!("Investigation lock poisoned: {}", e))?;
    let store = guard.as_mut().ok_or("Investigations not initialized")?;
    f(store)
}
