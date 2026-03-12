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
import {
  subscribeToHangars,
  addHangar,
  updateHangar,
  deleteHangar,
  Hangar,
} from '@/services/hangarService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import StatusBadge from '@/components/ui/StatusBadge';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

const STATUSES: Hangar['status'][] = ['operational', 'maintenance', 'closed'];
const AC_TYPES = ['B737', 'B777', 'A320', 'A330', 'A380', 'B787', 'A350', 'Multiple'];

function HangarFormModal({
  visible,
  onClose,
  editHangar,
}: {
  visible: boolean;
  onClose: () => void;
  editHangar?: Hangar | null;
}) {
  const blank = { name: '', code: '', station: '', totalSlots: '4', description: '', status: 'operational' as Hangar['status'] };
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editHangar) {
      setForm({
        name: editHangar.name,
        code: editHangar.code,
        station: editHangar.station,
        totalSlots: String(editHangar.totalSlots),
        description: editHangar.description,
        status: editHangar.status,
      });
    } else {
      setForm(blank);
    }
    setErrors({});
  }, [visible, editHangar]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.code.trim()) e.code = 'Code is required';
    if (!form.station.trim()) e.station = 'Station is required';
    if (!form.totalSlots || isNaN(Number(form.totalSlots))) e.totalSlots = 'Valid number required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = { ...form, totalSlots: Number(form.totalSlots) };
      if (editHangar?.id) {
        await updateHangar(editHangar.id, data);
      } else {
        await addHangar(data);
      }
      onClose();
    } catch {
      Alert.alert('Error', 'Could not save hangar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={modalStyles.container}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>{editHangar ? 'Edit Hangar' : 'Add Hangar'}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={modalStyles.body}>
          <Input label="Hangar Name" value={form.name} onChangeText={v => update('name', v)} error={errors.name} placeholder="e.g. Hangar Alpha" />
          <Input label="Hangar Code" value={form.code} onChangeText={v => update('code', v.toUpperCase())} error={errors.code} placeholder="e.g. HGR-A" autoCapitalize="characters" />
          <Input label="Station / Airport" value={form.station} onChangeText={v => update('station', v.toUpperCase())} error={errors.station} placeholder="e.g. SIN" autoCapitalize="characters" />
          <Input label="Total Slots" value={form.totalSlots} onChangeText={v => update('totalSlots', v)} keyboardType="number-pad" error={errors.totalSlots} placeholder="4" />
          <Input label="Description (optional)" value={form.description} onChangeText={v => update('description', v)} multiline numberOfLines={3} placeholder="Notes about this hangar..." />

          <Text style={modalStyles.label}>Status</Text>
          <View style={modalStyles.chipRow}>
            {STATUSES.map(s => (
              <TouchableOpacity
                key={s}
                style={[modalStyles.chip, form.status === s && modalStyles.chipActive]}
                onPress={() => update('status', s)}
              >
                <Text style={[modalStyles.chipText, form.status === s && modalStyles.chipTextActive]}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button title={editHangar ? 'Save Changes' : 'Add Hangar'} onPress={handleSave} loading={loading} size="lg" style={{ marginTop: Spacing.md }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function HangarsScreen() {
  const [hangars, setHangars] = useState<Hangar[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editHangar, setEditHangar] = useState<Hangar | null>(null);

  useEffect(() => subscribeToHangars(setHangars), []);

  const handleDelete = (h: Hangar) => {
    Alert.alert('Delete Hangar', `Remove "${h.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteHangar(h.id!) },
    ]);
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Hangars</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => { setEditHangar(null); setShowModal(true); }}
        >
          <Ionicons name="add" size={22} color={Colors.white} />
          <Text style={styles.addText}>Add Hangar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {hangars.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="business-outline" size={56} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Hangars Yet</Text>
            <Text style={styles.emptyText}>Add your first hangar to start scheduling</Text>
            <Button title="Add First Hangar" onPress={() => setShowModal(true)} style={{ marginTop: Spacing.md }} />
          </View>
        ) : (
          hangars.map(h => (
            <Card key={h.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.codeBox}>
                  <Text style={styles.code}>{h.code}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.hangarName}>{h.name}</Text>
                  <View style={styles.row}>
                    <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
                    <Text style={styles.station}>{h.station}</Text>
                  </View>
                </View>
                <StatusBadge status={h.status} />
              </View>

              <View style={styles.slotRow}>
                {Array.from({ length: h.totalSlots }).map((_, i) => (
                  <View key={i} style={styles.slotBox}>
                    <Ionicons name="airplane" size={12} color={Colors.textMuted} />
                    <Text style={styles.slotNum}>{i + 1}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.slotCount}>{h.totalSlots} slots · {h.description || 'No description'}</Text>

              <View style={styles.actions}>
                <Button title="Edit" onPress={() => { setEditHangar(h); setShowModal(true); }} variant="ghost" size="sm" />
                <Button title="Delete" onPress={() => handleDelete(h)} variant="danger" size="sm" />
              </View>
            </Card>
          ))
        )}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      <HangarFormModal visible={showModal} onClose={() => setShowModal(false)} editHangar={editHangar} />
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
  list: { padding: Spacing.lg },
  card: {},
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  codeBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  code: { ...Typography.label, color: Colors.white, fontWeight: '700', fontSize: 12 },
  cardInfo: { flex: 1 },
  hangarName: { ...Typography.h4, color: Colors.textPrimary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  station: { ...Typography.caption, color: Colors.textMuted },
  slotRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: Spacing.sm },
  slotBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.surfaceDark,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  slotNum: { ...Typography.caption, color: Colors.textMuted, fontSize: 9 },
  slotCount: { ...Typography.caption, color: Colors.textMuted, marginBottom: Spacing.sm },
  actions: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'flex-end' },
  empty: { alignItems: 'center', paddingVertical: 80, gap: Spacing.sm },
  emptyTitle: { ...Typography.h3, color: Colors.textPrimary },
  emptyText: { ...Typography.body, color: Colors.textMuted, textAlign: 'center' },
});

const modalStyles = StyleSheet.create({
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
  label: { ...Typography.label, color: Colors.textSecondary, marginBottom: Spacing.sm },
  chipRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { ...Typography.label, color: Colors.textSecondary },
  chipTextActive: { color: Colors.white },
});
