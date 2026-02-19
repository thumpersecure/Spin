# Spin v12.0.3

```
+=========================================================================================+
|                                                                                         |
|      ####  ####   ##  ##  ##                                                            |
|     ##     ## ##   ##  ### ##                                                            |
|      ####  ####   ##  ## ###                                                            |
|         ## ##     ##  ##  ##                                                            |
|      ####  ##    #### ##  ##                                                            |
|                                                                                         |
|         ______________________________________________________                          |
|        |                                                      |                         |
|        |          J E S S I C A   J O N E S                    |                         |
|        |     O S I N T   I N V E S T I G A T I O N             |                         |
|        |              B R O W S E R                             |                         |
|        |______________________________________________________|                         |
|                                                                                         |
|            "Every case starts with a question.                                          |
|             Every answer hides behind a screen.                                         |
|             I just know which screens to look at."                                      |
|                                                                                         |
|                     -- Alias Investigations --                                          |
|                                                                                         |
+=========================================================================================+
```

<div align="center">

![Version](https://img.shields.io/badge/version-12.0.3-8B008B?style=for-the-badge)
![Codename](https://img.shields.io/badge/codename-Jessica_Jones-4B0082?style=for-the-badge)
![iced](https://img.shields.io/badge/iced-0.13-blueviolet?style=for-the-badge)
![Rust](https://img.shields.io/badge/Rust-1.75+-orange?style=for-the-badge)
![Zero NPM](https://img.shields.io/badge/NPM-zero-red?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=for-the-badge)
![OSINT](https://img.shields.io/badge/OSINT-Investigation_Browser-purple?style=for-the-badge)

---

### *"I'm not the hero type. I just find the truth that others can't -- or won't."*

**A private investigator doesn't need superpowers. She needs the right tools,**
**the right identities, and the nerve to dig where nobody else dares.**

[Case Files](#case-files) | [What's New](#whats-new-in-v1203) | [The Office](#architecture--the-office) | [Getting Started](#getting-started) | [Field Manual](#field-manual)

---

</div>

## The Story

```
+------------------------------------------------------------------------------+
|                                                                              |
|    Alias Investigations.                                                     |
|                                                                              |
|    The sign on the door is cracked. The whiskey is cheap. But the            |
|    results? Those are worth every penny.                                     |
|                                                                              |
|    Jessica Jones doesn't do capes and costumes. She does stakeouts,          |
|    background checks, and the kind of digging that makes powerful            |
|    people nervous. In a world where your digital footprint is your           |
|    biggest vulnerability, she turned her investigation methods into          |
|    something different -- a browser.                                         |
|                                                                              |
|    Spin takes the PI's instinct and weaponizes it. Multiple                  |
|    identities for multiple angles of approach. AI agents that work           |
|    like a team of researchers who never sleep. A privacy engine that         |
|    adjusts on the fly, because in this line of work, getting burned          |
|    means more than a bad Yelp review.                                        |
|                                                                              |
|    Every investigation needs a starting point.                               |
|    This browser IS the starting point.                                       |
|                                                                              |
|    "It's called doing the work. Now shut up and let me concentrate."         |
|                                                                              |
+------------------------------------------------------------------------------+
```

---

## Case Files

> *"Every case has its tools. These are mine."*

```
┌──────────────────────────────────────────────────────────────┐
│  ██████╗ █████╗ ███████╗███████╗    ███████╗██╗██╗     ███████╗███████╗  │
│ ██╔════╝██╔══██╗██╔════╝██╔════╝    ██╔════╝██║██║     ██╔════╝██╔════╝  │
│ ██║     ███████║███████╗█████╗      █████╗  ██║██║     █████╗  ███████╗  │
│ ██║     ██╔══██║╚════██║██╔══╝      ██╔══╝  ██║██║     ██╔══╝  ╚════██║  │
│ ╚██████╗██║  ██║███████║███████╗    ██║     ██║███████╗███████╗███████║  │
│  ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝    ╚═╝     ╚═╝╚══════╝╚══════╝╚══════╝  │
└──────────────────────────────────────────────────────────────┘
```

### Case File 001 -- Embedded Chromium (CEF)

**Full browser engine under your complete control.**

Every identity gets its own isolated Chromium context -- think of it as a separate investigator walking into a room with a completely different face. No two look alike. No two leave the same trail.

| Fingerprint Vector | Spoofing |
|--------------------|----------|
| **Canvas** | Unique noise injection per identity |
| **WebGL** | Fake GPU vendor/renderer strings |
| **Audio** | Audio context fingerprint masking |
| **Fonts** | Custom font enumeration per identity |
| **Timezone** | Configurable timezone spoofing |
| **WebRTC** | IP leak prevention, STUN/TURN control |
| **Navigator** | Platform, language, hardware concurrency |

Each Chromium instance runs in its own sandbox. Cookies, cache, localStorage -- all compartmentalized. Like working a case from multiple angles without any of your covers knowing about each other.

> *"People say I have a drinking problem. I say I have a drinking solution. Same applies to browser fingerprinting."*

---

### Case File 002 -- Session Cloning

**Clone sessions between identities -- securely.**

Sometimes you need to hand off a case. Sometimes you need a second pair of eyes looking at the same evidence from a different angle. Session cloning lets you duplicate an identity's entire session state to another identity.

- **Cookies** -- Full cookie jar transfer with sensitive cookie filtering
- **localStorage** -- Complete key-value state migration
- **History** -- Browsing trail duplication
- **Integrity Hashing** -- SHA-256 verification ensures nothing was tampered with in transit
- **Domain Filtering** -- Clone only what you need, leave the rest behind

> *"Trust, but verify. Especially when the evidence is digital."*

---

### Case File 003 -- Investigation Timeline & Graph

**Track every step. See every connection.**

Every good PI keeps meticulous notes. Spin does it automatically. Every entity discovered, every connection made, every pivot point in your investigation -- logged, timestamped, and visualized.

- **D3.js Force-Directed Graph** -- Entity relationship visualization that reveals connections invisible to the naked eye
- **Timeline Events** -- Chronological investigation playback
- **Graph Nodes & Edges** -- Entities as nodes, relationships as edges, weighted by confidence
- **Export** -- Take your evidence board digital and portable

It's like having a wall of photos connected by red string -- except it never runs out of wall space, and the string draws itself.

> *"Connections. Everything's about connections. The trick is seeing the ones nobody else can."*

---

### Case File 004 -- Claude AI MCP Server

**8 specialized agents. One shared brain.**

You don't work alone in this business. Spin gives you a full investigation team powered by Claude API through the Model Context Protocol. Shared context means every agent knows what the others have found. Smart tool routing means the right agent handles the right job.

| Agent | Specialty | Think of them as... |
|-------|-----------|---------------------|
| **Analyst** | Content analysis, threat assessment, credibility scoring, sentiment | Your profiler |
| **Gatherer** | Entity extraction, deep scraping, archive search, categorization | Your field operative |
| **Correlator** | Relationship mapping, pattern detection, anomaly detection | Your conspiracy board |
| **Reporter** | Report generation, evidence compilation, PDF/JSON export | Your paralegal |
| **OPSEC** | Leak detection, fingerprint analysis, identity correlation | Your counter-surveillance |
| **Social Intel** | Profile analysis, connection mapping, username search (500+ platforms) | Your social butterfly |
| **Dark Web** | Onion crawl, market monitoring, breach lookup, forum intel | Your underworld contact |
| **Crypto Tracer** | Wallet analysis, transaction tracing, mixer detection, clustering | Your forensic accountant |

> *"I don't have a team. I have something better -- agents that don't argue, don't sleep, and don't leak to the press."*

---

### Case File 005 -- Identity Dupes

**Multiple isolated browser identities with unique fingerprints.**

Each identity is a complete cover story: unique fingerprint, isolated cookies, independent network stack, separate history. Like running multiple undercover operatives who never know about each other. 24 NATO alphabet codenames with cryptographic hex suffixes ensure no two dupes are ever confused.

> *"I used to just be one person. Then I realized that was a tactical disadvantage."*

---

### Case File 006 -- Hivemind

**Cross-identity entity synchronization.**

What one identity discovers, all identities can access. When multiple identities independently find the same entity, Spin flags it as **HIGH CONFIDENCE** intelligence. Real-time sync. Paginated views. The collective memory of every cover you've ever run.

> *"Intel is only useful when it's shared. But sharing has to be on my terms."*

---

### Case File 007 -- Dynamic Privacy Engine

**5 OPSEC levels. Because paranoia is just good tradecraft.**

| Level | Description | When to use it |
|-------|-------------|----------------|
| **MINIMAL** | Basic protection | Trusted OSINT platforms |
| **STANDARD** | Tracker blocking, basic spoofing | General browsing |
| **ENHANCED** | Fingerprint spoofing, full tracker block | Sensitive research |
| **MAXIMUM** | Full spoofing + Tor routing | High-risk investigation |
| **PARANOID** | Assume active adversary, everything enabled | When they're watching back |

Auto-adjusts based on site risk assessment. Trusted OSINT sites (Shodan, HIBP, Censys, GreyNoise, IntelX) get lighter treatment. Dark web and hostile domains get the full lockdown. Dynamic confidence scoring adapts in real time.

> *"Paranoid? I prefer 'professionally cautious.'"*

---

### Case File 008 -- OSINT Toolkit

**Professional intelligence tools for professional investigators.**

- **Phone Intel** -- Multi-format analysis, carrier lookup, minimum 7-digit validation
- **Email Intel** -- Domain validation, breach check, provider detection, disposable detection
- **Username Hunt** -- 12+ platforms instant, 500+ via extended tools
- **Domain Recon** -- WHOIS, DNS, subdomains, tech stack, historical records

---

## Architecture -- The Office

> *"Every PI needs an office. This is mine."*

```
+=========================================================================================+
|                       S P I N   v 1 2 . 0 . 3                                          |
|                    " J E S S I C A   J O N E S "                                        |
+=========================================================================================+
|                                                                                         |
|   +-------------------------------------------------------------------------+           |
|   |                   i c e d   0 . 1 3   G U I   ( P u r e   R u s t )     |           |
|   |  +----------+ +----------+ +----------+ +----------+ +----------+       |           |
|   |  | Browser  | | Identity | | Hivemind | |   MCP    | | Privacy  |       |           |
|   |  |   Tabs   | |  Panel   | |  Panel   | |  Panel   | |Dashboard |       |           |
|   |  +-----+----+ +-----+----+ +----+-----+ +----+-----+ +----+-----+       |           |
|   |  +----------+ +----------+ +----------+                                 |           |
|   |  |Investig. | | Settings | |  OSINT   |                                 |           |
|   |  | Timeline | |  Panel   | |  Panel   |                                 |           |
|   |  +-----+----+ +-----+----+ +----+-----+                                 |           |
|   |        +----------+---+----------+---+----------+---+----------+        |           |
|   |                                  |                                      |           |
|   |         +------------------------+------------------------+             |           |
|   |         |   AppState + Message enum (Elm architecture)    |             |           |
|   |         |   [tabs] [identity] [hivemind] [mcp] [osint]    |             |           |
|   |         |   [ui] [privacy] [investigation] [settings]     |             |           |
|   |         +------------------------+------------------------+             |           |
|   +----------------------------------+----------------------------------+   |           |
|                                      | Direct Rust fn calls (no IPC)        |           |
|   +----------------------------------+----------------------------------+   |           |
|   |                    R U S T   B A C K E N D                           |   |           |
|   |              +-----------------------------+                        |   |           |
|   |              |     SERVICE LAYER           |                        |   |           |
|   |              |   (commands/ modules)        |                        |   |           |
|   |              +-------------+---------------+                        |   |           |
|   |    +----------+-----+------+------+----------+----------+           |   |           |
|   |    v          v     v      v      v          v          v           |   |           |
|   | +-------+ +------+ +----+ +----+ +-------+ +-------+ +------+      |   |           |
|   | |Identity| |Hive- | |MCP | |CEF | |Invest.| |Session| |Privacy|      |   |           |
|   | | Engine | | mind | |Srvr| |Core| |Timeline| |Clone | |Engine |      |   |           |
|   | +---+---+ +--+---+ +-+--+ +-+--+ +---+---+ +--+---+ +---+---+      |   |           |
|   |     +--------+-------+------+--------+--------+--------+           |   |           |
|   |                              |                                      |   |           |
|   |                 +------------+------------+                         |   |           |
|   |                 |    SLED DATABASE        |                         |   |           |
|   |                 |  [Embedded Key-Value]   |                         |   |           |
|   |                 +-------------------------+                         |   |           |
|   +---------------------------------------------------------------------+   |           |
|                                                                             |           |
|   Embedded browser window handled by wry 0.44 (WebView)                    |           |
|                                                                             |           |
+=========================================================================================+
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **GUI Framework** | iced 0.13 | Pure Rust native GUI (Elm architecture) |
| **Browser View** | wry 0.44 | Embedded WebView for browsing pane |
| **Language** | Rust 1.75+ | Performance, safety, and system access |
| **State** | AppState + Message enum | Replaces Redux — Elm-style update loop |
| **Browser Engine** | CEF (Chromium Embedded Framework) | Full fingerprint-controlled browsing |
| **Database** | sled | Embedded key-value store |
| **AI** | Claude API (MCP) | 8 specialized investigation agents |
| **Build** | Cargo | Zero NPM — pure Rust toolchain |

v12 is **100% Rust, zero NPM**. The iced GUI framework handles all UI natively. The wry WebView provides the embedded browser pane. The Rust service layer replaces the old Tauri IPC bridge — all commands are direct async function calls from the update loop.

---

## Getting Started

> *"You don't need a license to investigate. You just need to know where to look."*

```
┌──────────────────────────────────────────────────────────────┐
│                    Q U I C K   S T A R T                      │
│                                                              │
│   Option A: Interactive Installer (recommended)              │
│   $ bash install.sh                                          │
│                                                              │
│   Option B: Manual (Cargo)                                   │
│   $ git clone https://github.com/thumpersecure/Spin.git     │
│   $ cd Spin/app/src-tauri && cargo run                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Prerequisites

```bash
# Required
Rust 1.75+    (https://rustup.rs)
Git

# Linux (Debian/Ubuntu/Parrot/Kali)
sudo apt install \
    libgtk-3-dev libwebkit2gtk-4.1-dev \
    libayatana-appindicator3-dev librsvg2-dev \
    libssl-dev libxdo-dev build-essential

# Linux (Fedora/RHEL)
sudo dnf install gtk3-devel webkit2gtk4.1-devel \
    libappindicator-gtk3-devel librsvg2-devel openssl-devel

# Linux (Arch/Manjaro)
sudo pacman -S gtk3 webkit2gtk-4.1 libappindicator-gtk3 librsvg openssl

# macOS — no extra dependencies required (Xcode CLT handles it)
xcode-select --install
```

### Installation (Interactive)

The recommended way to install Spin:

```bash
git clone https://github.com/thumpersecure/Spin.git
cd Spin
bash install.sh
```

The installer handles everything: dependency checking, old version detection, system library installation, desktop shortcuts, and verification.

### Installation (Manual)

```bash
# Clone the repository
git clone https://github.com/thumpersecure/Spin.git
cd Spin/app/src-tauri

# Development mode (compiles and runs)
cargo run

# Production build
cargo build --release
# Binary: ./target/release/spin
```

### Platform Binaries

Pre-built binaries are available via [GitHub Releases](https://github.com/thumpersecure/Spin/releases):

| Platform | Format | Notes |
|----------|--------|-------|
| **Windows** | `.msi`, `.exe` | MSI installer or NSIS portable |
| **macOS** | `.dmg` | Drag to Applications |
| **Linux** | `.AppImage`, `.deb` | AppImage or Debian package |

---

## Field Manual

> *"I could tell you how to do this, but then I'd have to bill you."*

### Spawning Identities (Dupes)

1. Click **Identities** in the side panel
2. Type a name in the input field (e.g., "Ghost", "Analyst", "Burner")
3. Click **Create**
4. Spin generates a unique fingerprint automatically

### Switching Identities

Click any identity card. Tabs, cookies, sessions -- **completely isolated**. Like walking into a room as a different person.

### Cloning Sessions

1. Select the source identity
2. Right-click > **Clone Session**
3. Select the target identity
4. Choose what to clone: cookies, localStorage, history
5. Session data is integrity-verified via SHA-256 before transfer

### Investigation Timeline

1. Open the **Investigation** panel
2. View the chronological timeline of your investigation
3. Switch to **Graph** view for D3.js entity relationship visualization
4. Click nodes to expand connections, drag to rearrange
5. Export your investigation state at any time

### AI Agents (MCP)

1. Open the **MCP** panel
2. Select your agent (Analyst, Gatherer, Correlator, etc.)
3. Describe your task in natural language
4. Agents share context -- findings from one are available to all
5. Review results, export reports

### Dynamic Privacy

1. Open **Privacy** panel (shield icon)
2. Select OPSEC level or let auto-adjust handle it
3. Toggle individual protections as needed
4. Monitor real-time blocking stats

---

## What's New in v12.0.3

> *"New tools. Same attitude."*

### "Jessica Jones" Release

This release delivers the four major capabilities that were on the roadmap -- embedded Chromium, session cloning, investigation visualization, and full AI integration -- along with a complete architectural overhaul that eliminates the NPM dependency chain entirely.

**Pure Rust GUI (iced 0.13 + wry 0.44)**
- Replaced React/TypeScript/Vite/NPM frontend with a native Rust GUI
- iced 0.13 Elm-style architecture: `AppState` struct + `Message` enum replaces 9 Redux slices
- wry 0.44 provides the embedded browser WebView pane
- Zero NPM packages — single `cargo build` from clone to binary
- All UI panels ported to Rust: title bar, tabs, nav bar, identity, hivemind, MCP, OSINT, privacy, investigation, settings

**Embedded Chromium via CEF**
- Full Chromium Embedded Framework integration with per-identity browser contexts
- Complete fingerprint injection pipeline: Canvas, WebGL, Audio, Font, Timezone, WebRTC, Navigator
- Sandboxed execution with isolated cookie jars, cache, and localStorage per identity

**Secure Session Cloning**
- Clone cookies, localStorage, and history between identities
- Sensitive cookie filtering prevents credential leakage during transfer
- SHA-256 integrity hashing verifies session data was not tampered with
- Domain filtering for selective cloning

**Investigation Timeline & Graph**
- D3.js force-directed entity relationship graph visualization
- Chronological investigation timeline with event tracking
- Graph nodes and edges with confidence-weighted relationships
- Full investigation state export

**Claude API Integration (MCP Server)**
- 8 specialized AI agents with shared investigation context
- Smart tool routing directs queries to the appropriate agent
- Full Claude API integration with streaming responses
- Shared context window across all agents for cross-referencing

---

## Security Model

> *"I don't trust anyone. It's not personal -- it's professional."*

| Feature | Implementation |
|---------|----------------|
| **Zero JavaScript Runtime** | Pure Rust — no JS execution surface in the host app |
| **Context Isolation** | CEF process isolation — each identity is a sandboxed Chromium process |
| **Encrypted Storage** | sled with optional encryption at rest |
| **Input Validation** | All inputs validated in the Rust service layer with length limits (1000 char cap) |
| **URL Filtering** | Dangerous protocols blocked (`javascript:`, `data:`, `file:`, `vbscript:`, `blob:`) |
| **Lock Safety** | All RwLock operations use error propagation, zero panics |
| **Session Integrity** | SHA-256 hashing on all cloned session data |
| **Sensitive Cookie Filtering** | Auth tokens and credentials stripped during session clone |
| **CEF Sandboxing** | Each Chromium instance runs in isolated process space |

---

## Version History

```
v12.0.3 ████████████████████  CURRENT -- "Jessica Jones"
        └─ Pure Rust GUI (iced + wry), CEF, Session Cloning, Investigation Graph, Claude MCP

v5.0    ████████████████████
        └─ "The Multiple Man" (Tauri + React)

v4.x    ████████████████████
        └─ "The Exorcist's Edge" (Electron + Svelte)

v3.x    ████████████████████
        └─ "Carmen Sandiego" - International Red

v2.0    ████████████████████
        └─ "Tracey Edition" - Hollywood Noir

v1.0    ████████████████████
        └─ "Dick Tracy Edition" - Classic Detective Yellow
```

---

## Roadmap

> *"I don't plan ahead. But sometimes the case demands it."*

```
v12.0.3 ████████████████████  CURRENT -- "Jessica Jones"
        └─ Pure Rust, CEF, Session Cloning, Investigation Graph, Claude MCP Server

v13.0   ░░░░░░░░░░░░░░░░░░░░  NEXT
        └─ Collaborative investigations (multi-user hivemind),
           real-time shared case boards, team identity management,
           and encrypted peer-to-peer evidence sharing.
           Codename TBD.
```

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

## Acknowledgments

- **Jessica Jones / Alias Investigations** -- The PI who proved you don't need a cape to get results
- **iced-rs** -- For the pure Rust GUI framework
- **wry** -- For the cross-platform WebView
- **D3.js** -- For making data visible
- **Anthropic / Claude** -- For the AI that powers the MCP agents
- **The OSINT Community** -- For the tools, techniques, and tradecraft

---

## Jessica Jones on OSINT

> *"Knowing is half the battle. The other half is not getting caught knowing."*

> *"I don't stalk. I investigate. There's a legal distinction. Mostly."*

> *"The internet remembers everything. My job is knowing where it keeps the receipts."*

> *"People think privacy is about having nothing to hide. It's actually about choosing what to show."*

> *"Every digital footprint tells a story. I'm just a really good reader."*

> *"The best cover identity is the one nobody thinks to question."*

---

<div align="center">

```
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║               A L I A S                                  ║
║         I N V E S T I G A T I O N S                      ║
║                                                          ║
║    ┌──────────────────────────────────────┐              ║
║    │  Cases solved.                       │              ║
║    │  Questions answered.                 │              ║
║    │  Secrets found.                      │              ║
║    │  Identities... managed.              │              ║
║    └──────────────────────────────────────┘              ║
║                                                          ║
║            Spin v12.0.3 - "Jessica Jones"                ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

**Spin v12.0.3** - *"Jessica Jones"*

*"I'm not a hero. I'm a private investigator. Now get out of my office."*

---

![GitHub Issues](https://img.shields.io/github/issues/thumpersecure/Spin?style=flat-square&color=8B008B)
![GitHub Stars](https://img.shields.io/github/stars/thumpersecure/Spin?style=flat-square&color=4B0082)
![Last Commit](https://img.shields.io/github/last-commit/thumpersecure/Spin?style=flat-square)

[Report Issue](https://github.com/thumpersecure/Spin/issues) | [Releases](https://github.com/thumpersecure/Spin/releases)

</div>
