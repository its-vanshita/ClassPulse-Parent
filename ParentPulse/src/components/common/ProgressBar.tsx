import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  progress: number;
  color?: string;
  height?: number;
}

export default function ProgressBar({ progress, color, height = 8 }: Props) {
  const barColor = color ?? (progress >= 85 ? colors.success : progress >= 60 ? colors.warning : colors.danger);

  return (
    <View style={[styles.container, { height }]}> 
      <View style={[styles.fill, { width: `${Math.min(progress, 100)}%`, backgroundColor: barColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 6,
  },
  fill: {
    height: '100%',
    borderRadius: 8,
  },
});