
export const clampScore = (value: string | number): string => {
  const num = Number(value);
  
  if (value === "" || isNaN(num)) return "";

  return Math.max(0, Math.min(100, num)).toString();
};

export const handleScoreChange = (
  value: string, 
  setter: React.Dispatch<React.SetStateAction<any>>, 
  originalValue?: string,
  onInputChange?: (setter: any, val: string, orig?: string) => void
) => {
  const validatedVal = clampScore(value);
  setter(validatedVal);
  
  if (onInputChange) {
    onInputChange(setter, validatedVal, originalValue);
  }
};