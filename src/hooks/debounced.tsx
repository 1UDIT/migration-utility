// import * as React from "react";

// export function useDebouncedValue<T>(value: T, delay = 100) {
//   const [debounced, setDebounced] = React.useState(value);

//   React.useEffect(() => {
//     const t = window.setTimeout(() => setDebounced(value), delay);
//     return () => window.clearTimeout(t);
//   }, [value, delay]);

//   return debounced;
// }

import { useEffect, useRef, useState } from "react";

export function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  const [isPending, setIsPending] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setIsPending(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      setDebounced(value);
      setIsPending(false);
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay]);

  return { debounced, isPending };
}
