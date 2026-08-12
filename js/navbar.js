// Mobile nav interaction — CardNav's collapse/expand mechanism recreated
// with a plain class toggle + CSS max-height transition. No GSAP.

const hamburger = document.getElementById('nav-hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileNavLinks = mobileMenu.querySelectorAll('.nav-link, .mobile-nav-cta');

function closeMobileMenu() {
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
}

function openMobileMenu() {
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
}

hamburger.addEventListener('click', () => {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMobileMenu() : openMobileMenu();
});

// Tapping a link inside the mobile menu should close it, same as any
// standard mobile nav pattern.
mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hamburger.getAttribute('aria-expanded') === 'true') {
        closeMobileMenu();
        hamburger.focus();
    }
});
