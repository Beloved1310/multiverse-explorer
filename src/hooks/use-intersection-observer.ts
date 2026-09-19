"use client";

import { useEffect, useRef } from "react";

interface UseIntersectionObserverOptions {
  enabled?: boolean;
  rootMargin?: string;
}

/**
 * Calls `onIntersect` whenever the returned ref's element enters the
 * viewport (plus `rootMargin`). Returns the ref to attach to a sentinel
 * element -- disconnects entirely while `enabled` is false, e.g. while a
 * fetch is already in flight or there's nothing left to load.
 */
export function useIntersectionObserver(
  onIntersect: () => void,
  { enabled = true, rootMargin = "200px" }: UseIntersectionObserverOptions = {},
) {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const onIntersectRef = useRef(onIntersect);

  useEffect(() => {
    onIntersectRef.current = onIntersect;
  });

  useEffect(() => {
    if (!enabled) return;
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          onIntersectRef.current();
        }
      },
      { rootMargin },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return targetRef;
}
