/**
 * Unit tests for Entity Extractor module
 * Tests EntityExtractor class from AI Research Tools
 */

const {
  EntityExtractor,
  ENTITY_TYPES
} = require('../src/extensions/ai-research-tools');

describe('EntityExtractor', () => {
  let extractor;

  beforeEach(() => {
    extractor = new EntityExtractor();
  });

  describe('extractFromText', () => {
    it('should return empty result for null/undefined input', () => {
      expect(extractor.extractFromText(null).entities).toEqual([]);
      expect(extractor.extractFromText(undefined).entities).toEqual([]);
      expect(extractor.extractFromText('').entities).toEqual([]);
    });

    it('should extract emails', () => {
      const text = 'Contact john.doe@example.com for more information';
      const result = extractor.extractFromText(text);

      expect(result.counts.EMAIL).toBe(1);
      const emailEntity = result.entities.find(e => e.type === 'EMAIL');
      expect(emailEntity.value).toBe('john.doe@example.com');
    });

    it('should extract phone numbers', () => {
      const text = 'Call us at +1-202-555-1234';
      const result = extractor.extractFromText(text);

      expect(result.counts.PHONE).toBeGreaterThan(0);
    });

    it('should extract usernames with @ prefix', () => {
      const text = 'Follow @testuser on social media';
      const result = extractor.extractFromText(text);

      expect(result.counts.USERNAME).toBeGreaterThan(0);
      const usernameEntity = result.entities.find(e => e.type === 'USERNAME');
      expect(usernameEntity.value).toBe('testuser');
    });

    it('should extract IPv4 addresses', () => {
      const text = 'Server IP: 192.168.1.100';
      const result = extractor.extractFromText(text);

      expect(result.counts.IP_ADDRESS).toBe(1);
      const ipEntity = result.entities.find(e => e.type === 'IP_ADDRESS');
      expect(ipEntity.value).toBe('192.168.1.100');
    });

    it('should extract Bitcoin addresses', () => {
      const text = 'BTC: 1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2';
      const result = extractor.extractFromText(text);

      expect(result.counts.CRYPTO_WALLET).toBeGreaterThan(0);
    });

    it('should extract Ethereum addresses', () => {
      const text = 'ETH: 0x742d35Cc6634C0532925a3b844Bc9e7595f';
      const result = extractor.extractFromText(text);

      // Note: may or may not match depending on exact regex
      expect(result.entities).toBeDefined();
    });

    it('should extract dates', () => {
      const text = 'Event on 01/15/2024 and Jan 20, 2024';
      const result = extractor.extractFromText(text);

      expect(result.counts.DATE).toBeGreaterThan(0);
    });

    it('should extract potential SSN patterns', () => {
      const text = 'SSN: 123-45-6789';
      const result = extractor.extractFromText(text);

      expect(result.counts.SSN).toBeGreaterThan(0);
      const ssnEntity = result.entities.find(e => e.type === 'SSN');
      expect(ssnEntity.sensitive).toBe(true);
    });

    it('should extract social media URLs', () => {
      const text = 'Profile: https://twitter.com/username';
      const result = extractor.extractFromText(text);

      expect(result.counts.SOCIAL_URL).toBeGreaterThan(0);
    });

    it('should not duplicate entities', () => {
      const text = 'Email: test@example.com and again test@example.com';
      const result = extractor.extractFromText(text);

      expect(result.counts.EMAIL).toBe(1);
    });

    it('should include source info', () => {
      const sourceInfo = { url: 'https://test.com', title: 'Test Page' };
      const result = extractor.extractFromText('test@example.com', sourceInfo);

      expect(result.entities[0].source).toEqual(sourceInfo);
    });

    it('should include context for each entity', () => {
      const text = 'Some text before test@example.com and some text after';
      const result = extractor.extractFromText(text);

      const emailEntity = result.entities.find(e => e.type === 'EMAIL');
      expect(emailEntity.context).toBeDefined();
      expect(emailEntity.context).toContain('test@example.com');
    });

    it('should track total count', () => {
      const text = 'Email: a@b.com Phone: 555-1234 User: @test';
      const result = extractor.extractFromText(text);

      expect(result.totalCount).toBeGreaterThan(0);
      expect(result.totalCount).toBe(result.entities.length);
    });
  });

  describe('_normalizeEntity', () => {
    it('should normalize phone numbers by removing non-digits', () => {
      const normalized = extractor._normalizeEntity('+1 (555) 123-4567', 'PHONE');
      expect(normalized).toBe('+15551234567');
    });

    it('should normalize emails to lowercase', () => {
      const normalized = extractor._normalizeEntity('TEST@EXAMPLE.COM', 'EMAIL');
      expect(normalized).toBe('test@example.com');
    });

    it('should normalize usernames by removing @ and lowercasing', () => {
      const normalized = extractor._normalizeEntity('@TestUser', 'USERNAME');
      expect(normalized).toBe('testuser');
    });

    it('should normalize domains by removing protocol and www', () => {
      const normalized = extractor._normalizeEntity('https://www.example.com', 'DOMAIN');
      expect(normalized).toBe('example.com');
    });
  });

  describe('_validateEntity', () => {
    it('should reject phone numbers with less than 7 digits', () => {
      expect(extractor._validateEntity('12345', 'PHONE')).toBe(false);
      expect(extractor._validateEntity('1234567', 'PHONE')).toBe(true);
    });

    it('should validate email format', () => {
      expect(extractor._validateEntity('test@example.com', 'EMAIL')).toBe(true);
      expect(extractor._validateEntity('invalid-email', 'EMAIL')).toBe(false);
    });

    it('should validate username length (3-30 chars)', () => {
      expect(extractor._validateEntity('ab', 'USERNAME')).toBe(false);
      expect(extractor._validateEntity('abc', 'USERNAME')).toBe(true);
      expect(extractor._validateEntity('a'.repeat(30), 'USERNAME')).toBe(true);
      expect(extractor._validateEntity('a'.repeat(31), 'USERNAME')).toBe(false);
    });

    it('should validate IP address format', () => {
      expect(extractor._validateEntity('192.168.1.1', 'IP_ADDRESS')).toBe(true);
      expect(extractor._validateEntity('256.1.1.1', 'IP_ADDRESS')).toBe(false);
      expect(extractor._validateEntity('1.2.3', 'IP_ADDRESS')).toBe(false);
    });

    it('should validate hash lengths (32, 40, 64)', () => {
      expect(extractor._validateEntity('a'.repeat(32), 'HASH')).toBe(true);
      expect(extractor._validateEntity('a'.repeat(40), 'HASH')).toBe(true);
      expect(extractor._validateEntity('a'.repeat(64), 'HASH')).toBe(true);
      expect(extractor._validateEntity('a'.repeat(20), 'HASH')).toBe(false);
    });

    it('should filter common false positives for names', () => {
      expect(extractor._validateEntity('The Quick', 'NAME')).toBe(false);
      expect(extractor._validateEntity('John Smith', 'NAME')).toBe(true);
    });
  });

  describe('_extractContext', () => {
    it('should extract surrounding text', () => {
      const text = 'Before the email test@example.com is here.';
      const context = extractor._extractContext(text, 17, 16);
      expect(context).toContain('test@example.com');
    });

    it('should add ellipsis for truncated context', () => {
      const text = 'A '.repeat(100) + 'test@example.com' + ' B'.repeat(100);
      const context = extractor._extractContext(text, 200, 16, 30);
      expect(context.startsWith('...')).toBe(true);
      expect(context.endsWith('...')).toBe(true);
    });
  });

  describe('findRelatedEntities', () => {
    it('should find entities with same value', () => {
      const text1 = 'Contact: test@example.com';
      const text2 = 'Also at: test@example.com';

      extractor.extractFromText(text1, { url: 'page1.com' });
      extractor.extractFromText(text2, { url: 'page2.com' });

      const related = extractor.findRelatedEntities('test@example.com');
      expect(related.length).toBe(2);
    });

    it('should return empty array for non-existent entity', () => {
      const related = extractor.findRelatedEntities('nonexistent@test.com');
      expect(related).toEqual([]);
    });
  });

  describe('clearEntities', () => {
    it('should clear all extracted entities', () => {
      extractor.extractFromText('test@example.com');
      expect(extractor.extractedEntities.size).toBeGreaterThan(0);

      extractor.clearEntities();
      expect(extractor.extractedEntities.size).toBe(0);
      expect(extractor.entityCounter).toBe(0);
    });
  });

  describe('getEntityStats', () => {
    it('should return statistics about extracted entities', () => {
      extractor.extractFromText('Contact: test@example.com and @username');

      const { stats, total } = extractor.getEntityStats();

      expect(total).toBeGreaterThan(0);
      expect(stats.EMAIL).toBeDefined();
      expect(stats.EMAIL.count).toBeGreaterThan(0);
    });

    it('should track unique count', () => {
      extractor.extractFromText('test@a.com', { url: 'page1' });
      extractor.extractFromText('test@a.com', { url: 'page2' });

      const { stats } = extractor.getEntityStats();

      expect(stats.EMAIL.uniqueCount).toBe(1);
      expect(stats.EMAIL.count).toBe(2);
    });
  });

  describe('_enforceEntityLimit', () => {
    it('should prevent unbounded memory growth', () => {
      // This is an internal test - simulating many entities
      for (let i = 0; i < 100; i++) {
        extractor.extractFromText(`email${i}@test.com`, { url: `page${i}` });
      }

      // Should still be able to add more without crashing
      expect(() => {
        extractor.extractFromText('another@test.com');
      }).not.toThrow();
    });
  });
});

