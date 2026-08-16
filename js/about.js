// About — shows the reading-light glow only while the About section
// fully covers the viewport (no Hero or Skills visible at the same
// time).
//
// This cannot be done with IntersectionObserver: its callback only
// fires when the intersection ratio crosses a given threshold, and for
// a section this tall, the ratio plateaus for the entire middle portion
// of the scroll (exactly the region where "fully covers" is true) — no
// new threshold gets crossed there, so the callback never fires during
// it. A plain scroll listener is the correct tool here, not a
// workaround: it's a single getBoundingClientRect() read + one
// classList.toggle() per event, no rAF loop, no per-frame animation —
// nothing like the cost that caused Hero's earlier lag. Reuses the same
// dual window/body listener pattern already established there, since
// this site's real scroll container has already been confirmed
// ambiguous between the two.
//
// Turning ON and turning OFF are deliberately separate conditions:
// turning on requires full coverage of .about (unchanged, already
// correct). Turning off is based on the LAST content row itself, not
// .about's own box — .about has min-height: 100vh plus padding, which
// can make its own bottom edge behave unintuitively (if the content is
// shorter than one viewport, the flex container can even center it,
// leaving space the box's own geometry doesn't represent as "content
// finished"). Tracking the actual last row directly is unambiguous:
// fade only once it has scrolled completely above the viewport, i.e.
// it has genuinely finished being read.

(() => {
  const about = document.querySelector('.about');
  const rows = document.querySelectorAll('.about-row');
  const lastRow = rows[rows.length - 1];
  if (!about || !lastRow) return;

  function update() {
    const aboutRect = about.getBoundingClientRect();
    const fullyCovers = aboutRect.top <= 0 && aboutRect.bottom >= window.innerHeight;

    if (fullyCovers) {
      about.classList.add('ray-visible');
      return;
    }

    const lastRowRect = lastRow.getBoundingClientRect();
    const contentFinished = lastRowRect.bottom <= 0;
    if (contentFinished) {
      about.classList.remove('ray-visible');
    }
    // else: not fully covering .about anymore, but the last row hasn't
    // finished scrolling past yet — leave the current state as it is.
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
  document.body.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
})();

