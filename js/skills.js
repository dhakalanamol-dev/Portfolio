// Skills — cursor-tracked edge-light glow on .skill-card, recreated
// from React Bits' BorderGlow (edge-proximity + angle math only; the
// mesh-gradient border/fill layers were deliberately dropped, see
// css/skills.css). No dependency on the component's React source.

(function () {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Glow is a non-essential hover embellishment, not conveyed
  // information — skip the listeners entirely rather than just
  // disabling the CSS transition.
  if (prefersReducedMotion) return;

  const cards = document.querySelectorAll(".skill-card");

  function getEdgeProximity(rect, x, y) {
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const kx = dx !== 0 ? cx / Math.abs(dx) : Infinity;
    const ky = dy !== 0 ? cy / Math.abs(dy) : Infinity;
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  }

  function getCursorAngle(rect, x, y) {
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    if (dx === 0 && dy === 0) return 0;
    let degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;
    return degrees;
  }

  cards.forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const edge = getEdgeProximity(rect, x, y);
      const angle = getCursorAngle(rect, x, y);

      card.style.setProperty("--edge-proximity", (edge * 100).toFixed(3));
      card.style.setProperty("--cursor-angle", `${angle.toFixed(3)}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--edge-proximity", "0");
    });
  });
})();
