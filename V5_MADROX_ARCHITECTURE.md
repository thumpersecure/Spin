# MADROX v5.0 - Architecture Blueprint

```
███╗   ███╗ █████╗ ██████╗ ██████╗  ██████╗ ██╗  ██╗
████╗ ████║██╔══██╗██╔══██╗██╔══██╗██╔═══██╗╚██╗██╔╝
██╔████╔██║███████║██║  ██║██████╔╝██║   ██║ ╚███╔╝
██║╚██╔╝██║██╔══██║██║  ██║██╔══██╗██║   ██║ ██╔██╗
██║ ╚═╝ ██║██║  ██║██████╔╝██║  ██║╚██████╔╝██╔╝ ██╗
╚═╝     ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝
        T H E   M U L T I P L E   M A N
```

> *"I am Legion, for we are many."*
>
> Inspired by Jamie Madrox - the mutant who creates perfect duplicates of himself.

---

## Executive Summary

**MADROX** is a next-generation OSINT investigation browser built on Tauri 2.0, designed for parallel intelligence gathering through multiple synchronized identities. Like its namesake, MADROX can spawn independent "dupes" - each with unique fingerprints and isolated sessions - while maintaining hivemind awareness of all discovered intelligence.

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Runtime** | Tauri | 2.0 | Native app shell, Rust backend |
| **Browser Engine** | Chromium (wry) | Embedded | Full fingerprint control |
| **Frontend Framework** | React | 19.x | Component architecture |
| **Language** | TypeScript | 5.x | Type safety |
| **State Management** | Redux Toolkit | 2.x | Predictable state, devtools |
| **UI Library** | Mantine | 7.x | Dark theme, rich components |
| **Backend** | Rust | 1.75+ | Performance, security |
| **Database** | sled | 0.34+ | Embedded, fast, Rust-native |
| **AI Integration** | MCP | 1.x | Model Context Protocol |
| **Build Tool** | Vite | 5.x | Fast HMR, optimized builds |

---

## Core Features

### 1. Identity Dupes (Multi-Identity System)

The heart of MADROX - spawn multiple browser identities that operate independently:

```
┌─────────────────────────────────────────────────────────────────┐
│                    MADROX IDENTITY MATRIX                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐     │
│  │  PRIME  │    │ DUPE-1  │    │ DUPE-2  │    │ DUPE-3  │     │
│  │   👤    │    │   👤    │    │   👤    │    │   👤    │     │
│  │ Alpha-7 │    │ Beta-3  │    │ Gamma-1 │    │ Delta-8 │     │
│  └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘     │
│       │              │              │              │           │
│       └──────────────┴──────────────┴──────────────┘           │
│                          │                                      │
│                    ┌─────┴─────┐                                │
│                    │ HIVEMIND  │                                │
│                    │  Entity   │                                │
│                    │   Sync    │                                │
│                    └───────────┘                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Each Dupe Has:**
- Unique browser fingerprint (canvas, WebGL, fonts, screen, etc.)
- Isolated cookie jar and localStorage
- Independent proxy/Tor circuit
- Separate browsing history
- Distinct user agent and platform spoof
- Individual timezone and locale

**Dupe Operations:**
- `spawn_dupe()` - Create new identity
- `absorb_dupe(id)` - Merge findings back to Prime
- `destroy_dupe(id)` - Eliminate identity with secure wipe
- `clone_session(from, to)` - Copy investigation state

### 2. Hivemind (Real-time Entity Sync)

All dupes share discovered intelligence in real-time:

```
┌─────────────────────────────────────────────────────────────────┐
│                      HIVEMIND NETWORK                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Entity Type     │ Value                │ Found By    │ Count  │
│  ─────────────────────────────────────────────────────────────  │
│  📧 Email        │ target@example.com   │ Prime,Dupe1 │   2    │
│  📱 Phone        │ +1-555-123-4567      │ Dupe-2      │   1    │
│  🌐 IP Address   │ 192.168.1.100        │ All         │   4    │
│  💰 BTC Wallet   │ 1A1zP1eP5QGefi2D...  │ Dupe-1      │   1    │
│  👤 Username     │ darkoperator         │ Prime,Dupe3 │   2    │
│  🔗 Domain       │ suspicious.xyz       │ Dupe-2      │   1    │
│                                                                 │
│  ⚡ Cross-Reference Alert: 3 entities found by multiple dupes  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Hivemind Features:**
- Real-time entity broadcast across all identities
- Cross-reference detection (same entity, multiple sources)
- Entity relationship mapping
- Confidence scoring based on source diversity
- Timeline correlation across dupes

### 3. MCP Integration (Claude Pro Powerful)

Model Context Protocol integration for AI-augmented investigation:

