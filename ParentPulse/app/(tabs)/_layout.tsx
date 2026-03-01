import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

const PRIMARY = '#1A73E8';
const INACTIVE = '#9CA3AF';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: INACTIVE,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          backgroundColor: '#FFFFFF',
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="performance"
        options={{
          title: 'Performance',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="chart.bar.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notices"
        options={{
          title: 'Notices',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="bell.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="fees"
        options={{
          title: 'Fees',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="creditcard.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="person.fill" color={color} />,
        }}
      />
      {/* Hide explore from bottom tabs */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
