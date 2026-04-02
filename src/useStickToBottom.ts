import { useRef, useEffect, useCallback } from "react";
import { bumpResizeObserverFires } from "./PerfMonitor";

const BOTTOM_THRESHOLD = 30;
const SIZE_CHANGE_THRESHOLD = 2; // px — ignore sub-pixel / rounding noise

export function useStickToBottom<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const isAtBottom = useRef(true);
  const lastSize = useRef({ w: 0, h: 0, sh: 0 });

  const checkBottom = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    isAtBottom.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.addEventListener("scroll", checkBottom, { passive: true });

    const observer = new ResizeObserver(() => {
      bumpResizeObserverFires();
      const w = el.clientWidth;
      const h = el.clientHeight;
      const sh = el.scrollHeight;
      const prev = lastSize.current;

      if (
        Math.abs(w - prev.w) < SIZE_CHANGE_THRESHOLD &&
        Math.abs(h - prev.h) < SIZE_CHANGE_THRESHOLD &&
        Math.abs(sh - prev.sh) < SIZE_CHANGE_THRESHOLD
      ) {
        return; // nothing meaningful changed
      }

      lastSize.current = { w, h, sh };

      if (isAtBottom.current) {
        el.scrollTop = el.scrollHeight;
      }
    });

    observer.observe(el);

    lastSize.current = {
      w: el.clientWidth,
      h: el.clientHeight,
      sh: el.scrollHeight,
    };
    el.scrollTop = el.scrollHeight;

    return () => {
      el.removeEventListener("scroll", checkBottom);
      observer.disconnect();
    };
  }, [checkBottom]);

  return ref;
}
