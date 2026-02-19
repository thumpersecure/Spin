/**
 * Session Cloning State Slice
 *
 * Manages session data cloning between Spin identities.
 * "You can't just duplicate a person... but you can duplicate their footprint."
 *
 * Spin v12 - Jessica Jones Upgrade
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { invoke } from '@tauri-apps/api/core';

// --- Type Definitions ---

export interface SessionCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  http_only: boolean;
  same_site: 'strict' | 'lax' | 'none';
  expires?: string;
}

export interface HistoryEntry {
  url: string;
  title: string;
  visited_at: string;
  visit_count: number;
}

export interface TabState {
  url: string;
  title: string;
  pinned: boolean;
  scroll_position: number;
  form_data?: Record<string, string>;
}

export interface SessionData {
  identity_id: string;
  cookies: SessionCookie[];
  history: HistoryEntry[];
  tabs: TabState[];
  local_storage: Record<string, string>;
  session_storage: Record<string, string>;
  created_at: string;
  updated_at: string;
  size_bytes: number;
}

export interface CloneOptions {
  include_cookies: boolean;
  include_history: boolean;
  include_tabs: boolean;
  include_local_storage: boolean;
  include_session_storage: boolean;
  cookie_domain_filter?: string[];
  history_since?: string;
  overwrite_existing: boolean;
}

export interface CloneResult {
  source_identity_id: string;
  target_identity_id: string;
  cookies_cloned: number;
  history_entries_cloned: number;
  tabs_cloned: number;
  local_storage_keys_cloned: number;
  session_storage_keys_cloned: number;
  completed_at: string;
  warnings: string[];
}

export interface SessionExport {
  identity_id: string;
  session_data: SessionData;
  exported_at: string;
  format_version: string;
  checksum: string;
}

// --- State Definition ---

interface SessionState {
  sessions: Record<string, SessionData>;
  cloneResult: CloneResult | null;
  isCloning: boolean;
  error: string | null;
}

const initialState: SessionState = {
  sessions: {},
  cloneResult: null,
  isCloning: false,
  error: null,
};

// --- Default Clone Options ---

const defaultCloneOptions: CloneOptions = {
  include_cookies: true,
  include_history: true,
  include_tabs: true,
  include_local_storage: true,
  include_session_storage: true,
  overwrite_existing: false,
};

// --- Async Thunks ---

export const cloneSession = createAsyncThunk(
  'session/clone',
  async (params: {
    sourceIdentityId: string;
    targetIdentityId: string;
    options?: Partial<CloneOptions>;
  }) => {
    const options: CloneOptions = {
      ...defaultCloneOptions,
      ...params.options,
    };
    const result = await invoke<CloneResult>('clone_session', {
      sourceIdentityId: params.sourceIdentityId,
      targetIdentityId: params.targetIdentityId,
      options,
    });
    return result;
  }
);

export const getSessionData = createAsyncThunk(
  'session/getData',
  async (identityId: string) => {
    const sessionData = await invoke<SessionData>('get_session_data', { identityId });
    return sessionData;
  }
);

export const exportSession = createAsyncThunk(
  'session/export',
  async (identityId: string) => {
    const exportData = await invoke<SessionExport>('export_session', { identityId });
    return exportData;
  }
);

export const importSession = createAsyncThunk(
  'session/import',
  async (params: { exportData: SessionExport; targetIdentityId: string }) => {
    const sessionData = await invoke<SessionData>('import_session', {
      exportData: params.exportData,
      targetIdentityId: params.targetIdentityId,
    });
    return sessionData;
  }
);

export const clearSession = createAsyncThunk(
  'session/clear',
  async (identityId: string) => {
    await invoke('clear_session', { identityId });
    return identityId;
  }
);

// --- Slice ---

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    clearCloneResult: (state) => {
      state.cloneResult = null;
    },
  },
  extraReducers: (builder) => {
    // Clone session
    builder
      .addCase(cloneSession.pending, (state) => {
        state.isCloning = true;
        state.error = null;
        state.cloneResult = null;
      })
      .addCase(cloneSession.fulfilled, (state, action) => {
        state.isCloning = false;
        state.cloneResult = action.payload;
      })
      .addCase(cloneSession.rejected, (state, action) => {
        state.isCloning = false;
        state.error = action.error.message || 'Failed to clone session';
      });

    // Get session data
    builder
      .addCase(getSessionData.pending, (state) => {
        state.error = null;
      })
      .addCase(getSessionData.fulfilled, (state, action) => {
        state.sessions[action.payload.identity_id] = action.payload;
      })
      .addCase(getSessionData.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to get session data';
      });

    // Export session
    builder
      .addCase(exportSession.pending, (state) => {
        state.error = null;
      })
      .addCase(exportSession.fulfilled, (state, action) => {
        // Update local session data from the export
        state.sessions[action.payload.identity_id] = action.payload.session_data;
      })
      .addCase(exportSession.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to export session';
      });

    // Import session
    builder
      .addCase(importSession.pending, (state) => {
        state.isCloning = true;
        state.error = null;
      })
      .addCase(importSession.fulfilled, (state, action) => {
        state.isCloning = false;
        state.sessions[action.payload.identity_id] = action.payload;
      })
      .addCase(importSession.rejected, (state, action) => {
        state.isCloning = false;
        state.error = action.error.message || 'Failed to import session';
      });

    // Clear session
    builder
      .addCase(clearSession.pending, (state) => {
        state.error = null;
      })
      .addCase(clearSession.fulfilled, (state, action) => {
        delete state.sessions[action.payload];
      })
      .addCase(clearSession.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to clear session';
      });
  },
});

export const { clearError, clearCloneResult } = sessionSlice.actions;
export default sessionSlice.reducer;
