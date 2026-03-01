import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '@/src/theme/colors';
import { spacing, fontSize, borderRadius } from '@/src/theme/spacing';
import { useAuth } from '@/src/context/AuthContext';

export default function LoginScreen() {
  const { signIn, signUp, enterDemoMode, error } = useAuth();

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
    } catch {
      // error state is handled by context
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.logo}>ParentPulse</Text>
        <Text style={styles.tagline}>Stay connected with your child&apos;s academics</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="parent@email.com"
          placeholderTextColor={colors.textLight}
          keyboardType="email-address"
          autoCapitalize="none"
          autoFocus
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Min 6 characters"
          placeholderTextColor={colors.textLight}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.btn, busy && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.switchLink}>
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>

        {error && (
          <Text style={styles.error}>
            {typeof error === 'string' && !error.startsWith('{') && error.length < 150
              ? error
              : 'Could not connect to server. Check your internet and try again.'}
          </Text>
        )}

        <TouchableOpacity style={styles.demoBtn} onPress={enterDemoMode}>
          <Text style={styles.demoText}>Enter Demo Mode</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          ClassPulse Ecosystem — Parent Access
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  switchLink: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  demoBtn: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  demoText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: fontSize.xs,
    marginTop: spacing.xl,
  },
});
