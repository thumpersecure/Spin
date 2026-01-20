/**
 * CONSTANTINE Browser - Svelte State Store
 * Centralized reactive state management
 */

import { writable, derived } from 'svelte/store';

// Tab state
function createTabStore() {
  const { subscribe, set, update } = writable(new Map());

  return {
    subscribe,
    set,
    add: (tabId, tabData) => update(tabs => {
      tabs.set(tabId, {
        title: tabData.title || 'New Tab',
        favicon: tabData.favicon || null,
        url: tabData.url || '',
        loading: false,
        canGoBack: false,
        canGoForward: false,
        crashed: false,
        unresponsive: false,
        ...tabData
      });
      return new Map(tabs);
    }),
    remove: (tabId) => update(tabs => {
      tabs.delete(tabId);
      return new Map(tabs);
    }),
    updateTab: (tabId, data) => update(tabs => {
      const tab = tabs.get(tabId);
      if (tab) {
        tabs.set(tabId, { ...tab, ...data });
      }
      return new Map(tabs);
    }),
    getTab: (tabs, tabId) => tabs.get(tabId),
    clear: () => set(new Map())
  };
}

export const tabs = createTabStore();
export const activeTabId = writable(null);

// Derived store for active tab data
export const activeTab = derived(
  [tabs, activeTabId],
  ([$tabs, $activeTabId]) => $tabs.get($activeTabId) || null
);

// Privacy settings
export const privacy = writable({
  torEnabled: false,
  blockTrackers: true,
  blockFingerprinting: true,
  blockThirdPartyCookies: true,
  blockWebRTC: false,
  spoofUserAgent: true,
  doNotTrack: true,
  httpsUpgrade: true,
  clearOnExit: false
});

// UI state
export const panelState = writable({
  open: false,
  activePanel: null // 'extensions' | 'privacy' | null
});

// Platform info
export const platform = writable({
  isWindows: false,
  isMac: false,
  isLinux: false
});

// App status
export const appStatus = writable({
  isOnline: true,
  isFullscreen: false,
  hasSessionToRestore: false,
  zoomLevel: 0
});

// Notifications queue
function createNotificationStore() {
  const { subscribe, update } = writable([]);
  let idCounter = 0;

  return {
    subscribe,
    show: (type, message, duration = 3000) => {
      const id = ++idCounter;
      update(notifications => {
        // Limit to 5 notifications
        const limited = notifications.length >= 5
          ? notifications.slice(1)
          : notifications;
        return [...limited, { id, type, message, duration }];
      });

      // Auto-remove after duration
      setTimeout(() => {
        update(notifications => notifications.filter(n => n.id !== id));
      }, duration);

      return id;
    },
    dismiss: (id) => update(notifications =>
      notifications.filter(n => n.id !== id)
    ),
    clear: () => update(() => [])
  };
}

export const notifications = createNotificationStore();

// OSINT Bookmarks data
export const OSINT_BOOKMARKS = {
  'Username Search': [
    { name: 'Namechk', url: 'https://namechk.com/' },
    { name: 'WhatsMyName', url: 'https://whatsmyname.app/' },
    { name: 'Sherlock', url: 'https://github.com/sherlock-project/sherlock' },
    { name: 'UserSearch', url: 'https://usersearch.org/' }
  ],
  'Email Search': [
    { name: 'Hunter.io', url: 'https://hunter.io/' },
    { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com/' },
    { name: 'Epieos', url: 'https://epieos.com/' },
    { name: 'EmailRep', url: 'https://emailrep.io/' }
  ],
  'Domain & IP': [
    { name: 'Shodan', url: 'https://www.shodan.io/' },
    { name: 'Censys', url: 'https://censys.io/' },
    { name: 'SecurityTrails', url: 'https://securitytrails.com/' },
    { name: 'DNSDumpster', url: 'https://dnsdumpster.com/' },
    { name: 'crt.sh', url: 'https://crt.sh/' },
    { name: 'VirusTotal', url: 'https://www.virustotal.com/' }
  ],
  'Image Analysis': [
    { name: 'TinEye', url: 'https://tineye.com/' },
    { name: 'Yandex Images', url: 'https://yandex.com/images/' },
    { name: 'PimEyes', url: 'https://pimeyes.com/' },
    { name: 'FotoForensics', url: 'https://fotoforensics.com/' }
  ],
  'Social Media': [
    { name: 'Social Searcher', url: 'https://www.social-searcher.com/' },
    { name: 'Social Blade', url: 'https://socialblade.com/' }
  ],
  'Archives': [
    { name: 'Wayback Machine', url: 'https://web.archive.org/' },
    { name: 'Archive.org', url: 'https://archive.org/' },
    { name: 'CachedView', url: 'https://cachedview.com/' }
  ],
  'People Search': [
    { name: 'Pipl', url: 'https://pipl.com/' },
    { name: 'ThatsThem', url: 'https://thatsthem.com/' },
    { name: 'Whitepages', url: 'https://www.whitepages.com/' }
  ],
  'Threat Intel': [
    { name: 'VirusTotal', url: 'https://www.virustotal.com/' },
    { name: 'Hybrid Analysis', url: 'https://www.hybrid-analysis.com/' },
    { name: 'Any.run', url: 'https://any.run/' },
    { name: 'AbuseIPDB', url: 'https://www.abuseipdb.com/' }
  ]
};

// Quick links for start page
export const QUICK_LINKS = [
  { title: 'OSINT Framework', url: 'https://osintframework.com', icon: '&#128269;' },
  { title: 'Shodan', url: 'https://www.shodan.io', icon: '&#127760;' },
  { title: 'Have I Been Pwned', url: 'https://haveibeenpwned.com', icon: '&#128274;' },
  { title: 'Wayback Machine', url: 'https://web.archive.org', icon: '&#128197;' },
  { title: 'VirusTotal', url: 'https://www.virustotal.com', icon: '&#128737;' },
  { title: 'PimEyes', url: 'https://pimeyes.com', icon: '&#128065;' },
  { title: 'Hunter.io', url: 'https://hunter.io', icon: '&#128231;' },
  { title: 'Intelligence X', url: 'https://intelx.io', icon: '&#128373;' }
];
