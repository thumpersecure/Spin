/**
 * BrowserView Component
 *
 * Main browser content area / webview container.
 */

import {
  Box,
  Center,
  Stack,
  Text,
  Button,
  Group,
  Paper,
  Kbd,
  Divider,
} from '@mantine/core';
import {
  IconNetwork,
  IconPlus,
  IconSearch,
  IconBrain,
  IconUsers,
  IconTimeline,
} from '@tabler/icons-react';

import { useAppDispatch, useAppSelector } from '../../store';
import { addTab } from '../../store/slices/tabsSlice';
import { togglePanel } from '../../store/slices/uiSlice';

function BrowserView() {
  const dispatch = useAppDispatch();
  const { tabs, activeTabId } = useAppSelector((state) => state.tabs);
  const { activeIdentityId } = useAppSelector((state) => state.identity);

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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative gradient orbs */}
      <Box
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(123, 31, 235, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(28, 223, 102, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <Stack align="center" gap="xl" style={{ maxWidth: 640, zIndex: 1 }}>
        {/* Logo */}
        <Stack align="center" gap="xs">
          <Text
            size="4rem"
            fw={800}
            style={{
              background: 'linear-gradient(135deg, #7b1feb 0%, #1cdf66 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.1em',
              textShadow: '0 0 40px rgba(123, 31, 235, 0.3)',
            }}
          >
            SPIN
          </Text>
          <Text c="dimmed" size="sm" style={{ letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Jessica Jones v12 -- OSINT Investigation Browser
          </Text>
        </Stack>

        {/* URL Prompt */}
        <Paper
          p="md"
          radius="lg"
          withBorder
          style={{
            width: '100%',
            cursor: 'pointer',
            borderColor: 'rgba(123, 31, 235, 0.3)',
            background: 'rgba(123, 31, 235, 0.05)',
            transition: 'border-color 0.2s ease, background 0.2s ease',
          }}
          onClick={onNewTab}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(123, 31, 235, 0.6)';
            e.currentTarget.style.background = 'rgba(123, 31, 235, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(123, 31, 235, 0.3)';
            e.currentTarget.style.background = 'rgba(123, 31, 235, 0.05)';
          }}
        >
          <Group justify="space-between">
            <Group gap="sm">
              <IconSearch size={18} style={{ color: '#7b1feb', opacity: 0.7 }} />
              <Text c="dimmed" size="sm">
                Enter a URL or search to begin investigating...
              </Text>
            </Group>
            <Group gap={4}>
              <Kbd size="xs">Ctrl</Kbd>
              <Text size="xs" c="dimmed">+</Text>
              <Kbd size="xs">L</Kbd>
            </Group>
          </Group>
        </Paper>

        {/* Quick stats */}
        <Group gap="xl">
          <Stack align="center" gap={4}>
            <Text size="2rem" fw={600} c="spinPurple">
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
            variant="gradient"
            gradient={{ from: '#7b1feb', to: '#1cdf66' }}
            onClick={onNewTab}
          >
            New Tab
          </Button>
          <Button
            leftSection={<IconUsers size={16} />}
            variant="light"
            color="spinPurple"
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
          <Button
            leftSection={<IconTimeline size={16} />}
            variant="light"
            color="grape"
            onClick={() => dispatch(togglePanel('investigation'))}
          >
            Cases
          </Button>
        </Group>

        <Divider
          style={{ width: '60%', opacity: 0.3 }}
          color="violet"
        />

        {/* Keyboard shortcut hints */}
        <Group gap="xl">
          <Group gap={6}>
            <Kbd size="xs">Ctrl</Kbd>
            <Text size="xs" c="dimmed">+</Text>
            <Kbd size="xs">L</Kbd>
            <Text size="xs" c="dimmed">Focus address bar</Text>
          </Group>
          <Group gap={6}>
            <Kbd size="xs">Ctrl</Kbd>
            <Text size="xs" c="dimmed">+</Text>
            <Kbd size="xs">T</Kbd>
            <Text size="xs" c="dimmed">New tab</Text>
          </Group>
          <Group gap={6}>
            <Kbd size="xs">Ctrl</Kbd>
            <Text size="xs" c="dimmed">+</Text>
            <Kbd size="xs">W</Kbd>
            <Text size="xs" c="dimmed">Close tab</Text>
          </Group>
        </Group>

        {/* Tagline */}
        <Text
          size="xs"
          c="dimmed"
          fs="italic"
          style={{
            marginTop: 10,
            background: 'linear-gradient(90deg, rgba(123, 31, 235, 0.6), rgba(28, 223, 102, 0.6))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          "Every case starts with a question. Every answer leads to another."
        </Text>
      </Stack>
    </Box>
  );
}

export default BrowserView;