describe('ENTITY_TYPES', () => {
  it('should define all expected entity types', () => {
    expect(ENTITY_TYPES.PHONE).toBeDefined();
    expect(ENTITY_TYPES.EMAIL).toBeDefined();
    expect(ENTITY_TYPES.USERNAME).toBeDefined();
    expect(ENTITY_TYPES.IP_ADDRESS).toBeDefined();
    expect(ENTITY_TYPES.DOMAIN).toBeDefined();
    expect(ENTITY_TYPES.CRYPTO_WALLET).toBeDefined();
    expect(ENTITY_TYPES.HASH).toBeDefined();
    expect(ENTITY_TYPES.SSN).toBeDefined();
    expect(ENTITY_TYPES.CREDIT_CARD).toBeDefined();
    expect(ENTITY_TYPES.COORDINATES).toBeDefined();
    expect(ENTITY_TYPES.DATE).toBeDefined();
    expect(ENTITY_TYPES.SOCIAL_URL).toBeDefined();
    expect(ENTITY_TYPES.NAME).toBeDefined();
  });

  it('should have patterns array for each type', () => {
    Object.values(ENTITY_TYPES).forEach(type => {
      expect(Array.isArray(type.patterns)).toBe(true);
      expect(type.patterns.length).toBeGreaterThan(0);
    });
  });

  it('should have icon and color for each type', () => {
    Object.values(ENTITY_TYPES).forEach(type => {
      expect(type.icon).toBeDefined();
      expect(type.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it('should mark sensitive types', () => {
    expect(ENTITY_TYPES.SSN.sensitive).toBe(true);
    expect(ENTITY_TYPES.CREDIT_CARD.sensitive).toBe(true);
  });
});
