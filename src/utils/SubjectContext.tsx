import { createContext, useEffect, useState, type ReactNode } from 'react';

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
  // Getting subject from cache on load to avoid unnecessary requests
  const [activeSubject, setActiveSubject] = useState<Subject | null>(() => {
    const saved = sessionStorage.getItem('activeSubject');
    try {
      return saved ? JSON.parse(saved) : null; // Parsing JSON from string
    } catch {
      return null; // If something weird is inside, just return null
    }
  });

  // Function for updating only required fields (for example, score changes)
  const updateSubjectInContext = (data: Partial<Subject>) => {
    setActiveSubject((prev) => {
      if (!prev) return null; // If subject does not exist, do nothing
      return { ...prev, ...data } as Subject; // Merging old data with new one
    });
  };

  // Watching activeSubject changes and syncing with sessionStorage
  useEffect(() => {
    if (activeSubject) {
      sessionStorage.setItem('activeSubject', JSON.stringify(activeSubject));
    } else {
      sessionStorage.removeItem('activeSubject'); // If subject is removed, clear cache
    }
  }, [activeSubject]); // Trigger only when state changes

  return (
    <SubjectContext.Provider value={{ activeSubject, setActiveSubject, updateSubjectInContext }}>
      {children}
    </SubjectContext.Provider>
  );
};