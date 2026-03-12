import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { logoutUser } from '@/services/authService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

function MenuItem({
  icon,
  label,
  onPress,
  destructive = false,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  destructive?: boolean;
  value?: string;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, destructive && styles.menuIconDanger]}>
        <Ionicons name={icon} size={18} color={destructive ? Colors.danger : Colors.accent} />
      </View>
      <Text style={[styles.menuLabel, destructive && styles.menuLabelDanger]}>{label}</Text>
      <View style={styles.menuRight}>
        {value && <Text style={styles.menuValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, profile } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logoutUser();
            router.replace('/(auth)/login');
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  const roleColor = {
    admin: Colors.danger,
    planner: Colors.accent,
    technician: Colors.warning,
    viewer: Colors.textMuted,
  }[profile?.role || 'viewer'];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {(profile?.displayName || user?.email || 'U')[0].toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{profile?.displayName || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: roleColor + '20' }]}>
          <Text style={[styles.roleText, { color: roleColor }]}>
            {profile?.role?.toUpperCase() || 'VIEWER'}
          </Text>
        </View>
        {profile?.station && (
          <View style={styles.stationRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.station}>{profile.station}</Text>
          </View>
        )}
      </View>

      {/* Account Info */}
      <Text style={styles.sectionHeader}>Account</Text>
      <Card padding={0}>
        <MenuItem icon="person-outline" label="Display Name" value={profile?.displayName || '—'} />
        <View style={styles.divider} />
        <MenuItem icon="mail-outline" label="Email" value={user?.email || '—'} />
        <View style={styles.divider} />
        <MenuItem icon="location-outline" label="Station" value={profile?.station || '—'} />
        <View style={styles.divider} />
        <MenuItem icon="shield-checkmark-outline" label="Role" value={profile?.role || 'viewer'} />
      </Card>

      {/* App Info */}
      <Text style={styles.sectionHeader}>Application</Text>
      <Card padding={0}>
        <MenuItem icon="airplane-outline" label="mSights MRO Scheduler" value="v1.0.0" />
        <View style={styles.divider} />
        <MenuItem icon="flame-outline" label="Firebase Backend" value="Connected" />
        <View style={styles.divider} />
        <MenuItem icon="globe-outline" label="Platform" value="Web · iOS · Android" />
      </Card>

      {/* Sign Out */}
      <Button
        title={loggingOut ? 'Signing out...' : 'Sign Out'}
        onPress={handleLogout}
        variant="danger"
        size="lg"
        loading={loggingOut}
        style={{ marginTop: Spacing.lg }}
      />

      <Text style={styles.footer}>
        mSights MRO Scheduler © {new Date().getFullYear()}{'\n'}
        Built for Aviation MRO Planning Teams
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxl },
  header: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: Colors.white },
  name: { ...Typography.h3, color: Colors.white, marginBottom: 4 },
  email: { ...Typography.body, color: Colors.textMuted, marginBottom: Spacing.sm },
  roleBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  roleText: { ...Typography.label, fontWeight: '700', letterSpacing: 1 },
  stationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  station: { ...Typography.body, color: Colors.textMuted },
  sectionHeader: {
    ...Typography.label,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.surfaceDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: { backgroundColor: '#FFEBEE' },
  menuLabel: { ...Typography.body, color: Colors.textPrimary, flex: 1 },
  menuLabelDanger: { color: Colors.danger },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  menuValue: { ...Typography.caption, color: Colors.textMuted },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 64 },
  footer: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
    lineHeight: 18,
  },
});
