//! Privacy Commands
//!
//! IPC handlers for the Dynamic Privacy Engine.

use crate::core::privacy_engine::{
    assess_domain_risk, OpsecLevel, PrivacySettings, PrivacyStats, RiskAssessment,
};
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use std::sync::RwLock;
use tracing::{info, debug};

/// Privacy state container
struct PrivacyState {
    settings: PrivacySettings,
    stats: PrivacyStats,
    site_assessments: std::collections::HashMap<String, RiskAssessment>,
}

impl PrivacyState {
    fn new() -> Self {
        Self {
            settings: PrivacySettings {
                opsec_level: OpsecLevel::Standard,
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
            stats: PrivacyStats {
                trackers_blocked: 0,
                fingerprint_attempts_blocked: 0,
                cookies_blocked: 0,
                webrtc_leaks_prevented: 0,
                dns_queries_protected: 0,
                scripts_blocked: 0,
                sites_assessed: 0,
                high_risk_sites_visited: 0,
                auto_escalations: 0,
            },
            site_assessments: std::collections::HashMap::new(),
        }
    }
}

/// Global privacy state
lazy_static! {
    static ref PRIVACY_STATE: RwLock<PrivacyState> = RwLock::new(PrivacyState::new());
}

/// Result type for privacy operations
pub type PrivacyResult<T> = Result<T, String>;

/// Get current privacy settings
#[tauri::command]
pub async fn get_privacy_settings() -> PrivacyResult<PrivacySettings> {
    let state = PRIVACY_STATE.read().map_err(|e| format!("Lock poisoned: {}", e))?;
    Ok(state.settings.clone())
}

/// Update privacy settings
#[tauri::command]
pub async fn set_privacy_settings(settings: PrivacySettings) -> PrivacyResult<()> {
    info!("Updating privacy settings to OPSEC level: {:?}", settings.opsec_level);
    let mut state = PRIVACY_STATE.write().map_err(|e| format!("Lock poisoned: {}", e))?;
    state.settings = settings;
    Ok(())
}

/// Set OPSEC level (quick toggle)
#[tauri::command]
pub async fn set_opsec_level(level: OpsecLevel) -> PrivacyResult<PrivacySettings> {
    info!("Setting OPSEC level to: {:?}", level);
    let mut state = PRIVACY_STATE.write().map_err(|e| format!("Lock poisoned: {}", e))?;
    state.settings = PrivacySettings::for_level(level);
    Ok(state.settings.clone())
}

/// Get current OPSEC level
#[tauri::command]
pub async fn get_opsec_level() -> PrivacyResult<OpsecLevel> {
    let state = PRIVACY_STATE.read().map_err(|e| format!("Lock poisoned: {}", e))?;
    Ok(state.settings.opsec_level)
}

/// Assess risk for a URL/domain
#[tauri::command]
pub async fn assess_site_risk(url: String) -> PrivacyResult<RiskAssessment> {
    // Extract domain from URL
    let domain = extract_domain(&url).unwrap_or_else(|| url.clone());

    debug!("Assessing risk for domain: {}", domain);

    let assessment = assess_domain_risk(&domain);

    // Cache the assessment
    {
        let mut state = PRIVACY_STATE.write().map_err(|e| format!("Lock poisoned: {}", e))?;
        state.stats.sites_assessed += 1;
        if assessment.risk_score >= 60 {
            state.stats.high_risk_sites_visited += 1;
        }
        state.site_assessments.insert(domain.clone(), assessment.clone());
    }

    info!(
        "Domain {} assessed: risk={}, category={:?}, recommended_opsec={:?}",
        domain, assessment.risk_score, assessment.category, assessment.recommended_opsec
    );

    Ok(assessment)
}

/// Auto-adjust privacy based on site assessment
#[tauri::command]
pub async fn auto_adjust_privacy(url: String) -> PrivacyResult<PrivacySettings> {
    let domain = extract_domain(&url).unwrap_or_else(|| url.clone());
    let assessment = assess_domain_risk(&domain);

    let mut state = PRIVACY_STATE.write().map_err(|e| format!("Lock poisoned: {}", e))?;

    if !state.settings.auto_adjust {
        return Ok(state.settings.clone());
    }

    // Only escalate, never downgrade automatically
    if assessment.recommended_opsec > state.settings.opsec_level {
        info!(
            "Auto-escalating OPSEC from {:?} to {:?} for {}",
            state.settings.opsec_level, assessment.recommended_opsec, domain
        );
        state.settings = PrivacySettings::for_level(assessment.recommended_opsec);
        state.stats.auto_escalations += 1;
    }

    Ok(state.settings.clone())
}

/// Get privacy statistics
#[tauri::command]
pub async fn get_privacy_stats() -> PrivacyResult<PrivacyStats> {
    let state = PRIVACY_STATE.read().map_err(|e| format!("Lock poisoned: {}", e))?;
    Ok(state.stats.clone())
}

/// Record a blocked tracker
#[tauri::command]
pub async fn record_blocked_tracker(domain: String) -> PrivacyResult<()> {
    debug!("Blocked tracker: {}", domain);
    let mut state = PRIVACY_STATE.write().map_err(|e| format!("Lock poisoned: {}", e))?;
    state.stats.trackers_blocked += 1;
    Ok(())
}

/// Record a blocked fingerprint attempt
#[tauri::command]
pub async fn record_blocked_fingerprint(technique: String) -> PrivacyResult<()> {
    debug!("Blocked fingerprint attempt: {}", technique);
    let mut state = PRIVACY_STATE.write().map_err(|e| format!("Lock poisoned: {}", e))?;
    state.stats.fingerprint_attempts_blocked += 1;
    Ok(())
}

/// Get cached site assessments
#[tauri::command]
pub async fn get_site_assessments() -> PrivacyResult<Vec<RiskAssessment>> {
    let state = PRIVACY_STATE.read().map_err(|e| format!("Lock poisoned: {}", e))?;
    Ok(state.site_assessments.values().cloned().collect())
}

/// Clear privacy statistics
#[tauri::command]
pub async fn clear_privacy_stats() -> PrivacyResult<()> {
    let mut state = PRIVACY_STATE.write().map_err(|e| format!("Lock poisoned: {}", e))?;
    state.stats = PrivacyStats::default();
    state.site_assessments.clear();
    Ok(())
}

/// Extract domain from URL
fn extract_domain(url: &str) -> Option<String> {
    let url = url.trim();

    // Remove protocol
    let without_protocol = url
        .strip_prefix("https://")
        .or_else(|| url.strip_prefix("http://"))
        .unwrap_or(url);

    // Get domain part (before first /)
    let domain = without_protocol
        .split('/')
        .next()
        .unwrap_or(without_protocol);

    // Remove port if present
    let domain = domain.split(':').next().unwrap_or(domain);

    if domain.is_empty() {
        None
    } else {
        Some(domain.to_lowercase())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_domain() {
        assert_eq!(
            extract_domain("https://www.example.com/path"),
            Some("www.example.com".to_string())
        );
        assert_eq!(
            extract_domain("http://example.com:8080/"),
            Some("example.com".to_string())
        );
    }
}
