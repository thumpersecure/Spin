/**
 * Unit tests for Tab Classification module
 * Tests TabGroupingManager class from AI Research Assistant
 */

const {
  TabGroupingManager,
  TOPIC_PATTERNS,
  OSINT_SUGGESTIONS
} = require('../src/extensions/ai-research-assistant');

describe('TabGroupingManager', () => {
  let manager;

  beforeEach(() => {
    manager = new TabGroupingManager();
  });

  describe('classifyUrl', () => {
    it('should return null for invalid URL', () => {
      expect(manager.classifyUrl(null)).toBeNull();
      expect(manager.classifyUrl('')).toBeNull();
      expect(manager.classifyUrl('not-a-url')).toBeNull();
    });

    it('should classify LinkedIn as Person Investigation', () => {
      const result = manager.classifyUrl('https://www.linkedin.com/in/johndoe');
      expect(result.topic).toBe('Person Investigation');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should classify Facebook as Social Media or Person Investigation', () => {
      const result = manager.classifyUrl('https://www.facebook.com/johndoe');
      expect(['Person Investigation', 'Social Media']).toContain(result.topic);
    });

    it('should classify Hunter.io as Email Investigation', () => {
      const result = manager.classifyUrl('https://hunter.io/search');
      expect(result.topic).toBe('Email Investigation');
    });

    it('should classify Have I Been Pwned as Email Investigation', () => {
      const result = manager.classifyUrl('https://haveibeenpwned.com/');
      expect(result.topic).toBe('Email Investigation');
    });

    it('should classify Shodan as Domain & IP Analysis', () => {
      const result = manager.classifyUrl('https://www.shodan.io/');
      expect(result.topic).toBe('Domain & IP Analysis');
    });

    it('should classify TinEye as Image Analysis', () => {
      const result = manager.classifyUrl('https://tineye.com/');
      expect(result.topic).toBe('Image Analysis');
    });

    it('should classify VirusTotal as Threat Intelligence or Domain & IP', () => {
      const result = manager.classifyUrl('https://virustotal.com/');
      expect(['Threat Intelligence', 'Domain & IP Analysis']).toContain(result.topic);
    });

    it('should classify Blockchain.com as Financial Investigation', () => {
      const result = manager.classifyUrl('https://www.blockchain.com/');
      expect(result.topic).toBe('Financial Investigation');
    });

    it('should classify Google Maps as Geolocation', () => {
      const result = manager.classifyUrl('https://www.google.com/maps');
      expect(result.topic).toBe('Geolocation');
    });

    it('should classify Wayback Machine as Archives & History', () => {
      const result = manager.classifyUrl('https://web.archive.org/');
      expect(result.topic).toBe('Archives & History');
    });

    it('should classify .onion URLs as Dark Web', () => {
      const result = manager.classifyUrl('http://example.onion');
      expect(result.topic).toBe('Dark Web');
    });

    it('should include icon and color in classification', () => {
      const result = manager.classifyUrl('https://www.shodan.io/');
      expect(result.icon).toBeDefined();
      expect(result.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  describe('classifyContent', () => {
    it('should classify by title keywords', () => {
      const result = manager.classifyContent('Email Verification Tool', 'https://example.com', '');
      expect(result.topic).toBe('Email Investigation');
    });

    it('should classify by page content keywords', () => {
      const result = manager.classifyContent('Tool', 'https://example.com', 'Find phone number lookup carrier information');
      expect(result.topic).toBe('Phone Investigation');
    });

    it('should classify by URL patterns', () => {
      const result = manager.classifyContent('Test', 'https://example.com/dns-lookup', '');
      expect(['Domain & IP Analysis']).toContain(result.topic);
    });

    it('should return best matching topic', () => {
      const result = manager.classifyContent('Bitcoin Wallet Explorer', 'https://example.com', 'Track cryptocurrency transactions');
      expect(result.topic).toBe('Financial Investigation');
    });

    it('should return null for non-matching content', () => {
      const result = manager.classifyContent('Random Page', 'https://random.com', 'Nothing relevant here');
      expect(result).toBeNull();
    });
  });

  describe('assignTabToGroup', () => {
    it('should create new group for new topic', () => {
      const result = manager.assignTabToGroup('tab1', 'https://shodan.io', 'Shodan');

      expect(result.groupId).toBeDefined();
      expect(result.classification.topic).toBe('Domain & IP Analysis');
    });

    it('should assign to existing group for same topic', () => {
      manager.assignTabToGroup('tab1', 'https://shodan.io', 'Shodan');
      const result = manager.assignTabToGroup('tab2', 'https://censys.io', 'Censys');

      expect(result.classification.topic).toBe('Domain & IP Analysis');
    });

    it('should fall back to General Research for unknown URLs', () => {
      const result = manager.assignTabToGroup('tab1', 'https://random-site.com', 'Random');

      expect(result.classification.topic).toBe('General Research');
      expect(result.classification.confidence).toBeLessThan(0.5);
    });

    it('should store tab topic', () => {
      manager.assignTabToGroup('tab1', 'https://hunter.io', 'Hunter');

      const topic = manager.getTabTopic('tab1');
      expect(topic.topic).toBe('Email Investigation');
    });
  });

  describe('removeTabFromGroups', () => {
    it('should remove tab from group', () => {
      manager.assignTabToGroup('tab1', 'https://shodan.io', 'Shodan');
      manager.assignTabToGroup('tab2', 'https://censys.io', 'Censys');

      manager.removeTabFromGroups('tab1');

      expect(manager.getTabTopic('tab1')).toBeNull();

      const groups = manager.getGroups();
      const ipGroup = groups.find(g => g.topic === 'Domain & IP Analysis');
      expect(ipGroup.tabs).not.toContain('tab1');
    });

    it('should delete empty groups', () => {
      manager.assignTabToGroup('tab1', 'https://shodan.io', 'Shodan');

      manager.removeTabFromGroups('tab1');

      const groups = manager.getGroups();
      expect(groups.find(g => g.topic === 'Domain & IP Analysis')).toBeUndefined();
    });
  });

  describe('getGroups', () => {
    it('should return all groups sorted by tab count', () => {
      manager.assignTabToGroup('tab1', 'https://shodan.io', 'Shodan');
      manager.assignTabToGroup('tab2', 'https://censys.io', 'Censys');
      manager.assignTabToGroup('tab3', 'https://hunter.io', 'Hunter');

      const groups = manager.getGroups();

      expect(groups.length).toBe(2);
      expect(groups[0].tabCount).toBeGreaterThanOrEqual(groups[1].tabCount);
    });

    it('should include group metadata', () => {
      manager.assignTabToGroup('tab1', 'https://shodan.io', 'Shodan');

      const groups = manager.getGroups();
      const group = groups[0];

      expect(group.id).toBeDefined();
      expect(group.topic).toBeDefined();
      expect(group.icon).toBeDefined();
      expect(group.color).toBeDefined();
      expect(group.tabCount).toBeDefined();
      expect(group.tabs).toBeDefined();
    });
  });

  describe('getSuggestions', () => {
    it('should return OSINT suggestions for tab topic', () => {
      manager.assignTabToGroup('tab1', 'https://hunter.io', 'Hunter');

      const suggestions = manager.getSuggestions('tab1');

      expect(suggestions.length).toBeGreaterThan(0);
      suggestions.forEach(s => {
        expect(s.name).toBeDefined();
        expect(s.url).toBeDefined();
        expect(s.desc).toBeDefined();
      });
    });

    it('should return empty array for unknown tab', () => {
      const suggestions = manager.getSuggestions('unknown-tab');
      expect(suggestions).toEqual([]);
    });
  });

  describe('exportState/importState', () => {
    it('should export current state', () => {
      manager.assignTabToGroup('tab1', 'https://shodan.io', 'Shodan');
      manager.assignTabToGroup('tab2', 'https://hunter.io', 'Hunter');

      const state = manager.exportState();

      expect(state.groups).toBeDefined();
      expect(state.groups.length).toBe(2);
      expect(state.tabTopics).toBeDefined();
      expect(state.groupCounter).toBeGreaterThan(0);
    });

    it('should import state correctly', () => {
      manager.assignTabToGroup('tab1', 'https://shodan.io', 'Shodan');
      const state = manager.exportState();

      const newManager = new TabGroupingManager();
      newManager.importState(state);

      expect(newManager.getGroups().length).toBe(1);
      expect(newManager.getTabTopic('tab1')).toBeDefined();
    });

    it('should handle null state gracefully', () => {
      expect(() => manager.importState(null)).not.toThrow();
    });
  });
});

describe('TOPIC_PATTERNS', () => {
  it('should define all expected topics', () => {
    const expectedTopics = [
      'Person Investigation',
      'Email Investigation',
      'Phone Investigation',
      'Domain & IP Analysis',
      'Image Analysis',
      'Social Media',
      'Threat Intelligence',
      'Financial Investigation',
      'Geolocation',
      'Archives & History',
      'Dark Web'
    ];

    expectedTopics.forEach(topic => {
      expect(TOPIC_PATTERNS[topic]).toBeDefined();
    });
  });

  it('should have patterns array for each topic', () => {
    Object.values(TOPIC_PATTERNS).forEach(config => {
      expect(Array.isArray(config.patterns)).toBe(true);
      expect(config.patterns.length).toBeGreaterThan(0);
    });
  });

  it('should have keywords array for each topic', () => {
    Object.values(TOPIC_PATTERNS).forEach(config => {
      expect(Array.isArray(config.keywords)).toBe(true);
      expect(config.keywords.length).toBeGreaterThan(0);
    });
  });

  it('should have icon and color for each topic', () => {
    Object.values(TOPIC_PATTERNS).forEach(config => {
      expect(config.icon).toBeDefined();
      expect(config.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});

describe('OSINT_SUGGESTIONS', () => {
  it('should have suggestions for major topics', () => {
    const topicsWithSuggestions = [
      'Person Investigation',
      'Email Investigation',
      'Domain & IP Analysis',
      'Image Analysis',
      'Threat Intelligence'
    ];

    topicsWithSuggestions.forEach(topic => {
      expect(OSINT_SUGGESTIONS[topic]).toBeDefined();
      expect(OSINT_SUGGESTIONS[topic].length).toBeGreaterThan(0);
    });
  });

  it('should have valid suggestion structure', () => {
    Object.values(OSINT_SUGGESTIONS).forEach(suggestions => {
      suggestions.forEach(s => {
        expect(s.name).toBeDefined();
        expect(s.url).toMatch(/^https?:\/\//);
        expect(s.desc).toBeDefined();
      });
    });
  });
});
