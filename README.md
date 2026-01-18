# SPIN Detective Browser - Tracey Edition

```
  ████████╗██████╗  █████╗  ██████╗███████╗██╗   ██╗
  ╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██╔════╝╚██╗ ██╔╝
     ██║   ██████╔╝███████║██║     █████╗   ╚████╔╝
     ██║   ██╔══██╗██╔══██║██║     ██╔══╝    ╚██╔╝
     ██║   ██║  ██║██║  ██║╚██████╗███████╗   ██║
     ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚══════╝   ╚═╝

    ★ ═══════════════════════════════════════════ ★
    ║     🎬  H O L L Y W O O D   N O I R  🎬     ║
    ║      "The Wrist Radio of the Digital Age"   ║
    ★ ═══════════════════════════════════════════ ★
                  ~ Tracey Edition v2.0 ~
```

> *"Calling all cars! Calling all cars!"* - This noir-style browser is your two-way wrist radio for Open Source Intelligence investigations. Built on Electron (Chromium-based) with integrated Tor support, anti-tracking protections, and comprehensive OSINT tooling.

---

## The Case File

**Codename:** Tracey
**Version:** 2.0.0
**Classification:** OSINT Investigation Tool
**Status:** Active Duty

---

## Features - Your Detective Kit

### The Invisible Cloak - Privacy & Anonymity

Like any good detective, sometimes you need to work in the shadows.

- **Extreme Privacy Mode** - Go completely dark with one click
  - Tor proxy integration (routes all traffic through the Tor network)
  - User agent spoofing (Firefox-like fingerprint)
  - Google services blocking (redirects searches to DuckDuckGo)
  - All tracking protections enabled simultaneously

- **Anti-Surveillance Protections**
  - Block 30+ known tracker domains (Google Analytics, Facebook Pixel, etc.)
  - Third-party cookie blocking
  - Do Not Track (DNT) and Global Privacy Control (GPC) headers
  - WebRTC IP leak prevention - No one traces this detective

- **Fingerprint Scrambler**
  - Canvas fingerprint randomization
  - WebGL fingerprint spoofing
  - Audio fingerprint randomization
  - *"They'll never know you were here"*

---

### The Case Files - OSINT Bookmarks

Pre-loaded intelligence resources at your fingertips, like files in your detective's desk drawer:

#### OSINT Framework Collection
*Your primary investigation toolkit*
- Username search tools (Namechk, Sherlock, Maigret)
- Email lookup services (Hunter.io, Have I Been Pwned)
- Phone number investigation (Truecaller, PhoneInfoga)
- Social media OSINT (Twint, Osintgram, Social Searcher)
- Domain & IP analysis (Shodan, Censys, SecurityTrails)
- Image analysis & reverse search (TinEye, Yandex, PimEyes)
- Geolocation tools (Google Earth, SunCalc, FlightRadar24)
- People search engines (Pipl, Whitepages)
- Business/company lookup (OpenCorporates, Crunchbase)
- Threat intelligence (VirusTotal, Hybrid Analysis)
- Breach data services (DeHashed, IntelX)

#### Awesome OSINT Collection
*Curated intelligence resources*
- Privacy-focused search engines
- Data visualization tools
- Geospatial intelligence
- Transportation tracking
- Verification tools

#### Kali Arsenal
*Tools from the legendary penetration testing distro*
- theHarvester, Recon-ng, SpiderFoot, Amass
- Sherlock, Maigret, PhoneInfoga
- DNSenum, Subfinder, and more

---

### The Magnifying Glass - Google Dorks Toolbar

Interactive toolbar for constructing advanced search queries - every detective needs a magnifying glass:

**25+ Search Operators:**
```
site:    inurl:     intitle:    intext:    filetype:   ext:
cache:   link:      related:    info:      define:     allinurl:
allintitle:         allintext:  "..."      -           OR
*        ..         before:     after:     AROUND(n)   inanchor:
```

**OSINT Dork Templates:**
- Email Discovery
- Document Leaks
- Login Pages
- Exposed Files
- Config Files
- Database Files
- API Keys
- Password Files
- Subdomains
- Error Pages

*"Leave no stone unturned, no search unqueried"*

---

### The Evidence Locker - Investigation Tools

#### Investigation Log
Your digital evidence locker:
- Automatically log visited pages with metadata
- Add notes and tags to entries
- Screenshot capture per page
- Export to JSON or HTML report
- Timeline view of investigation
- Search and filter entries

#### The Analyzer - Metadata Viewer
Extract every clue from the crime scene:
- Meta tags, Open Graph, Twitter Card data
- Technology detection (React, Vue, Angular, jQuery, etc.)
- External links and scripts analysis
- Page load timing metrics
- Form enumeration

#### Face Recognition - Reverse Image Search
One-click reverse image search across multiple engines:
- **Yandex Images** - Best for facial recognition
- **PimEyes** - Face search specialist
- **TinEye** - The original
- **Google Lens** - AI-powered
- **Bing Visual Search** - Microsoft's eye

---

### The Gadget Lab - Plugin System

Extensible plugin architecture with built-in Hunchly integration:

#### Hunchly Integration Plugin
*Your automatic evidence collector*
- Automatic page capture on navigation
- Case-based organization
- Screenshot capture with metadata
- Export to Hunchly-compatible format
- HTML report generation
- Investigation timeline

---

### Two-Way Wrist Radio - Developer Portal

Built-in console for power users - just like Tracy's famous wrist radio:

