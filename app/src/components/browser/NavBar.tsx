/**
 * NavBar Component
 *
 * Browser navigation bar with URL input and controls.
 */

import { useState, useCallback, useMemo } from 'react';
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
  const activeTab = useMemo(() => tabs.find((t) => t.id === activeTabId), [tabs, activeTabId]);

  // Sync URL input when active tab changes - derived from activeTab
  const urlInput = activeTab?.url || '';
  const [localUrlInput, setLocalUrlInput] = useState(urlInput);

  // Update local input when activeTab URL changes
  if (urlInput !== localUrlInput && !document.activeElement?.matches('input[type="text"]')) {
    setLocalUrlInput(urlInput);
  }

  // Derive isSecure from the active tab's actual URL
  const isSecure = useMemo(() => {
    const url = activeTab?.url || '';
    return url.startsWith('https://') || url === '' || url === 'about:blank';
  }, [activeTab?.url]);

  const handleNavigate = useCallback(async () => {
    if (!activeTabId || !localUrlInput.trim()) return;

    let normalizedUrl = localUrlInput.trim();
    // Auto-prepend https:// if no protocol specified
    if (!/^https?:\/\//i.test(normalizedUrl) && !normalizedUrl.startsWith('about:')) {
      normalizedUrl = `https://${normalizedUrl}`;
      setLocalUrlInput(normalizedUrl);
    }

    try {
      const url = await invoke<string>('navigate', {
        request: { url: normalizedUrl },
      });

      if (url) {
        dispatch(
          updateTab({
            id: activeTabId,
            updates: {
              url,
              isLoading: true,
            },
          })
        );
      }
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  }, [activeTabId, localUrlInput, dispatch]);

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
    const homeUrl = 'about:blank';
    setLocalUrlInput(homeUrl);
    if (activeTabId) {
      dispatch(updateTab({ id: activeTabId, updates: { url: homeUrl } }));
    }
  };

  const handleScreenshot = async () => {
    try {
      await invoke('get_page_content', { format: 'screenshot' });
    } catch (error) {
      console.error('Screenshot failed:', error);
    }
  };

  const handleSavePdf = async () => {
    try {
      await invoke('get_page_content', { format: 'pdf' });
    } catch (error) {
      console.error('Save PDF failed:', error);
    }
  };

  const handleViewSource = async () => {
    try {
      await invoke<string>('get_page_content', { format: 'source' });
    } catch (error) {
      console.error('View source failed:', error);
    }
  };

  const handleSavePage = async () => {
    try {
      await invoke('get_page_content', { format: 'html' });
    } catch (error) {
      console.error('Save page failed:', error);
    }
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
        value={localUrlInput}
        onChange={(e) => setLocalUrlInput(e.target.value)}
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
          <Menu.Item leftSection={<IconCamera size={16} />} onClick={handleScreenshot}>
            Screenshot
          </Menu.Item>
          <Menu.Item leftSection={<IconDownload size={16} />} onClick={handleSavePdf}>
            Save as PDF
          </Menu.Item>
          <Menu.Item leftSection={<IconCode size={16} />} onClick={handleViewSource}>
            View Source
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item leftSection={<IconDeviceFloppy size={16} />} onClick={handleSavePage}>
            Save Page
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Box>
  );
}

export default NavBar;
