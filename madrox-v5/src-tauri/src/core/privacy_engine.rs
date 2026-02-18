//! Dynamic Privacy Engine
//!
//! AI-powered privacy system that automatically adjusts protection levels
//! based on website risk assessment and OPSEC requirements.
//!
//! "Privacy is not about hiding. It's about control."

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// OPSEC (Operational Security) Levels
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum OpsecLevel {
    /// Minimal protection - trusted sites
    Minimal = 0,
    /// Standard protection - general browsing
    Standard = 1,
    /// Enhanced protection - sensitive research
    Enhanced = 2,
    /// Maximum protection - high-risk investigation
    Maximum = 3,
    /// Paranoid mode - assume active adversary
    Paranoid = 4,
}

impl Default for OpsecLevel {
    fn default() -> Self {
        Self::Standard
    }
}

impl OpsecLevel {
    /// Get human-readable description
    pub fn description(&self) -> &'static str {
        match self {
            Self::Minimal => "Minimal protection for trusted sites",
            Self::Standard => "Standard protection for general browsing",
            Self::Enhanced => "Enhanced protection for sensitive research",
            Self::Maximum => "Maximum protection for high-risk investigation",
            Self::Paranoid => "Paranoid mode - assume active adversary",
        }
    }

    /// Get color for UI
    pub fn color(&self) -> &'static str {
        match self {
            Self::Minimal => "green",
            Self::Standard => "blue",
            Self::Enhanced => "yellow",
            Self::Maximum => "orange",
            Self::Paranoid => "red",
        }
    }
}

/// Website risk categories
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum RiskCategory {
    /// Trusted site (e.g., search engines, known OSINT tools)
    Trusted,
    /// General website
    General,
    /// Social media platform (high tracking)
    SocialMedia,
    /// Government/law enforcement site
    Government,
    /// Known surveillance/tracking site
    Surveillance,
    /// Potentially hostile (malware, phishing indicators)
    Hostile,
    /// Dark web / Tor hidden service
    DarkWeb,
    /// Unknown - requires analysis
    Unknown,
}

/// Risk assessment for a website
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskAssessment {
    /// Domain being assessed
    pub domain: String,

    /// Overall risk score (0-100)
    pub risk_score: u8,

    /// Risk category
    pub category: RiskCategory,

    /// Recommended OPSEC level
    pub recommended_opsec: OpsecLevel,

    /// Specific risk factors detected
    pub risk_factors: Vec<RiskFactor>,

    /// Privacy threats detected
    pub threats: Vec<PrivacyThreat>,

    /// Assessment timestamp
    pub assessed_at: DateTime<Utc>,

    /// Confidence in assessment (0.0-1.0)
    pub confidence: f32,
}

/// Individual risk factor
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskFactor {
    pub name: String,
    pub severity: u8, // 0-10
    pub description: String,
}

/// Privacy threat type
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PrivacyThreat {
    /// Third-party trackers
    Trackers { count: usize, domains: Vec<String> },
    /// Fingerprinting scripts
    Fingerprinting { techniques: Vec<String> },
    /// Cookie tracking
    Cookies { third_party: usize, persistent: usize },
    /// WebRTC leak potential
    WebRtcLeak,
    /// Canvas fingerprinting
    CanvasFingerprint,
    /// WebGL fingerprinting
    WebGlFingerprint,
    /// Audio fingerprinting
    AudioFingerprint,
    /// Font enumeration
    FontEnumeration,
    /// Screen resolution tracking
    ScreenTracking,
    /// Timezone/locale detection
    TimezoneDetection,
    /// Battery API access
    BatteryApi,
    /// Device sensor access
    SensorAccess,
    /// Clipboard access
    ClipboardAccess,
    /// Geolocation request
    Geolocation,
    /// Camera/microphone access
    MediaDevices,
}

