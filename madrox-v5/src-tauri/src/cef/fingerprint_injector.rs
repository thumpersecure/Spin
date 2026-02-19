//! Fingerprint Injection System
//!
//! Generates JavaScript injection scripts that override browser APIs to match
//! the identity's assigned fingerprint. This runs before any page scripts via
//! Chrome DevTools Protocol (CDP) Page.addScriptToEvaluateOnNewDocument.
//!
//! Spoofing targets:
//! - navigator.userAgent, platform, hardwareConcurrency, deviceMemory
//! - screen.width/height, availWidth/availHeight, colorDepth, pixelDepth
//! - canvas toDataURL/toBlob (noise injection via canvas seed)
//! - WebGL getParameter (vendor, renderer)
//! - AudioContext (deterministic noise)
//! - Timezone (DateTimeFormat, getTimezoneOffset)
//! - WebRTC (IP leak prevention)
//! - Font enumeration (limited font list)

use crate::core::fingerprint::Fingerprint;
use serde::{Deserialize, Serialize};

/// Configuration for what to spoof
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InjectionConfig {
    pub spoof_navigator: bool,
    pub spoof_screen: bool,
    pub spoof_canvas: bool,
    pub spoof_webgl: bool,
    pub spoof_audio: bool,
    pub spoof_timezone: bool,
    pub block_webrtc: bool,
    pub spoof_fonts: bool,
    pub spoof_plugins: bool,
    pub spoof_battery: bool,
}

impl Default for InjectionConfig {
    fn default() -> Self {
        Self {
            spoof_navigator: true,
            spoof_screen: true,
            spoof_canvas: true,
            spoof_webgl: true,
            spoof_audio: true,
            spoof_timezone: true,
            block_webrtc: true,
            spoof_fonts: true,
            spoof_plugins: true,
            spoof_battery: true,
        }
    }
}

/// Generate the complete fingerprint injection script for a given identity fingerprint
pub fn generate_injection_script(fingerprint: &Fingerprint, config: &InjectionConfig) -> String {
    let mut script = String::with_capacity(8192);

    script.push_str("(function() {\n");
    script.push_str("  'use strict';\n");
    script.push_str("  // MADROX Jessica Jones v12 - Fingerprint Injection\n");
    script.push_str("  // This script runs before any page JavaScript\n\n");

    if config.spoof_navigator {
        script.push_str(&generate_navigator_spoof(fingerprint));
    }

    if config.spoof_screen {
        script.push_str(&generate_screen_spoof(fingerprint));
    }

    if config.spoof_canvas {
        script.push_str(&generate_canvas_spoof(fingerprint));
    }

    if config.spoof_webgl {
        script.push_str(&generate_webgl_spoof(fingerprint));
    }

    if config.spoof_audio {
        script.push_str(&generate_audio_spoof(fingerprint));
    }

    if config.spoof_timezone {
        script.push_str(&generate_timezone_spoof(fingerprint));
    }

    if config.block_webrtc {
        script.push_str(&generate_webrtc_block());
    }

    if config.spoof_fonts {
        script.push_str(&generate_font_spoof());
    }

    if config.spoof_plugins {
        script.push_str(&generate_plugin_spoof());
    }

    if config.spoof_battery {
        script.push_str(&generate_battery_spoof());
    }

    script.push_str("})();\n");
    script
}

/// Navigator property spoofing
fn generate_navigator_spoof(fp: &Fingerprint) -> String {
    format!(
        r#"
  // Navigator spoofing
  const navProps = {{
    userAgent: {user_agent},
    platform: {platform},
    hardwareConcurrency: {hw_concurrency},
    deviceMemory: {device_memory},
    maxTouchPoints: {max_touch},
    language: {language},
    languages: {languages},
    vendor: 'Google Inc.',
    appVersion: {user_agent}.replace('Mozilla/', ''),
    doNotTrack: '1',
  }};

  for (const [key, value] of Object.entries(navProps)) {{
    try {{
      Object.defineProperty(Navigator.prototype, key, {{
        get: () => value,
        configurable: true,
      }});
    }} catch (e) {{}}
  }}

  // Spoof navigator.connection
  try {{
    Object.defineProperty(Navigator.prototype, 'connection', {{
      get: () => ({{
        effectiveType: '4g',
        downlink: 10,
        rtt: 50,
        saveData: false,
      }}),
      configurable: true,
    }});
  }} catch (e) {{}}

"#,
        user_agent = serde_json::to_string(&fp.user_agent).unwrap_or_default(),
        platform = serde_json::to_string(&fp.platform).unwrap_or_default(),
        hw_concurrency = fp.hardware_concurrency,
        device_memory = fp.device_memory,
        max_touch = if fp.touch_support { 5 } else { 0 },
        language = serde_json::to_string(fp.languages.first().unwrap_or(&"en-US".to_string()))
            .unwrap_or_default(),
        languages = serde_json::to_string(&fp.languages).unwrap_or_default(),
    )
}

