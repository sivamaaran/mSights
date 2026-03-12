import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import {
  subscribeToSchedules,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  MaintenanceSchedule,
  MaintenanceType,
  ScheduleStatus,
} from '@/services/schedulerService';
import { subscribeToHangars, Hangar } from '@/services/hangarService';
import { subscribeToAircraft, Aircraft } from '@/services/aircraftService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import StatusBadge from '@/components/ui/StatusBadge';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

const MAINT_TYPES: MaintenanceType[] = ['A-Check', 'B-Check', 'C-Check', 'D-Check', 'Line Maintenance', 'Engine Change', 'AOG', 'Other'];
const PRIORITIES: MaintenanceSchedule['priority'][] = ['low', 'medium', 'high', 'critical'];
const STATUSES: ScheduleStatus[] = ['scheduled', 'in-progress', 'completed', 'delayed', 'cancelled'];

function ChipSelector<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={{ marginBottom: Spacing.md }}>
      <Text style={chipStyles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={chipStyles.row}>
          {options.map(o => (
            <TouchableOpacity
              key={o}
              style={[chipStyles.chip, value === o && chipStyles.active]}
              onPress={() => onChange(o)}
            >
              <Text style={[chipStyles.text, value === o && chipStyles.activeText]}>{o}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  label: { ...Typography.label, color: Colors.textSecondary, marginBottom: Spacing.sm },
  row: { flexDirection: 'row', gap: Spacing.sm },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  active: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  text: { ...Typography.label, color: Colors.textSecondary },
  activeText: { color: Colors.white },
});

function ScheduleModal({
  visible,
  onClose,
  editSchedule,
  hangars,
  aircraft,
  currentUserId,
}: {
  visible: boolean;
  onClose: () => void;
  editSchedule?: MaintenanceSchedule | null;
  hangars: Hangar[];
  aircraft: Aircraft[];
  currentUserId: string;
}) {
  const blank = {
    aircraftId: '',
    aircraftReg: '',
    aircraftType: '',
    hangarId: '',
    hangarName: '',
    slotId: '',
    slotNumber: '',
    maintenanceType: 'A-Check' as MaintenanceType,
    status: 'scheduled' as ScheduleStatus,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    estimatedManHours: '',
    assignedTeam: '',
    leadTechnician: '',
    description: '',
    workOrderNumber: '',
    priority: 'medium' as MaintenanceSchedule['priority'],
    notes: '',
  };
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editSchedule) {
      setForm({
        aircraftId: editSchedule.aircraftId,
        aircraftReg: editSchedule.aircraftReg,
        aircraftType: editSchedule.aircraftType,
        hangarId: editSchedule.hangarId,
        hangarName: editSchedule.hangarName,
        slotId: editSchedule.slotId,
        slotNumber: editSchedule.slotNumber,
        maintenanceType: editSchedule.maintenanceType,
        status: editSchedule.status,
        startDate: editSchedule.startDate instanceof Timestamp
          ? editSchedule.startDate.toDate().toISOString().split('T')[0]
          : new Date(editSchedule.startDate as any).toISOString().split('T')[0],
        endDate: editSchedule.endDate instanceof Timestamp
          ? editSchedule.endDate.toDate().toISOString().split('T')[0]
          : new Date(editSchedule.endDate as any).toISOString().split('T')[0],
        estimatedManHours: String(editSchedule.estimatedManHours),
        assignedTeam: editSchedule.assignedTeam,
        leadTechnician: editSchedule.leadTechnician,
        description: editSchedule.description,
        workOrderNumber: editSchedule.workOrderNumber,
        priority: editSchedule.priority,
        notes: editSchedule.notes,
      });
    } else {
      setForm(blank);
    }
    setErrors({});
  }, [visible, editSchedule]);

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const selectAircraft = (ac: Aircraft) => {
    setForm(p => ({
      ...p,
      aircraftId: ac.id || '',
      aircraftReg: ac.registration,
      aircraftType: ac.type,
    }));
  };

  const selectHangar = (h: Hangar) => {
    setForm(p => ({
      ...p,
      hangarId: h.id || '',
      hangarName: h.name,
      slotNumber: '',
      slotId: '',
    }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.aircraftReg.trim()) e.aircraft = 'Select an aircraft';
    if (!form.hangarId) e.hangar = 'Select a hangar';
    if (!form.slotNumber.trim()) e.slot = 'Enter slot number';
    if (!form.startDate) e.startDate = 'Start date required';
    if (!form.endDate) e.endDate = 'End date required';
    if (!form.workOrderNumber.trim()) e.workOrder = 'Work order number required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data: Omit<MaintenanceSchedule, 'id' | 'createdAt' | 'updatedAt'> = {
        aircraftId: form.aircraftId,
        aircraftReg: form.aircraftReg,
        aircraftType: form.aircraftType,
        hangarId: form.hangarId,
        hangarName: form.hangarName,
        slotId: form.slotId,
        slotNumber: form.slotNumber,
        maintenanceType: form.maintenanceType,
        status: form.status,
        startDate: Timestamp.fromDate(new Date(form.startDate)),
        endDate: Timestamp.fromDate(new Date(form.endDate)),
        estimatedManHours: Number(form.estimatedManHours) || 0,
        assignedTeam: form.assignedTeam,
        leadTechnician: form.leadTechnician,
        description: form.description,
        workOrderNumber: form.workOrderNumber,
        priority: form.priority,
        notes: form.notes,
        createdBy: currentUserId,
      };
      if (editSchedule?.id) {
        await updateSchedule(editSchedule.id, data);
      } else {
        await addSchedule(data);
      }
      onClose();
    } catch {
      Alert.alert('Error', 'Could not save schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedHangar = hangars.find(h => h.id === form.hangarId);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={mStyles.container}>
        <View style={mStyles.header}>
          <Text style={mStyles.title}>{editSchedule ? 'Edit Work Order' : 'New Work Order'}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={mStyles.body}>
          {/* Aircraft selection */}
          <Text style={mStyles.sectionLabel}>Aircraft</Text>
          {errors.aircraft && <Text style={mStyles.error}>{errors.aircraft}</Text>}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {aircraft.map(ac => (
                <TouchableOpacity
                  key={ac.id}
                  style={[mStyles.selectChip, form.aircraftReg === ac.registration && mStyles.selectChipActive]}
                  onPress={() => selectAircraft(ac)}
                >
                  <Text style={[mStyles.selectChipText, form.aircraftReg === ac.registration && mStyles.selectChipTextActive]}>
                    {ac.registration}
                  </Text>
                  <Text style={mStyles.selectChipSub}>{ac.type}</Text>
                </TouchableOpacity>
              ))}
              {aircraft.length === 0 && <Text style={{ color: Colors.textMuted }}>No aircraft found</Text>}
            </View>
          </ScrollView>

          {/* Hangar selection */}
          <Text style={mStyles.sectionLabel}>Hangar</Text>
          {errors.hangar && <Text style={mStyles.error}>{errors.hangar}</Text>}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.sm }}>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {hangars.map(h => (
                <TouchableOpacity
                  key={h.id}
                  style={[mStyles.selectChip, form.hangarId === h.id && mStyles.selectChipActive]}
                  onPress={() => selectHangar(h)}
                >
                  <Text style={[mStyles.selectChipText, form.hangarId === h.id && mStyles.selectChipTextActive]}>{h.code}</Text>
                  <Text style={mStyles.selectChipSub}>{h.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Input
            label="Slot Number"
            value={form.slotNumber}
            onChangeText={v => update('slotNumber', v.toUpperCase())}
            placeholder={selectedHangar ? `e.g. ${selectedHangar.code}-01` : 'Select hangar first'}
            error={errors.slot}
            autoCapitalize="characters"
          />
          <Input label="Work Order Number" value={form.workOrderNumber} onChangeText={v => update('workOrderNumber', v)} placeholder="e.g. WO-2024-001" error={errors.workOrder} />

          <ChipSelector label="Maintenance Type" options={MAINT_TYPES} value={form.maintenanceType} onChange={v => update('maintenanceType', v)} />
          <ChipSelector label="Priority" options={PRIORITIES} value={form.priority} onChange={v => update('priority', v)} />
          <ChipSelector label="Status" options={STATUSES} value={form.status} onChange={v => update('status', v)} />

          <Input label="Start Date (YYYY-MM-DD)" value={form.startDate} onChangeText={v => update('startDate', v)} placeholder="2024-01-15" error={errors.startDate} keyboardType="numeric" />
          <Input label="End Date (YYYY-MM-DD)" value={form.endDate} onChangeText={v => update('endDate', v)} placeholder="2024-01-20" error={errors.endDate} keyboardType="numeric" />
          <Input label="Estimated Man-Hours" value={form.estimatedManHours} onChangeText={v => update('estimatedManHours', v)} keyboardType="number-pad" placeholder="e.g. 240" />
          <Input label="Assigned Team" value={form.assignedTeam} onChangeText={v => update('assignedTeam', v)} placeholder="e.g. Team Bravo" />
          <Input label="Lead Technician" value={form.leadTechnician} onChangeText={v => update('leadTechnician', v)} placeholder="e.g. John Smith (AME)" />
          <Input label="Description" value={form.description} onChangeText={v => update('description', v)} multiline numberOfLines={3} placeholder="Scope of work..." />
          <Input label="Notes" value={form.notes} onChangeText={v => update('notes', v)} multiline numberOfLines={2} placeholder="Additional notes..." />

          <Button title={editSchedule ? 'Save Changes' : 'Create Work Order'} onPress={handleSave} loading={loading} size="lg" style={{ marginTop: Spacing.sm }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function SchedulerScreen() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [hangars, setHangars] = useState<Hangar[]>([]);
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editSchedule, setEditSchedule] = useState<MaintenanceSchedule | null>(null);
  const [filterStatus, setFilterStatus] = useState<ScheduleStatus | 'all'>('all');

  useEffect(() => {
    const u1 = subscribeToSchedules(setSchedules);
    const u2 = subscribeToHangars(setHangars);
    const u3 = subscribeToAircraft(setAircraft);
    return () => { u1(); u2(); u3(); };
  }, []);

  const filtered = filterStatus === 'all' ? schedules : schedules.filter(s => s.status === filterStatus);

  const handleDelete = (s: MaintenanceSchedule) => {
    Alert.alert('Delete Work Order', `Remove WO ${s.workOrderNumber}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSchedule(s.id!) },
    ]);
  };

  const formatDate = (d: any) => {
    if (!d) return '—';
    const date = d instanceof Timestamp ? d.toDate() : new Date(d);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Scheduler</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => { setEditSchedule(null); setShowModal(true); }}
        >
          <Ionicons name="add" size={22} color={Colors.white} />
          <Text style={styles.addText}>New WO</Text>
        </TouchableOpacity>
      </View>

      {/* Filter bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(['all', ...STATUSES] as (ScheduleStatus | 'all')[]).map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.filterChip, filterStatus === s && styles.filterActive]}
              onPress={() => setFilterStatus(s)}
            >
              <Text style={[styles.filterText, filterStatus === s && styles.filterTextActive]}>
                {s === 'all' ? 'All' : s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
                {s !== 'all' && ` (${schedules.filter(sc => sc.status === s).length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={56} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Work Orders</Text>
            <Text style={styles.emptyText}>Create your first maintenance schedule</Text>
            <Button title="New Work Order" onPress={() => setShowModal(true)} style={{ marginTop: Spacing.md }} />
          </View>
        ) : (
          filtered.map(s => (
            <Card key={s.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardLeft}>
                  <Text style={styles.woNum}>{s.workOrderNumber}</Text>
                  <Text style={styles.acReg}>{s.aircraftReg} · {s.aircraftType}</Text>
                  <Text style={styles.hangar}>{s.hangarName} · Slot {s.slotNumber}</Text>
                </View>
                <View style={styles.badges}>
                  <StatusBadge status={s.status} />
                  <StatusBadge status={s.priority} />
                </View>
              </View>

              <View style={styles.typeRow}>
                <View style={styles.typeTag}>
                  <Ionicons name="construct-outline" size={13} color={Colors.accent} />
                  <Text style={styles.typeText}>{s.maintenanceType}</Text>
                </View>
                {s.estimatedManHours > 0 && (
                  <View style={styles.typeTag}>
                    <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
                    <Text style={styles.typeText}>{s.estimatedManHours}h</Text>
                  </View>
                )}
              </View>

              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
                <Text style={styles.dates}>{formatDate(s.startDate)} → {formatDate(s.endDate)}</Text>
              </View>

              {s.assignedTeam ? (
                <View style={styles.dateRow}>
                  <Ionicons name="people-outline" size={13} color={Colors.textMuted} />
                  <Text style={styles.dates}>{s.assignedTeam} · {s.leadTechnician}</Text>
                </View>
              ) : null}

              <View style={styles.actions}>
                <Button title="Edit" onPress={() => { setEditSchedule(s); setShowModal(true); }} variant="ghost" size="sm" />
                <Button title="Delete" onPress={() => handleDelete(s)} variant="danger" size="sm" />
              </View>
            </Card>
          ))
        )}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      <ScheduleModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        editSchedule={editSchedule}
        hangars={hangars}
        aircraft={aircraft}
        currentUserId={user?.uid || ''}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingTop: 56,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  title: { ...Typography.h2, color: Colors.white },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  addText: { ...Typography.label, color: Colors.white },
  filterBar: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  filterChip: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: BorderRadius.full, marginRight: Spacing.xs, backgroundColor: Colors.surfaceDark },
  filterActive: { backgroundColor: Colors.accent },
  filterText: { ...Typography.caption, color: Colors.textSecondary, fontWeight: '600' },
  filterTextActive: { color: Colors.white },
  list: { padding: Spacing.lg },
  card: {},
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  cardLeft: { flex: 1 },
  woNum: { ...Typography.label, color: Colors.textMuted, fontWeight: '700', fontSize: 11, textTransform: 'uppercase' },
  acReg: { ...Typography.h4, color: Colors.textPrimary },
  hangar: { ...Typography.body, color: Colors.textSecondary },
  badges: { gap: 4, alignItems: 'flex-end' },
  typeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xs },
  typeTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceDark, paddingVertical: 3, paddingHorizontal: 8, borderRadius: BorderRadius.full },
  typeText: { ...Typography.caption, color: Colors.textSecondary },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  dates: { ...Typography.caption, color: Colors.textMuted },
  actions: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'flex-end', marginTop: Spacing.sm },
  empty: { alignItems: 'center', paddingVertical: 80, gap: Spacing.sm },
  emptyTitle: { ...Typography.h3, color: Colors.textPrimary },
  emptyText: { ...Typography.body, color: Colors.textMuted, textAlign: 'center' },
});

const mStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  title: { ...Typography.h3, color: Colors.textPrimary },
  body: { padding: Spacing.lg },
  sectionLabel: { ...Typography.label, color: Colors.textSecondary, marginBottom: Spacing.sm },
  error: { ...Typography.caption, color: Colors.danger, marginBottom: Spacing.xs },
  selectChip: {
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    minWidth: 70,
  },
  selectChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  selectChipText: { ...Typography.label, color: Colors.textPrimary },
  selectChipTextActive: { color: Colors.white },
  selectChipSub: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
});
