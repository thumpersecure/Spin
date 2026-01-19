# SANDIEGO Browser

```
███████╗ █████╗ ███╗   ██╗██████╗ ██╗███████╗ ██████╗  ██████╗
██╔════╝██╔══██╗████╗  ██║██╔══██╗██║██╔════╝██╔════╝ ██╔═══██╗
███████╗███████║██╔██╗ ██║██║  ██║██║█████╗  ██║  ███╗██║   ██║
╚════██║██╔══██║██║╚██╗██║██║  ██║██║██╔══╝  ██║   ██║██║   ██║
███████║██║  ██║██║ ╚████║██████╔╝██║███████╗╚██████╔╝╚██████╔╝
╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝╚══════╝ ╚═════╝  ╚═════╝

        ╔══════════════════════════════════════════════════════╗
        ║     🌎  "Where in the World Will You Search?"  🔍    ║
        ║                                                      ║
        ║            The Carmen Sandiego Edition               ║
        ║        Privacy-First OSINT Investigation Browser     ║
        ╚══════════════════════════════════════════════════════╝

                           Version 3.0.0
```

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-35.7.5-blue.svg)](https://electronjs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-brightgreen.svg)](#installation)
[![Security](https://img.shields.io/badge/Security-Hardened-red.svg)](#security-features)

**A privacy-focused, Chromium-based OSINT browser with built-in Tor integration, anti-fingerprinting protection, and comprehensive investigation tools.**

[Features](#-features) | [Installation](#-installation) | [Usage](#-usage) | [Security](#-security-features) | [Contributing](#-contributing)

</div>

---

## The Mission Briefing

Good morning, Agent.

Your mission, should you choose to accept it, is to navigate the digital world without leaving a trace. **SANDIEGO Browser** is your trusted companion for Open Source Intelligence (OSINT) investigations—a browser that puts privacy first while providing powerful tools for legitimate research.

Like the legendary Carmen Sandiego, you'll traverse the globe (digitally) while remaining one step ahead of those who would track your movements.

**This browser will self-destruct in...** just kidding. But it *can* automatically clear all your data on exit.

---

## The Dossier

| Codename | SANDIEGO |
|----------|----------|
| **Version** | 3.0.0 - Carmen Sandiego Edition |
| **Classification** | OSINT Investigation Tool |
| **Status** | Active Duty |
| **Engine** | Chromium (via Electron) |
| **Framework** | Electron 35.7.5 |

---

## Features

### The Invisible Cloak — Privacy & Anonymity

Sometimes the best agent is the one nobody sees.

#### Tor Integration (Built-in)
- **One-Click Tor Activation** — Route all traffic through the Tor network
- **DNS Leak Prevention** — Uses `socks5h://` protocol for DNS resolution through Tor
- **No External Dependencies** — Just have Tor running on port 9050

#### Anti-Fingerprinting Arsenal
- **Canvas Fingerprint Randomization** — Adds noise to canvas data extraction
- **WebGL Fingerprint Spoofing** — Reports generic Intel GPU info
- **Screen Resolution Masking** — Reports standard 1920x1080 resolution
- **Audio Fingerprint Protection** — Prevents audio-based tracking
- **Battery API Removal** — Blocks battery status tracking

#### Tracker Annihilation
Blocks **50+ known tracking domains** including:
- Google Analytics, Tag Manager, AdServices
- Facebook Pixel, Connect
- Twitter/X Analytics
- TikTok Analytics
- Hotjar, Mixpanel, Amplitude, Segment
- Criteo, Outbrain, Taboola
- And many more...

#### Privacy Headers
- **Do Not Track (DNT)** — Sends DNT header with every request
- **Global Privacy Control (GPC)** — The new standard for privacy signals
- **User Agent Spoofing** — Blend in with Firefox ESR users
- **HTTPS Upgrade** — Automatic upgrade from HTTP to HTTPS
- **WebRTC IP Leak Prevention** — No accidental IP exposure

---

### OSINT Toolkit — Your Investigation Arsenal

#### Pre-loaded OSINT Resources

| Category | Tools |
|----------|-------|
| **Username Search** | Namechk, WhatsMyName, Sherlock, UserSearch |
| **Email Lookup** | Hunter.io, Have I Been Pwned, Epieos, EmailRep |
| **Domain & IP** | Shodan, Censys, SecurityTrails, DNSDumpster, crt.sh, VirusTotal |
| **Image Analysis** | TinEye, Yandex Images, PimEyes, FotoForensics |
| **Social Media** | Social Searcher, Social Blade |
| **Archives** | Wayback Machine, Archive.org, CachedView |
| **People Search** | Pipl, ThatsThem, Whitepages |
| **Threat Intel** | VirusTotal, Hybrid Analysis, Any.run, AbuseIPDB |

#### Phone Intelligence Module (xTELENUMSINT)

Our integrated phone intelligence system transforms phone numbers into actionable OSINT:

- **50+ Country Support** — Americas, Europe, Asia-Pacific, Middle East, Africa
- **10 Format Variations** — Raw, E.164, International, Spaced, Dashed, US Format, Dotted, and more
- **Smart OSINT Search** — Combines all formats into a single optimized query
- **Pattern Recognition** — Extracts emails, usernames, names, locations, social profiles
- **Intelligence Reports** — Comprehensive reports with relevance scoring

---

### Browser Features

#### Tab Management
- Multi-tab browsing with BrowserView isolation
- Per-tab security settings
- Favicon and title tracking
- Navigation history per tab

#### Start Page
- Quick access to popular OSINT tools
- Integrated search via DuckDuckGo
- Clean, distraction-free design

#### Extensions Panel
- Categorized OSINT bookmarks
- Phone Intelligence tool
- Privacy settings dashboard
- Searchable interface

---

## Installation

### System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| **Node.js** | 18.x | 20.x or later |
| **npm** | 8.x | 10.x or later |
| **RAM** | 4 GB | 8 GB |
| **Disk Space** | 500 MB | 1 GB |
| **OS** | Windows 10, macOS 10.15, Ubuntu 20.04 | Latest versions |

### Step 1: Clone the Repository

```bash
# Clone the SANDIEGO repository
git clone https://github.com/thumpersecure/Spin.git

# Navigate into the project directory
cd Spin
```

### Step 2: Install Dependencies

```bash
# Install all required packages
npm install

# This will automatically:
# - Install Electron 35.7.5
# - Install electron-builder for packaging
# - Install electron-store for settings persistence
# - Configure app dependencies
```

**Troubleshooting Installation:**

If you encounter permission errors on Linux/macOS:
```bash
sudo chown -R $(whoami) ~/.npm
npm install
```

If you encounter network errors:
```bash
npm install --registry https://registry.npmjs.org/
```

### Step 3: Start the Browser

```bash
# Production mode (recommended)
npm start

# Development mode (with DevTools)
npm run dev
```

---

## Tor Setup (Optional but Recommended)

For full anonymity, you'll need the Tor daemon running on your system.

### Linux (Debian/Ubuntu)

```bash
# Install Tor
sudo apt update
sudo apt install tor

# Start Tor service
sudo systemctl start tor

# Enable Tor to start on boot (optional)
sudo systemctl enable tor

# Verify Tor is running on port 9050
sudo netstat -tlnp | grep 9050
```

### Linux (Fedora/RHEL)

```bash
# Install Tor
sudo dnf install tor

# Start Tor service
sudo systemctl start tor
```

### Linux (Arch)

```bash
# Install Tor
sudo pacman -S tor

# Start Tor service
sudo systemctl start tor
```

### macOS

```bash
# Install via Homebrew
brew install tor

# Start Tor
brew services start tor

# Or run manually
tor
```

### Windows

1. Download the **Tor Expert Bundle** from [torproject.org](https://www.torproject.org/download/tor/)
2. Extract to a folder (e.g., `C:\Tor`)
3. Open Command Prompt as Administrator
4. Navigate to the Tor folder and run:
   ```cmd
   tor.exe
   ```
5. Keep the window open while using SANDIEGO

**Verify Tor is Running:**
```bash
# Should show something listening on port 9050
# Linux/macOS
lsof -i :9050

# Windows (PowerShell)
netstat -an | findstr 9050
```

---

## Building for Distribution

### Build for Current Platform

```bash
npm run build
```

### Platform-Specific Builds

```bash
# Windows (NSIS installer)
npm run build:win

# macOS (DMG)
npm run build:mac

# Linux (AppImage + DEB)
npm run build:linux
```

### Build Output

Built packages will be in the `dist/` directory:

| Platform | Output |
|----------|--------|
| Windows | `SANDIEGO Browser Setup x.x.x.exe` |
| macOS | `SANDIEGO Browser-x.x.x.dmg` |
| Linux | `SANDIEGO Browser-x.x.x.AppImage`, `.deb` |

---

## Usage

### First Launch

1. **Start SANDIEGO** — Run `npm start` or launch the built application
2. **Enable Privacy Features** — Click the shield icon and configure your privacy settings
3. **Connect to Tor** (optional) — Toggle "Tor Proxy" in Privacy settings (ensure Tor is running)
4. **Browse Securely** — Use the search bar or OSINT tools panel

### Privacy Dashboard

Access via the shield icon in the toolbar:

| Setting | Description | Default |
|---------|-------------|---------|
| **Tor Proxy** | Route traffic through Tor network | Off |
| **Block Trackers** | Block 50+ known tracking domains | On |
| **Block Fingerprinting** | Randomize browser fingerprint | On |
| **Block Third-Party Cookies** | Prevent cross-site tracking | On |
| **Block WebRTC** | Prevent IP leaks via WebRTC | On |
| **Spoof User Agent** | Use Firefox user agent | On |
| **Do Not Track** | Send DNT/GPC headers | On |
| **HTTPS Upgrade** | Auto-upgrade HTTP to HTTPS | On |
| **Clear on Exit** | Delete all data when closing | Off |

### Using Phone Intelligence

1. Click the **Extensions** button (puzzle piece icon)
2. Select the **Phone Intel** tab
3. Enter a phone number
4. Select the country
5. Choose your search engine (DuckDuckGo recommended for privacy)
6. Click **Generate Format Variations** to see all formats
7. Click **Smart OSINT Search** to search all formats at once

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + T` | New tab |
| `Ctrl/Cmd + W` | Close tab |
| `Ctrl/Cmd + L` | Focus URL bar |
| `Ctrl/Cmd + R` | Reload page |
| `Ctrl/Cmd + D` | Bookmark page |
| `Ctrl/Cmd + +` | Zoom in |
| `Ctrl/Cmd + -` | Zoom out |
| `Ctrl/Cmd + 0` | Reset zoom |
| `F12` | Toggle DevTools |
| `Escape` | Close side panel |

---

## Security Features

### Electron Security Hardening

SANDIEGO implements all recommended Electron security practices:

- **Context Isolation** — Renderer process isolated from Node.js
- **Sandbox Mode** — Enabled for all browser views
- **Node Integration Disabled** — No direct Node.js access from renderer
- **Web Security Enabled** — Same-origin policy enforced
- **Remote Module Disabled** — All remote module events blocked
- **File Protocol Blocked** — No `file://` URL navigation from web content
- **JavaScript URL Blocked** — No `javascript:` URL execution

### Input Validation

- Phone numbers limited to 30 characters
- Search URLs validated against trusted hosts only
- IPC channel whitelist for event listeners
- URL processing with protocol validation

### Privacy by Design

- No telemetry or analytics
- No external API calls (except user-initiated searches)
- All settings stored locally with electron-store
- Optional auto-clear on exit

---

## Project Structure

```
Spin/
├── src/
│   ├── main/
│   │   └── main.js              # Electron main process
│   ├── renderer/
│   │   ├── index.html           # Main browser UI
│   │   ├── styles.css           # Carmen Sandiego theme
│   │   └── renderer.js          # UI logic and state
│   ├── preload/
│   │   ├── preload.js           # Secure IPC bridge
│   │   └── webview-preload.js   # Minimal webview exposure
│   └── extensions/
│       └── phone-intel.js       # Phone intelligence module
├── assets/
│   └── icons/                   # Application icons
├── package.json
└── README.md
```

---

## Security Considerations

### For Investigators

- **Use Tor** for sensitive investigations
- **Enable all privacy features** for maximum protection
- **Clear data on exit** for sensitive sessions
- **Verify HTTPS** before entering any credentials
- **Use multiple sources** — never trust a single result

### Limitations

- **Tor is not invincible** — Sophisticated adversaries may still track you
- **JavaScript can detect Tor** — Some sites block Tor exit nodes
- **WebRTC is disabled** — Video conferencing may not work
- **Fingerprinting protection may break sites** — Some features rely on accurate data

### Legal Notice

This tool is intended for:
- Legitimate OSINT research
- Journalism and fact-checking
- Security research (with authorization)
- Law enforcement (with proper warrants)
- Personal privacy protection

**Users are responsible for complying with all applicable laws and regulations.**

---

## Contributing

We welcome contributions from the OSINT community!

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Spin.git
cd Spin

# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Code Style

- Use ES6+ features
- Follow existing code patterns
- Add comments for complex logic
- Test security-sensitive changes thoroughly

---

## License

MIT License — see [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **[Carmen Sandiego](https://en.wikipedia.org/wiki/Carmen_Sandiego)** — The legendary thief who inspired our globe-trotting theme
- **[OSINT Framework](https://osintframework.com/)** — Comprehensive OSINT resource collection
- **[Awesome OSINT](https://github.com/jivoi/awesome-osint)** — Curated list of OSINT resources
- **[xTELENUMSINT](https://github.com/thumpersecure/xtelenumsint)** — Phone intelligence inspiration
- **[Tor Project](https://www.torproject.org/)** — Privacy network infrastructure
- **[Electron](https://www.electronjs.org/)** — Cross-platform framework
- **[DuckDuckGo](https://duckduckgo.com/)** — Privacy-respecting search

---

<div align="center">

```
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   "Where in the World is Carmen Sandiego?"                        ║
║                                                                   ║
║   She's everywhere... and nowhere.                                ║
║   Just like you should be when investigating online.              ║
║                                                                   ║
║                           🌍 🔴 🕵️                                 ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

**SANDIEGO Browser — Carmen Sandiego Edition**

*"The world is your investigation. Stay invisible."*

---

Made with ❤️ by the SANDIEGO Team

[Report Bug](https://github.com/thumpersecure/Spin/issues) | [Request Feature](https://github.com/thumpersecure/Spin/issues)

</div>
