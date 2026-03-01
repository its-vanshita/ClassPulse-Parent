import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { TeacherProvider } from '../src/context/TeacherContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AuthProvider>
      <TeacherProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#F5F7FA' },
          }}
        >
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="add-batch"
            options={{
              presentation: 'modal',
              headerShown: true,
              headerTitle: 'New Batch',
              headerStyle: { backgroundColor: '#0D47A1' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="add-student"
            options={{
              presentation: 'modal',
              headerShown: true,
              headerTitle: 'Add Student',
              headerStyle: { backgroundColor: '#0D47A1' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="mark-attendance"
            options={{
              presentation: 'card',
              headerShown: true,
              headerTitle: 'Mark Attendance',
              headerStyle: { backgroundColor: '#0D47A1' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="assign-homework"
            options={{
              presentation: 'modal',
              headerShown: true,
              headerTitle: 'Assign Homework',
              headerStyle: { backgroundColor: '#0D47A1' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="post-notice"
            options={{
              presentation: 'modal',
              headerShown: true,
              headerTitle: 'Post Notice',
              headerStyle: { backgroundColor: '#0D47A1' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="batch-details"
            options={{
              headerShown: true,
              headerTitle: 'Batch Details',
              headerStyle: { backgroundColor: '#0D47A1' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="add-test-results"
            options={{
              presentation: 'modal',
              headerShown: true,
              headerTitle: 'Add Test Results',
              headerStyle: { backgroundColor: '#0D47A1' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="manage-homework"
            options={{
              headerShown: true,
              headerTitle: 'Homework',
              headerStyle: { backgroundColor: '#0D47A1' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="manage-notices"
            options={{
              headerShown: true,
              headerTitle: 'Notices',
              headerStyle: { backgroundColor: '#0D47A1' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="manage-fees"
            options={{
              headerShown: true,
              headerTitle: 'Fee Management',
              headerStyle: { backgroundColor: '#0D47A1' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="create-fee"
            options={{
              presentation: 'modal',
              headerShown: true,
              headerTitle: 'Create Fee',
              headerStyle: { backgroundColor: '#0D47A1' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="record-payment"
            options={{
              presentation: 'modal',
              headerShown: true,
              headerTitle: 'Record Payment',
              headerStyle: { backgroundColor: '#0D47A1' },
              headerTintColor: '#fff',
            }}
          />
        </Stack>
      </TeacherProvider>
    </AuthProvider>
  );
}
