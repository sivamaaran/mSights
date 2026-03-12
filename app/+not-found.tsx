import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Page Not Found</Text>
      <Link href="/(tabs)/dashboard" style={styles.link}>
        Go to Dashboard
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  title: { ...Typography.h2, color: Colors.textPrimary, marginBottom: Spacing.lg },
  link: { ...Typography.body, color: Colors.accent },
});
