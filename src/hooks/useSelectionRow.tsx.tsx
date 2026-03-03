export const useSelectionRow = (
  event: React.MouseEvent,
  id: number,
  SetMultipleRowsSelection: React.Dispatch<React.SetStateAction<number[]>>,
  previousSelection: number | null,
  setPreviousSelection: React.Dispatch<React.SetStateAction<number | null>>,
  isLoading: boolean   // ✅ add this
) => {

  // 🚫 STOP selection while loading
  if (isLoading) return;

  if (event.ctrlKey) {
    SetMultipleRowsSelection((current: number[]) => {
      if (current.includes(id)) {
        return current.filter(entry => entry !== id);
      } else {
        setPreviousSelection(id);
        return [...current, id];
      }
    });
    return;
  }

  if (event.shiftKey) {
    SetMultipleRowsSelection((current: number[]) => {
      const anchor = previousSelection ?? current.at(-1) ?? id;

      const [start, end] = [anchor, id].sort((a, b) => a - b);
      const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);

      setPreviousSelection(id);

      return Array.from(new Set([...current, ...range]));
    });
    return;
  }

  // Normal click
  SetMultipleRowsSelection([id]);
  setPreviousSelection(id);
};