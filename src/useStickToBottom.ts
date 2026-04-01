import { useRef, useEffect, useCallback } from "react";

const BOTTOM_THRESHOLD = 30; // px — how close to bottom counts as "at bottom"

/**
 * Keeps a scrollable container pinned to the bottom when its content or
 * container size changes — but only if the user hasn't scrolled up.
 */
export function useStickToBottom<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const isAtBottom = useRef(true);

  const checkBottom = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    isAtBottom.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD;
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Track whether user is at the bottom on every scroll
    el.addEventListener("scroll", checkBottom, { passive: true });

    // When the container or its content resizes, re-stick if we were at bottom
    const observer = new ResizeObserver(() => {
      if (isAtBottom.current) {
        scrollToBottom();
      }
    });

    // Observe the container itself (shrinks when tongue grows)
    observer.observe(el);
    // Observe the scroll content (grows when messages are added)
    for (const child of el.children) {
      observer.observe(child);
    }

    // Start at bottom
    scrollToBottom();

    return () => {
      el.removeEventListener("scroll", checkBottom);
      observer.disconnect();
    };
  }, [checkBottom, scrollToBottom]);

  return ref;
}
