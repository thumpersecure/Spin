# CLAUDE.md - AI Assistant Guide for MADROX/Spin

This document provides essential context for AI assistants working on this codebase.

## Project Overview

**MADROX** (formerly CONSTANTINE/SANDIEGO) is a privacy-first OSINT (Open Source Intelligence) investigation browser. The project has evolved through multiple theme iterations and is currently transitioning from Electron (v4.x) to Tauri 2.0 (v5.x).

### Version History
| Version | Codename | Stack | Status |
|---------|----------|-------|--------|
| v5.0 | MADROX - The Multiple Man | Tauri 2.0 + React 19 + Rust | **Active Development** |
| v4.x | CONSTANTINE - The Exorcist's Edge | Electron + Svelte 5 | Legacy (in `src/`) |

### Core Concepts
- **Identity Dupes**: Multiple isolated browser identities with unique fingerprints
- **Hivemind**: Real-time entity synchronization across identities
- **MCP Agents**: AI-powered investigation assistants (Model Context Protocol)
- **Dynamic Privacy Engine**: Automatic OPSEC level adjustment based on site risk

## Repository Structure

```
Spin/
├── madrox-v5/                    # v5.0 Tauri+React (ACTIVE DEVELOPMENT)
│   ├── src/                      # React TypeScript frontend
│   │   ├── components/           # UI components
│   │   │   ├── browser/          # TitleBar, TabBar, NavBar, BrowserView
│   │   │   ├── identity/         # IdentityPanel
│   │   │   ├── hivemind/         # HivemindPanel
│   │   │   ├── mcp/              # McpPanel
│   │   │   ├── osint/            # OsintPanel
│   │   │   ├── privacy/          # PrivacyDashboard
│   │   │   └── ui/               # SidePanel, SettingsPanel
│   │   ├── store/                # Redux Toolkit
│   │   │   ├── index.ts          # Store configuration
│   │   │   └── slices/           # Feature slices
│   │   └── theme/                # Mantine theme config
│   ├── src-tauri/                # Rust backend
│   │   ├── src/
│   │   │   ├── commands/         # Tauri IPC command handlers
│   │   │   ├── core/             # Business logic (identity, fingerprint, privacy)
│   │   │   ├── hivemind/         # Entity sync system
│   │   │   ├── mcp/              # MCP server integration
│   │   │   └── storage/          # sled database wrapper
│   │   └── tauri.conf.json       # Tauri configuration
│   └── package.json              # v5 dependencies
│
├── src/                          # v4.x Electron+Svelte (LEGACY)
│   ├── main/                     # Electron main process
│   ├── renderer/                 # Svelte renderer
│   │   ├── components/           # Svelte components
│   │   ├── stores/               # Svelte stores
│   │   └── lib/                  # Utilities
│   ├── extensions/               # AI modules and features
│   │   ├── ai-research-assistant.js
│   │   ├── ai-privacy-shield.js
│   │   ├── ai-research-tools.js
│   │   ├── ai-cognitive-tools.js
│   │   └── phone-intel.js
│   ├── plugins/                  # Plugin system
│   ├── preload/                  # Electron preload scripts
│   └── data/                     # Static data (OSINT bookmarks)
│
├── tests/                        # Jest test files
├── scripts/                      # Build scripts (icon generation)
├── assets/                       # Application icons
├── .github/workflows/            # CI/CD configuration
├── package.json                  # v4 root dependencies (Electron)
└── V5_MADROX_ARCHITECTURE.md     # v5 architecture documentation
```

## Tech Stack

### v5 (madrox-v5/) - Active Development
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
| Build | Vite | 7.x |

### v4 (src/) - Legacy
| Layer | Technology | Version |
|-------|------------|---------|
| Runtime | Electron | 40.x |
| Frontend | Svelte | 5.x |
| Build | Vite | 5.x |
| Storage | electron-store | 8.x |

## Development Commands

### v5 (Tauri + React)
```bash
cd madrox-v5

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

### v4 (Electron + Svelte)
```bash
# From root directory

# Development
npm run dev

