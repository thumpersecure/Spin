/**
 * UI State Slice
 *
 * Manages UI state like panels, modals, and notifications.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PanelType = 'identity' | 'hivemind' | 'mcp' | 'osint' | 'settings' | null;

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
}

interface UiState {
  activePanel: PanelType;
  isPanelOpen: boolean;
  isFullscreen: boolean;
  notifications: Notification[];
  theme: 'dark' | 'light';
  sidebarWidth: number;
  isDevToolsOpen: boolean;
}

const initialState: UiState = {
  activePanel: null,
  isPanelOpen: false,
  isFullscreen: false,
  notifications: [],
  theme: 'dark', // MADROX is always dark
  sidebarWidth: 320,
  isDevToolsOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActivePanel: (state, action: PayloadAction<PanelType>) => {
      state.activePanel = action.payload;
      state.isPanelOpen = action.payload !== null;
    },

    togglePanel: (state, action: PayloadAction<PanelType>) => {
      if (state.activePanel === action.payload) {
        state.activePanel = null;
        state.isPanelOpen = false;
      } else {
        state.activePanel = action.payload;
        state.isPanelOpen = true;
      }
    },

    closePanel: (state) => {
      state.activePanel = null;
      state.isPanelOpen = false;
    },

    setFullscreen: (state, action: PayloadAction<boolean>) => {
      state.isFullscreen = action.payload;
    },

    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      state.notifications.push({
        ...action.payload,
        id: `notif-${Date.now()}`,
      });
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    setSidebarWidth: (state, action: PayloadAction<number>) => {
      state.sidebarWidth = Math.max(240, Math.min(480, action.payload));
    },

    toggleDevTools: (state) => {
      state.isDevToolsOpen = !state.isDevToolsOpen;
    },
  },
});

export const {
  setActivePanel,
  togglePanel,
  closePanel,
  setFullscreen,
  addNotification,
  removeNotification,
  clearNotifications,
  setSidebarWidth,
  toggleDevTools,
} = uiSlice.actions;

export default uiSlice.reducer;