```
Commands:
help              - Show available commands
privacy           - Show privacy settings
privacy.set KEY VALUE - Set privacy setting
tor.status        - Check Tor connection ("Going dark, Chief")
tor.enable/disable - Toggle Tor proxy
navigate URL      - Navigate to URL
search QUERY      - Search with DuckDuckGo
bookmark.add URL  - Add bookmark to case file
bookmark.list     - List bookmarks
history           - Show browsing history
history.clear     - Clear history (destroy evidence)
version           - Show version info
```

---

## Installation - Joining the Force

### Prerequisites

- Node.js 18+ (your badge)
- npm or yarn (your sidearm)
- Tor (for going dark)

### Setup - Getting Your Badge

```bash
# Clone the repository (Open the case file)
git clone https://github.com/yourusername/spin-osint-browser.git
cd spin-osint-browser

# Install dependencies (Get your equipment)
npm install

# Start the browser (Begin the investigation)
npm start

# For development (Training mode)
npm run dev
```

### Building - Forging Your Badge

```bash
# Build for current platform
npm run build

# Platform-specific builds
npm run build:win    # Windows Division
npm run build:mac    # macOS Division
npm run build:linux  # Linux Division
```

---

## Tor Setup - Going Dark

For Extreme Privacy Mode to work, you need Tor running in the background:

### Linux/macOS
```bash
# Install Tor (Get your disguise kit)
sudo apt install tor  # Debian/Ubuntu
brew install tor      # macOS

# Start Tor (Put on the disguise)
tor
```

### Windows
Download Tor Expert Bundle from https://www.torproject.org/

Tor should be running on `localhost:9050` (default SOCKS5 proxy).

*"When Tracey goes dark, nobody follows"*

---

## Usage - Working the Case

### Quick Start - First Day on the Job

1. Launch the browser - *"Good morning, Detective"*
2. The default search engine is DuckDuckGo - *privacy first*
3. Use the bookmarks panel (book icon) to access OSINT tools
4. Use the dorks toolbar (magnifying glass) for advanced searches

### Extreme Privacy Mode - Going Undercover

1. Click the shield icon in the toolbar
2. Click "Enable Extreme Privacy Mode"
3. Ensure Tor is running on port 9050
4. All traffic will now route through Tor
5. Google services are blocked (searches redirect to DuckDuckGo)

*"Tracey is now invisible"*

### Investigation Workflow - Working the Beat

1. Enable auto-screenshot in settings (optional)
2. Browse and investigate - *follow the clues*
3. Use the investigation log to add notes
4. Extract metadata from pages of interest
5. Take manual screenshots when needed
6. Export your investigation as HTML report

*"Document everything. Trust no one."*

### Reverse Image Search - Finding Faces

1. Right-click on an image (or use context menu)
2. Select reverse image search engine
3. A new tab opens with the search results

*"A face never lies, but it can hide"*

---

## Project Structure - The Precinct Layout

```
spin-detective-browser/
├── src/
│   ├── main/
│   │   └── main.js          # The Chief's Office (Electron main process)
│   ├── renderer/
│   │   ├── index.html       # The Bullpen (Main browser UI)
│   │   ├── styles.css       # The Uniform (Styling)
│   │   ├── renderer.js      # The Beat (Browser logic)
│   │   ├── devportal.html   # The Two-Way Wrist Radio
│   │   └── investigation.html # The Evidence Room
│   ├── preload/
│   │   ├── preload.js       # The Badge (Main preload script)
│   │   ├── webview-preload.js
│   │   └── devportal-preload.js
│   ├── plugins/
│   │   ├── plugin-manager.js  # The Gadget Lab
│   │   └── hunchly-integration.js
│   └── data/
│       └── osint-bookmarks.js # The Case Files
├── assets/
│   └── icons/
├── package.json
└── README.md
```

---

## Security Considerations - Rules of the Beat

- **For investigations only**: This browser is designed for legitimate OSINT research
- **Tor is not invincible**: Additional OPSEC measures may be needed for sensitive work
- **WebRTC is disabled**: Some video conferencing may not work
- **Fingerprinting protection**: May break some websites
- **Always verify**: Use multiple sources - *never trust a single witness*

---

## Contributing - Joining the Squad

Contributions are welcome! We're always looking for good detectives to join the force.

### Adding OSINT Bookmarks
Edit `src/data/osint-bookmarks.js` to add new resources to the case files.

### Creating Plugins
See `src/plugins/hunchly-integration.js` for an example plugin implementation.

---

## License

MIT License - see LICENSE file for details.

*"Justice is blind, but detectives see everything"*

---

## Acknowledgments - The Hall of Fame

- [OSINT Framework](https://osintframework.com/) - Michael Bazzell
- [Awesome OSINT](https://github.com/jivoi/awesome-osint) - jivoi
- [Hunchly](https://hunch.ly/) - Inspiration for investigation features
- [Kali Linux](https://www.kali.org/) - OSINT tools reference
- [Electron](https://www.electronjs.org/) - Framework
- **Dick Tracy** - The original two-way wrist radio detective

---

## Disclaimer - The Fine Print

This tool is intended for legitimate OSINT research, journalism, security research, and lawful investigations. Users are responsible for complying with applicable laws and regulations.

The developers are not responsible for misuse of this software.

*"With great power comes great responsibility"* - but that's from a different comic.

---

```
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║   "The criminal mind leaves traces everywhere.           ║
    ║    A good detective knows where to look."                ║
    ║                                                           ║
    ║                    - Chester Gould, Dick Tracy Creator    ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
```

**SPIN Detective Browser - Tracey Edition**
*"Calling all cars... the investigation begins."*
