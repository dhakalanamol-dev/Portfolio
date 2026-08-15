// Hero — cinematic scroll-driven photo expand + identity reveal.
// Recreated from React Bits' ScrollExpand without React/GSAP/WebGL.
//
// Progress is read from document.scrollingElement.scrollTop — the
// standard API for resolving exactly this ambiguity. `body` sets
// `overflow-y: scroll`, but per CSS overflow-propagation rules, browsers
// apply that behavior to the actual viewport instead of containing it
// inside body's own box (since the root <html> element has no explicit
// overflow). document.scrollingElement always points at whichever
// element is genuinely scrolling as a result, so reading from it avoids
// hardcoding an assumption that a later spec quirk or refactor could
// silently break again.

(() => {
  const track = document.getElementById('hero-track');
  const stage = document.getElementById('hero-stage');
  const frame = document.getElementById('hero-frame');
  const media = document.getElementById('hero-media');
  const scrim = document.querySelector('.hero-scrim');
  const intro = document.getElementById('hero-intro');
  const reveal = document.getElementById('hero-reveal');

  if (!track || !stage || !frame || !media) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Contextual "over-media" navbar state — the Hero photo sits full-bleed
  // behind the fixed navbar once expanded (or always, under reduced
  // motion), so the navbar needs a dark-glass/light-text variant while
  // any part of the track is still under it. This runs independently of
  // the animation engine below so reduced-motion users get it too.
  let overMedia = false;
  function setOverMedia(next) {
    if (next === overMedia) return;
    overMedia = next;
    document.body.classList.toggle('hero-over-media', overMedia);
  }

  if (reduceMotion) {
    // No progress to read — the frame is always full-bleed at rest (see
    // css/hero.css's reduced-motion block), so it's a simple in-view
    // check: are we still above the point where Hero has fully scrolled
    // past the fixed navbar's band?
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setOverMedia(entry.isIntersecting && entry.boundingClientRect.top <= 0);
        });
      },
      { threshold: [0, 1], rootMargin: '-64px 0px 0px 0px' }
    );
    io.observe(track);
    return; // css/hero.css handles the rest of the static fallback.
  }

  const SCROLL_DISTANCE_DESKTOP = 1;   // viewport-heights of scroll dedicated to the expand
  const HOLD_DISTANCE_DESKTOP = 0.3;   // extra scroll held at full-bleed before releasing into About
  const SCROLL_DISTANCE_MOBILE = 0.75; // shorter on mobile per instruction — still cinematic, not a long scroll trap
  const HOLD_DISTANCE_MOBILE = 0.2;

  const mobileQuery = window.matchMedia('(max-width: 768px)');
  const scrollDistance = () => (mobileQuery.matches ? SCROLL_DISTANCE_MOBILE : SCROLL_DISTANCE_DESKTOP);
  const holdDistance = () => (mobileQuery.matches ? HOLD_DISTANCE_MOBILE : HOLD_DISTANCE_DESKTOP);

  // window.innerHeight can disagree with the actual CSS-vh-resolved
  // viewport (confirmed via live testing — DevTools mobile emulation
  // reported innerHeight=1285 while .hero-stage, sized with `height:
  // 100vh`, actually rendered at 956). Real mobile browsers hit the same
  // class of mismatch when the address bar shows/hides. Measuring the
  // stage's own rendered height instead is correct by construction,
  // independent of that discrepancy.
  const stageHeight = () => stage.getBoundingClientRect().height || window.innerHeight;

  // Contained-frame insets (%), also responsive — previously hardcoded
  // to the desktop values only, which (being set inline every frame)
  // always overrode the mobile clip-path CSS in hero.css. Mobile was
  // rendering the desktop frame width (42% of viewport) instead of the
  // intended wider one, which clipped the intro statement text mid-word
  // since it's a child of the same clipped .hero-frame. This is the only
  // change in this pass — nothing else touched.
  const FRAME_INSET_Y_DESKTOP = 21, FRAME_INSET_X_DESKTOP = 29;
  const FRAME_INSET_Y_MOBILE = 15, FRAME_INSET_X_MOBILE = 12;
  const frameInsetY = () => (mobileQuery.matches ? FRAME_INSET_Y_MOBILE : FRAME_INSET_Y_DESKTOP);
  const frameInsetX = () => (mobileQuery.matches ? FRAME_INSET_X_MOBILE : FRAME_INSET_X_DESKTOP);

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const smoothstep = (edge0, edge1, x) => {
    const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
    return t * t * (3 - 2 * t);
  };

  let ticking = false;
  let visible = false;

  function setTrackHeight() {
    const vh = stageHeight();
    track.style.height = `${vh * (1 + scrollDistance() + holdDistance())}px`;
  }

  const scroller = document.scrollingElement || document.documentElement;

  function readProgress() {
    const scrollTop = scroller.scrollTop;
    const start = track.offsetTop;
    const span = stageHeight() * scrollDistance();
    return clamp((scrollTop - start) / span, 0, 1);
  }

  function apply(p) {
    const e = smoothstep(0, 1, p);

    // Frame: contained rounded box -> full-bleed.
    const baseY = frameInsetY();
    const baseX = frameInsetX();
    const insetY = baseY - baseY * e;
    const insetX = baseX - baseX * e;
    const radius = 24 - 24 * e;
    frame.style.clipPath = `inset(${insetY}% ${insetX}% ${insetY}% ${insetX}% round ${radius}px)`;

    media.style.transform = `scale(${1.08 - 0.08 * e})`;

    if (scrim) {
      scrim.style.opacity = `${0.85 * smoothstep(0.45, 1, p)}`;
    }

    if (intro) {
      const out = smoothstep(0, 0.22, p);
      intro.style.opacity = `${1 - out}`;
      intro.style.transform = `translate3d(0, ${-16 * out}px, 0)`;
    }

    if (reveal) {
      const inn = smoothstep(0.7, 1, p);
      reveal.style.opacity = `${inn}`;
      reveal.style.transform = `translate3d(0, ${14 * (1 - inn)}px, 0)`;
    }
  }

  const ENTER_MEDIA = 0.15; // progress at which the photo is large enough to sit behind the navbar
  const EXIT_MEDIA = 0.08;  // small hysteresis gap so it doesn't flicker right at one point

  function updateOverMedia(p, scrollTop) {
    const totalTrack = stageHeight() * (1 + scrollDistance() + holdDistance());
    const pastHero = scrollTop > track.offsetTop + totalTrack - 4;

    if (pastHero) {
      setOverMedia(false);
    } else if (!overMedia && p > ENTER_MEDIA) {
      setOverMedia(true);
    } else if (overMedia && p < EXIT_MEDIA) {
      setOverMedia(false);
    }
  }

  function tick() {
    const p = readProgress();
    apply(p);
    updateOverMedia(p, scroller.scrollTop);
    ticking = false;
  }

  function onScrollLike() {
    if (!visible || ticking) return;
    ticking = true;
    requestAnimationFrame(tick);
  }

  function onResize() {
    setTrackHeight();
    const p = readProgress();
    apply(p);
    updateOverMedia(p, scroller.scrollTop);
  }

  setTrackHeight();
  {
    const p = readProgress();
    apply(p);
    updateOverMedia(p, scroller.scrollTop);
  }

  // Listen on window, since the propagated overflow means the actual
  // viewport fires scroll — not body itself. document.body is kept as a
  // harmless fallback in case propagation doesn't occur in some browser.
  window.addEventListener('scroll', onScrollLike, { passive: true });
  document.body.addEventListener('scroll', onScrollLike, { passive: true });
  window.addEventListener('resize', onResize);

  // iOS Safari changes the real visible viewport height as the address
  // bar shows/hides during scroll, but does not reliably fire a plain
  // window 'resize' event when that happens — track.style.height (set
  // once by setTrackHeight, above) can go stale relative to the actual
  // viewport, producing a leftover gap between Hero unpinning and About
  // starting. visualViewport.resize is the API built specifically to
  // catch this class of change; recompute the same way onResize does.
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', onResize);
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        visible = entry.isIntersecting;
        if (visible) onScrollLike();
      });
    },
    { threshold: 0 }
  );
  io.observe(track);
})();
