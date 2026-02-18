//! Hivemind Module
//!
//! The Hivemind is MADROX's collective intelligence system.
//! All entities discovered by any identity are shared across the swarm.

use crate::core::entity::EntityType;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
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

/// Global counter for generating unique listener IDs
static LISTENER_ID_COUNTER: AtomicU64 = AtomicU64::new(0);

/// Event listeners stored with unique IDs for subscribe/unsubscribe support
static LISTENERS: RwLock<Option<HashMap<u64, Box<dyn Fn(HivemindEvent) + Send + Sync>>>> =
    RwLock::new(None);

/// Initialize the Hivemind system
pub fn init(_app_handle: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    tracing::info!("Initializing Hivemind collective intelligence system");

    // Clear any existing listeners and initialize the map
    let mut listeners = LISTENERS.write()
        .map_err(|e| format!("Hivemind lock poisoned during init: {}", e))?;
    *listeners = Some(HashMap::new());

    // Reset the listener ID counter
    LISTENER_ID_COUNTER.store(0, Ordering::SeqCst);

    Ok(())
}

/// Broadcast an event to all listeners
pub fn broadcast(event: HivemindEvent) {
    tracing::debug!("Hivemind broadcast: {:?}", event);

    let listeners = match LISTENERS.read() {
        Ok(l) => l,
        Err(e) => {
            tracing::error!("Hivemind lock poisoned during broadcast: {}", e);
            return;
        }
    };
    if let Some(ref map) = *listeners {
        for listener in map.values() {
            listener(event.clone());
        }
    }
}

/// Subscribe to Hivemind events.
/// Returns a unique listener ID that can be used to unsubscribe later.
pub fn subscribe<F>(listener: F) -> u64
where
    F: Fn(HivemindEvent) + Send + Sync + 'static,
{
    let id = LISTENER_ID_COUNTER.fetch_add(1, Ordering::SeqCst);
    match LISTENERS.write() {
        Ok(mut listeners) => {
            let map = listeners.get_or_insert_with(HashMap::new);
            map.insert(id, Box::new(listener));
        }
        Err(e) => {
            tracing::error!("Hivemind lock poisoned during subscribe: {}", e);
        }
    }
    id
}

/// Unsubscribe a listener by its ID.
/// Returns true if the listener was found and removed, false otherwise.
pub fn unsubscribe(id: u64) -> bool {
    match LISTENERS.write() {
        Ok(mut listeners) => {
            if let Some(ref mut map) = *listeners {
                map.remove(&id).is_some()
            } else {
                false
            }
        }
        Err(e) => {
            tracing::error!("Hivemind lock poisoned during unsubscribe: {}", e);
            false
        }
    }
}

/// Get Hivemind status
#[derive(Debug, Serialize)]
pub struct HivemindStatus {
    pub connected_identities: usize,
    pub total_entities: usize,
    pub cross_references: usize,
    pub last_sync: Option<DateTime<Utc>>,
}
