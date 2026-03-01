// ══════════════════════════════════════════════════════════════
// Auth context – Supabase Email/Password authentication (free tier)
// ══════════════════════════════════════════════════════════════
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { supabase } from '../config/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  /** Currently authenticated Supabase user (null while loading or logged out). */
  user: User | null;
  /** True until the initial auth-state check finishes. */
  loading: boolean;
  /** Sign in with email + password. Auto-creates account if not found. */
  signIn: (email: string, password: string) => Promise<void>;
  /** Explicitly create a new account */
  signUp: (email: string, password: string) => Promise<void>;
  /** Sign out. */
  signOut: () => Promise<void>;
  /** Skip auth for demo/dev mode */
  enterDemoMode: () => void;
  /** Whether the app is running in demo mode. */
  isDemo: boolean;
  /** Error message (cleared on next attempt). */
  error: string | null;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  enterDemoMode: () => {},
  isDemo: false,
  error: null,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [error, setErrorRaw] = useState<string | null>(null);

  /** Strip any JSON blob / Response dump from error text */
  const sanitize = (raw: unknown): string => {
    if (!raw) return 'Something went wrong';
    const str = typeof raw === 'string' ? raw : (raw as any)?.message ?? String(raw);
    if (str.startsWith('{') || str.startsWith('[') || str.length > 150) {
      return 'Could not connect to server. Please connect to WiFi and try again.';
    }
    if (str.toLowerCase().includes('network request failed') || str.toLowerCase().includes('aborted')) {
      return 'Could not connect to server. Please connect to WiFi and try again.';
    }
    return str;
  };
  const setError = (val: string | null) => setErrorRaw(val ? sanitize(val) : null);

  /** Retry an async function up to `retries` times with a delay between attempts */
  const withRetry = async <T,>(fn: () => Promise<T>, retries = 2, delayMs = 1500): Promise<T> => {
    for (let i = 0; i <= retries; i++) {
      try {
        return await fn();
      } catch (err: any) {
        const isNetwork = /network|aborted|timeout|fetch/i.test(err?.message ?? '');
        if (i < retries && isNetwork) {
          await new Promise((r) => setTimeout(r, delayMs));
          continue;
        }
        throw err;
      }
    }
    throw new Error('Request failed after retries');
  };

  // Listen to auth state
  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('getSession failed (network?):', err.message);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    let result;
    try {
      result = await withRetry(() => supabase.auth.signInWithPassword({ email, password }));
    } catch (_e: any) {
      const msg = 'Could not connect to server. Please connect to WiFi and try again.';
      setError(msg);
      throw new Error(msg);
    }
    if (result.error) {
      const raw = sanitize(result.error.message);
      if (raw.includes('Invalid login credentials')) {
        let signUpResult;
        try {
          signUpResult = await withRetry(() => supabase.auth.signUp({ email, password, options: { emailRedirectTo: undefined } }));
        } catch (_e: any) {
          const msg = 'Could not connect to server. Please connect to WiFi and try again.';
          setError(msg);
          throw new Error(msg);
        }
        if (signUpResult.error) {
          const errMsg = sanitize(signUpResult.error.message);
          if (errMsg.includes('already') || errMsg.includes('already_exists')) {
            const msg = 'Incorrect password. This account already exists.';
            setError(msg);
            throw new Error(msg);
          }
          const msg = errMsg.includes('rate limit')
            ? 'Too many attempts. Please wait a few minutes.'
            : 'Sign-up failed. Please try again.';
          setError(msg);
          throw new Error(msg);
        }
        return;
      }
      const msg = raw.includes('rate limit')
        ? 'Too many attempts. Please wait a few minutes.'
        : raw;
      setError(msg);
      throw new Error(msg);
    }
  };

  const signUp = async (email: string, password: string) => {
    setError(null);
    let result;
    try {
      result = await withRetry(() => supabase.auth.signUp({ email, password, options: { emailRedirectTo: undefined } }));
    } catch (_e: any) {
      const msg = 'Could not connect to server. Please connect to WiFi and try again.';
      setError(msg);
      throw new Error(msg);
    }
    if (result.error) {
      const raw = sanitize(result.error.message);
      const msg = raw.includes('rate limit')
        ? 'Too many attempts. Please wait a few minutes.'
        : raw;
      setError(msg);
      throw new Error(msg);
    }
  };

  const signOut = async () => {
    setIsDemo(false);
    setError(null);
    await supabase.auth.signOut();
    setUser(null);
  };

  const enterDemoMode = () => {
    setIsDemo(true);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        enterDemoMode,
        isDemo,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
