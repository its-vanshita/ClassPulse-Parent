import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';

interface Props {
  title: string;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
}

export default function SectionHeader({ title, children, rightAction }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {rightAction}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
