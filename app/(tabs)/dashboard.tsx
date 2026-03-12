import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { subscribeToHangars, Hangar } from '@/services/hangarService';
import { subscribeToActiveSchedules, MaintenanceSchedule } from '@/services/schedulerService';
import { subscribeToAircraft, Aircraft } from '@/services/aircraftService';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress?: () => void;
}

function StatCard({ title, value, subtitle, icon, color, onPress }: StatCardProps) {
  return (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

function OccupancyBar({ occupied, total }: { occupied: number; total: number }) {
  const pct = total > 0 ? occupied / total : 0;
  const color = pct > 0.85 ? Colors.danger : pct > 0.6 ? Colors.warning : Colors.success;
  return (
    <View style={styles.occBar}>
      <View style={styles.occBarBg}>
        <View style={[styles.occBarFill, { width: `${pct * 100}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[styles.occPct, { color }]}>{Math.round(pct * 100)}%</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { user, profile } = useAuth();
  const [hangars, setHangars] = useState<Hangar[]>([]);
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const u1 = subscribeToHangars(setHangars);
    const u2 = subscribeToActiveSchedules(setSchedules);
    const u3 = subscribeToAircraft(setAircraft);
    return () => { u1(); u2(); u3(); };
  }, []);

  const activeAircraft = aircraft.filter(a => a.status === 'in-maintenance' || a.status === 'aog').length;
  const operationalHangars = hangars.filter(h => h.status === 'operational').length;
  const totalSlots = hangars.reduce((s, h) => s + h.totalSlots, 0);
  const occupiedSlots = schedules.filter(s => s.status === 'in-progress').length;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
    >
      {/* Header */}
      <View style={styles.headerBg}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.userName}>{profile?.displayName || user?.email?.split('@')[0] || 'Planner'}</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Occupancy summary */}
        <Card style={styles.occupancyCard} padding={Spacing.md}>
          <Text style={styles.sectionTitle}>Overall Hangar Occupancy</Text>
          <OccupancyBar occupied={occupiedSlots} total={totalSlots} />
          <View style={styles.occDetails}>
            <Text style={styles.occDetail}>{occupiedSlots} occupied</Text>
            <Text style={styles.occDetail}>{totalSlots - occupiedSlots} available</Text>
            <Text style={styles.occDetail}>{totalSlots} total slots</Text>
          </View>
        </Card>
      </View>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Active Hangars"
          value={operationalHangars}
          subtitle={`of ${hangars.length} total`}
          icon="business-outline"
          color={Colors.accent}
          onPress={() => router.push('/(tabs)/hangars')}
        />
        <StatCard
          title="In Maintenance"
          value={activeAircraft}
          subtitle="aircraft"
          icon="airplane-outline"
          color={Colors.warning}
          onPress={() => router.push('/(tabs)/aircraft')}
        />
        <StatCard
          title="Scheduled"
          value={schedules.filter(s => s.status === 'scheduled').length}
          subtitle="upcoming tasks"
          icon="calendar-outline"
          color={Colors.success}
          onPress={() => router.push('/(tabs)/scheduler')}
        />
        <StatCard
          title="In Progress"
          value={schedules.filter(s => s.status === 'in-progress').length}
          subtitle="work orders"
          icon="construct-outline"
          color={Colors.dangerLight}
          onPress={() => router.push('/(tabs)/scheduler')}
        />
      </View>

      {/* Hangar occupancy breakdown */}
      <Text style={styles.sectionHeader}>Hangar Status</Text>
      {hangars.length === 0 ? (
        <Card>
          <View style={styles.emptyState}>
            <Ionicons name="business-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No hangars configured yet</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/hangars')}>
              <Text style={styles.emptyAction}>Add Hangars →</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ) : (
        hangars.map(h => {
          const hSchedules = schedules.filter(s => s.hangarId === h.id && s.status === 'in-progress');
          return (
            <Card key={h.id} style={styles.hangarCard}>
              <View style={styles.hangarRow}>
                <View style={styles.hangarInfo}>
                  <Text style={styles.hangarCode}>{h.code}</Text>
                  <Text style={styles.hangarName}>{h.name}</Text>
                  <Text style={styles.hangarStation}>{h.station}</Text>
                </View>
                <StatusBadge status={h.status} />
              </View>
              <OccupancyBar occupied={hSchedules.length} total={h.totalSlots} />
              <Text style={styles.hangarSlots}>{hSchedules.length}/{h.totalSlots} slots occupied</Text>
            </Card>
          );
        })
      )}

      {/* Recent schedules */}
      <Text style={styles.sectionHeader}>Active Work Orders</Text>
      {schedules.length === 0 ? (
        <Card>
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No active work orders</Text>
          </View>
        </Card>
      ) : (
        schedules.slice(0, 5).map(s => (
          <Card key={s.id} style={styles.scheduleCard}>
            <View style={styles.scheduleRow}>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleReg}>{s.aircraftReg}</Text>
                <Text style={styles.scheduleType}>{s.maintenanceType}</Text>
                <Text style={styles.scheduleHangar}>{s.hangarName} · {s.slotNumber}</Text>
              </View>
              <View style={styles.scheduleRight}>
                <StatusBadge status={s.status} />
                <StatusBadge status={s.priority} />
              </View>
            </View>
            <Text style={styles.scheduleDates}>
              {new Date(s.startDate as any).toLocaleDateString('en-GB')} →{' '}
              {new Date(s.endDate as any).toLocaleDateString('en-GB')}
            </Text>
          </Card>
        ))
      )}

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxl },
  headerBg: {
    backgroundColor: Colors.primary,
    paddingTop: 56,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 80,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  greeting: { ...Typography.body, color: Colors.textMuted },
  userName: { ...Typography.h2, color: Colors.white },
  date: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 2 },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  occupancyCard: {
    marginBottom: -60,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionTitle: { ...Typography.h4, color: Colors.textPrimary, marginBottom: Spacing.sm },
  occBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  occBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  occBarFill: { height: '100%', borderRadius: BorderRadius.full },
  occPct: { ...Typography.label, fontWeight: '700', width: 40, textAlign: 'right' },
  occDetails: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.sm },
  occDetail: { ...Typography.caption, color: Colors.textSecondary },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    paddingTop: 80,
    gap: Spacing.sm,
  },
  statCard: {
    width: '47.5%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderLeftWidth: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  statValue: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  statTitle: { ...Typography.label, color: Colors.textPrimary, marginTop: 2 },
  statSubtitle: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  sectionHeader: {
    ...Typography.h3,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  hangarCard: { marginHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  hangarRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  hangarInfo: { flex: 1 },
  hangarCode: { ...Typography.h4, color: Colors.textPrimary },
  hangarName: { ...Typography.body, color: Colors.textSecondary },
  hangarStation: { ...Typography.caption, color: Colors.textMuted },
  hangarSlots: { ...Typography.caption, color: Colors.textMuted, marginTop: Spacing.xs },
  scheduleCard: { marginHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  scheduleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  scheduleInfo: { flex: 1 },
  scheduleReg: { ...Typography.h4, color: Colors.textPrimary },
  scheduleType: { ...Typography.body, color: Colors.textSecondary },
  scheduleHangar: { ...Typography.caption, color: Colors.textMuted },
  scheduleRight: { gap: Spacing.xs },
  scheduleDates: { ...Typography.caption, color: Colors.textMuted, marginTop: Spacing.xs },
  emptyState: { alignItems: 'center', padding: Spacing.xl, gap: Spacing.sm },
  emptyText: { ...Typography.body, color: Colors.textMuted },
  emptyAction: { ...Typography.label, color: Colors.accent },
});