/// Privacy protection settings
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrivacySettings {
    /// Current OPSEC level
    pub opsec_level: OpsecLevel,

    /// Auto-adjust based on site risk
    pub auto_adjust: bool,

    /// Block all trackers
    pub block_trackers: bool,

    /// Block fingerprinting
    pub block_fingerprinting: bool,

    /// Spoof canvas
    pub spoof_canvas: bool,

    /// Spoof WebGL
    pub spoof_webgl: bool,

    /// Spoof audio
    pub spoof_audio: bool,

    /// Block WebRTC
    pub block_webrtc: bool,

    /// Spoof timezone
    pub spoof_timezone: bool,

    /// Spoof screen resolution
    pub spoof_screen: bool,

    /// Spoof user agent
    pub spoof_user_agent: bool,

    /// Spoof fonts
    pub spoof_fonts: bool,

    /// Block third-party cookies
    pub block_third_party_cookies: bool,

    /// Clear cookies on tab close
    pub clear_cookies_on_close: bool,

    /// Use Tor
    pub use_tor: bool,

    /// DNS over HTTPS
    pub dns_over_https: bool,

    /// Block JavaScript (extreme)
    pub block_javascript: bool,
}

impl Default for PrivacySettings {
    fn default() -> Self {
        Self::for_level(OpsecLevel::Standard)
    }
}

impl PrivacySettings {
    /// Get settings for a specific OPSEC level
    pub fn for_level(level: OpsecLevel) -> Self {
        match level {
            OpsecLevel::Minimal => Self {
                opsec_level: level,
                auto_adjust: true,
                block_trackers: false,
                block_fingerprinting: false,
                spoof_canvas: false,
                spoof_webgl: false,
                spoof_audio: false,
                block_webrtc: false,
                spoof_timezone: false,
                spoof_screen: false,
                spoof_user_agent: false,
                spoof_fonts: false,
                block_third_party_cookies: false,
                clear_cookies_on_close: false,
                use_tor: false,
                dns_over_https: false,
                block_javascript: false,
            },
            OpsecLevel::Standard => Self {
                opsec_level: level,
                auto_adjust: true,
                block_trackers: true,
                block_fingerprinting: false,
                spoof_canvas: false,
                spoof_webgl: false,
                spoof_audio: false,
                block_webrtc: true,
                spoof_timezone: false,
                spoof_screen: false,
                spoof_user_agent: false,
                spoof_fonts: false,
                block_third_party_cookies: true,
                clear_cookies_on_close: false,
                use_tor: false,
                dns_over_https: true,
                block_javascript: false,
            },
            OpsecLevel::Enhanced => Self {
                opsec_level: level,
                auto_adjust: true,
                block_trackers: true,
                block_fingerprinting: true,
                spoof_canvas: true,
                spoof_webgl: true,
                spoof_audio: false,
                block_webrtc: true,
                spoof_timezone: true,
                spoof_screen: true,
                spoof_user_agent: true,
                spoof_fonts: false,
                block_third_party_cookies: true,
                clear_cookies_on_close: true,
                use_tor: false,
                dns_over_https: true,
                block_javascript: false,
            },
            OpsecLevel::Maximum => Self {
                opsec_level: level,
                auto_adjust: true,
                block_trackers: true,
                block_fingerprinting: true,
                spoof_canvas: true,
                spoof_webgl: true,
                spoof_audio: true,
                block_webrtc: true,
                spoof_timezone: true,
                spoof_screen: true,
                spoof_user_agent: true,
                spoof_fonts: true,
                block_third_party_cookies: true,
                clear_cookies_on_close: true,
                use_tor: true,
                dns_over_https: true,
                block_javascript: false,
            },
            OpsecLevel::Paranoid => Self {
                opsec_level: level,
                auto_adjust: false, // Manual control in paranoid mode
                block_trackers: true,
                block_fingerprinting: true,
                spoof_canvas: true,
                spoof_webgl: true,
                spoof_audio: true,
                block_webrtc: true,
                spoof_timezone: true,
                spoof_screen: true,
                spoof_user_agent: true,
                spoof_fonts: true,
                block_third_party_cookies: true,
                clear_cookies_on_close: true,
                use_tor: true,
                dns_over_https: true,
                block_javascript: true,
            },
        }
    }

