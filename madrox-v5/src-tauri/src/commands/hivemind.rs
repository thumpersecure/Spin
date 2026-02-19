//! Hivemind Commands
//!
//! The Hivemind is Spin's collective intelligence system.
//! All discovered entities are shared across all identities in real-time.

use crate::core::entity::{Entity, EntityType, EntitySource};
use crate::hivemind::{CrossReference, HivemindEvent};
use crate::storage;
use serde::{Deserialize, Serialize};
use tracing::{info, debug};

/// Result type for hivemind operations
pub type HivemindResult<T> = Result<T, String>;

/// Request to add a new entity
#[derive(Debug, Deserialize)]
pub struct AddEntityRequest {
    pub entity_type: EntityType,
    pub value: String,
    pub source_identity: String,
    pub source_url: Option<String>,
    pub context: Option<String>,
}

/// Get all entities in the Hivemind
#[tauri::command]
pub async fn get_all_entities(
    app_handle: tauri::AppHandle,
) -> HivemindResult<Vec<Entity>> {
    debug!("Fetching all Hivemind entities");

    let store = storage::get_store(&app_handle)
        .map_err(|e| format!("Storage error: {}", e))?;

    let entities = store
        .get_all_entities()
        .map_err(|e| format!("Failed to get entities: {}", e))?;

    Ok(entities)
}

/// Add a new entity to the Hivemind
#[tauri::command]
pub async fn add_entity(
    app_handle: tauri::AppHandle,
    request: AddEntityRequest,
) -> HivemindResult<Entity> {
    info!("Adding entity to Hivemind: {:?} = {}", request.entity_type, request.value);

    let store = storage::get_store(&app_handle)
        .map_err(|e| format!("Storage error: {}", e))?;

    // Create source record
    let source = EntitySource {
        identity_id: request.source_identity,
        url: request.source_url,
        context: request.context,
        timestamp: chrono::Utc::now(),
    };

    // Check if entity already exists
    let entity_hash = Entity::compute_hash(&request.entity_type, &request.value);

    let entity = if let Some(mut existing) = store.get_entity(&entity_hash).ok().flatten() {
        // Entity exists - add new source
        existing.sources.push(source);
        existing.last_seen = chrono::Utc::now();
        existing.occurrence_count += 1;
        store.save_entity(&existing)
            .map_err(|e| format!("Failed to update entity: {}", e))?;

        // Broadcast cross-reference if multiple sources
        if existing.sources.len() > 1 {
            crate::hivemind::broadcast(HivemindEvent::CrossReference {
                entity_hash: existing.hash.clone(),
                source_count: existing.sources.len(),
            });
        }

        existing
    } else {
        // New entity
        let entity = Entity::new(request.entity_type, request.value, source);
        store.save_entity(&entity)
            .map_err(|e| format!("Failed to save entity: {}", e))?;

        // Broadcast new entity event
        crate::hivemind::broadcast(HivemindEvent::NewEntity {
            entity_hash: entity.hash.clone(),
            entity_type: entity.entity_type.clone(),
        });

        entity
    };

    Ok(entity)
}

/// Get all sources for an entity
#[tauri::command]
pub async fn get_entity_sources(
    app_handle: tauri::AppHandle,
    entity_hash: String,
) -> HivemindResult<Vec<EntitySource>> {
    let store = storage::get_store(&app_handle)
        .map_err(|e| format!("Storage error: {}", e))?;

    let entity = store
        .get_entity(&entity_hash)
        .map_err(|e| format!("Failed to get entity: {}", e))?
        .ok_or_else(|| "Entity not found".to_string())?;

    Ok(entity.sources)
}

/// Get cross-references (entities found by multiple identities)
#[tauri::command]
pub async fn get_cross_references(
    app_handle: tauri::AppHandle,
) -> HivemindResult<Vec<CrossReference>> {
    let store = storage::get_store(&app_handle)
        .map_err(|e| format!("Storage error: {}", e))?;

    let entities = store
        .get_all_entities()
        .map_err(|e| format!("Failed to get entities: {}", e))?;

    // Find entities with multiple unique identity sources
    let cross_refs: Vec<CrossReference> = entities
        .into_iter()
        .filter(|e| {
            let unique_identities: std::collections::HashSet<_> =
                e.sources.iter().map(|s| &s.identity_id).collect();
            unique_identities.len() > 1
        })
        .map(|e| {
            let identity_ids: Vec<String> = e.sources
                .iter()
                .map(|s| s.identity_id.clone())
                .collect::<std::collections::HashSet<_>>()
                .into_iter()
                .collect();

            CrossReference {
                entity_hash: e.hash,
                entity_type: e.entity_type,
                value: e.value,
                identity_ids,
                total_occurrences: e.occurrence_count,
                first_seen: e.first_seen,
                last_seen: e.last_seen,
            }
        })
        .collect();

    info!("Found {} cross-references", cross_refs.len());
    Ok(cross_refs)
}

/// Extract entities from text
#[tauri::command]
pub async fn extract_entities_from_text(
    text: String,
    source_identity: String,
    source_url: Option<String>,
) -> HivemindResult<Vec<Entity>> {
    info!("Extracting entities from text ({} chars)", text.len());

    let extracted = crate::core::entity_extractor::extract_all(&text);

    info!("Extracted {} potential entities", extracted.len());
    Ok(extracted.into_iter().map(|(entity_type, value)| {
        Entity::new(
            entity_type,
            value,
            EntitySource {
                identity_id: source_identity.clone(),
                url: source_url.clone(),
                context: None,
                timestamp: chrono::Utc::now(),
            },
        )
    }).collect())
}

/// Clear all entities (with confirmation)
#[tauri::command]
pub async fn clear_entities(
    app_handle: tauri::AppHandle,
    confirm: bool,
) -> HivemindResult<()> {
    if !confirm {
        return Err("Confirmation required to clear Hivemind".to_string());
    }

    info!("Clearing all Hivemind entities");

    let store = storage::get_store(&app_handle)
        .map_err(|e| format!("Storage error: {}", e))?;

    store
        .clear_entities()
        .map_err(|e| format!("Failed to clear entities: {}", e))?;

    Ok(())
}
