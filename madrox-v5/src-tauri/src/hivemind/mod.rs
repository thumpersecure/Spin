//! Hivemind Module
//!
//! The Hivemind is MADROX's collective intelligence system.
//! All entities discovered by any identity are shared across the swarm.

use crate::core::entity::EntityType;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::sync::RwLock;
use tauri::AppHandle;

/// Hivemind event types
#[derive(Debug, Clone, Serialize)]
pub enum HivemindEvent {
    /// New entity discovered
    NewEntity {
        entity_hash: String,
        entity_type: EntityType,
    },
    /// Entity found by multiple identities
    CrossReference {
        entity_hash: String,
        source_count: usize,
    },
    /// Entity updated
    EntityUpdated {
        entity_hash: String,
    },
    /// Identity connected to Hivemind
    IdentityConnected {
        identity_id: String,
    },
    /// Identity disconnected
    IdentityDisconnected {
        identity_id: String,
    },
}

/// Cross-reference information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrossReference {
    pub entity_hash: String,
    pub entity_type: EntityType,
    pub value: String,
    pub identity_ids: Vec<String>,
    pub total_occurrences: u32,
    pub first_seen: DateTime<Utc>,
    pub last_seen: DateTime<Utc>,
}

/// Event listeners
static LISTENERS: RwLock<Vec<Box<dyn Fn(HivemindEvent) + Send + Sync>>> = RwLock::new(Vec::new());

/// Initialize the Hivemind system
pub fn init(_app_handle: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    tracing::info!("Initializing Hivemind collective intelligence system");

    // Clear any existing listeners
    let mut listeners = LISTENERS.write().unwrap();
    listeners.clear();

    Ok(())
}

/// Broadcast an event to all listeners
pub fn broadcast(event: HivemindEvent) {
    tracing::debug!("Hivemind broadcast: {:?}", event);

    let listeners = LISTENERS.read().unwrap();
    for listener in listeners.iter() {
        listener(event.clone());
    }
}

/// Subscribe to Hivemind events
pub fn subscribe<F>(listener: F)
where
    F: Fn(HivemindEvent) + Send + Sync + 'static,
{
    let mut listeners = LISTENERS.write().unwrap();
    listeners.push(Box::new(listener));
}

/// Get Hivemind status
#[derive(Debug, Serialize)]
pub struct HivemindStatus {
    pub connected_identities: usize,
    pub total_entities: usize,
    pub cross_references: usize,
    pub last_sync: Option<DateTime<Utc>>,
}
