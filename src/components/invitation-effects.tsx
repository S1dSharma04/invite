import { useEffect, useRef } from "react";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export function InvitationEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Layered scenes: each one pins once its bottom reaches the viewport and the next slides over it.
  // Layout is measured only on resize; scrolling just does arithmetic on the cached numbers and
  // writes a CSS variable when its value changes, so no frame forces a layout.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    const scenes = [...document.querySelectorAll<HTMLElement>("[data-scene]")].map((el) => ({
      el,
      top: 0,
      height: 0,
      stick: 0,
      pinned: !el.classList.contains("closing"),
      written: new Map<string, string>(),
    }));
    let viewport = window.innerHeight;
    let frame = 0;
    const write = (scene: (typeof scenes)[number], name: string, value: string) => {
      if (scene.written.get(name) === value) return;
      scene.written.set(name, value);
      scene.el.style.setProperty(name, value);
    };
    const measure = () => {
      viewport = window.innerHeight;
      let top = 0;
      for (const scene of scenes) {
        scene.top = top;
        scene.height = scene.el.offsetHeight;
        scene.stick = Math.min(0, viewport - scene.height);
        top += scene.height;
        write(scene, "--stick-top", `${scene.stick}px`);
      }
    };
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      scenes.forEach((scene, i) => {
        const flowTop = scene.top - y;
        const top = scene.pinned ? Math.max(flowTop, scene.stick) : flowTop;
        const next = scenes[i + 1];
        const covered = next ? (viewport - (next.top - y)) / viewport : 0;
        const cover = clamp(covered);
        write(scene, "--cover", cover.toFixed(2));
        // Stop painting a scene buried under the next one. Wait until it is half a screen deep so a
        // fast scroll back up (handled off the main thread) never reveals it before it is repainted.
        if (covered >= 1.5) return write(scene, "visibility", "hidden");
        write(scene, "visibility", "visible");
        if (top > viewport + 100 || top + scene.height < -100) return;
        const entry = clamp((viewport - top) / (viewport * 0.6));
        const center = (top + scene.height / 2 - viewport / 2) / viewport;
        write(scene, "--art-y", `${Math.round(center * 60)}px`);
        write(scene, "--reveal-y", `${Math.round((1 - entry) * 60)}px`);
        write(scene, "--reveal-opacity", (0.15 + entry * 0.85).toFixed(2));
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    // Elements marked data-shimmer animate only while the page is moving.
    const shimmers = [...document.querySelectorAll<HTMLElement>("[data-shimmer]")];
    let idle = 0;
    const onScroll = () => {
      schedule();
      if (!idle) shimmers.forEach((el) => el.classList.add("is-moving"));
      clearTimeout(idle);
      idle = window.setTimeout(() => {
        idle = 0;
        shimmers.forEach((el) => el.classList.remove("is-moving"));
      }, 900);
    };
    const relayout = () => {
      measure();
      schedule();
    };
    const observer = new ResizeObserver(relayout);
    scenes.forEach((scene) => observer.observe(scene.el));
    measure();
    update();
    // Pinning is opt-in so the page still reads top to bottom if this never runs.
    root.classList.add("layered");
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", relayout);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      root.classList.remove("layered");
      clearTimeout(idle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", relayout);
    };
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = window.innerWidth,
      height = window.innerHeight,
      frame = 0,
      last = 0,
      scroll = window.scrollY,
      impulse = 0,
      ratio = 1;
    const colors = getComputedStyle(document.documentElement);
    const pink = colors.getPropertyValue("--rose").trim(),
      light = colors.getPropertyValue("--petal-light").trim(),
      gold = colors.getPropertyValue("--primary").trim();
    type Petal = {
      x: number;
      y: number;
      size: number;
      speed: number;
      angle: number;
      spin: number;
      phase: number;
      burst: boolean;
      pale: boolean;
    };
    const make = (randomY = true): Petal => ({
      x: Math.random() * width,
      y: randomY ? Math.random() * height : -30,
      size: 4 + Math.random() * 8,
      speed: 15 + Math.random() * 25,
      angle: Math.random() * 6.28,
      spin: (Math.random() - 0.5) * 1.5,
      phase: Math.random() * 6.28,
      burst: false,
      pale: Math.random() < 1 / 3,
    });
    const baseCount = width < 700 ? 25 : 42;
    const petals: Petal[] = Array.from({ length: baseCount }, () => make());
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      // Petals are soft shapes, so draw them at reduced resolution and let the GPU scale the
      // canvas up: about half the pixels to fill and upload each frame, with no visible change.
      ratio = Math.min(window.devicePixelRatio, 1.5) * 0.75;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
    };
    resize();
    const draw = (time: number) => {
      const dt = Math.min((time - last) / 1000, 0.04);
      last = time;
      const current = window.scrollY;
      impulse += (Math.max(-12, Math.min(12, (current - scroll) * 0.12)) - impulse) * 0.08;
      scroll = current;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i]!;
        p.y += (p.speed + impulse * 24) * dt;
        p.x += (Math.sin(time * 0.0007 + p.phase) * 13 + impulse * 6) * dt;
        p.angle += p.spin * dt;
        if (p.y > height + 30) {
          // Burst petals are extras: let them fall away so clicks don't permanently thicken the shower.
          if (p.burst) {
            petals.splice(i, 1);
            continue;
          }
          Object.assign(p, make(false));
        }
        if (p.y < -60) p.y = height + 20;
        if (p.x < -30) p.x = width + 20;
        else if (p.x > width + 30) p.x = -20;
        // One transform per petal (rotate, squash, move) instead of save/translate/rotate/restore.
        const cos = Math.cos(p.angle) * ratio;
        const sin = Math.sin(p.angle) * ratio;
        const squash = 0.6 + Math.abs(Math.sin(time * 0.0006 + p.phase)) * 0.5;
        ctx.setTransform(cos, sin, -sin * squash, cos * squash, p.x * ratio, p.y * ratio);
        ctx.globalAlpha = p.burst ? 0.9 : 0.58;
        ctx.fillStyle = p.pale ? light : pink;
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 1.5, -p.size, p.size, p.size, 0, p.size * 0.7);
        ctx.bezierCurveTo(-p.size, p.size * 0.3, -p.size * 0.6, -p.size, 0, -p.size);
        ctx.fill();
      }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.fillStyle = gold;
      ctx.globalAlpha = 0.3;
      for (let i = 0; i < 16; i++) {
        const x = ((i * 193.7) % width) + Math.sin(time * 0.0003 + i) * 8;
        const y = height - ((time * 0.012 + i * 119) % height);
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };
    const burst = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest("button,a,[data-interactive]")) return;
      for (let i = 0; i < 8; i++) {
        const p = make();
        p.x = event.clientX + (Math.random() - 0.5) * 90;
        p.y = event.clientY + (Math.random() - 0.5) * 70;
        p.speed = 35 + Math.random() * 40;
        p.burst = true;
        petals.push(p);
      }
      // Base petals stay at the front, so trim the oldest burst petals right after them.
      if (petals.length > 90) petals.splice(baseCount, petals.length - 90);
    };
    window.addEventListener("resize", resize);
    document.addEventListener("click", burst);
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("click", burst);
    };
  }, []);
  return <canvas ref={canvasRef} className="petals-canvas" aria-hidden="true" />;
}
