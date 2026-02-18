/**
 * PrivacyDashboard Component
 *
 * Dynamic Privacy Engine control center.
 * Real-time risk assessment and OPSEC level management.
 */

import { useEffect, useCallback, useState } from 'react';
import {
  Stack,
  Title,
  Group,
  Text,
  Card,
  Badge,
  Progress,
  Switch,
  SegmentedControl,
  Divider,
  RingProgress,
  SimpleGrid,
  Tooltip,
  ThemeIcon,
  Transition,
  Paper,
  Box,
  Notification,
} from '@mantine/core';
import {
  IconShield,
  IconShieldCheck,
  IconShieldLock,
  IconShieldOff,
  IconAlertTriangle,
  IconEyeOff,
  IconFingerprint,
  IconCookie,
  IconLock,
  IconNetwork,
  IconRoute,
  IconRefresh,
} from '@tabler/icons-react';

import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchPrivacySettings,
  fetchPrivacyStats,
  setOpsecLevel,
  updatePrivacySettings,
  OpsecLevel,
  PrivacySettings,
  getOpsecLevelColor,
  getOpsecLevelDescription,
} from '../../store/slices/privacySlice';

const OPSEC_LEVELS: { value: OpsecLevel; label: string; icon: typeof IconShield }[] = [
  { value: 'MINIMAL', label: 'Min', icon: IconShieldOff },
  { value: 'STANDARD', label: 'Std', icon: IconShield },
  { value: 'ENHANCED', label: 'Enh', icon: IconShieldCheck },
  { value: 'MAXIMUM', label: 'Max', icon: IconShieldLock },
  { value: 'PARANOID', label: '!!!', icon: IconAlertTriangle },
];

