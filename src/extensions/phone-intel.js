/**
 * SANDIEGO Browser - Phone Intelligence Extension
 * Based on xTELENUMSINT by thumpersecure
 *
 * Phone Number Intelligence Search - transforms phone numbers into actionable OSINT
 */

// ============================================
// Country Codes Database
// ============================================

const COUNTRY_CODES = {
  // Americas
  'US': { code: '+1', name: 'United States', format: '(XXX) XXX-XXXX' },
  'CA': { code: '+1', name: 'Canada', format: '(XXX) XXX-XXXX' },
  'MX': { code: '+52', name: 'Mexico', format: 'XX XXXX XXXX' },
  'BR': { code: '+55', name: 'Brazil', format: '(XX) XXXXX-XXXX' },
  'AR': { code: '+54', name: 'Argentina', format: 'XX XXXX-XXXX' },
  'CO': { code: '+57', name: 'Colombia', format: 'XXX XXX XXXX' },
  'CL': { code: '+56', name: 'Chile', format: 'X XXXX XXXX' },
  'PE': { code: '+51', name: 'Peru', format: 'XXX XXX XXX' },

  // Europe
  'UK': { code: '+44', name: 'United Kingdom', format: 'XXXX XXXXXX' },
  'DE': { code: '+49', name: 'Germany', format: 'XXXX XXXXXXX' },
  'FR': { code: '+33', name: 'France', format: 'X XX XX XX XX' },
  'IT': { code: '+39', name: 'Italy', format: 'XXX XXX XXXX' },
  'ES': { code: '+34', name: 'Spain', format: 'XXX XX XX XX' },
  'NL': { code: '+31', name: 'Netherlands', format: 'X XX XX XX XX' },
  'BE': { code: '+32', name: 'Belgium', format: 'XXX XX XX XX' },
  'PT': { code: '+351', name: 'Portugal', format: 'XXX XXX XXX' },
  'PL': { code: '+48', name: 'Poland', format: 'XXX XXX XXX' },
  'SE': { code: '+46', name: 'Sweden', format: 'XX XXX XX XX' },
  'NO': { code: '+47', name: 'Norway', format: 'XXX XX XXX' },
  'DK': { code: '+45', name: 'Denmark', format: 'XX XX XX XX' },
  'FI': { code: '+358', name: 'Finland', format: 'XX XXX XXXX' },
  'AT': { code: '+43', name: 'Austria', format: 'XXXX XXXXXX' },
  'CH': { code: '+41', name: 'Switzerland', format: 'XX XXX XX XX' },
  'IE': { code: '+353', name: 'Ireland', format: 'XX XXX XXXX' },
  'RU': { code: '+7', name: 'Russia', format: 'XXX XXX-XX-XX' },
  'UA': { code: '+380', name: 'Ukraine', format: 'XX XXX XX XX' },

  // Asia-Pacific
  'CN': { code: '+86', name: 'China', format: 'XXX XXXX XXXX' },
  'JP': { code: '+81', name: 'Japan', format: 'XX-XXXX-XXXX' },
  'KR': { code: '+82', name: 'South Korea', format: 'XX-XXXX-XXXX' },
  'IN': { code: '+91', name: 'India', format: 'XXXXX XXXXX' },
  'AU': { code: '+61', name: 'Australia', format: 'XXXX XXX XXX' },
  'NZ': { code: '+64', name: 'New Zealand', format: 'XX XXX XXXX' },
  'SG': { code: '+65', name: 'Singapore', format: 'XXXX XXXX' },
  'MY': { code: '+60', name: 'Malaysia', format: 'XX-XXX XXXX' },
  'TH': { code: '+66', name: 'Thailand', format: 'XX XXX XXXX' },
  'PH': { code: '+63', name: 'Philippines', format: 'XXX XXX XXXX' },
  'ID': { code: '+62', name: 'Indonesia', format: 'XXX-XXX-XXXX' },
  'VN': { code: '+84', name: 'Vietnam', format: 'XX XXX XX XX' },
  'PK': { code: '+92', name: 'Pakistan', format: 'XXX XXXXXXX' },
  'BD': { code: '+880', name: 'Bangladesh', format: 'XXXX-XXXXXX' },
  'HK': { code: '+852', name: 'Hong Kong', format: 'XXXX XXXX' },
  'TW': { code: '+886', name: 'Taiwan', format: 'XXX XXX XXX' },

  // Middle East & North Africa
  'AE': { code: '+971', name: 'UAE', format: 'XX XXX XXXX' },
  'SA': { code: '+966', name: 'Saudi Arabia', format: 'XX XXX XXXX' },
  'EG': { code: '+20', name: 'Egypt', format: 'XX XXXX XXXX' },
  'IL': { code: '+972', name: 'Israel', format: 'XX-XXX-XXXX' },
  'TR': { code: '+90', name: 'Turkey', format: 'XXX XXX XX XX' },
  'IR': { code: '+98', name: 'Iran', format: 'XXX XXX XXXX' },
  'IQ': { code: '+964', name: 'Iraq', format: 'XXX XXX XXXX' },
  'QA': { code: '+974', name: 'Qatar', format: 'XXXX XXXX' },
  'KW': { code: '+965', name: 'Kuwait', format: 'XXXX XXXX' },
  'MA': { code: '+212', name: 'Morocco', format: 'XX XX XX XX XX' },

  // Africa
  'ZA': { code: '+27', name: 'South Africa', format: 'XX XXX XXXX' },
  'NG': { code: '+234', name: 'Nigeria', format: 'XXX XXX XXXX' },
  'KE': { code: '+254', name: 'Kenya', format: 'XXX XXXXXX' },
  'GH': { code: '+233', name: 'Ghana', format: 'XX XXX XXXX' },
  'ET': { code: '+251', name: 'Ethiopia', format: 'XX XXX XXXX' }
};

