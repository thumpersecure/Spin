# MADROX v5.0

```
███╗   ███╗ █████╗ ██████╗ ██████╗  ██████╗ ██╗  ██╗
████╗ ████║██╔══██╗██╔══██╗██╔══██╗██╔═══██╗╚██╗██╔╝
██╔████╔██║███████║██║  ██║██████╔╝██║   ██║ ╚███╔╝
██║╚██╔╝██║██╔══██║██║  ██║██╔══██╗██║   ██║ ██╔██╗
██║ ╚═╝ ██║██║  ██║██████╔╝██║  ██║╚██████╔╝██╔╝ ██╗
╚═╝     ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝
          T H E   M U L T I P L E   M A N
               O S I N T   B R O W S E R
```

<div align="center">

![Version](https://img.shields.io/badge/version-5.0.0-purple)
![Tauri](https://img.shields.io/badge/Tauri-2.0-blue)
![React](https://img.shields.io/badge/React-19-cyan)
![Rust](https://img.shields.io/badge/Rust-1.75+-orange)
![License](https://img.shields.io/badge/license-MIT-green)

*"I am Legion, for we are many."*

**The next-generation OSINT investigation browser with multi-identity support and hivemind intelligence synchronization.**

[Features](#-features) • [Installation](#-installation) • [Architecture](#-architecture) • [Usage](#-usage) • [Development](#-development)

</div>

---

## 🧬 The Story

Like **Jamie Madrox** of X-Men fame, MADROX can spawn multiple independent duplicates of itself—each with a unique identity, fingerprint, and isolated session. But unlike isolated clones, all MADROX identities share a collective intelligence through the **Hivemind**: every piece of intel discovered by one is instantly available to all.

This is not just a browser. This is a **force multiplier** for OSINT investigations.

---

## ✨ Features

### 🎭 **Identity Dupes** (Multi-Identity System)

Spawn multiple browser personas, each completely isolated:

```
┌─────────────────────────────────────────────────────────────────┐
│                    MADROX IDENTITY MATRIX                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐     │
│  │  PRIME  │    │ DUPE-1  │    │ DUPE-2  │    │ DUPE-3  │     │
│  │   👤    │    │   👤    │    │   👤    │    │   👤    │     │
│  │ Alpha-7 │    │ Beta-3  │    │ Gamma-1 │    │ Delta-8 │     │
│  └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘     │
│       └──────────────┴──────────────┴──────────────┘           │
│                          │ HIVEMIND SYNC │                      │
└─────────────────────────────────────────────────────────────────┘
```

Each identity has:
- 🆔 **Unique browser fingerprint** (canvas, WebGL, fonts, screen, etc.)
- 🍪 **Isolated cookie jar** and localStorage
- 🧅 **Independent proxy/Tor circuit**
- 📜 **Separate browsing history**
- 🎭 **Distinct user agent** and platform spoof

### 🧠 **Hivemind** (Collective Intelligence)

All entities discovered by any identity are synchronized in real-time:

- 📧 Emails, 📱 Phone numbers, 🌐 IP addresses
- 💰 Crypto wallets, 👤 Usernames, 🔗 Domains
- 📍 Coordinates, 🔑 UUIDs, and more

**Cross-Reference Detection**: When the same entity is found by multiple identities, MADROX highlights it as a high-confidence finding.

### 🤖 **MCP Integration** (AI Agents)

Model Context Protocol support for Claude-powered investigation assistance:

| Agent | Purpose |
|-------|---------|
| **Analyst** | Interprets page content, suggests investigation paths |
| **Gatherer** | Automated entity extraction and categorization |
| **Correlator** | Finds relationships between entities |
| **Reporter** | Generates comprehensive reports |
| **OPSEC** | Monitors for privacy leaks |

### 🔒 **Privacy Arsenal**

- **Anti-fingerprinting**: Canvas noise, WebGL spoofing, navigator masking
- **Tracker blocking**: 60+ known tracker domains blocked
- **Tor integration**: One-click Tor activation
- **WebRTC protection**: Leak prevention
- **Clear on exit**: Optional data wipe

### 🔧 **OSINT Toolkit**

- 📞 **Phone Intelligence**: Multi-format analysis, carrier lookup, search query generation
- 📚 **OSINT Bookmarks**: Curated resources (Shodan, HIBP, Censys, and more)
- 🔍 **Entity Extraction**: Automatic regex-based extraction from page content

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MADROX v5.0                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                   REACT FRONTEND                        │   │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│   │  │ Browser  │ │ Identity │ │ Hivemind │ │   MCP    │   │   │
│   │  │   Tabs   │ │  Panel   │ │  Panel   │ │  Panel   │   │   │
│   │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │   │
│   │       │            │            │            │          │   │
│   │  ┌────┴────────────┴────────────┴────────────┴────┐    │   │
│   │  │           REDUX TOOLKIT STORE                  │    │   │
│   │  └────────────────────┬───────────────────────────┘    │   │
│   └───────────────────────┼─────────────────────────────────┘   │
│                           │ IPC                                  │
│   ┌───────────────────────┼─────────────────────────────────┐   │
│   │                TAURI RUST BACKEND                       │   │
│   │  ┌────────────────────┴────────────────────┐           │   │
│   │  │            COMMAND HANDLERS              │           │   │
│   │  └────────────────────┬────────────────────┘           │   │
│   │           ┌───────────┼───────────┐                     │   │
│   │           ▼           ▼           ▼                     │   │
│   │  ┌─────────────┐ ┌─────────┐ ┌─────────┐               │   │
│   │  │  Identity   │ │Hivemind │ │   MCP   │               │   │
│   │  │   Engine    │ │  Core   │ │ Bridge  │               │   │
│   │  └──────┬──────┘ └────┬────┘ └────┬────┘               │   │
│   │         └─────────────┴───────────┘                     │   │
│   │                       │                                 │   │
│   │              ┌────────┴────────┐                        │   │
│   │              │  SLED DATABASE  │                        │   │
│   │              └─────────────────┘                        │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Tauri 2.0 |
| **Frontend** | React 19 + TypeScript |
| **UI Library** | Mantine 8 |
| **State** | Redux Toolkit |
| **Backend** | Rust |
| **Database** | sled (embedded) |
| **Build** | Vite 7 |

---

## 🚀 Installation

### Prerequisites

- **Node.js** 20+
- **Rust** 1.75+
- **Tauri CLI** 2.0+

### From Source

```bash
# Clone the repository
git clone https://github.com/yourusername/madrox.git
cd madrox

# Install dependencies
npm install

# Development mode
npm run tauri:dev

# Production build
npm run tauri:build
```

### Platform Binaries

Coming soon: Pre-built binaries for Windows, macOS, and Linux.

---

## 📖 Usage

### Spawning Identities

1. Click the **Identities** button in the title bar (or press `Ctrl+I`)
2. Click **"Spawn Dupe"**
3. Name your new identity (e.g., "Analyst", "Ghost", "Burner")
4. MADROX generates a unique fingerprint automatically

### Switching Identities

Click any identity card to switch. Your tabs, cookies, and session data are completely isolated per identity.

### Using the Hivemind

The Hivemind panel shows all entities discovered across all identities:

- **Filter** by entity type (email, phone, IP, etc.)
- **Search** for specific values
- **Cross-references** are highlighted in orange

### AI Agents (MCP)

1. Open the **MCP** panel
2. Select an agent
3. Describe your task (e.g., "Analyze this page for potential leads")
4. The agent processes and responds with findings

---

## 🛠️ Development

### Project Structure

```
madrox/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── store/              # Redux slices
│   ├── hooks/              # Custom hooks
│   └── theme/              # Mantine theme
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── commands/       # IPC handlers
│   │   ├── core/           # Core logic
│   │   ├── hivemind/       # Sync system
│   │   ├── mcp/            # AI integration
│   │   └── storage/        # sled database
│   └── Cargo.toml
├── package.json
└── vite.config.ts
```

### Commands

```bash
# Start development server
npm run dev

# Run Tauri in development
npm run tauri:dev

# Build for production
npm run tauri:build

# Run linting
npm run lint
```

### Adding New Entity Types

1. Add regex pattern in `src-tauri/src/core/entity_extractor.rs`
2. Add type to `EntityType` enum in `entity.rs`
3. Update frontend types in `src/store/slices/hivemindSlice.ts`

---

## 🔐 Security Model

| Feature | Implementation |
|---------|----------------|
| **Context Isolation** | Full Tauri isolation |
| **No Node.js in Renderer** | Pure browser context |
| **Encrypted Storage** | sled with optional encryption |
| **Input Validation** | All IPC messages validated |
| **URL Filtering** | Dangerous protocols blocked |

---

## 🗺️ Roadmap

- [ ] **v5.1**: Embedded Chromium webview (full fingerprint control)
- [ ] **v5.2**: Session cloning between identities
- [ ] **v5.3**: Investigation timeline and graph visualization
- [ ] **v5.4**: Full MCP server with Claude API integration
- [ ] **v6.0**: Collaborative investigations (multi-user hivemind)

---

## 📜 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **Jamie Madrox / Multiple Man** - The mutant who inspired this project
- **Tauri Team** - For the amazing framework
- **React Team** - For React 19
- **Mantine** - For the beautiful UI components

---

<div align="center">

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   "One becomes many. Many become one.                        ║
║    The investigation continues."                             ║
║                                                              ║
║                                    - MADROX                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**MADROX** - *The Multiple Man OSINT Browser*

</div>
