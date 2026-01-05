import { useCallback, useEffect, useRef, useState } from "react";

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName?.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable;
}

type ScrollFn = (index: number, options?: { align?: "auto" | "start" | "end" | "center" }) => void;

export default function useKeyNavigationx(
  tableData: any[],
  setPreviousSelection: React.Dispatch<React.SetStateAction<number | null>>,
  setSelectedRows: React.Dispatch<React.SetStateAction<number[]>>,
  scrollToIndex?: ScrollFn
) {
  const [activeCursor, _setActiveCursor] = useState<number>(0);
  const cursorRef = useRef(0);
  const dataLenRef = useRef(tableData?.length ?? 0);

  useEffect(() => {
    dataLenRef.current = tableData?.length ?? 0;
    // keep cursor valid when data length changes
    if (dataLenRef.current === 0) return;
    if (cursorRef.current > dataLenRef.current - 1) {
      cursorRef.current = dataLenRef.current - 1;
      _setActiveCursor(cursorRef.current);
      setSelectedRows([cursorRef.current]);
      setPreviousSelection(cursorRef.current);
    }
  }, [tableData?.length, setPreviousSelection, setSelectedRows]);

  const setActiveCursor = useCallback(
    (next: number) => {
      cursorRef.current = next;
      _setActiveCursor(next);
    },
    []
  );

  const move = useCallback(
    (dir: -1 | 1) => {
      const size = dataLenRef.current;
      if (!size) return;

      const cur = cursorRef.current ?? 0;
      const next = Math.max(0, Math.min(cur + dir, size - 1));

      if (next === cur) return;

      setActiveCursor(next);
      setPreviousSelection(next);

      // avoid no-op rerender
      setSelectedRows((prev) => (prev.length === 1 && prev[0] === next ? prev : [next]));

      scrollToIndex?.(next, { align: "center" });
    },
    [scrollToIndex, setActiveCursor, setPreviousSelection, setSelectedRows]
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        // ignore key repeat flood; browser already repeats keydown. This is enough.
        move(1);
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        move(-1);
      }
    },
    [move]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown, { passive: false });
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  return [activeCursor, setActiveCursor] as const;
}
