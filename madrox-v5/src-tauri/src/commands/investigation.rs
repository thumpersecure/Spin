//! Investigation Timeline & Graph Commands
//!
//! IPC handlers for investigation management, timeline tracking,
//! and entity relationship graph operations.

use crate::investigation::{
    self, GraphEdge, GraphNode, InvestigationExport, InvestigationGraph, InvestigationSummary,
    TimelineEvent,
};
use chrono::Utc;
use std::collections::HashMap;
use tracing::info;

pub type InvestigationResult<T> = Result<T, String>;

/// Create a new investigation
#[tauri::command]
pub async fn create_investigation(
    name: String,
    description: String,
) -> InvestigationResult<crate::investigation::Investigation> {
    info!("Creating investigation: {}", name);

    let inv = crate::investigation::Investigation::new(name, description);
    let result = inv.clone();

    investigation::with_investigations_mut(|store| {
        store.insert(inv.id.clone(), inv);
        Ok(())
    })?;

    Ok(result)
}

/// Get all investigations (summaries)
#[tauri::command]
pub async fn get_all_investigations() -> InvestigationResult<Vec<InvestigationSummary>> {
    investigation::with_investigations(|store| {
        Ok(store.values().map(|inv| inv.to_summary()).collect())
    })
}

/// Get a single investigation by ID (full data)
#[tauri::command]
pub async fn get_investigation(
    id: String,
) -> InvestigationResult<crate::investigation::Investigation> {
    investigation::with_investigations(|store| {
        store
            .get(&id)
            .cloned()
            .ok_or_else(|| format!("Investigation '{}' not found", id))
    })
}

/// Add a timeline event to an investigation
#[tauri::command]
pub async fn add_timeline_event(
    investigation_id: String,
    event_type: String,
    title: String,
    description: String,
    identity_id: String,
    url: Option<String>,
    entity_hash: Option<String>,
    importance: Option<u8>,
    metadata: Option<HashMap<String, serde_json::Value>>,
) -> InvestigationResult<TimelineEvent> {
    info!(
        "Adding timeline event '{}' to investigation '{}'",
        title, investigation_id
    );

    let parsed_type = investigation::parse_event_type(&event_type);

    let event = TimelineEvent {
        id: format!("evt-{}", uuid::Uuid::new_v4()),
        investigation_id: investigation_id.clone(),
        event_type: parsed_type,
        title,
        description,
        identity_id,
        url,
        entity_hash,
        importance: importance.unwrap_or(1).min(5),
        metadata,
        created_at: Utc::now(),
    };

    let event_clone = event.clone();

    investigation::with_investigations_mut(|store| {
        let inv = store
            .get_mut(&investigation_id)
            .ok_or_else(|| format!("Investigation '{}' not found", investigation_id))?;
        inv.add_event(event_clone);
        Ok(())
    })?;

    Ok(event)
}

/// Add a node to the investigation graph
#[tauri::command]
pub async fn add_graph_node(
    investigation_id: String,
    node_id: String,
    node_type: String,
    label: String,
    value: String,
    entity_type: Option<String>,
    color: Option<String>,
    metadata: Option<HashMap<String, serde_json::Value>>,
) -> InvestigationResult<GraphNode> {
    let node = GraphNode {
        id: node_id,
        node_type,
        label,
        value,
        entity_type,
        color,
        metadata,
    };

    let node_clone = node.clone();

    investigation::with_investigations_mut(|store| {
        let inv = store
            .get_mut(&investigation_id)
            .ok_or_else(|| format!("Investigation '{}' not found", investigation_id))?;
        if !inv.add_node(node_clone) {
            return Err("Node with this ID already exists".to_string());
        }
        Ok(())
    })?;

    Ok(node)
}

/// Add an edge to the investigation graph
#[tauri::command]
pub async fn add_graph_edge(
    investigation_id: String,
    source: String,
    target: String,
    relationship: String,
    label: String,
    weight: Option<f64>,
    discovered_by: String,
    context: Option<String>,
) -> InvestigationResult<GraphEdge> {
    let edge = GraphEdge {
        id: format!("edge-{}", uuid::Uuid::new_v4()),
        source,
        target,
        relationship,
        label,
        weight: weight.unwrap_or(1.0),
        discovered_by,
        context,
    };

    let edge_clone = edge.clone();

    investigation::with_investigations_mut(|store| {
        let inv = store
            .get_mut(&investigation_id)
            .ok_or_else(|| format!("Investigation '{}' not found", investigation_id))?;
        if !inv.add_edge(edge_clone) {
            return Err("Edge between these nodes already exists".to_string());
        }
        Ok(())
    })?;

    Ok(edge)
}

/// Get the graph data for an investigation
#[tauri::command]
pub async fn get_investigation_graph(
    investigation_id: String,
) -> InvestigationResult<InvestigationGraph> {
    investigation::with_investigations(|store| {
        let inv = store
            .get(&investigation_id)
            .ok_or_else(|| format!("Investigation '{}' not found", investigation_id))?;
        Ok(inv.graph.clone())
    })
}

/// Get timeline events for an investigation
#[tauri::command]
pub async fn get_investigation_timeline(
    investigation_id: String,
    event_type_filter: Option<String>,
) -> InvestigationResult<Vec<TimelineEvent>> {
    investigation::with_investigations(|store| {
        let inv = store
            .get(&investigation_id)
            .ok_or_else(|| format!("Investigation '{}' not found", investigation_id))?;

        if let Some(filter) = event_type_filter {
            let parsed_type = investigation::parse_event_type(&filter);
            Ok(inv
                .events_by_type(&parsed_type)
                .into_iter()
                .cloned()
                .collect())
        } else {
            Ok(inv.timeline.clone())
        }
    })
}

/// Update investigation status
#[tauri::command]
pub async fn update_investigation_status(
    investigation_id: String,
    status: String,
) -> InvestigationResult<InvestigationSummary> {
    let parsed_status = investigation::parse_status(&status)?;

    investigation::with_investigations_mut(|store| {
        let inv = store
            .get_mut(&investigation_id)
            .ok_or_else(|| format!("Investigation '{}' not found", investigation_id))?;
        inv.status = parsed_status;
        inv.updated_at = Utc::now();
        Ok(inv.to_summary())
    })
}

/// Delete an investigation
#[tauri::command]
pub async fn delete_investigation(investigation_id: String) -> InvestigationResult<()> {
    info!("Deleting investigation: {}", investigation_id);

    investigation::with_investigations_mut(|store| {
        store
            .remove(&investigation_id)
            .ok_or_else(|| format!("Investigation '{}' not found", investigation_id))?;
        Ok(())
    })
}

/// Export investigation as JSON
#[tauri::command]
pub async fn export_investigation(
    investigation_id: String,
) -> InvestigationResult<InvestigationExport> {
    investigation::with_investigations(|store| {
        let inv = store
            .get(&investigation_id)
            .ok_or_else(|| format!("Investigation '{}' not found", investigation_id))?;
        inv.export_json()
    })
}
