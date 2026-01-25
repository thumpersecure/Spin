/**
 * SidePanel Component
 *
 * Dynamic side panel that displays different content based on active panel type.
 */

import { Box, ScrollArea } from '@mantine/core';

import { useAppSelector } from '../../store';
import IdentityPanel from '../identity/IdentityPanel';
import HivemindPanel from '../hivemind/HivemindPanel';
import McpPanel from '../mcp/McpPanel';
import OsintPanel from '../osint/OsintPanel';
import PrivacyDashboard from '../privacy/PrivacyDashboard';
import SettingsPanel from './SettingsPanel';

function SidePanel() {
  const { activePanel } = useAppSelector((state) => state.ui);

  const renderPanel = () => {
    switch (activePanel) {
      case 'identity':
        return <IdentityPanel />;
      case 'hivemind':
        return <HivemindPanel />;
      case 'mcp':
        return <McpPanel />;
      case 'osint':
        return <OsintPanel />;
      case 'privacy':
        return <PrivacyDashboard />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return null;
    }
  };

  return (
    <ScrollArea style={{ height: '100%' }} type="hover" offsetScrollbars>
      <Box p="md">{renderPanel()}</Box>
    </ScrollArea>
  );
}

export default SidePanel;
