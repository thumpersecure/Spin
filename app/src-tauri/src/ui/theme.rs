//! Spin theme — spinPurple palette for iced.
//!
//! Mirrors the Mantine theme that was used in the React frontend:
//!   Primary:    #7C3AED  (spinPurple)
//!   Background: #0D0D0F
//!   Text:       #E8E8F0
//!   Success:    #10B981
//!   Danger:     #EF4444

use iced::{color, theme::Palette, Theme};

/// Build the spinPurple custom theme.
pub fn spin_theme() -> Theme {
    Theme::custom(
        "spinPurple".to_string(),
        Palette {
            background: color!(0x0D0D0F),
            text: color!(0xE8E8F0),
            primary: color!(0x7C3AED),
            success: color!(0x10B981),
            danger: color!(0xEF4444),
        },
    )
}

// ── Convenience colour constants ──────────────────────────────────────────

pub mod colors {
    use iced::Color;

    pub const PURPLE: Color = Color::from_rgb(0.486, 0.227, 0.929);       // #7C3AED
    pub const PURPLE_DARK: Color = Color::from_rgb(0.357, 0.149, 0.722);  // #5B25B8
    pub const PURPLE_LIGHT: Color = Color::from_rgb(0.608, 0.400, 0.961); // #9B66F5
    pub const BG: Color = Color::from_rgb(0.051, 0.051, 0.059);           // #0D0D0F
    pub const BG_PANEL: Color = Color::from_rgb(0.078, 0.078, 0.094);     // #141418
    pub const BG_INPUT: Color = Color::from_rgb(0.114, 0.114, 0.133);     // #1D1D22
    pub const TEXT: Color = Color::from_rgb(0.910, 0.910, 0.941);         // #E8E8F0
    pub const TEXT_MUTED: Color = Color::from_rgb(0.533, 0.533, 0.600);   // #888899
    pub const SUCCESS: Color = Color::from_rgb(0.063, 0.725, 0.506);      // #10B981
    pub const DANGER: Color = Color::from_rgb(0.937, 0.267, 0.267);       // #EF4444
    pub const BORDER: Color = Color::from_rgb(0.157, 0.157, 0.196);       // #282832
}
