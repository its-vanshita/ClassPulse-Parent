import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getTeacherByEmail, createTeacher, subscribeToTeacher } from '../services/firestoreService';
import type { Teacher } from '../types';

interface TeacherState {
  teacher: Teacher | null;
  loading: boolean;
  isDemo: boolean;
}

const TeacherContext = createContext<TeacherState | undefined>(undefined);

const DEMO_TEACHER: Teacher = {
  teacherId: 'demo-teacher',
  name: 'Demo Teacher',
  phone: '',
  email: 'demo@classpulse.app',
  institute: '',
  batchIds: [],
  createdAt: '',
};

export function TeacherProvider({ children }: { children: ReactNode }) {
  const { user, isDemo } = useAuth();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemo) {
      setTeacher(DEMO_TEACHER);
      setLoading(false);
      return;
    }

    if (!user?.email) {
      setTeacher(null);
      setLoading(false);
      return;
    }

    let unsubProfile: (() => void) | undefined;

    const resolve = async () => {
      try {
        let t = await getTeacherByEmail(user.email!);
        if (!t) {
          // First login – create teacher profile
          t = await createTeacher({
            name: '',
            phone: '',
            email: user.email!,
            batchIds: [],
          });
        }
        // Subscribe to live updates
        unsubProfile = subscribeToTeacher(t.teacherId, (updated) => {
          if (updated) setTeacher(updated);
        });
        setTeacher(t);
      } catch (err) {
        console.error('TeacherContext resolve error:', err);
      } finally {
        setLoading(false);
      }
    };

    resolve();
    return () => unsubProfile?.();
  }, [user, isDemo]);

  return (
    <TeacherContext.Provider value={{ teacher, loading, isDemo }}>
      {children}
    </TeacherContext.Provider>
  );
}

export function useTeacher(): TeacherState {
  const ctx = useContext(TeacherContext);
  if (!ctx) throw new Error('useTeacher must be used within TeacherProvider');
  return ctx;
}
