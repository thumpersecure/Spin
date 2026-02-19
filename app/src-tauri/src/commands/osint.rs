//! OSINT Tool Commands
//!
//! Specialized Open Source Intelligence tools including:
//! - Phone number intelligence
//! - Email analysis
//! - Username enumeration
//! - Domain reconnaissance
//! - Image analysis helpers

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
    // Input length limit to prevent abuse
    if phone.len() > 1000 {
        return Err("Input too long: phone number must be under 1000 characters".to_string());
    }

    info!("Analyzing phone number: {}", phone);

    // Clean the input
    let cleaned: String = phone.chars().filter(|c| c.is_digit(10) || *c == '+').collect();

    if cleaned.is_empty() {
        return Err("Invalid phone number: no digits found".to_string());
    }

    // Validate minimum digit count (at least 7 digits for a valid phone number)
    let digit_count = cleaned.chars().filter(|c| c.is_ascii_digit()).count();
    if digit_count < 7 {
        return Err(format!(
            "Invalid phone number: expected at least 7 digits, found {}",
            digit_count
        ));
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

/// Email analysis result
#[derive(Debug, Serialize)]
pub struct EmailAnalysis {
    pub original: String,
    pub local_part: String,
    pub domain: String,
    pub provider_name: Option<String>,
    pub is_disposable: bool,
    pub is_free: bool,
    pub search_queries: Vec<SearchQuery>,
}

/// Username analysis result
#[derive(Debug, Serialize)]
pub struct UsernameAnalysis {
    pub username: String,
    pub platforms: Vec<PlatformCheck>,
    pub search_queries: Vec<SearchQuery>,
}

/// Platform check result for username
#[derive(Debug, Serialize)]
pub struct PlatformCheck {
    pub platform: String,
    pub url: String,
    pub icon: String,
}

/// Domain analysis result
#[derive(Debug, Serialize)]
pub struct DomainAnalysis {
    pub domain: String,
    pub search_queries: Vec<SearchQuery>,
    pub subdomains_url: String,
    pub whois_url: String,
    pub dns_url: String,
}

/// Analyze an email address
#[tauri::command]
pub async fn analyze_email(email: String) -> OsintResult<EmailAnalysis> {
    // Input length limit to prevent abuse
    if email.len() > 1000 {
        return Err("Input too long: email must be under 1000 characters".to_string());
    }

    info!("Analyzing email: {}", email);

    // Parse email
    let parts: Vec<&str> = email.split('@').collect();
    if parts.len() != 2 {
        return Err("Invalid email format: expected exactly one '@' character".to_string());
    }

    let local_part = parts[0].to_string();
    let domain = parts[1].to_string();

    // Validate local part is not empty
    if local_part.is_empty() {
        return Err("Invalid email format: local part (before @) cannot be empty".to_string());
    }

    // Validate domain format
    if domain.is_empty() {
        return Err("Invalid email format: domain (after @) cannot be empty".to_string());
    }
    if !domain.contains('.') {
        return Err("Invalid email format: domain must contain at least one dot".to_string());
    }
    // Check that domain doesn't start or end with a dot/hyphen and has valid characters
    if domain.starts_with('.') || domain.starts_with('-') || domain.ends_with('.') || domain.ends_with('-') {
        return Err("Invalid email format: domain cannot start or end with '.' or '-'".to_string());
    }
    // Ensure domain labels are not empty (no consecutive dots)
    if domain.contains("..") {
        return Err("Invalid email format: domain contains consecutive dots".to_string());
    }

    // Check common free providers
    let free_providers = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "protonmail.com", "icloud.com"];
    let is_free = free_providers.contains(&domain.to_lowercase().as_str());

    // Check disposable providers
    let disposable_providers = ["tempmail.com", "guerrillamail.com", "10minutemail.com", "mailinator.com"];
    let is_disposable = disposable_providers.contains(&domain.to_lowercase().as_str());

    let provider_name = match domain.to_lowercase().as_str() {
        "gmail.com" => Some("Google".to_string()),
        "yahoo.com" => Some("Yahoo".to_string()),
        "hotmail.com" | "outlook.com" => Some("Microsoft".to_string()),
        "protonmail.com" | "proton.me" => Some("Proton".to_string()),
        "icloud.com" => Some("Apple".to_string()),
        _ => None,
    };

    let search_queries = vec![
        SearchQuery {
            platform: "Google".to_string(),
            url: format!("https://www.google.com/search?q=\"{}\"", email),
            description: "Search Google for the email".to_string(),
        },
        SearchQuery {
            platform: "Have I Been Pwned".to_string(),
            url: format!("https://haveibeenpwned.com/account/{}", email),
            description: "Check for data breaches".to_string(),
        },
        SearchQuery {
            platform: "Hunter.io".to_string(),
            url: format!("https://hunter.io/email-verifier/{}", email),
            description: "Verify email and find related".to_string(),
        },
        SearchQuery {
            platform: "Gravatar".to_string(),
            url: format!("https://en.gravatar.com/{}", local_part),
            description: "Check for Gravatar profile".to_string(),
        },
        SearchQuery {
            platform: "GitHub".to_string(),
            url: format!("https://github.com/search?q={}&type=users", email),
            description: "Search GitHub for email".to_string(),
        },
        SearchQuery {
            platform: "LinkedIn".to_string(),
            url: format!("https://www.linkedin.com/search/results/people/?keywords={}", email),
            description: "Search LinkedIn".to_string(),
        },
    ];

    Ok(EmailAnalysis {
        original: email,
        local_part,
        domain,
        provider_name,
        is_disposable,
        is_free,
        search_queries,
    })
}

