// Spin v12.0.0 - Jessica Jones OSINT Investigation Browser
// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    madrox_lib::run()
}
