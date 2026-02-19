//! Fingerprint Generation
//!
//! Each identity has a unique browser fingerprint to prevent tracking
//! and maintain separation between dupes.

use rand::seq::SliceRandom;
use rand::Rng;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

/// Browser fingerprint for an identity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Fingerprint {
    /// Unique fingerprint ID
    pub id: String,

    /// User agent string
    pub user_agent: String,

    /// Platform (Win32, MacIntel, Linux x86_64)
    pub platform: String,

    /// Screen resolution
    pub screen: ScreenConfig,

    /// WebGL vendor/renderer
    pub webgl: WebGLConfig,

    /// Canvas noise seed
    pub canvas_seed: u64,

    /// Timezone offset in minutes
    pub timezone_offset: i32,

    /// Language preferences
    pub languages: Vec<String>,

    /// Hardware concurrency (CPU cores)
    pub hardware_concurrency: u8,

    /// Device memory in GB
    pub device_memory: u8,

    /// Touch support
    pub touch_support: bool,

    /// Color depth
    pub color_depth: u8,
}

/// Screen configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScreenConfig {
    pub width: u32,
    pub height: u32,
    pub available_width: u32,
    pub available_height: u32,
    pub pixel_ratio: f32,
}

/// WebGL configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebGLConfig {
    pub vendor: String,
    pub renderer: String,
}

/// Common user agents for randomization
const USER_AGENTS: &[&str] = &[
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
    // 2024/2025 browser versions
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:128.0) Gecko/20100101 Firefox/128.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
];

/// Common screen resolutions
const SCREEN_RESOLUTIONS: &[(u32, u32)] = &[
    (1920, 1080),
    (2560, 1440),
    (1366, 768),
    (1536, 864),
    (1440, 900),
    (1280, 720),
    (3840, 2160),
    (1600, 900),
    (2560, 1600),
];

/// WebGL vendors/renderers
const WEBGL_CONFIGS: &[(&str, &str)] = &[
    ("Google Inc. (NVIDIA)", "ANGLE (NVIDIA GeForce GTX 1060 Direct3D11 vs_5_0 ps_5_0)"),
    ("Google Inc. (Intel)", "ANGLE (Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0)"),
    ("Google Inc. (AMD)", "ANGLE (AMD Radeon RX 580 Direct3D11 vs_5_0 ps_5_0)"),
    ("Intel Inc.", "Intel Iris Plus Graphics OpenGL Engine"),
    ("Apple", "Apple M1"),
];

/// Timezones (offset in minutes from UTC)
const TIMEZONES: &[i32] = &[
    -480,  // PST
    -420,  // MST
    -360,  // CST
    -300,  // EST
    0,     // UTC
    60,    // CET
    120,   // EET
];

/// Generate a new random fingerprint
pub fn generate_fingerprint() -> Fingerprint {
    let mut rng = rand::thread_rng();

    // Select random configurations
    let user_agent = USER_AGENTS[rng.gen_range(0..USER_AGENTS.len())].to_string();
    let (width, height) = SCREEN_RESOLUTIONS[rng.gen_range(0..SCREEN_RESOLUTIONS.len())];
    let (vendor, renderer) = WEBGL_CONFIGS[rng.gen_range(0..WEBGL_CONFIGS.len())];
    let timezone_offset = TIMEZONES[rng.gen_range(0..TIMEZONES.len())];

    // Determine platform from user agent
    let platform = if user_agent.contains("Windows") {
        "Win32".to_string()
    } else if user_agent.contains("Macintosh") {
        "MacIntel".to_string()
    } else {
        "Linux x86_64".to_string()
    };

    // Generate unique ID
    let id = generate_fingerprint_id(&user_agent, width, height, vendor);

    Fingerprint {
        id,
        user_agent,
        platform,
        screen: ScreenConfig {
            width,
            height,
            available_width: width,
            available_height: height - rng.gen_range(30..60), // Taskbar
            pixel_ratio: if rng.gen_bool(0.3) { 2.0 } else { 1.0 },
        },
        webgl: WebGLConfig {
            vendor: vendor.to_string(),
            renderer: renderer.to_string(),
        },
        canvas_seed: rng.gen(),
        timezone_offset,
        languages: vec!["en-US".to_string(), "en".to_string()],
        hardware_concurrency: rng.gen_range(2..=16),
        device_memory: *[2, 4, 8, 16, 32].choose(&mut rng).unwrap(),
        touch_support: rng.gen_bool(0.2),
        color_depth: 24,
    }
}

/// Generate a unique fingerprint ID from key attributes
fn generate_fingerprint_id(user_agent: &str, width: u32, height: u32, vendor: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(user_agent.as_bytes());
    hasher.update(width.to_le_bytes());
    hasher.update(height.to_le_bytes());
    hasher.update(vendor.as_bytes());
    hasher.update(rand::thread_rng().gen::<[u8; 16]>());

    let result = hasher.finalize();
    // Use 8 bytes of randomness instead of 4 for improved entropy
    let short_hash = &result[..8];

    // Extended Greek/NATO alphabet names for more varied identity naming
    let greek = [
        "Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta",
        "Iota", "Kappa", "Lambda", "Mu", "Nu", "Xi", "Omicron", "Pi",
        "Rho", "Sigma", "Tau", "Upsilon", "Phi", "Chi", "Psi", "Omega",
    ];
    let index = ((short_hash[0] as usize) | ((short_hash[1] as usize) << 8)) % greek.len();
    let suffix = format!(
        "{:X}{:X}{:X}{:X}{:X}{:X}",
        short_hash[2] % 16,
        short_hash[3] % 16,
        short_hash[4] % 16,
        short_hash[5] % 16,
        short_hash[6] % 16,
        short_hash[7] % 16,
    );

    format!("{}-{}", greek[index], suffix)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_fingerprint() {
        let fp = generate_fingerprint();
        assert!(!fp.id.is_empty());
        assert!(!fp.user_agent.is_empty());
        assert!(fp.screen.width > 0);
        assert!(fp.screen.height > 0);
    }

    #[test]
    fn test_fingerprints_unique() {
        let fp1 = generate_fingerprint();
        let fp2 = generate_fingerprint();
        assert_ne!(fp1.id, fp2.id);
    }
}
