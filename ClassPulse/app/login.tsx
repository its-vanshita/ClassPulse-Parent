import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { colors } from '../src/theme/colors';
import { spacing, borderRadius, fontSize } from '../src/theme/spacing';

export default function LoginScreen() {
  const { signIn, signUp, enterDemoMode, error } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Enter both email and password');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters');
      return;
    }
    setBusy(true);
    try {
      if (isSignUp) {
        await signUp(email.trim().toLowerCase(), password);
      } else {
        await signIn(email.trim().toLowerCase(), password);
      }
      // Only navigate if auth succeeded (signIn/signUp throw on failure)
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Auth Error', e?.message || 'Please try again');
    } finally {
      setBusy(false);
    }
  };

  const handleDemo = () => {
    enterDemoMode();
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Ionicons name="school" size={48} color={colors.white} />
        <Text style={styles.appName}>ClassPulse</Text>
        <Text style={styles.tagline}>Teacher App</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="teacher@school.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor={colors.textLight}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Min 6 characters"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor={colors.textLight}
        />

        <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={busy}>
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.link}>
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>

        {error ? (
          <Text style={styles.errorText}>
            {typeof error === 'string' && !error.startsWith('{') && error.length < 150
              ? error
              : 'Could not connect to server. Check your internet and try again.'}
          </Text>
        ) : null}

        <TouchableOpacity style={styles.demoBtn} onPress={handleDemo}>
          <Text style={styles.demoText}>Enter Demo Mode</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, justifyContent: 'center', padding: spacing.xl },
  header: { alignItems: 'center', marginBottom: spacing.xxxl },
  appName: { fontSize: fontSize.xxxl, fontWeight: '800', color: colors.white },
  tagline: { fontSize: fontSize.lg, color: colors.primaryLight, marginTop: spacing.xs },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  label: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: fontSize.lg,
    marginBottom: spacing.lg,
    color: colors.textPrimary,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  btnText: { color: colors.white, fontSize: fontSize.md, fontWeight: '700' },
  link: { color: colors.primary, textAlign: 'center', marginTop: spacing.sm, fontSize: fontSize.sm },
  demoBtn: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cardTitle: { fontSize: fontSize.xl, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.lg },
  errorText: { color: colors.danger, fontSize: fontSize.sm, textAlign: 'center', marginTop: spacing.md },
  demoText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
});
