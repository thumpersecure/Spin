// Spin v12.0.3 — Jessica Jones OSINT Investigation Browser
// Suppress console window on Windows in release builds.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() -> iced::Result {
    spin_lib::run()
}
