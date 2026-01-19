/**
 * Unit tests for Phone Intelligence module
 * Tests PhoneFormatGenerator and PatternRecognizer classes
 */

const {
  PhoneFormatGenerator,
  PatternRecognizer,
  COUNTRY_CODES
} = require('../src/extensions/phone-intel');

describe('PhoneFormatGenerator', () => {
  describe('constructor', () => {
    it('should throw error for invalid phone number', () => {
      expect(() => new PhoneFormatGenerator(null)).toThrow('Invalid phone number');
      expect(() => new PhoneFormatGenerator('')).toThrow('Invalid phone number');
      expect(() => new PhoneFormatGenerator(12345)).toThrow('Invalid phone number');
    });

    it('should accept valid phone number string', () => {
      const generator = new PhoneFormatGenerator('2025551234');
      expect(generator.rawNumber).toBe('2025551234');
    });

    it('should use US as default country code', () => {
      const generator = new PhoneFormatGenerator('2025551234');
      expect(generator.country).toEqual(COUNTRY_CODES['US']);
    });

    it('should accept custom country code', () => {
      const generator = new PhoneFormatGenerator('1234567890', 'UK');
      expect(generator.country).toEqual(COUNTRY_CODES['UK']);
    });

    it('should fall back to US for invalid country code', () => {
      const generator = new PhoneFormatGenerator('1234567890', 'INVALID');
      expect(generator.country).toEqual(COUNTRY_CODES['US']);
    });

    it('should limit input length to 30 characters', () => {
      const longNumber = '1'.repeat(50);
      const generator = new PhoneFormatGenerator(longNumber);
      expect(generator.rawNumber.length).toBeLessThanOrEqual(30);
    });
  });

  describe('cleanNumber', () => {
    it('should remove non-digit characters', () => {
      const generator = new PhoneFormatGenerator('123-456-7890');
      expect(generator.rawNumber).toBe('1234567890');
    });

    it('should handle international format with plus', () => {
      const generator = new PhoneFormatGenerator('+1 (202) 555-1234');
      expect(generator.rawNumber).toBe('12025551234');
    });

    it('should handle dots and spaces', () => {
      const generator = new PhoneFormatGenerator('202.555.1234');
      expect(generator.rawNumber).toBe('2025551234');
    });
  });

  describe('generateFormats', () => {
    it('should generate multiple formats for US number', () => {
      const generator = new PhoneFormatGenerator('2025551234', 'US');
      const formats = generator.generateFormats();

      expect(formats.length).toBeGreaterThan(5);
      expect(formats.map(f => f.name)).toContain('Raw Digits');
      expect(formats.map(f => f.name)).toContain('E.164 Format');
      expect(formats.map(f => f.name)).toContain('Dashed');
    });

    it('should cache formats on second call', () => {
      const generator = new PhoneFormatGenerator('2025551234', 'US');
      const formats1 = generator.generateFormats();
      const formats2 = generator.generateFormats();
      expect(formats1).toBe(formats2); // Same reference
    });

    it('should include raw digits format', () => {
      const generator = new PhoneFormatGenerator('2025551234', 'US');
      const formats = generator.generateFormats();
      const rawFormat = formats.find(f => f.name === 'Raw Digits');
      expect(rawFormat.value).toBe('2025551234');
    });

    it('should include E.164 format with plus', () => {
      const generator = new PhoneFormatGenerator('2025551234', 'US');
      const formats = generator.generateFormats();
      const e164 = formats.find(f => f.name === 'E.164 Format');
      expect(e164.value).toBe('+12025551234');
    });

    it('should include US format with parentheses', () => {
      const generator = new PhoneFormatGenerator('2025551234', 'US');
      const formats = generator.generateFormats();
      const usFormat = formats.find(f => f.name === 'US Format');
      expect(usFormat.value).toBe('(202) 555-1234');
    });

    it('should include dashed format', () => {
      const generator = new PhoneFormatGenerator('2025551234', 'US');
      const formats = generator.generateFormats();
      const dashed = formats.find(f => f.name === 'Dashed');
      expect(dashed.value).toBe('202-555-1234');
    });

    it('should include zero-prefixed format', () => {
      const generator = new PhoneFormatGenerator('2025551234', 'US');
      const formats = generator.generateFormats();
      const zeroPrefixed = formats.find(f => f.name === 'Zero-Prefixed');
      expect(zeroPrefixed.value).toBe('02025551234');
    });
  });

  describe('generateSearchQueries', () => {
    it('should generate search URLs for each format', () => {
      const generator = new PhoneFormatGenerator('2025551234', 'US');
      const formats = generator.generateFormats();
      const queries = generator.generateSearchQueries(formats);

      expect(queries.length).toBe(formats.length);
      queries.forEach(q => {
        expect(q.searchUrl).toContain('google.com/search');
        expect(q.duckDuckGoUrl).toContain('duckduckgo.com');
      });
    });

    it('should URL-encode special characters', () => {
      const generator = new PhoneFormatGenerator('2025551234', 'US');
      const formats = generator.generateFormats();
      const queries = generator.generateSearchQueries(formats);
      const usFormat = queries.find(q => q.name === 'US Format');
      // encodeURIComponent does not encode parentheses (they're safe chars)
      // but it does encode spaces as %20
      expect(usFormat.searchUrl).toContain('%20'); // encoded space
    });
  });

  describe('generateSmartQuery', () => {
    it('should combine all formats with OR', () => {
      const generator = new PhoneFormatGenerator('2025551234', 'US');
      const smartQuery = generator.generateSmartQuery();

      expect(smartQuery.query).toContain(' OR ');
      expect(smartQuery.googleUrl).toContain('google.com/search');
      expect(smartQuery.duckDuckGoUrl).toContain('duckduckgo.com');
    });

    it('should quote each format', () => {
      const generator = new PhoneFormatGenerator('2025551234', 'US');
      const smartQuery = generator.generateSmartQuery();
      expect(smartQuery.query).toMatch(/"[^"]+"/);
    });
  });
});

