import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import NoticeCard from '../components/notices/NoticeCard';
import { mockNotices } from '../data/mockData';

export default function NoticesScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={mockNotices}
        keyExtractor={(item) => item.noticeId}
        renderItem={({ item }) => <NoticeCard notice={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md },
});