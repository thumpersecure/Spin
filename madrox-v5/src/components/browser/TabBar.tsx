/**
 * TabBar Component
 *
 * Browser tab management with identity-aware tabs.
 */

import { Group, ActionIcon, Box, Text, CloseButton, ScrollArea } from '@mantine/core';
import { IconPlus, IconWorld } from '@tabler/icons-react';

import { useAppDispatch, useAppSelector } from '../../store';
import { addTab, closeTab, setActiveTab, Tab } from '../../store/slices/tabsSlice';

function TabBar() {
  const dispatch = useAppDispatch();
  const { tabs, activeTabId } = useAppSelector((state) => state.tabs);
  const { activeIdentityId } = useAppSelector((state) => state.identity);

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

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    dispatch(closeTab(tabId));
  };

  const handleSelectTab = (tabId: string) => {
    dispatch(setActiveTab(tabId));
  };

  // Filter tabs for current identity
  const identityTabs = tabs.filter((t) => t.identityId === activeIdentityId);

  return (
    <Box
      style={{
        height: 36,
        backgroundColor: 'var(--mantine-color-dark-8)',
        borderBottom: '1px solid var(--mantine-color-dark-6)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <ScrollArea
        style={{ flex: 1 }}
        scrollbarSize={4}
        type="hover"
        offsetScrollbars
      >
        <Group gap={0} wrap="nowrap" style={{ height: 36 }}>
          {identityTabs.map((tab) => (
            <TabItem
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeTabId}
              onSelect={() => handleSelectTab(tab.id)}
              onClose={(e) => handleCloseTab(e, tab.id)}
            />
          ))}
        </Group>
      </ScrollArea>

      <ActionIcon
        variant="subtle"
        color="gray"
        onClick={handleNewTab}
        style={{ marginRight: 8 }}
        title="New Tab"
      >
        <IconPlus size={16} />
      </ActionIcon>
    </Box>
  );
}

interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  onSelect: () => void;
  onClose: (e: React.MouseEvent) => void;
}

function TabItem({ tab, isActive, onSelect, onClose }: TabItemProps) {
  return (
    <Box
      onClick={onSelect}
      style={{
        height: 36,
        minWidth: 120,
        maxWidth: 200,
        padding: '0 8px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
        backgroundColor: isActive
          ? 'var(--mantine-color-dark-7)'
          : 'transparent',
        borderBottom: isActive
          ? '2px solid var(--mantine-color-madroxPurple-6)'
          : '2px solid transparent',
        transition: 'all 150ms ease',
        '&:hover': {
          backgroundColor: 'var(--mantine-color-dark-7)',
        },
      }}
    >
      {tab.favicon ? (
        <img src={tab.favicon} alt="" style={{ width: 16, height: 16 }} />
      ) : (
        <IconWorld size={16} style={{ opacity: 0.5 }} />
      )}

      <Text
        size="xs"
        style={{
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {tab.title || 'New Tab'}
      </Text>

      <CloseButton
        size="xs"
        onClick={onClose}
        style={{ opacity: 0.5 }}
      />
    </Box>
  );
}

export default TabBar;
