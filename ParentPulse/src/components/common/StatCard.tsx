import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';

interface Props {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
  style?: ViewStyle;
}

export default function StatCard({ label, value, color = colors.primary, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.accent, { backgroundColor: color }]} />
      <View style={styles.content}>
        <Text style={[styles.value, { color }]}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  accent: {
    height: 4,
  },
  content: {
    padding: spacing.md,
    alignItems: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
