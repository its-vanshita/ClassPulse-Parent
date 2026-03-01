// ══════════════════════════════════════════════════════════════
// StudentContext – resolves current student(s) for logged-in parent
// ══════════════════════════════════════════════════════════════
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { subscribeToStudents } from '../services/firestoreService';
import type { Student } from '../types';
import {
  mockChild,
} from '../data/mockData';

interface StudentState {
  /** All students linked to the parent's phone. */
  students: Student[];
  /** Currently selected child. */
  selectedStudent: Student | null;
  /** Pick a different child to view. */
  selectStudent: (s: Student) => void;
  /** Loading state. */
  loading: boolean;
  /** Whether we're using local mock data (no Firebase connection). */
  isDemo: boolean;
}

const StudentContext = createContext<StudentState>({
  students: [],
  selectedStudent: null,
  selectStudent: () => {},
  loading: true,
  isDemo: true,
});

export function useStudent() {
  return useContext(StudentContext);
}

export function StudentProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    // If the user is logged in with an email, subscribe to Firestore
    if (user?.email) {
      setIsDemo(false);
      const unsub = subscribeToStudents(user.email, (list) => {
        setStudents(list);
        setSelectedStudent((prev) => (prev ? prev : list.length > 0 ? list[0] : null));
        setLoading(false);
      });
      return unsub;
    }

    // Demo / offline mode: use mock data
    const demoStudent: Student = {
      studentId: mockChild.studentId,
      name: mockChild.name,
      parentEmail: 'demo@parent.com',
      batchId: mockChild.batchId,
      grade: mockChild.grade,
      section: mockChild.section,
      rollNumber: mockChild.rollNumber,
      institute: mockChild.institute,
    };
    setStudents([demoStudent]);
    setSelectedStudent(demoStudent);
    setLoading(false);
    setIsDemo(true);
  }, [user]);

  return (
    <StudentContext.Provider
      value={{
        students,
        selectedStudent,
        selectStudent: setSelectedStudent,
        loading,
        isDemo,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}
