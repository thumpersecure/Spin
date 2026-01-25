/**
 * Privacy State Slice
 *
 * Manages the Dynamic Privacy Engine state.
 * "Privacy is not about hiding. It's about control."
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { invoke } from '@tauri-apps/api/core';

export type OpsecLevel = 'MINIMAL' | 'STANDARD' | 'ENHANCED' | 'MAXIMUM' | 'PARANOID';

export type RiskCategory =
  | 'trusted'
  | 'general'
  | 'social_media'
  | 'government'
  | 'surveillance'
  | 'hostile'
  | 'dark_web'
  | 'unknown';

export interface RiskFactor {
  name: string;
  severity: number;
  description: string;
}

export interface PrivacyThreat {
  type: string;
  details?: Record<string, unknown>;
}

export interface RiskAssessment {
  domain: string;
  risk_score: number;
  category: RiskCategory;
  recommended_opsec: OpsecLevel;
  risk_factors: RiskFactor[];
  threats: PrivacyThreat[];
  assessed_at: string;
  confidence: number;
}

export interface PrivacySettings {
  opsec_level: OpsecLevel;
  auto_adjust: boolean;
  block_trackers: boolean;
  block_fingerprinting: boolean;
  spoof_canvas: boolean;
  spoof_webgl: boolean;
  spoof_audio: boolean;
  block_webrtc: boolean;
  spoof_timezone: boolean;
  spoof_screen: boolean;
  spoof_user_agent: boolean;
  spoof_fonts: boolean;
  block_third_party_cookies: boolean;
  clear_cookies_on_close: boolean;
  use_tor: boolean;
  dns_over_https: boolean;
  block_javascript: boolean;
}

export interface PrivacyStats {
  trackers_blocked: number;
  fingerprint_attempts_blocked: number;
  cookies_blocked: number;
  webrtc_leaks_prevented: number;
  dns_queries_protected: number;
  scripts_blocked: number;
  sites_assessed: number;
  high_risk_sites_visited: number;
  auto_escalations: number;
}

interface PrivacyState {
  settings: PrivacySettings;
  stats: PrivacyStats;
  currentAssessment: RiskAssessment | null;
  siteAssessments: RiskAssessment[];
  isLoading: boolean;
  error: string | null;
}

const defaultSettings: PrivacySettings = {
  opsec_level: 'STANDARD',
  auto_adjust: true,
  block_trackers: true,
  block_fingerprinting: false,
  spoof_canvas: false,
  spoof_webgl: false,
  spoof_audio: false,
  block_webrtc: true,
  spoof_timezone: false,
  spoof_screen: false,
  spoof_user_agent: false,
  spoof_fonts: false,
  block_third_party_cookies: true,
  clear_cookies_on_close: false,
  use_tor: false,
  dns_over_https: true,
  block_javascript: false,
};

const defaultStats: PrivacyStats = {
  trackers_blocked: 0,
  fingerprint_attempts_blocked: 0,
  cookies_blocked: 0,
  webrtc_leaks_prevented: 0,
  dns_queries_protected: 0,
  scripts_blocked: 0,
  sites_assessed: 0,
  high_risk_sites_visited: 0,
  auto_escalations: 0,
};

const initialState: PrivacyState = {
  settings: defaultSettings,
  stats: defaultStats,
  currentAssessment: null,
  siteAssessments: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchPrivacySettings = createAsyncThunk(
  'privacy/fetchSettings',
  async () => {
    const settings = await invoke<PrivacySettings>('get_privacy_settings');
    return settings;
  }
);

export const setOpsecLevel = createAsyncThunk(
  'privacy/setOpsecLevel',
  async (level: OpsecLevel) => {
    const settings = await invoke<PrivacySettings>('set_opsec_level', { level });
    return settings;
  }
);

export const updatePrivacySettings = createAsyncThunk(
  'privacy/updateSettings',
  async (settings: PrivacySettings) => {
    await invoke('set_privacy_settings', { settings });
    return settings;
  }
);

export const assessSiteRisk = createAsyncThunk(
  'privacy/assessSiteRisk',
  async (url: string) => {
    const assessment = await invoke<RiskAssessment>('assess_site_risk', { url });
    return assessment;
  }
);

export const autoAdjustPrivacy = createAsyncThunk(
  'privacy/autoAdjust',
  async (url: string) => {
    const settings = await invoke<PrivacySettings>('auto_adjust_privacy', { url });
    return settings;
  }
);

export const fetchPrivacyStats = createAsyncThunk(
  'privacy/fetchStats',
  async () => {
    const stats = await invoke<PrivacyStats>('get_privacy_stats');
    return stats;
  }
);

export const fetchSiteAssessments = createAsyncThunk(
  'privacy/fetchAssessments',
  async () => {
    const assessments = await invoke<RiskAssessment[]>('get_site_assessments');
    return assessments;
  }
);

const privacySlice = createSlice({
  name: 'privacy',
  initialState,
  reducers: {
    setCurrentAssessment: (state, action: PayloadAction<RiskAssessment | null>) => {
      state.currentAssessment = action.payload;
    },

    incrementTrackerBlocked: (state) => {
      state.stats.trackers_blocked += 1;
    },

    incrementFingerprintBlocked: (state) => {
      state.stats.fingerprint_attempts_blocked += 1;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch settings
    builder
      .addCase(fetchPrivacySettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      });

    // Set OPSEC level
    builder
      .addCase(setOpsecLevel.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(setOpsecLevel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })
      .addCase(setOpsecLevel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to set OPSEC level';
      });

    // Update settings
    builder
      .addCase(updatePrivacySettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      });

    // Assess site risk
    builder
      .addCase(assessSiteRisk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(assessSiteRisk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAssessment = action.payload;
        // Add to assessments if not already present
        const exists = state.siteAssessments.find(
          (a) => a.domain === action.payload.domain
        );
        if (!exists) {
          state.siteAssessments.unshift(action.payload);
        }
      })
      .addCase(assessSiteRisk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to assess site';
      });

    // Auto adjust
    builder
      .addCase(autoAdjustPrivacy.fulfilled, (state, action) => {
        state.settings = action.payload;
      });

    // Fetch stats
    builder
      .addCase(fetchPrivacyStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });

    // Fetch assessments
    builder
      .addCase(fetchSiteAssessments.fulfilled, (state, action) => {
        state.siteAssessments = action.payload;
      });
  },
});

export const {
  setCurrentAssessment,
  incrementTrackerBlocked,
  incrementFingerprintBlocked,
  clearError,
} = privacySlice.actions;

export default privacySlice.reducer;

// Utility functions
export const getOpsecLevelColor = (level: OpsecLevel): string => {
  switch (level) {
    case 'MINIMAL':
      return 'green';
    case 'STANDARD':
      return 'blue';
    case 'ENHANCED':
      return 'yellow';
    case 'MAXIMUM':
      return 'orange';
    case 'PARANOID':
      return 'red';
    default:
      return 'gray';
  }
};

export const getOpsecLevelDescription = (level: OpsecLevel): string => {
  switch (level) {
    case 'MINIMAL':
      return 'Minimal protection for trusted sites';
    case 'STANDARD':
      return 'Standard protection for general browsing';
    case 'ENHANCED':
      return 'Enhanced protection for sensitive research';
    case 'MAXIMUM':
      return 'Maximum protection for high-risk investigation';
    case 'PARANOID':
      return 'Paranoid mode - assume active adversary';
    default:
      return '';
  }
};

export const getRiskCategoryColor = (category: RiskCategory): string => {
  switch (category) {
    case 'trusted':
      return 'green';
    case 'general':
      return 'blue';
    case 'social_media':
      return 'orange';
    case 'government':
      return 'yellow';
    case 'surveillance':
      return 'red';
    case 'hostile':
      return 'red';
    case 'dark_web':
      return 'grape';
    default:
      return 'gray';
  }
};
