import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

/**
 * jsdom has no IntersectionObserver. Every results grid (characters,
 * locations, episodes) constructs one whenever there's a next page to
 * load (see useIntersectionObserver), so without this stub any test that
 * reaches a "has more results" state throws "IntersectionObserver is not
 * defined" instead of testing the pagination behaviour it's there to
 * exercise. It never fires on its own -- tests exercise "load more" via
 * the visible button instead of simulating a scroll-into-view.
 */
class IntersectionObserverStub implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly scrollMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];

  observe = () => {};
  unobserve = () => {};
  disconnect = () => {};
  takeRecords = (): IntersectionObserverEntry[] => [];
}

vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
