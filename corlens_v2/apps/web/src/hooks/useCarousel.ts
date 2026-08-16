/**
 * Scroll-driven carousel mechanics shared by the home page's two carousels: a
 * horizontal feature deck and a vertical roadmap rail.
 *
 * The scroll container is the source of truth — buttons, arrow keys and mouse
 * dragging all just scroll it, and the focused index is derived back from the
 * scroll offset. That keeps native trackpad/wheel scrolling and the explicit
 * controls in agreement instead of maintaining two competing positions.
 *
 * Slides are the container's direct children marked `data-carousel-slide`.
 */

import {
  type KeyboardEventHandler,
  type PointerEventHandler,
  type RefObject,
  type UIEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

/** Breathing room above a vertical slide so its top border isn't flush with the edge. */
const VERTICAL_SCROLL_PAD = 8;

type Orientation = "horizontal" | "vertical";

export type UseCarouselOptions = {
  count: number;
  orientation?: Orientation;
  /**
   * Which slide to open on. `scrollTo` lets the carousel land on a different
   * slide than the focused one — the roadmap focuses the first unshipped step
   * but scrolls to the one before it, so the shipped/next boundary is visible.
   */
  initial?: { index: number; scrollTo?: number };
};

export type Carousel = {
  index: number;
  /** Focus a slide (clamped) and scroll it into view. */
  select: (index: number) => void;
  containerRef: RefObject<HTMLDivElement>;
  /** Spread onto the scroll container. */
  containerProps: {
    tabIndex: number;
    onKeyDown: KeyboardEventHandler<HTMLDivElement>;
    onScroll: UIEventHandler<HTMLDivElement>;
    onPointerDown: PointerEventHandler<HTMLDivElement>;
  };
};

function slidesOf(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(":scope > [data-carousel-slide]"));
}

