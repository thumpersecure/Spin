# MADROX v12.0.0

```
+=========================================================================================+
|                                                                                         |
|   ###   ###  #####  ####  ####   #####  ##  ##                                          |
|   ## # # ##  ##  ## ## ## ## ##  ##   ##  ####                                           |
|   ##  #  ##  ###### ##  # ####  ##   ##   ##                                            |
|   ##     ##  ##  ## ## ## ## ##  ##   ##  ####                                           |
|   ##     ##  ##  ## ####  ##  #  #####  ##  ##                                           |
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

![Version](https://img.shields.io/badge/version-12.0.0-8B008B?style=for-the-badge)
![Codename](https://img.shields.io/badge/codename-Jessica_Jones-4B0082?style=for-the-badge)
![Tauri](https://img.shields.io/badge/Tauri-2.0-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-cyan?style=for-the-badge)
![Rust](https://img.shields.io/badge/Rust-1.75+-orange?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

---

### *"I'm not the hero type. I just find the truth that others can't -- or won't."*

**A private investigator doesn't need superpowers. She needs the right tools,**
**the right identities, and the nerve to dig where nobody else dares.**

[Case Files](#-case-files) | [What's New](#-whats-new-in-v1200) | [The Office](#%EF%B8%8F-architecture--the-office) | [Getting Started](#-getting-started) | [Field Manual](#-field-manual)

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
|    MADROX takes the PI's instinct and weaponizes it. Multiple               |
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

---

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

Every good PI keeps meticulous notes. MADROX does it automatically. Every entity discovered, every connection made, every pivot point in your investigation -- logged, timestamped, and visualized.

- **D3.js Force-Directed Graph** -- Entity relationship visualization that reveals connections invisible to the naked eye
- **Timeline Events** -- Chronological investigation playback
- **Graph Nodes & Edges** -- Entities as nodes, relationships as edges, weighted by confidence
- **Export** -- Take your evidence board digital and portable

It's like having a wall of photos connected by red string -- except it never runs out of wall space, and the string draws itself.

---

### Case File 004 -- Claude AI MCP Server

**8 specialized agents. One shared brain.**

You don't work alone in this business. MADROX gives you a full investigation team powered by Claude API through the Model Context Protocol. Shared context means every agent knows what the others have found. Smart tool routing means the right agent handles the right job.

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

---

### Case File 006 -- Hivemind

**Cross-identity entity synchronization.**

What one identity discovers, all identities can access. When multiple identities independently find the same entity, MADROX flags it as **HIGH CONFIDENCE** intelligence. Real-time sync. Paginated views. The collective memory of every cover you've ever run.

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
|                          M A D R O X   v 1 2 . 0 . 0                                   |
|                    " J E S S I C A   J O N E S "                                        |
+=========================================================================================+
|                                                                                         |
|   +-------------------------------------------------------------------------+           |
|   |                      R E A C T   F R O N T E N D                        |           |
|   |  +----------+ +----------+ +----------+ +----------+ +----------+       |           |
|   |  | Browser  | | Identity | | Hivemind | |   MCP    | | Privacy  |       |           |
|   |  |   Tabs   | |  Panel   | |  Panel   | |  Panel   | |Dashboard |       |           |
|   |  +-----+----+ +-----+----+ +----+-----+ +----+-----+ +----+-----+       |           |
|   |  +----------+ +----------+ +----------+                                 |           |
|   |  |Investig. | | Session  | |  OSINT   |                                 |           |
|   |  | Timeline | | Manager  | |  Panel   |                                 |           |
|   |  +-----+----+ +-----+----+ +----+-----+                                 |           |
|   |        +----------+---+----------+---+----------+---+----------+        |           |
|   |                                  |                                      |           |
|   |         +------------------------+------------------------+             |           |
|   |         |            REDUX TOOLKIT STORE                  |             |           |
|   |         |   [tabs] [identity] [hivemind] [mcp] [osint]    |             |           |
|   |         |   [ui] [privacy] [investigation] [session]      |             |           |
|   |         +------------------------+------------------------+             |           |
|   +----------------------------------+----------------------------------+   |           |
|                                      | IPC (Tauri Commands)                 |           |
|   +----------------------------------+----------------------------------+   |           |
|   |               T A U R I   R U S T   B A C K E N D                   |   |           |
|   |              +-----------------------------+                        |   |           |
|   |              |      COMMAND HANDLERS       |                        |   |           |
|   |              |       (30+ IPC Commands)     |                        |   |           |
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
+=========================================================================================+
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Runtime** | Tauri 2.0 | Secure desktop framework |
| **Frontend** | React 19 + TypeScript 5.x | Modern reactive UI |
| **UI Library** | Mantine 8 | Component library |
| **State** | Redux Toolkit 2.x | Predictable state management |
| **Backend** | Rust 1.75+ | Performance, safety, and system access |
| **Browser Engine** | CEF (Chromium Embedded Framework) | Full fingerprint-controlled browsing |
| **Database** | sled | Embedded key-value store |
| **Visualization** | D3.js | Force-directed graph and timeline |
| **AI** | Claude API (MCP) | 8 specialized investigation agents |
| **Build** | Vite 7 | Fast development and bundling |

The frontend handles the UI, identity management, and investigation visualization. The Rust backend handles the heavy lifting: CEF orchestration, fingerprint injection, session cloning, MCP server routing, and all the security-critical operations that should never run in a renderer process.

---

## Getting Started

> *"You don't need a license to investigate. You just need to know where to look."*

### Prerequisites

```bash
# Required
Node.js 20+
Rust 1.75+
Tauri CLI 2.0+

