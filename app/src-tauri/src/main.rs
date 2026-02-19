// Spin v12.0.3 - Jessica Jones OSINT Investigation Browser
// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    spin_lib::run()
}
