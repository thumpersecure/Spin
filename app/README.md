# Spin v12.0.0 "Jessica Jones"

> *"Every case starts with a question. Every answer leads to another."*

## OSINT Investigation Browser

The **Jessica Jones** release transforms Spin into a full-fledged investigation platform:

- **Embedded Chromium (CEF)** with per-identity fingerprint control
- **Secure Session Cloning** between identities with integrity verification
- **Investigation Timeline & Graph** - D3.js force-directed entity visualization
- **Claude AI MCP Server** - 8 specialized agents with shared context tool routing
- **9 new Rust modules**, 30+ new IPC commands, 2 new Redux slices

See the [root README](../README.md) for full documentation.

## Quick Start

```bash
cd app
npm install
npm run tauri:dev
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Tauri 2.0 |
| Frontend | React 19 + TypeScript 5.x |
| State | Redux Toolkit 2.x |
| UI | Mantine 8 + Tabler Icons 3 |
| Backend | Rust 1.75+ |
| Browser | Chromium (CEF) |
| Database | sled (embedded KV) |
| AI | Claude API (MCP) |
| Build | Vite 7.x |

## Architecture

```
React Frontend (9 Redux slices)
    ↕ Tauri IPC (70+ commands)
Rust Backend
├── cef/           # Chromium Embedded Framework
├── session/       # Session cloning
├── investigation/ # Timeline & graph
├── mcp/           # Claude API integration
├── core/          # Identity, fingerprint, privacy, entity
├── hivemind/      # Entity synchronization
└── storage/       # sled database
```
