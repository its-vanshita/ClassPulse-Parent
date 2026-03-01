import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';

interface Props {
  message?: string;
}

export default function LoadingView({ message = 'Loading…' }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{message}</Text>
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
  text: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});