    /// Count active protections
    pub fn active_protection_count(&self) -> usize {
        let mut count = 0;
        if self.block_trackers { count += 1; }
        if self.block_fingerprinting { count += 1; }
        if self.spoof_canvas { count += 1; }
        if self.spoof_webgl { count += 1; }
        if self.spoof_audio { count += 1; }
        if self.block_webrtc { count += 1; }
        if self.spoof_timezone { count += 1; }
        if self.spoof_screen { count += 1; }
        if self.spoof_user_agent { count += 1; }
        if self.spoof_fonts { count += 1; }
        if self.block_third_party_cookies { count += 1; }
        if self.clear_cookies_on_close { count += 1; }
        if self.use_tor { count += 1; }
        if self.dns_over_https { count += 1; }
        if self.block_javascript { count += 1; }
        count
    }
}

/// Known tracker domains
pub const TRACKER_DOMAINS: &[&str] = &[
    "google-analytics.com",
    "googletagmanager.com",
    "doubleclick.net",
    "facebook.com",
    "facebook.net",
    "fbcdn.net",
    "twitter.com",
    "ads.twitter.com",
    "analytics.twitter.com",
    "linkedin.com",
    "ads.linkedin.com",
    "tiktok.com",
    "analytics.tiktok.com",
    "hotjar.com",
    "mixpanel.com",
    "segment.com",
    "amplitude.com",
    "fullstory.com",
    "mouseflow.com",
    "crazyegg.com",
    "optimizely.com",
    "taboola.com",
    "outbrain.com",
    "criteo.com",
    "adsrvr.org",
    "rubiconproject.com",
    "pubmatic.com",
    "openx.net",
    "adnxs.com",
    "googlesyndication.com",
    "amazon-adsystem.com",
    "quantserve.com",
    "scorecardresearch.com",
    "comscore.com",
    "newrelic.com",
    "nr-data.net",
    "sentry.io",
    "bugsnag.com",
    "rollbar.com",
    "logrocket.com",
    "clarity.ms",
    "bing.com/bat.js",
    "snap.licdn.com",
    "connect.facebook.net",
    "static.ads-twitter.com",
    "byteoversea.com",
    "ttwstatic.com",
    "plausible.io",
    "heap.io",
    "intercom.io",
    "drift.com",
    "hubspot.com",
    "marketo.com",
    "pardot.com",
    "salesforce.com",
];

/// Trusted OSINT domains
pub const TRUSTED_OSINT_DOMAINS: &[&str] = &[
    "shodan.io",
    "censys.io",
    "virustotal.com",
    "haveibeenpwned.com",
    "hunter.io",
    "securitytrails.com",
    "dnsdumpster.com",
    "crt.sh",
    "urlscan.io",
    "hybrid-analysis.com",
    "any.run",
    "tineye.com",
    "archive.org",
    "web.archive.org",
    "whois.domaintools.com",
    "greynoise.io",
    "binaryedge.io",
    "zoomeye.org",
    "intelx.io",
    "pulsedive.com",
];

/// Social media domains (high tracking)
pub const SOCIAL_MEDIA_DOMAINS: &[&str] = &[
    "facebook.com",
    "twitter.com",
    "x.com",
    "instagram.com",
    "linkedin.com",
    "tiktok.com",
    "reddit.com",
    "youtube.com",
    "pinterest.com",
    "snapchat.com",
    "tumblr.com",
    "discord.com",
    "telegram.org",
    "whatsapp.com",
    "threads.net",
    "mastodon.social",
    "bsky.app",
    "truth.social",
];

/// Government/law enforcement domains
pub const GOVERNMENT_DOMAINS: &[&str] = &[
    ".gov",
    ".mil",
    ".gov.uk",
    ".gov.au",
    ".gc.ca",
    ".gob.mx",
    ".gouv.fr",
];

