import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Typography } from '@/constants/theme';

type StatusType =
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'maintenance'
  | 'scheduled'
  | 'in-progress'
  | 'completed'
  | 'delayed'
  | 'cancelled'
  | 'active'
  | 'in-maintenance'
  | 'aog'
  | 'operational'
  | 'closed'
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

const STATUS_CONFIG: Record<StatusType, { bg: string; text: string; label: string }> = {
  available: { bg: '#E8F5E9', text: Colors.success, label: 'Available' },
  occupied: { bg: '#FFEBEE', text: Colors.danger, label: 'Occupied' },
  reserved: { bg: '#FFF3E0', text: Colors.warning, label: 'Reserved' },
  maintenance: { bg: '#F3E5F5', text: '#6A1B9A', label: 'Maintenance' },
  scheduled: { bg: '#E3F2FD', text: Colors.accent, label: 'Scheduled' },
  'in-progress': { bg: '#FFF8E1', text: '#F57F17', label: 'In Progress' },
  completed: { bg: '#E8F5E9', text: Colors.success, label: 'Completed' },
  delayed: { bg: '#FFEBEE', text: Colors.danger, label: 'Delayed' },
  cancelled: { bg: '#FAFAFA', text: Colors.textMuted, label: 'Cancelled' },
  active: { bg: '#E8F5E9', text: Colors.success, label: 'Active' },
  'in-maintenance': { bg: '#FFF3E0', text: Colors.warning, label: 'In Maintenance' },
  aog: { bg: '#FFEBEE', text: Colors.danger, label: 'AOG' },
  operational: { bg: '#E8F5E9', text: Colors.success, label: 'Operational' },
  closed: { bg: '#FAFAFA', text: Colors.textMuted, label: 'Closed' },
  low: { bg: '#E8F5E9', text: Colors.success, label: 'Low' },
  medium: { bg: '#FFF3E0', text: Colors.warning, label: 'Medium' },
  high: { bg: '#FFEBEE', text: Colors.danger, label: 'High' },
  critical: { bg: '#EDE7F6', text: '#4A148C', label: 'Critical' },
};

interface StatusBadgeProps {
  status: StatusType;
  customLabel?: string;
}

export default function StatusBadge({ status, customLabel }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.available;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.label, { color: config.text }]}>
        {customLabel || config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  label: {
    ...Typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
