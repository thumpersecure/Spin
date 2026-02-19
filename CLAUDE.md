# CLAUDE.md - AI Assistant Guide for Spin

This document provides essential context for AI assistants working on this codebase.

## Project Overview

**Spin** is a privacy-first OSINT (Open Source Intelligence) investigation browser. Each version uses a different detective/investigator theme. The current release is **v12.0.3 "Jessica Jones"**.

### Version History
| Version | Codename | Stack | Status |
|---------|----------|-------|--------|
| v12.0 | Jessica Jones | Tauri 2.0 + React 19 + Rust | **Active Development** |
| v5.0 | The Multiple Man | Tauri 2.0 + React 19 + Rust | Superseded by v12 |
| v4.x | The Exorcist's Edge | Electron + Svelte 5 | Legacy (in `src/`) |

### Core Concepts
- **Identity Dupes**: Multiple isolated browser identities with unique fingerprints
- **Hivemind**: Real-time entity synchronization across identities
- **MCP Agents**: AI-powered investigation assistants (Model Context Protocol)
- **Dynamic Privacy Engine**: Automatic OPSEC level adjustment based on site risk
- **CEF Integration**: Embedded Chromium with per-identity fingerprint control
- **Session Cloning**: Secure session transfer between identities with SHA-256 verification
- **Investigation Timeline & Graph**: D3.js entity relationship visualization

## Repository Structure

```
Spin/
├── app/                          # v12.0 Tauri+React (ACTIVE DEVELOPMENT)
│   ├── src/                      # React TypeScript frontend
│   │   ├── components/           # UI components
│   │   │   ├── browser/          # TitleBar, TabBar, NavBar, BrowserView
│   │   │   ├── identity/         # IdentityPanel
│   │   │   ├── hivemind/         # HivemindPanel
│   │   │   ├── investigation/    # InvestigationPanel, Timeline, Graph
│   │   │   ├── mcp/              # McpPanel
│   │   │   ├── osint/            # OsintPanel
│   │   │   ├── privacy/          # PrivacyDashboard
│   │   │   └── ui/               # SidePanel, SettingsPanel
│   │   ├── store/                # Redux Toolkit
│   │   │   ├── index.ts          # Store configuration
│   │   │   └── slices/           # Feature slices (9 slices)
│   │   └── theme/                # Mantine theme config
│   ├── src-tauri/                # Rust backend
│   │   ├── src/
│   │   │   ├── commands/         # Tauri IPC command handlers
│   │   │   ├── core/             # Business logic (identity, fingerprint, privacy)
│   │   │   ├── cef/              # Chromium Embedded Framework
│   │   │   ├── session/          # Session cloning
│   │   │   ├── investigation/    # Timeline & graph
│   │   │   ├── hivemind/         # Entity sync system
│   │   │   ├── mcp/              # MCP server / Claude API integration
│   │   │   └── storage/          # sled database wrapper
│   │   └── tauri.conf.json       # Tauri configuration
│   └── package.json              # App dependencies
│
├── src/                          # v4.x Electron+Svelte (LEGACY)
├── tests/                        # Jest test files
├── scripts/                      # Build scripts
├── assets/                       # Application icons
├── .github/workflows/            # CI/CD configuration
└── package.json                  # Root dependencies
```

## Tech Stack

### v12 (app/) - Active Development
| Layer | Technology | Version |
|-------|------------|---------|
| Runtime | Tauri | 2.0 |
| Frontend | React | 19.x |
| Language | TypeScript | 5.x |
| State | Redux Toolkit | 2.x |
| UI Library | Mantine | 8.x |
| Icons | Tabler Icons | 3.x |
| Backend | Rust | 1.75+ |
| Database | sled | Embedded KV |
| AI | Claude API (MCP) | Messages API |
| Build | Vite | 7.x |

## Development Commands

```bash
cd app

# Development with hot reload
npm run tauri:dev

# Production build
npm run tauri:build

# Frontend only (React)
npm run dev
npm run build

# Linting
npm run lint
```

## Code Conventions

### TypeScript (Frontend)

**Components**
```typescript
// PascalCase for components, placed in feature directories
// src/components/feature/ComponentName.tsx

import { useAppSelector, useAppDispatch } from '../../store';

function ComponentName() {
  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => state.feature.data);
  // ...
}

export default ComponentName;
```

**Redux Slices**
```typescript
// src/store/slices/featureSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FeatureState {
  items: Item[];
  loading: boolean;
}

const featureSlice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    actionName: (state, action: PayloadAction<PayloadType>) => {
      // Immer mutations allowed
    },
  },
});
```

### Rust (Backend)

**Tauri Commands**
```rust
// src-tauri/src/commands/feature.rs
use tauri::command;

#[command]
pub async fn command_name(param: String) -> Result<ReturnType, String> {
    // Implementation
    Ok(result)
}
```

**Module Organization**
```rust
// src-tauri/src/feature/mod.rs
pub mod submodule;

pub fn init(app_handle: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    // Initialization logic
    Ok(())
}
```

## Architecture Patterns

### State Management
- **Redux Toolkit** with 9 feature slices
- Typed hooks: `useAppDispatch`, `useAppSelector`
- Async actions via `createAsyncThunk`
- Middleware for Tauri IPC sync

### IPC Communication
```typescript
// Frontend: Invoke Tauri command
import { invoke } from '@tauri-apps/api/core';
const result = await invoke('command_name', { param: value });

// Backend: Handle command
#[command]
pub async fn command_name(param: Type) -> Result<Return, String>
```

### Entity Types (Hivemind)
- Email, Phone, IP Address, Domain
- Username, Crypto Wallet, URL
- Social Media Handle, Hashtag, Coordinates

### Privacy/OPSEC Levels
1. **MINIMAL** - Trusted sites, basic protection
2. **STANDARD** - General browsing, tracker blocking
3. **ENHANCED** - Sensitive research, fingerprint spoofing
4. **MAXIMUM** - High-risk investigation, full spoofing
5. **PARANOID** - Assume adversary, Tor + all protections

## Key Files Reference

| File | Purpose |
|------|---------|
| `app/src/App.tsx` | Main React app component |
| `app/src/store/index.ts` | Redux store configuration |
| `app/src-tauri/src/lib.rs` | Tauri app entry point |
| `app/src-tauri/tauri.conf.json` | Tauri configuration |

## Important Notes for AI Assistants

### When Working on app/
- All frontend code is TypeScript with strict typing
- Use Mantine components for UI consistency
- Follow Redux Toolkit patterns for state
- Rust backend uses `Result<T, String>` for error handling
- Commands must be registered in `lib.rs` invoke_handler
- Theme color is `spinPurple` (not to be renamed per-version)

### General Guidelines
- Prefer editing existing files over creating new ones
- Keep security in mind (no eval, validate inputs)
- Follow existing code patterns in each directory
- Test changes with appropriate test commands

### Security Considerations
- Never commit `.env` files or credentials
- Validate all IPC inputs on the backend
- Use CSP headers appropriately
- Block dangerous protocols (javascript:, data:, file:)
- Sanitize HTML when rendering user content

## Quick Reference

```bash
# Development
cd app && npm run tauri:dev

# Testing
npm test

# Building
cd app && npm run tauri:build
```
