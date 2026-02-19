/**
 * Spin App Root Component
 *
 * Alias Investigations. Case file open.
 */

import { useEffect } from 'react';
import { AppShell, Box } from '@mantine/core';

import { useAppDispatch, useAppSelector } from './store';
import { fetchIdentities } from './store/slices/identitySlice';
import { fetchEntities } from './store/slices/hivemindSlice';
import { fetchAgents } from './store/slices/mcpSlice';
import { fetchBookmarks } from './store/slices/osintSlice';

import TitleBar from './components/browser/TitleBar';
import TabBar from './components/browser/TabBar';
import NavBar from './components/browser/NavBar';
import BrowserView from './components/browser/BrowserView';
import SidePanel from './components/ui/SidePanel';

function App() {
  const dispatch = useAppDispatch();
  const { isPanelOpen, sidebarWidth } = useAppSelector((state) => state.ui);

  // Initialize data on mount
  useEffect(() => {
    dispatch(fetchIdentities());
    dispatch(fetchEntities());
    dispatch(fetchAgents());
    dispatch(fetchBookmarks());
  }, [dispatch]);

  return (
    <AppShell
      header={{ height: 40 }}
      navbar={{
        width: isPanelOpen ? sidebarWidth : 0,
        breakpoint: 'xs',
        collapsed: { mobile: !isPanelOpen, desktop: !isPanelOpen },
      }}
      padding={0}
      styles={{
        main: {
          backgroundColor: 'var(--mantine-color-dark-9)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
        navbar: {
          backgroundColor: 'var(--mantine-color-dark-8)',
          borderRight: '1px solid var(--mantine-color-dark-6)',
          transition: 'width 200ms ease',
        },
      }}
    >
      <AppShell.Header>
        <TitleBar />
      </AppShell.Header>

      <AppShell.Navbar>
        <SidePanel />
      </AppShell.Navbar>

      <AppShell.Main>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <TabBar />
          <NavBar />
          <BrowserView />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
