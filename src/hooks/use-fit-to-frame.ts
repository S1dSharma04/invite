import { useEffect, type RefObject } from "react";

/**
 * Keeps text inside the open area of a decorative frame.
 *
 * `box` is positioned in percentages of `frame` (the frame artwork's clear area) and sizes its
 * typography from `--fit`. This finds the largest `--fit` between `min` and `max` px at which
 * `content` fits inside `box`; if even `min` overflows, it grows `frame` so the box gets tall
 * enough while staying aligned with the artwork.
 */
export function useFitToFrame(
  frameRef: RefObject<HTMLElement | null>,
  boxRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
  min: number,
  max: number,
) {
  useEffect(() => {
    const frame = frameRef.current;
    const box = boxRef.current;
    const content = contentRef.current;
    if (!frame || !box || !content) return;
    const setFit = (size: number) => box.style.setProperty("--fit", `${size}px`);
    const fits = () => content.offsetHeight <= box.clientHeight;
    const fit = () => {
      frame.style.minHeight = "";
      setFit(max);
      if (fits()) return;
      let low = min;
      let high = max;
      for (let i = 0; i < 8; i++) {
        const mid = (low + high) / 2;
        setFit(mid);
        if (fits()) low = mid;
        else high = mid;
      }
      setFit(low);
      if (!fits())
        frame.style.minHeight = `${Math.ceil((frame.offsetHeight * content.offsetHeight) / box.clientHeight)}px`;
    };
    let frameId = 0;
    const schedule = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(fit);
    };
    fit();
    // Web fonts change line lengths, so refit once they arrive.
    document.fonts?.ready.then(schedule);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", schedule);
    };
  }, [frameRef, boxRef, contentRef, min, max]);
}
