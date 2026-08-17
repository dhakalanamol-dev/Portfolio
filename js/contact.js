// Contact — cursor-tracked spotlight on .contact-link, recreated from
// React Bits' SpotlightCard (position-tracking only; the fade-in/out
// is pure CSS via :hover, no JS-driven opacity needed).

(function () {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Reduced motion: skip the listener entirely. The CSS default
  // (--mouse-x/--mouse-y: 50%) still renders a static centered glow
  // on :hover, so nothing is lost — just no pointer tracking.
  if (prefersReducedMotion) return;

  const links = document.querySelectorAll(".contact-link, .contact-cta");

  links.forEach((link) => {
    link.addEventListener("pointermove", (e) => {
      const rect = link.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      link.style.setProperty("--mouse-x", `${x.toFixed(2)}%`);
      link.style.setProperty("--mouse-y", `${y.toFixed(2)}%`);
    });
  });
})();
