// MADROX v5.0 - The Multiple Man OSINT Browser
// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    madrox_lib::run()
}
