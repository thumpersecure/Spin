# SANDIEGO

```
   ▄████████    ▄████████ ███▄▄▄▄   ████████▄   ▄█     ▄████████    ▄██████▄   ▄██████▄
  ███    ███   ███    ███ ███▀▀▀██▄ ███   ▀███ ███    ███    ███   ███    ███ ███    ███
  ███    █▀    ███    ███ ███   ███ ███    ███ ███▌   ███    █▀    ███    █▀  ███    ███
  ███          ███    ███ ███   ███ ███    ███ ███▌  ▄███▄▄▄      ▄███        ███    ███
▀███████████ ▀███████████ ███   ███ ███    ███ ███▌ ▀▀███▀▀▀     ▀▀███ ████▄  ███    ███
         ███   ███    ███ ███   ███ ███    ███ ███    ███    █▄    ███    ███ ███    ███
   ▄█    ███   ███    ███ ███   ███ ███   ▄███ ███    ███    ███   ███    ███ ███    ███
 ▄████████▀    ███    █▀   ▀█   █▀  ████████▀  █▀     ██████████    ████████▀  ▀██████▀

              ╔═══════════════════════════════════════════════════════╗
              ║                                                       ║
              ║   T H E   O S I N T   I N V E S T I G A T I O N       ║
              ║                     S U I T E                         ║
              ║                                                       ║
              ║         "Where in the World Will You Search?"         ║
              ║                                                       ║
              ╚═══════════════════════════════════════════════════════╝

                              [ Version 3.1.0 ]
```

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-crimson.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-35.7.5-47848F.svg)](https://electronjs.org/)
[![Platform](https://img.shields.io/badge/Platform-Win%20%7C%20macOS%20%7C%20Linux-181818.svg)](#platform-installation)
[![OSINT](https://img.shields.io/badge/Purpose-OSINT-C41E3A.svg)](#osint-capabilities)

*A privacy-first browser engineered for Open Source Intelligence gathering.*

---

[The Case](#the-case) | [Installation](#installation) | [OSINT Tools](#osint-capabilities) | [Privacy](#privacy-arsenal) | [Platform Guide](#platform-installation)

</div>

---

## The Case

In the shadows of the digital world, information hides in plain sight. To find it, you need the right tools—and the discipline to leave no trace.

**SANDIEGO** is an OSINT investigation browser built for those who hunt data, not those who are hunted by it. Every feature is designed with one purpose: *gather intelligence while remaining invisible*.

Like the legendary Carmen Sandiego, you'll traverse continents of data, slipping through digital borders undetected. The question isn't whether the information exists—it's whether you can find it before the trail goes cold.

**Your mission:** Investigate. Analyze. Vanish.

---

## What Sets SANDIEGO Apart

| Feature | Purpose |
|---------|---------|
| **Built-in Tor** | Route traffic through the Tor network—no plugins required |
| **Anti-Fingerprinting** | Canvas, WebGL, and hardware spoofing to blend with the crowd |
| **Phone Intelligence** | Transform phone numbers into 10 searchable format variations |
| **Tracker Annihilation** | Block 60+ tracking domains before they see you |
| **OSINT Bookmarks** | Pre-loaded links to essential investigation resources |
| **Cross-Platform** | Native experience on Windows 11, macOS, and Debian/Ubuntu |

---

## Installation

### Prerequisites

| Requirement | Version |
|-------------|---------|
| **Node.js** | 18.x or later |
| **npm** | 8.x or later |
| **Git** | Any recent version |

### Quick Start

```bash
# Clone the repository
git clone https://github.com/thumpersecure/Spin.git
cd Spin

# Install dependencies
npm install

# Launch SANDIEGO
npm start
```

---

## Platform Installation

SANDIEGO is optimized for each operating system. Follow the guide for your platform.

### Windows 11

<details>
<summary><strong>Click to expand Windows installation</strong></summary>

#### Step 1: Install Node.js

1. Download Node.js LTS from [nodejs.org](https://nodejs.org/)
2. Run the installer
3. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

#### Step 2: Install SANDIEGO

```powershell
# Clone repository
git clone https://github.com/thumpersecure/Spin.git
cd Spin

# Install dependencies
npm install

# Run the browser
npm start
```

#### Step 3: Install Tor (Optional)

1. Download **Tor Expert Bundle** from [torproject.org/download/tor](https://www.torproject.org/download/tor/)
2. Extract to `C:\Tor`
3. Open PowerShell as Administrator:
   ```powershell
   cd C:\Tor
   .\tor.exe
   ```
4. Keep the window open while using SANDIEGO with Tor enabled

#### Building for Windows

```powershell
npm run build:win
# Output: dist/SANDIEGO Browser Setup x.x.x.exe
```

#### Windows-Specific Features

- Windows 11 Snap Layouts support
- Native window controls
- AppUserModelId for taskbar grouping
- NSIS installer with custom install path option

</details>

### macOS (Intel & Apple Silicon)

<details>
<summary><strong>Click to expand macOS installation</strong></summary>

#### Step 1: Install Prerequisites

Using Homebrew (recommended):
```bash
# Install Homebrew if not present
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Verify
node --version
npm --version
```

#### Step 2: Install SANDIEGO

```bash
# Clone repository
git clone https://github.com/thumpersecure/Spin.git
cd Spin

# Install dependencies
npm install

# Run the browser
npm start
```

#### Step 3: Install Tor (Optional)

```bash
# Install Tor via Homebrew
brew install tor

# Start Tor service
brew services start tor

# Verify Tor is running
lsof -i :9050
```

#### Building for macOS

```bash
npm run build:mac
# Output: dist/SANDIEGO Browser-x.x.x.dmg
```

#### macOS-Specific Features

- Native traffic light window controls
- Hidden inset title bar
- Dark mode support (forced dark for OSINT work)
- Vibrancy effects
- Full screen support with proper menu bar
- Hardened runtime for notarization

</details>

### Debian / Ubuntu Linux

<details>
<summary><strong>Click to expand Debian/Ubuntu installation</strong></summary>

#### Step 1: Install Node.js

Using NodeSource repository (recommended for latest LTS):
```bash
# Update package list
sudo apt update

# Install curl if not present
sudo apt install -y curl

# Add NodeSource repository (Node.js 20.x LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

Alternative using apt (older version):
```bash
sudo apt update
sudo apt install -y nodejs npm
```

#### Step 2: Install Build Dependencies

```bash
# Required for native modules
sudo apt install -y build-essential

# Required for Electron
sudo apt install -y libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils libatspi2.0-0 libdrm2 libgbm1 libxcb-dri3-0
```

#### Step 3: Install SANDIEGO

```bash
# Clone repository
git clone https://github.com/thumpersecure/Spin.git
cd Spin

# Install dependencies
npm install

# Run the browser
npm start
```

#### Step 4: Install Tor (Optional)

```bash
# Install Tor
sudo apt update
sudo apt install -y tor

# Start Tor service
sudo systemctl start tor

# Enable Tor on boot (optional)
sudo systemctl enable tor

# Verify Tor is running
ss -tlnp | grep 9050
```

#### Building for Debian/Ubuntu

```bash
npm run build:linux
# Output:
#   dist/SANDIEGO Browser-x.x.x.AppImage
#   dist/sandiego-browser_x.x.x_amd64.deb
```

Install the .deb package:
```bash
sudo dpkg -i dist/sandiego-browser_*.deb
```

#### Linux-Specific Features

- AppImage for universal Linux support
- .deb package for Debian-based systems
- .rpm package for Fedora/RHEL (use `build:linux`)
- XDG-compliant config path (`~/.config/sandiego`)
- Proper desktop integration

</details>

### Other Linux Distributions

<details>
<summary><strong>Fedora / RHEL / Arch</strong></summary>

#### Fedora / RHEL

```bash
# Install Node.js
sudo dnf install -y nodejs npm

# Install Tor
sudo dnf install -y tor
sudo systemctl start tor

# Clone and run
git clone https://github.com/thumpersecure/Spin.git
cd Spin
npm install
npm start
```

#### Arch Linux

```bash
# Install Node.js
sudo pacman -S nodejs npm

# Install Tor
sudo pacman -S tor
sudo systemctl start tor

# Clone and run
git clone https://github.com/thumpersecure/Spin.git
cd Spin
npm install
npm start
```

</details>

---

## OSINT Capabilities

### Phone Intelligence Module

Transform any phone number into 10 searchable format variations, then execute smart OSINT searches across multiple formats simultaneously.

| Format | Example |
|--------|---------|
| Raw Digits | `2025551234` |
| E.164 | `+12025551234` |
| US Format | `(202) 555-1234` |
| Dashed | `202-555-1234` |
| Spaced | `202 555 1234` |
| Dotted | `202.555.1234` |
| International | `+1 2025551234` |
| Zero-Prefixed | `02025551234` |
| Double-Zero | `0012025551234` |

**Smart Search**: Combines all formats into a single OR query for maximum coverage.

### Pre-loaded OSINT Resources

| Category | Resources |
|----------|-----------|
| **Username** | Namechk, WhatsMyName, Sherlock, UserSearch |
| **Email** | Hunter.io, Have I Been Pwned, Epieos, EmailRep |
| **Domain/IP** | Shodan, Censys, SecurityTrails, DNSDumpster, crt.sh |
| **Images** | TinEye, Yandex Images, PimEyes, FotoForensics |
| **Social** | Social Searcher, Social Blade |
| **Archives** | Wayback Machine, Archive.today, CachedView |
| **Threat Intel** | VirusTotal, Hybrid Analysis, Any.run, AbuseIPDB |

---

## Privacy Arsenal

### Tor Integration

- One-click Tor activation
- DNS resolution through Tor (`socks5h://`)
- Automatic Tor detection on startup
- Platform-specific Tor status guidance

### Anti-Fingerprinting

| Protection | Method |
|------------|--------|
| **Canvas** | Adds subtle noise to canvas data |
| **WebGL** | Reports generic Intel GPU |
| **Screen** | Standardizes to 1920x1080 |
| **Platform** | Masks to match user agent |
| **Hardware** | Reports 4 cores, 8GB RAM |
| **Battery** | API completely removed |
| **WebDriver** | Hidden from detection |

### Tracker Blocking

Blocks 60+ tracking domains including:
- Google Analytics, Tag Manager, AdServices
- Facebook Pixel, Connect
- Twitter/X Analytics
- TikTok, LinkedIn, Microsoft trackers
- Mixpanel, Amplitude, Segment, Hotjar
- All major ad networks

### Additional Privacy Features

- Third-party cookie blocking
- WebRTC IP leak prevention
- Do Not Track + Global Privacy Control headers
- Platform-specific user agent spoofing
- Automatic HTTPS upgrade
- Optional clear-on-exit

---

## Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| New Tab | `Ctrl+T` | `Cmd+T` |
| Close Tab | `Ctrl+W` | `Cmd+W` |
| Reload | `Ctrl+R` | `Cmd+R` |
| Force Reload | `Ctrl+Shift+R` | `Cmd+Shift+R` |
| Zoom In | `Ctrl++` | `Cmd++` |
| Zoom Out | `Ctrl+-` | `Cmd+-` |
| Reset Zoom | `Ctrl+0` | `Cmd+0` |
| DevTools | `F12` | `Cmd+Option+I` |
| Phone Intel | `Ctrl+Shift+P` | `Cmd+Shift+P` |
| OSINT Bookmarks | `Ctrl+Shift+B` | `Cmd+Shift+B` |
| Toggle Tor | `Ctrl+Shift+T` | `Cmd+Shift+T` |
| Screenshot | `Ctrl+Shift+S` | `Cmd+Shift+S` |
| View Source | `Ctrl+U` | `Cmd+U` |

---

## Project Structure

```
Spin/
├── src/
│   ├── main/
│   │   └── main.js              # Main process with platform detection
│   ├── renderer/
│   │   ├── index.html           # Browser UI
│   │   ├── styles.css           # Dark theme styles
│   │   └── renderer.js          # UI logic
│   ├── preload/
│   │   ├── preload.js           # Secure IPC bridge
│   │   └── webview-preload.js   # Minimal webview API
│   └── extensions/
│       └── phone-intel.js       # Phone intelligence module
├── package.json
└── README.md
```

---

## Security Architecture

### Electron Security

- **Context Isolation**: Renderer fully isolated from Node.js
- **Sandbox Mode**: All browser views sandboxed
- **No Node Integration**: Renderer has zero Node.js access
- **Preload Whitelist**: Only approved IPC channels exposed
- **No Remote Module**: All remote events blocked

### Input Validation

- Phone numbers limited to 30 characters
- Search URLs validated against trusted hosts only
- IPC channels whitelisted
- URL protocols validated (no `file://`, `javascript:`, `data:`)

### Privacy by Design

- No telemetry or analytics
- No external API calls except user-initiated searches
- All settings stored locally
- Optional data purge on exit

---

## Legal Notice

SANDIEGO is designed for:
- Legitimate OSINT research
- Journalism and fact-checking
- Security research with authorization
- Law enforcement with proper warrants
- Personal privacy protection

**Users are responsible for compliance with all applicable laws.**

---

## Contributing

```bash
# Fork the repository
# Create your feature branch
git checkout -b feature/your-feature

# Commit your changes
git commit -m 'Add your feature'

# Push to the branch
git push origin feature/your-feature

# Open a Pull Request
```

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

```
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║        The world is full of secrets waiting to be uncovered.         ║
║                                                                       ║
║           The question is: can you find them first?                  ║
║                                                                       ║
║                            🔴 🌍 🔍                                    ║
║                                                                       ║
║                          SANDIEGO                                     ║
║                 The OSINT Investigation Suite                         ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
```

*"She travels the world, leaving only questions in her wake."*

---

**SANDIEGO** — Version 3.1.0

[Report Issue](https://github.com/thumpersecure/Spin/issues) | [OSINT Framework](https://osintframework.com/)

</div>
