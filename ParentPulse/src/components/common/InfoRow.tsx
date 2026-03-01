import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, fontSize } from '../../theme/spacing';

interface Props {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export default function InfoRow({ label, value, icon }: Props) {
  return (
    <View style={styles.row}>
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <View style={styles.textWrap}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  value: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: '500',
    marginTop: 2,
  },
});
