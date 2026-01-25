//! OSINT Tool Commands
//!
//! Specialized Open Source Intelligence tools.

use serde::{Deserialize, Serialize};
use tracing::info;

/// Result type for OSINT operations
pub type OsintResult<T> = Result<T, String>;

/// Phone analysis result
#[derive(Debug, Serialize)]
pub struct PhoneAnalysis {
    pub original: String,
    pub e164: Option<String>,
    pub national: Option<String>,
    pub international: Option<String>,
    pub country_code: Option<String>,
    pub country_name: Option<String>,
    pub carrier: Option<String>,
    pub line_type: Option<String>,
    pub formats: Vec<String>,
    pub search_queries: Vec<SearchQuery>,
}

/// Search query for OSINT platforms
#[derive(Debug, Serialize)]
pub struct SearchQuery {
    pub platform: String,
    pub url: String,
    pub description: String,
}

/// OSINT bookmark
#[derive(Debug, Serialize)]
pub struct OsintBookmark {
    pub id: String,
    pub name: String,
    pub url: String,
    pub category: String,
    pub description: String,
    pub icon: Option<String>,
}

/// Analyze a phone number
#[tauri::command]
pub async fn analyze_phone(phone: String) -> OsintResult<PhoneAnalysis> {
    info!("Analyzing phone number: {}", phone);

    // Clean the input
    let cleaned: String = phone.chars().filter(|c| c.is_digit(10) || *c == '+').collect();

    if cleaned.is_empty() {
        return Err("Invalid phone number".to_string());
    }

    // Generate various formats
    let mut formats = Vec::new();

    // Basic formats
    formats.push(cleaned.clone());

    if cleaned.starts_with('+') {
        // International format
        let without_plus = cleaned.trim_start_matches('+');
        formats.push(without_plus.to_string());
        formats.push(format!("00{}", without_plus));
    }

    // US format variations if it looks like a US number
    if cleaned.starts_with("+1") || cleaned.len() == 10 {
        let digits = cleaned.trim_start_matches('+').trim_start_matches('1');
        if digits.len() == 10 {
            let area = &digits[0..3];
            let exchange = &digits[3..6];
            let subscriber = &digits[6..10];

            formats.push(format!("({}) {}-{}", area, exchange, subscriber));
            formats.push(format!("{}-{}-{}", area, exchange, subscriber));
            formats.push(format!("{}.{}.{}", area, exchange, subscriber));
            formats.push(format!("{} {} {}", area, exchange, subscriber));
            formats.push(format!("1-{}-{}-{}", area, exchange, subscriber));
            formats.push(format!("+1 ({}) {}-{}", area, exchange, subscriber));
        }
    }

    // Generate search queries
    let search_queries = vec![
        SearchQuery {
            platform: "Google".to_string(),
            url: format!("https://www.google.com/search?q=\"{}\"", cleaned),
            description: "Search Google for the phone number".to_string(),
        },
        SearchQuery {
            platform: "Truecaller".to_string(),
            url: format!("https://www.truecaller.com/search/{}", cleaned.trim_start_matches('+')),
            description: "Look up on Truecaller".to_string(),
        },
        SearchQuery {
            platform: "NumLookup".to_string(),
            url: format!("https://www.numlookup.com/search?q={}", cleaned),
            description: "Free phone number lookup".to_string(),
        },
        SearchQuery {
            platform: "Sync.me".to_string(),
            url: format!("https://sync.me/search/?number={}", cleaned),
            description: "Sync.me phone lookup".to_string(),
        },
        SearchQuery {
            platform: "Facebook".to_string(),
            url: format!("https://www.facebook.com/search/people/?q={}", cleaned),
            description: "Search Facebook for associated profiles".to_string(),
        },
    ];

    Ok(PhoneAnalysis {
        original: phone,
        e164: Some(cleaned.clone()),
        national: None,
        international: Some(cleaned.clone()),
        country_code: None,
        country_name: None,
        carrier: None,
        line_type: None,
        formats,
        search_queries,
    })
}

