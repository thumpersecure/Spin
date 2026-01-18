# SPIN OSINT Browser

A privacy-focused web browser built for Open Source Intelligence (OSINT) investigations. Built on Electron (Chromium-based) with integrated Tor support, anti-tracking protections, and comprehensive OSINT tooling.

## Features

### Privacy & Anonymity

- **Extreme Privacy Mode**: One-click activation of maximum privacy protections
  - Tor proxy integration (routes all traffic through Tor network)
  - User agent spoofing (Firefox-like fingerprint)
  - Google services blocking (redirects searches to DuckDuckGo)
  - All tracking protections enabled

- **Anti-Tracking Protections**:
  - Block 30+ known tracker domains (Google Analytics, Facebook Pixel, etc.)
  - Third-party cookie blocking
  - Do Not Track (DNT) and Global Privacy Control (GPC) headers
  - WebRTC IP leak prevention

- **Fingerprinting Protection**:
  - Canvas fingerprint randomization
  - WebGL fingerprint spoofing
  - Audio fingerprint randomization

### OSINT Bookmarks

Pre-loaded bookmark collections from major OSINT resources:

- **OSINT Framework** (osintframework.com): Complete categorized collection
  - Username search tools
  - Email lookup services
  - Phone number investigation
  - Social media OSINT
  - Domain & IP analysis
  - Image analysis & reverse search
  - Geolocation tools
  - People search engines
  - Business/company lookup
  - Threat intelligence
  - Breach data services

- **Awesome OSINT**: Curated list from the popular GitHub repository
- **Kali Linux Tools**: OSINT tools available in Kali with GitHub links
  - theHarvester, Recon-ng, SpiderFoot, Amass
  - Sherlock, Maigret, PhoneInfoga
  - DNSenum, Subfinder, and more

### Google Dorks Toolbar

Interactive toolbar for constructing advanced search queries:

- 25+ Google operators with descriptions
- Click-to-insert operator buttons
- Real-time query preview
- Multiple search engine support (Google, DuckDuckGo, Bing, Yandex)
- Search term input with operator combination

Supported operators:
```
site: inurl: intitle: intext: filetype: ext: cache:
link: related: info: define: allinurl: allintitle:
allintext: "..." - OR * .. before: after: AROUND(n)
```

### Investigation Tools

#### Investigation Log
- Automatically log visited pages with metadata
- Add notes and tags to entries
- Screenshot capture per page
- Export to JSON or HTML report
- Timeline view of investigation
- Search and filter entries

#### Metadata Viewer
- Extract comprehensive page metadata
- Meta tags, Open Graph, Twitter Card data
- Technology detection (React, Vue, Angular, jQuery, etc.)
- External links and scripts analysis
- Page load timing metrics
- Form enumeration

#### Reverse Image Search
- One-click reverse image search
- Supported engines:
  - Yandex Images (best for facial recognition)
  - PimEyes (face search)
  - TinEye
  - Google Lens
  - Bing Visual Search

### Plugin System

Extensible plugin architecture with built-in Hunchly integration:

#### Hunchly Integration Plugin
- Automatic page capture on navigation
- Case-based organization
- Screenshot capture with metadata
- Export to Hunchly-compatible format
- HTML report generation
- Investigation timeline

### Developer Portal

Built-in console for power users:

```
Commands:
help              - Show available commands
privacy           - Show privacy settings
privacy.set KEY VALUE - Set privacy setting
tor.status        - Check Tor connection
tor.enable/disable - Toggle Tor proxy
navigate URL      - Navigate to URL
search QUERY      - Search with DuckDuckGo
bookmark.add URL  - Add bookmark
bookmark.list     - List bookmarks
history           - Show browsing history
history.clear     - Clear history
version           - Show version info
```

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Tor (for Tor proxy functionality)

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/spin-osint-browser.git
cd spin-osint-browser

# Install dependencies
npm install

# Start the browser
npm start

# For development
npm run dev
```

### Building

```bash
# Build for current platform
npm run build

# Platform-specific builds
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## Tor Setup

For Extreme Privacy Mode to work, you need Tor running:

### Linux/macOS
```bash
# Install Tor
sudo apt install tor  # Debian/Ubuntu
brew install tor      # macOS

# Start Tor
tor
```

### Windows
Download Tor Expert Bundle from https://www.torproject.org/

Tor should be running on `localhost:9050` (default SOCKS5 proxy).

## Usage

### Quick Start

1. Launch the browser
2. The default search engine is DuckDuckGo
3. Use the bookmarks panel (book icon) to access OSINT tools
4. Use the dorks toolbar (magnifying glass) for advanced searches

### Extreme Privacy Mode

1. Click the shield icon in the toolbar
2. Click "Enable Extreme Privacy Mode"
3. Ensure Tor is running on port 9050
4. All traffic will now route through Tor
5. Google services are blocked (searches redirect to DuckDuckGo)

### Investigation Workflow

1. Enable auto-screenshot in settings (optional)
2. Browse and investigate
3. Use the investigation log to add notes
4. Extract metadata from pages of interest
5. Take manual screenshots when needed
6. Export your investigation as HTML report

### Reverse Image Search

1. Right-click on an image (or use context menu)
2. Select reverse image search engine
3. A new tab opens with the search results

## Project Structure

```
spin-osint-browser/
├── src/
│   ├── main/
│   │   └── main.js          # Electron main process
│   ├── renderer/
│   │   ├── index.html       # Main browser UI
│   │   ├── styles.css       # Styling
│   │   ├── renderer.js      # Browser logic
│   │   ├── devportal.html   # Developer portal
│   │   └── investigation.html # Investigation log UI
│   ├── preload/
│   │   ├── preload.js       # Main preload script
│   │   ├── webview-preload.js
│   │   └── devportal-preload.js
│   ├── plugins/
│   │   ├── plugin-manager.js
│   │   └── hunchly-integration.js
│   └── data/
│       └── osint-bookmarks.js
├── assets/
│   └── icons/
├── package.json
└── README.md
```

## Security Considerations

- **For investigations only**: This browser is designed for OSINT research
- **Tor is not a silver bullet**: Additional OPSEC measures may be needed
- **WebRTC is disabled**: Some video conferencing may not work
- **Fingerprinting protection**: May break some websites
- **Always verify**: Use multiple sources to verify information

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

### Adding OSINT Bookmarks

Edit `src/data/osint-bookmarks.js` to add new bookmarks to the collections.

### Creating Plugins

See `src/plugins/hunchly-integration.js` for an example plugin implementation.

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- [OSINT Framework](https://osintframework.com/) - Michael Bazzell
- [Awesome OSINT](https://github.com/jivoi/awesome-osint) - jivoi
- [Hunchly](https://hunch.ly/) - Inspiration for investigation features
- [Kali Linux](https://www.kali.org/) - OSINT tools reference
- [Electron](https://www.electronjs.org/) - Framework

## Disclaimer

This tool is intended for legitimate OSINT research, journalism, security research, and lawful investigations. Users are responsible for complying with applicable laws and regulations. The developers are not responsible for misuse of this software.