// ============================================
// Phone Number Format Generator
// ============================================

class PhoneFormatGenerator {
  constructor(phoneNumber, countryCode = 'US') {
    // Input validation and sanitization
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      throw new Error('Invalid phone number');
    }
    this.rawNumber = this.cleanNumber(phoneNumber.slice(0, 30)); // Limit input length
    this.country = COUNTRY_CODES[countryCode] || COUNTRY_CODES['US'];
    this._cachedFormats = null; // Cache for optimization
  }

  cleanNumber(phone) {
    return phone.replace(/[^\d]/g, '');
  }

  generateFormats() {
    // Return cached formats if available
    if (this._cachedFormats) return this._cachedFormats;

    const num = this.rawNumber;
    const cc = this.country.code.replace('+', '');

    // Remove country code if present at start
    let localNum = num;
    if (num.startsWith(cc)) {
      localNum = num.substring(cc.length);
    }

    const formats = [];

    // Format 1: Raw digits
    formats.push({
      name: 'Raw Digits',
      value: localNum,
      description: 'Plain number without formatting'
    });

    // Format 2: With country code (no separator)
    formats.push({
      name: 'International (no sep)',
      value: cc + localNum,
      description: 'Country code + number'
    });

    // Format 3: With + prefix
    formats.push({
      name: 'E.164 Format',
      value: '+' + cc + localNum,
      description: 'Standard international format'
    });

    // Format 4: With spaces
    if (localNum.length >= 10) {
      const spaced = localNum.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
      formats.push({
        name: 'Spaced',
        value: spaced,
        description: 'Number with spaces'
      });
    }

    // Format 5: With dashes
    if (localNum.length >= 10) {
      const dashed = localNum.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
      formats.push({
        name: 'Dashed',
        value: dashed,
        description: 'Number with dashes'
      });
    }

    // Format 6: With parentheses (US style)
    if (localNum.length >= 10) {
      const parens = localNum.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
      formats.push({
        name: 'US Format',
        value: parens,
        description: 'US-style with parentheses'
      });
    }

    // Format 7: With dots
    if (localNum.length >= 10) {
      const dotted = localNum.replace(/(\d{3})(\d{3})(\d{4})/, '$1.$2.$3');
      formats.push({
        name: 'Dotted',
        value: dotted,
        description: 'Number with dots'
      });
    }

    // Format 8: International with spaces
    formats.push({
      name: 'International Spaced',
      value: '+' + cc + ' ' + localNum,
      description: 'International with space after code'
    });

    // Format 9: Zero-prefixed (common in some countries)
    formats.push({
      name: 'Zero-Prefixed',
      value: '0' + localNum,
      description: 'Local format with leading zero'
    });

    // Format 10: Double-zero international
    formats.push({
      name: 'Double-Zero Intl',
      value: '00' + cc + localNum,
      description: 'Alternative international format'
    });

    this._cachedFormats = formats;
    return formats;
  }

  generateSearchQueries(formats) {
    return formats.map(f => ({
      ...f,
      searchUrl: `https://www.google.com/search?q="${encodeURIComponent(f.value)}"`,
      duckDuckGoUrl: `https://duckduckgo.com/?q="${encodeURIComponent(f.value)}"`
    }));
  }

  generateSmartQuery() {
    const formats = this.generateFormats(); // Uses cache if available
    const quotedFormats = formats.map(f => `"${f.value}"`).join(' OR ');
    return {
      query: quotedFormats,
      googleUrl: `https://www.google.com/search?q=${encodeURIComponent(quotedFormats)}`,
      duckDuckGoUrl: `https://duckduckgo.com/?q=${encodeURIComponent(quotedFormats)}`
    };
  }
}

