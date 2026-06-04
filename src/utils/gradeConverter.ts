export const getGradeInfo = (percent: number) => {
  if (percent >= 95) return { letter: 'A', gpa: 4.0, label: 'Grade 5 Achieved' };
  if (percent >= 90) return { letter: 'A-', gpa: 3.7, label: 'Grade 5 Achieved' };
  if (percent >= 85) return { letter: 'B+', gpa: 3.3, label: 'Grade 4 Achieved' };
  if (percent >= 80) return { letter: 'B', gpa: 3.0, label: 'Grade 4 Achieved' };
  if (percent >= 75) return { letter: 'B-', gpa: 2.7, label: 'Grade 4 Achieved' };
  if (percent >= 70) return { letter: 'C+', gpa: 2.3, label: 'Grade 3 Achieved' };
  if (percent >= 65) return { letter: 'C', gpa: 2.0, label: 'Grade 3 Achieved' };
  if (percent >= 60) return { letter: 'C-', gpa: 1.7, label: 'Grade 3 Achieved' };
  if (percent >= 50) return { letter: 'D', gpa: 1.0, label: 'Grade 2 Achieved' };
  return { letter: 'F', gpa: 0.0, label: 'Grade 2 Achieved' };
};

