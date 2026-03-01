// App.tsx is not used when expo-router is the entry point.
// The main entry is defined by "main": "expo-router/entry" in package.json.
// Navigation is handled by app/_layout.tsx and app/(tabs)/_layout.tsx.

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import ParentTabs from './src/navigation/ParentTabs';

export default function App() {
  return (
    <NavigationContainer>
      <ParentTabs />
    </NavigationContainer>
  );
}