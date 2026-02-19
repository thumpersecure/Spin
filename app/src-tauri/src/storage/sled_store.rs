//! Sled Database Store
//!
//! High-performance embedded database for Spin data.

use crate::core::entity::Entity;
use crate::core::identity::Identity;
use crate::storage::StorageError;
use sled::{Db, Tree};
use std::path::Path;

/// Sled-based storage
pub struct SledStore {
    db: Db,
    identities: Tree,
    entities: Tree,
    sessions: Tree,
    config: Tree,
}

impl SledStore {
    /// Create a new store
    pub fn new(path: &Path) -> Result<Self, StorageError> {
        let db = sled::open(path)?;

        let identities = db.open_tree("identities")?;
        let entities = db.open_tree("entities")?;
        let sessions = db.open_tree("sessions")?;
        let config = db.open_tree("config")?;

        let store = Self {
            db,
            identities,
            entities,
            sessions,
            config,
        };

        // Ensure Prime identity exists
        if store.get_identity("prime")?.is_none() {
            let prime = Identity::prime();
            store.save_identity(&prime)?;
            store.set_active_identity("prime")?;
        }

        Ok(store)
    }

    // ============ Identity Operations ============

    /// Save an identity
    pub fn save_identity(&self, identity: &Identity) -> Result<(), StorageError> {
        let json = serde_json::to_vec(identity)?;
        self.identities.insert(&identity.id, json)?;
        self.identities.flush()?;
        Ok(())
    }

    /// Get an identity by ID
    pub fn get_identity(&self, id: &str) -> Result<Option<Identity>, StorageError> {
        match self.identities.get(id)? {
            Some(bytes) => {
                let identity: Identity = serde_json::from_slice(&bytes)?;
                Ok(Some(identity))
            }
            None => Ok(None),
        }
    }

    /// Get all identities
    pub fn get_all_identities(&self) -> Result<Vec<Identity>, StorageError> {
        let mut identities = Vec::new();
        for result in self.identities.iter() {
            let (_, value) = result?;
            let identity: Identity = serde_json::from_slice(&value)?;
            identities.push(identity);
        }
        Ok(identities)
    }

    /// Delete an identity
    pub fn delete_identity(&self, id: &str) -> Result<(), StorageError> {
        self.identities.remove(id)?;
        self.identities.flush()?;
        Ok(())
    }

    /// Set the active identity
    pub fn set_active_identity(&self, id: &str) -> Result<(), StorageError> {
        self.config.insert("active_identity", id.as_bytes())?;
        self.config.flush()?;
        Ok(())
    }

    /// Get the active identity
    pub fn get_active_identity(&self) -> Result<Identity, StorageError> {
        let active_id = match self.config.get("active_identity")? {
            Some(bytes) => String::from_utf8_lossy(&bytes).to_string(),
            None => "prime".to_string(),
        };

        self.get_identity(&active_id)?
            .ok_or_else(|| StorageError::NotFound(active_id))
    }

    // ============ Entity Operations ============

    /// Save an entity
    pub fn save_entity(&self, entity: &Entity) -> Result<(), StorageError> {
        let json = serde_json::to_vec(entity)?;
        self.entities.insert(&entity.hash, json)?;
        self.entities.flush()?;
        Ok(())
    }

    /// Get an entity by hash
    pub fn get_entity(&self, hash: &str) -> Result<Option<Entity>, StorageError> {
        match self.entities.get(hash)? {
            Some(bytes) => {
                let entity: Entity = serde_json::from_slice(&bytes)?;
                Ok(Some(entity))
            }
            None => Ok(None),
        }
    }

    /// Get all entities
    pub fn get_all_entities(&self) -> Result<Vec<Entity>, StorageError> {
        let mut entities = Vec::new();
        for result in self.entities.iter() {
            let (_, value) = result?;
            let entity: Entity = serde_json::from_slice(&value)?;
            entities.push(entity);
        }
        Ok(entities)
    }

    /// Clear all entities
    pub fn clear_entities(&self) -> Result<(), StorageError> {
        self.entities.clear()?;
        self.entities.flush()?;
        Ok(())
    }

    /// Get entities by type
    pub fn get_entities_by_type(
        &self,
        entity_type: &crate::core::entity::EntityType,
    ) -> Result<Vec<Entity>, StorageError> {
        let all = self.get_all_entities()?;
        Ok(all
            .into_iter()
            .filter(|e| &e.entity_type == entity_type)
            .collect())
    }

    // ============ Session Operations ============

    /// Save session data for an identity
    pub fn save_session(&self, identity_id: &str, data: &[u8]) -> Result<(), StorageError> {
        self.sessions.insert(identity_id, data)?;
        self.sessions.flush()?;
        Ok(())
    }

    /// Get session data for an identity
    pub fn get_session(&self, identity_id: &str) -> Result<Option<Vec<u8>>, StorageError> {
        match self.sessions.get(identity_id)? {
            Some(bytes) => Ok(Some(bytes.to_vec())),
            None => Ok(None),
        }
    }

    /// Clear session for an identity
    pub fn clear_session(&self, identity_id: &str) -> Result<(), StorageError> {
        self.sessions.remove(identity_id)?;
        self.sessions.flush()?;
        Ok(())
    }

    // ============ Database Operations ============

    /// Flush all pending writes
    pub fn flush(&self) -> Result<(), StorageError> {
        self.db.flush()?;
        Ok(())
    }

    /// Get database statistics
    pub fn stats(&self) -> DatabaseStats {
        DatabaseStats {
            identity_count: self.identities.len(),
            entity_count: self.entities.len(),
            session_count: self.sessions.len(),
            size_on_disk: self.db.size_on_disk().unwrap_or(0),
        }
    }
}

/// Database statistics
#[derive(Debug)]
pub struct DatabaseStats {
    pub identity_count: usize,
    pub entity_count: usize,
    pub session_count: usize,
    pub size_on_disk: u64,
}
