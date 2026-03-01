import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import HomeScreen from '../screens/HomeScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import PerformanceScreen from '../screens/PerformanceScreen';
import NoticesScreen from '../screens/NoticesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export default function ParentTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="event" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Performance"
        component={PerformanceScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="bar-chart" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Notices"
        component={NoticesScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="notifications" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="person" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}