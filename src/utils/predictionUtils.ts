

export const getPredictionState = (data: { 
  rk1: string | number | null; 
  rk2: string | number | null; 
  exam: string | number | null; 
  currentGrades: any[] 
}) => {
  const { rk1, rk2, exam, currentGrades } = data;

  if (!currentGrades || currentGrades.length === 0) return 'EMPTY_ALL';
  if (!rk1 && !rk2 && !exam) return 'ONLY_ANALYTICS';
  return 'ACTIVE_PREDICTION';
};