function PrivacyDashboard() {
  const dispatch = useAppDispatch();
  const { settings, stats, currentAssessment, isLoading } = useAppSelector(
    (state) => state.privacy
  );
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    const settingsPromise = dispatch(fetchPrivacySettings());
    const statsPromise = dispatch(fetchPrivacyStats());

    // Refresh stats every 5 seconds
    const intervalId = setInterval(() => {
      dispatch(fetchPrivacyStats());
    }, 5000);

    return () => {
      clearInterval(intervalId);
      settingsPromise.abort();
      statsPromise.abort();
    };
  }, [dispatch]);

  const handleOpsecChange = useCallback(
    (value: string) => {
      setUpdateError(null);
      dispatch(setOpsecLevel(value as OpsecLevel))
        .unwrap()
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : String(err);
          setUpdateError(`Failed to set OPSEC level: ${message}`);
        });
    },
    [dispatch]
  );

  const handleSettingToggle = useCallback(
    (key: keyof typeof settings) => {
      setUpdateError(null);
      const newSettings = { ...settings, [key]: !settings[key] };
      dispatch(updatePrivacySettings(newSettings))
        .unwrap()
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : String(err);
          setUpdateError(`Failed to update privacy settings: ${message}`);
        });
    },
    [dispatch, settings]
  );

  const activeProtections = countActiveProtections(settings);
  const totalProtections = 16;
  const protectionPercentage = Math.round((activeProtections / totalProtections) * 100);

  return (
    <Stack gap="md">
      {/* Header */}
      <Group justify="space-between">
        <Group>
          <ThemeIcon
            size="lg"
            variant="gradient"
            gradient={{ from: 'violet', to: 'cyan' }}
          >
            <IconShieldLock size={20} />
          </ThemeIcon>
          <Title order={4}>Dynamic Privacy</Title>
        </Group>
        <Badge
          color={getOpsecLevelColor(settings.opsec_level)}
          variant="filled"
          size="lg"
        >
          {settings.opsec_level}
        </Badge>
      </Group>

      <Text size="xs" c="dimmed">
        {getOpsecLevelDescription(settings.opsec_level)}
      </Text>

      {/* Error notification */}
      {updateError && (
        <Notification
          color="red"
          title="Privacy Update Error"
          onClose={() => setUpdateError(null)}
        >
          {updateError}
        </Notification>
      )}

      {/* OPSEC Level Selector */}
      <Card padding="sm" withBorder>
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            OPSEC Level
          </Text>
          <SegmentedControl
            value={settings.opsec_level}
            onChange={handleOpsecChange}
            data={OPSEC_LEVELS.map((level) => ({
              value: level.value,
              label: (
                <Tooltip label={getOpsecLevelDescription(level.value)}>
                  <Group gap={4}>
                    <level.icon size={14} />
                    <span>{level.label}</span>
                  </Group>
                </Tooltip>
              ),
            }))}
            fullWidth
            color={getOpsecLevelColor(settings.opsec_level)}
          />
        </Stack>
      </Card>

      {/* Protection Ring */}
      <Card padding="md" withBorder>
        <Group justify="space-between" align="flex-start">
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Protection Status
            </Text>
            <Text size="xs" c="dimmed">
              {activeProtections} of {totalProtections} protections active
            </Text>
            <Progress
              value={protectionPercentage}
              color={protectionPercentage >= 80 ? 'green' : protectionPercentage >= 50 ? 'yellow' : 'red'}
              size="lg"
              radius="xl"
              style={{ width: 150 }}
            />
          </Stack>
          <RingProgress
            size={80}
            thickness={8}
            roundCaps
            sections={[
              {
                value: protectionPercentage,
                color: protectionPercentage >= 80 ? 'green' : protectionPercentage >= 50 ? 'yellow' : 'red',
              },
            ]}
            label={
              <Text ta="center" size="xs" fw={700}>
                {protectionPercentage}%
              </Text>
            }
          />
        </Group>
      </Card>

      {/* Current Site Assessment */}
      {currentAssessment && (
        <Transition mounted={!!currentAssessment} transition="slide-down" duration={200}>
          {(styles) => (
            <Card padding="sm" withBorder style={styles}>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" fw={500}>
                    Current Site
                  </Text>
                  <Badge
                    color={currentAssessment.risk_score >= 60 ? 'red' : currentAssessment.risk_score >= 40 ? 'yellow' : 'green'}
                    size="sm"
                  >
                    Risk: {currentAssessment.risk_score}/100
                  </Badge>
                </Group>
                <Text size="xs" ff="monospace">
                  {currentAssessment.domain}
                </Text>
                <Progress
                  value={currentAssessment.risk_score}
                  color={currentAssessment.risk_score >= 60 ? 'red' : currentAssessment.risk_score >= 40 ? 'yellow' : 'green'}
                  size="sm"
                />
                {currentAssessment.risk_factors.length > 0 && (
                  <Text size="xs" c="dimmed">
                    ⚠️ {currentAssessment.risk_factors.map((f) => f.name).join(', ')}
                  </Text>
                )}
              </Stack>
            </Card>
          )}
        </Transition>
      )}

      {/* Stats Grid */}
      <SimpleGrid cols={2} spacing="xs">
        <StatCard
          icon={IconEyeOff}
          label="Trackers Blocked"
          value={stats.trackers_blocked}
          color="violet"
        />
        <StatCard
          icon={IconFingerprint}
          label="Fingerprints Blocked"
          value={stats.fingerprint_attempts_blocked}
          color="cyan"
        />
        <StatCard
          icon={IconCookie}
          label="Cookies Blocked"
          value={stats.cookies_blocked}
          color="orange"
        />
        <StatCard
          icon={IconNetwork}
          label="WebRTC Protected"
          value={stats.webrtc_leaks_prevented}
          color="green"
        />
      </SimpleGrid>

      <Divider label="Protection Settings" labelPosition="left" />

      {/* Quick Toggles */}
      <Stack gap="xs">
        <ProtectionToggle
          icon={IconEyeOff}
          label="Block Trackers"
          description="Block known tracking domains"
          checked={settings.block_trackers}
          onChange={() => handleSettingToggle('block_trackers')}
        />
        <ProtectionToggle
          icon={IconFingerprint}
          label="Anti-Fingerprinting"
          description="Spoof browser fingerprint"
          checked={settings.block_fingerprinting}
          onChange={() => handleSettingToggle('block_fingerprinting')}
        />
        <ProtectionToggle
          icon={IconNetwork}
          label="Block WebRTC"
          description="Prevent IP leaks"
          checked={settings.block_webrtc}
          onChange={() => handleSettingToggle('block_webrtc')}
        />
        <ProtectionToggle
          icon={IconCookie}
          label="Block 3rd Party Cookies"
          description="Block cross-site tracking"
          checked={settings.block_third_party_cookies}
          onChange={() => handleSettingToggle('block_third_party_cookies')}
        />
        <ProtectionToggle
          icon={IconRoute}
          label="Use Tor"
          description="Route traffic through Tor"
          checked={settings.use_tor}
          onChange={() => handleSettingToggle('use_tor')}
          color="grape"
        />
        <ProtectionToggle
          icon={IconLock}
          label="DNS over HTTPS"
          description="Encrypt DNS queries"
          checked={settings.dns_over_https}
          onChange={() => handleSettingToggle('dns_over_https')}
        />
        <ProtectionToggle
          icon={IconRefresh}
          label="Auto-Adjust"
          description="Automatically escalate protection"
          checked={settings.auto_adjust}
          onChange={() => handleSettingToggle('auto_adjust')}
          color="blue"
        />
      </Stack>

      {/* Footer Stats */}
      <Card padding="xs" withBorder>
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            Sites assessed: {stats.sites_assessed}
          </Text>
          <Text size="xs" c="dimmed">
            Auto-escalations: {stats.auto_escalations}
          </Text>
        </Group>
      </Card>
    </Stack>
  );
}

