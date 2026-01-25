//! Storage Module
//!
//! Persistent storage using sled embedded database.

mod sled_store;

pub use sled_store::SledStore;

use std::sync::{Arc, RwLock};
use tauri::AppHandle;
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

/// Initialize the storage system
pub fn init(app_handle: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");

    let db_path = app_data_dir.join("madrox.db");

    tracing::info!("Initializing sled database at {:?}", db_path);

    let store = SledStore::new(&db_path)?;

    let mut global_store = STORE.write().unwrap();
    *global_store = Some(Arc::new(store));

    Ok(())
}

/// Get the store instance
pub fn get_store(_app_handle: &AppHandle) -> Result<Arc<SledStore>, StorageError> {
    let store = STORE.read().unwrap();
    store.clone().ok_or(StorageError::NotInitialized)
}