export function useCarousel({
  count,
  orientation = "horizontal",
  initial,
}: UseCarouselOptions): Carousel {
  const vertical = orientation === "vertical";
  const containerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(initial?.index ?? 0);
  /** Suppresses scroll-derived index updates while a programmatic scroll settles. */
  const lockRef = useRef(false);
  const unlockRef = useRef(0);

  useEffect(() => () => window.clearTimeout(unlockRef.current), []);

  /** Scroll offset that brings `child` to the leading edge of the viewport. */
  const offsetOf = useCallback(
    (el: HTMLElement, child: HTMLElement): number => {
      const outer = el.getBoundingClientRect();
      const inner = child.getBoundingClientRect();
      return vertical
        ? el.scrollTop + (inner.top - outer.top) - VERTICAL_SCROLL_PAD
        : el.scrollLeft + (inner.left - outer.left);
    },
    [vertical],
  );

  const maxOf = useCallback(
    (el: HTMLElement): number =>
      vertical ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth,
    [vertical],
  );

  const scrollToSlide = useCallback(
    (target: number, behavior: ScrollBehavior): void => {
      const el = containerRef.current;
      if (!el) return;
      const child = slidesOf(el)[target];
      if (!child) return;
      const offset = Math.max(0, Math.min(maxOf(el), offsetOf(el, child)));
      if (vertical) el.scrollTo({ top: offset, behavior });
      else el.scrollTo({ left: offset, behavior });
    },
    [maxOf, offsetOf, vertical],
  );

  const select = useCallback(
    (next: number): void => {
      const clamped = Math.max(0, Math.min(count - 1, next));
      setIndex(clamped);
      const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth";
      // An explicit choice outranks whatever the scroll offset implies. This matters
      // for the trailing slides: their target offset clamps to the scroll maximum,
      // so the offset alone cannot tell them apart and the scroll handler would
      // otherwise drag the selection back to the first of them.
      lockRef.current = true;
      window.clearTimeout(unlockRef.current);
      unlockRef.current = window.setTimeout(
        () => {
          lockRef.current = false;
        },
        behavior === "smooth" ? 700 : 60,
      );
      scrollToSlide(clamped, behavior);
    },
    [count, scrollToSlide],
  );

  /** Nearest slide to the current scroll offset. */
  const indexFromScroll = useCallback(
    (el: HTMLElement): number => {
      const slides = slidesOf(el);
      const pos = vertical ? el.scrollTop : el.scrollLeft;
      const max = maxOf(el);

      // The last slides can't each reach the leading edge, so their target offsets
      // all clamp to the maximum and distance alone can't separate them. At the end
      // of the track, the deepest slide still on screen is the one being read.
      if (pos >= max - 1) {
        const viewport = vertical ? el.clientHeight : el.clientWidth;
        for (let i = slides.length - 1; i >= 0; i--) {
          if (offsetOf(el, slides[i]) - pos < viewport) return i;
        }
      }

      let best = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (let i = 0; i < slides.length; i++) {
        const distance = Math.abs(Math.min(max, offsetOf(el, slides[i])) - pos);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = i;
        }
      }
      return best;
    },
    [maxOf, offsetOf, vertical],
  );

  // Open on the requested slide. A smooth scroll here would animate for ~470ms
  // and its trailing scroll events would overwrite the focused index, so the
  // initial jump is instant and locked.
  const initialIndex = initial?.index;
  const initialScrollTo = initial?.scrollTo;
  useEffect(() => {
    if (initialIndex === undefined) return;
    const target = initialScrollTo ?? initialIndex;
    if (target <= 0) return;

    let cancelled = false;
    const place = (): void => {
      const el = containerRef.current;
      if (cancelled || !el) return;
      lockRef.current = true;
      const previous = el.style.scrollBehavior;
      el.style.scrollBehavior = "auto";
      scrollToSlide(target, "auto");
      setIndex(initialIndex);
      requestAnimationFrame(() => {
        el.style.scrollBehavior = previous;
        lockRef.current = false;
      });
    };

    // Slide heights move as webfonts swap in; measure after they settle.
    if (document.fonts?.ready) void document.fonts.ready.then(() => requestAnimationFrame(place));
    else requestAnimationFrame(place);

    return () => {
      cancelled = true;
    };
  }, [initialIndex, initialScrollTo, scrollToSlide]);

  const onKeyDown = useCallback<KeyboardEventHandler<HTMLDivElement>>(
    (event) => {
      const forward = vertical ? "ArrowDown" : "ArrowRight";
      const back = vertical ? "ArrowUp" : "ArrowLeft";
      if (event.key === forward) select(index + 1);
      else if (event.key === back) select(index - 1);
      else if (event.key === "Home") select(0);
      else if (event.key === "End") select(count - 1);
      else return;
      event.preventDefault();
    },
    [count, index, select, vertical],
  );

  const onScroll = useCallback<UIEventHandler<HTMLDivElement>>(
    (event) => {
      if (lockRef.current) return;
      const next = indexFromScroll(event.currentTarget);
      setIndex((current) => (next === current ? current : next));
    },
    [indexFromScroll],
  );

  // Mouse drag to pan. Touch is left to the browser's own momentum scrolling.
  const onPointerDown = useCallback<PointerEventHandler<HTMLDivElement>>(
    (event) => {
      if (event.pointerType === "touch") return;
      const el = event.currentTarget;
      const start = vertical ? event.clientY : event.clientX;
      const startOffset = vertical ? el.scrollTop : el.scrollLeft;
      let moved = false;

      const move = (moveEvent: PointerEvent): void => {
        const now = vertical ? moveEvent.clientY : moveEvent.clientX;
        if (Math.abs(now - start) > 3) moved = true;
        el.style.scrollBehavior = "auto";
        if (vertical) el.scrollTop = startOffset - (now - start);
        else el.scrollLeft = startOffset - (now - start);
      };

      const up = (): void => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        el.style.scrollBehavior = "";
        // A click without movement is a click, not a drag — leave the index alone.
        if (moved) select(indexFromScroll(el));
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [indexFromScroll, select, vertical],
  );

  return {
    index,
    select,
    containerRef,
    containerProps: { tabIndex: 0, onKeyDown, onScroll, onPointerDown },
  };
}
