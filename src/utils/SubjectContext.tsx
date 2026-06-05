import { createContext, useEffect, useState, type ReactNode } from 'react';

interface Subject {
  id: string | number;
  title: string;
  total_percent: number | string;
  rk1: number | string; 
  rk2: number | string;
  exam: number | string;
  fa_grades: any; 
}

type SubjectData = { 
  rk1?: number | null; 
  rk2?: number | null; 
  exam?: number | null; 
  fa_grades?: any;
  total_percent?: number;
};


interface SubjectContextType {
  activeSubject: Subject | null;
  setActiveSubject: (subject: Subject | null) => void;
  updateSubjectInContext: (data: SubjectData) => void;
}


export const SubjectContext = createContext<SubjectContextType>({
  activeSubject: null,
  setActiveSubject: () => {},
  updateSubjectInContext: () => {}
});

export const SubjectProvider = ({ children }: { children: ReactNode }) => {

  const [activeSubject, setActiveSubject] = useState(() => {
    const saved = sessionStorage.getItem('activeSubject');
    return saved ? JSON.parse(saved) : null;
  });

  const updateSubjectInContext = (data: SubjectData) => {
  setActiveSubject((prev: any) => ({
    ...prev,
    ...data
  }));
  };

  useEffect(() => {
    sessionStorage.setItem('activeSubject', JSON.stringify(activeSubject));
  }, [activeSubject]);
  return (
    <SubjectContext.Provider value={{ activeSubject, setActiveSubject, updateSubjectInContext }}>
      {children}
    </SubjectContext.Provider>
  );
};