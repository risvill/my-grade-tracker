

export const getPredictionState = (data: { 
  rk1: string | number | null; 
  rk2: string | number | null; 
  exam: string | number | null; 
  currentGrades: any[] 
}) => {
  const { rk1, rk2, exam, currentGrades } = data;

  // If the grades list is empty, there is nothing to analyze yet
  if (!currentGrades || currentGrades.length === 0) return 'EMPTY_ALL';

  // If RK and exam are not filled, show analytics only
  if (!rk1 && !rk2 && !exam) return 'ONLY_ANALYTICS';

  // In all other cases, enable prediction mode
  return 'ACTIVE_PREDICTION';
};