import { createContext, useEffect, useState, type ReactNode } from 'react';

// Приводим интерфейсы к единому формату (используем string для id, так как Supabase UUID — это string)
interface Subject {
  id: string;
  title: string;
  total_percent: number | string;
  rk1: number | string | null; 
  rk2: number | string | null;
  exam: number | string | null;
  fa_grades: any; 
}

interface SubjectContextType {
  activeSubject: Subject | null;
  setActiveSubject: (subject: Subject | null) => void;
  updateSubjectInContext: (data: Partial<Subject>) => void;
}

export const SubjectContext = createContext<SubjectContextType>({
  activeSubject: null,
  setActiveSubject: () => {},
  updateSubjectInContext: () => {}
});

export const SubjectProvider = ({ children }: { children: ReactNode }) => {
  const [activeSubject, setActiveSubject] = useState<Subject | null>(() => {
    const saved = sessionStorage.getItem('activeSubject');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const updateSubjectInContext = (data: Partial<Subject>) => {
    setActiveSubject((prev) => {
      if (!prev) return null;
      return { ...prev, ...data } as Subject;
    });
  };

  useEffect(() => {
    if (activeSubject) {
      sessionStorage.setItem('activeSubject', JSON.stringify(activeSubject));
    } else {
      sessionStorage.removeItem('activeSubject');
    }
  }, [activeSubject]);

  return (
    <SubjectContext.Provider value={{ activeSubject, setActiveSubject, updateSubjectInContext }}>
      {children}
    </SubjectContext.Provider>
  );
};