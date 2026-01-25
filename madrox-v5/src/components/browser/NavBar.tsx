/**
 * NavBar Component
 *
 * Browser navigation bar with URL input and controls.
 */

import { useState, useCallback } from 'react';
import {
  Group,
  ActionIcon,
  TextInput,
  Box,
  Tooltip,
  Menu,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconArrowRight,
  IconRefresh,
  IconHome,
  IconLock,
  IconLockOpen,
  IconDotsVertical,
  IconDownload,
  IconCamera,
  IconCode,
  IconDeviceFloppy,
} from '@tabler/icons-react';
import { invoke } from '@tauri-apps/api/core';

import { useAppDispatch, useAppSelector } from '../../store';
import { updateTab } from '../../store/slices/tabsSlice';

function NavBar() {
  const dispatch = useAppDispatch();
  const { tabs, activeTabId } = useAppSelector((state) => state.tabs);
  const activeTab = tabs.find((t) => t.id === activeTabId);

  const [urlInput, setUrlInput] = useState(activeTab?.url || '');
  const [isSecure, setIsSecure] = useState(true);

  const handleNavigate = useCallback(async () => {
    if (!activeTabId || !urlInput.trim()) return;

    try {
      const url = await invoke<string>('navigate', {
        request: { url: urlInput },
      });

      dispatch(
        updateTab({
          id: activeTabId,
          updates: {
            url,
            isLoading: true,
          },
        })
      );

      setIsSecure(url.startsWith('https://'));
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  }, [activeTabId, urlInput, dispatch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNavigate();
    }
  };

  const handleBack = async () => {
    try {
      await invoke('go_back');
    } catch (error) {
      console.error('Go back failed:', error);
    }
  };

  const handleForward = async () => {
    try {
      await invoke('go_forward');
    } catch (error) {
      console.error('Go forward failed:', error);
    }
  };

  const handleReload = async () => {
    try {
      await invoke('reload');
    } catch (error) {
      console.error('Reload failed:', error);
    }
  };

  const handleHome = () => {
    setUrlInput('about:blank');
  };

  return (
    <Box
      style={{
        height: 44,
        backgroundColor: 'var(--mantine-color-dark-8)',
        borderBottom: '1px solid var(--mantine-color-dark-6)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: 8,
      }}
    >
      {/* Navigation controls */}
      <Group gap={4}>
        <Tooltip label="Back" position="bottom">
          <ActionIcon
            variant="subtle"
            color="gray"
            disabled={!activeTab?.canGoBack}
            onClick={handleBack}
          >
            <IconArrowLeft size={18} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Forward" position="bottom">
          <ActionIcon
            variant="subtle"
            color="gray"
            disabled={!activeTab?.canGoForward}
            onClick={handleForward}
          >
            <IconArrowRight size={18} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Reload" position="bottom">
          <ActionIcon variant="subtle" color="gray" onClick={handleReload}>
            <IconRefresh size={18} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Home" position="bottom">
          <ActionIcon variant="subtle" color="gray" onClick={handleHome}>
            <IconHome size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>

      {/* URL bar */}
      <TextInput
        value={urlInput}
        onChange={(e) => setUrlInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search or enter URL..."
        leftSection={
          isSecure ? (
            <IconLock size={16} style={{ color: 'var(--mantine-color-green-6)' }} />
          ) : (
            <IconLockOpen size={16} style={{ color: 'var(--mantine-color-yellow-6)' }} />
          )
        }
        style={{ flex: 1 }}
        styles={{
          input: {
            backgroundColor: 'var(--mantine-color-dark-7)',
            borderColor: 'var(--mantine-color-dark-5)',
            '&:focus': {
              borderColor: 'var(--mantine-color-madroxPurple-6)',
            },
          },
        }}
      />

      {/* Page actions */}
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <ActionIcon variant="subtle" color="gray">
            <IconDotsVertical size={18} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Page Actions</Menu.Label>
          <Menu.Item leftSection={<IconCamera size={16} />}>
            Screenshot
          </Menu.Item>
          <Menu.Item leftSection={<IconDownload size={16} />}>
            Save as PDF
          </Menu.Item>
          <Menu.Item leftSection={<IconCode size={16} />}>
            View Source
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item leftSection={<IconDeviceFloppy size={16} />}>
            Save Page
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Box>
  );
}

export default NavBar;