/// Screen property spoofing
fn generate_screen_spoof(fp: &Fingerprint) -> String {
    format!(
        r#"
  // Screen spoofing
  const screenProps = {{
    width: {width},
    height: {height},
    availWidth: {avail_width},
    availHeight: {avail_height},
    colorDepth: {color_depth},
    pixelDepth: {color_depth},
  }};

  for (const [key, value] of Object.entries(screenProps)) {{
    try {{
      Object.defineProperty(Screen.prototype, key, {{
        get: () => value,
        configurable: true,
      }});
    }} catch (e) {{}}
  }}

  // Window dimensions
  try {{
    Object.defineProperty(window, 'innerWidth', {{
      get: () => {avail_width},
      configurable: true,
    }});
    Object.defineProperty(window, 'innerHeight', {{
      get: () => {avail_height},
      configurable: true,
    }});
    Object.defineProperty(window, 'outerWidth', {{
      get: () => {width},
      configurable: true,
    }});
    Object.defineProperty(window, 'outerHeight', {{
      get: () => {height},
      configurable: true,
    }});
    Object.defineProperty(window, 'devicePixelRatio', {{
      get: () => {pixel_ratio},
      configurable: true,
    }});
  }} catch (e) {{}}

"#,
        width = fp.screen.width,
        height = fp.screen.height,
        avail_width = fp.screen.available_width,
        avail_height = fp.screen.available_height,
        color_depth = fp.color_depth,
        pixel_ratio = fp.screen.pixel_ratio,
    )
}