/// Get OSINT bookmarks
#[tauri::command]
pub async fn get_osint_bookmarks() -> OsintResult<Vec<OsintBookmark>> {
    let bookmarks = vec![
        // Username Search
        OsintBookmark {
            id: "namechk".to_string(),
            name: "Namechk".to_string(),
            url: "https://namechk.com/".to_string(),
            category: "Username Search".to_string(),
            description: "Check username availability across platforms".to_string(),
            icon: Some("user".to_string()),
        },
        OsintBookmark {
            id: "whatsmyname".to_string(),
            name: "WhatsMyName".to_string(),
            url: "https://whatsmyname.app/".to_string(),
            category: "Username Search".to_string(),
            description: "Username enumeration tool".to_string(),
            icon: Some("search".to_string()),
        },

        // Email Search
        OsintBookmark {
            id: "hunter".to_string(),
            name: "Hunter.io".to_string(),
            url: "https://hunter.io/".to_string(),
            category: "Email Search".to_string(),
            description: "Find email addresses associated with domains".to_string(),
            icon: Some("mail".to_string()),
        },
        OsintBookmark {
            id: "hibp".to_string(),
            name: "Have I Been Pwned".to_string(),
            url: "https://haveibeenpwned.com/".to_string(),
            category: "Email Search".to_string(),
            description: "Check if email was in a data breach".to_string(),
            icon: Some("alert-triangle".to_string()),
        },

        // Domain & IP
        OsintBookmark {
            id: "shodan".to_string(),
            name: "Shodan".to_string(),
            url: "https://www.shodan.io/".to_string(),
            category: "Domain & IP".to_string(),
            description: "Search engine for internet-connected devices".to_string(),
            icon: Some("server".to_string()),
        },
        OsintBookmark {
            id: "censys".to_string(),
            name: "Censys".to_string(),
            url: "https://search.censys.io/".to_string(),
            category: "Domain & IP".to_string(),
            description: "Internet asset discovery".to_string(),
            icon: Some("globe".to_string()),
        },
        OsintBookmark {
            id: "crtsh".to_string(),
            name: "crt.sh".to_string(),
            url: "https://crt.sh/".to_string(),
            category: "Domain & IP".to_string(),
            description: "Certificate transparency logs".to_string(),
            icon: Some("lock".to_string()),
        },

        // Image Analysis
        OsintBookmark {
            id: "tineye".to_string(),
            name: "TinEye".to_string(),
            url: "https://tineye.com/".to_string(),
            category: "Image Analysis".to_string(),
            description: "Reverse image search".to_string(),
            icon: Some("image".to_string()),
        },
        OsintBookmark {
            id: "pimeyes".to_string(),
            name: "PimEyes".to_string(),
            url: "https://pimeyes.com/".to_string(),
            category: "Image Analysis".to_string(),
            description: "Face recognition search".to_string(),
            icon: Some("user".to_string()),
        },

        // Archives
        OsintBookmark {
            id: "wayback".to_string(),
            name: "Wayback Machine".to_string(),
            url: "https://web.archive.org/".to_string(),
            category: "Archives".to_string(),
            description: "Historical website snapshots".to_string(),
            icon: Some("clock".to_string()),
        },

        // Threat Intelligence
        OsintBookmark {
            id: "virustotal".to_string(),
            name: "VirusTotal".to_string(),
            url: "https://www.virustotal.com/".to_string(),
            category: "Threat Intelligence".to_string(),
            description: "Analyze files and URLs for malware".to_string(),
            icon: Some("shield".to_string()),
        },
        OsintBookmark {
            id: "abuseipdb".to_string(),
            name: "AbuseIPDB".to_string(),
            url: "https://www.abuseipdb.com/".to_string(),
            category: "Threat Intelligence".to_string(),
            description: "IP address abuse reports".to_string(),
            icon: Some("alert-circle".to_string()),
        },
    ];

    Ok(bookmarks)
}