interface StatCardProps {
  icon: typeof IconShield;
  label: string;
  value: number;
  color: string;
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <Paper p="xs" withBorder>
      <Group gap="xs">
        <ThemeIcon size="sm" variant="light" color={color}>
          <Icon size={14} />
        </ThemeIcon>
        <Stack gap={0}>
          <Text size="lg" fw={600}>
            {value.toLocaleString()}
          </Text>
          <Text size="xs" c="dimmed">
            {label}
          </Text>
        </Stack>
      </Group>
    </Paper>
  );
}

interface ProtectionToggleProps {
  icon: typeof IconShield;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  color?: string;
}

function ProtectionToggle({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
  color = 'violet',
}: ProtectionToggleProps) {
  return (
    <Paper p="xs" withBorder>
      <Group justify="space-between">
        <Group gap="sm">
          <ThemeIcon size="sm" variant="light" color={checked ? color : 'gray'}>
            <Icon size={14} />
          </ThemeIcon>
          <Stack gap={0}>
            <Text size="sm">{label}</Text>
            <Text size="xs" c="dimmed">
              {description}
            </Text>
          </Stack>
        </Group>
        <Switch
          checked={checked}
          onChange={onChange}
          color={color}
          size="sm"
        />
      </Group>
    </Paper>
  );
}

function countActiveProtections(settings: PrivacySettings): number {
  let count = 0;
  if (settings.auto_adjust) count++;
  if (settings.block_trackers) count++;
  if (settings.block_fingerprinting) count++;
  if (settings.spoof_canvas) count++;
  if (settings.spoof_webgl) count++;
  if (settings.spoof_audio) count++;
  if (settings.block_webrtc) count++;
  if (settings.spoof_timezone) count++;
  if (settings.spoof_screen) count++;
  if (settings.spoof_user_agent) count++;
  if (settings.spoof_fonts) count++;
  if (settings.block_third_party_cookies) count++;
  if (settings.clear_cookies_on_close) count++;
  if (settings.use_tor) count++;
  if (settings.dns_over_https) count++;
  if (settings.block_javascript) count++;
  return count;
}

export default PrivacyDashboard;