```
┌─────────────────────────────────────────────────────────────────┐
│                    MCP AGENT SYSTEM                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   ANALYST   │  │  GATHERER   │  │  CORRELATOR │             │
│  │    Agent    │  │    Agent    │  │    Agent    │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
│         └────────────────┼────────────────┘                     │
│                          │                                      │
│                    ┌─────┴─────┐                                │
│                    │    MCP    │                                │
│                    │  Server   │                                │
│                    └─────┬─────┘                                │
│                          │                                      │
│                    ┌─────┴─────┐                                │
│                    │  Claude   │                                │
│                    │    API    │                                │
│                    └───────────┘                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Sub-Agents:**
- **Analyst Agent** - Interprets page content, suggests investigation paths
- **Gatherer Agent** - Automated entity extraction and categorization
- **Correlator Agent** - Finds relationships between entities
- **Reporter Agent** - Generates investigation reports
- **OPSEC Agent** - Monitors for privacy leaks and exposure

**Skills:**
- Web scraping with anti-detection
- Phone number intelligence
- Email reputation lookup
- Domain reconnaissance
- Social media profiling
- Image analysis (reverse search)
- Document metadata extraction

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           MADROX v5.0                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     REACT FRONTEND                               │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │   │
│  │  │ Browser  │ │ Identity │ │ Hivemind │ │   MCP    │           │   │
│  │  │   Tabs   │ │  Panel   │ │  Panel   │ │  Panel   │           │   │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │   │
│  │       │            │            │            │                   │   │
│  │  ┌────┴────────────┴────────────┴────────────┴────┐             │   │
│  │  │              REDUX TOOLKIT STORE               │             │   │
│  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │             │   │
│  │  │  │  tabs  │ │ dupes  │ │entities│ │ agents │  │             │   │
│  │  │  └────────┘ └────────┘ └────────┘ └────────┘  │             │   │
│  │  └────────────────────┬───────────────────────────┘             │   │
│  └───────────────────────┼─────────────────────────────────────────┘   │
│                          │ IPC (invoke)                                 │
│  ┌───────────────────────┼─────────────────────────────────────────┐   │
│  │                 TAURI RUST BACKEND                               │   │
│  │                       │                                          │   │
│  │  ┌────────────────────┴────────────────────┐                    │   │
│  │  │              COMMAND HANDLERS            │                    │   │
│  │  └────────────────────┬────────────────────┘                    │   │
│  │           ┌───────────┼───────────┐                              │   │
│  │           ▼           ▼           ▼                              │   │
│  │  ┌─────────────┐ ┌─────────┐ ┌─────────┐                        │   │
│  │  │  Identity   │ │Hivemind │ │   MCP   │                        │   │
│  │  │   Engine    │ │  Core   │ │ Bridge  │                        │   │
│  │  └──────┬──────┘ └────┬────┘ └────┬────┘                        │   │
│  │         │             │           │                              │   │
│  │  ┌──────┴─────────────┴───────────┴──────┐                      │   │
│  │  │              SLED DATABASE             │                      │   │
│  │  │  [identities] [entities] [sessions]   │                      │   │
│  │  └───────────────────────────────────────┘                      │   │
│  │                                                                  │   │
│  │  ┌───────────────────────────────────────┐                      │   │
│  │  │         CHROMIUM WEBVIEWS             │                      │   │
│  │  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐     │                      │   │
│  │  │  │Prime│ │Dupe1│ │Dupe2│ │Dupe3│     │                      │   │
│  │  │  └─────┘ └─────┘ └─────┘ └─────┘     │                      │   │
│  │  └───────────────────────────────────────┘                      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
madrox/
├── src-tauri/                          # Rust backend
│   ├── src/
│   │   ├── main.rs                     # Tauri entry point
│   │   ├── lib.rs                      # Library exports
│   │   ├── commands/                   # IPC command handlers
│   │   │   ├── mod.rs
│   │   │   ├── browser.rs              # Tab/navigation
│   │   │   ├── identity.rs             # Dupe management
│   │   │   ├── hivemind.rs             # Entity sync
│   │   │   ├── mcp.rs                  # MCP bridge
│   │   │   └── osint.rs                # OSINT tools
│   │   ├── core/
│   │   │   ├── mod.rs
│   │   │   ├── fingerprint.rs          # Fingerprint generation
│   │   │   ├── identity_engine.rs      # Identity lifecycle
│   │   │   ├── entity_extractor.rs     # Regex entity extraction
│   │   │   └── privacy.rs              # Privacy enforcement
│   │   ├── hivemind/
│   │   │   ├── mod.rs
│   │   │   ├── sync.rs                 # Real-time sync
│   │   │   ├── entities.rs             # Entity types
│   │   │   └── correlator.rs           # Cross-reference
│   │   ├── mcp/
│   │   │   ├── mod.rs
│   │   │   ├── server.rs               # MCP server
│   │   │   ├── agents.rs               # Sub-agents
│   │   │   └── skills.rs               # Agent skills
│   │   ├── storage/
│   │   │   ├── mod.rs
│   │   │   └── sled_store.rs           # sled wrapper
│   │   └── webview/
│   │       ├── mod.rs
│   │       └── chromium.rs             # Chromium management
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── src/                                # React frontend
│   ├── main.tsx                        # Entry point
│   ├── App.tsx                         # Root component
│   ├── components/
│   │   ├── browser/                    # Browser UI
│   │   │   ├── TitleBar.tsx
│   │   │   ├── TabBar.tsx
│   │   │   ├── NavBar.tsx
│   │   │   └── WebViewContainer.tsx
│   │   ├── identity/                   # Identity/Dupe UI
│   │   │   ├── IdentityPanel.tsx
│   │   │   ├── DupeCard.tsx
│   │   │   ├── CreateDupeModal.tsx
│   │   │   └── IdentitySwitcher.tsx
│   │   ├── hivemind/                   # Hivemind UI
│   │   │   ├── HivemindPanel.tsx
│   │   │   ├── EntityList.tsx
│   │   │   ├── EntityCard.tsx
│   │   │   └── CrossRefAlert.tsx
│   │   ├── mcp/                        # MCP/Agent UI
│   │   │   ├── McpPanel.tsx
│   │   │   ├── AgentCard.tsx
│   │   │   ├── SkillList.tsx
│   │   │   └── AgentChat.tsx
│   │   ├── osint/                      # OSINT tools
│   │   │   ├── OsintPanel.tsx
│   │   │   ├── PhoneIntel.tsx
│   │   │   └── EntityExtractor.tsx
│   │   └── ui/                         # Shared UI components
│   │       └── ... (Mantine customizations)
│   ├── store/                          # Redux Toolkit
│   │   ├── index.ts                    # Store configuration
│   │   ├── slices/
│   │   │   ├── tabsSlice.ts
│   │   │   ├── identitySlice.ts
│   │   │   ├── hivemindSlice.ts
│   │   │   ├── mcpSlice.ts
│   │   │   └── osintSlice.ts
│   │   └── middleware/
│   │       └── tauriSync.ts            # Tauri IPC middleware
│   ├── hooks/
│   │   ├── useTauri.ts
│   │   ├── useIdentity.ts
│   │   ├── useHivemind.ts
│   │   └── useMcp.ts
│   ├── lib/
│   │   ├── tauri-commands.ts           # Type-safe IPC
│   │   └── utils.ts
│   ├── theme/
│   │   └── madrox-theme.ts             # Mantine theme
│   └── styles/
│       └── globals.css
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Database Schema (sled)

```
Trees (Key-Value Collections):
├── identities
│   └── {id} -> Identity { name, fingerprint, created_at, status }
├── sessions
│   └── {identity_id}:{session_id} -> Session { tabs, cookies, storage }
├── entities
│   └── {hash} -> Entity { type, value, sources[], first_seen, last_seen }
├── correlations
│   └── {entity_hash}:{entity_hash} -> Correlation { strength, evidence[] }
├── investigations
│   └── {id} -> Investigation { name, identities[], timeline[], notes }
└── mcp_state
    └── {agent_id} -> AgentState { context, memory, active_skills }
