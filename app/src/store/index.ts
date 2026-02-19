/**
 * Spin Redux Store
 *
 * Centralized state management for the Spin OSINT browser.
 * "Every case starts with a question."
 */

import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import tabsReducer from './slices/tabsSlice';
import identityReducer from './slices/identitySlice';
import hivemindReducer from './slices/hivemindSlice';
import mcpReducer from './slices/mcpSlice';
import osintReducer from './slices/osintSlice';
import uiReducer from './slices/uiSlice';
import privacyReducer from './slices/privacySlice';
import investigationReducer from './slices/investigationSlice';
import sessionReducer from './slices/sessionSlice';

export const store = configureStore({
  reducer: {
    tabs: tabsReducer,
    identity: identityReducer,
    hivemind: hivemindReducer,
    mcp: mcpReducer,
    osint: osintReducer,
    ui: uiReducer,
    privacy: privacyReducer,
    investigation: investigationReducer,
    session: sessionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for non-serializable data
        ignoredActions: ['hivemind/addEntity', 'mcp/invokeAgent'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
