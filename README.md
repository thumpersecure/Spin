# MADROX v10.0.1

```
+=====================================================================================+
|                                                                                       |
|   ###   ###  #####  ####  ####   #####  ##  ##                                        |
|   ## # # ##  ##  ## ## ## ## ##  ##   ##  ####                                         |
|   ##  #  ##  ###### ##  # ####  ##   ##   ##                                          |
|   ##     ##  ##  ## ## ## ## ##  ##   ##  ####                                         |
|   ##     ##  ##  ## ####  ##  #  #####  ##  ##                                        |
|                                                                                       |
|                    T H E   M U L T I P L E   M A N                                    |
|                         O S I N T   B R O W S E R                                     |
|                                                                                       |
|   ---------------------------------------------------------------------------         |
|                                                                                       |
|     "In the shadows where others see one... I see MANY."                              |
|                                                                                       |
+=====================================================================================+
```

<div align="center">

![Version](https://img.shields.io/badge/version-10.0.1-purple?style=for-the-badge)
![Tauri](https://img.shields.io/badge/Tauri-2.0-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-cyan?style=for-the-badge)
![Rust](https://img.shields.io/badge/Rust-1.75+-orange?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

---

### *"I am Legion, for we are many."*

**The next-generation OSINT investigation browser with multi-identity support,**
**AI-powered agents, dynamic privacy protection, and hivemind intelligence synchronization.**

[Features](#-features) | [What's New](#-whats-new-in-v1001) | [Architecture](#%EF%B8%8F-architecture) | [Installation](#-installation) | [Usage](#-usage)

---

</div>

## What's New in v10.0.1

This release delivers a comprehensive stability, optimization, and enhancement pass across the entire codebase -- both the active v5 Tauri+React stack and the v4 Electron+Svelte legacy stack.

### Bug Fixes

**Frontend (React/TypeScript)**
- **NavBar**: Fixed stale URL state -- URL bar now syncs correctly when switching tabs. Removed unused `isSecure` state variable; security indicator now derived from actual tab URL. Auto-prepends `https://` when no protocol is specified. All page action menu items (Screenshot, Save PDF, View Source, Save Page) now have functional click handlers.
- **OsintPanel**: Fixed null reference crash when `usernameAnalysis.platforms` is undefined. Added `rel="noopener noreferrer"` to all external links for security. Added error notifications with dismissible alerts for failed OSINT queries.
- **McpPanel**: Fixed race condition where message addition and agent invocation dispatched simultaneously. Agent invocations are now sequential with proper error handling. Added loading indicator and disabled input while agent is processing.
- **PrivacyDashboard**: Fixed memory leak -- `setInterval` for stats polling now properly cleaned up on component unmount along with in-flight async thunks. `countActiveProtections` now counts all 16 protection fields correctly. Added error handling with user feedback for setting changes.
- **BrowserView**: Enhanced placeholder with MADROX branding, gradient theme orbs, clickable URL prompt, and keyboard shortcut hints (Ctrl+L, Ctrl+T, Ctrl+W).
- **IdentityPanel**: Added functional handlers for Clone Session (spawns copy of identity) and Edit (pre-fills form with existing identity data). Added dismissible error alerts for identity operations.
- **HivemindPanel**: Added pagination with "Load More" button (20 entities per page) replacing the hardcoded 20-entity limit. Pagination resets when filters change. Added clipboard copy error handling with success/failure visual feedback.

**Redux State Management**
- **tabsSlice**: Optimized `setActiveTab` -- now mutates only 2 tab objects instead of rebuilding the entire array on every tab switch.
- **mcpSlice**: Added null safety for `action.meta.arg.agentId` in pending/rejected reducers. Error messages now include agent context (e.g., "Agent 'analyst' invocation failed: ...").
- **osintSlice**: Failed analyses now clear stale results so users don't see outdated data. Added `clearAnalysis` action for UI reset flows.
- **privacySlice**: Added full pending/rejected lifecycle for `updatePrivacySettings`. `setOpsecLevel` rejected errors now include the requested level in the message.

**Rust Backend**
- **Privacy commands**: Replaced all 11 `RwLock::unwrap()` calls with proper error propagation (`map_err`). Changed from `const fn` initialization to `lazy_static!` for stable Rust compatibility.
- **Browser commands**: Added URL validation blocking dangerous protocols (`javascript:`, `data:`, `file:`, `vbscript:`, `blob:`). Improved stub implementations with informative responses.
- **OSINT commands**: Added input length limits (1000 chars) to all analysis functions. Phone analysis now requires minimum 7 digits. Email validation checks domain format (dot presence, no consecutive dots, no leading/trailing dots or hyphens).

**v4 Legacy (Electron)**
- **Critical**: Fixed `checkTorAndNotify()` -- `state.refreshTorStatus()` was not awaited, causing Tor status to always report as available (Promise object is truthy). Now properly async/awaited.
- **Critical**: Fixed `removeAllListeners(decisionChannel)` in certificate error timeout to `removeListener(decisionChannel, decisionHandler)` -- prevents removing unrelated listeners on the same channel.

### Optimizations

- **Entity extraction**: Replaced O(n log n) sort+dedup with O(n) HashSet-based deduplication. Added 100KB input length cap to prevent regex DoS.
- **Tab switching**: Reduced from O(n) full-array rebuild to O(1) targeted mutation of 2 tab objects via Immer.
- **NavBar**: Memoized active tab lookup with `useMemo` to prevent unnecessary re-renders.

### Enhancements

- **Fingerprint generation**: Extended Greek alphabet names from 8 to 24 (Alpha through Omega). Increased ID entropy from 4 to 8 bytes with 6-char hex suffix. Added 10 modern user agents (Chrome 124-131, Firefox 128/131, Edge 128, Safari 18). Added 3 new screen resolutions (4K, 1600x900, 2560x1600).
- **Privacy engine**: Dynamic confidence scoring by category (Trusted: 0.95, Social: 0.90, Government: 0.80, DarkWeb: 0.70, General: 0.60, +0.10 for known trackers). Added 8 modern tracker domains (Plausible, Heap, Intercom, Drift, HubSpot, Marketo, Pardot, Salesforce). Added 4 new social platforms (Threads, Mastodon, Bluesky, Truth Social). Added 5 new trusted OSINT domains (GreyNoise, BinaryEdge, ZoomEye, IntelX, Pulsedive).
- **Hivemind**: Added `unsubscribe(id)` mechanism with HashMap-based listener storage, preventing memory leaks from accumulated event listeners.

---

## The Story

```
+------------------------------------------------------------------------------+
|                                                                              |
|    In a world where digital footprints are currency...                       |
|    Where every click leaves a trace...                                       |
|    Where investigators need to become INVISIBLE...                           |
|                                                                              |
|    One browser dared to be DIFFERENT.                                        |
|                                                                              |
|    Like Jamie Madrox of X-Men fame--the Multiple Man who spawns             |
|    duplicates of himself--MADROX creates multiple independent                |
|    browser identities. Each one unique. Each one untraceable.                |
|    Each one connected through the HIVEMIND.                                  |
|                                                                              |
|    What one identity discovers... ALL identities know.                       |
|                                                                              |
|    This is not just a browser.                                               |
|    This is a FORCE MULTIPLIER for OSINT investigations.                      |
|                                                                              |
+------------------------------------------------------------------------------+
```

---

## Features

### Identity Dupes -- *The Multiple Man System*

Each identity is a complete isolated universe:

| Component | Isolation |
|-----------|-----------|
| **Fingerprint** | Unique canvas, WebGL, fonts, screen, audio |
| **Cookies** | Completely separate cookie jar |
| **Network** | Independent proxy/Tor circuit |
| **History** | Isolated browsing history |
| **User Agent** | Distinct platform & browser spoof |
| **Timezone** | Configurable timezone spoof |

### Hivemind -- *Collective Intelligence*

**Real-time entity synchronization across ALL identities.**

When multiple identities discover the same entity, MADROX marks it as **HIGH CONFIDENCE** intelligence. Paginated entity views with load-more support, clipboard copy with visual feedback, and proper unsubscribe mechanisms prevent memory leaks.

### Dynamic Privacy Engine -- *AI-Powered Protection*

| Level | Description |
|-------|-------------|
| MINIMAL | Trusted sites, basic protection |
| STANDARD | General browsing, tracker blocking |
| ENHANCED | Sensitive research, fingerprint spoofing |
| MAXIMUM | High-risk investigation, full spoofing + Tor |
| PARANOID | Assume active adversary, all protections enabled |

**Automatic OPSEC adjustment** based on site risk assessment with dynamic confidence scoring:

| Protection | Description |
|------------|-------------|
| **Tracker Blocking** | 70+ known tracker domains blocked |
| **Canvas Noise** | Random noise injection |
| **WebGL Spoof** | Fake GPU/renderer info |
| **Audio Spoof** | Audio context fingerprint masking |
| **WebRTC Block** | IP leak prevention |
| **Timezone Spoof** | Configurable timezone |
| **Screen Spoof** | Fake screen dimensions |
| **Tor Integration** | One-click Tor routing |
| **DNS over HTTPS** | Encrypted DNS queries |

**Site Risk Categories:**
- Trusted OSINT (Shodan, HIBP, Censys, GreyNoise, IntelX)
- General websites
- Social media platforms (including Threads, Mastodon, Bluesky)
- Government domains
- Surveillance/hostile sites
- Dark web (.onion)

### MCP Agents -- *Your AI Investigation Team*

**40+ specialized skills** across 8 AI agents powered by Model Context Protocol (MCP):

| Agent | Skills |
|-------|--------|
| **Analyst** | Content analysis, threat assessment, credibility scoring, sentiment analysis |
| **Gatherer** | Entity extraction, deep scraping, archive search, data categorization |
| **Correlator** | Relationship mapping, pattern detection, anomaly detection, network visualization |
| **Reporter** | Report generation, evidence compilation, export (PDF/JSON), executive summary |
| **OPSEC** | Leak detection, fingerprint analysis, identity correlation, countermeasures |
| **Social Intel** | Profile analysis, connection mapping, username search (500+ platforms) |
| **Dark Web** | Onion crawl, market monitoring, breach lookup, forum intelligence |
| **Crypto Tracer** | Wallet analysis, transaction trace, mixer detection, address clustering |

### OSINT Toolkit -- *Professional Intelligence Tools*

- **Phone Intel** -- Multi-format analysis with minimum 7-digit validation, carrier lookup
- **Email Intel** -- Domain validation, breach check, provider detection, disposable detection
- **Username Hunt** -- 12+ platforms instant check, 500+ via tools
- **Domain Recon** -- WHOIS, DNS, subdomains, tech stack, history

---

## Architecture

```
+=====================================================================================+
|                              M A D R O X   v 1 0 . 0 . 1                            |
+======================================================================================+
|                                                                                      |
|   +----------------------------------------------------------------------+           |
|   |                      R E A C T   F R O N T E N D                     |           |
|   |  +----------+ +----------+ +----------+ +----------+ +----------+    |           |
|   |  | Browser  | | Identity | | Hivemind | |   MCP    | | Privacy  |    |           |
|   |  |   Tabs   | |  Panel   | |  Panel   | |  Panel   | |Dashboard |    |           |
|   |  +----+-----+ +----+-----+ +----+-----+ +----+-----+ +----+-----+    |           |
|   |       +-------------+------------+------------+-----------+           |           |
|   |                              |                                        |           |
|   |         +--------------------+--------------------+                   |           |
|   |         |         REDUX TOOLKIT STORE             |                   |           |
|   |         |    [tabs] [identity] [hivemind] [mcp]   |                   |           |
|   |         |         [osint] [ui] [privacy]          |                   |           |
|   |         +--------------------+--------------------+                   |           |
|   +------------------------------+----------------------------------------+           |
|                                  | IPC (Tauri Commands)                              |
|   +------------------------------+----------------------------------------+           |
|   |               T A U R I   R U S T   B A C K E N D                     |           |
|   |              +---------------------------+                            |           |
|   |              |       COMMAND HANDLERS    |                            |           |
|   |              +-------------+-------------+                            |           |
|   |    +----------+----------+-+----------+----------+                    |           |
|   |    v          v          v          v            v                    |           |
|   | +-------+ +--------+ +-------+ +--------+ +---------+                |           |
|   | |Identity| |Hivemind| |  MCP  | | OSINT  | | Privacy |                |           |
|   | | Engine | |  Core  | | Bridge| | Tools  | | Engine  |                |           |
|   | +---+---+ +---+----+ +---+---+ +---+----+ +---+-----+                |           |
|   |     +----------+----------+----------+---------+                      |           |
|   |                              |                                        |           |
|   |                 +------------+------------+                           |           |
|   |                 |    SLED DATABASE        |                           |           |
|   |                 |  [Embedded Key-Value]   |                           |           |
|   |                 +-------------------------+                           |           |
|   +-----------------------------------------------------------------------+           |
|                                                                                      |
+======================================================================================+
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Runtime** | Tauri 2.0 | Secure desktop framework |
| **Frontend** | React 19 + TypeScript | Modern UI |
| **UI Library** | Mantine 8 | Beautiful components |
| **State** | Redux Toolkit | Predictable state |
| **Backend** | Rust | Performance & safety |
| **Database** | sled | Embedded key-value store |
| **Build** | Vite 7 | Fast bundling |

---

## Installation

### Prerequisites

```bash
# Required
Node.js 20+
Rust 1.75+
Tauri CLI 2.0+

# Linux (Parrot OS / Debian-based)
sudo apt install libgtk-3-dev libwebkit2gtk-4.0-dev libayatana-appindicator3-dev librsvg2-dev
```

### From Source

```bash
# Clone the repository
git clone https://github.com/thumpersecure/Spin.git
cd Spin/madrox-v5

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

## Usage

### Spawning Identities (Dupes)

1. Click **Identities** in title bar (or `Ctrl+I`)
2. Click **"Spawn Dupe"**
3. Name your identity (e.g., "Ghost", "Analyst", "Burner")
4. MADROX generates unique fingerprint automatically (24 NATO alphabet names, 6-char hex suffix)

### Switching Identities

Click any identity card. Tabs, cookies, and sessions are **completely isolated**.

### Cloning and Editing Identities

- **Clone**: Right-click identity > Clone Session to create a copy
- **Edit**: Right-click identity > Edit to modify name and description

### Using the Hivemind

- **Filter** by entity type (email, phone, IP, etc.)
- **Search** for specific values
- **Cross-references** highlighted in orange (high confidence)
- **Paginate** through entities with Load More (20 per page)

### AI Agents (MCP)

1. Open **MCP** panel
2. Select an agent
3. Describe your task
4. Agent processes and responds (with loading indicator and error handling)

### Dynamic Privacy

1. Open **Privacy** panel (shield icon)
2. Select OPSEC level or use auto-adjust
3. Toggle individual protections as needed
4. Monitor real-time blocking stats

---

## Security Model

| Feature | Implementation |
|---------|----------------|
| **Context Isolation** | Full Tauri sandbox |
| **No Node.js in Renderer** | Pure browser context |
| **Encrypted Storage** | sled with optional encryption |
| **Input Validation** | All IPC messages validated with length limits |
| **URL Filtering** | Dangerous protocols blocked (javascript:, data:, file:, vbscript:, blob:) |
| **CSP** | Strict Content Security Policy |
| **Lock Safety** | All RwLock operations use error propagation, no panics |
| **External Links** | `rel="noopener noreferrer"` on all external anchors |

---

## Version History

```
v10.0.1 ████████████████████  CURRENT
        └─ Stability, optimization, and enhancement release

v5.0    ████████████████████  Previous
        └─ Multi-identity, Hivemind, MCP Agents, Dynamic Privacy (Tauri + React)

v4.x    ████████████████████  Legacy
        └─ CONSTANTINE - The Exorcist's Edge (Electron + Svelte)

v3.x    ████████████████████
        └─ Carmen Sandiego - International Red

v2.0    ████████████████████
        └─ Tracey Edition - Hollywood Noir

v1.0    ████████████████████
        └─ Dick Tracy Edition - Classic Detective Yellow
```

---

## Roadmap

```
v10.0.1 ████████████████████  CURRENT
        └─ Stability, optimization, and enhancement release

v10.1   ░░░░░░░░░░░░░░░░░░░░  NEXT
        └─ Embedded Chromium webview (full fingerprint control)

v10.2   ░░░░░░░░░░░░░░░░░░░░
        └─ Session cloning between identities

v10.3   ░░░░░░░░░░░░░░░░░░░░
        └─ Investigation timeline and graph visualization

v10.4   ░░░░░░░░░░░░░░░░░░░░
        └─ Full MCP server with Claude API integration

v11.0   ░░░░░░░░░░░░░░░░░░░░  FUTURE
        └─ Collaborative investigations (multi-user hivemind)
```

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

## Acknowledgments

- **Jamie Madrox / Multiple Man** - The mutant who inspired this project
- **Tauri Team** - For the incredible framework
- **React Team** - For React 19
- **Mantine** - For the beautiful UI components
- **The OSINT Community** - For the tools and techniques

---

<div align="center">

**MADROX v10.0.1** - *The Multiple Man OSINT Browser*

*Disappear into the crowd. Become everyone. Trust no one.*

*"One becomes many. Many become one. The investigation continues."*

---

[Report Issue](https://github.com/thumpersecure/Spin/issues) | [spin osint]

</div>
