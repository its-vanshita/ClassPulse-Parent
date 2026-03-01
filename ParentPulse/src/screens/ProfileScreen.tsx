import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, fontSize, borderRadius } from '../theme/spacing';
import Card from '../components/common/Card';
import InfoRow from '../components/common/InfoRow';
import { mockChild, mockParent } from '../data/mockData';

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {mockChild.name.split(' ').map((w) => w[0]).join('')}
          </Text>
        </View>
        <Text style={styles.name}>{mockChild.name}</Text>
        <Text style={styles.grade}>Grade {mockChild.grade ?? '-'}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Child Details</Text>
        <Card>
          <InfoRow label="Full Name" value={mockChild.name} />
          <InfoRow label="Grade" value={mockChild.grade ?? '-'} />
          {mockChild.rollNumber && <InfoRow label="Roll Number" value={mockChild.rollNumber} />}
        </Card>

        <Text style={styles.sectionTitle}>Institute</Text>
        <Card>
          <InfoRow label="Institute" value={mockChild.institute ?? '-'} />
        </Card>

        <Text style={styles.sectionTitle}>Parent / Guardian</Text>
        <Card>
          <InfoRow label="Name" value={mockParent.name} />
          <InfoRow label="Phone" value={mockParent.phone} />
        </Card>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => Alert.alert('Logout', 'Are you sure?')}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, padding: spacing.lg, paddingTop: 48, alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  avatarText: { color: '#fff', fontSize: fontSize.xxl, fontWeight: '700' },
  name: { color: '#fff', fontSize: fontSize.xl, fontWeight: '700', marginTop: spacing.sm },
  grade: { color: 'rgba(255,255,255,0.7)', fontSize: fontSize.sm, marginTop: 4 },
  content: { padding: spacing.md },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
  logoutBtn: { marginTop: spacing.xl, backgroundColor: colors.dangerLight, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center' },
  logoutText: { color: colors.danger, fontSize: fontSize.md, fontWeight: '700' },
});