```

---

## Security Model

### Identity Isolation
- Each dupe runs in isolated Chromium context
- No shared cookies, storage, or cache between dupes
- Unique TLS fingerprint per identity
- Separate proxy/Tor circuits

### Data Protection
- sled database encrypted at rest
- Sensitive data never logged
- Secure wipe on dupe destruction
- Memory encryption for active sessions

### Network Security
- All traffic can route through Tor
- DNS leak prevention
- WebRTC disabled by default
- Tracker blocking at network level

---

## Performance Targets

| Metric | Target |
|--------|--------|
| App startup | < 2 seconds |
| Dupe spawn | < 500ms |
| Entity sync latency | < 100ms |
| Memory per dupe | < 150MB |
| Bundle size | < 100MB |

---

## Development Phases

### Phase 1: Foundation
- [ ] Tauri 2.0 project setup
- [ ] React 19 + TypeScript configuration
- [ ] Redux Toolkit store architecture
- [ ] Mantine theme (MADROX dark)
- [ ] Basic window and navigation

### Phase 2: Identity System
- [ ] Fingerprint generation engine
- [ ] Dupe creation and management
- [ ] Identity switching UI
- [ ] Session isolation
- [ ] sled storage integration

### Phase 3: Hivemind
- [ ] Entity extraction engine
- [ ] Real-time sync between dupes
- [ ] Cross-reference detection
- [ ] Entity relationship graph
- [ ] Hivemind dashboard

### Phase 4: MCP Integration
- [ ] MCP server implementation
- [ ] Sub-agent architecture
- [ ] Skill system
- [ ] Agent chat interface
- [ ] Context management

### Phase 5: OSINT Tools
- [ ] Phone intelligence port
- [ ] Entity extractor port
- [ ] OSINT bookmarks
- [ ] Export functionality

### Phase 6: Polish & Testing
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Documentation
- [ ] Build & packaging

---

## Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Runtime | Tauri 2.0 | Smaller size, Rust security, native performance |
| Frontend | React 19 | Large ecosystem, team scalability |
| State | Redux Toolkit | Predictable state, excellent devtools |
| UI | Mantine | Rich components, dark mode, accessibility |
| Database | sled | Rust-native, fast, embedded |
| Browser | Embedded Chromium | Full fingerprint control required |
| Theme | MADROX | Jamie Madrox / Multiple Man inspiration |

---

*"One becomes many. Many become one. The investigation continues."*
