//! Entity Types
//!
//! Entities are pieces of intelligence discovered during OSINT investigations.
//! The Hivemind tracks and correlates entities across all identities.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

/// Types of entities that can be extracted
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "snake_case")]
pub enum EntityType {
    Email,
    Phone,
    IpV4,
    IpV6,
    Domain,
    Url,
    Username,
    Hashtag,
    BitcoinAddress,
    EthereumAddress,
    CreditCard,
    Ssn,
    Date,
    Coordinate,
    MacAddress,
    Uuid,
    Custom(String),
}

impl EntityType {
    /// Get the icon name for this entity type
    pub fn icon(&self) -> &'static str {
        match self {
            EntityType::Email => "mail",
            EntityType::Phone => "phone",
            EntityType::IpV4 | EntityType::IpV6 => "globe",
            EntityType::Domain => "server",
            EntityType::Url => "link",
            EntityType::Username => "user",
            EntityType::Hashtag => "hash",
            EntityType::BitcoinAddress => "bitcoin",
            EntityType::EthereumAddress => "ethereum",
            EntityType::CreditCard => "credit-card",
            EntityType::Ssn => "shield",
            EntityType::Date => "calendar",
            EntityType::Coordinate => "map-pin",
            EntityType::MacAddress => "wifi",
            EntityType::Uuid => "key",
            EntityType::Custom(_) => "file",
        }
    }

    /// Get human-readable name
    pub fn display_name(&self) -> String {
        match self {
            EntityType::Email => "Email".to_string(),
            EntityType::Phone => "Phone".to_string(),
            EntityType::IpV4 => "IPv4".to_string(),
            EntityType::IpV6 => "IPv6".to_string(),
            EntityType::Domain => "Domain".to_string(),
            EntityType::Url => "URL".to_string(),
            EntityType::Username => "Username".to_string(),
            EntityType::Hashtag => "Hashtag".to_string(),
            EntityType::BitcoinAddress => "Bitcoin".to_string(),
            EntityType::EthereumAddress => "Ethereum".to_string(),
            EntityType::CreditCard => "Credit Card".to_string(),
            EntityType::Ssn => "SSN".to_string(),
            EntityType::Date => "Date".to_string(),
            EntityType::Coordinate => "Coordinate".to_string(),
            EntityType::MacAddress => "MAC Address".to_string(),
            EntityType::Uuid => "UUID".to_string(),
            EntityType::Custom(name) => name.clone(),
        }
    }
}

/// Source of an entity discovery
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EntitySource {
    /// Identity that discovered this entity
    pub identity_id: String,

    /// URL where entity was found
    pub url: Option<String>,

    /// Surrounding context
    pub context: Option<String>,

    /// Discovery timestamp
    pub timestamp: DateTime<Utc>,
}

/// An entity in the Hivemind
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Entity {
    /// Unique hash of entity type + value
    pub hash: String,

    /// Type of entity
    pub entity_type: EntityType,

    /// The entity value
    pub value: String,

    /// All sources that found this entity
    pub sources: Vec<EntitySource>,

    /// First discovery timestamp
    pub first_seen: DateTime<Utc>,

    /// Most recent discovery timestamp
    pub last_seen: DateTime<Utc>,

    /// Total occurrence count
    pub occurrence_count: u32,

    /// Risk score (0-100)
    pub risk_score: Option<u8>,

    /// Tags for categorization
    pub tags: Vec<String>,

    /// Investigation notes
    pub notes: Option<String>,
}

impl Entity {
    /// Create a new entity
    pub fn new(entity_type: EntityType, value: String, source: EntitySource) -> Self {
        let hash = Self::compute_hash(&entity_type, &value);
        let now = Utc::now();

        Self {
            hash,
            entity_type,
            value,
            sources: vec![source],
            first_seen: now,
            last_seen: now,
            occurrence_count: 1,
            risk_score: None,
            tags: vec![],
            notes: None,
        }
    }

    /// Compute the unique hash for an entity
    pub fn compute_hash(entity_type: &EntityType, value: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(format!("{:?}:{}", entity_type, value.to_lowercase()).as_bytes());
        let result = hasher.finalize();
        base64::Engine::encode(&base64::engine::general_purpose::URL_SAFE_NO_PAD, &result[..16])
    }

    /// Get unique identity IDs that found this entity
    pub fn unique_sources(&self) -> Vec<String> {
        self.sources
            .iter()
            .map(|s| s.identity_id.clone())
            .collect::<std::collections::HashSet<_>>()
            .into_iter()
            .collect()
    }

    /// Check if this is a cross-reference (found by multiple identities)
    pub fn is_cross_reference(&self) -> bool {
        self.unique_sources().len() > 1
    }
}