# Production build
npm run build              # All platforms
npm run build:win          # Windows
npm run build:mac          # macOS
npm run build:linux        # Linux

# Testing
npm test                   # Run tests
npm run test:coverage      # With coverage
npm run test:watch         # Watch mode

# Code quality
npm run lint               # ESLint
npm run lint:fix           # Auto-fix
npm run format             # Prettier
```

## Code Conventions

### TypeScript (v5 Frontend)

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

### Rust (v5 Backend)

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

### JavaScript (v4 Legacy)

**ESLint Rules**
- Use `const`/`let`, never `var`
- Strict equality (`===`) required
- Curly braces for multi-line blocks
- No `eval()` or `new Function()`
- Prefix unused variables with `_`

**Class Pattern for Extensions**
```javascript
class FeatureModule {
  constructor() {
    this.data = new Map();
  }

  methodName(param) {
    // Implementation
  }

  cleanup() {
    // Resource cleanup
  }
}

module.exports = { FeatureModule };
```

### Svelte (v4 Legacy)
```svelte
<script>
  import { appStore } from '../stores/app.js';

  export let prop;

  function handleEvent() {
    // Handler
  }
</script>

<div class="component">
  <!-- Template -->
</div>

<style>
  /* Scoped styles */
</style>
```

## Architecture Patterns

### State Management (v5)
- **Redux Toolkit** with feature slices
- Typed hooks: `useAppDispatch`, `useAppSelector`
- Async actions via `createAsyncThunk`
- Middleware for Tauri IPC sync

### IPC Communication (v5)
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

## Testing

### Jest Configuration (v4)
- Test files: `tests/*.test.js`
- Coverage for: `src/extensions/**/*.js`
- Test patterns: Describe/it blocks with assertions

### Test Example
```javascript
describe('FeatureModule', () => {
  describe('methodName', () => {
    it('should do expected behavior', () => {
      const module = new FeatureModule();
      const result = module.methodName(input);
      expect(result).toBe(expected);
    });
  });
});
```

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`):
1. **Test** - Node 20.x/22.x, lint, jest, coverage
2. **Security** - npm audit (critical level)
3. **Build** - Multi-platform (Parrot OS compatible, Windows, macOS)

## Key Files Reference

| File | Purpose |
|------|---------|
| `madrox-v5/src/App.tsx` | Main React app component |
| `madrox-v5/src/store/index.ts` | Redux store configuration |
| `madrox-v5/src-tauri/src/lib.rs` | Tauri app entry point |
| `madrox-v5/src-tauri/tauri.conf.json` | Tauri configuration |
| `src/main/main.js` | Electron main process (v4) |
| `src/renderer/App.svelte` | Svelte root component (v4) |
| `V5_MADROX_ARCHITECTURE.md` | Detailed v5 architecture docs |

## Important Notes for AI Assistants

### When Working on v5 (madrox-v5/)
- All frontend code is TypeScript with strict typing
- Use Mantine components for UI consistency
- Follow Redux Toolkit patterns for state
- Rust backend uses `Result<T, String>` for error handling
- Commands must be registered in `lib.rs` invoke_handler

### When Working on v4 (src/)
- JavaScript with ES2022 features
- Svelte 5 syntax (runes, snippets)
- electron-store for persistence
- IPC via `ipcMain`/`ipcRenderer`

### General Guidelines
- Prefer editing existing files over creating new ones
- Keep security in mind (no eval, validate inputs)
- Follow existing code patterns in each directory
- Test changes with appropriate test commands
- Check CI workflow requirements before PRs

### Security Considerations
- Never commit `.env` files or credentials
- Validate all IPC inputs on the backend
- Use CSP headers appropriately
- Block dangerous protocols (javascript:, data:, file:)
- Sanitize HTML when rendering user content

## Quick Reference

```bash
# Development
cd madrox-v5 && npm run tauri:dev   # v5 development
npm run dev                          # v4 development

# Testing
npm test                             # Run all tests
npm run lint                         # Check code style

# Building
cd madrox-v5 && npm run tauri:build  # v5 production
npm run build                        # v4 production
```