/// Canvas fingerprint spoofing with deterministic noise
fn generate_canvas_spoof(fp: &Fingerprint) -> String {
    format!(
        r#"
  // Canvas fingerprint spoofing
  const CANVAS_SEED = {seed}n;

  function mulberry32(seed) {{
    return function() {{
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }};
  }}

  const canvasRng = mulberry32(Number(CANVAS_SEED & 0xFFFFFFFFn));

  const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function(...args) {{
    const ctx = this.getContext('2d');
    if (ctx) {{
      const imageData = ctx.getImageData(0, 0, this.width, this.height);
      const data = imageData.data;
      // Add deterministic noise to a subset of pixels
      for (let i = 0; i < data.length; i += 4) {{
        if (canvasRng() > 0.99) {{
          data[i] = (data[i] + 1) & 0xFF;     // R
          data[i+1] = (data[i+1] + 1) & 0xFF; // G
        }}
      }}
      ctx.putImageData(imageData, 0, 0);
    }}
    return origToDataURL.apply(this, args);
  }};

  const origToBlob = HTMLCanvasElement.prototype.toBlob;
  HTMLCanvasElement.prototype.toBlob = function(callback, ...args) {{
    const ctx = this.getContext('2d');
    if (ctx) {{
      const imageData = ctx.getImageData(0, 0, this.width, this.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {{
        if (canvasRng() > 0.99) {{
          data[i] = (data[i] + 1) & 0xFF;
        }}
      }}
      ctx.putImageData(imageData, 0, 0);
    }}
    return origToBlob.call(this, callback, ...args);
  }};

  // CanvasRenderingContext2D.getImageData noise
  const origGetImageData = CanvasRenderingContext2D.prototype.getImageData;
  CanvasRenderingContext2D.prototype.getImageData = function(...args) {{
    const imageData = origGetImageData.apply(this, args);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {{
      if (canvasRng() > 0.995) {{
        data[i] = (data[i] + 1) & 0xFF;
      }}
    }}
    return imageData;
  }};

"#,
        seed = fp.canvas_seed,
    )
}

/// WebGL fingerprint spoofing
fn generate_webgl_spoof(fp: &Fingerprint) -> String {
    format!(
        r#"
  // WebGL fingerprint spoofing
  const WEBGL_VENDOR = {vendor};
  const WEBGL_RENDERER = {renderer};

  const origGetParameter = WebGLRenderingContext.prototype.getParameter;
  WebGLRenderingContext.prototype.getParameter = function(param) {{
    const UNMASKED_VENDOR_WEBGL = 0x9245;
    const UNMASKED_RENDERER_WEBGL = 0x9246;

    if (param === UNMASKED_VENDOR_WEBGL) return WEBGL_VENDOR;
    if (param === UNMASKED_RENDERER_WEBGL) return WEBGL_RENDERER;
    return origGetParameter.call(this, param);
  }};

  // WebGL2
  if (typeof WebGL2RenderingContext !== 'undefined') {{
    const origGetParameter2 = WebGL2RenderingContext.prototype.getParameter;
    WebGL2RenderingContext.prototype.getParameter = function(param) {{
      const UNMASKED_VENDOR_WEBGL = 0x9245;
      const UNMASKED_RENDERER_WEBGL = 0x9246;

      if (param === UNMASKED_VENDOR_WEBGL) return WEBGL_VENDOR;
      if (param === UNMASKED_RENDERER_WEBGL) return WEBGL_RENDERER;
      return origGetParameter2.call(this, param);
    }};
  }}

  // Spoof WebGL debug info extension
  const origGetExtension = WebGLRenderingContext.prototype.getExtension;
  WebGLRenderingContext.prototype.getExtension = function(name) {{
    const ext = origGetExtension.call(this, name);
    if (name === 'WEBGL_debug_renderer_info' && ext) {{
      return new Proxy(ext, {{
        get: (target, prop) => {{
          if (prop === 'UNMASKED_VENDOR_WEBGL') return 0x9245;
          if (prop === 'UNMASKED_RENDERER_WEBGL') return 0x9246;
          return Reflect.get(target, prop);
        }}
      }});
    }}
    return ext;
  }};

"#,
        vendor = serde_json::to_string(&fp.webgl.vendor).unwrap_or_default(),
        renderer = serde_json::to_string(&fp.webgl.renderer).unwrap_or_default(),
    )
}

/// Audio context fingerprint spoofing
fn generate_audio_spoof(fp: &Fingerprint) -> String {
    format!(
        r#"
  // AudioContext fingerprint spoofing
  const AUDIO_SEED = {seed};

  if (typeof AudioContext !== 'undefined') {{
    const OrigAudioContext = AudioContext;
    const origCreateOscillator = AudioContext.prototype.createOscillator;
    const origCreateDynamicsCompressor = AudioContext.prototype.createDynamicsCompressor;
    const origCreateAnalyser = AudioContext.prototype.createAnalyser;

    // Override getFloatFrequencyData to add noise
    const origGetFloat = AnalyserNode.prototype.getFloatFrequencyData;
    AnalyserNode.prototype.getFloatFrequencyData = function(array) {{
      origGetFloat.call(this, array);
      const audioRng = mulberry32(AUDIO_SEED);
      for (let i = 0; i < array.length; i++) {{
        array[i] += (audioRng() - 0.5) * 0.001;
      }}
    }};

    // Override getByteFrequencyData
    const origGetByte = AnalyserNode.prototype.getByteFrequencyData;
    AnalyserNode.prototype.getByteFrequencyData = function(array) {{
      origGetByte.call(this, array);
      const audioRng = mulberry32(AUDIO_SEED + 1);
      for (let i = 0; i < array.length; i++) {{
        if (audioRng() > 0.95) {{
          array[i] = (array[i] + 1) & 0xFF;
        }}
      }}
    }};
  }}

"#,
        seed = fp.canvas_seed % 0xFFFFFFFF, // reuse canvas seed for determinism
    )
}

/// Timezone spoofing
fn generate_timezone_spoof(fp: &Fingerprint) -> String {
    let tz_name = match fp.timezone_offset {
        -480 => "America/Los_Angeles",
        -420 => "America/Denver",
        -360 => "America/Chicago",
        -300 => "America/New_York",
        0 => "Europe/London",
        60 => "Europe/Paris",
        120 => "Europe/Helsinki",
        _ => "UTC",
    };

    format!(
        r#"
  // Timezone spoofing
  const TZ_OFFSET = {offset};
  const TZ_NAME = {tz_name};

  const origGetTimezoneOffset = Date.prototype.getTimezoneOffset;
  Date.prototype.getTimezoneOffset = function() {{
    return TZ_OFFSET;
  }};

  // Spoof Intl.DateTimeFormat
  const origResolvedOptions = Intl.DateTimeFormat.prototype.resolvedOptions;
  Intl.DateTimeFormat.prototype.resolvedOptions = function() {{
    const result = origResolvedOptions.call(this);
    result.timeZone = TZ_NAME;
    return result;
  }};

"#,
        offset = fp.timezone_offset,
        tz_name = serde_json::to_string(tz_name).unwrap_or_default(),
    )
}

/// WebRTC IP leak prevention
fn generate_webrtc_block() -> String {
    r#"
  // WebRTC IP leak prevention
  if (typeof RTCPeerConnection !== 'undefined') {
    const OrigRTC = RTCPeerConnection;
    window.RTCPeerConnection = function(config, constraints) {
      // Force relay-only ICE policy to prevent IP leaks
      if (config) {
        config.iceTransportPolicy = 'relay';
      } else {
        config = { iceTransportPolicy: 'relay' };
      }
      return new OrigRTC(config, constraints);
    };
    window.RTCPeerConnection.prototype = OrigRTC.prototype;

    // Also cover prefixed versions
    if (typeof webkitRTCPeerConnection !== 'undefined') {
      window.webkitRTCPeerConnection = window.RTCPeerConnection;
    }
  }

"#
    .to_string()
}

/// Font enumeration spoofing
fn generate_font_spoof() -> String {
    r#"
  // Font enumeration spoofing - limit detectable fonts
  const ALLOWED_FONTS = new Set([
    'Arial', 'Courier New', 'Georgia', 'Helvetica',
    'Times New Roman', 'Trebuchet MS', 'Verdana',
    'sans-serif', 'serif', 'monospace',
  ]);

  if (typeof document !== 'undefined' && document.fonts) {
    const origCheck = document.fonts.check.bind(document.fonts);
    document.fonts.check = function(font, text) {
      const fontFamily = font.split(',')[0].trim().replace(/['"]/g, '');
      if (!ALLOWED_FONTS.has(fontFamily)) {
        return false;
      }
      return origCheck(font, text);
    };
  }

"#
    .to_string()
}

/// Plugin and MimeType spoofing
fn generate_plugin_spoof() -> String {
    r#"
  // Plugin spoofing - report standard Chrome plugins
  Object.defineProperty(Navigator.prototype, 'plugins', {
    get: () => {
      const plugins = [
        { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
        { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
        { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' },
      ];
      plugins.length = 3;
      return plugins;
    },
    configurable: true,
  });

  // MimeTypes
  Object.defineProperty(Navigator.prototype, 'mimeTypes', {
    get: () => {
      const mimes = [
        { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format' },
      ];
      mimes.length = 1;
      return mimes;
    },
    configurable: true,
  });

"#
    .to_string()
}

/// Battery API spoofing
fn generate_battery_spoof() -> String {
    r#"
  // Battery API spoofing - always report desktop-like behavior
  if (typeof Navigator.prototype.getBattery !== 'undefined') {
    Navigator.prototype.getBattery = function() {
      return Promise.resolve({
        charging: true,
        chargingTime: 0,
        dischargingTime: Infinity,
        level: 1.0,
        addEventListener: () => {},
        removeEventListener: () => {},
      });
    };
  }

"#
    .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::core::fingerprint::generate_fingerprint;

    #[test]
    fn test_generate_injection_script() {
        let fp = generate_fingerprint();
        let config = InjectionConfig::default();
        let script = generate_injection_script(&fp, &config);

        assert!(script.contains("Navigator spoofing"));
        assert!(script.contains("Screen spoofing"));
        assert!(script.contains("Canvas fingerprint spoofing"));
        assert!(script.contains("WebGL fingerprint spoofing"));
        assert!(script.contains("AudioContext fingerprint spoofing"));
        assert!(script.contains("Timezone spoofing"));
        assert!(script.contains("WebRTC IP leak prevention"));
        assert!(script.contains("Font enumeration spoofing"));
        assert!(!script.is_empty());
    }

    #[test]
    fn test_injection_uses_fingerprint_values() {
        let fp = generate_fingerprint();
        let config = InjectionConfig::default();
        let script = generate_injection_script(&fp, &config);

        assert!(script.contains(&fp.user_agent));
        assert!(script.contains(&fp.platform));
        assert!(script.contains(&fp.webgl.vendor));
        assert!(script.contains(&fp.webgl.renderer));
    }
}