describe('PatternRecognizer', () => {
  let recognizer;

  beforeEach(() => {
    recognizer = new PatternRecognizer();
  });

  describe('extractPatterns', () => {
    describe('email extraction', () => {
      it('should extract email addresses', () => {
        const text = 'Contact us at john.doe@example.com for more info.';
        const result = recognizer.extractPatterns(text);
        expect(result.emails).toContain('john.doe@example.com');
      });

      it('should extract multiple emails', () => {
        const text = 'Email john@test.com or jane@example.org';
        const result = recognizer.extractPatterns(text);
        expect(result.emails).toContain('john@test.com');
        expect(result.emails).toContain('jane@example.org');
      });

      it('should deduplicate emails', () => {
        const text = 'test@example.com and test@example.com again';
        const result = recognizer.extractPatterns(text);
        expect(result.emails.length).toBe(1);
      });
    });

    describe('username extraction', () => {
      it('should extract @usernames', () => {
        const text = 'Follow @john_doe on Twitter';
        const result = recognizer.extractPatterns(text);
        expect(result.usernames).toContain('john_doe');
      });

      it('should remove @ prefix from usernames', () => {
        const text = 'Contact @testuser';
        const result = recognizer.extractPatterns(text);
        expect(result.usernames[0]).not.toMatch(/^@/);
      });
    });

    describe('name extraction', () => {
      it('should extract names with title', () => {
        const text = 'Dr. John Smith is the lead researcher';
        const result = recognizer.extractPatterns(text);
        expect(result.names.length).toBeGreaterThan(0);
      });

      it('should extract multi-word names', () => {
        const text = 'John Michael Smith works here';
        const result = recognizer.extractPatterns(text);
        expect(result.names.some(n => n.includes('John'))).toBe(true);
      });
    });

    describe('location extraction', () => {
      it('should extract locations from context', () => {
        const text = 'He is based in New York';
        const result = recognizer.extractPatterns(text);
        expect(result.locations).toContain('New York');
      });

      it('should extract locations with "from" prefix', () => {
        const text = 'She is from Los Angeles';
        const result = recognizer.extractPatterns(text);
        expect(result.locations).toContain('Los Angeles');
      });
    });

    describe('social media extraction', () => {
      it('should extract Facebook profiles', () => {
        const text = 'Find us on facebook.com/johndoe';
        const result = recognizer.extractPatterns(text);
        expect(result.socialMedia.length).toBeGreaterThan(0);
        expect(result.socialMedia[0].platform).toBe('facebook');
      });

      it('should extract Twitter profiles', () => {
        const text = 'Follow twitter.com/testuser';
        const result = recognizer.extractPatterns(text);
        expect(result.socialMedia.some(s => s.platform === 'twitter')).toBe(true);
      });
    });

    describe('website extraction', () => {
      it('should extract URLs', () => {
        const text = 'Visit https://example.com/page for more';
        const result = recognizer.extractPatterns(text);
        expect(result.websites).toContain('https://example.com/page');
      });

      it('should exclude Google and DuckDuckGo URLs', () => {
        const text = 'Found on https://www.google.com/search?q=test';
        const result = recognizer.extractPatterns(text);
        expect(result.websites.length).toBe(0);
      });

      it('should limit to 20 websites', () => {
        let text = '';
        for (let i = 0; i < 30; i++) {
          text += `https://site${i}.com `;
        }
        const result = recognizer.extractPatterns(text);
        expect(result.websites.length).toBeLessThanOrEqual(20);
      });
    });
  });

  describe('calculateRelevanceScore', () => {
    it('should return 0 for empty patterns', () => {
      const patterns = {
        emails: [],
        usernames: [],
        names: [],
        locations: [],
        socialMedia: [],
        websites: []
      };
      expect(recognizer.calculateRelevanceScore(patterns)).toBe(0);
    });

    it('should score emails higher than websites', () => {
      const emailPatterns = {
        emails: ['test@example.com'],
        usernames: [],
        names: [],
        locations: [],
        socialMedia: [],
        websites: []
      };
      const websitePatterns = {
        emails: [],
        usernames: [],
        names: [],
        locations: [],
        socialMedia: [],
        websites: ['https://example.com']
      };
      expect(recognizer.calculateRelevanceScore(emailPatterns))
        .toBeGreaterThan(recognizer.calculateRelevanceScore(websitePatterns));
    });

    it('should cap score at 100', () => {
      const patterns = {
        emails: Array(10).fill('test@example.com'),
        usernames: Array(10).fill('username'),
        names: Array(10).fill('John Doe'),
        locations: Array(10).fill('New York'),
        socialMedia: Array(10).fill({ platform: 'twitter', handle: 'test' }),
        websites: Array(10).fill('https://example.com')
      };
      expect(recognizer.calculateRelevanceScore(patterns)).toBe(100);
    });
  });
});

describe('COUNTRY_CODES', () => {
  it('should contain major countries', () => {
    expect(COUNTRY_CODES['US']).toBeDefined();
    expect(COUNTRY_CODES['UK']).toBeDefined();
    expect(COUNTRY_CODES['DE']).toBeDefined();
    expect(COUNTRY_CODES['JP']).toBeDefined();
    expect(COUNTRY_CODES['AU']).toBeDefined();
  });

  it('should have correct US code', () => {
    expect(COUNTRY_CODES['US'].code).toBe('+1');
    expect(COUNTRY_CODES['US'].name).toBe('United States');
  });

  it('should have format template for each country', () => {
    Object.values(COUNTRY_CODES).forEach(country => {
      expect(country.format).toBeDefined();
      expect(typeof country.format).toBe('string');
    });
  });
});
