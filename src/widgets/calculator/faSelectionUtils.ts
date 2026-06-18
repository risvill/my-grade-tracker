export const toggleSelection = (selectedIds: number[], id: number): number[] => {
  if (selectedIds.includes(id)) {
    return selectedIds.filter((x) => x !== id);
  }
  return [...selectedIds, id];
};

export const deleteSelected = <T extends { id: number }>(items: T[], selectedIds: number[]): T[] => {
  return items.filter((item) => !selectedIds.includes(item.id));
};

export const getFirstSelected = <T extends { id: number }>(items: T[], selectedIds: number[]): T | undefined => {
  return items.find((item) => item.id === selectedIds[0]);
};