/// Analyze a username across platforms
#[tauri::command]
pub async fn analyze_username(username: String) -> OsintResult<UsernameAnalysis> {
    // Input length limit to prevent abuse
    if username.len() > 1000 {
        return Err("Input too long: username must be under 1000 characters".to_string());
    }

    info!("Analyzing username: {}", username);

    if username.is_empty() {
        return Err("Username cannot be empty".to_string());
    }

    let platforms = vec![
        PlatformCheck {
            platform: "Twitter/X".to_string(),
            url: format!("https://twitter.com/{}", username),
            icon: "brand-x".to_string(),
        },
        PlatformCheck {
            platform: "Instagram".to_string(),
            url: format!("https://instagram.com/{}", username),
            icon: "brand-instagram".to_string(),
        },
        PlatformCheck {
            platform: "GitHub".to_string(),
            url: format!("https://github.com/{}", username),
            icon: "brand-github".to_string(),
        },
        PlatformCheck {
            platform: "Reddit".to_string(),
            url: format!("https://reddit.com/user/{}", username),
            icon: "brand-reddit".to_string(),
        },
        PlatformCheck {
            platform: "LinkedIn".to_string(),
            url: format!("https://linkedin.com/in/{}", username),
            icon: "brand-linkedin".to_string(),
        },
        PlatformCheck {
            platform: "TikTok".to_string(),
            url: format!("https://tiktok.com/@{}", username),
            icon: "brand-tiktok".to_string(),
        },
        PlatformCheck {
            platform: "Facebook".to_string(),
            url: format!("https://facebook.com/{}", username),
            icon: "brand-facebook".to_string(),
        },
        PlatformCheck {
            platform: "YouTube".to_string(),
            url: format!("https://youtube.com/@{}", username),
            icon: "brand-youtube".to_string(),
        },
        PlatformCheck {
            platform: "Telegram".to_string(),
            url: format!("https://t.me/{}", username),
            icon: "brand-telegram".to_string(),
        },
        PlatformCheck {
            platform: "Keybase".to_string(),
            url: format!("https://keybase.io/{}", username),
            icon: "key".to_string(),
        },
        PlatformCheck {
            platform: "Medium".to_string(),
            url: format!("https://medium.com/@{}", username),
            icon: "brand-medium".to_string(),
        },
        PlatformCheck {
            platform: "Pinterest".to_string(),
            url: format!("https://pinterest.com/{}", username),
            icon: "brand-pinterest".to_string(),
        },
    ];

    let search_queries = vec![
        SearchQuery {
            platform: "WhatsMyName".to_string(),
            url: format!("https://whatsmyname.app/?q={}", username),
            description: "Check 500+ platforms".to_string(),
        },
        SearchQuery {
            platform: "Namechk".to_string(),
            url: format!("https://namechk.com/username-lookup/?q={}", username),
            description: "Username availability checker".to_string(),
        },
        SearchQuery {
            platform: "Google".to_string(),
            url: format!("https://www.google.com/search?q=\"{}\"", username),
            description: "Search Google for username".to_string(),
        },
    ];

    Ok(UsernameAnalysis {
        username,
        platforms,
        search_queries,
    })
}

/// Analyze a domain
#[tauri::command]
pub async fn analyze_domain(domain: String) -> OsintResult<DomainAnalysis> {
    if domain.is_empty() {
        return Err("Domain cannot be empty".to_string());
    }

    // Input length limit to prevent abuse
    if domain.len() > 1000 {
        return Err("Input too long: domain must be under 1000 characters".to_string());
    }

    info!("Analyzing domain: {}", domain);

    let search_queries = vec![
        SearchQuery {
            platform: "Shodan".to_string(),
            url: format!("https://www.shodan.io/search?query={}", domain),
            description: "Search Shodan for domain".to_string(),
        },
        SearchQuery {
            platform: "Censys".to_string(),
            url: format!("https://search.censys.io/search?resource=hosts&q={}", domain),
            description: "Search Censys for hosts".to_string(),
        },
        SearchQuery {
            platform: "crt.sh".to_string(),
            url: format!("https://crt.sh/?q={}", domain),
            description: "Certificate transparency".to_string(),
        },
        SearchQuery {
            platform: "SecurityTrails".to_string(),
            url: format!("https://securitytrails.com/domain/{}/dns", domain),
            description: "DNS history".to_string(),
        },
        SearchQuery {
            platform: "BuiltWith".to_string(),
            url: format!("https://builtwith.com/{}", domain),
            description: "Technology profiler".to_string(),
        },
        SearchQuery {
            platform: "Wayback Machine".to_string(),
            url: format!("https://web.archive.org/web/*/{}", domain),
            description: "Historical snapshots".to_string(),
        },
        SearchQuery {
            platform: "VirusTotal".to_string(),
            url: format!("https://www.virustotal.com/gui/domain/{}", domain),
            description: "Security analysis".to_string(),
        },
        SearchQuery {
            platform: "DNSDumpster".to_string(),
            url: format!("https://dnsdumpster.com/?search={}", domain),
            description: "DNS recon".to_string(),
        },
    ];

    Ok(DomainAnalysis {
        domain: domain.clone(),
        search_queries,
        subdomains_url: format!("https://crt.sh/?q=%.{}", domain),
        whois_url: format!("https://www.whois.com/whois/{}", domain),
        dns_url: format!("https://dnsdumpster.com/?search={}", domain),
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
