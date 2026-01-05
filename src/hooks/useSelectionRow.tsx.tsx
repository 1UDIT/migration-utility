export const useSelectionRow = (
    event: React.MouseEvent,
    id: number,
    SetMultipleRowsSelection: any,
    previousSelection: number | null,
    setPreviousSelection: React.Dispatch<React.SetStateAction<number | null>>,
    isKeyboard: boolean = false
) => {

    if (event.ctrlKey) {
        SetMultipleRowsSelection((current: number[]) => {
            if (current.includes(id)) {
                // ❌ removing → DO NOT update previousSelection
                return current.filter(entry => entry !== id);
            } else {
                // ✅ adding → update previousSelection
                setPreviousSelection(id);
                return [...current, id];
            }
        });
        return;
    }

    if (event.shiftKey) {
        SetMultipleRowsSelection((current: number[]) => {
            if (previousSelection === null) return [id];

            const [start, end] = [previousSelection, id].sort((a, b) => a - b);
            const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
            return Array.from(new Set([...current, ...range]));
        });
        return;
    }

    // Normal click → reset selection
    SetMultipleRowsSelection([id]);
    setPreviousSelection(id);
};