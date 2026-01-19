# CONSTANTINE Browser - Change Log

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [4.2.0] - 2026-01-19

### Added - AI Intelligence Suite

This major release introduces the **AI Intelligence Suite** - four integrated modules that augment investigative capabilities with intelligent automation.

#### AI Research Assistant (`src/extensions/ai-research-assistant.js`)
- **Smart Tab Grouping**: Automatically categorizes tabs by investigation topic (Person, Email, Domain, Social Media, Phone, Image Analysis, Financial, Document/Archive, Threat Intel, Geolocation, General Research)
- **Session Context Memory**: Remembers research context across sessions with purpose tracking and notes
- **Related Link Suggestions**: Suggests relevant OSINT resources based on current page content

#### AI Privacy Shield (`src/extensions/ai-privacy-shield.js`)
- **Site Risk Scoring**: Real-time URL analysis for tracking risk, data collection, and privacy threats (0-100 score)
- **Fingerprint Exposure Meter**: Tracks which fingerprinting vectors have been exposed during session
- **Auto-OPSEC Mode**: Automatically escalates privacy protections (STANDARD → ENHANCED → MAXIMUM)

#### AI Research Tools (`src/extensions/ai-research-tools.js`)
- **Entity Extraction Panel**: Extracts 12+ entity types (phones, emails, IPs, Bitcoin/Ethereum addresses, usernames, hashtags, URLs, dates, SSN patterns, credit card patterns, coordinates)
- **Quick Intel Snapshot**: Capture and archive page content with metadata
- **Cross-Reference Alerts**: Notifies when same entity appears across multiple sources

#### AI Cognitive Tools (`src/extensions/ai-cognitive-tools.js`)
- **Focus Mode**: Pomodoro-style investigation sessions (Quick: 15/3, Standard: 25/5, Deep: 50/10, Marathon: 90/15)
- **Smart Bookmarks**: AI-categorized bookmarks with tags, notes, and importance ratings
- **Investigation Timeline**: Automatic event logging with visual timeline export

### Added - New IPC Handlers
- 40+ new IPC handlers for AI module communication
- Secure preload API exposure for `aiResearch`, `aiPrivacy`, `aiTools`, `aiCognitive` namespaces
- New event channels: `ai-tab-grouped`, `ai-suggestion-available`, `ai-risk-assessed`, `ai-entity-found`, `ai-crossref-alert`, `ai-focus-tick`, `ai-focus-complete`, `ai-focus-distraction`, `ai-opsec-escalated`

### Added - UI Enhancements
- New AI Intelligence Suite button in navigation toolbar (`Ctrl+Shift+A` / `Cmd+Shift+A`)
- Comprehensive AI panel styles (1000+ lines) matching Constantine theme
- Tab group indicators with topic-based color coding
- Risk badge and exposure meter visualizations
- Focus mode overlay with session timer
- Timeline visualization component

### Technical
- 4 new extension modules (~3,200 lines of code)
- Persistent storage via electron-store for AI data
- Modular class-based architecture for each AI subsystem
- Full cleanup/shutdown support to prevent memory leaks

---

## [4.1.1] - 2026-01-19

### Changed - Complete Rebrand
- **Application name**: SANDIEGO → CONSTANTINE
- **Package name**: sandiego-browser → constantine-browser
- **App ID**: com.sandiego.browser → com.constantine.browser
- All config paths updated for Windows, macOS, Linux

### Added - Theme System
- New centralized `themes.json` configuration file
- Support for 3 themes: Constantine (current), Carmen (legacy), Tracey (classic)
- Theme history tracking and customization support
- Per-theme report styling

### Added - Constantine Color Palette
| Color | Hex | Purpose |
|-------|-----|---------|
| Constantine Gold | `#D4A32D` | Primary accent |
| Hellfire | `#E65C00` | Warnings/danger |
| Celestial | `#00CED1` | Info/links |
| Abyss | `#0A0A0C` | Background |
| Sulfur | `#FFD700` | Highlights |
| Blood | `#8B0000` | Critical errors |

### Added - Enhanced Phone Intelligence Reports
- Multi-format export: `toText()`, `toJSON()`, `toMarkdown()`, `toHTML()`, `exportAll()`
- Risk Assessment Scoring (5 levels: CRITICAL, HIGH, MEDIUM, LOW, MINIMAL)
- Security recommendations based on findings
- HTML escape helper for safe output

### Added - CSS Animations
- `constantine-pulse`: Amber/hellfire glow pulse
- `hellfire-flicker`: Subtle color oscillation
- `sigil-glow`: Text shadow glow effect
- `exorcism-fade`: Entry animation

### Changed
- 12 new color CSS variables
- 6 background hierarchy updates
- 4 text hierarchy updates
- Legacy `--carmen-red` CSS variables bridged to `--constantine-gold` for backwards compatibility

---

## [4.1.0] - 2026-01-18

### Added
- Initial Constantine theme groundwork
- Theme architecture planning

---

## [4.0.0] - 2026-01-15

### Changed - Major Version Bump
- Architecture preparation for AI Intelligence Suite
- Electron upgrade to 35.7.5
- Security hardening for AI module integration

---

## [3.2.0] - Carmen Sandiego Edition

### Added
- Enhanced Carmen theme styling
- Noir OSINT visual refinements
- International red color palette

---

## [3.0.0] - Carmen Sandiego Edition

### Changed
- Complete rebrand from Tracey to Carmen Sandiego
- New international investigation theme
- Red color palette (`#C41E3A`)

---

## [2.0.0] - Tracey Edition

### Changed
- Hollywood Noir aesthetic
- Enhanced detective theme
- Yellow primary palette (`#FFD700`)

---

## [1.0.0] - Dick Tracy Edition

### Added
- Initial release
- Classic detective yellow theme
- Core OSINT browser functionality
- Tor integration
- Phone Intelligence module
- OSINT bookmarks
- Anti-fingerprinting protections
- Tracker blocking (60+ domains)

---

## Version Summary

| Version | Codename | Theme | Key Feature |
|---------|----------|-------|-------------|
| 4.2.0 | The Exorcist's Edge | Constantine | AI Intelligence Suite |
| 4.1.1 | The Exorcist's Edge | Constantine | Theme System + Multi-format Reports |
| 4.0.0 | The Exorcist's Edge | Constantine | Architecture for AI |
| 3.2.0 | Noir OSINT | Carmen | Enhanced Styling |
| 3.0.0 | International Investigation | Carmen | Carmen Sandiego Rebrand |
| 2.0.0 | Hollywood Noir | Tracey | Tracey Edition |
| 1.0.0 | Detective's Noir | Dick Tracy | Initial Release |

---

## Links

- [Repository](https://github.com/thumpersecure/Spin)
- [Issue Tracker](https://github.com/thumpersecure/Spin/issues)
- [License](LICENSE) - Unlicense (Public Domain)