# Linux (Parrot OS / Debian-based)
sudo apt install libgtk-3-dev libwebkit2gtk-4.0-dev libayatana-appindicator3-dev librsvg2-dev
```

### Installation

```bash
# Clone the repository
git clone https://github.com/thumpersecure/Spin.git
cd Spin/madrox-v5

# Install dependencies
npm install

# Development mode (hot reload)
npm run tauri:dev

# Production build
npm run tauri:build
```

### Platform Binaries

Coming soon: Pre-built binaries for Windows, macOS, and Linux.

---

## Field Manual

> *"I could tell you how to do this, but then I'd have to bill you."*

### Spawning Identities (Dupes)

1. Click **Identities** in the title bar (or `Ctrl+I`)
2. Click **"Spawn Dupe"**
3. Name your cover (e.g., "Ghost", "Analyst", "Burner")
4. MADROX generates a unique fingerprint automatically

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

## What's New in v12.0.0

> *"New tools. Same attitude."*

### "Jessica Jones" Release

This release delivers the four major capabilities that were on the roadmap -- embedded Chromium, session cloning, investigation visualization, and full AI integration -- along with significant backend expansion.

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

**Backend Expansion**
- 9 new Rust modules (CEF core, session cloner, investigation tracker, MCP server, and more)
- 30+ new Tauri IPC commands
- 2 new Redux slices: `investigation` and `session`
- 3 new React component families: Investigation (Timeline, Graph, Export), Session (ClonePanel, CloneHistory, IntegrityView), and CEF (BrowserInstance, FingerprintConfig, ContextManager)

---

## Security Model

> *"I don't trust anyone. It's not personal -- it's professional."*

| Feature | Implementation |
|---------|----------------|
| **Context Isolation** | Full Tauri sandbox + CEF process isolation |
| **No Node.js in Renderer** | Pure browser context, no backend access |
| **Encrypted Storage** | sled with optional encryption at rest |
| **Input Validation** | All IPC messages validated with length limits (1000 char cap) |
| **URL Filtering** | Dangerous protocols blocked (`javascript:`, `data:`, `file:`, `vbscript:`, `blob:`) |
| **CSP** | Strict Content Security Policy headers |
| **Lock Safety** | All RwLock operations use error propagation, zero panics |
| **Session Integrity** | SHA-256 hashing on all cloned session data |
| **Sensitive Cookie Filtering** | Auth tokens and credentials stripped during session clone |
| **External Links** | `rel="noopener noreferrer"` enforced on all external anchors |
| **CEF Sandboxing** | Each Chromium instance runs in isolated process space |

---

## Version History

```
v12.0.0 ████████████████████  CURRENT -- "Jessica Jones"
        └─ Embedded Chromium, Session Cloning, Investigation Graph, Claude MCP

v10.0.1 ████████████████████
        └─ Stability, optimization, and enhancement release

v5.0    ████████████████████
        └─ MADROX - The Multiple Man (Tauri + React)

v4.x    ████████████████████
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

> *"I don't plan ahead. But sometimes the case demands it."*

```
v12.0.0 ████████████████████  CURRENT -- "Jessica Jones"
        └─ CEF, Session Cloning, Investigation Graph, Claude MCP Server

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
- **Jamie Madrox / Multiple Man** -- The mutant who inspired the multi-identity architecture
- **Tauri Team** -- For the secure desktop framework
- **React Team** -- For React 19
- **Mantine** -- For the component library
- **D3.js** -- For making data visible
- **Anthropic / Claude** -- For the AI that powers the MCP agents
- **The OSINT Community** -- For the tools, techniques, and tradecraft

---

<div align="center">

**MADROX v12.0.0** - *"Jessica Jones"*

*Alias Investigations. Cases solved. Questions answered. Secrets found.*

*"I'm not a hero. I'm a private investigator. Now get out of my office."*

---

[Report Issue](https://github.com/thumpersecure/Spin/issues) | [Spin OSINT]

</div>
