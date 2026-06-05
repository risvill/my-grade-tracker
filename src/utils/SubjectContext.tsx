import { createContext, useState, type ReactNode } from 'react';

// 1. Опиши тип предмета (подставь свои поля)
interface Subject {
  id: string | number;
  title: string;
  total_percent: number | string;
  // Добавь сюда недостающие поля:
  rk1: number | string; 
  rk2: number | string;
  exam: number | string;
  fa_grades: any; // или укажи точный тип, если знаешь
  // и любые другие поля, которые ты используешь
}

// 2. Создай интерфейс для самого контекста
interface SubjectContextType {
  activeSubject: Subject | null;
  setActiveSubject: (subject: Subject | null) => void;
}

// 3. Создай контекст с правильным типом (используй undefined или пустой объект как дефолт)
export const SubjectContext = createContext<SubjectContextType>({
  activeSubject: null,
  setActiveSubject: () => {},
});

export const SubjectProvider = ({ children }: { children: ReactNode }) => {
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);

  return (
    <SubjectContext.Provider value={{ activeSubject, setActiveSubject }}>
      {children}
    </SubjectContext.Provider>
  );
};