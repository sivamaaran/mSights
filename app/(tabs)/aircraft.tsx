import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  subscribeToAircraft,
  addAircraft,
  updateAircraft,
  deleteAircraft,
  Aircraft,
} from '@/services/aircraftService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import StatusBadge from '@/components/ui/StatusBadge';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

const AC_STATUSES: Aircraft['status'][] = ['active', 'in-maintenance', 'aog', 'retired'];
const AC_TYPES = ['Boeing 737', 'Boeing 737 MAX', 'Boeing 777', 'Boeing 787', 'Airbus A320', 'Airbus A320neo', 'Airbus A330', 'Airbus A350', 'Airbus A380', 'Other'];

function AircraftModal({
  visible,
  onClose,
  editAircraft,
}: {
  visible: boolean;
  onClose: () => void;
  editAircraft?: Aircraft | null;
}) {
  const blank = {
    registration: '',
    type: '',
    series: '',
    airline: '',
    manufacturer: 'Boeing',
    yearOfManufacture: new Date().getFullYear().toString(),
    msn: '',
    engineType: '',
    status: 'active' as Aircraft['status'],
    totalFlightHours: '',
    totalCycles: '',
    notes: '',
  };
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editAircraft) {
      setForm({
        registration: editAircraft.registration,
        type: editAircraft.type,
        series: editAircraft.series,
        airline: editAircraft.airline,
        manufacturer: editAircraft.manufacturer,
        yearOfManufacture: String(editAircraft.yearOfManufacture),
        msn: editAircraft.msn,
        engineType: editAircraft.engineType,
        status: editAircraft.status,
        totalFlightHours: String(editAircraft.totalFlightHours),
        totalCycles: String(editAircraft.totalCycles),
        notes: editAircraft.notes,
      });
    } else {
      setForm(blank);
    }
    setErrors({});
  }, [visible, editAircraft]);

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.registration.trim()) e.registration = 'Registration required';
    if (!form.type.trim()) e.type = 'Aircraft type required';
    if (!form.airline.trim()) e.airline = 'Airline/operator required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = {
        ...form,
        yearOfManufacture: Number(form.yearOfManufacture) || 2000,
        totalFlightHours: Number(form.totalFlightHours) || 0,
        totalCycles: Number(form.totalCycles) || 0,
      };
      if (editAircraft?.id) {
        await updateAircraft(editAircraft.id, data);
      } else {
        await addAircraft(data);
      }
      onClose();
    } catch {
      Alert.alert('Error', 'Could not save aircraft. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={mStyles.container}>
        <View style={mStyles.header}>
          <Text style={mStyles.title}>{editAircraft ? 'Edit Aircraft' : 'Add Aircraft'}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={mStyles.body}>
          <Input label="Registration" value={form.registration} onChangeText={v => update('registration', v.toUpperCase())} placeholder="e.g. 9V-SKA" autoCapitalize="characters" error={errors.registration} />
          <Input label="Aircraft Type" value={form.type} onChangeText={v => update('type', v)} placeholder="e.g. B737-800" error={errors.type} />
          <Input label="Series / Variant" value={form.series} onChangeText={v => update('series', v)} placeholder="e.g. -800, neo, MAX 8" />
          <Input label="Airline / Operator" value={form.airline} onChangeText={v => update('airline', v)} placeholder="e.g. Singapore Airlines" error={errors.airline} />
          <Input label="Manufacturer" value={form.manufacturer} onChangeText={v => update('manufacturer', v)} placeholder="Boeing / Airbus" />
          <Input label="MSN (Manufacturer Serial Number)" value={form.msn} onChangeText={v => update('msn', v)} placeholder="e.g. 41234" />
          <Input label="Engine Type" value={form.engineType} onChangeText={v => update('engineType', v)} placeholder="e.g. CFM56-7B27" />
          <Input label="Year of Manufacture" value={form.yearOfManufacture} onChangeText={v => update('yearOfManufacture', v)} keyboardType="number-pad" placeholder="2018" />
          <Input label="Total Flight Hours" value={form.totalFlightHours} onChangeText={v => update('totalFlightHours', v)} keyboardType="number-pad" placeholder="e.g. 42500" />
          <Input label="Total Cycles" value={form.totalCycles} onChangeText={v => update('totalCycles', v)} keyboardType="number-pad" placeholder="e.g. 18200" />

          <Text style={mStyles.label}>Status</Text>
          <View style={mStyles.chipRow}>
            {AC_STATUSES.map(s => (
              <TouchableOpacity
                key={s}
                style={[mStyles.chip, form.status === s && mStyles.chipActive]}
                onPress={() => update('status', s)}
              >
                <Text style={[mStyles.chipText, form.status === s && mStyles.chipTextActive]}>
                  {s === 'aog' ? 'AOG' : s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input label="Notes" value={form.notes} onChangeText={v => update('notes', v)} multiline numberOfLines={3} placeholder="Additional notes..." />

          <Button title={editAircraft ? 'Save Changes' : 'Add Aircraft'} onPress={handleSave} loading={loading} size="lg" style={{ marginTop: Spacing.sm }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function AircraftScreen() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editAircraft, setEditAircraft] = useState<Aircraft | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => subscribeToAircraft(setAircraft), []);

  const filtered = aircraft.filter(
    a =>
      a.registration.toLowerCase().includes(search.toLowerCase()) ||
      a.type.toLowerCase().includes(search.toLowerCase()) ||
      a.airline.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (a: Aircraft) => {
    Alert.alert('Delete Aircraft', `Remove ${a.registration}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAircraft(a.id!) },
    ]);
  };

  const statusCounts = {
    active: aircraft.filter(a => a.status === 'active').length,
    'in-maintenance': aircraft.filter(a => a.status === 'in-maintenance').length,
    aog: aircraft.filter(a => a.status === 'aog').length,
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Aircraft</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => { setEditAircraft(null); setShowModal(true); }}
        >
          <Ionicons name="add" size={22} color={Colors.white} />
          <Text style={styles.addText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{statusCounts.active}</Text>
          <Text style={styles.summaryLabel}>Active</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: Colors.warning }]}>{statusCounts['in-maintenance']}</Text>
          <Text style={styles.summaryLabel}>In MRO</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: Colors.danger }]}>{statusCounts.aog}</Text>
          <Text style={styles.summaryLabel}>AOG</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{aircraft.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by registration, type, airline..."
          placeholderTextColor={Colors.textMuted}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="airplane-outline" size={56} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>{search ? 'No Results' : 'No Aircraft Yet'}</Text>
            <Text style={styles.emptyText}>{search ? 'Try a different search' : 'Add aircraft to your registry'}</Text>
            {!search && <Button title="Add Aircraft" onPress={() => setShowModal(true)} style={{ marginTop: Spacing.md }} />}
          </View>
        ) : (
          filtered.map(a => (
            <Card key={a.id}>
              <View style={styles.acHeader}>
                <View style={styles.acIcon}>
                  <Ionicons name="airplane" size={20} color={Colors.white} />
                </View>
                <View style={styles.acInfo}>
                  <Text style={styles.acReg}>{a.registration}</Text>
                  <Text style={styles.acType}>{a.type} {a.series}</Text>
                  <Text style={styles.acAirline}>{a.airline}</Text>
                </View>
                <StatusBadge status={a.status} />
              </View>

              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>MSN</Text>
                  <Text style={styles.detailValue}>{a.msn || '—'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Year</Text>
                  <Text style={styles.detailValue}>{a.yearOfManufacture || '—'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Flt Hrs</Text>
                  <Text style={styles.detailValue}>{a.totalFlightHours?.toLocaleString() || '—'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Cycles</Text>
                  <Text style={styles.detailValue}>{a.totalCycles?.toLocaleString() || '—'}</Text>
                </View>
              </View>

              {a.engineType ? (
                <Text style={styles.engine}>Engines: {a.engineType}</Text>
              ) : null}

              <View style={styles.actions}>
                <Button title="Edit" onPress={() => { setEditAircraft(a); setShowModal(true); }} variant="ghost" size="sm" />
                <Button title="Delete" onPress={() => handleDelete(a)} variant="danger" size="sm" />
              </View>
            </Card>
          ))
        )}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      <AircraftModal visible={showModal} onClose={() => setShowModal(false)} editAircraft={editAircraft} />
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
  summary: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryValue: { ...Typography.h3, color: Colors.white },
  summaryLabel: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  list: { padding: Spacing.lg },
  acHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  acIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acInfo: { flex: 1 },
  acReg: { ...Typography.h4, color: Colors.textPrimary },
  acType: { ...Typography.body, color: Colors.textSecondary },
  acAirline: { ...Typography.caption, color: Colors.textMuted },
  detailGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  detailItem: { flex: 1, backgroundColor: Colors.surfaceDark, borderRadius: 8, padding: Spacing.sm, alignItems: 'center' },
  detailLabel: { ...Typography.caption, color: Colors.textMuted },
  detailValue: { ...Typography.label, color: Colors.textPrimary, marginTop: 2 },
  engine: { ...Typography.caption, color: Colors.textMuted, marginBottom: Spacing.sm },
  actions: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'flex-end' },
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
  label: { ...Typography.label, color: Colors.textSecondary, marginBottom: Spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
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
