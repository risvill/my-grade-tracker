// src/utils/CalculatorLogic.ts

// 1. Расчет итогового балла
export const calculateTotal = (rk1: string | number, rk2: string | number, exam: string | number): number => {
  return ((Number(rk1) + Number(rk2)) / 2) * 0.6 + Number(exam) * 0.4;
};

// 2. Расчет среднего по FA
export const calculateFaAvg = (faGrades: any[]): number => {
  if (faGrades.length === 0) return 0;
  return faGrades.reduce((acc, curr) => acc + Number(curr.value), 0) / faGrades.length;
};

export const formatScore = (val: any): number | null => {
  if (val === "" || val === undefined || val === null || val === "NaN") {
    return null;
  }
  const num = Number(val);
  if (isNaN(num)) {
    return null;
  }
  return Math.max(0, Math.min(100, num));
};

// 4. Цветовая логика для фона
export const getBackgroundColor = (letter: string): string => {
  if (letter === 'A' || letter === 'A-') return '#38a169';
  if (letter.startsWith('B')) return '#dd6b20';
  if (letter.startsWith('C')) return '#e53e3e';
  return '#c05621';
};

// 5. Цветовая логика для текста оценки
export const getScoreColor = (score: any): string => {
  const num = Number(score);
  if (!score || num < 50) return '#e53e3e';
  if (num >= 50 && num <= 69) return '#e53e3e';
  if (num >= 70 && num <= 89) return '#d69e2e';
  return '#38a169';
};