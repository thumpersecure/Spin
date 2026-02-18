/**
 * Tabs State Slice
 *
 * Manages browser tabs for each identity.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Tab {
  id: string;
  identityId: string;
  url: string;
  title: string;
  favicon?: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  isActive: boolean;
  createdAt: string;
}

interface TabsState {
  tabs: Tab[];
  activeTabId: string | null;
}

const initialState: TabsState = {
  tabs: [],
  activeTabId: null,
};

const tabsSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    addTab: (state, action: PayloadAction<Omit<Tab, 'id' | 'createdAt'>>) => {
      const id = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newTab: Tab = {
        ...action.payload,
        id,
        createdAt: new Date().toISOString(),
      };
      state.tabs.push(newTab);
      state.activeTabId = id;
    },

    closeTab: (state, action: PayloadAction<string>) => {
      const index = state.tabs.findIndex((t) => t.id === action.payload);
      if (index !== -1) {
        state.tabs.splice(index, 1);
        // If closing active tab, activate adjacent tab
        if (state.activeTabId === action.payload) {
          if (state.tabs.length > 0) {
            const newIndex = Math.min(index, state.tabs.length - 1);
            state.activeTabId = state.tabs[newIndex].id;
          } else {
            state.activeTabId = null;
          }
        }
      }
    },

    setActiveTab: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      // Deactivate the previously active tab
      if (state.activeTabId) {
        const oldTab = state.tabs.find((t) => t.id === state.activeTabId);
        if (oldTab) {
          oldTab.isActive = false;
        }
      }
      // Activate the new tab
      const newTab = state.tabs.find((t) => t.id === id);
      if (newTab) {
        newTab.isActive = true;
      }
      state.activeTabId = id;
    },

    updateTab: (state, action: PayloadAction<{ id: string; updates: Partial<Tab> }>) => {
      const tab = state.tabs.find((t) => t.id === action.payload.id);
      if (tab) {
        Object.assign(tab, action.payload.updates);
      }
    },

    setTabLoading: (state, action: PayloadAction<{ id: string; isLoading: boolean }>) => {
      const tab = state.tabs.find((t) => t.id === action.payload.id);
      if (tab) {
        tab.isLoading = action.payload.isLoading;
      }
    },

    closeTabsForIdentity: (state, action: PayloadAction<string>) => {
      state.tabs = state.tabs.filter((t) => t.identityId !== action.payload);
      if (state.activeTabId && !state.tabs.find((t) => t.id === state.activeTabId)) {
        state.activeTabId = state.tabs.length > 0 ? state.tabs[0].id : null;
      }
    },

    closeAllTabs: (state) => {
      state.tabs = [];
      state.activeTabId = null;
    },
  },
});

export const {
  addTab,
  closeTab,
  setActiveTab,
  updateTab,
  setTabLoading,
  closeTabsForIdentity,
  closeAllTabs,
} = tabsSlice.actions;

export default tabsSlice.reducer;
