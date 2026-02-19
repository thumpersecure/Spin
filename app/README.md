# Spin v12.1.3 "Jessica Jones"

> *"Every case starts with a question. Every answer leads to another."*

## OSINT Investigation Browser

The **Jessica Jones** release transforms Spin into a full-fledged investigation platform:

- **Embedded Chromium (CEF)** with per-identity fingerprint control
- **Secure Session Cloning** between identities with integrity verification
- **Investigation Timeline & Graph** - force-directed entity visualization
- **Claude AI MCP Server** - 8 specialized agents with shared context tool routing
- **Pure Rust GUI** - iced 0.13 + wry 0.44, zero JavaScript runtime

See the [root README](../README.md) for full documentation.

## Quick Start

```bash
cd app/src-tauri
cargo run
```

For a release build:

```bash
cd app/src-tauri
cargo build --release
./target/release/spin
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| GUI | iced 0.13 (Elm-style) |
| WebView | wry 0.44 (embedded Chromium) |
| State | AppState + Message enum |
| Backend | Rust 1.75+ |
| Browser | Chromium (CEF) |
| Database | sled (embedded KV) |
| AI | Claude API (MCP) |
| Build | Cargo |

## Architecture

```
iced 0.13 GUI (AppState + Message enum)
    ↕ Direct Rust fn calls (no IPC)
Rust Backend
├── cef/           # Chromium Embedded Framework
├── session/       # Session cloning
├── investigation/ # Timeline & graph
├── mcp/           # Claude API integration
├── core/          # Identity, fingerprint, privacy, entity
├── hivemind/      # Entity synchronization
└── storage/       # sled database
```
