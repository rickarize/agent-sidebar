import { useRef, useEffect, useCallback } from "react";

const BOTTOM_THRESHOLD = 30;
const THROTTLE_MS = 100;

export function useStickToBottom<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const isAtBottom = useRef(true);
  const lastScroll = useRef(0);

  const checkBottom = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    isAtBottom.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD;
  }, []);

  const scrollToBottom = useCallback(() => {
    const now = Date.now();
    if (now - lastScroll.current < THROTTLE_MS) return;
    lastScroll.current = now;

    const el = ref.current;
    if (el && isAtBottom.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.addEventListener("scroll", checkBottom, { passive: true });

    const observer = new ResizeObserver(scrollToBottom);
    observer.observe(el);

    el.scrollTop = el.scrollHeight;

    return () => {
      el.removeEventListener("scroll", checkBottom);
      observer.disconnect();
    };
  }, [checkBottom, scrollToBottom]);

  return ref;
}
