/**
 * BrowserView Component
 *
 * Main browser content area / webview container.
 */

import { Box, Center, Stack, Text, Button, Group } from '@mantine/core';
import {
  IconNetwork,
  IconPlus,
  IconSearch,
  IconBrain,
  IconUsers,
} from '@tabler/icons-react';

import { useAppDispatch, useAppSelector } from '../../store';
import { addTab } from '../../store/slices/tabsSlice';
import { togglePanel } from '../../store/slices/uiSlice';

function BrowserView() {
  const dispatch = useAppDispatch();
  const { tabs, activeTabId } = useAppSelector((state) => state.tabs);
  const { activeIdentityId } = useAppSelector((state) => state.identity);
  const { entities } = useAppSelector((state) => state.hivemind);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const handleNewTab = () => {
    dispatch(
      addTab({
        identityId: activeIdentityId,
        url: 'about:blank',
        title: 'New Tab',
        isLoading: false,
        canGoBack: false,
        canGoForward: false,
        isActive: true,
      })
    );
  };

  // If no active tab, show start page
  if (!activeTab) {
    return <StartPage onNewTab={handleNewTab} />;
  }

  // For now, show a placeholder. In production, this would be a webview.
  return (
    <Box
      style={{
        flex: 1,
        backgroundColor: 'var(--mantine-color-dark-9)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {activeTab.isLoading ? (
        <Center style={{ flex: 1 }}>
          <Text c="dimmed">Loading...</Text>
        </Center>
      ) : activeTab.url === 'about:blank' ? (
        <StartPage onNewTab={handleNewTab} />
      ) : (
        <Center style={{ flex: 1 }}>
          <Stack align="center" gap="md">
            <Text c="dimmed" size="sm">
              WebView will render: {activeTab.url}
            </Text>
            <Text c="dimmed" size="xs">
              (Chromium webview integration pending)
            </Text>
          </Stack>
        </Center>
      )}
    </Box>
  );
}

interface StartPageProps {
  onNewTab: () => void;
}

function StartPage({ onNewTab }: StartPageProps) {
  const dispatch = useAppDispatch();
  const { identities } = useAppSelector((state) => state.identity);
  const { entities, crossReferences } = useAppSelector((state) => state.hivemind);
  const { agents } = useAppSelector((state) => state.mcp);

  return (
    <Box
      style={{
        flex: 1,
        backgroundColor: 'var(--mantine-color-dark-9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
      }}
    >
      <Stack align="center" gap="xl" style={{ maxWidth: 600 }}>
        {/* Logo */}
        <Stack align="center" gap="xs">
          <Text
            size="3rem"
            fw={700}
            style={{
              background: 'linear-gradient(135deg, #7b1feb 0%, #1cdf66 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            MADROX
          </Text>
          <Text c="dimmed" size="sm">
            The Multiple Man - OSINT Browser v5.0
          </Text>
        </Stack>

        {/* Quick stats */}
        <Group gap="xl">
          <Stack align="center" gap={4}>
            <Text size="2rem" fw={600} c="madroxPurple">
              {identities.length}
            </Text>
            <Text size="xs" c="dimmed">
              Identities
            </Text>
          </Stack>
          <Stack align="center" gap={4}>
            <Text size="2rem" fw={600} c="hivemindGreen">
              {entities.length}
            </Text>
            <Text size="xs" c="dimmed">
              Entities
            </Text>
          </Stack>
          <Stack align="center" gap={4}>
            <Text size="2rem" fw={600} c="alertRed">
              {crossReferences.length}
            </Text>
            <Text size="xs" c="dimmed">
              Cross-Refs
            </Text>
          </Stack>
          <Stack align="center" gap={4}>
            <Text size="2rem" fw={600} c="osintBlue">
              {agents.length}
            </Text>
            <Text size="xs" c="dimmed">
              Agents
            </Text>
          </Stack>
        </Group>

        {/* Quick actions */}
        <Group>
          <Button
            leftSection={<IconPlus size={16} />}
            variant="filled"
            color="madroxPurple"
            onClick={onNewTab}
          >
            New Tab
          </Button>
          <Button
            leftSection={<IconUsers size={16} />}
            variant="light"
            color="madroxPurple"
            onClick={() => dispatch(togglePanel('identity'))}
          >
            Identities
          </Button>
          <Button
            leftSection={<IconNetwork size={16} />}
            variant="light"
            color="hivemindGreen"
            onClick={() => dispatch(togglePanel('hivemind'))}
          >
            Hivemind
          </Button>
          <Button
            leftSection={<IconSearch size={16} />}
            variant="light"
            color="osintBlue"
            onClick={() => dispatch(togglePanel('osint'))}
          >
            OSINT
          </Button>
          <Button
            leftSection={<IconBrain size={16} />}
            variant="light"
            color="osintBlue"
            onClick={() => dispatch(togglePanel('mcp'))}
          >
            Agents
          </Button>
        </Group>

        {/* Tagline */}
        <Text
          size="xs"
          c="dimmed"
          fs="italic"
          style={{ marginTop: 20 }}
        >
          "One becomes many. Many become one."
        </Text>
      </Stack>
    </Box>
  );
}

export default BrowserView;