/// Assess risk for a domain
pub fn assess_domain_risk(domain: &str) -> RiskAssessment {
    let domain_lower = domain.to_lowercase();
    let mut risk_factors = Vec::new();
    let mut threats = Vec::new();
    let mut risk_score: u8 = 30; // Base score

    // Check category and assign dynamic confidence based on category
    let (category, mut confidence) = if TRUSTED_OSINT_DOMAINS.iter().any(|d| domain_lower.contains(d)) {
        risk_score = 10;
        (RiskCategory::Trusted, 0.95_f32)
    } else if SOCIAL_MEDIA_DOMAINS.iter().any(|d| domain_lower.contains(d)) {
        risk_score = 70;
        risk_factors.push(RiskFactor {
            name: "Social Media Platform".to_string(),
            severity: 7,
            description: "High tracking and fingerprinting".to_string(),
        });
        threats.push(PrivacyThreat::Trackers {
            count: 10,
            domains: vec!["analytics".to_string(), "ads".to_string()],
        });
        threats.push(PrivacyThreat::Fingerprinting {
            techniques: vec!["canvas".to_string(), "webgl".to_string()],
        });
        (RiskCategory::SocialMedia, 0.90_f32)
    } else if GOVERNMENT_DOMAINS.iter().any(|d| domain_lower.ends_with(d)) {
        risk_score = 60;
        risk_factors.push(RiskFactor {
            name: "Government Domain".to_string(),
            severity: 6,
            description: "Potential logging and surveillance".to_string(),
        });
        (RiskCategory::Government, 0.80_f32)
    } else if domain_lower.ends_with(".onion") {
        risk_score = 50;
        risk_factors.push(RiskFactor {
            name: "Dark Web Service".to_string(),
            severity: 5,
            description: "Tor hidden service".to_string(),
        });
        (RiskCategory::DarkWeb, 0.70_f32)
    } else {
        (RiskCategory::General, 0.60_f32)
    };

    // Check for known trackers in domain
    if TRACKER_DOMAINS.iter().any(|t| domain_lower.contains(t)) {
        risk_score = risk_score.saturating_add(20);
        risk_factors.push(RiskFactor {
            name: "Known Tracker".to_string(),
            severity: 8,
            description: "Domain is a known tracking service".to_string(),
        });
        // Known trackers increase confidence (capped at 1.0)
        confidence = (confidence + 0.10).min(1.0);
    }

    // Determine recommended OPSEC level
    let recommended_opsec = match risk_score {
        0..=20 => OpsecLevel::Minimal,
        21..=40 => OpsecLevel::Standard,
        41..=60 => OpsecLevel::Enhanced,
        61..=80 => OpsecLevel::Maximum,
        _ => OpsecLevel::Paranoid,
    };

    RiskAssessment {
        domain: domain.to_string(),
        risk_score,
        category,
        recommended_opsec,
        risk_factors,
        threats,
        assessed_at: Utc::now(),
        confidence,
    }
}

/// Privacy statistics
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PrivacyStats {
    pub trackers_blocked: u64,
    pub fingerprint_attempts_blocked: u64,
    pub cookies_blocked: u64,
    pub webrtc_leaks_prevented: u64,
    pub dns_queries_protected: u64,
    pub scripts_blocked: u64,
    pub sites_assessed: u64,
    pub high_risk_sites_visited: u64,
    pub auto_escalations: u64,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_assess_trusted_domain() {
        let assessment = assess_domain_risk("shodan.io");
        assert_eq!(assessment.category, RiskCategory::Trusted);
        assert!(assessment.risk_score <= 20);
    }

    #[test]
    fn test_assess_social_media() {
        let assessment = assess_domain_risk("facebook.com");
        assert_eq!(assessment.category, RiskCategory::SocialMedia);
        assert!(assessment.risk_score >= 60);
    }

    #[test]
    fn test_opsec_levels() {
        let settings = PrivacySettings::for_level(OpsecLevel::Maximum);
        assert!(settings.use_tor);
        assert!(settings.spoof_canvas);
        assert!(settings.block_trackers);
    }
}
