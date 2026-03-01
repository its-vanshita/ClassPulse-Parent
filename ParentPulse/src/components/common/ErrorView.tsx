import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, fontSize, borderRadius } from '../../theme/spacing';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorView({
  message = 'Something went wrong',
  onRetry,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.text}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.btn} onPress={onRetry}>
          <Text style={styles.btnText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  text: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  btn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.sm,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: fontSize.md,
  },
});