// ============================================
// Pattern Recognition Engine
// ============================================

class PatternRecognizer {
  constructor() {
    this.patterns = {
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      username: /@([a-zA-Z0-9_]{3,30})/g,
      name: /(?:(?:Mr|Mrs|Ms|Dr|Prof)\.?\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g,
      location: /(?:located?\s+(?:in|at)|from|based\s+in|living\s+in)\s+([A-Z][a-z]+(?:[\s,]+[A-Z][a-z]+)*)/gi,
      socialMedia: /(facebook|twitter|instagram|linkedin|tiktok|snapchat|whatsapp|telegram)\.com\/([a-zA-Z0-9._]+)/gi,
      website: /https?:\/\/(?!www\.google|duckduckgo)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/g
    };
  }

  extractPatterns(text) {
    const results = {
      emails: [],
      usernames: [],
      names: [],
      locations: [],
      socialMedia: [],
      websites: []
    };

    // Extract emails
    const emailMatches = text.match(this.patterns.email) || [];
    results.emails = [...new Set(emailMatches)];

    // Extract usernames
    const usernameMatches = text.match(this.patterns.username) || [];
    results.usernames = [...new Set(usernameMatches.map(u => u.replace('@', '')))];

    // Extract names
    const nameMatches = text.match(this.patterns.name) || [];
    results.names = [...new Set(nameMatches)].slice(0, 10);

    // Extract locations
    let locationMatch;
    const locationRegex = new RegExp(this.patterns.location.source, 'gi');
    while ((locationMatch = locationRegex.exec(text)) !== null) {
      if (locationMatch[1]) {
        results.locations.push(locationMatch[1].trim());
      }
    }
    results.locations = [...new Set(results.locations)];

    // Extract social media profiles
    let socialMatch;
    const socialRegex = new RegExp(this.patterns.socialMedia.source, 'gi');
    while ((socialMatch = socialRegex.exec(text)) !== null) {
      results.socialMedia.push({
        platform: socialMatch[1].toLowerCase(),
        handle: socialMatch[2]
      });
    }

    // Extract websites
    const websiteMatches = text.match(this.patterns.website) || [];
    results.websites = [...new Set(websiteMatches)].slice(0, 20);

    return results;
  }

  calculateRelevanceScore(patterns) {
    let score = 0;

    score += patterns.emails.length * 15;
    score += patterns.usernames.length * 10;
    score += patterns.names.length * 8;
    score += patterns.locations.length * 5;
    score += patterns.socialMedia.length * 12;
    score += patterns.websites.length * 3;

    return Math.min(100, score);
  }
}

// ============================================
// Phone Intel Report Generator
// ============================================

class PhoneIntelReport {
  constructor(phoneNumber, countryCode) {
    this.phoneNumber = phoneNumber;
    this.countryCode = countryCode;
    this.generator = new PhoneFormatGenerator(phoneNumber, countryCode);
    this.recognizer = new PatternRecognizer();
    this.findings = [];
    this.aggregatedPatterns = {
      emails: new Set(),
      usernames: new Set(),
      names: new Set(),
      locations: new Set(),
      socialMedia: [],
      websites: new Set()
    };
  }

