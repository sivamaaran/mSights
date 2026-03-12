import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { registerUser, UserProfile } from '@/services/authService';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

const ROLES: { label: string; value: UserProfile['role'] }[] = [
  { label: 'MRO Planner', value: 'planner' },
  { label: 'Administrator', value: 'admin' },
  { label: 'Technician', value: 'technician' },
  { label: 'Viewer', value: 'viewer' },
];

export default function RegisterScreen() {
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    station: '',
    role: 'planner' as UserProfile['role'],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (key: string, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.displayName.trim()) e.displayName = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.station.trim()) e.station = 'Station/Base is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await registerUser(form.email.trim(), form.password, form.displayName.trim(), form.role, form.station.trim());
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      const msg =
        err.code === 'auth/email-already-in-use'
          ? 'This email is already registered.'
          : 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="airplane" size={36} color={Colors.white} />
          </View>
          <Text style={styles.appName}>mSights</Text>
          <Text style={styles.tagline}>Create your account</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            value={form.displayName}
            onChangeText={v => update('displayName', v)}
            icon="person-outline"
            error={errors.displayName}
            placeholder="John Smith"
          />
          <Input
            label="Work Email"
            value={form.email}
            onChangeText={v => update('email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail-outline"
            error={errors.email}
            placeholder="you@airline.com"
          />
          <Input
            label="Station / Base"
            value={form.station}
            onChangeText={v => update('station', v)}
            icon="location-outline"
            error={errors.station}
            placeholder="e.g. SIN, LHR, DXB"
            autoCapitalize="characters"
          />

          {/* Role selector */}
          <Text style={styles.roleLabel}>Role</Text>
          <View style={styles.roleGrid}>
            {ROLES.map(r => (
              <Button
                key={r.value}
                title={r.label}
                onPress={() => update('role', r.value)}
                variant={form.role === r.value ? 'primary' : 'ghost'}
                size="sm"
                style={styles.roleButton}
              />
            ))}
          </View>

          <Input
            label="Password"
            value={form.password}
            onChangeText={v => update('password', v)}
            isPassword
            icon="lock-closed-outline"
            error={errors.password}
            placeholder="Min. 8 characters"
          />
          <Input
            label="Confirm Password"
            value={form.confirmPassword}
            onChangeText={v => update('confirmPassword', v)}
            isPassword
            icon="lock-closed-outline"
            error={errors.confirmPassword}
            placeholder="Re-enter password"
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            size="lg"
            style={{ marginTop: Spacing.sm }}
          />

          <Button
            title="Already have an account? Sign In"
            onPress={() => router.back()}
            variant="ghost"
            size="md"
            style={{ marginTop: Spacing.md }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flexGrow: 1 },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  appName: { fontSize: 28, fontWeight: '800', color: Colors.white },
  tagline: { ...Typography.body, color: Colors.textMuted, marginTop: 2 },
  form: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  roleLabel: { ...Typography.label, color: Colors.textSecondary, marginBottom: Spacing.sm },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  roleButton: { marginRight: 0, marginBottom: 0 },
});
