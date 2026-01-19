# CONSTANTINE v4.1.1 - The Exorcist's Edge

> **"Between Heaven and Hell, intelligence prevails."**

## Release Summary

Complete transformation from **SANDIEGO** to **CONSTANTINE** with supernatural noir aesthetic. This major release introduces a comprehensive theme system, enhanced multi-format reporting, and full rebrand across all components.

**Release Date:** 2026-01-19
**Total Changes:** 779 additions, 170 deletions across 7 files
**Documented Changes:** 336 individual modifications

---

## Highlights

- **Complete Rebrand**: SANDIEGO → CONSTANTINE throughout the entire application
- **New Theme System**: Centralized `themes.json` for easy theme management and future upgrades
- **Supernatural Noir Aesthetic**: Amber gold, hellfire orange, and celestial cyan color palette
- **Multi-Format Reports**: Export Phone Intelligence reports to Text, JSON, Markdown, and HTML
- **Risk Assessment**: Automatic exposure level scoring with security recommendations
- **4 New CSS Animations**: constantine-pulse, hellfire-flicker, sigil-glow, exorcism-fade
- **Backwards Compatible**: Legacy CSS variables bridged for existing integrations

---

## What's New

### Theme System (`src/data/themes.json`)

New centralized theme configuration supporting:
- **Constantine** (v4.1.1 - Current) - Supernatural noir with amber gold
- **Carmen** (v3.x - Legacy) - International red theme
- **Tracey** (v2.x - Classic) - Original detective yellow

```json
{
  "activeTheme": "constantine",
  "themes": {
    "constantine": { "primary": "#D4A32D", "codename": "The Exorcist's Edge" },
    "carmen": { "primary": "#C41E3A", "codename": "International Investigation" },
    "tracey": { "primary": "#FFD700", "codename": "Detective's Noir" }
  }
}
```

### Constantine Color Palette

| Color | Hex | Purpose |
|-------|-----|---------|
| Constantine Gold | `#D4A32D` | Primary accent |
| Hellfire | `#E65C00` | Warnings/danger |
| Celestial | `#00CED1` | Info/links |
| Abyss | `#0A0A0C` | Background |
| Sulfur | `#FFD700` | Highlights |
| Blood | `#8B0000` | Critical errors |

### Enhanced Phone Intelligence Reports

**New Export Formats:**
- `toText()` - Formatted ASCII for terminal
- `toJSON()` - Structured data with metadata
- `toMarkdown()` - GitHub-flavored documentation
- `toHTML()` - Standalone styled webpage
- `exportAll()` - Batch export all formats

**Risk Assessment Scoring:**
| Score | Level | Action |
|-------|-------|--------|
| 80-100 | CRITICAL | Professional OPSEC review recommended |
| 60-79 | HIGH | Review and sanitize exposed data |
| 40-59 | MEDIUM | Consider privacy hardening |
| 20-39 | LOW | Monitor for changes |
| 0-19 | MINIMAL | Continue standard practices |

### New CSS Animations

```css
@keyframes constantine-pulse { /* Amber/hellfire glow pulse */ }
@keyframes hellfire-flicker { /* Subtle color oscillation */ }
@keyframes sigil-glow { /* Text shadow glow effect */ }
@keyframes exorcism-fade { /* Entry animation */ }
```

---

## Breaking Changes

**None.** Full backwards compatibility maintained:
- Legacy `--carmen-red` CSS variables bridged to `--constantine-gold`
- All existing IPC channels preserved
- Phone Intelligence API unchanged (new methods are additive)

---

## Files Changed

| File | Status | Changes |
|------|--------|---------|
| `src/data/themes.json` | **NEW** | +214 lines |
| `src/renderer/styles.css` | Modified | +134/-59 |
| `src/extensions/phone-intel.js` | Modified | +302/-51 |
| `README.md` | Modified | +232/-90 |
| `src/main/main.js` | Modified | +32/-18 |
| `package.json` | Modified | +27/-14 |
| `src/renderer/renderer.js` | Modified | +8/-4 |

---

## Detailed Changelog

### Brand Transformation (14 changes)
- Application name: SANDIEGO → CONSTANTINE
- Package name: sandiego-browser → constantine-browser
- App ID: com.sandiego.browser → com.constantine.browser
- All config paths updated (Windows, macOS, Linux)
- Desktop integration updated

### Theme System (61 changes)
- New `themes.json` configuration file
- 3 complete theme definitions
- Theme history tracking
- Customization support
- Per-theme report styling

### CSS Theme (53 changes)
- 12 new color variables
- 6 background hierarchy updates
- 4 text hierarchy updates
- 4 new animations
- Legacy variable bridge

### Phone Intelligence (87 changes)
- 4 new export methods
- Risk assessment system (5 levels)
- Security recommendations
- HTML escape helper
- Enhanced text report formatting

### README Documentation (84 changes)
- New CONSTANTINE ASCII banner
- Theme section with color palette
- Version 4.1.1 changelog
- Updated installation guides
- Constantine movie quotes

---

## Version History

```
v1.0.0  Dick Tracy Edition     - Original SANDIEGO
v2.0.0  Tracey Edition         - Hollywood Noir
v3.0.0  Carmen Sandiego        - International Investigation
v3.2.0  Noir OSINT Theme       - Enhanced Carmen
v4.1.1  CONSTANTINE            - The Exorcist's Edge  ← CURRENT
```

---

## Installation

```bash
git clone https://github.com/thumpersecure/Spin.git
cd Spin
npm install
npm start
```

---

## Credits

- Theme inspired by the supernatural noir aesthetic
- Built on Electron 35.7.5
- Phone Intelligence powered by xTELENUMSINT technology

---

<div align="center">

**CONSTANTINE v4.1.1 - The Exorcist's Edge**

*"God's a kid with an ant farm. He's not planning anything."*

⚡ 🔱 ⚡

</div>
