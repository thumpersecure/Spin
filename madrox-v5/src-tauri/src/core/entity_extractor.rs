//! Entity Extraction
//!
//! Regex-based extraction of entities from text content.

use crate::core::entity::EntityType;
use lazy_static::lazy_static;
use regex::Regex;
use std::collections::HashSet;

/// Maximum input text size (100KB) to prevent regex DoS
const MAX_INPUT_SIZE: usize = 100 * 1024;

lazy_static! {
    // Email pattern
    static ref EMAIL_REGEX: Regex = Regex::new(
        r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    ).unwrap();

    // Phone patterns (various formats)
    static ref PHONE_REGEX: Regex = Regex::new(
        r"(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}"
    ).unwrap();

    // IPv4 pattern
    static ref IPV4_REGEX: Regex = Regex::new(
        r"\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b"
    ).unwrap();

    // IPv6 pattern (simplified)
    static ref IPV6_REGEX: Regex = Regex::new(
        r"(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}"
    ).unwrap();

    // Domain pattern
    static ref DOMAIN_REGEX: Regex = Regex::new(
        r"\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b"
    ).unwrap();

    // URL pattern
    static ref URL_REGEX: Regex = Regex::new(
        r"https?://[^\s<>\[\]{}|\\^`\"]+"
    ).unwrap();

    // Username pattern (common formats: @user, /u/user)
    static ref USERNAME_REGEX: Regex = Regex::new(
        r"(?:@|/u/)[a-zA-Z0-9_]{3,30}"
    ).unwrap();

    // Hashtag pattern
    static ref HASHTAG_REGEX: Regex = Regex::new(
        r"#[a-zA-Z0-9_]{2,50}"
    ).unwrap();

    // Bitcoin address pattern
    static ref BITCOIN_REGEX: Regex = Regex::new(
        r"\b(?:1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}\b"
    ).unwrap();

    // Ethereum address pattern
    static ref ETHEREUM_REGEX: Regex = Regex::new(
        r"\b0x[a-fA-F0-9]{40}\b"
    ).unwrap();

    // Credit card pattern (basic, with separators)
    static ref CREDIT_CARD_REGEX: Regex = Regex::new(
        r"\b(?:4[0-9]{3}|5[1-5][0-9]{2}|6011|3[47][0-9]{2})[-\s]?[0-9]{4}[-\s]?[0-9]{4}[-\s]?[0-9]{4}\b"
    ).unwrap();

    // SSN pattern
    static ref SSN_REGEX: Regex = Regex::new(
        r"\b[0-9]{3}[-\s]?[0-9]{2}[-\s]?[0-9]{4}\b"
    ).unwrap();

    // MAC address pattern
    static ref MAC_REGEX: Regex = Regex::new(
        r"\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b"
    ).unwrap();

    // UUID pattern
    static ref UUID_REGEX: Regex = Regex::new(
        r"\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b"
    ).unwrap();

    // Coordinate pattern (lat, long)
    static ref COORDINATE_REGEX: Regex = Regex::new(
        r"-?(?:[0-9]{1,2}|1[0-7][0-9]|180)\.?[0-9]*,\s*-?(?:[0-9]{1,2}|1[0-7][0-9]|180)\.?[0-9]*"
    ).unwrap();
}

/// Extract a specific entity type from text
pub fn extract_type(text: &str, entity_type: &EntityType) -> Vec<String> {
    let regex = match entity_type {
        EntityType::Email => &*EMAIL_REGEX,
        EntityType::Phone => &*PHONE_REGEX,
        EntityType::IpV4 => &*IPV4_REGEX,
        EntityType::IpV6 => &*IPV6_REGEX,
        EntityType::Domain => &*DOMAIN_REGEX,
        EntityType::Url => &*URL_REGEX,
        EntityType::Username => &*USERNAME_REGEX,
        EntityType::Hashtag => &*HASHTAG_REGEX,
        EntityType::BitcoinAddress => &*BITCOIN_REGEX,
        EntityType::EthereumAddress => &*ETHEREUM_REGEX,
        EntityType::CreditCard => &*CREDIT_CARD_REGEX,
        EntityType::Ssn => &*SSN_REGEX,
        EntityType::MacAddress => &*MAC_REGEX,
        EntityType::Uuid => &*UUID_REGEX,
        EntityType::Coordinate => &*COORDINATE_REGEX,
        EntityType::Date | EntityType::Custom(_) => return vec![],
    };

    regex
        .find_iter(text)
        .map(|m| m.as_str().to_string())
        .collect()
}

/// Extract all entity types from text
///
/// Input text is truncated to MAX_INPUT_SIZE (100KB) to prevent regex DoS attacks.
pub fn extract_all(text: &str) -> Vec<(EntityType, String)> {
    // Enforce length limit to prevent regex DoS
    let text = if text.len() > MAX_INPUT_SIZE {
        &text[..MAX_INPUT_SIZE]
    } else {
        text
    };

    let mut results = Vec::new();
    let mut seen = HashSet::<(String, String)>::new();

    // Extract each type
    let types = [
        EntityType::Email,
        EntityType::Phone,
        EntityType::IpV4,
        EntityType::IpV6,
        EntityType::Url, // Extract URLs before domains
        EntityType::Domain,
        EntityType::Username,
        EntityType::Hashtag,
        EntityType::BitcoinAddress,
        EntityType::EthereumAddress,
        EntityType::CreditCard,
        EntityType::Ssn,
        EntityType::MacAddress,
        EntityType::Uuid,
        EntityType::Coordinate,
    ];

    for entity_type in types {
        for value in extract_type(text, &entity_type) {
            // Skip domains that are part of URLs or emails
            if entity_type == EntityType::Domain {
                let is_part_of_url = results.iter().any(|(t, v): &(EntityType, String)| {
                    *t == EntityType::Url && v.contains(&value)
                });
                let is_part_of_email = results.iter().any(|(t, v): &(EntityType, String)| {
                    *t == EntityType::Email && v.contains(&value)
                });
                if is_part_of_url || is_part_of_email {
                    continue;
                }
            }

            // HashSet-based dedup: only add if (type, value) pair is new
            let key = (format!("{:?}", entity_type), value.clone());
            if seen.insert(key) {
                results.push((entity_type.clone(), value));
            }
        }
    }

    results
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_email() {
        let text = "Contact us at test@example.com or support@domain.org";
        let emails = extract_type(text, &EntityType::Email);
        assert_eq!(emails.len(), 2);
        assert!(emails.contains(&"test@example.com".to_string()));
        assert!(emails.contains(&"support@domain.org".to_string()));
    }

    #[test]
    fn test_extract_phone() {
        let text = "Call us at (555) 123-4567 or +1-800-555-1234";
        let phones = extract_type(text, &EntityType::Phone);
        assert!(phones.len() >= 2);
    }

    #[test]
    fn test_extract_ip() {
        let text = "Server at 192.168.1.1 and backup at 10.0.0.255";
        let ips = extract_type(text, &EntityType::IpV4);
        assert_eq!(ips.len(), 2);
    }

    #[test]
    fn test_extract_bitcoin() {
        let text = "Send to 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
        let addrs = extract_type(text, &EntityType::BitcoinAddress);
        assert_eq!(addrs.len(), 1);
    }

    #[test]
    fn test_extract_all() {
        let text = "Email john@example.com, call 555-123-4567, or visit https://example.com";
        let entities = extract_all(text);
        assert!(entities.len() >= 3);
    }
}
