//! Storage Module
//!
//! Persistent storage using sled embedded database.

mod sled_store;

pub use sled_store::SledStore;

use std::path::Path;
use std::sync::{Arc, RwLock};
use thiserror::Error;

/// Global store instance
static STORE: RwLock<Option<Arc<SledStore>>> = RwLock::new(None);

/// Storage error types
#[derive(Debug, Error)]
pub enum StorageError {
    #[error("Database error: {0}")]
    Database(#[from] sled::Error),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Store not initialized")]
    NotInitialized,

    #[error("Entity not found: {0}")]
    NotFound(String),
}

/// Initialize the storage system.
///
/// `data_dir` is the application-level data directory (e.g. `~/.local/share/spin`).
/// The sled database is stored at `<data_dir>/spin.db`.
pub fn init(data_dir: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let db_path = data_dir.join("spin.db");

    tracing::info!("Initializing sled database at {:?}", db_path);

    let store = SledStore::new(&db_path)?;

    let mut global_store = STORE
        .write()
        .map_err(|e| format!("Storage lock poisoned: {}", e))?;
    *global_store = Some(Arc::new(store));

    Ok(())
}

/// Get the global store instance (no AppHandle required).
pub fn get_store() -> Result<Arc<SledStore>, StorageError> {
    let store = STORE.read().map_err(|_| StorageError::NotInitialized)?;
    store.clone().ok_or(StorageError::NotInitialized)
}
