/**
 * MADROX v12.0.0 "Jessica Jones" - Entry Point
 *
 * "Every case starts with a question. Every answer leads to another."
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';

import { store } from './store';
import { madroxTheme } from './theme/madrox-theme';
import App from './App';

import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <MantineProvider theme={madroxTheme} defaultColorScheme="dark">
        <ModalsProvider>
          <Notifications position="top-right" />
          <App />
        </ModalsProvider>
      </MantineProvider>
    </Provider>
  </React.StrictMode>
);