  addFinding(formatName, url, pageContent) {
    const patterns = this.recognizer.extractPatterns(pageContent);
    const score = this.recognizer.calculateRelevanceScore(patterns);

    // Aggregate patterns
    patterns.emails.forEach(e => this.aggregatedPatterns.emails.add(e));
    patterns.usernames.forEach(u => this.aggregatedPatterns.usernames.add(u));
    patterns.names.forEach(n => this.aggregatedPatterns.names.add(n));
    patterns.locations.forEach(l => this.aggregatedPatterns.locations.add(l));
    patterns.socialMedia.forEach(s => this.aggregatedPatterns.socialMedia.push(s));
    patterns.websites.forEach(w => this.aggregatedPatterns.websites.add(w));

    this.findings.push({
      format: formatName,
      url,
      patterns,
      score,
      timestamp: new Date().toISOString()
    });
  }

  generateReport() {
    const country = COUNTRY_CODES[this.countryCode] || COUNTRY_CODES['US'];

    return {
      summary: {
        phoneNumber: this.phoneNumber,
        country: country.name,
        countryCode: country.code,
        searchesCompleted: this.findings.length,
        totalScore: this.findings.reduce((sum, f) => sum + f.score, 0),
        generatedAt: new Date().toISOString()
      },
      aggregatedIntel: {
        emails: [...this.aggregatedPatterns.emails],
        usernames: [...this.aggregatedPatterns.usernames],
        names: [...this.aggregatedPatterns.names],
        locations: [...this.aggregatedPatterns.locations],
        socialMedia: this.aggregatedPatterns.socialMedia,
        websites: [...this.aggregatedPatterns.websites]
      },
      findings: this.findings.sort((a, b) => b.score - a.score),
      formats: this.generator.generateFormats(),
      smartQuery: this.generator.generateSmartQuery()
    };
  }

  toText() {
    const report = this.generateReport();
    const lines = [
      '═══════════════════════════════════════════════════════════',
      '  SANDIEGO PHONE INTELLIGENCE REPORT',
      '  Powered by xTELENUMSINT Technology',
      '═══════════════════════════════════════════════════════════',
      '',
      `Phone Number: ${report.summary.phoneNumber}`,
      `Country: ${report.summary.country} (${report.summary.countryCode})`,
      `Generated: ${new Date(report.summary.generatedAt).toLocaleString()}`,
      `Total Relevance Score: ${report.summary.totalScore}`,
      '',
      '───────────────────────────────────────────────────────────',
      '  AGGREGATED INTELLIGENCE',
      '───────────────────────────────────────────────────────────',
      ''
    ];

    if (report.aggregatedIntel.emails.length > 0) {
      lines.push('📧 EMAILS FOUND:');
      report.aggregatedIntel.emails.forEach(e => lines.push(`   • ${e}`));
      lines.push('');
    }

    if (report.aggregatedIntel.usernames.length > 0) {
      lines.push('👤 USERNAMES FOUND:');
      report.aggregatedIntel.usernames.forEach(u => lines.push(`   • @${u}`));
      lines.push('');
    }

    if (report.aggregatedIntel.names.length > 0) {
      lines.push('📛 POSSIBLE NAMES:');
      report.aggregatedIntel.names.forEach(n => lines.push(`   • ${n}`));
      lines.push('');
    }

    if (report.aggregatedIntel.locations.length > 0) {
      lines.push('📍 LOCATIONS:');
      report.aggregatedIntel.locations.forEach(l => lines.push(`   • ${l}`));
      lines.push('');
    }

    if (report.aggregatedIntel.socialMedia.length > 0) {
      lines.push('🌐 SOCIAL MEDIA PROFILES:');
      report.aggregatedIntel.socialMedia.forEach(s =>
        lines.push(`   • ${s.platform}: ${s.handle}`)
      );
      lines.push('');
    }

    if (report.aggregatedIntel.websites.length > 0) {
      lines.push('🔗 RELATED WEBSITES:');
      report.aggregatedIntel.websites.slice(0, 10).forEach(w => lines.push(`   • ${w}`));
      lines.push('');
    }

    lines.push('───────────────────────────────────────────────────────────');
    lines.push('  FORMAT VARIATIONS SEARCHED');
    lines.push('───────────────────────────────────────────────────────────');
    lines.push('');

    report.formats.forEach((f, i) => {
      lines.push(`${i + 1}. ${f.name}: ${f.value}`);
    });

    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('  END OF REPORT');
    lines.push('═══════════════════════════════════════════════════════════');

    return lines.join('\n');
  }
}

// ============================================
// Export Module
// ============================================

module.exports = {
  COUNTRY_CODES,
  PhoneFormatGenerator,
  PatternRecognizer,
  PhoneIntelReport
};
