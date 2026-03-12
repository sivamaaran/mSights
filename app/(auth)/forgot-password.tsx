import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { resetPassword } from '@/services/authService';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Colors, Spacing, Typography } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch {
      Alert.alert('Error', 'Could not send reset email. Check the address and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name={sent ? 'checkmark-circle' : 'key'} size={40} color={Colors.white} />
        </View>
        <Text style={styles.title}>{sent ? 'Email Sent!' : 'Reset Password'}</Text>
        <Text style={styles.subtitle}>
          {sent
            ? `A password reset link has been sent to ${email}`
            : 'Enter your work email and we\'ll send you a reset link'}
        </Text>
      </View>

      <View style={styles.form}>
        {!sent ? (
          <>
            <Input
              label="Work Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
              placeholder="you@airline.com"
            />
            <Button title="Send Reset Link" onPress={handleReset} loading={loading} size="lg" />
          </>
        ) : (
          <Button title="Back to Sign In" onPress={() => router.replace('/(auth)/login')} size="lg" />
        )}
        {!sent && (
          <Button
            title="Back to Sign In"
            onPress={() => router.back()}
            variant="ghost"
            size="md"
            style={{ marginTop: Spacing.md }}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.primary },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: { ...Typography.h2, color: Colors.white, marginBottom: Spacing.sm },
  subtitle: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
});
